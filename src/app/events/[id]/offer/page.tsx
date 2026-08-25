import Link from 'next/link'
import { notFound } from 'next/navigation'
import Breadcrumbs from '@/components/navigation/Breadcrumbs'
import PrintButton from '@/components/print/PrintButton'
import { primaryButtonClass, secondaryButtonClass } from '@/lib/ui/styles'
import { getEventById } from '@/modules/events/event.service'
import { mapEventStatusToLabel } from '@/modules/events/event.utils'
import { canManageOwnedTenantData, requireTenantManagerContext } from '@/lib/auth/current-user'

type EventOfferPageProps = {
    params: Promise<{
        id: string
    }>
}

function formatDate(value: Date) {
    return new Intl.DateTimeFormat('cs-CZ', {
        dateStyle: 'long',
    }).format(value)
}

function formatDateTime(value: Date) {
    return new Intl.DateTimeFormat('cs-CZ', {
        dateStyle: 'medium',
        timeStyle: 'short',
    }).format(value)
}

function formatPrice(value: string | number) {
    const amount = typeof value === 'number' ? value : Number(value)

    return new Intl.NumberFormat('cs-CZ', {
        style: 'currency',
        currency: 'CZK',
    }).format(amount)
}

export default async function EventOfferPage({ params }: EventOfferPageProps) {
    const { id } = await params
    const auth = await requireTenantManagerContext()
    const event = await getEventById(id, auth)

    if (!event) {
        notFound()
    }

    if (!canManageOwnedTenantData(auth, event.ownerUserId)) {
        notFound()
    }

    const totalPrice = event.serviceItems.reduce(
        (sum, item) => sum + Number(item.price.toString()),
        0
    )

    return (
        <main className="mx-auto max-w-5xl p-8 print-preview-page">
            <div className="print-hidden">
                <Breadcrumbs
                    items={[
                        { label: 'Domů', href: '/' },
                        { label: 'Akce', href: '/events' },
                        { label: event.title, href: `/events/${event.id}` },
                        {
                            label: 'Nabídka',
                            href: `/events/${event.id}/offer`,
                        },
                    ]}
                />

                <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <h1 className="text-3xl font-bold">Náhled nabídky</h1>
                        <p className="mt-2 text-sm text-gray-600">
                            Náhled je připravený pro tisk nebo uložení jako PDF.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        <Link
                            href={`/events/${event.id}`}
                            className={secondaryButtonClass}
                        >
                            Zpět na akci
                        </Link>
                        <PrintButton className={primaryButtonClass}>
                            Tisk / PDF
                        </PrintButton>
                    </div>
                </div>
            </div>

            <article className="offer-document">
                <header className="offer-header">
                    <div>
                        <p className="offer-kicker">Nabídka služeb</p>
                        <h2>{event.title}</h2>
                    </div>
                    <div className="offer-meta">
                        <p>Datum vystavení</p>
                        <strong>{formatDate(new Date())}</strong>
                    </div>
                </header>

                <div className="offer-summary">
                    <section className="offer-section">
                        <h3>Akce</h3>
                        <dl className="offer-grid">
                            <div>
                                <dt>Typ akce</dt>
                                <dd>{event.eventType}</dd>
                            </div>
                            <div>
                                <dt>Datum konání</dt>
                                <dd>{formatDateTime(event.dateStart)}</dd>
                            </div>
                            <div>
                                <dt>Místo</dt>
                                <dd>{event.venueName ?? 'Bude upřesněno'}</dd>
                            </div>
                            <div>
                                <dt>Stav</dt>
                                <dd>{mapEventStatusToLabel(event.status)}</dd>
                            </div>
                        </dl>
                    </section>

                    <section className="offer-section">
                        <h3>Klient</h3>
                        <dl className="offer-grid">
                            <div>
                                <dt>Název</dt>
                                <dd>{event.client.name}</dd>
                            </div>
                            <div>
                                <dt>IČO</dt>
                                <dd>{event.client.ico ?? '—'}</dd>
                            </div>
                            <div>
                                <dt>DIČ</dt>
                                <dd>{event.client.dic ?? '—'}</dd>
                            </div>
                            <div>
                                <dt>Město</dt>
                                <dd>{event.client.city ?? '—'}</dd>
                            </div>
                            <div>
                                <dt>Kontakt</dt>
                                <dd>
                                    {event.primaryContact
                                        ? `${event.primaryContact.firstName} ${event.primaryContact.lastName}`
                                        : '—'}
                                </dd>
                            </div>
                            <div>
                                <dt>Email</dt>
                                <dd>{event.primaryContact?.email ?? '—'}</dd>
                            </div>
                        </dl>
                    </section>
                </div>

                <section className="offer-section">
                    <h3>Nabízené služby</h3>

                    {event.serviceItems.length === 0 ? (
                        <p className="offer-empty">
                            K této akci zatím nejsou přidané žádné služby.
                        </p>
                    ) : (
                        <table className="offer-table">
                            <thead>
                                <tr>
                                    <th>Služba</th>
                                    <th>Popis</th>
                                    <th>Cena</th>
                                </tr>
                            </thead>
                            <tbody>
                                {event.serviceItems.map((item) => (
                                    <tr key={item.id}>
                                        <td>{item.customName}</td>
                                        <td>{item.description ?? '—'}</td>
                                        <td>{formatPrice(item.price.toString())}</td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot>
                                <tr>
                                    <td colSpan={2}>Celkem</td>
                                    <td>{formatPrice(totalPrice)}</td>
                                </tr>
                            </tfoot>
                        </table>
                    )}
                </section>

                <footer className="offer-footer">
                    <p>
                        Ceny jsou uvedené jako nabídka k uvedené akci. Finální rozsah je možné
                        upravit podle domluvy.
                    </p>
                </footer>
            </article>
        </main>
    )
}
