'use client'

import { useEffect, useId, useState } from 'react'
import { inputClass } from '@/lib/ui/styles'

type ClientSideListFilterProps = {
    listId: string
    label?: string
    placeholder?: string
}

export default function ClientSideListFilter({
    listId,
    label = 'Filtrovat',
    placeholder = 'Hledat...',
}: ClientSideListFilterProps) {
    const inputId = useId()
    const [query, setQuery] = useState('')

    useEffect(() => {
        const normalizedQuery = query.trim().toLowerCase()
        const items = Array.from(
            document.querySelectorAll<HTMLElement>(
                `[data-filter-list="${listId}"] [data-filter-item]`
            )
        )
        const emptyMessages = Array.from(
            document.querySelectorAll<HTMLElement>(
                `[data-filter-empty="${listId}"]`
            )
        )

        let visibleCount = 0

        for (const item of items) {
            const text = item.dataset.filterText?.toLowerCase() ?? ''
            const isVisible = !normalizedQuery || text.includes(normalizedQuery)

            item.hidden = !isVisible

            if (isVisible) {
                visibleCount += 1
            }
        }

        for (const emptyMessage of emptyMessages) {
            emptyMessage.hidden = visibleCount > 0
        }
    }, [listId, query])

    return (
        <div className="mt-4 grid gap-2 sm:max-w-sm">
            <label htmlFor={inputId} className="text-sm font-medium text-gray-500">
                {label}
            </label>
            <input
                id={inputId}
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                className={inputClass}
                placeholder={placeholder}
            />
        </div>
    )
}
