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

export type CreateContactInput = {
  clientId: string
  firstName: string
  lastName: string
  email?: string | null
  phone?: string | null
  roleLabel?: string | null
  isPrimary?: boolean
}

export async function getClients() {
  return prisma.client.findMany({
    orderBy: {
      createdAt: 'desc',
    },
  })
}

export async function getClientById(id: string) {
  return prisma.client.findUnique({
    where: {
      id,
    },
    include: {
      contacts: {
        orderBy: {
          createdAt: 'desc',
        },
      },
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

export async function createContact(input: CreateContactInput) {
  if (input.isPrimary) {
    await prisma.contactPerson.updateMany({
      where: {
        clientId: input.clientId,
        isPrimary: true,
      },
      data: {
        isPrimary: false,
      },
    })
  }

  return prisma.contactPerson.create({
    data: {
      clientId: input.clientId,
      firstName: input.firstName,
      lastName: input.lastName,
      email: input.email ?? null,
      phone: input.phone ?? null,
      roleLabel: input.roleLabel ?? null,
      isPrimary: input.isPrimary ?? false,
    },
  })
}