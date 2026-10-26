'use server'

import { cookies, headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { authenticateUser, createSession, deleteSession } from '@/modules/auth/auth.service'
import { sessionCookieName } from '@/lib/auth/constants'
import {
    assertRateLimit,
    clearRateLimit,
    registerRateLimitFailure,
} from '@/lib/auth/rate-limit'

const loginRateLimit = {
    limit: 5,
    windowMs: 1000 * 60 * 15,
}

async function getClientIp() {
    const headerStore = await headers()
    const forwardedFor = headerStore.get('x-forwarded-for')
    const realIp = headerStore.get('x-real-ip')

    return forwardedFor?.split(',')[0]?.trim() || realIp || 'unknown'
}

export async function loginAction(formData: FormData) {
    let errorMessage: string | null = null
    const nextPath = String(formData.get('next') ?? '/').trim() || '/'

    try {
        const email = String(formData.get('email') ?? '').trim()
        const password = String(formData.get('password') ?? '')
        const rateLimitKey = `login:${await getClientIp()}:${email.toLowerCase()}`

        if (!email || !password) {
            throw new Error('Vyplň email i heslo.')
        }

        assertRateLimit({
            key: rateLimitKey,
            ...loginRateLimit,
            message:
                'Příliš mnoho neúspěšných pokusů. Zkus to prosím znovu za 15 minut.',
        })

        const user = await authenticateUser(email, password)

        if (!user) {
            registerRateLimitFailure({
                key: rateLimitKey,
                ...loginRateLimit,
            })
            throw new Error('Email nebo heslo není správné.')
        }

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
        errorMessage =
            error instanceof Error ? error.message : 'Přihlášení se nepodařilo.'
    }

    if (errorMessage) {
        redirect(`/login?error=${encodeURIComponent(errorMessage)}`)
    }

    redirect(nextPath.startsWith('/') ? nextPath : '/')
}

export async function logoutAction() {
    const cookieStore = await cookies()
    const token = cookieStore.get(sessionCookieName)?.value

    if (token) {
        await deleteSession(token)
    }

    cookieStore.delete(sessionCookieName)
    redirect('/login')
}
