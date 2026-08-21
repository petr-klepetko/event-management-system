'use server'

import { redirect } from 'next/navigation'
import { TenantRole } from '@prisma/client'
import { requireAuthContext } from '@/lib/auth/current-user'
import {
    createTenantInvite,
    updateTenantMembershipRole,
} from '@/modules/tenants/tenant-user.service'

export async function createTenantInviteAction(formData: FormData) {
    let errorMessage: string | null = null
    let token: string | null = null

    try {
        const auth = await requireAuthContext()
        const email = String(formData.get('email') ?? '').trim()
        const roleRaw = String(formData.get('role') ?? 'WORKER').trim()
        const role: TenantRole = roleRaw === 'MANAGER' ? 'MANAGER' : 'WORKER'

        if (!email) {
            throw new Error('Email je povinný.')
        }

        token = await createTenantInvite({ email, role }, auth)
    } catch (error) {
        errorMessage =
            error instanceof Error
                ? error.message
                : 'Pozvánku se nepodařilo vytvořit.'
    }

    if (errorMessage) {
        redirect(`/settings/users?error=${encodeURIComponent(errorMessage)}`)
    }

    redirect(`/settings/users?invite=${encodeURIComponent(token ?? '')}`)
}

type UpdateTenantMembershipRoleActionArgs = {
    membershipId: string
}

export async function updateTenantMembershipRoleAction(
    args: UpdateTenantMembershipRoleActionArgs,
    formData: FormData
) {
    let errorMessage: string | null = null

    try {
        const auth = await requireAuthContext()
        const roleRaw = String(formData.get('role') ?? 'WORKER').trim()
        const role: TenantRole = roleRaw === 'MANAGER' ? 'MANAGER' : 'WORKER'

        await updateTenantMembershipRole(
            {
                membershipId: args.membershipId,
                role,
            },
            auth
        )
    } catch (error) {
        errorMessage =
            error instanceof Error
                ? error.message
                : 'Roli se nepodařilo upravit.'
    }

    if (errorMessage) {
        redirect(`/settings/users?error=${encodeURIComponent(errorMessage)}`)
    }

    redirect('/settings/users')
}
