import { prisma } from '@/lib/db/prisma'
import { hashPassword } from './auth.service'

export async function canRunInitialSetup() {
    const usersCount = await prisma.user.count()

    return usersCount === 0
}

export async function createInitialAdmin(input: {
    tenantName: string
    fullName: string
    email: string
    password: string
}) {
    const allowed = await canRunInitialSetup()

    if (!allowed) {
        throw new Error('Úvodní nastavení už bylo dokončeno.')
    }

    const tenant = await prisma.tenant.upsert({
        where: {
            slug: 'default',
        },
        create: {
            id: 'default-tenant',
            name: input.tenantName,
            slug: 'default',
        },
        update: {
            name: input.tenantName,
        },
    })

    const user = await prisma.user.create({
        data: {
            email: input.email.toLowerCase(),
            fullName: input.fullName,
            passwordHash: hashPassword(input.password),
            role: 'ADMIN',
        },
    })

    await prisma.tenantMembership.create({
        data: {
            tenantId: tenant.id,
            userId: user.id,
            role: 'MANAGER',
        },
    })

    return user
}
