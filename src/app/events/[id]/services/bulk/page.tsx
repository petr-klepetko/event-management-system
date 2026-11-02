import { notFound } from 'next/navigation'
import Breadcrumbs from '@/components/navigation/Breadcrumbs'
import { canManageOwnedTenantData, requireTenantManagerContext } from '@/lib/auth/current-user'
import { buttonClass } from '@/lib/ui/styles'
import { getServiceCatalogItemsForEventTenant } from '@/modules/event-services/event-service.service'
import { getEventById } from '@/modules/events/event.service'
import { addSelectedServicesAction } from './actions'

type Props = {
    params: Promise<{ id: string }>
    searchParams: Promise<{ error?: string }>
}

export default async function BulkAddServicesPage({ params, searchParams }: Props) {
    const { id: eventId } = await params
    const { error } = await searchParams
    const auth = await requireTenantManagerContext()
    const [event, catalogItems] = await Promise.all([
        getEventById(eventId, auth),
        getServiceCatalogItemsForEventTenant(eventId, auth),
    ])

    if (!event || !canManageOwnedTenantData(auth, event.ownerUserId)) {
        notFound()
    }

    const action = addSelectedServicesAction.bind(null, eventId)

    return (
        <main className="mx-auto max-w-4xl p-4 sm:p-8">
            <Breadcrumbs items={[
                { label: 'Domů', href: '/' },
                { label: 'Akce a události', href: '/events' },
                { label: event.title, href: `/events/${event.id}` },
                { label: 'Hromadné přidání služeb', href: `/events/${event.id}/services/bulk` },
            ]} />
            <h1 className="text-3xl font-bold">Hromadné přidání služeb</h1>
            <p className="mt-2 text-sm text-gray-600">Vyber aktivní služby pro akci {event.title}. Cenu a popis převezmeme z katalogu; následně je můžeš upravit u jednotlivých služeb.</p>

            {error ? <p className="mt-4 rounded-md border border-red-500/40 px-4 py-3 text-sm text-red-700">{error}</p> : null}

            {catalogItems.length === 0 ? (
                <p className="mt-8 rounded-xl border p-6 text-gray-600">V katalogu nejsou žádné aktivní služby.</p>
            ) : (
                <form action={action} className="mt-8 grid gap-5">
                    <div className="overflow-x-auto rounded-xl border">
                        <table className="w-full border-collapse text-left">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="w-12 p-3">Vybrat</th>
                                    <th className="p-3">Služba</th>
                                    <th className="p-3 text-right">Výchozí cena</th>
                                </tr>
                            </thead>
                            <tbody>
                                {catalogItems.map((item) => (
                                    <tr key={item.id} className="border-t align-top">
                                        <td className="p-3">
                                            <input type="checkbox" name="serviceCatalogItemIds" value={item.id} aria-label={`Vybrat ${item.name}`} className="h-4 w-4 accent-teal-600" />
                                        </td>
                                        <td className="p-3">
                                            <span className="font-medium">{item.name}</span>
                                            {item.description ? <p className="mt-1 whitespace-pre-wrap text-sm text-gray-600">{item.description}</p> : null}
                                        </td>
                                        <td className="whitespace-nowrap p-3 text-right">{new Intl.NumberFormat('cs-CZ', { style: 'currency', currency: 'CZK' }).format(Number(item.defaultPrice.toString()))}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <button type="submit" className={buttonClass}>Přidat vybrané služby</button>
                </form>
            )}
        </main>
    )
}
