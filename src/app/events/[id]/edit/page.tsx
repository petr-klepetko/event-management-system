import { notFound } from 'next/navigation'
import Breadcrumbs from '@/components/navigation/Breadcrumbs'
import EventClientFields from '@/components/forms/EventClientFields'
import {
    buttonClass,
    inputClass,
    optionClass,
} from '@/lib/ui/styles'
import { getEventById, getEventFormOptions } from '@/modules/events/event.service'
import { eventStatusOptions } from '@/modules/events/event.utils'
import { updateEventAction } from '../../actions'
import { canManageOwnedTenantData, requireTenantManagerContext } from '@/lib/auth/current-user'

type EditEventPageProps = {
    params: Promise<{
        id: string
    }>
    searchParams: Promise<{
        error?: string
    }>
}

function formatDateTimeLocal(value: Date) {
    const offsetMs = value.getTimezoneOffset() * 60 * 1000
    const localDate = new Date(value.getTime() - offsetMs)

    return localDate.toISOString().slice(0, 16)
}

export default async function EditEventPage({
    params,
    searchParams,
}: EditEventPageProps) {
    const { id } = await params
    const { error } = await searchParams
    const auth = await requireTenantManagerContext()

    const [event, formOptions] = await Promise.all([
        getEventById(id, auth),
        getEventFormOptions(auth),
    ])

    if (!event) {
        notFound()
    }

    if (!canManageOwnedTenantData(auth, event.ownerUserId)) {
        notFound()
    }

    const updateAction = updateEventAction.bind(null, {
        eventId: event.id,
    })

    return (
        <main className="mx-auto max-w-4xl p-8">
            <Breadcrumbs
                items={[
                    { label: 'Domů', href: '/' },
                    { label: 'Akce', href: '/events' },
                    { label: event.title, href: `/events/${event.id}` },
                    { label: 'Upravit akci', href: `/events/${event.id}/edit` },
                ]}
            />

            <div>
                <h1 className="text-3xl font-bold">Upravit akci</h1>
            </div>

            <section className="mt-8 rounded-xl border p-6">
                <h2 className="text-xl font-semibold">Základní údaje</h2>

                {error ? (
                    <p className="mt-4 rounded-md border border-red-500/40 px-4 py-3 text-sm text-red-300">
                        {error}
                    </p>
                ) : null}

                <form action={updateAction} className="mt-4 grid gap-4">
                    <div className="grid gap-2">
                        <label htmlFor="title" className="font-medium">
                            Název
                        </label>
                        <input
                            id="title"
                            name="title"
                            type="text"
                            required
                            defaultValue={event.title}
                            className={inputClass}
                        />
                    </div>

                    <div className="grid gap-2 sm:grid-cols-2">
                        <div className="grid gap-2">
                            <label htmlFor="eventType" className="font-medium">
                                Typ akce
                            </label>
                            <input
                                id="eventType"
                                name="eventType"
                                type="text"
                                required
                                defaultValue={event.eventType}
                                className={inputClass}
                            />
                        </div>

                        <div className="grid gap-2">
                            <label htmlFor="status" className="font-medium">
                                Stav
                            </label>
                            <select
                                id="status"
                                name="status"
                                defaultValue={event.status}
                                className={inputClass}
                            >
                                {eventStatusOptions.map((status) => (
                                    <option
                                        className={optionClass}
                                        key={status.value}
                                        value={status.value}
                                    >
                                        {status.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="grid gap-2 sm:grid-cols-2">
                        <div className="grid gap-2">
                            <label htmlFor="dateStart" className="font-medium">
                                Datum a čas
                            </label>
                            <input
                                id="dateStart"
                                name="dateStart"
                                type="datetime-local"
                                required
                                defaultValue={formatDateTimeLocal(event.dateStart)}
                                className={inputClass}
                            />
                        </div>

                        <div className="grid gap-2">
                            <label htmlFor="venueName" className="font-medium">
                                Místo
                            </label>
                            <input
                                id="venueName"
                                name="venueName"
                                type="text"
                                defaultValue={event.venueName ?? ''}
                                className={inputClass}
                            />
                        </div>
                    </div>

                    <EventClientFields
                        clients={formOptions.clients}
                        contacts={formOptions.contacts}
                        defaultClientMode={event.clientId ? 'REGULAR' : 'ONE_OFF'}
                        defaultClientId={event.clientId}
                        defaultPrimaryContactId={event.primaryContactId}
                        defaultOneOffClientName={event.oneOffClientName}
                        defaultOneOffClientPhone={event.oneOffClientPhone}
                        defaultOneOffClientEmail={event.oneOffClientEmail}
                    />

                    <div className="grid gap-2">
                        <label htmlFor="internalNote" className="font-medium">
                            Interní poznámka
                        </label>
                        <textarea
                            id="internalNote"
                            name="internalNote"
                            rows={4}
                            defaultValue={event.internalNote ?? ''}
                            className={inputClass}
                        />
                    </div>

                    <label className="flex items-start gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4">
                        <input
                            name="hideOfferItemPrices"
                            type="checkbox"
                            defaultChecked={event.hideOfferItemPrices}
                            className="mt-1"
                        />
                        <span>
                            <span className="block font-medium">
                                Skrýt ceny jednotlivých položek v nabídce
                            </span>
                            <span className="mt-1 block text-sm text-gray-600">
                                V PDF nabídce zůstane vidět celková cena, ale u služeb se
                                nezobrazí ceny po položkách.
                            </span>
                        </span>
                    </label>

                    <button type="submit" className={buttonClass}>
                        Uložit změny
                    </button>
                </form>
            </section>
        </main>
    )
}
