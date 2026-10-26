import { deleteEventAction } from './actions'
import { getCalendarEntries } from '@/modules/calendar-entries/calendar-entry.service'
import { getEvents } from '@/modules/events/event.service'
import { mapEventStatusToLabel } from '@/modules/events/event.utils'
import Link from 'next/link'
import ConfirmSubmitButton from '@/components/forms/ConfirmSubmitButton'
import Breadcrumbs from '@/components/navigation/Breadcrumbs'
import ClientSideListFilter from '@/components/filters/ClientSideListFilter'
import EventsMonthCalendar from '@/components/calendar/EventsMonthCalendar'
import {
    compactSecondaryButtonClass,
    primaryButtonClass,
} from '@/lib/ui/styles'
import {
    canManageOwnedTenantData,
    isWorkerContext,
    requireAuthContext,
} from '@/lib/auth/current-user'

export const dynamic = 'force-dynamic'

function getEventClientName(event: {
    client: {
        name: string
    } | null
    oneOffClientName: string | null
}) {
    return event.client?.name ?? event.oneOffClientName ?? '—'
}

function mapCalendarEntryVisibilityToLabel(visibility: 'PRIVATE' | 'PUBLIC') {
    return visibility === 'PUBLIC' ? 'Veřejná událost' : 'Soukromá událost'
}

type EventsPageProps = {
    searchParams: Promise<{
        error?: string
        success?: string
    }>
}

