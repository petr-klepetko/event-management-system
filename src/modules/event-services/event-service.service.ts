import { prisma } from '@/lib/db/prisma'
import { AuthContext, getTenantScopedWhere } from '@/lib/auth/current-user'

export type CreateEventServiceItemInput = {
  eventId: string
  serviceCatalogItemId?: string | null
  customName: string
  description?: string | null
  price: string
  note?: string | null
}

export type UpdateEventServiceItemInput = {
  id: string
  serviceCatalogItemId?: string | null
  customName: string
  description?: string | null
  price: string
  note?: string | null
}

export async function getServiceCatalogItems(auth: AuthContext) {
  return prisma.serviceCatalogItem.findMany({
    where: {
      isActive: true,
      ...getTenantScopedWhere(auth),
    },
    orderBy: {
      name: 'asc',
    },
  })
}

export async function getServiceCatalogItemsForEventTenant(
  eventId: string,
  auth: AuthContext
) {
  const event = await prisma.event.findUnique({
    where: {
      id: eventId,
      ...getTenantScopedWhere(auth),
    },
    select: {
      tenantId: true,
    },
  })

  if (!event) {
    return []
  }

  return prisma.serviceCatalogItem.findMany({
    where: {
      tenantId: event.tenantId,
      isActive: true,
    },
    orderBy: {
      name: 'asc',
    },
  })
}

export async function getServiceCatalogItemsForEventServiceEdit(
  currentServiceCatalogItemId: string | null | undefined,
  eventTenantId: string
) {
  return prisma.serviceCatalogItem.findMany({
    where: {
      tenantId: eventTenantId,
      OR: [
        {
          isActive: true,
        },
        ...(currentServiceCatalogItemId
          ? [
              {
                id: currentServiceCatalogItemId,
              },
            ]
          : []),
      ],
    },
    orderBy: [
      {
        isActive: 'desc',
      },
      {
        name: 'asc',
      },
    ],
  })
}

export async function getEventServiceItemById(id: string, auth: AuthContext) {
  return prisma.eventServiceItem.findUnique({
    where: {
      id,
      ...getTenantScopedWhere(auth),
    },
    include: {
      event: {
        select: {
          id: true,
          tenantId: true,
          title: true,
        },
      },
      serviceCatalogItem: true,
    },
  })
}

export async function createEventServiceItem(
  input: CreateEventServiceItemInput,
  auth: AuthContext
) {
  const event = await prisma.event.findUnique({
    where: {
      id: input.eventId,
      ...getTenantScopedWhere(auth),
    },
    select: {
      id: true,
      tenantId: true,
      ownerUserId: true,
    },
  })

  if (!event) {
    throw new Error('Akce neexistuje nebo k ní nemáš přístup.')
  }

  if (input.serviceCatalogItemId) {
    const catalogItem = await prisma.serviceCatalogItem.findFirst({
      where: {
        id: input.serviceCatalogItemId,
        tenantId: event.tenantId,
      },
      select: {
        id: true,
      },
    })

    if (!catalogItem) {
      throw new Error('Vybraná katalogová služba nepatří k tenantu akce.')
    }
  }

  const existingCount = await prisma.eventServiceItem.count({
    where: {
      eventId: input.eventId,
      tenantId: event.tenantId,
    },
  })

  return prisma.eventServiceItem.create({
    data: {
      tenantId: event.tenantId,
      ownerUserId: event.ownerUserId ?? auth.userId,
      eventId: input.eventId,
      serviceCatalogItemId: input.serviceCatalogItemId ?? null,
      customName: input.customName,
      description: input.description ?? null,
      price: input.price,
      note: input.note ?? null,
      sortOrder: existingCount,
    },
  })
}

export async function updateEventServiceItem(
  input: UpdateEventServiceItemInput,
  auth: AuthContext
) {
  const serviceItem = await prisma.eventServiceItem.findUnique({
    where: {
      id: input.id,
      ...getTenantScopedWhere(auth),
    },
    select: {
      tenantId: true,
    },
  })

  if (!serviceItem) {
    throw new Error('Služba na akci neexistuje nebo k ní nemáš přístup.')
  }

  if (input.serviceCatalogItemId) {
    const catalogItem = await prisma.serviceCatalogItem.findFirst({
      where: {
        id: input.serviceCatalogItemId,
        tenantId: serviceItem.tenantId,
      },
      select: {
        id: true,
      },
    })

    if (!catalogItem) {
      throw new Error('Vybraná katalogová služba nepatří k tenantu akce.')
    }
  }

  return prisma.eventServiceItem.update({
    where: {
      id: input.id,
      ...getTenantScopedWhere(auth),
    },
    data: {
      serviceCatalogItemId: input.serviceCatalogItemId ?? null,
      customName: input.customName,
      description: input.description ?? null,
      price: input.price,
      note: input.note ?? null,
    },
  })
}

export async function deleteEventServiceItem(
  serviceItemId: string,
  auth: AuthContext
) {
  return prisma.eventServiceItem.delete({
    where: {
      id: serviceItemId,
      ...getTenantScopedWhere(auth),
    },
  })
}
