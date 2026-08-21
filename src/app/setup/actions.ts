'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createSession } from '@/modules/auth/auth.service'
import { createInitialAdmin } from '@/modules/auth/setup.service'
import { sessionCookieName } from '@/lib/auth/constants'

export async function initialSetupAction(formData: FormData) {
    let errorMessage: string | null = null

    try {
        const tenantName = String(formData.get('tenantName') ?? '').trim()
        const fullName = String(formData.get('fullName') ?? '').trim()
        const email = String(formData.get('email') ?? '').trim()
        const password = String(formData.get('password') ?? '')

        if (!tenantName || !fullName || !email) {
            throw new Error('Vyplň všechny povinné údaje.')
        }

        if (password.length < 8) {
            throw new Error('Heslo musí mít alespoň 8 znaků.')
        }

        const user = await createInitialAdmin({
            tenantName,
            fullName,
            email,
            password,
        })
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
            error instanceof Error
                ? error.message
                : 'Úvodní nastavení se nepodařilo.'
    }

    if (errorMessage) {
        redirect(`/setup?error=${encodeURIComponent(errorMessage)}`)
    }

    redirect('/')
}
