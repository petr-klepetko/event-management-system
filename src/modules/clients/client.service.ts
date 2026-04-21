import { ClientType } from '@prisma/client'
import { prisma } from '@/lib/db/prisma'

export type CreateClientInput = {
  name: string
  type: ClientType
  ico?: string | null
  dic?: string | null
  city?: string | null
  country?: string | null
}

export async function getClients() {
  return prisma.client.findMany({
    orderBy: {
      createdAt: 'desc',
    },
  })
}

export async function createClient(input: CreateClientInput) {
  return prisma.client.create({
    data: {
      name: input.name,
      type: input.type,
      ico: input.ico ?? null,
      dic: input.dic ?? null,
      city: input.city ?? null,
      country: input.country ?? null,
    },
  })
}