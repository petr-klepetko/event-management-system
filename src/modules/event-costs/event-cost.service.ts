import { AuthContext, getTenantScopedWhere } from '@/lib/auth/current-user'
import { prisma } from '@/lib/db/prisma'

export type CreateEventCostInput = {
    eventId: string
    name: string
    amount: string
    note?: string | null
}

export async function createEventCost(
    input: CreateEventCostInput,
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

    return prisma.eventCost.create({
        data: {
            tenantId: event.tenantId,
            eventId: event.id,
            ownerUserId: event.ownerUserId ?? auth.userId,
            name: input.name,
            amount: input.amount,
            note: input.note ?? null,
        },
    })
}

export async function deleteEventCost(costId: string, auth: AuthContext) {
    return prisma.eventCost.delete({
        where: {
            id: costId,
            ...getTenantScopedWhere(auth),
        },
    })
}
