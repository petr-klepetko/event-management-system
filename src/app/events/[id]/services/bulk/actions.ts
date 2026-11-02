'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { requireTenantManagerContext } from '@/lib/auth/current-user'
import { createEventServiceItemsFromCatalog } from '@/modules/event-services/event-service.service'

export async function addSelectedServicesAction(eventId: string, formData: FormData) {
    const auth = await requireTenantManagerContext()
    let errorMessage: string | null = null

    try {
        const ids = formData.getAll('serviceCatalogItemIds').map(String)
        await createEventServiceItemsFromCatalog(eventId, ids, auth)
        revalidatePath(`/events/${eventId}`)
    } catch (error) {
        errorMessage = error instanceof Error ? error.message : 'Služby se nepodařilo přidat.'
    }

    if (errorMessage) {
        redirect(`/events/${eventId}/services/bulk?error=${encodeURIComponent(errorMessage)}`)
    }

    redirect(`/events/${eventId}?success=SluzbyBylyPridany`)
}
