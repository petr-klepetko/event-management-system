'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { TenantRole, UserRole } from '@prisma/client'
import { requireAdminContext } from '@/lib/auth/current-user'
import {
    createAdminManagedUser,
    createTenant,
    resetUserPassword,
    setUserActive,
} from '@/modules/admin/admin.service'
import { assertPasswordPolicy } from '@/lib/auth/password-policy'

function normalizeSlug(value: string) {
    return value
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
}

export async function createTenantAction(formData: FormData) {
    let errorMessage: string | null = null

    try {
        const auth = await requireAdminContext()
        const name = String(formData.get('name') ?? '').trim()
        const slug = normalizeSlug(String(formData.get('slug') ?? name))

        if (!name || !slug) {
            throw new Error('Název a slug tenantu jsou povinné.')
        }

        await createTenant({ name, slug }, auth)
        revalidatePath('/admin')
    } catch (error) {
        errorMessage =
            error instanceof Error
                ? error.message
                : 'Tenant se nepodařilo vytvořit.'
    }

    if (errorMessage) {
        redirect(`/admin?error=${encodeURIComponent(errorMessage)}`)
    }

    redirect('/admin?success=TenantBylVytvoren')
}

export async function createAdminUserAction(formData: FormData) {
    let errorMessage: string | null = null

    try {
        const auth = await requireAdminContext()
        const email = String(formData.get('email') ?? '').trim()
        const fullName = String(formData.get('fullName') ?? '').trim()
        const password = String(formData.get('password') ?? '')
        const appRoleRaw = String(formData.get('appRole') ?? 'WORKER')
        const tenantId = String(formData.get('tenantId') ?? '').trim()
        const tenantRoleRaw = String(formData.get('tenantRole') ?? 'WORKER')
        const appRole: UserRole =
            appRoleRaw === 'ADMIN'
                ? 'ADMIN'
                : appRoleRaw === 'MANAGER'
                  ? 'MANAGER'
                  : 'WORKER'
        const tenantRole: TenantRole =
            tenantRoleRaw === 'MANAGER' ? 'MANAGER' : 'WORKER'

        if (!email || !fullName || !password) {
            throw new Error('Login, jméno a heslo jsou povinné.')
        }

        assertPasswordPolicy(password)

        await createAdminManagedUser(
            {
                email,
                fullName,
                password,
                appRole,
                tenantId: tenantId || null,
                tenantRole: tenantId ? tenantRole : null,
            },
            auth
        )
        revalidatePath('/admin')
    } catch (error) {
        errorMessage =
            error instanceof Error
                ? error.message
                : 'Uživatele se nepodařilo vytvořit.'
    }

    if (errorMessage) {
        redirect(`/admin?error=${encodeURIComponent(errorMessage)}`)
    }

    redirect('/admin?success=UzivatelBylVytvoren')
}

type SetUserActiveActionArgs = {
    userId: string
    isActive: boolean
}

export async function setUserActiveAction(args: SetUserActiveActionArgs) {
    const auth = await requireAdminContext()
    await setUserActive(args, auth)
    revalidatePath('/admin')
    redirect('/admin')
}

type ResetUserPasswordActionArgs = {
    userId: string
}

export async function resetUserPasswordAction(
    args: ResetUserPasswordActionArgs,
    formData: FormData
) {
    let errorMessage: string | null = null

    try {
        const auth = await requireAdminContext()
        const password = String(formData.get('password') ?? '')

        assertPasswordPolicy(password)

        await resetUserPassword(
            {
                userId: args.userId,
                password,
            },
            auth
        )
        revalidatePath('/admin')
    } catch (error) {
        errorMessage =
            error instanceof Error
                ? error.message
                : 'Heslo se nepodařilo změnit.'
    }

    if (errorMessage) {
        redirect(`/admin?error=${encodeURIComponent(errorMessage)}`)
    }

    redirect('/admin?success=HesloByloZmeneno')
}
