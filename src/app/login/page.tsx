import { inputClass, primaryButtonClass } from '@/lib/ui/styles'
import { loginAction } from './actions'

type LoginPageProps = {
    searchParams: Promise<{
        error?: string
        next?: string
    }>
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
    const { error, next } = await searchParams

    return (
        <main className="mx-auto flex min-h-screen w-full max-w-md items-center p-8">
            <section className="w-full rounded-xl border p-6">
                <h1 className="text-3xl font-bold">Přihlášení</h1>
                <p className="mt-2 text-sm text-gray-600">
                    Přihlas se do správy akcí.
                </p>

                {error ? (
                    <p className="mt-4 rounded-md border border-red-500/40 px-4 py-3 text-sm text-red-300">
                        {error}
                    </p>
                ) : null}

                <form action={loginAction} className="mt-6 grid gap-4">
                    <input type="hidden" name="next" value={next ?? '/'} />

                    <div className="grid gap-2">
                        <label htmlFor="email" className="font-medium">
                            Email
                        </label>
                        <input
                            id="email"
                            name="email"
                            type="text"
                            required
                            className={inputClass}
                            autoComplete="username"
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
                            className={inputClass}
                            autoComplete="current-password"
                        />
                    </div>

                    <button type="submit" className={primaryButtonClass}>
                        Přihlásit
                    </button>
                </form>
            </section>
        </main>
    )
}
