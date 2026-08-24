'use client'

import { useMemo, useState } from 'react'
import { inputClass } from '@/lib/ui/styles'

type ClientOption = {
    id: string
    name: string
}

type ClientComboboxProps = {
    clients: ClientOption[]
    defaultClientId?: string
    required?: boolean
}

export default function ClientCombobox({
    clients,
    defaultClientId,
    required = false,
}: ClientComboboxProps) {
    const defaultClient =
        clients.find((client) => client.id === defaultClientId) ?? null
    const [selectedClientId, setSelectedClientId] = useState(defaultClient?.id ?? '')
    const [query, setQuery] = useState(defaultClient?.name ?? '')
    const [isOpen, setIsOpen] = useState(false)

    const filteredClients = useMemo(() => {
        const normalizedQuery = query.trim().toLowerCase()

        if (!normalizedQuery) {
            return clients
        }

        return clients.filter((client) =>
            client.name.toLowerCase().includes(normalizedQuery)
        )
    }, [clients, query])

    function selectClient(client: ClientOption) {
        setSelectedClientId(client.id)
        setQuery(client.name)
        setIsOpen(false)
    }

    return (
        <div className="relative grid gap-2">
            <input
                name="clientId"
                type="hidden"
                value={selectedClientId}
                required={required}
            />
            <input
                id="clientId"
                type="search"
                value={query}
                onChange={(event) => {
                    setQuery(event.target.value)
                    setSelectedClientId('')
                    setIsOpen(true)
                }}
                onFocus={() => setIsOpen(true)}
                className={inputClass}
                placeholder="Začni psát název klienta..."
                autoComplete="off"
                role="combobox"
                aria-expanded={isOpen}
                aria-controls="client-combobox-options"
            />

            {isOpen ? (
                <div
                    id="client-combobox-options"
                    className="absolute top-full z-10 mt-1 max-h-64 w-full overflow-y-auto rounded-md border border-slate-200 bg-white shadow-lg"
                >
                    {filteredClients.length === 0 ? (
                        <p className="px-3 py-2 text-sm text-gray-600">
                            Žádný klient neodpovídá filtru.
                        </p>
                    ) : (
                        filteredClients.map((client) => (
                            <button
                                key={client.id}
                                type="button"
                                onMouseDown={(event) => event.preventDefault()}
                                onClick={() => selectClient(client)}
                                className="block w-full px-3 py-2 text-left text-sm hover:bg-slate-50"
                            >
                                {client.name}
                            </button>
                        ))
                    )}
                </div>
            ) : null}
        </div>
    )
}
