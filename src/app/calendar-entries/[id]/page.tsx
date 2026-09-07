import Link from 'next/link'
import { notFound } from 'next/navigation'
import Breadcrumbs from '@/components/navigation/Breadcrumbs'
import {
    canManageOwnedTenantData,
    isWorkerContext,
    requireAuthContext,
} from '@/lib/auth/current-user'
import { primaryButtonClass } from '@/lib/ui/styles'
import { getCalendarEntryById } from '@/modules/calendar-entries/calendar-entry.service'

type CalendarEntryDetailPageProps = {
    params: Promise<{
        id: string
    }>
}

function mapVisibilityToLabel(visibility: 'PRIVATE' | 'PUBLIC') {
    return visibility === 'PUBLIC' ? 'Veřejná' : 'Soukromá'
}

export default async function CalendarEntryDetailPage({
    params,
}: CalendarEntryDetailPageProps) {
    const { id } = await params
    const auth = await requireAuthContext()
    const calendarEntry = await getCalendarEntryById(id, auth)

    if (!calendarEntry) {
        notFound()
    }
    const canManageCalendarEntry =
        !isWorkerContext(auth) &&
        canManageOwnedTenantData(auth, calendarEntry.ownerUserId)

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
                ]}
            />

            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h1 className="text-3xl font-bold">{calendarEntry.title}</h1>
                    <p className="mt-2 text-sm text-gray-600">
                        Kalendářová událost
                    </p>
                </div>
                {canManageCalendarEntry ? (
                    <Link
                        href={`/calendar-entries/${calendarEntry.id}/edit`}
                        className={primaryButtonClass}
                    >
                        Upravit událost
                    </Link>
                ) : null}
            </div>

            <section className="mt-8 rounded-xl border p-4 sm:p-6">
                <h2 className="text-xl font-semibold">Detail události</h2>

                <dl className="mt-4 grid gap-4 sm:grid-cols-2">
                    <div>
                        <dt className="text-sm text-gray-500">Datum a čas</dt>
                        <dd className="mt-1">
                            {new Intl.DateTimeFormat('cs-CZ', {
                                dateStyle: 'medium',
                                timeStyle: 'short',
                            }).format(calendarEntry.dateStart)}
                        </dd>
                    </div>

                    <div>
                        <dt className="text-sm text-gray-500">Typ</dt>
                        <dd className="mt-1">
                            {mapVisibilityToLabel(calendarEntry.visibility)}
                        </dd>
                    </div>

                    <div>
                        <dt className="text-sm text-gray-500">Autor</dt>
                        <dd className="mt-1">
                            {calendarEntry.createdByUser.fullName}
                        </dd>
                    </div>
                </dl>

                <div className="mt-6">
                    <h3 className="text-sm text-gray-500">Popis</h3>
                    <p className="mt-1 whitespace-pre-wrap">
                        {calendarEntry.description ?? '—'}
                    </p>
                </div>
            </section>

            <section className="mt-8 rounded-xl border p-4 sm:p-6">
                <h2 className="text-xl font-semibold">Účastníci</h2>

                {calendarEntry.participants.length === 0 ? (
                    <p className="mt-4 text-sm text-gray-600">
                        Událost zatím nemá přiřazené účastníky.
                    </p>
                ) : (
                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                        {calendarEntry.participants.map((participant) => (
                            <article
                                key={participant.id}
                                className="rounded-lg border border-slate-200 bg-white p-4"
                            >
                                <h3 className="font-semibold">
                                    {participant.user.fullName}
                                </h3>
                                <p className="mt-1 break-words text-sm text-gray-600">
                                    {participant.user.email}
                                </p>
                            </article>
                        ))}
                    </div>
                )}
            </section>
        </main>
    )
}
