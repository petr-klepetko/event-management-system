'use server'

import { revalidatePath } from 'next/cache'
import { EventStatus } from '@prisma/client'
import {
    createEvent,
    deleteEvent,
    updateEvent,
} from '@/modules/events/event.service'
import { redirect } from 'next/navigation'
import { requireAuthContext } from '@/lib/auth/current-user'

function readEventFormData(formData: FormData) {
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

    return {
        title,
        eventType,
        dateStart,
        venueName: venueName || null,
        clientId,
        primaryContactId: primaryContactId || null,
        internalNote: internalNote || null,
    }
}

export async function createEventAction(formData: FormData) {
    let errorMessage: string | null = null

    try {
        const auth = await requireAuthContext()
        const input = readEventFormData(formData)

        await createEvent(input, auth)

        revalidatePath('/events')
    } catch (error) {
        errorMessage =
            error instanceof Error
                ? error.message
                : 'Akci se nepodařilo vytvořit.'
    }

    if (errorMessage) {
        redirect(`/events/new?error=${encodeURIComponent(errorMessage)}`)
    }

    redirect('/events?success=AkceBylaVytvorena')
}

type UpdateEventActionArgs = {
    eventId: string
}

export async function updateEventAction(
    args: UpdateEventActionArgs,
    formData: FormData
) {
    let errorMessage: string | null = null

    try {
        const auth = await requireAuthContext()
        const input = readEventFormData(formData)
        const statusRaw = String(formData.get('status') ?? '').trim()
        const allowedStatuses: EventStatus[] = [
            'DRAFT',
            'CONFIRMED',
            'COMPLETED',
            'CANCELLED',
        ]
        const status = allowedStatuses.includes(statusRaw as EventStatus)
            ? (statusRaw as EventStatus)
            : 'DRAFT'

        await updateEvent({
            id: args.eventId,
            status,
            ...input,
        }, auth)

        revalidatePath('/events')
        revalidatePath(`/events/${args.eventId}`)
        revalidatePath(`/events/${args.eventId}/offer`)
    } catch (error) {
        errorMessage =
            error instanceof Error
                ? error.message
                : 'Akci se nepodařilo upravit.'
    }

    if (errorMessage) {
        redirect(
            `/events/${args.eventId}/edit?error=${encodeURIComponent(errorMessage)}`
        )
    }

    redirect(`/events/${args.eventId}?success=AkceBylaUlozena`)
}

type DeleteEventActionArgs = {
    eventId: string
}

export async function deleteEventAction(args: DeleteEventActionArgs) {
    let errorMessage: string | null = null

    try {
        const auth = await requireAuthContext()
        await deleteEvent(args.eventId, auth)
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
