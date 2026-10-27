import { AsyncLocalStorage } from 'node:async_hooks'
import { PrismaClient } from '@prisma/client/edge'
import { PrismaPg } from '@prisma/adapter-pg'

type PrismaRequest = { client?: PrismaClient }

// Vinext can load this module in separate server bundles. Keep one context per isolate.
const storageKey = Symbol.for('event-management-system.prisma-request')
const globals = globalThis as typeof globalThis & {
  [storageKey]?: AsyncLocalStorage<PrismaRequest>
  prisma?: PrismaClient
}
const requestStorage = globals[storageKey] ??= new AsyncLocalStorage<PrismaRequest>()

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL
  if (!connectionString) throw new Error('DATABASE_URL is not set')

  return new PrismaClient({ adapter: new PrismaPg({ connectionString }) })
}

function currentPrismaClient(): PrismaClient {
  const request = requestStorage.getStore()
  if (request) return request.client ??= createPrismaClient()

  // Local Next.js uses a long-lived Node process. Cloudflare must never share a
  // database connection between requests, even when its isolate is reused.
  if ('WebSocketPair' in globalThis) {
    throw new Error('Prisma was used outside a Cloudflare request')
  }
  return globals.prisma ??= createPrismaClient()
}

// Existing domain modules can keep using prisma.user.* and prisma.$transaction().
export const prisma = new Proxy({} as PrismaClient, {
  get(_target, property) {
    const client = currentPrismaClient()
    const value = Reflect.get(client, property, client)
    return typeof value === 'function' ? value.bind(client) : value
  },
})

export async function withPrismaRequest(handle: () => Promise<Response>): Promise<Response> {
  const request: PrismaRequest = {}
  return requestStorage.run(request, async () => {
    const disconnect = async () => {
      const client = request.client
      request.client = undefined
      if (client) await client.$disconnect()
    }

    let response: Response
    try {
      response = await handle()
    } catch (error) {
      await disconnect()
      throw error
    }

    if (!response.body) {
      await disconnect()
      return response
    }

    // React may keep rendering after fetch() returns. Release the connection
    // only once the response stream has finished or been canceled.
    const reader = response.body.getReader()
    const body = new ReadableStream({
      async pull(controller) {
        try {
          const { done, value } = await reader.read()
          if (done) {
            await disconnect()
            controller.close()
          } else {
            controller.enqueue(value)
          }
        } catch (error) {
          await disconnect()
          controller.error(error)
        }
      },
      async cancel(reason) {
        try {
          await reader.cancel(reason)
        } finally {
          await disconnect()
        }
      },
    })

    return new Response(body, response)
  })
}
