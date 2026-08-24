import { redirect } from 'next/navigation'
import { inputClass, primaryButtonClass } from '@/lib/ui/styles'
import { canRunInitialSetup } from '@/modules/auth/setup.service'
import { initialSetupAction } from './actions'

type SetupPageProps = {
    searchParams: Promise<{
        error?: string
    }>
}

export default async function SetupPage({ searchParams }: SetupPageProps) {
    const { error } = await searchParams
    const allowed = await canRunInitialSetup()

    if (!allowed) {
        redirect('/login')
    }

    return (
        <main className="mx-auto flex min-h-screen w-full max-w-md items-center p-8">
            <section className="w-full rounded-xl border p-6">
                <h1 className="text-3xl font-bold">Úvodní nastavení</h1>
                <p className="mt-2 text-sm text-gray-600">
                    Vytvoř první tenant a admin účet aplikace.
                </p>

                {error ? (
                    <p className="mt-4 rounded-md border border-red-500/40 px-4 py-3 text-sm text-red-300">
                        {error}
                    </p>
                ) : null}

                <form action={initialSetupAction} className="mt-6 grid gap-4">
                    <div className="grid gap-2">
                        <label htmlFor="tenantName" className="font-medium">
                            Název tenantu
                        </label>
                        <input
                            id="tenantName"
                            name="tenantName"
                            type="text"
                            required
                            className={inputClass}
                            placeholder="AutoIN"
                        />
                    </div>

                    <div className="grid gap-2">
                        <label htmlFor="fullName" className="font-medium">
                            Jméno admina
                        </label>
                        <input
                            id="fullName"
                            name="fullName"
                            type="text"
                            required
                            className={inputClass}
                            autoComplete="name"
                        />
                    </div>

                    <div className="grid gap-2">
                        <label htmlFor="email" className="font-medium">
                            Email
                        </label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            required
                            className={inputClass}
                            autoComplete="email"
                        />
                    </div>

                    <div className="grid gap-2">
                        <label htmlFor="password" className="font-medium">
                            Heslo
                        </label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            required
                            minLength={8}
                            className={inputClass}
                            autoComplete="new-password"
                        />
                    </div>

                    <button type="submit" className={primaryButtonClass}>
                        Dokončit nastavení
                    </button>
                </form>
            </section>
        </main>
    )
}
