import { getClients } from '@/modules/clients/client.service'
import { createClientAction } from './actions'
import { mapClientTypeToLabel } from '@/modules/clients/client.utils'

export default async function ClientsPage() {
  const clients = await getClients()

  return (
    <main className="mx-auto max-w-4xl p-8">
      <h1 className="text-3xl font-bold">Clients</h1>

      <section className="mt-8 rounded-xl border p-6">
        <h2 className="text-xl font-semibold">Create client</h2>

        <form action={createClientAction} className="mt-4 grid gap-4">
          <div className="grid gap-2">
            <label htmlFor="name" className="font-medium">
              Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              className="rounded-md border px-3 py-2"
              placeholder="Gymnázium Novákova"
            />
          </div>

          <div className="grid gap-2">
            <label htmlFor="type" className="font-medium">
              Type
            </label>
            <select
              id="type"
              name="type"
              defaultValue="COMPANY"
              className="rounded-md border px-3 py-2"
            >
              <option value="COMPANY">Company</option>
              <option value="SCHOOL">School</option>
              <option value="PERSON">Person</option>
            </select>
          </div>

          <div className="grid gap-2">
            <label htmlFor="ico" className="font-medium">
              ICO
            </label>
            <input
              id="ico"
              name="ico"
              type="text"
              className="rounded-md border px-3 py-2"
              placeholder="12345678"
            />
          </div>

          <div className="grid gap-2">
            <label htmlFor="dic" className="font-medium">
              DIC
            </label>
            <input
              id="dic"
              name="dic"
              type="text"
              className="rounded-md border px-3 py-2"
              placeholder="CZ12345678"
            />
          </div>

          <div className="grid gap-2">
            <label htmlFor="city" className="font-medium">
              City
            </label>
            <input
              id="city"
              name="city"
              type="text"
              className="rounded-md border px-3 py-2"
              placeholder="Brno"
            />
          </div>

          <div className="grid gap-2">
            <label htmlFor="country" className="font-medium">
              Country
            </label>
            <input
              id="country"
              name="country"
              type="text"
              defaultValue="Czech Republic"
              className="rounded-md border px-3 py-2"
            />
          </div>

          <button
            type="submit"
            className="w-fit rounded-md border px-4 py-2 font-medium"
          >
            Create client
          </button>
        </form>
      </section>

      <section className="mt-8 rounded-xl border p-6">
        <h2 className="text-xl font-semibold">Client list</h2>

        {clients.length === 0 ? (
          <p className="mt-4 text-sm text-gray-600">No clients yet.</p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full border-collapse">
              <thead>
                <tr className="border-b text-left">
                  <th className="py-2 pr-4">Name</th>
                  <th className="py-2 pr-4">Type</th>
                  <th className="py-2 pr-4">ICO</th>
                  <th className="py-2 pr-4">City</th>
                  <th className="py-2 pr-4">Country</th>
                </tr>
              </thead>
              <tbody>
                {clients.map((client) => (
                  <tr key={client.id} className="border-b">
                    <td className="py-2 pr-4">{client.name}</td>
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
    </main>
  )
}