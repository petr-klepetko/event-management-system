type OfferServiceItem = {
    id: string
    name: string
    description: string
    price: string
}

type OfferServicesTableProps = {
    items: OfferServiceItem[]
    totalPrice: string
    hideItemPrices: boolean
}

export default function OfferServicesTable({
    items,
    totalPrice,
    hideItemPrices,
}: OfferServicesTableProps) {
    if (items.length === 0) {
        return (
            <p className="offer-empty">
                K této akci zatím nejsou přidané žádné služby.
            </p>
        )
    }

    return (
        <>
            <table className="offer-table">
                <thead>
                    <tr>
                        <th>Služba</th>
                        <th>Popis</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    {items.map((item) => (
                        <tr key={item.id}>
                            <td>{item.name}</td>
                            <td>{item.description}</td>
                            {!hideItemPrices ? <td>{item.price}</td> : <td></td>}
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
