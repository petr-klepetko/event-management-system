import { buttonClass, inputClass, optionClass } from '@/lib/ui/styles'
import { createEventAction, deleteEventAction } from './actions'
import { getEventFormOptions, getEvents } from '@/modules/events/event.service'
import { mapEventStatusToLabel } from '@/modules/events/event.utils'
import Link from 'next/link'
import ConfirmSubmitButton from '@/components/forms/ConfirmSubmitButton'
import Breadcrumbs from '@/components/navigation/Breadcrumbs'

export const dynamic = 'force-dynamic'

type EventsPageProps = {
    searchParams: Promise<{
        error?: string
        success?: string
    }>
}

export default async function EventsPage({ searchParams }: EventsPageProps) {
    const { error, success } = await searchParams

    const [events, formOptions] = await Promise.all([
        getEvents(),
        getEventFormOptions(),
    ])

    return (
        <main className="mx-auto max-w-5xl p-8">
            <Breadcrumbs
                items={[
                    { label: 'Domů', href: '/' },
                    { label: 'Akce', href: '/events' },
                ]}
            />

            <div>
                <h1 className="text-3xl font-bold">Akce</h1>
            </div>

            <section className="mt-8 rounded-xl border p-6">
                <h2 className="text-xl font-semibold">Seznam akcí</h2>

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
                    <div className="mt-4 overflow-x-auto">
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
                                    <th className="py-2 pr-4">Akce</th>
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
                                            <td className="py-2 pr-4">
                                                <form action={deleteEventFormAction}>
                                                    <ConfirmSubmitButton
                                                        confirmMessage="Opravdu chceš smazat tuto událost?"
                                                        className="rounded-md border px-3 py-1 text-sm font-medium cursor-pointer hover:bg-white/10 transition-colors"
                                                    >
                                                        Smazat
                                                    </ConfirmSubmitButton>
                                                </form>
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>

            <section className="mt-8 rounded-xl border p-6">
                <h2 className="text-xl font-semibold">Vytvořit akci</h2>

                <form action={createEventAction} className="mt-4 grid gap-4">
                    <div className="grid gap-2">
                        <label htmlFor="title" className="font-medium">
                            Název
                        </label>
                        <input
                            id="title"
                            name="title"
                            type="text"
                            required
                            className={inputClass}
                            placeholder="Maturitní ples 4.A"
                        />
                    </div>

                    <div className="grid gap-2 sm:grid-cols-2">
                        <div className="grid gap-2">
                            <label htmlFor="eventType" className="font-medium">
                                Typ akce
                            </label>
                            <input
                                id="eventType"
                                name="eventType"
                                type="text"
                                required
                                className={inputClass}
                                placeholder="Maturitní ples"
                            />
                        </div>

                        <div className="grid gap-2">
                            <label htmlFor="dateStart" className="font-medium">
                                Datum a čas
                            </label>
                            <input
                                id="dateStart"
                                name="dateStart"
                                type="datetime-local"
                                required
                                className={inputClass}
                            />
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <label htmlFor="venueName" className="font-medium">
                            Místo
                        </label>
                        <input
                            id="venueName"
                            name="venueName"
                            type="text"
                            className={inputClass}
                            placeholder="Kulturní dům Brno"
                        />
                    </div>

                    <div className="grid gap-2 sm:grid-cols-2">
                        <div className="grid gap-2">
                            <label htmlFor="clientId" className="font-medium">
                                Klient
                            </label>
                            <select
                                id="clientId"
                                name="clientId"
                                required
                                defaultValue=""
                                className={inputClass}
                            >
                                <option className={optionClass} value="" disabled>
                                    Vyber klienta
                                </option>
                                {formOptions.clients.map((client) => (
                                    <option className={optionClass} key={client.id} value={client.id}>
                                        {client.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="grid gap-2">
                            <label htmlFor="primaryContactId" className="font-medium">
                                Hlavní kontakt
                            </label>
                            <select
                                id="primaryContactId"
                                name="primaryContactId"
                                defaultValue=""
                                className={inputClass}
                            >
                                <option className={optionClass} value="">Bez vybraného kontaktu</option>
                                {formOptions.contacts.map((contact) => (
                                    <option className={optionClass} key={contact.id} value={contact.id}>
                                        {contact.firstName} {contact.lastName} ({contact.client.name})
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <label htmlFor="internalNote" className="font-medium">
                            Interní poznámka
                        </label>
                        <textarea
                            id="internalNote"
                            name="internalNote"
                            rows={4}
                            className={inputClass}
                            placeholder="Technické poznámky, interní info..."
                        />
                    </div>

                    <button
                        type="submit"
                        className={buttonClass}
                    >
                        Vytvořit akci
                    </button>
                </form>
            </section>
        </main>
    )
}
