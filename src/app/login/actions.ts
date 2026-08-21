'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { authenticateUser, createSession, deleteSession } from '@/modules/auth/auth.service'
import { sessionCookieName } from '@/lib/auth/constants'

export async function loginAction(formData: FormData) {
    let errorMessage: string | null = null
    const nextPath = String(formData.get('next') ?? '/').trim() || '/'

    try {
        const email = String(formData.get('email') ?? '').trim()
        const password = String(formData.get('password') ?? '')

        if (!email || !password) {
            throw new Error('Vyplň email i heslo.')
        }

        const user = await authenticateUser(email, password)

        if (!user) {
            throw new Error('Email nebo heslo není správné.')
        }

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
