import { inputClass, primaryButtonClass } from '@/lib/ui/styles'
import { acceptInviteAction } from './actions'

type InvitePageProps = {
    params: Promise<{
        token: string
    }>
    searchParams: Promise<{
        error?: string
    }>
}

export default async function InvitePage({
    params,
    searchParams,
}: InvitePageProps) {
    const { token } = await params
    const { error } = await searchParams
    const action = acceptInviteAction.bind(null, { token })

    return (
        <main className="mx-auto flex min-h-screen w-full max-w-md items-center p-8">
            <section className="w-full rounded-xl border p-6">
                <h1 className="text-3xl font-bold">Přijmout pozvánku</h1>
                <p className="mt-2 text-sm text-gray-600">
                    Dokonči účet a nastav si heslo.
                </p>

                {error ? (
                    <p className="mt-4 rounded-md border border-red-500/40 px-4 py-3 text-sm text-red-300">
                        {error}
                    </p>
                ) : null}

                <form action={action} className="mt-6 grid gap-4">
                    <div className="grid gap-2">
                        <label htmlFor="fullName" className="font-medium">
                            Jméno
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
                        Přijmout pozvánku
                    </button>
                </form>
            </section>
        </main>
    )
}
