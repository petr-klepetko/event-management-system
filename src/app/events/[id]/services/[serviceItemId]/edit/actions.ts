'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { updateEventServiceItem } from '@/modules/event-services/event-service.service'
import { requireTenantManagerContext } from '@/lib/auth/current-user'
import { readEventServiceAssignments } from '../../../service-assignment-form'
import { parseNonNegativePrice } from '@/lib/money'

type UpdateEventServiceItemActionArgs = {
    eventId: string
    serviceItemId: string
}

export async function updateEventServiceItemAction(
    args: UpdateEventServiceItemActionArgs,
    formData: FormData
) {
    const auth = await requireTenantManagerContext()
    let errorMessage: string | null = null

    try {
        const serviceCatalogItemId = String(formData.get('serviceCatalogItemId') ?? '').trim()
        const customName = String(formData.get('customName') ?? '').trim()
        const description = String(formData.get('description') ?? '').trim()
        const price = String(formData.get('price') ?? '').trim()
        const note = String(formData.get('note') ?? '').trim()
        const assignments = readEventServiceAssignments(formData)

        if (!customName) {
            throw new Error('Název služby je povinný.')
        }

        const parsedPrice = parseNonNegativePrice(price, 'Cena')

        await updateEventServiceItem({
            id: args.serviceItemId,
            serviceCatalogItemId: serviceCatalogItemId || null,
            customName,
            description: description || null,
            price: parsedPrice,
            note: note || null,
            assignments,
        }, auth)

        revalidatePath(`/events/${args.eventId}`)
        revalidatePath(`/events/${args.eventId}/services/${args.serviceItemId}/edit`)
    } catch (error) {
        errorMessage =
            error instanceof Error
                ? error.message
                : 'Službu se nepodařilo upravit.'
    }

    if (errorMessage) {
        redirect(
            `/events/${args.eventId}/services/${args.serviceItemId}/edit?error=${encodeURIComponent(errorMessage)}`
        )
    }

    redirect(`/events/${args.eventId}`)
}
