import Link from 'next/link'
import Breadcrumbs from '@/components/navigation/Breadcrumbs'
import { getEventFinanceRows } from '@/modules/events/event.service'
import { requireAuthContext } from '@/lib/auth/current-user'

export const dynamic = 'force-dynamic'

function formatPrice(value: number) {
    return new Intl.NumberFormat('cs-CZ', {
        style: 'currency',
        currency: 'CZK',
    }).format(value)
}

function formatDate(value: Date) {
    return new Intl.DateTimeFormat('cs-CZ', {
        dateStyle: 'medium',
    }).format(value)
}

function groupRowsByYear(rows: Awaited<ReturnType<typeof getEventFinanceRows>>) {
    const groups = new Map<
        number,
        {
            year: number
            rows: typeof rows
            invoicePrice: number
            costs: number
            profit: number
        }
    >()

    for (const row of rows) {
        const year = row.dateStart.getFullYear()
        const group =
            groups.get(year) ??
            {
                year,
                rows: [],
                invoicePrice: 0,
                costs: 0,
                profit: 0,
            }

        group.rows.push(row)
        group.invoicePrice += row.invoicePrice
        group.costs += row.costs
        group.profit += row.profit
        groups.set(year, group)
    }

    return [...groups.values()].sort((a, b) => b.year - a.year)
}

export default async function FinancePage() {
    const auth = await requireAuthContext()
    const rows = await getEventFinanceRows(auth)
    const yearGroups = groupRowsByYear(rows)

    return (
        <main className="mx-auto max-w-5xl p-4 sm:p-8">
            <Breadcrumbs
                items={[
                    { label: 'Domů', href: '/' },
                    { label: 'Finance', href: '/finance' },
                ]}
            />

            <div>
                <h1 className="text-3xl font-bold">Finance</h1>
                <p className="mt-2 text-sm text-gray-600">
                    Přehled fakturačních cen, nákladů a zisku podle akcí.
                </p>
            </div>

            <section className="mt-8 rounded-xl border p-4 sm:p-6">
                <h2 className="text-xl font-semibold">Akce</h2>

                {rows.length === 0 ? (
                    <p className="mt-4 text-sm text-gray-600">
                        Zatím nejsou vytvořené žádné akce.
                    </p>
                ) : (
                    <>
                        <div className="mt-4 grid gap-6 md:hidden">
                            {yearGroups.map((group) => (
                                <section
                                    key={group.year}
                                    className="rounded-lg border border-slate-200 p-4"
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <h3 className="text-lg font-semibold">
                                            {group.year}
                                        </h3>
                                        <div className="text-right text-sm">
                                            <p>{formatPrice(group.invoicePrice)}</p>
                                            <p className="text-gray-600">
                                                Náklady {formatPrice(group.costs)}
                                            </p>
                                            <p
                                                className={`font-semibold ${
                                                    group.profit < 0
                                                        ? 'text-red-700'
                                                        : 'text-teal-700'
                                                }`}
                                            >
                                                Zisk {formatPrice(group.profit)}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="mt-4 grid gap-3">
                                        {group.rows.map((row) => (
                                            <article
                                                key={row.id}
                                                className="rounded-lg border border-slate-200 bg-white p-4"
                                            >
                                                <div className="flex items-start justify-between gap-3">
                                                    <div>
                                                        <h4 className="font-semibold">
                                                            <Link
                                                                href={`/events/${row.id}`}
                                                                className="underline underline-offset-4"
                                                            >
                                                                {row.title}
                                                            </Link>
                                                        </h4>
                                                        <p className="mt-1 text-sm text-gray-600">
                                                            {formatDate(row.dateStart)}
                                                        </p>
                                                    </div>
                                                    <p
                                                        className={`font-semibold ${
                                                            row.profit < 0
                                                                ? 'text-red-700'
                                                                : 'text-teal-700'
                                                        }`}
                                                    >
                                                        {formatPrice(row.profit)}
                                                    </p>
                                                </div>

                                                <dl className="mt-4 grid gap-3 text-sm">
                                                    <div>
                                                        <dt className="font-medium text-gray-500">
                                                            Fakturační cena
                                                        </dt>
                                                        <dd className="mt-1">
                                                            {formatPrice(row.invoicePrice)}
                                                        </dd>
                                                    </div>
                                                    <div>
                                                        <dt className="font-medium text-gray-500">
                                                            Náklady
                                                        </dt>
                                                        <dd className="mt-1">
                                                            {formatPrice(row.costs)}
                                                        </dd>
                                                    </div>
                                                </dl>
                                            </article>
                                        ))}
                                    </div>
                                </section>
                            ))}
                        </div>

                        <div className="mt-4 hidden grid-cols-1 gap-6 md:grid">
                            {yearGroups.map((group) => (
                                <section
                                    key={group.year}
                                    className="overflow-hidden rounded-lg border border-slate-200"
                                >
                                    <div className="flex items-center justify-between gap-4 border-b bg-slate-50 px-4 py-3">
                                        <h3 className="text-lg font-semibold">
                                            {group.year}
                                        </h3>
                                        <div className="flex flex-wrap items-center justify-end gap-x-6 gap-y-1 text-sm">
                                            <span>
                                                Fakturační cena{' '}
                                                <strong>
                                                    {formatPrice(group.invoicePrice)}
                                                </strong>
                                            </span>
                                            <span>
                                                Náklady{' '}
                                                <strong>{formatPrice(group.costs)}</strong>
                                            </span>
                                            <span
                                                className={
                                                    group.profit < 0
                                                        ? 'text-red-700'
                                                        : 'text-teal-700'
                                                }
                                            >
                                                Zisk{' '}
                                                <strong>
                                                    {formatPrice(group.profit)}
                                                </strong>
                                            </span>
                                        </div>
                                    </div>

                                    <table className="w-full table-fixed border-collapse">
                                        <thead>
                                            <tr className="border-b bg-slate-50 text-left">
                                                <th className="w-[14%] py-2 px-2">
                                                    Datum
                                                </th>
                                                <th className="w-[32%] py-2 px-2">
                                                    Název
                                                </th>
                                                <th className="w-[18%] py-2 px-2 text-right">
                                                    Fakturační cena
                                                </th>
                                                <th className="w-[18%] py-2 px-2 text-right">
                                                    Náklady
                                                </th>
                                                <th className="w-[18%] py-2 px-2 text-right">
                                                    Zisk
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {group.rows.map((row) => (
                                                <tr key={row.id} className="border-b">
                                                    <td className="py-2 px-2">
                                                        {formatDate(row.dateStart)}
                                                    </td>
                                                    <td className="break-words py-2 px-2">
                                                        <Link
                                                            href={`/events/${row.id}`}
                                                            className="underline underline-offset-4"
                                                        >
                                                            {row.title}
                                                        </Link>
                                                    </td>
                                                    <td className="whitespace-nowrap py-2 px-2 text-right">
                                                        {formatPrice(row.invoicePrice)}
                                                    </td>
                                                    <td className="whitespace-nowrap py-2 px-2 text-right">
                                                        {formatPrice(row.costs)}
                                                    </td>
                                                    <td
                                                        className={`whitespace-nowrap py-2 px-2 text-right font-medium ${
                                                            row.profit < 0
                                                                ? 'text-red-700'
                                                                : 'text-teal-700'
                                                        }`}
                                                    >
                                                        {formatPrice(row.profit)}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </section>
                            ))}
                        </div>
                    </>
                )}
            </section>
        </main>
    )
}
