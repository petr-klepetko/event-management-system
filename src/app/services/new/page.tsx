import Breadcrumbs from '@/components/navigation/Breadcrumbs'
import { buttonClass, inputClass } from '@/lib/ui/styles'
import { createServiceCatalogItemAction } from '../actions'

type NewServiceCatalogItemPageProps = {
    searchParams: Promise<{
        error?: string
    }>
}

export default async function NewServiceCatalogItemPage({
    searchParams,
}: NewServiceCatalogItemPageProps) {
    const { error } = await searchParams

    return (
        <main className="mx-auto max-w-4xl p-8">
            <Breadcrumbs
                items={[
                    { label: 'Domů', href: '/' },
                    { label: 'Služby', href: '/services' },
                    { label: 'Nová služba', href: '/services/new' },
                ]}
            />

            <div>
                <h1 className="text-3xl font-bold">Nová služba</h1>
            </div>

            <section className="mt-8 rounded-xl border p-6">
                <h2 className="text-xl font-semibold">Základní údaje</h2>

                {error ? (
                    <p className="mt-4 rounded-md border border-red-500/40 px-4 py-3 text-sm text-red-300">
                        {error}
                    </p>
                ) : null}

                <form
                    action={createServiceCatalogItemAction}
                    className="mt-4 grid gap-4"
                >
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
                            placeholder="DJ služby"
                        />
                    </div>

                    <div className="grid gap-2">
                        <label htmlFor="defaultPrice" className="font-medium">
                            Výchozí cena
                        </label>
                        <input
                            id="defaultPrice"
                            name="defaultPrice"
                            type="text"
                            required
                            className={inputClass}
                            placeholder="15000"
                        />
                    </div>

                    <div className="grid gap-2">
                        <label htmlFor="description" className="font-medium">
                            Výchozí popis
                        </label>
                        <textarea
                            id="description"
                            name="description"
                            rows={4}
                            className={inputClass}
                            placeholder="Popis služby pro smlouvu..."
                        />
                    </div>

                    <button type="submit" className={buttonClass}>
                        Vytvořit službu
                    </button>
                </form>
            </section>
        </main>
    )
}
