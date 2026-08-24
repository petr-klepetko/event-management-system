import Breadcrumbs from '@/components/navigation/Breadcrumbs'
import { buttonClass, inputClass, optionClass } from '@/lib/ui/styles'
import { getEventFormOptions } from '@/modules/events/event.service'
import { createEventAction } from '../actions'
import { requireAuthContext } from '@/lib/auth/current-user'

type NewEventPageProps = {
    searchParams: Promise<{
        error?: string
    }>
}

export default async function NewEventPage({
    searchParams,
}: NewEventPageProps) {
    const { error } = await searchParams
    const auth = await requireAuthContext()
    const formOptions = await getEventFormOptions(auth)

    return (
        <main className="mx-auto max-w-4xl p-8">
            <Breadcrumbs
                items={[
                    { label: 'Domů', href: '/' },
                    { label: 'Akce', href: '/events' },
                    { label: 'Nová akce', href: '/events/new' },
                ]}
            />

            <div>
                <h1 className="text-3xl font-bold">Nová akce</h1>
            </div>

            <section className="mt-8 rounded-xl border p-6">
                <h2 className="text-xl font-semibold">Základní údaje</h2>

                {error ? (
                    <p className="mt-4 rounded-md border border-red-500/40 px-4 py-3 text-sm text-red-300">
                        {error}
                    </p>
                ) : null}

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
                                    <option
                                        className={optionClass}
                                        key={client.id}
                                        value={client.id}
                                    >
                                        {client.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="grid gap-2">
                            <label
                                htmlFor="primaryContactId"
                                className="font-medium"
                            >
                                Hlavní kontakt
                            </label>
                            <select
                                id="primaryContactId"
                                name="primaryContactId"
                                defaultValue=""
                                className={inputClass}
                            >
                                <option className={optionClass} value="">
                                    Bez vybraného kontaktu
                                </option>
                                {formOptions.contacts.map((contact) => (
                                    <option
                                        className={optionClass}
                                        key={contact.id}
                                        value={contact.id}
                                    >
                                        {contact.firstName} {contact.lastName} (
                                        {contact.client.name})
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

                    <button type="submit" className={buttonClass}>
                        Vytvořit akci
                    </button>
                </form>
            </section>
        </main>
    )
}
