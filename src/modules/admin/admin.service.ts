import { TenantRole, UserRole } from '@prisma/client'
import { prisma } from '@/lib/db/prisma'
import { AuthContext } from '@/lib/auth/current-user'
import { hashPassword } from '@/modules/auth/auth.service'

function assertAdmin(auth: AuthContext) {
    if (!auth.isAdmin) {
        throw new Error('Tato akce je dostupná jen adminovi aplikace.')
    }
}

export async function getAdminOverview(auth: AuthContext) {
    assertAdmin(auth)

    const [tenants, users, memberships] = await Promise.all([
        prisma.tenant.findMany({
            orderBy: {
                name: 'asc',
            },
        }),
        prisma.user.findMany({
            orderBy: {
                createdAt: 'desc',
            },
        }),
        prisma.tenantMembership.findMany({
            include: {
                tenant: true,
                user: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
        }),
    ])

    return { tenants, users, memberships }
}

export async function createTenant(input: {
    name: string
    slug: string
}, auth: AuthContext) {
    assertAdmin(auth)

    return prisma.tenant.create({
        data: {
            name: input.name,
            slug: input.slug,
        },
    })
}

export async function createAdminManagedUser(input: {
    email: string
    fullName: string
    password: string
    appRole: UserRole
    tenantId?: string | null
    tenantRole?: TenantRole | null
}, auth: AuthContext) {
    assertAdmin(auth)

    if (input.appRole !== 'ADMIN' && !input.email.includes('@')) {
        throw new Error('Manažer a pracovník musí mít login jako platný e-mail.')
    }

    const user = await prisma.user.create({
        data: {
            email: input.email.toLowerCase(),
            fullName: input.fullName,
            passwordHash: hashPassword(input.password),
            role: input.appRole,
            isActive: true,
        },
    })

    if (input.tenantId && input.tenantRole) {
        await prisma.tenantMembership.create({
            data: {
                tenantId: input.tenantId,
                userId: user.id,
                role: input.tenantRole,
                isActive: true,
            },
        })
    }

    return user
}

export async function updateUserMembership(input: {
    userId: string
    tenantId: string
    tenantRole: TenantRole
}, auth: AuthContext) {
    assertAdmin(auth)

    return prisma.$transaction(async (tx) => {
        const [user, tenant, activeMemberships] = await Promise.all([
            tx.user.findUnique({
                where: { id: input.userId },
                select: { id: true, role: true },
            }),
            tx.tenant.findUnique({
                where: { id: input.tenantId },
                select: { id: true },
            }),
            tx.tenantMembership.findMany({
                where: { userId: input.userId, isActive: true },
                select: { tenantId: true },
            }),
        ])

        if (!user || !tenant) {
            throw new Error('Uživatel nebo cílový tenant neexistuje.')
        }

        if (user.role === 'ADMIN') {
            throw new Error('Admin aplikace má přístup ke všem tenantům a nelze ho přesouvat.')
        }

        const previousTenantIds = activeMemberships
            .map((membership) => membership.tenantId)
            .filter((tenantId) => tenantId !== input.tenantId)

        if (previousTenantIds.length > 0) {
            const now = new Date()
            const [upcomingServiceAssignments, upcomingCalendarEntries] =
                await Promise.all([
                    tx.eventServiceItemAssignment.count({
                        where: {
                            userId: input.userId,
                            tenantId: { in: previousTenantIds },
                            eventServiceItem: {
                                event: {
                                    dateStart: { gte: now },
                                    status: { in: ['DRAFT', 'CONFIRMED'] },
                                },
                            },
                        },
                    }),
                    tx.calendarEntryParticipant.count({
                        where: {
                            userId: input.userId,
                            tenantId: { in: previousTenantIds },
                            calendarEntry: {
                                dateStart: { gte: now },
                            },
                        },
                    }),
                ])

            if (upcomingServiceAssignments || upcomingCalendarEntries) {
                throw new Error(
                    `Před přesunem předej budoucí úkoly v původním tenantu: ${upcomingServiceAssignments} přiřazení ke službám a ${upcomingCalendarEntries} účastí v kalendáři.`
                )
            }
        }

        await tx.tenantMembership.updateMany({
            where: {
                userId: input.userId,
                isActive: true,
                tenantId: { not: input.tenantId },
            },
            data: { isActive: false },
        })

        await tx.tenantMembership.upsert({
            where: {
                tenantId_userId: {
                    tenantId: input.tenantId,
                    userId: input.userId,
                },
            },
            create: {
                tenantId: input.tenantId,
                userId: input.userId,
                role: input.tenantRole,
                isActive: true,
            },
            update: {
                role: input.tenantRole,
                isActive: true,
            },
        })

        await tx.user.update({
            where: { id: input.userId },
            data: { role: input.tenantRole },
        })
    })
}

export async function setUserActive(input: {
    userId: string
    isActive: boolean
}, auth: AuthContext) {
    assertAdmin(auth)

    return prisma.user.update({
        where: {
            id: input.userId,
        },
        data: {
            isActive: input.isActive,
        },
    })
}

export async function resetUserPassword(input: {
    userId: string
    password: string
}, auth: AuthContext) {
    assertAdmin(auth)

    return prisma.user.update({
        where: {
            id: input.userId,
        },
        data: {
            passwordHash: hashPassword(input.password),
        },
    })
}
