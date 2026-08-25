'use client'

import SearchableSelect from '@/components/forms/SearchableSelect'
import EventServiceAssignmentsEditor from '@/components/forms/EventServiceAssignmentsEditor'
import { buttonClass, inputClass } from '@/lib/ui/styles'
import { useState } from 'react'

type CatalogItem = {
    id: string
    name: string
    defaultPrice: string
    defaultDescription: string
}

type Props = {
    catalogItems: CatalogItem[]
    assignableUsers: Array<{
        id: string
        fullName: string
        email: string
    }>
    action: (formData: FormData) => void
}

export default function AddServiceForm({
    catalogItems,
    assignableUsers,
    action,
}: Props) {
    const [customName, setCustomName] = useState('')
    const [price, setPrice] = useState('')
    const [description, setDescription] = useState('')

    function handleCatalogChange(selectedId: string) {
        const item = catalogItems.find((i) => i.id === selectedId)

        if (!item) {
            setCustomName('')
            setPrice('')
            setDescription('')
            return
        }

        setCustomName(item.name)
        setPrice(item.defaultPrice)
        setDescription(item.defaultDescription)
    }

    return (
        <form action={action} className="mt-4 grid gap-4">
            <div className="grid gap-2">
                <label htmlFor="serviceCatalogItemId" className="font-medium">
                    Služba z katalogu
                </label>
                <SearchableSelect
                    id="serviceCatalogItemId"
                    name="serviceCatalogItemId"
                    placeholder="Začni psát název služby..."
                    emptyOptionLabel="Bez vybrané katalogové služby"
                    options={catalogItems.map((item) => ({
                        value: item.id,
                        label: `${item.name} (${item.defaultPrice} Kč)`,
                        searchText: `${item.name} ${item.defaultPrice} ${item.defaultDescription}`,
                    }))}
                    onValueChange={handleCatalogChange}
                />
            </div>

            <div className="grid gap-2 sm:grid-cols-2">
                <div className="grid gap-2">
                    <label className="font-medium">Název služby</label>
                    <input
                        name="customName"
                        value={customName}
                        onChange={(e) => setCustomName(e.target.value)}
                        required
                        className={inputClass}
                    />
                </div>

                <div className="grid gap-2">
                    <label className="font-medium">Cena</label>
                    <input
                        name="price"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        required
                        className={inputClass}
                    />
                </div>
            </div>

            <div className="grid gap-2">
                <label className="font-medium">Popis do smlouvy</label>
                <textarea
                    name="description"
                    rows={3}
                    onChange={(e) => setDescription(e.target.value)}
                    className={inputClass}
                    value={description}
                />
            </div>

            <div className="grid gap-2">
                <label className="font-medium">Interní poznámka</label>
                <textarea
                    name="note"
                    rows={3}
                    className={inputClass}
                />
            </div>

            <EventServiceAssignmentsEditor users={assignableUsers} />

            <button
                type="submit"
                className={buttonClass}
            >
                Přidat službu
            </button>
        </form>
    )
}
