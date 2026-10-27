import vinextHandler from 'vinext/server/fetch-handler'
import { withPrismaRequest } from './lib/db/prisma'

type WorkerHandler = {
  fetch(request: Request, env: unknown, context: unknown): Promise<Response>
}

const handler = vinextHandler as WorkerHandler

const worker = {
  fetch(request: Request, env: unknown, context: unknown) {
    return withPrismaRequest(() => handler.fetch(request, env, context))
  },
}

export default worker
