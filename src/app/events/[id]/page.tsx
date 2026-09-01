import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
    calculateEventFinance,
    calculateEventServiceItemFinance,
    getEventById,
} from '@/modules/events/event.service'
import { mapEventStatusToLabel } from '@/modules/events/event.utils'
import {
    createEventCostAction,
    deleteEventCostAction,
    deleteEventServiceItemAction,
} from './actions'
import ConfirmSubmitButton from '@/components/forms/ConfirmSubmitButton'
import Breadcrumbs from '@/components/navigation/Breadcrumbs'
import ClientSideListFilter from '@/components/filters/ClientSideListFilter'
import {
    compactSecondaryButtonClass,
    inputClass,
    primaryButtonClass,
    secondaryButtonClass,
} from '@/lib/ui/styles'
import {
    canManageOwnedTenantData,
    isWorkerContext,
    requireAuthContext,
} from '@/lib/auth/current-user'

type EventDetailPageProps = {
    params: Promise<{
        id: string
    }>
    searchParams: Promise<{
        error?: string
        financeError?: string
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

function mapAssignmentRoleToLabel(role: 'RESPONSIBLE' | 'WORKER') {
    return role === 'RESPONSIBLE' ? 'Má na starost' : 'Pracovník'
}

function getAssignmentDisplayName(assignment: {
    supplierName: string | null
    user: {
        fullName: string
    } | null
}) {
    return assignment.user?.fullName ?? assignment.supplierName ?? 'Externí dodavatel'
}

function getEventClientName(event: {
    client: {
        name: string
    } | null
    oneOffClientName: string | null
}) {
    return event.client?.name ?? event.oneOffClientName ?? '—'
}

export default async function EventDetailPage({
    params,
    searchParams,
}: EventDetailPageProps) {
    const { id } = await params
    const { error, financeError, success } = await searchParams
    const auth = await requireAuthContext()

    const event = await getEventById(id, auth)

    if (!event) {
        notFound()
    }

    const isWorker = isWorkerContext(auth)
    const finance = isWorker ? null : calculateEventFinance(event)
    const visibleServiceItems = isWorker
        ? event.serviceItems.flatMap((item) => {
              const assignments = item.assignments.filter(
                  (assignment) => assignment.user?.id === auth.userId
              )

            return assignments.length > 0
                ? [
                    {
                        ...item,
                        assignments,
                    },
                ]
                : []
        })
        : event.serviceItems
    const canManageEvent =
        !isWorker && canManageOwnedTenantData(auth, event.ownerUserId)
    const createCost = createEventCostAction.bind(null, {
        eventId: event.id,
    })

    return (
        <main className="mx-auto max-w-5xl p-4 sm:p-8">
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
                    {!isWorker ? (
                        <Link
                            href={`/events/${event.id}/offer`}
                            className={secondaryButtonClass}
                        >
                            Náhled nabídky
                        </Link>
                    ) : null}
                    {canManageEvent ? (
                        <Link
                            href={`/events/${event.id}/edit`}
                            className={primaryButtonClass}
                        >
                            Upravit akci
                        </Link>
                    ) : null}
                </div>
            </div>

            <section className="mt-8 rounded-xl border p-4 sm:p-6">
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

                    {!isWorker ? (
                        <div>
                            <dt className="text-sm text-gray-500">Klient</dt>
                            <dd className="mt-1">
                                {event.client ? (
                                    <Link
                                        href={`/clients/${event.client.id}`}
                                        className="underline underline-offset-4"
                                    >
                                        {event.client.name}
                                    </Link>
                                ) : (
                                    getEventClientName(event)
                                )}
                            </dd>
                        </div>
                    ) : null}

                    {!isWorker && event.client ? (
                        <>
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

                            <div>
                                <dt className="text-sm text-gray-500">Instagram kontaktu</dt>
                                <dd className="mt-1">
                                    {event.primaryContact?.instagram ?? '—'}
                                </dd>
                            </div>
                        </>
                    ) : null}

                    {!isWorker && !event.client ? (
                        <>
                            <div>
                                <dt className="text-sm text-gray-500">Typ klienta</dt>
                                <dd className="mt-1">Jednorázová akce</dd>
                            </div>

                            <div>
                                <dt className="text-sm text-gray-500">Telefon klienta</dt>
                                <dd className="mt-1">{event.oneOffClientPhone ?? '—'}</dd>
                            </div>

                            <div>
                                <dt className="text-sm text-gray-500">E-mail klienta</dt>
                                <dd className="mt-1">{event.oneOffClientEmail ?? '—'}</dd>
                            </div>
                        </>
                    ) : null}
                </dl>

                {!isWorker && event.internalNote ? (
                    <div className="mt-6">
                        <h3 className="text-sm text-gray-500">Interní poznámka</h3>
                        <p className="mt-1 whitespace-pre-wrap">{event.internalNote}</p>
                    </div>
                ) : null}
            </section>

            {finance ? (
                <section className="mt-8 grid gap-3 sm:grid-cols-3 rounded-lg p-4 sm:p-6 border">
                    <div className="rounded-lg border border-slate-200 bg-white p-4">
                        <p className="text-sm font-medium text-gray-500">
                            Nabídnuto klientovi
                        </p>
                        <p className="mt-2 text-xl font-semibold">
                            {formatPrice(finance.invoicePrice)}
                        </p>
                    </div>
                    <div className="rounded-lg border border-slate-200 bg-white p-4">
                        <p className="text-sm font-medium text-gray-500">
                            Náklady celkem
                        </p>
                        <p className="mt-2 text-xl font-semibold">
                            {formatPrice(finance.costs)}
                        </p>
                    </div>
                    <div className="rounded-lg border border-slate-200 bg-white p-4">
                        <p className="text-sm font-medium text-gray-500">Zisk</p>
                        <p
                            className={`mt-2 text-xl font-semibold ${finance.profit < 0 ? 'text-red-700' : 'text-teal-700'
                                }`}
                        >
                            {formatPrice(finance.profit)}
                        </p>
                    </div>
                </section>
            ) : null}

            <section className="mt-8 rounded-xl border p-4 sm:p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <h2 className="text-xl font-semibold">
                        {isWorker ? 'Moje služby na akci' : 'Služby na akci'}
                    </h2>
                    {canManageEvent ? (
                        <Link
                            href={`/events/${event.id}/services/new`}
                            className={primaryButtonClass}
                        >
                            Přidat službu
                        </Link>
                    ) : null}
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

                {visibleServiceItems.length === 0 ? (
                    <p className="mt-4 text-sm text-gray-600">
                        {isWorker
                            ? 'Na této akci zatím nemáš přiřazenou žádnou službu.'
                            : 'Zatím nejsou přidané žádné služby.'}
                    </p>
                ) : isWorker ? (
                    <>
                        <ClientSideListFilter
                            listId="event-services"
                            placeholder="Hledat podle služby, role nebo popisu práce..."
                        />

                        <p
                            data-filter-empty="event-services"
                            hidden
                            className="mt-4 text-sm text-gray-600"
                        >
                            Žádná služba neodpovídá filtru.
                        </p>

                        <div data-filter-list="event-services" className="mt-4 grid gap-4 md:hidden">
                            {visibleServiceItems.flatMap((item) =>
                                item.assignments.map((assignment) => {
                                    const filterText = [
                                        item.customName,
                                        mapAssignmentRoleToLabel(assignment.role),
                                        assignment.workDescription,
                                        assignment.reward.toString(),
                                    ]
                                        .filter(Boolean)
                                        .join(' ')

                                    return (
                                        <article
                                            key={`${item.id}-${assignment.id}`}
                                            data-filter-item
                                            data-filter-text={filterText}
                                            className="rounded-lg border border-slate-200 bg-white p-4"
                                        >
                                            <h3 className="text-base font-semibold">
                                                {item.customName}
                                            </h3>
                                            <dl className="mt-4 grid gap-3 text-sm">
                                                <div>
                                                    <dt className="font-medium text-gray-500">Role</dt>
                                                    <dd className="mt-1">
                                                        {mapAssignmentRoleToLabel(assignment.role)}
                                                    </dd>
                                                </div>
                                                <div>
                                                    <dt className="font-medium text-gray-500">Popis práce</dt>
                                                    <dd className="mt-1 whitespace-pre-wrap break-words rounded-md bg-slate-50 px-3 py-2">
                                                        {assignment.workDescription ?? '—'}
                                                    </dd>
                                                </div>
                                                <div>
                                                    <dt className="font-medium text-gray-500">Moje odměna</dt>
                                                    <dd className="mt-1 font-semibold">
                                                        {formatPrice(assignment.reward.toString())}
                                                    </dd>
                                                </div>
                                            </dl>
                                        </article>
                                    )
                                })
                            )}
                        </div>

                        <div data-filter-list="event-services" className="mt-4 hidden overflow-x-auto md:block">
                            <table className="min-w-full border-collapse">
                                <thead>
                                    <tr className="border-b text-left">
                                        <th className="py-2 px-2">Název</th>
                                        <th className="py-2 px-2">Role</th>
                                        <th className="py-2 px-2">Popis práce</th>
                                        <th className="py-2 px-2 text-right">Moje odměna</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {visibleServiceItems.flatMap((item) =>
                                        item.assignments.map((assignment) => {
                                            const filterText = [
                                                item.customName,
                                                mapAssignmentRoleToLabel(assignment.role),
                                                assignment.workDescription,
                                                assignment.reward.toString(),
                                            ]
                                                .filter(Boolean)
                                                .join(' ')

                                            return (
                                                <tr
                                                    key={`${item.id}-${assignment.id}`}
                                                    data-filter-item
                                                    data-filter-text={filterText}
                                                    className="border-b"
                                                >
                                                    <td className="break-words py-2 px-2 font-medium">
                                                        {item.customName}
                                                    </td>
                                                    <td className="py-2 px-2">
                                                        {mapAssignmentRoleToLabel(assignment.role)}
                                                    </td>
                                                    <td className="whitespace-pre-wrap break-words py-2 px-2">
                                                        {assignment.workDescription ?? '—'}
                                                    </td>
                                                    <td className="whitespace-nowrap py-2 px-2 text-right font-semibold">
                                                        {formatPrice(assignment.reward.toString())}
                                                    </td>
                                                </tr>
                                            )
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </>
                ) : (
                    <>
                        <ClientSideListFilter
                            listId="event-services"
                            placeholder="Hledat podle služby, ceny, popisu nebo poznámky..."
                        />

                        <p
                            data-filter-empty="event-services"
                            hidden
                            className="mt-4 text-sm text-gray-600"
                        >
                            Žádná služba neodpovídá filtru.
                        </p>

                        <div data-filter-list="event-services" className="mt-4 grid gap-4 md:hidden">
                            {visibleServiceItems.map((item) => {
                                const deleteServiceItem = deleteEventServiceItemAction.bind(null, {
                                    eventId: event.id,
                                    serviceItemId: item.id,
                                })
                                const itemFinance =
                                    calculateEventServiceItemFinance(item)
                                const filterText = [
                                    item.customName,
                                    item.serviceCatalogItem?.name,
                                    item.price.toString(),
                                    formatPrice(item.price.toString()),
                                    item.description,
                                    item.note,
                                    ...item.assignments.flatMap((assignment) => [
                                        getAssignmentDisplayName(assignment),
                                        assignment.user?.email,
                                        mapAssignmentRoleToLabel(assignment.role),
                                        assignment.workDescription,
                                        assignment.reward.toString(),
                                    ]),
                                ]
                                    .filter(Boolean)
                                    .join(' ')

                                return (
                                    <article
                                        key={item.id}
                                        data-filter-item
                                        data-filter-text={filterText}
                                        className="rounded-lg border border-slate-200 bg-white p-4"
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div>
                                                <h3 className="text-base font-semibold">
                                                    {item.customName}
                                                </h3>
                                                <p className="mt-1 text-sm font-medium">
                                                    {formatPrice(item.price.toString())}
                                                </p>
                                                <p className="mt-1 text-sm text-gray-600">
                                                    Náklady: {formatPrice(itemFinance.workerCosts)}
                                                </p>
                                                <p
                                                    className={`mt-1 text-sm font-medium ${itemFinance.margin < 0
                                                            ? 'text-red-700'
                                                            : 'text-teal-700'
                                                        }`}
                                                >
                                                    Marže: {formatPrice(itemFinance.margin)}
                                                </p>
                                            </div>
                                        </div>

                                        <dl className="mt-4 grid gap-3 text-sm">
                                            <div>
                                                <dt className="font-medium text-gray-500">
                                                    Zdroj v katalogu
                                                </dt>
                                                <dd className="mt-1">
                                                    {item.serviceCatalogItem?.name ?? '—'}
                                                </dd>
                                            </div>
                                            <div>
                                                <dt className="font-medium text-gray-500">Popis</dt>
                                                <dd className="mt-1 whitespace-pre-wrap break-words rounded-md bg-slate-50 px-3 py-2">
                                                    {item.description ?? '—'}
                                                </dd>
                                            </div>
                                            <div>
                                                <dt className="font-medium text-gray-500">
                                                    Poznámka
                                                </dt>
                                                <dd className="mt-1 whitespace-pre-wrap break-words rounded-md bg-slate-50 px-3 py-2">
                                                    {item.note ?? '—'}
                                                </dd>
                                            </div>
                                            <div>
                                                <dt className="font-medium text-gray-500">
                                                    Pracovníci / dodavatelé
                                                </dt>
                                                <dd className="mt-1">
                                                    {item.assignments.length === 0 ? (
                                                        '—'
                                                    ) : (
                                                        <div className="grid gap-2">
                                                            {item.assignments.map(
                                                                (assignment) => (
                                                                    <div
                                                                        key={assignment.id}
                                                                        className="rounded-md bg-slate-50 px-3 py-2"
                                                                    >
                                                                        <p className="font-medium">
                                                                            {getAssignmentDisplayName(assignment)}
                                                                        </p>
                                                                        <p className="mt-1 text-sm text-gray-600">
                                                                            {mapAssignmentRoleToLabel(
                                                                                assignment.role
                                                                            )}
                                                                        </p>
                                                                        {assignment.workDescription ? (
                                                                            <p className="mt-1 whitespace-pre-wrap">
                                                                                {
                                                                                    assignment.workDescription
                                                                                }
                                                                            </p>
                                                                        ) : null}
                                                                        <p className="mt-1">
                                                                            Odměna:{' '}
                                                                            {formatPrice(
                                                                                assignment.reward.toString()
                                                                            )}
                                                                        </p>
                                                                    </div>
                                                                )
                                                            )}
                                                        </div>
                                                    )}
                                                </dd>
                                            </div>
                                        </dl>

                                        {canManageEvent ? (
                                            <div className="mt-4 flex flex-wrap items-center gap-2">
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
                                        ) : null}
                                    </article>
                                )
                            })}
                        </div>

                        <div data-filter-list="event-services" className="mt-4 hidden md:block">
                            <table className="w-full table-fixed border-collapse">
                                <thead>
                                    <tr className="border-b text-left">
                                        <th className="w-[24%] py-2 px-2">Název</th>
                                        <th className="w-[22%] py-2 px-2">Pracovníci / dodavatelé</th>
                                        <th className="w-[12%] py-2 px-2 text-right">Cena</th>
                                        <th className="w-[12%] py-2 px-2 text-right">Náklady</th>
                                        <th className="w-[12%] py-2 px-2 text-right">Marže</th>
                                        <th className="w-[18%] py-2 px-2">Akce</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {visibleServiceItems.map((item) => {
                                        const deleteServiceItem = deleteEventServiceItemAction.bind(null, {
                                            eventId: event.id,
                                            serviceItemId: item.id,
                                        })
                                        const itemFinance =
                                            calculateEventServiceItemFinance(item)
                                        const filterText = [
                                            item.customName,
                                            item.serviceCatalogItem?.name,
                                            item.price.toString(),
                                            formatPrice(item.price.toString()),
                                            item.description,
                                            item.note,
                                            ...item.assignments.flatMap((assignment) => [
                                                getAssignmentDisplayName(assignment),
                                                assignment.user?.email,
                                                mapAssignmentRoleToLabel(assignment.role),
                                                assignment.workDescription,
                                                assignment.reward.toString(),
                                            ]),
                                        ]
                                            .filter(Boolean)
                                            .join(' ')

                                        return (
                                            <tr
                                                key={item.id}
                                                data-filter-item
                                                data-filter-text={filterText}
                                                className="border-b"
                                            >
                                                <td className="break-words py-2 px-2">
                                                    <span className="group relative inline-flex">
                                                        <span className="font-medium underline decoration-slate-300 underline-offset-4 hover:decoration-teal-400">
                                                            {item.customName}
                                                        </span>
                                                        <span className="pointer-events-none absolute left-0 top-full z-20 mt-1 hidden w-72 rounded-md border border-slate-200 bg-white p-3 text-xs shadow-xl group-hover:block group-focus-within:block">
                                                            <span className="block font-semibold text-gray-900">
                                                                {item.customName}
                                                            </span>
                                                            <span className="mt-2 grid gap-2">
                                                                <span>
                                                                    <span className="block text-gray-500">
                                                                        Zdroj v katalogu
                                                                    </span>
                                                                    <span>
                                                                        {item.serviceCatalogItem?.name ??
                                                                            '—'}
                                                                    </span>
                                                                </span>
                                                                <span>
                                                                    <span className="block text-gray-500">
                                                                        Popis
                                                                    </span>
                                                                    <span className="whitespace-pre-wrap">
                                                                        {item.description ?? '—'}
                                                                    </span>
                                                                </span>
                                                                <span>
                                                                    <span className="block text-gray-500">
                                                                        Poznámka
                                                                    </span>
                                                                    <span className="whitespace-pre-wrap">
                                                                        {item.note ?? '—'}
                                                                    </span>
                                                                </span>
                                                            </span>
                                                        </span>
                                                    </span>
                                                </td>
                                                <td className="py-2 px-2">
                                                    {item.assignments.length === 0 ? (
                                                        '—'
                                                    ) : (
                                                        <div className="flex flex-wrap gap-1.5">
                                                            {item.assignments.map(
                                                                (assignment) => (
                                                                    <span
                                                                        key={assignment.id}
                                                                        className="group relative inline-flex"
                                                                    >
                                                                        <span className="rounded-full border border-slate-200 bg-white px-2 py-1 text-sm leading-none hover:border-teal-300 hover:bg-teal-50">
                                                                            {getAssignmentDisplayName(assignment)}
                                                                        </span>
                                                                        <span className="pointer-events-none absolute left-0 top-full z-20 mt-1 hidden w-64 rounded-md border border-slate-200 bg-white p-3 text-xs shadow-xl group-hover:block group-focus-within:block">
                                                                            <span className="block font-semibold text-gray-900">
                                                                                {getAssignmentDisplayName(assignment)}
                                                                            </span>
                                                                            <span className="mt-2 grid gap-1">
                                                                                <span>
                                                                                    <span className="block text-gray-500">
                                                                                        Role
                                                                                    </span>
                                                                                    <span>
                                                                                        {mapAssignmentRoleToLabel(
                                                                                            assignment.role
                                                                                        )}
                                                                                    </span>
                                                                                </span>
                                                                                <span>
                                                                                    <span className="block text-gray-500">
                                                                                        Popis práce
                                                                                    </span>
                                                                                    <span>
                                                                                        {assignment.workDescription ??
                                                                                            '—'}
                                                                                    </span>
                                                                                </span>
                                                                                <span>
                                                                                    <span className="block text-gray-500">
                                                                                        Odměna
                                                                                    </span>
                                                                                    <span>
                                                                                        {formatPrice(
                                                                                            assignment.reward.toString()
                                                                                        )}
                                                                                    </span>
                                                                                </span>
                                                                            </span>
                                                                        </span>
                                                                    </span>
                                                                )
                                                            )}
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="whitespace-nowrap py-2 px-2 text-right">
                                                    {formatPrice(item.price.toString())}
                                                </td>
                                                <td className="whitespace-nowrap py-2 px-2 text-right">
                                                    {formatPrice(itemFinance.workerCosts)}
                                                </td>
                                                <td
                                                    className={`whitespace-nowrap py-2 px-2 text-right font-medium ${itemFinance.margin < 0
                                                            ? 'text-red-700'
                                                            : 'text-teal-700'
                                                        }`}
                                                >
                                                    {formatPrice(itemFinance.margin)}
                                                </td>
                                                <td className="service-item-actions-cell py-2 px-2">
                                                    {canManageEvent ? (
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
                                                    ) : (
                                                        '—'
                                                    )}
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}
            </section>

            {finance ? (
                <section className="mt-8 rounded-xl border p-4 sm:p-6">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                            <h2 className="text-xl font-semibold">Náklady</h2>
                            <p className="mt-1 text-sm text-gray-600">
                                Ruční výdaje akce mimo odměny pracovníků.
                            </p>
                        </div>
                    </div>

                    {success === 'NakladBylPridan' ? (
                        <p className="mt-4 rounded-md border border-green-500/40 px-4 py-3 text-sm text-green-300">
                            Náklad byl přidán.
                        </p>
                    ) : null}

                    {financeError ? (
                        <p className="mt-4 rounded-md border border-red-500/40 px-4 py-3 text-sm text-red-300">
                            {financeError}
                        </p>
                    ) : null}

                    {canManageEvent ? (
                        <form
                            action={createCost}
                            className="mt-6 grid gap-4 rounded-lg border border-slate-200 bg-slate-50 p-4 md:grid-cols-[minmax(0,1fr)_14rem] lg:grid-cols-[minmax(0,1fr)_14rem_auto]"
                        >
                            <div className="grid gap-2">
                                <label htmlFor="costName" className="text-sm font-medium">
                                    Název nákladu
                                </label>
                                <input
                                    id="costName"
                                    name="costName"
                                    required
                                    className={inputClass}
                                    placeholder="Např. doprava"
                                />
                            </div>
                            <div className="grid gap-2">
                                <label htmlFor="costAmount" className="text-sm font-medium">
                                    Částka
                                </label>
                                <input
                                    id="costAmount"
                                    name="costAmount"
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    required
                                    className={`${inputClass} text-right`}
                                    placeholder="0"
                                />
                            </div>
                            <div className="grid gap-2 md:col-span-2 lg:col-span-2">
                                <label htmlFor="costNote" className="text-sm font-medium">
                                    Poznámka
                                </label>
                                <textarea
                                    id="costNote"
                                    name="costNote"
                                    rows={2}
                                    className={inputClass}
                                    placeholder="Volitelná poznámka"
                                />
                            </div>
                            <div className="flex items-end md:col-span-2 lg:col-span-1 lg:justify-end">
                                <button type="submit" className={`${primaryButtonClass} w-full lg:w-fit`}>
                                    Přidat náklad
                                </button>
                            </div>
                        </form>
                    ) : null}

                    {event.costs.length === 0 ? (
                        <p className="mt-6 text-sm text-gray-600">
                            Zatím nejsou zadané žádné další náklady.
                        </p>
                    ) : (
                        <>
                            <div className="mt-6 grid gap-3 md:hidden">
                                {event.costs.map((cost) => {
                                    const deleteCost = deleteEventCostAction.bind(null, {
                                        eventId: event.id,
                                        costId: cost.id,
                                    })

                                    return (
                                        <article
                                            key={cost.id}
                                            className="rounded-lg border border-slate-200 bg-white p-4"
                                        >
                                            <div className="flex items-start justify-between gap-3">
                                                <div>
                                                    <h3 className="font-semibold">{cost.name}</h3>
                                                    <p className="mt-1 font-medium">
                                                        {formatPrice(cost.amount.toString())}
                                                    </p>
                                                </div>
                                                {canManageEvent ? (
                                                    <form action={deleteCost}>
                                                        <ConfirmSubmitButton
                                                            confirmMessage="Opravdu chceš smazat tento náklad?"
                                                            className={compactSecondaryButtonClass}
                                                        >
                                                            Smazat
                                                        </ConfirmSubmitButton>
                                                    </form>
                                                ) : null}
                                            </div>
                                            <p className="mt-3 whitespace-pre-wrap text-sm text-gray-600">
                                                {cost.note ?? '—'}
                                            </p>
                                        </article>
                                    )
                                })}
                            </div>

                            <div className="mt-6 hidden overflow-hidden rounded-lg border border-slate-200 md:block">
                                <table className="w-full table-fixed border-collapse">
                                    <thead>
                                        <tr className="border-b bg-slate-50 text-left">
                                            <th className="w-[30%] py-2 px-2">Název</th>
                                            <th className="w-[18%] py-2 px-2 text-right">
                                                Částka
                                            </th>
                                            <th className="w-[34%] py-2 px-2">Poznámka</th>
                                            <th className="w-[18%] py-2 px-2">Akce</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {event.costs.map((cost) => {
                                            const deleteCost = deleteEventCostAction.bind(null, {
                                                eventId: event.id,
                                                costId: cost.id,
                                            })

                                            return (
                                                <tr key={cost.id} className="border-b">
                                                    <td className="break-words py-2 px-2">
                                                        {cost.name}
                                                    </td>
                                                    <td className="whitespace-nowrap py-2 px-2 text-right">
                                                        {formatPrice(cost.amount.toString())}
                                                    </td>
                                                    <td className="whitespace-pre-wrap break-words py-2 px-2">
                                                        {cost.note ?? '—'}
                                                    </td>
                                                    <td className="py-2 px-2">
                                                        {canManageEvent ? (
                                                            <form action={deleteCost}>
                                                                <ConfirmSubmitButton
                                                                    confirmMessage="Opravdu chceš smazat tento náklad?"
                                                                    className={compactSecondaryButtonClass}
                                                                >
                                                                    Smazat
                                                                </ConfirmSubmitButton>
                                                            </form>
                                                        ) : (
                                                            '—'
                                                        )}
                                                    </td>
                                                </tr>
                                            )
                                        })}
                                    </tbody>
                                    <tfoot>
                                        <tr className="bg-slate-50">
                                            <td
                                                colSpan={3}
                                                className="py-3 px-2 font-semibold"
                                            >
                                                Celkem další náklady
                                            </td>
                                            <td className="whitespace-nowrap py-3 px-2 text-right font-semibold">
                                                {formatPrice(finance.eventCosts)}
                                            </td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        </>
                    )}
                </section>
            ) : null}
        </main>
    )
}
