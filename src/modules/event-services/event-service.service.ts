import { prisma } from '@/lib/db/prisma'

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

export async function getServiceCatalogItems() {
  return prisma.serviceCatalogItem.findMany({
    where: {
      isActive: true,
    },
    orderBy: {
      name: 'asc',
    },
  })
}

export async function getServiceCatalogItemsForEventServiceEdit(
  currentServiceCatalogItemId?: string | null
) {
  return prisma.serviceCatalogItem.findMany({
    where: {
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

export async function getEventServiceItemById(id: string) {
  return prisma.eventServiceItem.findUnique({
    where: {
      id,
    },
    include: {
      event: {
        select: {
          id: true,
          title: true,
        },
      },
      serviceCatalogItem: true,
    },
  })
}

export async function createEventServiceItem(
  input: CreateEventServiceItemInput
) {
  const existingCount = await prisma.eventServiceItem.count({
    where: {
      eventId: input.eventId,
    },
  })

  return prisma.eventServiceItem.create({
    data: {
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
  input: UpdateEventServiceItemInput
) {
  return prisma.eventServiceItem.update({
    where: {
      id: input.id,
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

export async function deleteEventServiceItem(serviceItemId: string) {
  return prisma.eventServiceItem.delete({
    where: {
      id: serviceItemId,
    },
  })
}