export default async function EventsPage({ searchParams }: EventsPageProps) {
    const { error, success } = await searchParams

    const auth = await requireAuthContext()
    const isWorker = isWorkerContext(auth)
    const [events, calendarEntries] = await Promise.all([
        getEvents(auth),
        getCalendarEntries(auth),
    ])
    const eventCalendarItems = events.map((event) => ({
        id: event.id,
        href: `/events/${event.id}`,
        kind: 'EVENT' as const,
        title: event.title,
        dateStart: event.dateStart.toISOString(),
        eyebrow: 'Akce',
        details: [
            {
                label: 'Stav',
                value: mapEventStatusToLabel(event.status),
            },
            {
                label: 'Místo',
                value: event.venueName ?? '—',
            },
            ...(!isWorker
                ? [
                      {
                          label: 'Klient',
                          value: getEventClientName(event),
                      },
                      {
                          label: 'Kontakt',
                          value: event.primaryContact
                              ? `${event.primaryContact.firstName} ${event.primaryContact.lastName}`
                              : '—',
                      },
                  ]
                : []),
        ],
    }))
    const calendarEntryItems = calendarEntries.map((calendarEntry) => ({
        id: calendarEntry.id,
        href: `/calendar-entries/${calendarEntry.id}`,
        kind: 'CALENDAR_ENTRY' as const,
        title: calendarEntry.title,
        dateStart: calendarEntry.dateStart.toISOString(),
        eyebrow: mapCalendarEntryVisibilityToLabel(calendarEntry.visibility),
        details: [
            {
                label: 'Autor',
                value: calendarEntry.createdByUser.fullName,
            },
            {
                label: 'Účastníci',
                value:
                    calendarEntry.participants.length > 0
                        ? calendarEntry.participants
                              .map((participant) => participant.user.fullName)
                              .join(', ')
                        : '—',
            },
            {
                label: 'Popis',
                value: calendarEntry.description ?? '—',
            },
        ],
    }))
    const calendarItems = [...eventCalendarItems, ...calendarEntryItems]

    return (
        <main className="mx-auto max-w-5xl p-4 sm:p-8">
            <Breadcrumbs
                items={[
                    { label: 'Domů', href: '/' },
                    { label: 'Akce a události', href: '/events' },
                ]}
            />

            <div>
                <h1 className="text-3xl font-bold">Akce a události</h1>
            </div>

            <EventsMonthCalendar items={calendarItems} />

            <section className="mt-8 rounded-xl border p-4 sm:p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <h2 className="text-xl font-semibold">Akce</h2>
                    {!isWorker ? (
                        <Link
                            href="/events/new"
                            className={primaryButtonClass}
                        >
                            Nová akce
                        </Link>
                    ) : null}
                </div>

                {error ? (
                    <p className="mt-4 rounded-md border border-red-500/40 px-4 py-3 text-sm text-red-300">
                        {error}
                    </p>
                ) : null}

                {success === 'AkceBylaVytvorena' ? (
                    <p className="mt-4 rounded-md border border-green-500/40 px-4 py-3 text-sm text-green-300">
                        Akce byla vytvořena.
                    </p>
                ) : null}

                {events.length === 0 ? (
                    <p className="mt-4 text-sm text-gray-600">
                        {isWorker
                            ? 'Nemáš přiřazené žádné akce.'
                            : 'Zatím nejsou vytvořené žádné akce.'}
                    </p>
                ) : (
                    <>
                    <ClientSideListFilter
                        listId="events"
                        placeholder={
                            isWorker
                                ? 'Hledat podle akce, stavu nebo místa...'
                                : 'Hledat podle akce, klienta, stavu nebo místa...'
                        }
                    />

                    <p
                        data-filter-empty="events"
                        hidden
                        className="mt-4 text-sm text-gray-600"
                    >
                        Žádná akce neodpovídá filtru.
                    </p>

                    <div data-filter-list="events" className="mt-4 grid gap-4 md:hidden">
                        {events.map((event) => {
                            const deleteEventFormAction = deleteEventAction.bind(null, {
                                eventId: event.id,
                            })
                            const canManageEvent = canManageOwnedTenantData(
                                auth,
                                event.ownerUserId
                            ) && !isWorker
                            const primaryContactName = !isWorker && event.primaryContact
                                ? `${event.primaryContact.firstName} ${event.primaryContact.lastName}`
                                : ''
                            const filterText = [
                                event.title,
                                event.eventType,
                                isWorker ? null : getEventClientName(event),
                                primaryContactName,
                                mapEventStatusToLabel(event.status),
                                event.venueName,
                                new Intl.DateTimeFormat('cs-CZ', {
                                    dateStyle: 'medium',
                                    timeStyle: 'short',
                                }).format(event.dateStart),
                            ]
                                .filter(Boolean)
                                .join(' ')

                            return (
                                <article
                                    key={event.id}
                                    data-filter-item
                                    data-filter-text={filterText}
                                    className="rounded-lg border border-slate-200 bg-white p-4"
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <h3 className="text-base font-semibold">
                                                <Link
                                                    href={`/events/${event.id}`}
                                                    className="underline underline-offset-4"
                                                >
                                                    {event.title}
                                                </Link>
                                            </h3>
                                            <p className="mt-1 text-sm text-gray-600">
                                                {mapEventStatusToLabel(event.status)}
                                            </p>
                                        </div>
                                    </div>

                                    <dl className="mt-4 grid gap-3 text-sm">
                                        <div>
                                            <dt className="font-medium text-gray-500">Typ</dt>
                                            <dd className="mt-1">{event.eventType}</dd>
                                        </div>
                                        <div>
                                            <dt className="font-medium text-gray-500">Datum</dt>
                                            <dd className="mt-1">
                                                {new Intl.DateTimeFormat('cs-CZ', {
                                                    dateStyle: 'medium',
                                                    timeStyle: 'short',
                                                }).format(event.dateStart)}
                                            </dd>
                                        </div>
                                        {!isWorker ? (
                                            <div>
                                                <dt className="font-medium text-gray-500">Klient</dt>
                                                <dd className="mt-1">
                                                    {event.client ? (
                                                        <Link
                                                            href={`/clients/${event.client.id}`}
                                                            className="underline underline-offset-4"
                                                        >
                                                            {event.client.name}
                                                        </Link>
                                                    ) : (
                                                        getEventClientName(event)
                                                    )}
                                                </dd>
                                            </div>
                                        ) : null}
                                        {!isWorker ? (
                                            <div>
                                                <dt className="font-medium text-gray-500">Kontakt</dt>
                                                <dd className="mt-1">
                                                    {event.primaryContact
                                                        ? `${event.primaryContact.firstName} ${event.primaryContact.lastName}`
                                                        : '—'}
                                                </dd>
                                            </div>
                                        ) : null}
                                        <div>
                                            <dt className="font-medium text-gray-500">Místo</dt>
                                            <dd className="mt-1">{event.venueName ?? '—'}</dd>
                                        </div>
                                    </dl>

                                    {canManageEvent ? (
                                        <div className="mt-4 flex flex-wrap items-center gap-2">
                                            <Link
                                                href={`/events/${event.id}/edit`}
                                                className={compactSecondaryButtonClass}
                                            >
                                                Upravit
                                            </Link>
                                            <form action={deleteEventFormAction}>
                                                <ConfirmSubmitButton
                                                    confirmMessage="Opravdu chceš smazat tuto událost?"
                                                    className={compactSecondaryButtonClass}
                                                >
                                                    Smazat
                                                </ConfirmSubmitButton>
                                            </form>
                                        </div>
                                    ) : null}
                                </article>
                            )
                        })}
                    </div>

                    <div data-filter-list="events" className="mt-4 hidden overflow-x-auto md:block">
                        <table className="min-w-full border-collapse">
                            <thead>
                                <tr className="border-b text-left">
                                    <th className="py-2 px-2">Název</th>
                                    <th className="py-2 px-2">Typ</th>
                                    <th className="py-2 px-2">Datum</th>
                                    {!isWorker ? (
                                        <th className="py-2 px-2">Klient</th>
                                    ) : null}
                                    {!isWorker ? (
                                        <th className="py-2 px-2">Kontakt</th>
                                    ) : null}
                                    <th className="py-2 px-2">Stav</th>
                                    <th className="py-2 px-2">Místo</th>
                                    <th className="py-2 px-2 whitespace-nowrap">Akce</th>
                                </tr>
                            </thead>
                            <tbody>
                                {events.map((event) => {
                                    const deleteEventFormAction = deleteEventAction.bind(null, {
                                        eventId: event.id,
                                    })
                                    const canManageEvent = canManageOwnedTenantData(
                                        auth,
                                        event.ownerUserId
                                    ) && !isWorker
                                    const primaryContactName = !isWorker && event.primaryContact
                                        ? `${event.primaryContact.firstName} ${event.primaryContact.lastName}`
                                        : ''
                                    const filterText = [
                                        event.title,
                                        event.eventType,
                                        isWorker ? null : getEventClientName(event),
                                        primaryContactName,
                                        mapEventStatusToLabel(event.status),
                                        event.venueName,
                                        new Intl.DateTimeFormat('cs-CZ', {
                                            dateStyle: 'medium',
                                            timeStyle: 'short',
                                        }).format(event.dateStart),
                                    ]
                                        .filter(Boolean)
                                        .join(' ')

                                    return (
                                        <tr
                                            key={event.id}
                                            data-filter-item
                                            data-filter-text={filterText}
                                            className="border-b"
                                        >
                                            <td className="py-2 px-2">
                                                <Link
                                                    href={`/events/${event.id}`}
                                                    className="underline underline-offset-4"
                                                >
                                                    {event.title}
                                                </Link>
                                            </td>
                                            <td className="py-2 px-2">{event.eventType}</td>
                                            <td className="py-2 px-2">
                                                {new Intl.DateTimeFormat('cs-CZ', {
                                                    dateStyle: 'medium',
                                                    timeStyle: 'short',
                                                }).format(event.dateStart)}
                                            </td>
                                            {!isWorker ? (
                                                <td className="py-2 px-2">
                                                    {event.client ? (
                                                        <Link
                                                            href={`/clients/${event.client.id}`}
                                                            className="underline underline-offset-4"
                                                        >
                                                            {event.client.name}
                                                        </Link>
                                                    ) : (
                                                        getEventClientName(event)
                                                    )}
                                                </td>
                                            ) : null}
                                            {!isWorker ? (
                                                <td className="py-2 px-2">
                                                    {event.primaryContact
                                                        ? `${event.primaryContact.firstName} ${event.primaryContact.lastName}`
                                                        : '—'}
                                                </td>
                                            ) : null}
                                            <td className="py-2 px-2">
                                                {mapEventStatusToLabel(event.status)}
                                            </td>
                                            <td className="py-2 px-2">{event.venueName ?? '—'}</td>
                                            <td className="py-2 px-2 whitespace-nowrap">
                                                {canManageEvent ? (
                                                    <div className="flex items-center gap-2">
                                                        <Link
                                                            href={`/events/${event.id}/edit`}
                                                            className={compactSecondaryButtonClass}
                                                        >
                                                            Upravit
                                                        </Link>
                                                        <form action={deleteEventFormAction}>
                                                            <ConfirmSubmitButton
                                                                confirmMessage="Opravdu chceš smazat tuto událost?"
                                                                className={compactSecondaryButtonClass}
                                                            >
                                                                Smazat
                                                            </ConfirmSubmitButton>
                                                        </form>
                                                    </div>
                                                ) : (
                                                    '—'
                                                )}
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                    </>
                )}
            </section>

            <section className="mt-8 rounded-xl border p-4 sm:p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <h2 className="text-xl font-semibold">Události</h2>
                    {!isWorker ? (
                        <Link
                            href="/calendar-entries/new"
                            className={primaryButtonClass}
                        >
                            Nová událost
                        </Link>
                    ) : null}
                </div>

                {calendarEntries.length === 0 ? (
                    <p className="mt-4 text-sm text-gray-600">
                        Zatím tu nejsou žádné viditelné události.
                    </p>
                ) : (
                    <>
                    <ClientSideListFilter
                        listId="calendar-entries"
                        placeholder="Hledat podle události, typu, autora nebo účastníků..."
                    />

                    <p
                        data-filter-empty="calendar-entries"
                        hidden
                        className="mt-4 text-sm text-gray-600"
                    >
                        Žádná událost neodpovídá filtru.
                    </p>

                    <div data-filter-list="calendar-entries" className="mt-4 grid gap-4 md:hidden">
                        {calendarEntries.map((calendarEntry) => {
                            const participantNames = calendarEntry.participants
                                .map((participant) => participant.user.fullName)
                                .join(', ')
                            const visibilityLabel = mapCalendarEntryVisibilityToLabel(
                                calendarEntry.visibility
                            )
                            const filterText = [
                                calendarEntry.title,
                                visibilityLabel,
                                calendarEntry.createdByUser.fullName,
                                participantNames,
                                calendarEntry.description,
                                new Intl.DateTimeFormat('cs-CZ', {
                                    dateStyle: 'medium',
                                    timeStyle: 'short',
                                }).format(calendarEntry.dateStart),
                            ]
                                .filter(Boolean)
                                .join(' ')
                            const canManageCalendarEntry =
                                canManageOwnedTenantData(
                                    auth,
                                    calendarEntry.ownerUserId
                                ) && !isWorker

                            return (
                                <article
                                    key={calendarEntry.id}
                                    data-filter-item
                                    data-filter-text={filterText}
                                    className="rounded-lg border border-slate-200 bg-white p-4"
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <h3 className="text-base font-semibold">
                                                <Link
                                                    href={`/calendar-entries/${calendarEntry.id}`}
                                                    className="underline underline-offset-4"
                                                >
                                                    {calendarEntry.title}
                                                </Link>
                                            </h3>
                                            <p className="mt-1 text-sm text-gray-600">
                                                {visibilityLabel}
                                            </p>
                                        </div>
                                    </div>

                                    <dl className="mt-4 grid gap-3 text-sm">
                                        <div>
                                            <dt className="font-medium text-gray-500">Datum</dt>
                                            <dd className="mt-1">
                                                {new Intl.DateTimeFormat('cs-CZ', {
                                                    dateStyle: 'medium',
                                                    timeStyle: 'short',
                                                }).format(calendarEntry.dateStart)}
                                            </dd>
                                        </div>
                                        <div>
                                            <dt className="font-medium text-gray-500">Autor</dt>
                                            <dd className="mt-1">
                                                {calendarEntry.createdByUser.fullName}
                                            </dd>
                                        </div>
                                        <div>
                                            <dt className="font-medium text-gray-500">
                                                Účastníci
                                            </dt>
                                            <dd className="mt-1">{participantNames || '—'}</dd>
                                        </div>
                                    </dl>

                                    <div className="mt-4 flex flex-wrap items-center gap-2">
                                        <Link
                                            href={`/calendar-entries/${calendarEntry.id}`}
                                            className={compactSecondaryButtonClass}
                                        >
                                            Detail
                                        </Link>
                                        {canManageCalendarEntry ? (
                                            <Link
                                                href={`/calendar-entries/${calendarEntry.id}/edit`}
                                                className={compactSecondaryButtonClass}
                                            >
                                                Upravit
                                            </Link>
                                        ) : null}
                                    </div>
                                </article>
                            )
                        })}
                    </div>

                    <div data-filter-list="calendar-entries" className="mt-4 hidden overflow-x-auto md:block">
                        <table className="min-w-full border-collapse">
                            <thead>
                                <tr className="border-b text-left">
                                    <th className="py-2 px-2">Datum</th>
                                    <th className="py-2 px-2">Název</th>
                                    <th className="py-2 px-2">Typ</th>
                                    <th className="py-2 px-2">Autor</th>
                                    <th className="py-2 px-2">Účastníci</th>
                                    <th className="py-2 px-2 whitespace-nowrap">Akce</th>
                                </tr>
                            </thead>
                            <tbody>
                                {calendarEntries.map((calendarEntry) => {
                                    const participantNames = calendarEntry.participants
                                        .map((participant) => participant.user.fullName)
                                        .join(', ')
                                    const visibilityLabel =
                                        mapCalendarEntryVisibilityToLabel(
                                            calendarEntry.visibility
                                        )
                                    const filterText = [
                                        calendarEntry.title,
                                        visibilityLabel,
                                        calendarEntry.createdByUser.fullName,
                                        participantNames,
                                        calendarEntry.description,
                                        new Intl.DateTimeFormat('cs-CZ', {
                                            dateStyle: 'medium',
                                            timeStyle: 'short',
                                        }).format(calendarEntry.dateStart),
                                    ]
                                        .filter(Boolean)
                                        .join(' ')
                                    const canManageCalendarEntry =
                                        canManageOwnedTenantData(
                                            auth,
                                            calendarEntry.ownerUserId
                                        ) && !isWorker

                                    return (
                                        <tr
                                            key={calendarEntry.id}
                                            data-filter-item
                                            data-filter-text={filterText}
                                            className="border-b"
                                        >
                                            <td className="whitespace-nowrap py-2 px-2">
                                                {new Intl.DateTimeFormat('cs-CZ', {
                                                    dateStyle: 'medium',
                                                    timeStyle: 'short',
                                                }).format(calendarEntry.dateStart)}
                                            </td>
                                            <td className="py-2 px-2">
                                                <Link
                                                    href={`/calendar-entries/${calendarEntry.id}`}
                                                    className="underline underline-offset-4"
                                                >
                                                    {calendarEntry.title}
                                                </Link>
                                            </td>
                                            <td className="py-2 px-2">
                                                {visibilityLabel}
                                            </td>
                                            <td className="py-2 px-2">
                                                {calendarEntry.createdByUser.fullName}
                                            </td>
                                            <td className="py-2 px-2">
                                                {participantNames || '—'}
                                            </td>
                                            <td className="py-2 px-2 whitespace-nowrap">
                                                <div className="flex items-center gap-2">
                                                    <Link
                                                        href={`/calendar-entries/${calendarEntry.id}`}
                                                        className={compactSecondaryButtonClass}
                                                    >
                                                        Detail
                                                    </Link>
                                                    {canManageCalendarEntry ? (
                                                        <Link
                                                            href={`/calendar-entries/${calendarEntry.id}/edit`}
                                                            className={compactSecondaryButtonClass}
                                                        >
                                                            Upravit
                                                        </Link>
                                                    ) : null}
                                                </div>
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                    </>
                )}
            </section>
        </main>
    )
}
