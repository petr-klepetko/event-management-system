import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getClientById } from '@/modules/clients/client.service'
import { mapClientTypeToLabel } from '@/modules/clients/client.utils'
import { createContactAction } from './actions'

type ClientDetailPageProps = {
    params: Promise<{
        id: string
    }>
}

export default async function ClientDetailPage({
    params,
}: ClientDetailPageProps) {
    const { id } = await params

    const client = await getClientById(id)

    if (!client) {
        notFound()
    }

    const createContactForClient = createContactAction.bind(null, {
        clientId: client.id,
    })

    return (
        <main className="mx-auto max-w-4xl p-8">
            <div className="flex items-center justify-between gap-4">
                <h1 className="text-3xl font-bold">{client.name}</h1>

                <Link href="/clients" className="rounded-md border px-4 py-2">
                    Back to clients
                </Link>
            </div>

            <section className="mt-8 rounded-xl border p-6">
                <h2 className="text-xl font-semibold">Client detail</h2>

                <dl className="mt-4 grid gap-4 sm:grid-cols-2">
                    <div>
                        <dt className="text-sm text-gray-500">Type</dt>
                        <dd className="mt-1">{mapClientTypeToLabel(client.type)}</dd>
                    </div>

                    <div>
                        <dt className="text-sm text-gray-500">ICO</dt>
                        <dd className="mt-1">{client.ico ?? '—'}</dd>
                    </div>

                    <div>
                        <dt className="text-sm text-gray-500">DIC</dt>
                        <dd className="mt-1">{client.dic ?? '—'}</dd>
                    </div>

                    <div>
                        <dt className="text-sm text-gray-500">City</dt>
                        <dd className="mt-1">{client.city ?? '—'}</dd>
                    </div>

                    <div>
                        <dt className="text-sm text-gray-500">Country</dt>
                        <dd className="mt-1">{client.country ?? '—'}</dd>
                    </div>

                    <div>
                        <dt className="text-sm text-gray-500">Created at</dt>
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
                <h2 className="text-xl font-semibold">Contacts</h2>

                {client.contacts.length === 0 ? (
                    <p className="mt-4 text-sm text-gray-600">
                        This client has no contacts yet.
                    </p>
                ) : (
                    <div className="mt-4 overflow-x-auto">
                        <table className="min-w-full border-collapse">
                            <thead>
                                <tr className="border-b text-left">
                                    <th className="py-2 pr-4">Name</th>
                                    <th className="py-2 pr-4">Email</th>
                                    <th className="py-2 pr-4">Phone</th>
                                    <th className="py-2 pr-4">Role</th>
                                    <th className="py-2 pr-4">Primary</th>
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
                <h2 className="text-xl font-semibold">Add contact</h2>

                <form action={createContactForClient} className="mt-4 grid gap-4">
                    <div className="grid gap-2 sm:grid-cols-2">
                        <div className="grid gap-2">
                            <label htmlFor="firstName" className="font-medium">
                                First name
                            </label>
                            <input
                                id="firstName"
                                name="firstName"
                                type="text"
                                required
                                className="rounded-md border px-3 py-2"
                                placeholder="Jan"
                            />
                        </div>

                        <div className="grid gap-2">
                            <label htmlFor="lastName" className="font-medium">
                                Last name
                            </label>
                            <input
                                id="lastName"
                                name="lastName"
                                type="text"
                                required
                                className="rounded-md border px-3 py-2"
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
                                className="rounded-md border px-3 py-2"
                                placeholder="jan.novak@example.com"
                            />
                        </div>

                        <div className="grid gap-2">
                            <label htmlFor="phone" className="font-medium">
                                Phone
                            </label>
                            <input
                                id="phone"
                                name="phone"
                                type="text"
                                className="rounded-md border px-3 py-2"
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
                            className="rounded-md border px-3 py-2"
                            placeholder="Hlavní organizátor"
                        />
                    </div>

                    <label className="flex items-center gap-2">
                        <input name="isPrimary" type="checkbox" />
                        <span>Set as primary contact</span>
                    </label>

                    <button
                        type="submit"
                        className="w-fit rounded-md border px-4 py-2 font-medium"
                    >
                        Add contact
                    </button>
                </form>
            </section>
        </main>
    )
}