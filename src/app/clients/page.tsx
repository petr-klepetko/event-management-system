import { getClients } from '@/modules/clients/client.service'
import { mapClientTypeToLabel } from '@/modules/clients/client.utils'
import Link from 'next/link'
import Breadcrumbs from '@/components/navigation/Breadcrumbs'
import ClientSideListFilter from '@/components/filters/ClientSideListFilter'
import { primaryButtonClass } from '@/lib/ui/styles'
import { requireAuthContext } from '@/lib/auth/current-user'

export const dynamic = 'force-dynamic'

type ClientsPageProps = {
  searchParams: Promise<{
    error?: string
    success?: string
  }>
}

export default async function ClientsPage({ searchParams }: ClientsPageProps) {
  const { error, success } = await searchParams
  const auth = await requireAuthContext()
  const clients = await getClients(auth)

  return (
    <main className="mx-auto max-w-4xl p-4 sm:p-8">
      <Breadcrumbs
        items={[
          { label: 'Domů', href: '/' },
          { label: 'Klienti', href: '/clients' },
        ]}
      />

      <div>
        <h1 className="text-3xl font-bold">Klienti</h1>
      </div>

      <section className="mt-8 rounded-xl border p-4 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-semibold">Seznam klientů</h2>
          <Link
            href="/clients/new"
            className={primaryButtonClass}
          >
            Nový klient
          </Link>
        </div>

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
          <>
          <ClientSideListFilter
            listId="clients"
            placeholder="Hledat podle názvu, IČO nebo města..."
          />

          <p
            data-filter-empty="clients"
            hidden
            className="mt-4 text-sm text-gray-600"
          >
            Žádný klient neodpovídá filtru.
          </p>

          <div data-filter-list="clients" className="mt-4 grid gap-4 md:hidden">
            {clients.map((client) => (
              <article
                key={client.id}
                data-filter-item
                data-filter-text={[
                  client.name,
                  mapClientTypeToLabel(client.type),
                  client.ico,
                  client.city,
                  client.country,
                ]
                  .filter(Boolean)
                  .join(' ')}
                className="rounded-lg border border-slate-200 bg-white p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-base font-semibold">
                      <Link
                        href={`/clients/${client.id}`}
                        className="underline underline-offset-4"
                      >
                        {client.name}
                      </Link>
                    </h3>
                    <p className="mt-1 text-sm text-gray-600">
                      {mapClientTypeToLabel(client.type)}
                    </p>
                  </div>
                  <Link
                    href={`/clients/${client.id}`}
                    className="text-sm font-medium underline underline-offset-4"
                  >
                    Detail
                  </Link>
                </div>

                <dl className="mt-4 grid gap-3 text-sm">
                  <div>
                    <dt className="font-medium text-gray-500">IČO</dt>
                    <dd className="mt-1">{client.ico ?? '—'}</dd>
                  </div>
                  <div>
                    <dt className="font-medium text-gray-500">Město</dt>
                    <dd className="mt-1">{client.city ?? '—'}</dd>
                  </div>
                  <div>
                    <dt className="font-medium text-gray-500">Země</dt>
                    <dd className="mt-1">{client.country ?? '—'}</dd>
                  </div>
                </dl>
              </article>
            ))}
          </div>

          <div data-filter-list="clients" className="mt-4 hidden overflow-x-auto md:block">
            <table className="min-w-full border-collapse">
              <thead>
                <tr className="border-b text-left">
                  <th className="py-2 px-2">Název</th>
                  <th className="py-2 px-2">Typ</th>
                  <th className="py-2 px-2">IČO</th>
                  <th className="py-2 px-2">Město</th>
                  <th className="py-2 px-2">Země</th>
                </tr>
              </thead>
              <tbody>
                {clients.map((client) => (
                  <tr
                    key={client.id}
                    data-filter-item
                    data-filter-text={[
                      client.name,
                      mapClientTypeToLabel(client.type),
                      client.ico,
                      client.city,
                      client.country,
                    ]
                      .filter(Boolean)
                      .join(' ')}
                    className="border-b"
                  >
                    <td className="py-2 px-2">
                      <Link
                        href={`/clients/${client.id}`}
                        className="underline underline-offset-4"
                      >
                        {client.name}
                      </Link>
                    </td>
                    <td className="py-2 px-2">
                      {mapClientTypeToLabel(client.type)}
                    </td>
                    <td className="py-2 px-2">{client.ico ?? '—'}</td>
                    <td className="py-2 px-2">{client.city ?? '—'}</td>
                    <td className="py-2 px-2">{client.country ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          </>
        )}
      </section>

    </main>
  )
}
