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
