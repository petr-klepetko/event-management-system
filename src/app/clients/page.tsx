import { getClients } from '@/modules/clients/client.service'
import { createClientAction } from './actions'
import { mapClientTypeToLabel } from '@/modules/clients/client.utils'
import Link from 'next/link'
import { buttonClass, inputClass, optionClass } from '@/lib/ui/styles'
import Breadcrumbs from '@/components/navigation/Breadcrumbs'

export const dynamic = 'force-dynamic'

type ClientsPageProps = {
  searchParams: Promise<{
    error?: string
    success?: string
  }>
}

export default async function ClientsPage({ searchParams }: ClientsPageProps) {
  const { error, success } = await searchParams
  const clients = await getClients()

  return (
    <main className="mx-auto max-w-4xl p-8">
      <Breadcrumbs
        items={[
          { label: 'Domů', href: '/' },
          { label: 'Klienti', href: '/clients' },
        ]}
      />

      <div>
        <h1 className="text-3xl font-bold">Klienti</h1>
      </div>

      <section className="mt-8 rounded-xl border p-6">
        <h2 className="text-xl font-semibold">Seznam klientů</h2>

        {error ? (
          <p className="mt-4 rounded-md border border-red-500/40 px-4 py-3 text-sm text-red-300">
            {error}
          </p>
        ) : null}

        {success === 'KlientBylVytvoren' ? (
          <p className="mt-4 rounded-md border border-green-500/40 px-4 py-3 text-sm text-green-300">
            Klient byl vytvořen.
          </p>
        ) : null}

        {clients.length === 0 ? (
          <p className="mt-4 text-sm text-gray-600">Zatím nejsou vytvoření žádní klienti.</p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full border-collapse">
              <thead>
                <tr className="border-b text-left">
                  <th className="py-2 pr-4">Název</th>
                  <th className="py-2 pr-4">Typ</th>
                  <th className="py-2 pr-4">IČO</th>
                  <th className="py-2 pr-4">Město</th>
                  <th className="py-2 pr-4">Země</th>
                </tr>
              </thead>
              <tbody>
                {clients.map((client) => (
                  <tr key={client.id} className="border-b">
                    <td className="py-2 pr-4">
                      <Link
                        href={`/clients/${client.id}`}
                        className="underline underline-offset-4"
                      >
                        {client.name}
                      </Link>
                    </td>
                    <td className="py-2 pr-4">
                      {mapClientTypeToLabel(client.type)}
                    </td>
                    <td className="py-2 pr-4">{client.ico ?? '—'}</td>
                    <td className="py-2 pr-4">{client.city ?? '—'}</td>
                    <td className="py-2 pr-4">{client.country ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="mt-8 rounded-xl border p-6">
        <h2 className="text-xl font-semibold">Vytvořit klienta</h2>

        <form action={createClientAction} className="mt-4 grid gap-4">
          <div className="grid gap-2">
            <label htmlFor="name" className="font-medium">
              Název
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              className={inputClass}
              placeholder="Gymnázium Novákova"
            />
          </div>

          <div className="grid gap-2">
            <label htmlFor="type" className="font-medium">
              Typ
            </label>
            <select
              id="type"
              name="type"
              defaultValue="COMPANY"
              className={inputClass}
            >
              <option className={optionClass} value="COMPANY">Firma</option>
              <option className={optionClass} value="SCHOOL">Škola</option>
              <option className={optionClass} value="PERSON">Osoba</option>
            </select>
          </div>

          <div className="grid gap-2">
            <label htmlFor="ico" className="font-medium">
              IČO
            </label>
            <input
              id="ico"
              name="ico"
              type="text"
              className={inputClass}
              placeholder="12345678"
            />
          </div>

          <div className="grid gap-2">
            <label htmlFor="dic" className="font-medium">
              DIČ
            </label>
            <input
              id="dic"
              name="dic"
              type="text"
              className={inputClass}
              placeholder="CZ12345678"
            />
          </div>

          <div className="grid gap-2">
            <label htmlFor="city" className="font-medium">
              Město
            </label>
            <input
              id="city"
              name="city"
              type="text"
              className={inputClass}
              placeholder="Brno"
            />
          </div>

          <div className="grid gap-2">
            <label htmlFor="country" className="font-medium">
              Země
            </label>
            <input
              id="country"
              name="country"
              type="text"
              defaultValue="Czech Republic"
              className={inputClass}
            />
          </div>

          <button
            type="submit"
            className={buttonClass}
          >
            Vytvořit klienta
          </button>
        </form>
      </section>

    </main>
  )
}
