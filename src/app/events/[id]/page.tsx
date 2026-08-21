import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getEventById } from '@/modules/events/event.service'
import { mapEventStatusToLabel } from '@/modules/events/event.utils'
import { deleteEventServiceItemAction } from './actions'
import ConfirmSubmitButton from '@/components/forms/ConfirmSubmitButton'
import Breadcrumbs from '@/components/navigation/Breadcrumbs'
import {
    compactSecondaryButtonClass,
    primaryButtonClass,
    secondaryButtonClass,
} from '@/lib/ui/styles'
import { requireAuthContext } from '@/lib/auth/current-user'

type EventDetailPageProps = {
    params: Promise<{
        id: string
    }>
    searchParams: Promise<{
        error?: string
        success?: string
    }>
}

function formatPrice(value: string | number) {
    const amount = typeof value === 'number' ? value : Number(value)

    return new Intl.NumberFormat('cs-CZ', {
        style: 'currency',
        currency: 'CZK',
    }).format(amount)
}

export default async function EventDetailPage({
    params,
    searchParams,
}: EventDetailPageProps) {
    const { id } = await params
    const { error, success } = await searchParams
    const auth = await requireAuthContext()

    const event = await getEventById(id, auth)

    if (!event) {
        notFound()
    }

    return (
        <main className="mx-auto max-w-5xl p-8">
            <Breadcrumbs
                items={[
                    { label: 'Domů', href: '/' },
                    { label: 'Akce', href: '/events' },
                    { label: event.title, href: `/events/${event.id}` },
                ]}
            />

            <div className="flex flex-wrap items-center justify-between gap-3">
                <h1 className="text-3xl font-bold">{event.title}</h1>
                <div className="flex flex-wrap items-center gap-2">
                    <Link
                        href={`/events/${event.id}/offer`}
                        className={secondaryButtonClass}
                    >
                        Náhled nabídky
                    </Link>
                    <Link
                        href={`/events/${event.id}/edit`}
                        className={primaryButtonClass}
                    >
                        Upravit akci
                    </Link>
                </div>
            </div>

            <section className="mt-8 rounded-xl border p-6">
                <h2 className="text-xl font-semibold">Detail akce</h2>

                {success === 'AkceBylaUlozena' ? (
                    <p className="mt-4 rounded-md border border-green-500/40 px-4 py-3 text-sm text-green-300">
                        Akce byla uložena.
                    </p>
                ) : null}

                <dl className="mt-4 grid gap-4 sm:grid-cols-2">
                    <div>
                        <dt className="text-sm text-gray-500">Typ</dt>
                        <dd className="mt-1">{event.eventType}</dd>
                    </div>

                    <div>
                        <dt className="text-sm text-gray-500">Stav</dt>
                        <dd className="mt-1">
                            {mapEventStatusToLabel(event.status)}
                        </dd>
                    </div>

                    <div>
                        <dt className="text-sm text-gray-500">Datum</dt>
                        <dd className="mt-1">
                            {new Intl.DateTimeFormat('cs-CZ', {
                                dateStyle: 'medium',
                                timeStyle: 'short',
                            }).format(event.dateStart)}
                        </dd>
                    </div>

                    <div>
                        <dt className="text-sm text-gray-500">Místo</dt>
                        <dd className="mt-1">{event.venueName ?? '—'}</dd>
                    </div>

                    <div>
                        <dt className="text-sm text-gray-500">Klient</dt>
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
                        <dt className="text-sm text-gray-500">Hlavní kontakt</dt>
                        <dd className="mt-1">
                            {event.primaryContact
                                ? `${event.primaryContact.firstName} ${event.primaryContact.lastName}`
                                : '—'}
                        </dd>
                    </div>

                    <div>
                        <dt className="text-sm text-gray-500">Email kontaktu</dt>
                        <dd className="mt-1">{event.primaryContact?.email ?? '—'}</dd>
                    </div>

                    <div>
                        <dt className="text-sm text-gray-500">Telefon kontaktu</dt>
                        <dd className="mt-1">{event.primaryContact?.phone ?? '—'}</dd>
                    </div>
                </dl>

                {event.internalNote ? (
                    <div className="mt-6">
                        <h3 className="text-sm text-gray-500">Interní poznámka</h3>
                        <p className="mt-1 whitespace-pre-wrap">{event.internalNote}</p>
                    </div>
                ) : null}
            </section>

            <section className="mt-8 rounded-xl border p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <h2 className="text-xl font-semibold">Služby na akci</h2>
                    <Link
                        href={`/events/${event.id}/services/new`}
                        className={primaryButtonClass}
                    >
                        Přidat službu
                    </Link>
                </div>

                {error ? (
                    <p className="mt-4 rounded-md border border-red-500/40 px-4 py-3 text-sm text-red-300">
                        {error}
                    </p>
                ) : null}

                {success === 'SluzbaBylaPridana' ? (
                    <p className="mt-4 rounded-md border border-green-500/40 px-4 py-3 text-sm text-green-300">
                        Služba byla přidána na akci.
                    </p>
                ) : null}

                {event.serviceItems.length === 0 ? (
                    <p className="mt-4 text-sm text-gray-600">Zatím nejsou přidané žádné služby.</p>
                ) : (
                    <div className="mt-4 overflow-x-auto">
                        <table className="min-w-full border-collapse">
                            <thead>
                                <tr className="border-b text-left">
                                    <th className="py-2 pr-4">Název</th>
                                    <th className="py-2 pr-4">Zdroj v katalogu</th>
                                    <th className="py-2 pr-4">Cena</th>
                                    <th className="py-2 pr-4">Popis</th>
                                    <th className="py-2 pr-4">Poznámka</th>
                                    <th className="py-2 pr-4">Akce</th>
                                </tr>
                            </thead>
                            <tbody>
                                {event.serviceItems.map((item) => {
                                    const deleteServiceItem = deleteEventServiceItemAction.bind(null, {
                                        eventId: event.id,
                                        serviceItemId: item.id,
                                    })

                                    return (
                                        <tr key={item.id} className="border-b">
                                            <td className="py-2 pr-4">{item.customName}</td>
                                            <td className="py-2 pr-4">
                                                {item.serviceCatalogItem?.name ?? '—'}
                                            </td>
                                            <td className="py-2 pr-4">
                                                {formatPrice(item.price.toString())}
                                            </td>
                                            <td className="py-2 pr-4 whitespace-pre-wrap">
                                                {item.description ?? '—'}
                                            </td>
                                            <td className="py-2 pr-4 whitespace-pre-wrap">
                                                {item.note ?? '—'}
                                            </td>
                                            <td className="service-item-actions-cell py-2 pr-4">
                                                <div className="flex items-center gap-2">
                                                    <Link
                                                        href={`/events/${event.id}/services/${item.id}/edit`}
                                                        className={compactSecondaryButtonClass}
                                                    >
                                                        Upravit
                                                    </Link>
                                                    <form action={deleteServiceItem}>
                                                        <ConfirmSubmitButton
                                                            confirmMessage="Opravdu chceš smazat tuto službu?"
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
                )}
            </section>
        </main>
    )
}
