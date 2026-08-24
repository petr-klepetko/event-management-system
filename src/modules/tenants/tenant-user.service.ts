import { createHash, randomBytes } from 'crypto'
import { TenantRole } from '@prisma/client'
import { prisma } from '@/lib/db/prisma'
import { AuthContext } from '@/lib/auth/current-user'
import { hashPassword } from '@/modules/auth/auth.service'

function hashInviteToken(token: string) {
    return createHash('sha256').update(token).digest('hex')
}

function assertCanManageTenant(auth: AuthContext) {
    if (auth.isAdmin) {
        return
    }

    if (auth.tenantRole !== 'MANAGER') {
        throw new Error('Uživatelé může spravovat jen správce skupiny.')
    }
}

export async function getTenantUsers(auth: AuthContext) {
    assertCanManageTenant(auth)

    return prisma.tenantMembership.findMany({
        where: auth.isAdmin
            ? {}
            : {
                  tenantId: auth.tenantId ?? '__no_tenant_access__',
              },
        include: {
            tenant: true,
            user: true,
        },
        orderBy: {
            createdAt: 'desc',
        },
    })
}

export async function getTenantInvites(auth: AuthContext) {
    assertCanManageTenant(auth)

    return prisma.tenantInvite.findMany({
        where: auth.isAdmin
            ? {}
            : {
                  tenantId: auth.tenantId ?? '__no_tenant_access__',
                  acceptedAt: null,
              },
        include: {
            tenant: true,
            invitedBy: true,
        },
        orderBy: {
            createdAt: 'desc',
        },
    })
}

export async function createTenantInvite(input: {
    email: string
    role: TenantRole
}, auth: AuthContext) {
    assertCanManageTenant(auth)

    const tenantId = auth.tenantId

    if (!tenantId) {
        throw new Error('Nejdřív vyber tenant.')
    }

    const token = randomBytes(32).toString('hex')

    await prisma.tenantInvite.create({
        data: {
            tenantId,
            email: input.email.toLowerCase(),
            role: input.role,
            tokenHash: hashInviteToken(token),
            invitedByUserId: auth.userId,
            expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
        },
    })

    return token
}

export async function updateTenantMembershipRole(input: {
    membershipId: string
    role: TenantRole
}, auth: AuthContext) {
    assertCanManageTenant(auth)

    return prisma.tenantMembership.update({
        where: {
            id: input.membershipId,
            ...(auth.isAdmin
                ? {}
                : {
                      tenantId: auth.tenantId ?? '__no_tenant_access__',
                  }),
        },
        data: {
            role: input.role,
        },
    })
}

export async function acceptTenantInvite(input: {
    token: string
    fullName: string
    password: string
}) {
    const invite = await prisma.tenantInvite.findUnique({
        where: {
            tokenHash: hashInviteToken(input.token),
        },
    })

    if (!invite || invite.acceptedAt || invite.expiresAt < new Date()) {
        throw new Error('Pozvánka je neplatná nebo expirovaná.')
    }

    const user = await prisma.user.upsert({
        where: {
            email: invite.email,
        },
        create: {
            email: invite.email,
            fullName: input.fullName,
            passwordHash: hashPassword(input.password),
            role: invite.role === 'WORKER' ? 'WORKER' : 'MANAGER',
        },
        update: {
            fullName: input.fullName,
            passwordHash: hashPassword(input.password),
            isActive: true,
        },
    })

    await prisma.tenantMembership.upsert({
        where: {
            tenantId_userId: {
                tenantId: invite.tenantId,
                userId: user.id,
            },
        },
        create: {
            tenantId: invite.tenantId,
            userId: user.id,
            role: invite.role,
        },
        update: {
            role: invite.role,
            isActive: true,
        },
    })

    await prisma.tenantInvite.update({
        where: {
            id: invite.id,
        },
        data: {
            acceptedAt: new Date(),
        },
    })

    return user
}
