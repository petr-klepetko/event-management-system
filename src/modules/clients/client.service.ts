import { ClientType } from '@prisma/client'
import { AuthContext, getTenantScopedWhere } from '@/lib/auth/current-user'
import { prisma } from '@/lib/db/prisma'

export type CreateClientInput = {
  name: string
  type: ClientType
  ico?: string | null
  dic?: string | null
  city?: string | null
  country?: string | null
}

export type UpdateClientInput = CreateClientInput & {
  id: string
}

export type CreateContactInput = {
  clientId: string
  firstName: string
  lastName: string
  email?: string | null
  phone?: string | null
  roleLabel?: string | null
  note?: string | null
  isPrimary?: boolean
}

export type UpdateContactInput = CreateContactInput & {
  id: string
}

export async function getClients(auth: AuthContext) {
  return prisma.client.findMany({
    where: getTenantScopedWhere(auth),
    orderBy: {
      createdAt: 'desc',
    },
  })
}

export async function getClientById(id: string, auth: AuthContext) {
  return prisma.client.findUnique({
    where: {
      id,
      ...getTenantScopedWhere(auth),
    },
    include: {
      contacts: {
        orderBy: {
          createdAt: 'desc',
        },
      },
      events: {
        orderBy: {
          dateStart: 'desc',
        },
        select: {
          id: true,
          title: true,
          eventType: true,
          status: true,
          dateStart: true,
          venueName: true,
        },
      },
    },
  })
}

export async function getClientsCount(auth: AuthContext) {
  return prisma.client.count({
    where: getTenantScopedWhere(auth),
  })
}

export async function createClient(input: CreateClientInput, auth: AuthContext) {
  if (!auth.tenantId && !auth.isAdmin) {
    throw new Error('Uživatel není přiřazený k žádnému tenantu.')
  }

  return prisma.client.create({
    data: {
      tenantId: auth.tenantId ?? 'default-tenant',
      ownerUserId: auth.userId,
      name: input.name,
      type: input.type,
      ico: input.ico ?? null,
      dic: input.dic ?? null,
      city: input.city ?? null,
      country: input.country ?? null,
    },
  })
}

export async function updateClient(input: UpdateClientInput, auth: AuthContext) {
  return prisma.client.update({
    where: {
      id: input.id,
      ...getTenantScopedWhere(auth),
    },
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

export async function createContact(input: CreateContactInput, auth: AuthContext) {
  const client = await prisma.client.findUnique({
    where: {
      id: input.clientId,
      ...getTenantScopedWhere(auth),
    },
    select: {
      id: true,
      tenantId: true,
    },
  })

  if (!client) {
    throw new Error('Klient neexistuje nebo k němu nemáš přístup.')
  }

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
      tenantId: client.tenantId,
      clientId: input.clientId,
      firstName: input.firstName,
      lastName: input.lastName,
      email: input.email ?? null,
      phone: input.phone ?? null,
      roleLabel: input.roleLabel ?? null,
      note: input.note ?? null,
      isPrimary: input.isPrimary ?? false,
    },
  })
}

export async function getContactById(
  contactId: string,
  clientId: string,
  auth: AuthContext
) {
  return prisma.contactPerson.findFirst({
    where: {
      id: contactId,
      clientId,
      client: getTenantScopedWhere(auth),
    },
    include: {
      client: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  })
}

export async function updateContact(input: UpdateContactInput, auth: AuthContext) {
  const contact = await prisma.contactPerson.findFirst({
    where: {
      id: input.id,
      clientId: input.clientId,
      client: getTenantScopedWhere(auth),
    },
    select: {
      id: true,
    },
  })

  if (!contact) {
    throw new Error('Kontakt neexistuje nebo k němu nemáš přístup.')
  }

  if (input.isPrimary) {
    await prisma.contactPerson.updateMany({
      where: {
        clientId: input.clientId,
        isPrimary: true,
        NOT: {
          id: input.id,
        },
      },
      data: {
        isPrimary: false,
      },
    })
  }

  return prisma.contactPerson.update({
    where: {
      id: input.id,
    },
    data: {
      firstName: input.firstName,
      lastName: input.lastName,
      email: input.email ?? null,
      phone: input.phone ?? null,
      roleLabel: input.roleLabel ?? null,
      note: input.note ?? null,
      isPrimary: input.isPrimary ?? false,
    },
  })
}
