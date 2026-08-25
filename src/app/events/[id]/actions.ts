'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createEventServiceItem, deleteEventServiceItem } from '@/modules/event-services/event-service.service'
import { createEventCost, deleteEventCost } from '@/modules/event-costs/event-cost.service'
import { requireAuthContext } from '@/lib/auth/current-user'
import { readEventServiceAssignments } from './service-assignment-form'

type CreateEventServiceItemActionArgs = {
    eventId: string
}

type DeleteEventServiceItemActionArgs = {
    eventId: string
    serviceItemId: string
}

type CreateEventCostActionArgs = {
    eventId: string
}

type DeleteEventCostActionArgs = {
    eventId: string
    costId: string
}

export async function createEventServiceItemAction(
    args: CreateEventServiceItemActionArgs,
    formData: FormData
) {
    let errorMessage: string | null = null

    try {
        const auth = await requireAuthContext()
        const serviceCatalogItemId = String(formData.get('serviceCatalogItemId') ?? '').trim()
        const customName = String(formData.get('customName') ?? '').trim()
        const description = String(formData.get('description') ?? '').trim()
        const price = String(formData.get('price') ?? '').trim()
        const note = String(formData.get('note') ?? '').trim()
        const assignments = readEventServiceAssignments(formData)

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
            assignments,
        }, auth)

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
    let errorMessage: string | null = null

    try {
        const auth = await requireAuthContext()
        await deleteEventServiceItem(args.serviceItemId, auth)

        revalidatePath(`/events/${args.eventId}`)
    } catch (error) {
        errorMessage =
            error instanceof Error
                ? error.message
                : 'Službu se nepodařilo smazat.'
    }

    if (errorMessage) {
        redirect(
            `/events/${args.eventId}?error=${encodeURIComponent(errorMessage)}`
        )
    }

    redirect(`/events/${args.eventId}`)
}

export async function createEventCostAction(
    args: CreateEventCostActionArgs,
    formData: FormData
) {
    let errorMessage: string | null = null

    try {
        const auth = await requireAuthContext()
        const name = String(formData.get('costName') ?? '').trim()
        const amount = String(formData.get('costAmount') ?? '').trim()
        const note = String(formData.get('costNote') ?? '').trim()

        if (!name) {
            throw new Error('Název nákladu je povinný.')
        }

        if (!amount) {
            throw new Error('Částka nákladu je povinná.')
        }

        const parsedAmount = Number(amount.replace(',', '.'))

        if (Number.isNaN(parsedAmount) || parsedAmount < 0) {
            throw new Error('Částka nákladu musí být platné nezáporné číslo.')
        }

        await createEventCost(
            {
                eventId: args.eventId,
                name,
                amount: parsedAmount.toFixed(2),
                note: note || null,
            },
            auth
        )

        revalidatePath(`/events/${args.eventId}`)
    } catch (error) {
        errorMessage =
            error instanceof Error
                ? error.message
                : 'Náklad se nepodařilo přidat.'
    }

    if (errorMessage) {
        redirect(
            `/events/${args.eventId}?financeError=${encodeURIComponent(errorMessage)}`
        )
    }

    redirect(`/events/${args.eventId}?success=NakladBylPridan`)
}

export async function deleteEventCostAction(args: DeleteEventCostActionArgs) {
    let errorMessage: string | null = null

    try {
        const auth = await requireAuthContext()
        await deleteEventCost(args.costId, auth)

        revalidatePath(`/events/${args.eventId}`)
    } catch (error) {
        errorMessage =
            error instanceof Error
                ? error.message
                : 'Náklad se nepodařilo smazat.'
    }

    if (errorMessage) {
        redirect(
            `/events/${args.eventId}?financeError=${encodeURIComponent(errorMessage)}`
        )
    }

    redirect(`/events/${args.eventId}`)
}
