import { notFound } from 'next/navigation'
import Breadcrumbs from '@/components/navigation/Breadcrumbs'
import { buttonClass, inputClass } from '@/lib/ui/styles'
import { requireTenantManagerContext } from '@/lib/auth/current-user'
import { getContactById } from '@/modules/clients/client.service'
import { updateContactAction } from './actions'

type EditContactPageProps = {
    params: Promise<{
        id: string
        contactId: string
    }>
    searchParams: Promise<{
        error?: string
    }>
}

export default async function EditContactPage({
    params,
    searchParams,
}: EditContactPageProps) {
    const { id: clientId, contactId } = await params
    const { error } = await searchParams
    const auth = await requireTenantManagerContext()
    const contact = await getContactById(contactId, clientId, auth)

    if (!contact) {
        notFound()
    }

    const updateAction = updateContactAction.bind(null, {
        clientId,
        contactId,
    })

    return (
        <main className="mx-auto max-w-4xl p-8">
            <Breadcrumbs
                items={[
                    { label: 'Domů', href: '/' },
                    { label: 'Klienti', href: '/clients' },
                    { label: contact.client.name, href: `/clients/${clientId}` },
                    {
                        label: 'Upravit kontakt',
                        href: `/clients/${clientId}/contacts/${contactId}/edit`,
                    },
                ]}
            />

            <div>
                <h1 className="text-3xl font-bold">Upravit kontakt</h1>
                <p className="mt-2 text-sm text-gray-600">
                    Klient: {contact.client.name}
                </p>
            </div>

            <section className="mt-8 rounded-xl border p-6">
                <h2 className="text-xl font-semibold">Kontaktní osoba</h2>

                {error ? (
                    <p className="mt-4 rounded-md border border-red-500/40 px-4 py-3 text-sm text-red-300">
                        {error}
                    </p>
                ) : null}

                <form action={updateAction} className="mt-4 grid gap-4">
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
                                defaultValue={contact.firstName}
                                className={inputClass}
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
                                defaultValue={contact.lastName}
                                className={inputClass}
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
                                defaultValue={contact.email ?? ''}
                                className={inputClass}
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
                                defaultValue={contact.phone ?? ''}
                                className={inputClass}
                            />
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <label htmlFor="instagram" className="font-medium">
                            Instagram
                        </label>
                        <input
                            id="instagram"
                            name="instagram"
                            type="text"
                            defaultValue={contact.instagram ?? ''}
                            className={inputClass}
                            placeholder="@instagram_handle"
                        />
                    </div>

                    <div className="grid gap-2">
                        <label htmlFor="roleLabel" className="font-medium">
                            Role
                        </label>
                        <input
                            id="roleLabel"
                            name="roleLabel"
                            type="text"
                            defaultValue={contact.roleLabel ?? ''}
                            className={inputClass}
                        />
                    </div>

                    <div className="grid gap-2">
                        <label htmlFor="note" className="font-medium">
                            Poznámka
                        </label>
                        <textarea
                            id="note"
                            name="note"
                            rows={4}
                            defaultValue={contact.note ?? ''}
                            className={inputClass}
                        />
                    </div>

                    <label className="flex items-center gap-2">
                        <input
                            name="isPrimary"
                            type="checkbox"
                            defaultChecked={contact.isPrimary}
                        />
                        <span>Nastavit jako hlavní kontakt</span>
                    </label>

                    <button type="submit" className={buttonClass}>
                        Uložit změny
                    </button>
                </form>
            </section>
        </main>
    )
}
