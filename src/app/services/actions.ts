'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import {
    createServiceCatalogItem,
    setServiceCatalogItemActive,
    updateServiceCatalogItem,
} from '@/modules/services/service-catalog.service'
import { requireTenantManagerContext } from '@/lib/auth/current-user'
import { parseNonNegativePrice } from '@/lib/money'

function readTrimmedString(formData: FormData, key: string) {
    return String(formData.get(key) ?? '').trim()
}

export async function createServiceCatalogItemAction(formData: FormData) {
    const auth = await requireTenantManagerContext()
    let errorMessage: string | null = null

    try {
        const name = readTrimmedString(formData, 'name')
        const description = readTrimmedString(formData, 'description')
        const defaultPrice = parseNonNegativePrice(readTrimmedString(formData, 'defaultPrice'), 'Cena')

        if (!name) {
            throw new Error('Název služby je povinný.')
        }

        await createServiceCatalogItem({
            name,
            description: description || null,
            defaultPrice,
        }, auth)

        revalidatePath('/services')
    } catch (error) {
        errorMessage =
            error instanceof Error
                ? error.message
                : 'Službu se nepodařilo vytvořit.'
    }

    if (errorMessage) {
        redirect(`/services/new?error=${encodeURIComponent(errorMessage)}`)
    }

    redirect('/services?success=SluzbaBylaVytvorena')
}

type UpdateServiceCatalogItemActionArgs = {
    serviceId: string
}

export async function updateServiceCatalogItemAction(
    args: UpdateServiceCatalogItemActionArgs,
    formData: FormData
) {
    const auth = await requireTenantManagerContext()
    let errorMessage: string | null = null

    try {
        const name = readTrimmedString(formData, 'name')
        const description = readTrimmedString(formData, 'description')
        const defaultPrice = parseNonNegativePrice(readTrimmedString(formData, 'defaultPrice'), 'Cena')

        if (!name) {
            throw new Error('Název služby je povinný.')
        }

        await updateServiceCatalogItem({
            id: args.serviceId,
            name,
            description: description || null,
            defaultPrice,
        }, auth)

        revalidatePath('/services')
        revalidatePath(`/services/${args.serviceId}/edit`)
    } catch (error) {
        errorMessage =
            error instanceof Error
                ? error.message
                : 'Službu se nepodařilo upravit.'
    }

    if (errorMessage) {
        redirect(
            `/services/${args.serviceId}/edit?error=${encodeURIComponent(errorMessage)}`
        )
    }

    redirect('/services?success=SluzbaBylaUlozena')
}

type SetServiceCatalogItemActiveActionArgs = {
    serviceId: string
    isActive: boolean
}

export async function setServiceCatalogItemActiveAction(
    args: SetServiceCatalogItemActiveActionArgs
) {
    const auth = await requireTenantManagerContext()
    await setServiceCatalogItemActive(args.serviceId, args.isActive, auth)

    revalidatePath('/services')
    redirect('/services')
}
