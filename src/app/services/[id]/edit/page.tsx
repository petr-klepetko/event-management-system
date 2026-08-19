import { notFound } from 'next/navigation'
import { buttonClass, inputClass } from '@/lib/ui/styles'
import { getServiceCatalogItemById } from '@/modules/services/service-catalog.service'
import { updateServiceCatalogItemAction } from '../../actions'
import Breadcrumbs from '@/components/navigation/Breadcrumbs'

type EditServiceCatalogItemPageProps = {
    params: Promise<{
        id: string
    }>
    searchParams: Promise<{
        error?: string
    }>
}

export default async function EditServiceCatalogItemPage({
    params,
    searchParams,
}: EditServiceCatalogItemPageProps) {
    const { id } = await params
    const { error } = await searchParams
    const service = await getServiceCatalogItemById(id)

    if (!service) {
        notFound()
    }

    const updateAction = updateServiceCatalogItemAction.bind(null, {
        serviceId: service.id,
    })

    return (
        <main className="mx-auto max-w-4xl p-8">
            <Breadcrumbs
                items={[
                    { label: 'Domů', href: '/' },
                    { label: 'Služby', href: '/services' },
                    { label: service.name, href: `/services/${service.id}/edit` },
                ]}
            />

            <div>
                <h1 className="text-3xl font-bold">
                    Upravit katalogovou službu
                </h1>
                <p className="mt-2 text-sm text-gray-400">
                    Stav: {service.isActive ? 'aktivní' : 'deaktivovaná'}
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
                        <label htmlFor="name" className="font-medium">
                            Název
                        </label>
                        <input
                            id="name"
                            name="name"
                            type="text"
                            required
                            defaultValue={service.name}
                            className={inputClass}
                        />
                    </div>

                    <div className="grid gap-2">
                        <label htmlFor="defaultPrice" className="font-medium">
                            Výchozí cena
                        </label>
                        <input
                            id="defaultPrice"
                            name="defaultPrice"
                            type="text"
                            required
                            defaultValue={service.defaultPrice.toString()}
                            className={inputClass}
                        />
                    </div>

                    <div className="grid gap-2">
                        <label htmlFor="description" className="font-medium">
                            Výchozí popis
                        </label>
                        <textarea
                            id="description"
                            name="description"
                            rows={4}
                            defaultValue={service.description ?? ''}
                            className={inputClass}
                        />
                    </div>

                    <button type="submit" className={buttonClass}>
                        Uložit změny
                    </button>
                </form>
            </section>
        </main>
    )
}
