export function stripPriceWhitespace(value: string) {
    return value.replace(/\s/gu, '')
}

function readNonNegativePrice(value: string) {
    const normalized = stripPriceWhitespace(value).replace(',', '.')

    if (!/^\d+(?:\.\d{1,2})?$/.test(normalized)) {
        return null
    }

    const amount = Number(normalized)

    if (!Number.isFinite(amount) || amount > 99999999.99) {
        return null
    }

    return amount
}

export function formatEditablePrice(value: string) {
    const amount = readNonNegativePrice(value)

    if (amount === null) {
        return value
    }

    return new Intl.NumberFormat('cs-CZ', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(amount)
}

export function parseNonNegativePrice(value: string, label: string) {
    const amount = readNonNegativePrice(value)

    if (amount === null) {
        throw new Error(`${label} musí být platné nezáporné číslo s nejvýše dvěma desetinnými místy.`)
    }

    return amount.toFixed(2)
}
