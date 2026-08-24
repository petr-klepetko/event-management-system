import { deleteEventAction } from './actions'
import { getEvents } from '@/modules/events/event.service'
import { mapEventStatusToLabel } from '@/modules/events/event.utils'
import Link from 'next/link'
import ConfirmSubmitButton from '@/components/forms/ConfirmSubmitButton'
import Breadcrumbs from '@/components/navigation/Breadcrumbs'
import {
    compactSecondaryButtonClass,
    primaryButtonClass,
} from '@/lib/ui/styles'
import { requireAuthContext } from '@/lib/auth/current-user'

export const dynamic = 'force-dynamic'

type EventsPageProps = {
    searchParams: Promise<{
        error?: string
        success?: string
    }>
}

export default async function EventsPage({ searchParams }: EventsPageProps) {
    const { error, success } = await searchParams

    const auth = await requireAuthContext()
    const events = await getEvents(auth)

    return (
        <main className="mx-auto max-w-5xl p-4 sm:p-8">
            <Breadcrumbs
                items={[
                    { label: 'Domů', href: '/' },
                    { label: 'Akce', href: '/events' },
                ]}
            />

            <div>
                <h1 className="text-3xl font-bold">Akce</h1>
            </div>

            <section className="mt-8 rounded-xl border p-4 sm:p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <h2 className="text-xl font-semibold">Seznam akcí</h2>
                    <Link
                        href="/events/new"
                        className={primaryButtonClass}
                    >
                        Nová akce
                    </Link>
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
                    <p className="mt-4 text-sm text-gray-600">Zatím nejsou vytvořené žádné akce.</p>
                ) : (
                    <>
                    <div className="mt-4 grid gap-4 md:hidden">
                        {events.map((event) => {
                            const deleteEventFormAction = deleteEventAction.bind(null, {
                                eventId: event.id,
                            })

                            return (
                                <article
                                    key={event.id}
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
                                        <div>
                                            <dt className="font-medium text-gray-500">Klient</dt>
                                            <dd className="mt-1">
                                                <Link
                                                    href={`/clients/${event.client.id}`}
                                                    className="underline underline-offset-4"
                                                >
                                                    {event.client.name}
                                                </Link>
                                            </dd>
                                        </div>
                                        <div>
                                            <dt className="font-medium text-gray-500">Kontakt</dt>
                                            <dd className="mt-1">
                                                {event.primaryContact
                                                    ? `${event.primaryContact.firstName} ${event.primaryContact.lastName}`
                                                    : '—'}
                                            </dd>
                                        </div>
                                        <div>
                                            <dt className="font-medium text-gray-500">Místo</dt>
                                            <dd className="mt-1">{event.venueName ?? '—'}</dd>
                                        </div>
                                    </dl>

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
                                </article>
                            )
                        })}
                    </div>

                    <div className="mt-4 hidden overflow-x-auto md:block">
                        <table className="min-w-full border-collapse">
                            <thead>
                                <tr className="border-b text-left">
                                    <th className="py-2 pr-4">Název</th>
                                    <th className="py-2 pr-4">Typ</th>
                                    <th className="py-2 pr-4">Datum</th>
                                    <th className="py-2 pr-4">Klient</th>
                                    <th className="py-2 pr-4">Kontakt</th>
                                    <th className="py-2 pr-4">Stav</th>
                                    <th className="py-2 pr-4">Místo</th>
                                    <th className="py-2 pr-4 whitespace-nowrap">Akce</th>
                                </tr>
                            </thead>
                            <tbody>
                                {events.map((event) => {
                                    const deleteEventFormAction = deleteEventAction.bind(null, {
                                        eventId: event.id,
                                    })

                                    return (
                                        <tr key={event.id} className="border-b">
                                            <td className="py-2 pr-4">
                                                <Link
                                                    href={`/events/${event.id}`}
                                                    className="underline underline-offset-4"
                                                >
                                                    {event.title}
                                                </Link>
                                            </td>
                                            <td className="py-2 pr-4">{event.eventType}</td>
                                            <td className="py-2 pr-4">
                                                {new Intl.DateTimeFormat('cs-CZ', {
                                                    dateStyle: 'medium',
                                                    timeStyle: 'short',
                                                }).format(event.dateStart)}
                                            </td>
                                            <td className="py-2 pr-4">
                                                <Link
                                                    href={`/clients/${event.client.id}`}
                                                    className="underline underline-offset-4"
                                                >
                                                    {event.client.name}
                                                </Link>
                                            </td>
                                            <td className="py-2 pr-4">
                                                {event.primaryContact
                                                    ? `${event.primaryContact.firstName} ${event.primaryContact.lastName}`
                                                    : '—'}
                                            </td>
                                            <td className="py-2 pr-4">
                                                {mapEventStatusToLabel(event.status)}
                                            </td>
                                            <td className="py-2 pr-4">{event.venueName ?? '—'}</td>
                                            <td className="py-2 pr-4 whitespace-nowrap">
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
