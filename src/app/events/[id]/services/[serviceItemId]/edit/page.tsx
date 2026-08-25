import { notFound } from 'next/navigation'
import {
    getAssignableUsersForTenant,
    getEventServiceItemById,
    getServiceCatalogItemsForEventServiceEdit,
} from '@/modules/event-services/event-service.service'
import { updateEventServiceItemAction } from './actions'
import EventServiceAssignmentsEditor from '@/components/forms/EventServiceAssignmentsEditor'
import SearchableSelect from '@/components/forms/SearchableSelect'
import { buttonClass, inputClass } from '@/lib/ui/styles'
import Breadcrumbs from '@/components/navigation/Breadcrumbs'
import { requireTenantManagerContext } from '@/lib/auth/current-user'

type EditEventServiceItemPageProps = {
    params: Promise<{
        id: string
        serviceItemId: string
    }>
    searchParams: Promise<{
        error?: string
    }>
}

function formatPrice(value: string | number) {
    const amount = typeof value === 'number' ? value : Number(value)

    return new Intl.NumberFormat('cs-CZ', {
        style: 'currency',
        currency: 'CZK',
    }).format(amount)
}

export default async function EditEventServiceItemPage({
    params,
    searchParams,
}: EditEventServiceItemPageProps) {
    const { id: eventId, serviceItemId } = await params
    const { error } = await searchParams
    const auth = await requireTenantManagerContext()

    const serviceItem = await getEventServiceItemById(serviceItemId, auth)

    if (!serviceItem) {
        notFound()
    }

    if (serviceItem.event.id !== eventId) {
        notFound()
    }

    const [serviceCatalogItems, assignableUsers] = await Promise.all([
        getServiceCatalogItemsForEventServiceEdit(
            serviceItem.serviceCatalogItemId,
            serviceItem.event.tenantId
        ),
        getAssignableUsersForTenant(serviceItem.event.tenantId, auth),
    ])

    const updateAction = updateEventServiceItemAction.bind(null, {
        eventId,
        serviceItemId,
    })

    return (
        <main className="mx-auto max-w-4xl p-8">
            <Breadcrumbs
                items={[
                    { label: 'Domů', href: '/' },
                    { label: 'Akce', href: '/events' },
                    {
                        label: serviceItem.event.title,
                        href: `/events/${eventId}`,
                    },
                    {
                        label: 'Upravit službu',
                        href: `/events/${eventId}/services/${serviceItemId}/edit`,
                    },
                ]}
            />

            <div>
                <h1 className="text-3xl font-bold">Upravit službu na akci</h1>
                <p className="mt-2 text-sm text-gray-400">
                    Akce: {serviceItem.event.title}
                </p>
            </div>

            <section className="mt-8 rounded-xl border p-6">
                <h2 className="text-xl font-semibold">Detail služby</h2>

                {error ? (
                    <p className="mt-4 rounded-md border border-red-500/40 px-4 py-3 text-sm text-red-300">
                        {error}
                    </p>
                ) : null}

                <form action={updateAction} className="mt-4 grid gap-4">
                    <div className="grid gap-2">
                        <label htmlFor="serviceCatalogItemId" className="font-medium">
                            Služba z katalogu
                        </label>
                        <SearchableSelect
                            id="serviceCatalogItemId"
                            name="serviceCatalogItemId"
                            defaultValue={serviceItem.serviceCatalogItemId ?? ''}
                            placeholder="Začni psát název služby..."
                            emptyOptionLabel="Bez vybrané katalogové služby"
                            options={serviceCatalogItems.map((item) => ({
                                value: item.id,
                                label: `${item.name} (${formatPrice(item.defaultPrice.toString())})${
                                    item.isActive ? '' : ' - deaktivovaná'
                                }`,
                                searchText: `${item.name} ${item.defaultPrice.toString()} ${
                                    item.description ?? ''
                                } ${item.isActive ? 'aktivní' : 'deaktivovaná'}`,
                            }))}
                        />
                    </div>

                    <div className="grid gap-2 sm:grid-cols-2">
                        <div className="grid gap-2">
                            <label htmlFor="customName" className="font-medium">
                                Název služby
                            </label>
                            <input
                                id="customName"
                                name="customName"
                                type="text"
                                required
                                defaultValue={serviceItem.customName}
                                className={inputClass}
                            />
                        </div>

                        <div className="grid gap-2">
                            <label htmlFor="price" className="font-medium">
                                Cena
                            </label>
                            <input
                                id="price"
                                name="price"
                                type="text"
                                required
                                defaultValue={serviceItem.price.toString()}
                                className={inputClass}
                            />
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <label htmlFor="description" className="font-medium">
                            Popis do smlouvy
                        </label>
                        <textarea
                            id="description"
                            name="description"
                            rows={4}
                            defaultValue={serviceItem.description ?? ''}
                            className={inputClass}
                        />
                    </div>

                    <div className="grid gap-2">
                        <label htmlFor="note" className="font-medium">
                            Interní poznámka
                        </label>
                        <textarea
                            id="note"
                            name="note"
                            rows={4}
                            defaultValue={serviceItem.note ?? ''}
                            className={inputClass}
                        />
                    </div>

                    <EventServiceAssignmentsEditor
                        users={assignableUsers}
                        defaultAssignments={serviceItem.assignments.map(
                            (assignment) => ({
                                id: assignment.id,
                                userId: assignment.userId,
                                role: assignment.role,
                                workDescription: assignment.workDescription,
                                reward: assignment.reward.toString(),
                            })
                        )}
                    />

                    <button type="submit" className={buttonClass}>
                        Uložit změny
                    </button>
                </form>
            </section>
        </main>
    )
}
