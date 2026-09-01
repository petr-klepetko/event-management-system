'use client'

import { useState } from 'react'
import ClientCombobox from '@/components/forms/ClientCombobox'
import SearchableSelect from '@/components/forms/SearchableSelect'
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
}: EventClientFieldsProps) {
    const [clientMode, setClientMode] = useState<'REGULAR' | 'ONE_OFF'>(
        defaultClientMode ?? (defaultClientId ? 'REGULAR' : 'ONE_OFF')
    )

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
                            defaultClientId={defaultClientId ?? undefined}
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
                            defaultValue={defaultPrimaryContactId ?? ''}
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
                            defaultValue={defaultOneOffClientName ?? ''}
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
                                defaultValue={defaultOneOffClientPhone ?? ''}
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
                                defaultValue={defaultOneOffClientEmail ?? ''}
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
