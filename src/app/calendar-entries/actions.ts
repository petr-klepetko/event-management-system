'use server'

import { CalendarEntryVisibility } from '@prisma/client'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { requireTenantManagerContext } from '@/lib/auth/current-user'
import {
    createCalendarEntry,
    updateCalendarEntry,
} from '@/modules/calendar-entries/calendar-entry.service'

function readCalendarEntryFormData(formData: FormData) {
    const title = String(formData.get('title') ?? '').trim()
    const description = String(formData.get('description') ?? '').trim()
    const dateStartRaw = String(formData.get('dateStart') ?? '').trim()
    const visibilityRaw = String(formData.get('visibility') ?? '').trim()
    const participantUserIds = formData
        .getAll('participantUserId')
        .map((value) => String(value).trim())
        .filter(Boolean)

    if (!title) {
        throw new Error('Název události je povinný.')
    }

    if (!dateStartRaw) {
        throw new Error('Datum a čas události jsou povinné.')
    }

    const dateStart = new Date(dateStartRaw)

    if (Number.isNaN(dateStart.getTime())) {
        throw new Error('Datum události není platné.')
    }

    const visibility =
        visibilityRaw === CalendarEntryVisibility.PUBLIC
            ? CalendarEntryVisibility.PUBLIC
            : CalendarEntryVisibility.PRIVATE

    return {
        title,
        description: description || null,
        dateStart,
        visibility,
        participantUserIds,
    }
}

export async function createCalendarEntryAction(formData: FormData) {
    const auth = await requireTenantManagerContext()
    let errorMessage: string | null = null
    let createdCalendarEntryId: string | null = null

    try {
        const input = readCalendarEntryFormData(formData)
        const calendarEntry = await createCalendarEntry(input, auth)

        createdCalendarEntryId = calendarEntry.id
        revalidatePath('/')
        revalidatePath('/events')
    } catch (error) {
        errorMessage =
            error instanceof Error
                ? error.message
                : 'Událost se nepodařilo vytvořit.'
    }

    if (errorMessage) {
        redirect(
            `/calendar-entries/new?error=${encodeURIComponent(errorMessage)}`
        )
    }

    redirect(`/calendar-entries/${createdCalendarEntryId}`)
}

type UpdateCalendarEntryActionArgs = {
    calendarEntryId: string
}

export async function updateCalendarEntryAction(
    args: UpdateCalendarEntryActionArgs,
    formData: FormData
) {
    const auth = await requireTenantManagerContext()
    let errorMessage: string | null = null

    try {
        const input = readCalendarEntryFormData(formData)

        await updateCalendarEntry(
            {
                id: args.calendarEntryId,
                ...input,
            },
            auth
        )

        revalidatePath('/')
        revalidatePath('/events')
        revalidatePath(`/calendar-entries/${args.calendarEntryId}`)
    } catch (error) {
        errorMessage =
            error instanceof Error
                ? error.message
                : 'Událost se nepodařilo upravit.'
    }

    if (errorMessage) {
        redirect(
            `/calendar-entries/${args.calendarEntryId}/edit?error=${encodeURIComponent(
                errorMessage
            )}`
        )
    }

    redirect(`/calendar-entries/${args.calendarEntryId}`)
}
