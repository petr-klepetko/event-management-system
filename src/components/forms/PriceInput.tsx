'use client'

import type { ComponentPropsWithoutRef } from 'react'
import { formatEditablePrice } from '@/lib/money'

type PriceInputProps = Omit<ComponentPropsWithoutRef<'input'>, 'type'> & {
    onValueChange?: (value: string) => void
}

export default function PriceInput({ defaultValue, onBlur, onValueChange, ...props }: PriceInputProps) {
    return (
        <input
            {...props}
            type="text"
            inputMode="decimal"
            defaultValue={defaultValue == null ? defaultValue : formatEditablePrice(String(defaultValue))}
            onBlur={(event) => {
                const formatted = formatEditablePrice(event.currentTarget.value)
                event.currentTarget.value = formatted
                onValueChange?.(formatted)
                onBlur?.(event)
            }}
        />
    )
}
