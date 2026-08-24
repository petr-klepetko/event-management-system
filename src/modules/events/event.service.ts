import { EventStatus } from '@prisma/client'
import { AuthContext, getTenantScopedWhere } from '@/lib/auth/current-user'
import { prisma } from '@/lib/db/prisma'

export type CreateEventInput = {
    title: string
    eventType: string
    dateStart: Date
    venueName?: string | null
    clientId: string
    primaryContactId?: string | null
    internalNote?: string | null
}

export type UpdateEventInput = CreateEventInput & {
    id: string
    status: EventStatus
}

export async function getEvents(auth: AuthContext) {
    return prisma.event.findMany({
        where: getTenantScopedWhere(auth),
        orderBy: {
            dateStart: 'desc',
        },
        include: {
            client: true,
            primaryContact: true,
        },
    })
}

export async function getEventById(id: string, auth: AuthContext) {
    return prisma.event.findUnique({
        where: {
            id,
            ...getTenantScopedWhere(auth),
        },
        include: {
            client: true,
            primaryContact: true,
            serviceItems: {
                orderBy: {
                    sortOrder: 'asc',
                },
                include: {
                    serviceCatalogItem: true,
                },
            },
        },
    })
}

export async function getEventFormOptions(auth: AuthContext) {
    const clientWhere = {
        isActive: true,
        ...getTenantScopedWhere(auth),
    }

    const [clients, contacts] = await Promise.all([
        prisma.client.findMany({
            where: clientWhere,
            orderBy: {
                name: 'asc',
            },
            select: {
                id: true,
                name: true,
            },
        }),
        prisma.contactPerson.findMany({
            where: auth.isAdmin
                ? {}
                : {
                      tenantId: auth.tenantId ?? '__no_tenant_access__',
                      client: clientWhere,
                  },
            orderBy: [
                {
                    lastName: 'asc',
                },
                {
                    firstName: 'asc',
                },
            ],
            select: {
                id: true,
                firstName: true,
                lastName: true,
                instagram: true,
                clientId: true,
                client: {
                    select: {
                        name: true,
                    },
                },
            },
        }),
    ])

    return { clients, contacts }
}

export async function createEvent(input: CreateEventInput, auth: AuthContext) {
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

    if (input.primaryContactId) {
        const contact = await prisma.contactPerson.findFirst({
            where: {
                id: input.primaryContactId,
                clientId: input.clientId,
                tenantId: client.tenantId,
            },
            select: {
                id: true,
            },
        })

        if (!contact) {
            throw new Error('Hlavní kontakt musí patřit k vybranému klientovi.')
        }
    }

    return prisma.event.create({
        data: {
            tenantId: client.tenantId,
            ownerUserId: auth.userId,
            title: input.title,
            eventType: input.eventType,
            status: EventStatus.DRAFT,
            dateStart: input.dateStart,
            venueName: input.venueName ?? null,
            clientId: input.clientId,
            primaryContactId: input.primaryContactId ?? null,
            createdByUserId: auth.userId,
            internalNote: input.internalNote ?? null,
        },
    })
}

export async function updateEvent(input: UpdateEventInput, auth: AuthContext) {
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

    if (input.primaryContactId) {
        const contact = await prisma.contactPerson.findFirst({
            where: {
                id: input.primaryContactId,
                clientId: input.clientId,
                tenantId: client.tenantId,
            },
            select: {
                id: true,
            },
        })

        if (!contact) {
            throw new Error('Hlavní kontakt musí patřit k vybranému klientovi.')
        }
    }

    return prisma.event.update({
        where: {
            id: input.id,
            ...getTenantScopedWhere(auth),
        },
        data: {
            tenantId: client.tenantId,
            title: input.title,
            eventType: input.eventType,
            status: input.status,
            dateStart: input.dateStart,
            venueName: input.venueName ?? null,
            clientId: input.clientId,
            primaryContactId: input.primaryContactId ?? null,
            internalNote: input.internalNote ?? null,
        },
    })
}

export async function deleteEvent(eventId: string, auth: AuthContext) {
    const existingEventItem = await prisma.eventServiceItem.findFirst({
        where: {
            eventId,
            ...getTenantScopedWhere(auth),
        },
        select: {
            id: true,
        },
    })

    if (existingEventItem) {
        throw new Error('Akci nelze smazat, protože má přidané služby.')
    }

    const existingDocument = await prisma.document.findFirst({
        where: {
            eventId,
            ...(auth.isAdmin
                ? {}
                : {
                      tenantId: auth.tenantId ?? '__no_tenant_access__',
                  }),
        },
        select: {
            id: true,
        },
    })

    if (existingDocument) {
        throw new Error('Akci nelze smazat, protože má vytvořené dokumenty.')
    }

    return prisma.event.delete({
        where: {
            id: eventId,
            ...getTenantScopedWhere(auth),
        },
    })
}
