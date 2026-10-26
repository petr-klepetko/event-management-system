'use client'

import { useEffect, useState } from 'react'
import ClientCombobox from '@/components/forms/ClientCombobox'
import SearchableSelect from '@/components/forms/SearchableSelect'
import type { PersistedFormField } from '@/components/forms/PersistedForm'
import { inputClass } from '@/lib/ui/styles'

type ClientOption = {
    id: string
    name: string
}

type ContactOption = {
    id: string
    firstName: string
    lastName: string
    instagram: string | null
    clientId: string
    client: {
        name: string
    }
}

type EventClientFieldsProps = {
    clients: ClientOption[]
    contacts: ContactOption[]
    defaultClientMode?: 'REGULAR' | 'ONE_OFF'
    defaultClientId?: string | null
    defaultPrimaryContactId?: string | null
    defaultOneOffClientName?: string | null
    defaultOneOffClientPhone?: string | null
    defaultOneOffClientEmail?: string | null
    persistenceKey?: string
}

type PersistedEventClientFields = {
    clientMode?: 'REGULAR' | 'ONE_OFF'
    clientId?: string
    primaryContactId?: string
    oneOffClientName?: string
    oneOffClientPhone?: string
    oneOffClientEmail?: string
}

function getPersistedEventClientFields(persistenceKey?: string) {
    if (!persistenceKey || !new URLSearchParams(window.location.search).has('error')) {
        return null
    }

    const savedValue = window.sessionStorage.getItem(persistenceKey)

    if (!savedValue) {
        return null
    }

    try {
        const savedFields = JSON.parse(savedValue) as PersistedFormField[]
        const getValue = (name: string) =>
            savedFields.find((field) => field.name === name)?.value
        const savedMode = getValue('clientMode')

        return {
            clientMode:
                savedMode === 'REGULAR' || savedMode === 'ONE_OFF'
                    ? savedMode
                    : undefined,
            clientId: getValue('clientId'),
            primaryContactId: getValue('primaryContactId'),
            oneOffClientName: getValue('oneOffClientName'),
            oneOffClientPhone: getValue('oneOffClientPhone'),
            oneOffClientEmail: getValue('oneOffClientEmail'),
        } satisfies PersistedEventClientFields
    } catch {
        window.sessionStorage.removeItem(persistenceKey)
        return null
    }
}

export default function EventClientFields({
    clients,
    contacts,
    defaultClientMode,
    defaultClientId,
    defaultPrimaryContactId,
    defaultOneOffClientName,
    defaultOneOffClientPhone,
    defaultOneOffClientEmail,
    persistenceKey,
}: EventClientFieldsProps) {
    const [clientMode, setClientMode] = useState<'REGULAR' | 'ONE_OFF'>(
        defaultClientMode ?? (defaultClientId ? 'REGULAR' : 'ONE_OFF')
    )
    const [persistedFields, setPersistedFields] =
        useState<PersistedEventClientFields | null>(null)

    useEffect(() => {
        const persistedEventClientFields = getPersistedEventClientFields(persistenceKey)

        if (!persistedEventClientFields) {
            return
        }

        const timeoutId = window.setTimeout(() => {
            setPersistedFields(persistedEventClientFields)

            if (persistedEventClientFields.clientMode) {
                setClientMode(persistedEventClientFields.clientMode)
            }
        }, 0)

        return () => window.clearTimeout(timeoutId)
    }, [persistenceKey])

    const clientId = persistedFields?.clientId ?? defaultClientId ?? undefined
    const primaryContactId =
        persistedFields?.primaryContactId ?? defaultPrimaryContactId ?? ''
    const oneOffClientName =
        persistedFields?.oneOffClientName ?? defaultOneOffClientName ?? ''
    const oneOffClientPhone =
        persistedFields?.oneOffClientPhone ?? defaultOneOffClientPhone ?? ''
    const oneOffClientEmail =
        persistedFields?.oneOffClientEmail ?? defaultOneOffClientEmail ?? ''

    return (
        <div className="grid gap-4">
            <input name="clientMode" type="hidden" value={clientMode} />

            <div className="flex flex-wrap gap-2">
                <button
                    type="button"
                    onClick={() => setClientMode('REGULAR')}
                    className={`rounded-md border px-3 py-2 text-sm font-medium transition-colors ${
                        clientMode === 'REGULAR' ? 'btn-primary' : 'btn-secondary'
                    }`}
                >
                    Pravidelný klient
                </button>
                <button
                    type="button"
                    onClick={() => setClientMode('ONE_OFF')}
                    className={`rounded-md border px-3 py-2 text-sm font-medium transition-colors ${
                        clientMode === 'ONE_OFF' ? 'btn-primary' : 'btn-secondary'
                    }`}
                >
                    Jednorázová akce
                </button>
            </div>

            {clientMode === 'REGULAR' ? (
                <div className="grid gap-2 sm:grid-cols-2">
                    <div className="grid gap-2">
                        <label htmlFor="clientId" className="font-medium">
                            Klient
                        </label>
                        <ClientCombobox
                            clients={clients}
                            defaultClientId={clientId}
                            required
                        />
                    </div>

                    <div className="grid gap-2">
                        <label htmlFor="primaryContactId" className="font-medium">
                            Hlavní kontakt
                        </label>
                        <SearchableSelect
                            id="primaryContactId"
                            name="primaryContactId"
                            defaultValue={primaryContactId}
                            placeholder="Začni psát jméno kontaktu nebo klienta..."
                            emptyOptionLabel="Bez vybraného kontaktu"
                            options={contacts.map((contact) => ({
                                value: contact.id,
                                label: `${contact.firstName} ${contact.lastName} (${contact.client.name})`,
                                searchText: `${contact.firstName} ${contact.lastName} ${contact.instagram ?? ''} ${contact.client.name}`,
                            }))}
                        />
                    </div>
                </div>
            ) : (
                <div className="grid gap-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
                    <input name="clientId" type="hidden" value="" />
                    <input name="primaryContactId" type="hidden" value="" />

                    <div className="grid gap-2">
                        <label htmlFor="oneOffClientName" className="font-medium">
                            Název klienta
                        </label>
                        <input
                            id="oneOffClientName"
                            name="oneOffClientName"
                            type="text"
                            required
                            defaultValue={oneOffClientName}
                            className={inputClass}
                            placeholder="Např. rodiče 4.A"
                        />
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                        <div className="grid gap-2">
                            <label htmlFor="oneOffClientPhone" className="font-medium">
                                Telefon
                            </label>
                            <input
                                id="oneOffClientPhone"
                                name="oneOffClientPhone"
                                type="text"
                                defaultValue={oneOffClientPhone}
                                className={inputClass}
                                placeholder="+420 777 000 000"
                            />
                        </div>

                        <div className="grid gap-2">
                            <label htmlFor="oneOffClientEmail" className="font-medium">
                                E-mail
                            </label>
                            <input
                                id="oneOffClientEmail"
                                name="oneOffClientEmail"
                                type="email"
                                defaultValue={oneOffClientEmail}
                                className={inputClass}
                                placeholder="kontakt@example.cz"
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
