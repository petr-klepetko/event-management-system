import { notFound } from 'next/navigation'
import Breadcrumbs from '@/components/navigation/Breadcrumbs'
import {
    getAssignableUsersForEvent,
    getServiceCatalogItemsForEventTenant,
} from '@/modules/event-services/event-service.service'
import { getEventById } from '@/modules/events/event.service'
import { createEventServiceItemAction } from '../../actions'
import AddServiceForm from '../../AddServiceForm'
import { canManageOwnedTenantData, requireAuthContext } from '@/lib/auth/current-user'

type NewEventServiceItemPageProps = {
    params: Promise<{
        id: string
    }>
    searchParams: Promise<{
        error?: string
    }>
}

export default async function NewEventServiceItemPage({
    params,
    searchParams,
}: NewEventServiceItemPageProps) {
    const { id: eventId } = await params
    const { error } = await searchParams
    const auth = await requireAuthContext()

    const [event, serviceCatalogItems, assignableUsers] = await Promise.all([
        getEventById(eventId, auth),
        getServiceCatalogItemsForEventTenant(eventId, auth),
        getAssignableUsersForEvent(eventId, auth),
    ])

    if (!event) {
        notFound()
    }

    if (!canManageOwnedTenantData(auth, event.ownerUserId)) {
        notFound()
    }

    const createServiceForEvent = createEventServiceItemAction.bind(null, {
        eventId: event.id,
    })

    return (
        <main className="mx-auto max-w-4xl p-8">
            <Breadcrumbs
                items={[
                    { label: 'Domů', href: '/' },
                    { label: 'Akce', href: '/events' },
                    { label: event.title, href: `/events/${event.id}` },
                    {
                        label: 'Přidat službu',
                        href: `/events/${event.id}/services/new`,
                    },
                ]}
            />

            <div>
                <h1 className="text-3xl font-bold">Přidat službu na akci</h1>
                <p className="mt-2 text-sm text-gray-600">
                    Akce: {event.title}
                </p>
            </div>

            <section className="mt-8 rounded-xl border p-6">
                <h2 className="text-xl font-semibold">Detail služby</h2>

                {error ? (
                    <p className="mt-4 rounded-md border border-red-500/40 px-4 py-3 text-sm text-red-300">
                        {error}
                    </p>
                ) : null}

                <AddServiceForm
                    catalogItems={serviceCatalogItems.map((item) => ({
                        id: item.id,
                        name: item.name,
                        defaultPrice: item.defaultPrice.toString(),
                        defaultDescription: item.description ?? '',
                    }))}
                    assignableUsers={assignableUsers}
                    action={createServiceForEvent}
                />
            </section>
        </main>
    )
}
