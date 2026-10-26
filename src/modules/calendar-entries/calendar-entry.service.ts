import { CalendarEntryVisibility, Prisma } from '@prisma/client'
import { AuthContext } from '@/lib/auth/current-user'
import { prisma } from '@/lib/db/prisma'

export type CreateCalendarEntryInput = {
    title: string
    description?: string | null
    visibility: CalendarEntryVisibility
    dateStart: Date
    participantUserIds: string[]
}

export type UpdateCalendarEntryInput = CreateCalendarEntryInput & {
    id: string
}

function getVisibleCalendarEntryWhere(
    auth: AuthContext
): Prisma.CalendarEntryWhereInput {
    if (auth.isAdmin) {
        return {}
    }

    if (!auth.tenantId) {
        return {
            id: '__no_tenant_access__',
        }
    }

    return {
        tenantId: auth.tenantId,
        OR: [
            {
                visibility: CalendarEntryVisibility.PUBLIC,
            },
            {
                createdByUserId: auth.userId,
            },
            {
                participants: {
                    some: {
                        userId: auth.userId,
                    },
                },
            },
        ],
    }
}

export async function getCalendarEntries(auth: AuthContext) {
    return prisma.calendarEntry.findMany({
        where: getVisibleCalendarEntryWhere(auth),
        orderBy: {
            dateStart: 'desc',
        },
        include: {
            createdByUser: {
                select: {
                    id: true,
                    fullName: true,
                },
            },
            participants: {
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

export async function getCalendarEntryById(id: string, auth: AuthContext) {
    return prisma.calendarEntry.findFirst({
        where: {
            id,
            ...getVisibleCalendarEntryWhere(auth),
        },
        include: {
            createdByUser: {
                select: {
                    id: true,
                    fullName: true,
                    email: true,
                },
            },
            participants: {
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

export async function getCalendarEntryFormOptions(auth: AuthContext) {
    if (!auth.tenantId) {
        return {
            users: [],
        }
    }

    const memberships = await prisma.tenantMembership.findMany({
        where: {
            tenantId: auth.tenantId,
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
                },
            },
        },
        orderBy: {
            user: {
                fullName: 'asc',
            },
        },
    })

    return {
        users: memberships.map((membership) => membership.user),
    }
}

export async function getCalendarEntryFormOptionsForTenant(
    tenantId: string,
    auth: AuthContext
) {
    if (!auth.isAdmin && auth.tenantId !== tenantId) {
        return {
            users: [],
        }
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
                },
            },
        },
        orderBy: {
            user: {
                fullName: 'asc',
            },
        },
    })

    return {
        users: memberships.map((membership) => membership.user),
    }
}

async function assertParticipantUsers(tenantId: string, userIds: string[]) {
    if (userIds.length === 0) {
        return
    }

    const participantsCount = await prisma.tenantMembership.count({
        where: {
            tenantId,
            userId: {
                in: userIds,
            },
            isActive: true,
            user: {
                isActive: true,
            },
        },
    })

    if (participantsCount !== userIds.length) {
        throw new Error('Všichni účastníci musí patřit do tvého tenantu.')
    }
}

export async function createCalendarEntry(
    input: CreateCalendarEntryInput,
    auth: AuthContext
) {
    if (!auth.tenantId) {
        throw new Error('Událost lze vytvořit jen v rámci tenantu.')
    }

    const uniqueParticipantUserIds = [...new Set(input.participantUserIds)]

    await assertParticipantUsers(auth.tenantId, uniqueParticipantUserIds)

    return prisma.calendarEntry.create({
        data: {
            tenantId: auth.tenantId,
            ownerUserId: auth.userId,
            createdByUserId: auth.userId,
            title: input.title,
            description: input.description ?? null,
            visibility: input.visibility,
            dateStart: input.dateStart,
            participants: {
                create: uniqueParticipantUserIds.map((userId) => ({
                    tenantId: auth.tenantId as string,
                    userId,
                })),
            },
        },
    })
}

export async function updateCalendarEntry(
    input: UpdateCalendarEntryInput,
    auth: AuthContext
) {
    const existingCalendarEntry = await prisma.calendarEntry.findFirst({
        where: {
            id: input.id,
            ...(auth.isAdmin
                ? {}
                : {
                      tenantId: auth.tenantId ?? '__no_tenant_access__',
                  }),
        },
        select: {
            tenantId: true,
        },
    })

    if (!existingCalendarEntry) {
        throw new Error('Událost neexistuje nebo k ní nemáš přístup.')
    }

    const uniqueParticipantUserIds = [...new Set(input.participantUserIds)]

    await assertParticipantUsers(
        existingCalendarEntry.tenantId,
        uniqueParticipantUserIds
    )

    return prisma.$transaction(async (tx) => {
        const updatedCalendarEntry = await tx.calendarEntry.update({
            where: {
                id: input.id,
            },
            data: {
                title: input.title,
                description: input.description ?? null,
                visibility: input.visibility,
                dateStart: input.dateStart,
            },
        })

        await tx.calendarEntryParticipant.deleteMany({
            where: {
                calendarEntryId: input.id,
            },
        })

        if (uniqueParticipantUserIds.length > 0) {
            await tx.calendarEntryParticipant.createMany({
                data: uniqueParticipantUserIds.map((userId) => ({
                    tenantId: existingCalendarEntry.tenantId,
                    calendarEntryId: input.id,
                    userId,
                })),
            })
        }

        return updatedCalendarEntry
    })
}
