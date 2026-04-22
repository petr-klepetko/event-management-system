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

            // dočasně natvrdo, než přidáme auth
            // createdByUserId: 'seed-user-id-placeholder',
        },
    })
}