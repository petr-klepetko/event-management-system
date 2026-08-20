import { EventStatus } from '@prisma/client'
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

export async function getEvents() {
    return prisma.event.findMany({
        orderBy: {
            dateStart: 'desc',
        },
        include: {
            client: true,
            primaryContact: true,
        },
    })
}

export async function getEventById(id: string) {
    return prisma.event.findUnique({
        where: {
            id,
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

export async function getEventFormOptions() {
    const [clients, contacts] = await Promise.all([
        prisma.client.findMany({
            where: {
                isActive: true,
            },
            orderBy: {
                name: 'asc',
            },
            select: {
                id: true,
                name: true,
            },
        }),
        prisma.contactPerson.findMany({
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

export async function createEvent(input: CreateEventInput) {
    if (input.primaryContactId) {
        const contact = await prisma.contactPerson.findFirst({
            where: {
                id: input.primaryContactId,
                clientId: input.clientId,
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
            title: input.title,
            eventType: input.eventType,
            status: EventStatus.DRAFT,
            dateStart: input.dateStart,
            venueName: input.venueName ?? null,
            clientId: input.clientId,
            primaryContactId: input.primaryContactId ?? null,
            internalNote: input.internalNote ?? null,
        },
    })
}

export async function updateEvent(input: UpdateEventInput) {
    if (input.primaryContactId) {
        const contact = await prisma.contactPerson.findFirst({
            where: {
                id: input.primaryContactId,
                clientId: input.clientId,
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
        },
        data: {
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

export async function deleteEvent(eventId: string) {
    const existingEventItem = await prisma.eventServiceItem.findFirst({
        where: {
            eventId,
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
        },
    })
}
