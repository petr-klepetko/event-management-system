'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createEventServiceItem, deleteEventServiceItem } from '@/modules/event-services/event-service.service'

type CreateEventServiceItemActionArgs = {
    eventId: string
}

type DeleteEventServiceItemActionArgs = {
    eventId: string
    serviceItemId: string
}

export async function createEventServiceItemAction(
    args: CreateEventServiceItemActionArgs,
    formData: FormData
) {
    let errorMessage: string | null = null

    try {
        const serviceCatalogItemId = String(formData.get('serviceCatalogItemId') ?? '').trim()
        const customName = String(formData.get('customName') ?? '').trim()
        const description = String(formData.get('description') ?? '').trim()
        const price = String(formData.get('price') ?? '').trim()
        const note = String(formData.get('note') ?? '').trim()

        if (!customName) {
            throw new Error('Název služby je povinný.')
        }

        if (!price) {
            throw new Error('Cena je povinná.')
        }

        const normalizedPrice = price.replace(',', '.')
        const parsedPrice = Number(normalizedPrice)

        if (Number.isNaN(parsedPrice) || parsedPrice < 0) {
            throw new Error('Cena musí být platné nezáporné číslo.')
        }

        await createEventServiceItem({
            eventId: args.eventId,
            serviceCatalogItemId: serviceCatalogItemId || null,
            customName,
            description: description || null,
            price: parsedPrice.toFixed(2),
            note: note || null,
        })

        revalidatePath(`/events/${args.eventId}`)
    } catch (error) {
        errorMessage =
            error instanceof Error
                ? error.message
                : 'Službu se nepodařilo přidat.'
    }

    if (errorMessage) {
        redirect(
            `/events/${args.eventId}/services/new?error=${encodeURIComponent(errorMessage)}`
        )
    }

    redirect(`/events/${args.eventId}?success=SluzbaBylaPridana`)
}

export async function deleteEventServiceItemAction(
    args: DeleteEventServiceItemActionArgs
) {
    await deleteEventServiceItem(args.serviceItemId)

    revalidatePath(`/events/${args.eventId}`)
    redirect(`/events/${args.eventId}`)
}
