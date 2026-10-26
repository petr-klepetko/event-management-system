import { notFound } from 'next/navigation'
import Breadcrumbs from '@/components/navigation/Breadcrumbs'
import CalendarEntryForm from '@/components/forms/CalendarEntryForm'
import { requireTenantManagerContext } from '@/lib/auth/current-user'
import {
    getCalendarEntryById,
    getCalendarEntryFormOptionsForTenant,
} from '@/modules/calendar-entries/calendar-entry.service'
import { updateCalendarEntryAction } from '../../actions'

type EditCalendarEntryPageProps = {
    params: Promise<{
        id: string
    }>
    searchParams: Promise<{
        error?: string
    }>
}

export default async function EditCalendarEntryPage({
    params,
    searchParams,
}: EditCalendarEntryPageProps) {
    const { id } = await params
    const { error } = await searchParams
    const auth = await requireTenantManagerContext()
    const calendarEntry = await getCalendarEntryById(id, auth)

    if (!calendarEntry) {
        notFound()
    }

    const { users } = await getCalendarEntryFormOptionsForTenant(
        calendarEntry.tenantId,
        auth
    )
    const updateAction = updateCalendarEntryAction.bind(null, {
        calendarEntryId: calendarEntry.id,
    })

    return (
        <main className="mx-auto max-w-4xl p-4 sm:p-8">
            <Breadcrumbs
                items={[
                    { label: 'Domů', href: '/' },
                    { label: 'Akce a události', href: '/events' },
                    {
                        label: calendarEntry.title,
                        href: `/calendar-entries/${calendarEntry.id}`,
                    },
                    {
                        label: 'Upravit událost',
                        href: `/calendar-entries/${calendarEntry.id}/edit`,
                    },
                ]}
            />

            <div>
                <h1 className="text-3xl font-bold">Upravit událost</h1>
                <p className="mt-2 text-sm text-gray-600">
                    Kalendářový záznam mimo běžnou akci.
                </p>
            </div>

            <section className="mt-8 rounded-xl border p-4 sm:p-6">
                <h2 className="text-xl font-semibold">Základní údaje</h2>

                {error ? (
                    <p className="mt-4 rounded-md border border-red-500/40 px-4 py-3 text-sm text-red-300">
                        {error}
                    </p>
                ) : null}

                <CalendarEntryForm
                    action={updateAction}
                    buttonLabel="Uložit změny"
                    storageKey={`calendar-entry-form:edit:${calendarEntry.id}`}
                    users={users}
                    defaultValues={{
                        title: calendarEntry.title,
                        description: calendarEntry.description,
                        visibility: calendarEntry.visibility,
                        dateStart: calendarEntry.dateStart,
                        participantUserIds: calendarEntry.participants.map(
                            (participant) => participant.userId
                        ),
                    }}
                />
            </section>
        </main>
    )
}
