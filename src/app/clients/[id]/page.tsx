import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getClientById } from '@/modules/clients/client.service'
import { mapClientTypeToLabel } from '@/modules/clients/client.utils'
import { mapEventStatusToLabel } from '@/modules/events/event.utils'
import { createContactAction } from './actions'
import { buttonClass, inputClass } from '@/lib/ui/styles'
import Breadcrumbs from '@/components/navigation/Breadcrumbs'

type ClientDetailPageProps = {
    params: Promise<{
        id: string
    }>
    searchParams: Promise<{
        error?: string
        success?: string
    }>
}

export default async function ClientDetailPage({
    params,
    searchParams,
}: ClientDetailPageProps) {
    const { id } = await params
    const { error, success } = await searchParams

    const client = await getClientById(id)

    if (!client) {
        notFound()
    }

    const createContactForClient = createContactAction.bind(null, {
        clientId: client.id,
    })

    return (
        <main className="mx-auto max-w-4xl p-8">
            <Breadcrumbs
                items={[
                    { label: 'Domů', href: '/' },
                    { label: 'Klienti', href: '/clients' },
                    { label: client.name, href: `/clients/${client.id}` },
                ]}
            />

            <div>
                <h1 className="text-3xl font-bold">{client.name}</h1>
            </div>

            <section className="mt-8 rounded-xl border p-6">
                <h2 className="text-xl font-semibold">Detail klienta</h2>

                <dl className="mt-4 grid gap-4 sm:grid-cols-2">
                    <div>
                        <dt className="text-sm text-gray-500">Typ</dt>
                        <dd className="mt-1">{mapClientTypeToLabel(client.type)}</dd>
                    </div>

                    <div>
                        <dt className="text-sm text-gray-500">IČO</dt>
                        <dd className="mt-1">{client.ico ?? '—'}</dd>
                    </div>

                    <div>
                        <dt className="text-sm text-gray-500">DIČ</dt>
                        <dd className="mt-1">{client.dic ?? '—'}</dd>
                    </div>

                    <div>
                        <dt className="text-sm text-gray-500">Město</dt>
                        <dd className="mt-1">{client.city ?? '—'}</dd>
                    </div>

                    <div>
                        <dt className="text-sm text-gray-500">Země</dt>
                        <dd className="mt-1">{client.country ?? '—'}</dd>
                    </div>

                    <div>
                        <dt className="text-sm text-gray-500">Vytvořeno</dt>
                        <dd className="mt-1">
                            {new Intl.DateTimeFormat('cs-CZ', {
                                dateStyle: 'medium',
                                timeStyle: 'short',
                            }).format(client.createdAt)}
                        </dd>
                    </div>
                </dl>
            </section>

            <section className="mt-8 rounded-xl border p-6">
                <h2 className="text-xl font-semibold">Akce klienta</h2>

                {client.events.length === 0 ? (
                    <p className="mt-4 text-sm text-gray-600">
                        Tento klient zatím nemá žádné akce.
                    </p>
                ) : (
                    <div className="mt-4 overflow-x-auto">
                        <table className="min-w-full border-collapse">
                            <thead>
                                <tr className="border-b text-left">
                                    <th className="py-2 pr-4">Název</th>
                                    <th className="py-2 pr-4">Typ</th>
                                    <th className="py-2 pr-4">Datum</th>
                                    <th className="py-2 pr-4">Stav</th>
                                    <th className="py-2 pr-4">Místo</th>
                                </tr>
                            </thead>
                            <tbody>
                                {client.events.map((event) => (
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
                                            {mapEventStatusToLabel(event.status)}
                                        </td>
                                        <td className="py-2 pr-4">{event.venueName ?? '—'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>

            <section className="mt-8 rounded-xl border p-6">
                <h2 className="text-xl font-semibold">Kontakty</h2>

                {error ? (
                    <p className="mt-4 rounded-md border border-red-500/40 px-4 py-3 text-sm text-red-300">
                        {error}
                    </p>
                ) : null}

                {success === 'KontaktBylPridan' ? (
                    <p className="mt-4 rounded-md border border-green-500/40 px-4 py-3 text-sm text-green-300">
                        Kontakt byl přidán.
                    </p>
                ) : null}

                {client.contacts.length === 0 ? (
                    <p className="mt-4 text-sm text-gray-600">
                        Tento klient zatím nemá žádné kontakty.
                    </p>
                ) : (
                    <div className="mt-4 overflow-x-auto">
                        <table className="min-w-full border-collapse">
                            <thead>
                                <tr className="border-b text-left">
                                    <th className="py-2 pr-4">Jméno</th>
                                    <th className="py-2 pr-4">Email</th>
                                    <th className="py-2 pr-4">Telefon</th>
                                    <th className="py-2 pr-4">Role</th>
                                    <th className="py-2 pr-4">Hlavní</th>
                                </tr>
                            </thead>
                            <tbody>
                                {client.contacts.map((contact) => (
                                    <tr key={contact.id} className="border-b">
                                        <td className="py-2 pr-4">
                                            {contact.firstName} {contact.lastName}
                                        </td>
                                        <td className="py-2 pr-4">{contact.email ?? '—'}</td>
                                        <td className="py-2 pr-4">{contact.phone ?? '—'}</td>
                                        <td className="py-2 pr-4">{contact.roleLabel ?? '—'}</td>
                                        <td className="py-2 pr-4">{contact.isPrimary ? 'Ano' : '—'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>

            <section className="mt-8 rounded-xl border p-6">
                <h2 className="text-xl font-semibold">Přidat kontakt</h2>

                <form action={createContactForClient} className="mt-4 grid gap-4">
                    <div className="grid gap-2 sm:grid-cols-2">
                        <div className="grid gap-2">
                            <label htmlFor="firstName" className="font-medium">
                                Jméno
                            </label>
                            <input
                                id="firstName"
                                name="firstName"
                                type="text"
                                required
                                className={inputClass}
                                placeholder="Jan"
                            />
                        </div>

                        <div className="grid gap-2">
                            <label htmlFor="lastName" className="font-medium">
                                Příjmení
                            </label>
                            <input
                                id="lastName"
                                name="lastName"
                                type="text"
                                required
                                className={inputClass}
                                placeholder="Novák"
                            />
                        </div>
                    </div>

                    <div className="grid gap-2 sm:grid-cols-2">
                        <div className="grid gap-2">
                            <label htmlFor="email" className="font-medium">
                                Email
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                className={inputClass}
                                placeholder="jan.novak@example.com"
                            />
                        </div>

                        <div className="grid gap-2">
                            <label htmlFor="phone" className="font-medium">
                                Telefon
                            </label>
                            <input
                                id="phone"
                                name="phone"
                                type="text"
                                className={inputClass}
                                placeholder="+420 777 123 456"
                            />
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <label htmlFor="roleLabel" className="font-medium">
                            Role
                        </label>
                        <input
                            id="roleLabel"
                            name="roleLabel"
                            type="text"
                            className={inputClass}
                            placeholder="Hlavní organizátor"
                        />
                    </div>

                    <label className="flex items-center gap-2">
                        <input name="isPrimary" type="checkbox" />
                        <span>Nastavit jako hlavní kontakt</span>
                    </label>

                    <button
                        type="submit"
                        className={buttonClass}
                    >
                        Přidat kontakt
                    </button>
                </form>
            </section>
        </main>
    )
}
