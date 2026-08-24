import { randomBytes, scryptSync, timingSafeEqual, createHash } from 'crypto'
import { UserRole } from '@prisma/client'
import { prisma } from '@/lib/db/prisma'

const passwordHashPrefix = 'scrypt'
const sessionDurationMs = 1000 * 60 * 60 * 24 * 14

export function hashPassword(password: string) {
    const salt = randomBytes(16).toString('hex')
    const hash = scryptSync(password, salt, 64).toString('hex')

    return `${passwordHashPrefix}:${salt}:${hash}`
}

export function verifyPassword(password: string, storedHash: string) {
    const [prefix, salt, hash] = storedHash.split(':')

    if (prefix !== passwordHashPrefix || !salt || !hash) {
        return false
    }

    const candidate = scryptSync(password, salt, 64)
    const expected = Buffer.from(hash, 'hex')

    if (candidate.length !== expected.length) {
        return false
    }

    return timingSafeEqual(candidate, expected)
}

export function createRawSessionToken() {
    return randomBytes(32).toString('hex')
}

export function hashSessionToken(token: string) {
    return createHash('sha256').update(token).digest('hex')
}

export async function createSession(userId: string) {
    const token = createRawSessionToken()
    const tokenHash = hashSessionToken(token)
    const expiresAt = new Date(Date.now() + sessionDurationMs)

    await prisma.userSession.create({
        data: {
            userId,
            tokenHash,
            expiresAt,
        },
    })

    return { token, expiresAt }
}

export async function deleteSession(token: string) {
    await prisma.userSession.deleteMany({
        where: {
            tokenHash: hashSessionToken(token),
        },
    })
}

export async function getSessionUserByToken(token: string) {
    const session = await prisma.userSession.findUnique({
        where: {
            tokenHash: hashSessionToken(token),
        },
        include: {
            user: {
                include: {
                    memberships: {
                        where: {
                            isActive: true,
                        },
                        include: {
                            tenant: true,
                        },
                        orderBy: {
                            createdAt: 'asc',
                        },
                    },
                },
            },
        },
    })

    if (!session || session.expiresAt < new Date() || !session.user.isActive) {
        return null
    }

    return session.user
}

export async function authenticateUser(email: string, password: string) {
    const user = await prisma.user.findUnique({
        where: {
            email: email.toLowerCase(),
        },
    })

    if (!user || !user.isActive || !verifyPassword(password, user.passwordHash)) {
        return null
    }

    return user
}

export function isAppAdmin(role: UserRole) {
    return role === 'ADMIN'
}
