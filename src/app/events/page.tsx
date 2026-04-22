import { createEventAction } from './actions'
import { getEventFormOptions, getEvents } from '@/modules/events/event.service'

export default async function EventsPage() {
    const [events, formOptions] = await Promise.all([
        getEvents(),
        getEventFormOptions(),
    ])

    return (
        <main className="mx-auto max-w-5xl p-8">
            <h1 className="text-3xl font-bold">Events</h1>

            <section className="mt-8 rounded-xl border p-6">
                <h2 className="text-xl font-semibold">Create event</h2>

                <form action={createEventAction} className="mt-4 grid gap-4">
                    <div className="grid gap-2">
                        <label htmlFor="title" className="font-medium">
                            Title
                        </label>
                        <input
                            id="title"
                            name="title"
                            type="text"
                            required
                            className="rounded-md border px-3 py-2"
                            placeholder="Maturitní ples 4.A"
                        />
                    </div>

                    <div className="grid gap-2 sm:grid-cols-2">
                        <div className="grid gap-2">
                            <label htmlFor="eventType" className="font-medium">
                                Event type
                            </label>
                            <input
                                id="eventType"
                                name="eventType"
                                type="text"
                                required
                                className="rounded-md border px-3 py-2"
                                placeholder="Maturitní ples"
                            />
                        </div>

                        <div className="grid gap-2">
                            <label htmlFor="dateStart" className="font-medium">
                                Event date and time
                            </label>
                            <input
                                id="dateStart"
                                name="dateStart"
                                type="datetime-local"
                                required
                                className="rounded-md border px-3 py-2"
                            />
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <label htmlFor="venueName" className="font-medium">
                            Venue
                        </label>
                        <input
                            id="venueName"
                            name="venueName"
                            type="text"
                            className="rounded-md border px-3 py-2"
                            placeholder="Kulturní dům Brno"
                        />
                    </div>

                    <div className="grid gap-2 sm:grid-cols-2">
                        <div className="grid gap-2">
                            <label htmlFor="clientId" className="font-medium">
                                Client
                            </label>
                            <select
                                id="clientId"
                                name="clientId"
                                required
                                defaultValue=""
                                className="rounded-md border px-3 py-2"
                            >
                                <option value="" disabled>
                                    Select client
                                </option>
                                {formOptions.clients.map((client) => (
                                    <option key={client.id} value={client.id}>
                                        {client.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="grid gap-2">
                            <label htmlFor="primaryContactId" className="font-medium">
                                Primary contact
                            </label>
                            <select
                                id="primaryContactId"
                                name="primaryContactId"
                                defaultValue=""
                                className="rounded-md border px-3 py-2"
                            >
                                <option value="">No contact selected</option>
                                {formOptions.contacts.map((contact) => (
                                    <option key={contact.id} value={contact.id}>
                                        {contact.firstName} {contact.lastName} ({contact.client.name})
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <label htmlFor="internalNote" className="font-medium">
                            Internal note
                        </label>
                        <textarea
                            id="internalNote"
                            name="internalNote"
                            rows={4}
                            className="rounded-md border px-3 py-2"
                            placeholder="Technické poznámky, interní info..."
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-fit rounded-md border px-4 py-2 font-medium"
                    >
                        Create event
                    </button>
                </form>
            </section>

            <section className="mt-8 rounded-xl border p-6">
                <h2 className="text-xl font-semibold">Event list</h2>

                {events.length === 0 ? (
                    <p className="mt-4 text-sm text-gray-600">No events yet.</p>
                ) : (
                    <div className="mt-4 overflow-x-auto">
                        <table className="min-w-full border-collapse">
                            <thead>
                                <tr className="border-b text-left">
                                    <th className="py-2 pr-4">Title</th>
                                    <th className="py-2 pr-4">Type</th>
                                    <th className="py-2 pr-4">Date</th>
                                    <th className="py-2 pr-4">Client</th>
                                    <th className="py-2 pr-4">Contact</th>
                                    <th className="py-2 pr-4">Status</th>
                                    <th className="py-2 pr-4">Venue</th>
                                </tr>
                            </thead>
                            <tbody>
                                {events.map((event) => (
                                    <tr key={event.id} className="border-b">
                                        <td className="py-2 pr-4">{event.title}</td>
                                        <td className="py-2 pr-4">{event.eventType}</td>
                                        <td className="py-2 pr-4">
                                            {new Intl.DateTimeFormat('cs-CZ', {
                                                dateStyle: 'medium',
                                                timeStyle: 'short',
                                            }).format(event.dateStart)}
                                        </td>
                                        <td className="py-2 pr-4">{event.client.name}</td>
                                        <td className="py-2 pr-4">
                                            {event.primaryContact
                                                ? `${event.primaryContact.firstName} ${event.primaryContact.lastName}`
                                                : '—'}
                                        </td>
                                        <td className="py-2 pr-4">{event.status}</td>
                                        <td className="py-2 pr-4">{event.venueName ?? '—'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>
        </main>
    )
}