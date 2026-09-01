import { prisma } from '@/lib/db/prisma'
import { AuthContext, getTenantScopedWhere } from '@/lib/auth/current-user'

export type CreateEventServiceItemInput = {
  eventId: string
  serviceCatalogItemId?: string | null
  customName: string
  description?: string | null
  price: string
  note?: string | null
  assignments?: EventServiceItemAssignmentInput[]
}

export type UpdateEventServiceItemInput = {
  id: string
  serviceCatalogItemId?: string | null
  customName: string
  description?: string | null
  price: string
  note?: string | null
  assignments?: EventServiceItemAssignmentInput[]
}

export type EventServiceItemAssignmentInput = {
  userId?: string | null
  supplierName?: string | null
  role: 'RESPONSIBLE' | 'WORKER'
  workDescription?: string | null
  reward: string
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

export async function getAssignableUsersForEvent(
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

  return getAssignableUsersForTenant(event.tenantId, auth)
}

export async function getAssignableUsersForTenant(
  tenantId: string,
  auth: AuthContext
) {
  if (!auth.isAdmin && auth.tenantId !== tenantId) {
    return []
  }

  const memberships = await prisma.tenantMembership.findMany({
    where: {
      tenantId,
      isActive: true,
      user: {
        isActive: true,
      },
    },
    include: {
      user: {
        select: {
          id: true,
          fullName: true,
          email: true,
          role: true,
        },
      },
    },
    orderBy: [
      {
        user: {
          fullName: 'asc',
        },
      },
    ],
  })

  return memberships.map((membership) => membership.user)
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
      assignments: {
        orderBy: {
          createdAt: 'asc',
        },
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              email: true,
            },
          },
        },
      },
    },
  })
}

async function assertAssignableUsers(
  tenantId: string,
  assignments: EventServiceItemAssignmentInput[] = []
) {
  for (const assignment of assignments) {
    if (!assignment.userId && !assignment.supplierName) {
      throw new Error(
        'U každého řádku musí být vybraný pracovník nebo zadaný externí dodavatel.'
      )
    }
  }

  const userIds = assignments
    .map((assignment) => assignment.userId)
    .filter((userId): userId is string => Boolean(userId))
  const uniqueUserIds = new Set(userIds)

  if (uniqueUserIds.size !== userIds.length) {
    throw new Error('Každý pracovník může být ke službě přiřazený jen jednou.')
  }

  if (uniqueUserIds.size === 0) {
    return
  }

  const usersCount = await prisma.tenantMembership.count({
    where: {
      tenantId,
      userId: {
        in: [...uniqueUserIds],
      },
      isActive: true,
      user: {
        isActive: true,
      },
    },
  })

  if (usersCount !== uniqueUserIds.size) {
    throw new Error('Všichni pracovníci musí patřit do tenantu akce.')
  }
}

function mapAssignmentCreateData(
  tenantId: string,
  eventServiceItemId: string,
  assignments: EventServiceItemAssignmentInput[] = []
) {
  return assignments.map((assignment) => ({
    tenantId,
    eventServiceItemId,
    userId: assignment.userId || null,
    supplierName: assignment.supplierName ?? null,
    role: assignment.role,
    workDescription: assignment.workDescription ?? null,
    reward: assignment.reward,
  }))
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

  await assertAssignableUsers(event.tenantId, input.assignments)

  return prisma.$transaction(async (tx) => {
    const serviceItem = await tx.eventServiceItem.create({
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

    const assignmentData = mapAssignmentCreateData(
      event.tenantId,
      serviceItem.id,
      input.assignments
    )

    if (assignmentData.length > 0) {
      await tx.eventServiceItemAssignment.createMany({
        data: assignmentData,
      })
    }

    return serviceItem
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

  await assertAssignableUsers(serviceItem.tenantId, input.assignments)

  return prisma.$transaction(async (tx) => {
    const updatedServiceItem = await tx.eventServiceItem.update({
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

    await tx.eventServiceItemAssignment.deleteMany({
      where: {
        eventServiceItemId: input.id,
      },
    })

    const assignmentData = mapAssignmentCreateData(
      serviceItem.tenantId,
      input.id,
      input.assignments
    )

    if (assignmentData.length > 0) {
      await tx.eventServiceItemAssignment.createMany({
        data: assignmentData,
      })
    }

    return updatedServiceItem
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
