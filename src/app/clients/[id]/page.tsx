import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Fragment } from 'react'
import { getClientById } from '@/modules/clients/client.service'
import { mapClientTypeToLabel } from '@/modules/clients/client.utils'
import { mapEventStatusToLabel } from '@/modules/events/event.utils'
import { createContactAction } from './actions'
import {
    buttonClass,
    compactSecondaryButtonClass,
    inputClass,
    primaryButtonClass,
    secondaryButtonClass,
} from '@/lib/ui/styles'
import Breadcrumbs from '@/components/navigation/Breadcrumbs'
import ClientSideListFilter from '@/components/filters/ClientSideListFilter'
import { requireTenantManagerContext } from '@/lib/auth/current-user'

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
    const auth = await requireTenantManagerContext()

    const client = await getClientById(id, auth)

    if (!client) {
        notFound()
    }

    const createContactForClient = createContactAction.bind(null, {
        clientId: client.id,
    })

    return (
        <main className="mx-auto max-w-4xl p-4 sm:p-8">
            <Breadcrumbs
                items={[
                    { label: 'Domů', href: '/' },
                    { label: 'Klienti', href: '/clients' },
                    { label: client.name, href: `/clients/${client.id}` },
                ]}
            />

            <div className="flex flex-wrap items-center justify-between gap-3">
                <h1 className="text-3xl font-bold">{client.name}</h1>
                <div className="flex flex-wrap items-center gap-2">
                    <Link
                        href={`/events/new?clientId=${client.id}`}
                        className={primaryButtonClass}
                    >
                        Nová akce pro klienta
                    </Link>
                    <Link
                        href={`/clients/${client.id}/edit`}
                        className={secondaryButtonClass}
                    >
                        Upravit klienta
                    </Link>
                </div>
            </div>

            <section className="mt-8 rounded-xl border p-4 sm:p-6">
                <h2 className="text-xl font-semibold">Detail klienta</h2>

                {success === 'KlientBylUlozen' ? (
                    <p className="mt-4 rounded-md border border-green-500/40 px-4 py-3 text-sm text-green-300">
                        Klient byl uložen.
                    </p>
                ) : null}

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

            <section className="mt-8 rounded-xl border p-4 sm:p-6">
                <h2 className="text-xl font-semibold">Akce klienta</h2>

                {client.events.length === 0 ? (
                    <p className="mt-4 text-sm text-gray-600">
                        Tento klient zatím nemá žádné akce.
                    </p>
                ) : (
                    <>
                    <ClientSideListFilter
                        listId="client-events"
                        placeholder="Hledat podle akce, stavu nebo místa..."
                    />

                    <p
                        data-filter-empty="client-events"
                        hidden
                        className="mt-4 text-sm text-gray-600"
                    >
                        Žádná akce neodpovídá filtru.
                    </p>

                    <div data-filter-list="client-events" className="mt-4 grid gap-4 md:hidden">
                        {client.events.map((event) => {
                            const filterText = [
                                event.title,
                                event.eventType,
                                mapEventStatusToLabel(event.status),
                                event.venueName,
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
                                <h3 className="text-base font-semibold">
                                    <Link
                                        href={`/events/${event.id}`}
                                        className="underline underline-offset-4"
                                    >
                                        {event.title}
                                    </Link>
                                </h3>

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
                                        <dt className="font-medium text-gray-500">Stav</dt>
                                        <dd className="mt-1">
                                            {mapEventStatusToLabel(event.status)}
                                        </dd>
                                    </div>
                                    <div>
                                        <dt className="font-medium text-gray-500">Místo</dt>
                                        <dd className="mt-1">{event.venueName ?? '—'}</dd>
                                    </div>
                                </dl>
                                </article>
                            )
                        })}
                    </div>

                    <div data-filter-list="client-events" className="mt-4 hidden overflow-x-auto md:block">
                        <table className="min-w-full border-collapse">
                            <thead>
                                <tr className="border-b text-left">
                                    <th className="py-2 px-2">Název</th>
                                    <th className="py-2 px-2">Typ</th>
                                    <th className="py-2 px-2">Datum</th>
                                    <th className="py-2 px-2">Stav</th>
                                    <th className="py-2 px-2">Místo</th>
                                </tr>
                            </thead>
                            <tbody>
                                {client.events.map((event) => {
                                    const filterText = [
                                        event.title,
                                        event.eventType,
                                        mapEventStatusToLabel(event.status),
                                        event.venueName,
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
                                        <td className="py-2 px-2">
                                            {mapEventStatusToLabel(event.status)}
                                        </td>
                                        <td className="py-2 px-2">{event.venueName ?? '—'}</td>
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

                {success === 'KontaktBylUlozen' ? (
                    <p className="mt-4 rounded-md border border-green-500/40 px-4 py-3 text-sm text-green-300">
                        Kontakt byl uložen.
                    </p>
                ) : null}

                {client.contacts.length === 0 ? (
                    <p className="mt-4 text-sm text-gray-600">
                        Tento klient zatím nemá žádné kontakty.
                    </p>
                ) : (
                    <>
                    <ClientSideListFilter
                        listId="client-contacts"
                        placeholder="Hledat podle jména, kontaktu, role nebo poznámky..."
                    />

                    <p
                        data-filter-empty="client-contacts"
                        hidden
                        className="mt-4 text-sm text-gray-600"
                    >
                        Žádný kontakt neodpovídá filtru.
                    </p>

                    <div data-filter-list="client-contacts" className="mt-4 grid gap-4 md:hidden">
                        {client.contacts.map((contact) => {
                            const filterText = [
                                contact.firstName,
                                contact.lastName,
                                contact.email,
                                contact.phone,
                                contact.instagram,
                                contact.roleLabel,
                                contact.note,
                                contact.isPrimary ? 'hlavní ano' : '',
                            ]
                                .filter(Boolean)
                                .join(' ')

                            return (
                                <article
                                    key={contact.id}
                                    data-filter-item
                                    data-filter-text={filterText}
                                    className="rounded-lg border border-slate-200 bg-white p-4"
                                >
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <h3 className="text-base font-semibold">
                                            {contact.firstName} {contact.lastName}
                                        </h3>
                                        <p className="mt-1 text-sm text-gray-600">
                                            {contact.roleLabel ?? 'Role neuvedena'}
                                        </p>
                                    </div>
                                    <Link
                                        href={`/clients/${client.id}/contacts/${contact.id}/edit`}
                                        className={compactSecondaryButtonClass}
                                    >
                                        Upravit
                                    </Link>
                                </div>

                                <dl className="mt-4 grid gap-3 text-sm">
                                    <div>
                                        <dt className="font-medium text-gray-500">Telefon</dt>
                                        <dd className="mt-1 break-words">
                                            {contact.phone ?? '—'}
                                        </dd>
                                    </div>
                                    <div>
                                        <dt className="font-medium text-gray-500">Email</dt>
                                        <dd className="mt-1 break-words">
                                            {contact.email ?? '—'}
                                        </dd>
                                    </div>
                                    <div>
                                        <dt className="font-medium text-gray-500">Instagram</dt>
                                        <dd className="mt-1 break-words">
                                            {contact.instagram ?? '—'}
                                        </dd>
                                    </div>
                                    <div>
                                        <dt className="font-medium text-gray-500">
                                            Hlavní kontakt
                                        </dt>
                                        <dd className="mt-1">
                                            {contact.isPrimary ? 'Ano' : '—'}
                                        </dd>
                                    </div>
                                    <div>
                                        <dt className="font-medium text-gray-500">Poznámka</dt>
                                        <dd className="mt-1 whitespace-pre-wrap break-words rounded-md bg-slate-50 px-3 py-2">
                                            {contact.note ?? '—'}
                                        </dd>
                                    </div>
                                </dl>
                                </article>
                            )
                        })}
                    </div>

                    <div data-filter-list="client-contacts" className="mt-4 hidden overflow-x-auto md:block">
                        <table className="min-w-full border-collapse">
                            <thead>
                                <tr className="border-b text-left">
                                    <th className="py-2 px-2">Jméno</th>
                                    <th className="py-2 px-2">Kontakt</th>
                                    <th className="py-2 px-2">Role</th>
                                    <th className="py-2 px-2">Hlavní kontakt</th>
                                    <th className="py-2 px-2">Akce</th>
                                </tr>
                            </thead>
                            <tbody>
                                {client.contacts.map((contact) => {
                                    const filterText = [
                                        contact.firstName,
                                        contact.lastName,
                                        contact.email,
                                        contact.phone,
                                        contact.instagram,
                                        contact.roleLabel,
                                        contact.note,
                                        contact.isPrimary ? 'hlavní ano' : '',
                                    ]
                                        .filter(Boolean)
                                        .join(' ')

                                    return (
                                    <Fragment key={contact.id}>
                                        <tr
                                            data-filter-item
                                            data-filter-text={filterText}
                                        >
                                            <td className="py-3 px-2 font-medium">
                                                {contact.firstName} {contact.lastName}
                                            </td>
                                            <td className="py-3 px-2">
                                                <div className="grid gap-1">
                                                    <div>
                                                        <span className="text-gray-500">telefon: </span>
                                                        {contact.phone ?? '—'}
                                                    </div>
                                                    <div>
                                                        <span className="text-gray-500">email: </span>
                                                        {contact.email ?? '—'}
                                                    </div>
                                                    <div>
                                                        <span className="text-gray-500">instagram: </span>
                                                        {contact.instagram ?? '—'}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-3 px-2">{contact.roleLabel ?? '—'}</td>
                                            <td className="py-3 px-2">
                                                {contact.isPrimary ? 'Ano' : '—'}
                                            </td>
                                            <td className="py-3 px-2 whitespace-nowrap">
                                                <Link
                                                    href={`/clients/${client.id}/contacts/${contact.id}/edit`}
                                                    className={compactSecondaryButtonClass}
                                                >
                                                    Upravit
                                                </Link>
                                            </td>
                                        </tr>
                                        <tr
                                            data-filter-item
                                            data-filter-text={filterText}
                                            className="border-b"
                                        >
                                            <td colSpan={5} className="pb-4 pr-4">
                                                <div className="rounded-md bg-slate-50 px-4 py-3 text-sm">
                                                    <span className="font-medium text-gray-500">
                                                        Poznámka:{' '}
                                                    </span>
                                                    <span className="whitespace-pre-wrap">
                                                        {contact.note ?? '—'}
                                                    </span>
                                                </div>
                                            </td>
                                        </tr>
                                    </Fragment>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                    </>
                )}
            </section>

            <section className="mt-8 rounded-xl border p-4 sm:p-6">
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
                        <label htmlFor="instagram" className="font-medium">
                            Instagram
                        </label>
                        <input
                            id="instagram"
                            name="instagram"
                            type="text"
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
                            className={inputClass}
                            placeholder="Hlavní organizátor"
                        />
                    </div>

                    <div className="grid gap-2">
                        <label htmlFor="note" className="font-medium">
                            Poznámka
                        </label>
                        <textarea
                            id="note"
                            name="note"
                            rows={3}
                            className={inputClass}
                            placeholder="Např. učitel, hlavní zástupce za studenty..."
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
