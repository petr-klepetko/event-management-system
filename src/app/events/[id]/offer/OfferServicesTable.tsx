'use client'

import { useState } from 'react'

type OfferServiceItem = {
    id: string
    name: string
    description: string
    price: string
}

type OfferServicesTableProps = {
    items: OfferServiceItem[]
    totalPrice: string
}

export default function OfferServicesTable({
    items,
    totalPrice,
}: OfferServicesTableProps) {
    const [hideItemPrices, setHideItemPrices] = useState(false)

    if (items.length === 0) {
        return (
            <p className="offer-empty">
                K této akci zatím nejsou přidané žádné služby.
            </p>
        )
    }

    return (
        <>
            <label className="offer-toggle print-hidden">
                <input
                    type="checkbox"
                    checked={hideItemPrices}
                    onChange={(event) => setHideItemPrices(event.target.checked)}
                />
                <span>Skrýt ceny jednotlivých položek</span>
            </label>

            <table className="offer-table">
                <thead>
                    <tr>
                        <th>Služba</th>
                        <th>Popis</th>
                        {!hideItemPrices ? <th>Cena</th> : null}
                    </tr>
                </thead>
                <tbody>
                    {items.map((item) => (
                        <tr key={item.id}>
                            <td>{item.name}</td>
                            <td>{item.description}</td>
                            {!hideItemPrices ? <td>{item.price}</td> : null}
                        </tr>
                    ))}
                </tbody>
                <tfoot>
                    <tr>
                        <td colSpan={hideItemPrices ? 1 : 2}>Celkem</td>
                        <td>{totalPrice}</td>
                    </tr>
                </tfoot>
            </table>
        </>
    )
}
