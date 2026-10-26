import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { TenantRole, UserRole } from '@prisma/client'
import type { Prisma } from '@prisma/client'
import { getSessionUserByToken, isAppAdmin } from '@/modules/auth/auth.service'
import { sessionCookieName } from './constants'

export type AuthContext = {
    userId: string
    email: string
    fullName: string
    role: UserRole
    isAdmin: boolean
    tenantId: string | null
    tenantRole: TenantRole | null
}

export async function getCurrentAuthContext(): Promise<AuthContext | null> {
    const cookieStore = await cookies()
    const token = cookieStore.get(sessionCookieName)?.value

    if (!token) {
        return null
    }

    const user = await getSessionUserByToken(token)

    if (!user) {
        return null
    }

    const membership = user.memberships[0] ?? null
    const admin = isAppAdmin(user.role)

    if (!admin && !membership) {
        return null
    }

    return {
        userId: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        isAdmin: admin,
        tenantId: membership?.tenantId ?? null,
        tenantRole: membership?.role ?? null,
    }
}

export async function requireAuthContext() {
    const auth = await getCurrentAuthContext()

    if (!auth) {
        redirect('/login')
    }

    return auth
}

export async function requireAdminContext() {
    const auth = await requireAuthContext()

    if (!auth.isAdmin) {
        redirect('/')
    }

    return auth
}

export async function requireTenantManagerContext() {
    const auth = await requireAuthContext()

    if (!auth.isAdmin && auth.tenantRole === 'WORKER') {
        redirect('/')
    }

    return auth
}

export function isWorkerContext(auth: AuthContext) {
    return !auth.isAdmin && auth.tenantRole === 'WORKER'
}

export function getTenantScopedWhere(auth: AuthContext) {
    if (auth.isAdmin) {
        return {}
    }

    if (!auth.tenantId) {
        return {
            id: '__no_tenant_access__',
        }
    }

    if (auth.tenantRole === 'WORKER') {
        return {
            tenantId: auth.tenantId,
            ownerUserId: auth.userId,
        }
    }

    return {
        tenantId: auth.tenantId,
    }
}

export function getEventScopedWhere(auth: AuthContext): Prisma.EventWhereInput {
    if (auth.isAdmin) {
        return {}
    }

    if (!auth.tenantId) {
        return {
            id: '__no_tenant_access__',
        }
    }

    if (auth.tenantRole === 'WORKER') {
        return {
            tenantId: auth.tenantId,
            serviceItems: {
                some: {
                    assignments: {
                        some: {
                            userId: auth.userId,
                        },
                    },
                },
            },
        }
    }

    return {
        tenantId: auth.tenantId,
    }
}

export function canManageOwnedTenantData(
    auth: AuthContext,
    ownerUserId: string | null
) {
    return auth.isAdmin || auth.tenantRole !== 'WORKER' || ownerUserId === auth.userId
}
