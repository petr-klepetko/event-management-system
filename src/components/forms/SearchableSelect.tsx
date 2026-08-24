'use client'

import { useId, useMemo, useState } from 'react'
import { inputClass } from '@/lib/ui/styles'

export type SearchableSelectOption = {
    value: string
    label: string
    searchText?: string
}

type SearchableSelectProps = {
    id?: string
    name: string
    options: SearchableSelectOption[]
    defaultValue?: string
    placeholder: string
    emptyOptionLabel?: string
    required?: boolean
    onValueChange?: (value: string) => void
}

export default function SearchableSelect({
    id,
    name,
    options,
    defaultValue = '',
    placeholder,
    emptyOptionLabel,
    required = false,
    onValueChange,
}: SearchableSelectProps) {
    const generatedId = useId()
    const inputId = id ?? generatedId
    const defaultOption =
        options.find((option) => option.value === defaultValue) ?? null
    const [selectedValue, setSelectedValue] = useState(defaultOption?.value ?? '')
    const [query, setQuery] = useState(defaultOption?.label ?? '')
    const [isOpen, setIsOpen] = useState(false)

    const filteredOptions = useMemo(() => {
        const normalizedQuery = query.trim().toLowerCase()

        if (!normalizedQuery) {
            return options
        }

        return options.filter((option) => {
            const text = `${option.label} ${option.searchText ?? ''}`.toLowerCase()

            return text.includes(normalizedQuery)
        })
    }, [options, query])

    function selectValue(value: string, label: string) {
        setSelectedValue(value)
        setQuery(label)
        setIsOpen(false)
        onValueChange?.(value)
    }

    function clearValue() {
        selectValue('', '')
    }

    return (
        <div className="relative grid gap-2">
            <input
                name={name}
                type="hidden"
                value={selectedValue}
                required={required}
            />
            <input
                id={inputId}
                type="search"
                value={query}
                onChange={(event) => {
                    setQuery(event.target.value)
                    setSelectedValue('')
                    setIsOpen(true)
                    onValueChange?.('')
                }}
                onFocus={() => setIsOpen(true)}
                onBlur={() => {
                    window.setTimeout(() => setIsOpen(false), 120)
                }}
                className={inputClass}
                placeholder={placeholder}
                autoComplete="off"
                role="combobox"
                aria-expanded={isOpen}
                aria-controls={`${inputId}-options`}
            />

            {isOpen ? (
                <div
                    id={`${inputId}-options`}
                    className="absolute top-full z-10 mt-1 max-h-64 w-full overflow-y-auto rounded-md border border-slate-200 bg-white shadow-lg"
                >
                    {emptyOptionLabel ? (
                        <button
                            type="button"
                            onMouseDown={(event) => event.preventDefault()}
                            onClick={clearValue}
                            className="block w-full px-3 py-2 text-left text-sm text-gray-600 hover:bg-slate-50"
                        >
                            {emptyOptionLabel}
                        </button>
                    ) : null}

                    {filteredOptions.length === 0 ? (
                        <p className="px-3 py-2 text-sm text-gray-600">
                            Nic neodpovídá filtru.
                        </p>
                    ) : (
                        filteredOptions.map((option) => (
                            <button
                                key={option.value}
                                type="button"
                                onMouseDown={(event) => event.preventDefault()}
                                onClick={() => selectValue(option.value, option.label)}
                                className="block w-full px-3 py-2 text-left text-sm hover:bg-slate-50"
                            >
                                {option.label}
                            </button>
                        ))
                    )}
                </div>
            ) : null}
        </div>
    )
}
