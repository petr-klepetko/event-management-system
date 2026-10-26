'use server'

import { cookies, headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { createSession } from '@/modules/auth/auth.service'
import { acceptTenantInvite } from '@/modules/tenants/tenant-user.service'
import { sessionCookieName } from '@/lib/auth/constants'
import { assertPasswordPolicy } from '@/lib/auth/password-policy'
import {
    assertRateLimit,
    clearRateLimit,
    registerRateLimitFailure,
} from '@/lib/auth/rate-limit'

const inviteRateLimit = {
    limit: 5,
    windowMs: 1000 * 60 * 15,
}

async function getClientIp() {
    const headerStore = await headers()
    const forwardedFor = headerStore.get('x-forwarded-for')
    const realIp = headerStore.get('x-real-ip')

    return forwardedFor?.split(',')[0]?.trim() || realIp || 'unknown'
}

type AcceptInviteActionArgs = {
    token: string
}

export async function acceptInviteAction(
    args: AcceptInviteActionArgs,
    formData: FormData
) {
    let errorMessage: string | null = null

    try {
        const fullName = String(formData.get('fullName') ?? '').trim()
        const password = String(formData.get('password') ?? '')
        const rateLimitKey = `invite:${await getClientIp()}:${args.token}`

        assertRateLimit({
            key: rateLimitKey,
            ...inviteRateLimit,
            message:
                'Příliš mnoho neúspěšných pokusů. Zkus to prosím znovu za 15 minut.',
        })

        if (!fullName) {
            throw new Error('Jméno je povinné.')
        }

        assertPasswordPolicy(password)

        const user = await acceptTenantInvite({
            token: args.token,
            fullName,
            password,
        })
        clearRateLimit(rateLimitKey)

        const session = await createSession(user.id)
        const cookieStore = await cookies()

        cookieStore.set(sessionCookieName, session.token, {
            httpOnly: true,
            sameSite: 'lax',
            secure: process.env.NODE_ENV === 'production',
            expires: session.expiresAt,
            path: '/',
        })
    } catch (error) {
        const rateLimitKey = `invite:${await getClientIp()}:${args.token}`

        registerRateLimitFailure({
            key: rateLimitKey,
            ...inviteRateLimit,
        })

        errorMessage =
            error instanceof Error
                ? error.message
                : 'Pozvánku se nepodařilo přijmout.'
    }

    if (errorMessage) {
        redirect(
            `/invite/${args.token}?error=${encodeURIComponent(errorMessage)}`
        )
    }

    redirect('/')
}
