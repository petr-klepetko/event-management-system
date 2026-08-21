'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createSession } from '@/modules/auth/auth.service'
import { acceptTenantInvite } from '@/modules/tenants/tenant-user.service'
import { sessionCookieName } from '@/lib/auth/constants'

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

        if (!fullName) {
            throw new Error('Jméno je povinné.')
        }

        if (password.length < 8) {
            throw new Error('Heslo musí mít alespoň 8 znaků.')
        }

        const user = await acceptTenantInvite({
            token: args.token,
            fullName,
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
                : 'Pozvánku se nepodařilo přijmout.'
    }

    if (errorMessage) {
        redirect(
            `/invite/${args.token}?error=${encodeURIComponent(errorMessage)}`
        )
    }

    redirect('/')
}
