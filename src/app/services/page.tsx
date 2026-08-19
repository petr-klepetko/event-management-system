import Link from 'next/link'
import ConfirmSubmitButton from '@/components/forms/ConfirmSubmitButton'
import { buttonClass, inputClass } from '@/lib/ui/styles'
import { getServiceCatalogItemsForAdmin } from '@/modules/services/service-catalog.service'
import {
    createServiceCatalogItemAction,
    setServiceCatalogItemActiveAction,
} from './actions'
import Breadcrumbs from '@/components/navigation/Breadcrumbs'

export const dynamic = 'force-dynamic'

type ServicesPageProps = {
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

function mapSuccessMessage(code?: string) {
    switch (code) {
        case 'SluzbaBylaVytvorena':
            return 'Služba byla vytvořena.'
        case 'SluzbaBylaUlozena':
            return 'Služba byla uložena.'
        default:
            return null
    }
}

type ServicesTableProps = {
    services: Awaited<ReturnType<typeof getServiceCatalogItemsForAdmin>>
    inactive?: boolean
}

function ServicesTable({ services, inactive = false }: ServicesTableProps) {
    if (services.length === 0) {
        return (
            <p className="mt-4 text-sm text-gray-600">
                {inactive
                    ? 'Žádné deaktivované služby.'
                    : 'Zatím nejsou vytvořené žádné aktivní služby.'}
            </p>
        )
    }

    return (
        <div className="mt-4 overflow-x-auto">
            <table className="min-w-full border-collapse">
                <thead>
                    <tr className="border-b text-left">
                        <th className="py-2 pr-4">Název</th>
                        <th className="py-2 pr-4">Výchozí cena</th>
                        <th className="py-2 pr-4">Popis</th>
                        <th className="py-2 pr-4">Akce</th>
                    </tr>
                </thead>
                <tbody>
                    {services.map((service) => {
                        const toggleService =
                            setServiceCatalogItemActiveAction.bind(null, {
                                serviceId: service.id,
                                isActive: !service.isActive,
                            })

                        return (
                            <tr
                                key={service.id}
                                className={`border-b ${
                                    inactive ? 'text-gray-400' : ''
                                }`}
                            >
                                <td className="py-2 pr-4 font-medium">
                                    {service.name}
                                </td>
                                <td className="py-2 pr-4">
                                    {formatPrice(service.defaultPrice.toString())}
                                </td>
                                <td className="py-2 pr-4 whitespace-pre-wrap">
                                    {service.description ?? '—'}
                                </td>
                                <td className="py-2 pr-4">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <Link
                                            href={`/services/${service.id}/edit`}
                                            className="inline-flex min-h-10 items-center rounded-md border px-3 py-1 text-sm font-medium cursor-pointer hover:bg-white/10 transition-colors"
                                        >
                                            Upravit
                                        </Link>
                                        <form action={toggleService}>
                                            <ConfirmSubmitButton
                                                confirmMessage={
                                                    service.isActive
                                                        ? 'Opravdu chceš deaktivovat tuto službu?'
                                                        : 'Opravdu chceš znovu aktivovat tuto službu?'
                                                }
                                                className="inline-flex min-h-10 items-center rounded-md border px-3 py-1 text-sm font-medium cursor-pointer hover:bg-white/10 transition-colors"
                                            >
                                                {service.isActive
                                                    ? 'Deaktivovat'
                                                    : 'Aktivovat'}
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
    )
}

export default async function ServicesPage({
    searchParams,
}: ServicesPageProps) {
    const { error, success } = await searchParams
    const services = await getServiceCatalogItemsForAdmin()
    const activeServices = services.filter((service) => service.isActive)
    const inactiveServices = services.filter((service) => !service.isActive)
    const successMessage = mapSuccessMessage(success)

    return (
        <main className="mx-auto max-w-5xl p-8">
            <Breadcrumbs
                items={[
                    { label: 'Domů', href: '/' },
                    { label: 'Služby', href: '/services' },
                ]}
            />

            <div>
                <h1 className="text-3xl font-bold">Katalog služeb</h1>
            </div>

            <section className="mt-8 rounded-xl border p-6">
                <h2 className="text-xl font-semibold">Aktivní služby</h2>

                {error ? (
                    <p className="mt-4 rounded-md border border-red-500/40 px-4 py-3 text-sm text-red-300">
                        {error}
                    </p>
                ) : null}

                {successMessage ? (
                    <p className="mt-4 rounded-md border border-green-500/40 px-4 py-3 text-sm text-green-300">
                        {successMessage}
                    </p>
                ) : null}

                <ServicesTable services={activeServices} />
            </section>

            <section className="mt-8 rounded-xl border border-gray-700 p-6">
                <h2 className="text-xl font-semibold text-gray-300">
                    Deaktivované služby
                </h2>

                <ServicesTable services={inactiveServices} inactive />
            </section>

            <section className="mt-8 rounded-xl border p-6">
                <h2 className="text-xl font-semibold">
                    Vytvořit katalogovou službu
                </h2>

                <form
                    action={createServiceCatalogItemAction}
                    className="mt-4 grid gap-4"
                >
                    <div className="grid gap-2">
                        <label htmlFor="name" className="font-medium">
                            Název
                        </label>
                        <input
                            id="name"
                            name="name"
                            type="text"
                            required
                            className={inputClass}
                            placeholder="DJ služby"
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
                            className={inputClass}
                            placeholder="15000"
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
                            className={inputClass}
                            placeholder="Popis služby pro smlouvu..."
                        />
                    </div>

                    <button type="submit" className={buttonClass}>
                        Vytvořit službu
                    </button>
                </form>
            </section>
        </main>
    )
}
