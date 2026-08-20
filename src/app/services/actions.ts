'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import {
    createServiceCatalogItem,
    setServiceCatalogItemActive,
    updateServiceCatalogItem,
} from '@/modules/services/service-catalog.service'

function readTrimmedString(formData: FormData, key: string) {
    return String(formData.get(key) ?? '').trim()
}

function normalizePrice(rawPrice: string) {
    const normalizedPrice = rawPrice.replace(',', '.')
    const parsedPrice = Number(normalizedPrice)

    if (!rawPrice || Number.isNaN(parsedPrice) || parsedPrice < 0) {
        throw new Error('Cena musí být platné nezáporné číslo.')
    }

    return parsedPrice.toFixed(2)
}

export async function createServiceCatalogItemAction(formData: FormData) {
    let errorMessage: string | null = null

    try {
        const name = readTrimmedString(formData, 'name')
        const description = readTrimmedString(formData, 'description')
        const defaultPrice = normalizePrice(
            readTrimmedString(formData, 'defaultPrice')
        )

        if (!name) {
            throw new Error('Název služby je povinný.')
        }

        await createServiceCatalogItem({
            name,
            description: description || null,
            defaultPrice,
        })

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
    let errorMessage: string | null = null

    try {
        const name = readTrimmedString(formData, 'name')
        const description = readTrimmedString(formData, 'description')
        const defaultPrice = normalizePrice(
            readTrimmedString(formData, 'defaultPrice')
        )

        if (!name) {
            throw new Error('Název služby je povinný.')
        }

        await updateServiceCatalogItem({
            id: args.serviceId,
            name,
            description: description || null,
            defaultPrice,
        })

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
    await setServiceCatalogItemActive(args.serviceId, args.isActive)

    revalidatePath('/services')
    redirect('/services')
}
