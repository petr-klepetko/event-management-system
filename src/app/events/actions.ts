'use server'

import { revalidatePath } from 'next/cache'
import { createEvent, deleteEvent } from '@/modules/events/event.service'
import { redirect } from 'next/navigation'

export async function createEventAction(formData: FormData) {
    let errorMessage: string | null = null

    try {
        const title = String(formData.get('title') ?? '').trim()
        const eventType = String(formData.get('eventType') ?? '').trim()
        const dateStartRaw = String(formData.get('dateStart') ?? '').trim()
        const venueName = String(formData.get('venueName') ?? '').trim()
        const clientId = String(formData.get('clientId') ?? '').trim()
        const primaryContactId = String(formData.get('primaryContactId') ?? '').trim()
        const internalNote = String(formData.get('internalNote') ?? '').trim()

        if (!title) {
            throw new Error('Název akce je povinný.')
        }

        if (!eventType) {
            throw new Error('Typ akce je povinný.')
        }

        if (!dateStartRaw) {
            throw new Error('Datum akce je povinné.')
        }

        if (!clientId) {
            throw new Error('Klient je povinný.')
        }

        const dateStart = new Date(dateStartRaw)

        if (Number.isNaN(dateStart.getTime())) {
            throw new Error('Datum akce není platné.')
        }

        await createEvent({
            title,
            eventType,
            dateStart,
            venueName: venueName || null,
            clientId,
            primaryContactId: primaryContactId || null,
            internalNote: internalNote || null,
        })

        revalidatePath('/events')
    } catch (error) {
        errorMessage =
            error instanceof Error
                ? error.message
                : 'Akci se nepodařilo vytvořit.'
    }

    if (errorMessage) {
        redirect(`/events?error=${encodeURIComponent(errorMessage)}`)
    }

    redirect('/events?success=AkceBylaVytvorena')
}

type DeleteEventActionArgs = {
    eventId: string
}

export async function deleteEventAction(args: DeleteEventActionArgs) {
    let errorMessage: string | null = null

    try {
        await deleteEvent(args.eventId)
        revalidatePath('/events')
    } catch (error) {
        errorMessage =
            error instanceof Error
                ? error.message
                : 'Akci se nepodařilo smazat.'
    }

    if (errorMessage) {
        redirect(`/events?error=${encodeURIComponent(errorMessage)}`)
    }

    redirect('/events')
}
