import { EventStatus } from '@prisma/client'
import {
    AuthContext,
    getEventScopedWhere,
    getTenantScopedWhere,
} from '@/lib/auth/current-user'
import { prisma } from '@/lib/db/prisma'

export type CreateEventInput = {
    title: string
    eventType: string
    dateStart: Date
    venueName?: string | null
    clientId: string
    primaryContactId?: string | null
    internalNote?: string | null
    hideOfferItemPrices: boolean
}

export type UpdateEventInput = CreateEventInput & {
    id: string
    status: EventStatus
}

type MoneyLike = {
    toString(): string
}

type EventServiceItemFinanceInput = {
    price: MoneyLike
    assignments: Array<{
        reward: MoneyLike
    }>
}

type EventFinanceInput = {
    serviceItems: EventServiceItemFinanceInput[]
    costs: Array<{
        amount: MoneyLike
    }>
}

export function calculateEventServiceItemFinance(
    item: EventServiceItemFinanceInput
) {
    const price = Number(item.price.toString())
    const workerCosts = item.assignments.reduce(
        (sum, assignment) => sum + Number(assignment.reward.toString()),
        0
    )

    return {
        price,
        workerCosts,
        margin: price - workerCosts,
    }
}

export function calculateEventFinance(event: EventFinanceInput) {
    const serviceTotals = event.serviceItems.reduce(
        (totals, item) => {
            const itemFinance = calculateEventServiceItemFinance(item)

            return {
                invoicePrice: totals.invoicePrice + itemFinance.price,
                workerCosts: totals.workerCosts + itemFinance.workerCosts,
            }
        },
        {
            invoicePrice: 0,
            workerCosts: 0,
        }
    )
    const eventCosts = event.costs.reduce(
        (sum, cost) => sum + Number(cost.amount.toString()),
        0
    )
    const costs = serviceTotals.workerCosts + eventCosts

    return {
        invoicePrice: serviceTotals.invoicePrice,
        workerCosts: serviceTotals.workerCosts,
        eventCosts,
        costs,
        profit: serviceTotals.invoicePrice - costs,
    }
}

export async function getEvents(auth: AuthContext) {
    return prisma.event.findMany({
        where: getEventScopedWhere(auth),
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
    return prisma.event.findFirst({
        where: {
            id,
            ...getEventScopedWhere(auth),
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
            },
            costs: {
                orderBy: {
                    createdAt: 'asc',
                },
            },
        },
    })
}

export async function getEventFinanceRows(auth: AuthContext) {
    const events = await prisma.event.findMany({
        where: getEventScopedWhere(auth),
        orderBy: {
            dateStart: 'desc',
        },
        select: {
            id: true,
            title: true,
            dateStart: true,
            serviceItems: {
                select: {
                    price: true,
                    assignments: {
                        select: {
                            reward: true,
                        },
                    },
                },
            },
            costs: {
                select: {
                    amount: true,
                },
            },
        },
    })

    return events.map((event) => {
        const finance = calculateEventFinance(event)

        return {
            id: event.id,
            title: event.title,
            dateStart: event.dateStart,
            invoicePrice: finance.invoicePrice,
            costs: finance.costs,
            profit: finance.profit,
        }
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
            hideOfferItemPrices: input.hideOfferItemPrices,
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
            hideOfferItemPrices: input.hideOfferItemPrices,
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

    const existingCost = await prisma.eventCost.findFirst({
        where: {
            eventId,
            ...getTenantScopedWhere(auth),
        },
        select: {
            id: true,
        },
    })

    if (existingCost) {
        throw new Error('Akci nelze smazat, protože má zadané náklady.')
    }

    return prisma.event.delete({
        where: {
            id: eventId,
            ...getTenantScopedWhere(auth),
        },
    })
}
