import { notFound } from 'next/navigation'
import Breadcrumbs from '@/components/navigation/Breadcrumbs'
import { buttonClass, inputClass, optionClass } from '@/lib/ui/styles'
import { getClientById } from '@/modules/clients/client.service'
import { updateClientAction } from '../../actions'
import { requireAuthContext } from '@/lib/auth/current-user'

type EditClientPageProps = {
    params: Promise<{
        id: string
    }>
    searchParams: Promise<{
        error?: string
    }>
}

export default async function EditClientPage({
    params,
    searchParams,
}: EditClientPageProps) {
    const { id } = await params
    const { error } = await searchParams
    const auth = await requireAuthContext()
    const client = await getClientById(id, auth)

    if (!client) {
        notFound()
    }

    const updateAction = updateClientAction.bind(null, {
        clientId: client.id,
    })

    return (
        <main className="mx-auto max-w-4xl p-8">
            <Breadcrumbs
                items={[
                    { label: 'Domů', href: '/' },
                    { label: 'Klienti', href: '/clients' },
                    { label: client.name, href: `/clients/${client.id}` },
                    { label: 'Upravit klienta', href: `/clients/${client.id}/edit` },
                ]}
            />

            <div>
                <h1 className="text-3xl font-bold">Upravit klienta</h1>
            </div>

            <section className="mt-8 rounded-xl border p-6">
                <h2 className="text-xl font-semibold">Základní údaje</h2>

                {error ? (
                    <p className="mt-4 rounded-md border border-red-500/40 px-4 py-3 text-sm text-red-300">
                        {error}
                    </p>
                ) : null}

                <form action={updateAction} className="mt-4 grid gap-4">
                    <div className="grid gap-2">
                        <label htmlFor="name" className="font-medium">
                            Název
                        </label>
                        <input
                            id="name"
                            name="name"
                            type="text"
                            required
                            defaultValue={client.name}
                            className={inputClass}
                        />
                    </div>

                    <div className="grid gap-2">
                        <label htmlFor="type" className="font-medium">
                            Typ
                        </label>
                        <select
                            id="type"
                            name="type"
                            defaultValue={client.type}
                            className={inputClass}
                        >
                            <option className={optionClass} value="COMPANY">
                                Firma
                            </option>
                            <option className={optionClass} value="SCHOOL">
                                Škola
                            </option>
                            <option className={optionClass} value="PERSON">
                                Osoba
                            </option>
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
                            defaultValue={client.ico ?? ''}
                            className={inputClass}
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
                            defaultValue={client.dic ?? ''}
                            className={inputClass}
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
                            defaultValue={client.city ?? ''}
                            className={inputClass}
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
                            defaultValue={client.country ?? ''}
                            className={inputClass}
                        />
                    </div>

                    <button type="submit" className={buttonClass}>
                        Uložit změny
                    </button>
                </form>
            </section>
        </main>
    )
}
