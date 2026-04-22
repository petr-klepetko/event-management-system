'use server'

import { revalidatePath } from 'next/cache'
import { createEvent } from '@/modules/events/event.service'

export async function createEventAction(formData: FormData) {
    const title = String(formData.get('title') ?? '').trim()
    const eventType = String(formData.get('eventType') ?? '').trim()
    const dateStartRaw = String(formData.get('dateStart') ?? '').trim()
    const venueName = String(formData.get('venueName') ?? '').trim()
    const clientId = String(formData.get('clientId') ?? '').trim()
    const primaryContactId = String(formData.get('primaryContactId') ?? '').trim()
    const internalNote = String(formData.get('internalNote') ?? '').trim()

    if (!title) {
        throw new Error('Event title is required.')
    }

    if (!eventType) {
        throw new Error('Event type is required.')
    }

    if (!dateStartRaw) {
        throw new Error('Event date is required.')
    }

    if (!clientId) {
        throw new Error('Client is required.')
    }

    const dateStart = new Date(dateStartRaw)

    if (Number.isNaN(dateStart.getTime())) {
        throw new Error('Invalid event date.')
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
}