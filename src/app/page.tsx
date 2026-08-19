import Link from 'next/link'
import { getClientsCount } from '@/modules/clients/client.service'
import Breadcrumbs from '@/components/navigation/Breadcrumbs'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const clientsCount = await getClientsCount()

  return (
    <main className="mx-auto max-w-5xl p-8">
      <Breadcrumbs items={[{ label: 'Domů', href: '/' }]} />

      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold">Správa akcí</h1>
        <p className="text-sm text-gray-600">
          Interní systém pro klienty, akce a katalog služeb.
        </p>
      </div>

      <section className="mt-8 rounded-xl border p-6">
        <h2 className="text-xl font-semibold">Rychlý přístup</h2>

        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <Link
            href="/clients"
            className="rounded-md border p-4 transition-colors"
          >
            <span className="block font-semibold">Klienti</span>
            <span className="mt-2 block text-sm text-gray-600">
              Evidence klientů a kontaktních osob.
            </span>
          </Link>
          <Link
            href="/events"
            className="rounded-md border p-4 transition-colors"
          >
            <span className="block font-semibold">Akce</span>
            <span className="mt-2 block text-sm text-gray-600">
              Přehled akcí a služeb na konkrétní akci.
            </span>
          </Link>
          <Link
            href="/services"
            className="rounded-md border p-4 transition-colors"
          >
            <span className="block font-semibold">Služby</span>
            <span className="mt-2 block text-sm text-gray-600">
              Katalog šablon služeb a výchozích cen.
            </span>
          </Link>
        </div>
      </section>

      <section className="mt-8 rounded-xl border p-6">
        <h2 className="text-xl font-semibold">Současný stav</h2>
        <p className="mt-4 text-sm text-gray-600">
          Počet klientů v databázi
        </p>
        <p className="mt-1 text-3xl font-bold">{clientsCount}</p>
      </section>
    </main>
  )
}
