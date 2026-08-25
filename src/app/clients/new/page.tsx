import Breadcrumbs from '@/components/navigation/Breadcrumbs'
import { buttonClass, inputClass, optionClass } from '@/lib/ui/styles'
import { createClientAction } from '../actions'
import { requireTenantManagerContext } from '@/lib/auth/current-user'

type NewClientPageProps = {
    searchParams: Promise<{
        error?: string
    }>
}

export default async function NewClientPage({
    searchParams,
}: NewClientPageProps) {
    await requireTenantManagerContext()
    const { error } = await searchParams

    return (
        <main className="mx-auto max-w-4xl p-8">
            <Breadcrumbs
                items={[
                    { label: 'Domů', href: '/' },
                    { label: 'Klienti', href: '/clients' },
                    { label: 'Nový klient', href: '/clients/new' },
                ]}
            />

            <div>
                <h1 className="text-3xl font-bold">Nový klient</h1>
            </div>

            <section className="mt-8 rounded-xl border p-6">
                <h2 className="text-xl font-semibold">Základní údaje</h2>

                {error ? (
                    <p className="mt-4 rounded-md border border-red-500/40 px-4 py-3 text-sm text-red-300">
                        {error}
                    </p>
                ) : null}

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

                    <button type="submit" className={buttonClass}>
                        Vytvořit klienta
                    </button>
                </form>
            </section>
        </main>
    )
}
