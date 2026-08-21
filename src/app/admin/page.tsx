import Breadcrumbs from '@/components/navigation/Breadcrumbs'
import ConfirmSubmitButton from '@/components/forms/ConfirmSubmitButton'
import {
    compactSecondaryButtonClass,
    inputClass,
    optionClass,
    primaryButtonClass,
} from '@/lib/ui/styles'
import { requireAdminContext } from '@/lib/auth/current-user'
import { getAdminOverview } from '@/modules/admin/admin.service'
import {
    createAdminUserAction,
    createTenantAction,
    resetUserPasswordAction,
    setUserActiveAction,
} from './actions'

type AdminPageProps = {
    searchParams: Promise<{
        error?: string
        success?: string
    }>
}

function successMessage(code?: string) {
    switch (code) {
        case 'TenantBylVytvoren':
            return 'Tenant byl vytvořen.'
        case 'UzivatelBylVytvoren':
            return 'Uživatel byl vytvořen.'
        case 'HesloByloZmeneno':
            return 'Heslo bylo změněno.'
        default:
            return null
    }
}

export default async function AdminPage({ searchParams }: AdminPageProps) {
    const { error, success } = await searchParams
    const auth = await requireAdminContext()
    const overview = await getAdminOverview(auth)
    const message = successMessage(success)

    return (
        <main className="mx-auto max-w-6xl p-8">
            <Breadcrumbs
                items={[
                    { label: 'Domů', href: '/' },
                    { label: 'Admin', href: '/admin' },
                ]}
            />

            <div>
                <h1 className="text-3xl font-bold">Admin aplikace</h1>
                <p className="mt-2 text-sm text-gray-600">
                    Globální správa tenantů a uživatelů. Vidí ji pouze admin.
                </p>
            </div>

            {error ? (
                <p className="mt-6 rounded-md border border-red-500/40 px-4 py-3 text-sm text-red-300">
                    {error}
                </p>
            ) : null}

            {message ? (
                <p className="mt-6 rounded-md border border-green-500/40 px-4 py-3 text-sm text-green-300">
                    {message}
                </p>
            ) : null}

            <section className="mt-8 rounded-xl border p-6">
                <h2 className="text-xl font-semibold">Vytvořit tenant</h2>
                <form action={createTenantAction} className="mt-4 grid gap-4">
                    <div className="grid gap-2 sm:grid-cols-2">
                        <div className="grid gap-2">
                            <label htmlFor="tenantName" className="font-medium">
                                Název
                            </label>
                            <input
                                id="tenantName"
                                name="name"
                                type="text"
                                required
                                className={inputClass}
                            />
                        </div>
                        <div className="grid gap-2">
                            <label htmlFor="tenantSlug" className="font-medium">
                                Slug
                            </label>
                            <input
                                id="tenantSlug"
                                name="slug"
                                type="text"
                                className={inputClass}
                                placeholder="napr. test-tenant"
                            />
                        </div>
                    </div>
                    <button type="submit" className={primaryButtonClass}>
                        Vytvořit tenant
                    </button>
                </form>
            </section>

            <section className="mt-8 rounded-xl border p-6">
                <h2 className="text-xl font-semibold">Vytvořit uživatele</h2>
                <form action={createAdminUserAction} className="mt-4 grid gap-4">
                    <div className="grid gap-2 sm:grid-cols-2">
                        <div className="grid gap-2">
                            <label htmlFor="email" className="font-medium">
                                Login / email
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="text"
                                required
                                className={inputClass}
                                placeholder="admin nebo user@example.com"
                            />
                        </div>
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
                            />
                        </div>
                    </div>

                    <div className="grid gap-2 sm:grid-cols-4">
                        <div className="grid gap-2">
                            <label htmlFor="password" className="font-medium">
                                Heslo
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="text"
                                required
                                className={inputClass}
                            />
                        </div>
                        <div className="grid gap-2">
                            <label htmlFor="appRole" className="font-medium">
                                Role aplikace
                            </label>
                            <select
                                id="appRole"
                                name="appRole"
                                defaultValue="WORKER"
                                className={inputClass}
                            >
                                <option className={optionClass} value="ADMIN">
                                    Admin aplikace
                                </option>
                                <option className={optionClass} value="MANAGER">
                                    Správce skupiny
                                </option>
                                <option className={optionClass} value="WORKER">
                                    Pracovník
                                </option>
                            </select>
                        </div>
                        <div className="grid gap-2">
                            <label htmlFor="tenantId" className="font-medium">
                                Tenant
                            </label>
                            <select
                                id="tenantId"
                                name="tenantId"
                                defaultValue=""
                                className={inputClass}
                            >
                                <option className={optionClass} value="">
                                    Bez tenantu
                                </option>
                                {overview.tenants.map((tenant) => (
                                    <option
                                        className={optionClass}
                                        key={tenant.id}
                                        value={tenant.id}
                                    >
                                        {tenant.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="grid gap-2">
                            <label htmlFor="tenantRole" className="font-medium">
                                Role v tenantu
                            </label>
                            <select
                                id="tenantRole"
                                name="tenantRole"
                                defaultValue="WORKER"
                                className={inputClass}
                            >
                                <option className={optionClass} value="MANAGER">
                                    Správce skupiny
                                </option>
                                <option className={optionClass} value="WORKER">
                                    Pracovník
                                </option>
                            </select>
                        </div>
                    </div>

                    <button type="submit" className={primaryButtonClass}>
                        Vytvořit uživatele
                    </button>
                </form>
            </section>

            <section className="mt-8 rounded-xl border p-6">
                <h2 className="text-xl font-semibold">Uživatelé</h2>
                <div className="mt-4 overflow-x-auto">
                    <table className="min-w-full border-collapse">
                        <thead>
                            <tr className="border-b text-left">
                                <th className="py-2 pr-4">Jméno</th>
                                <th className="py-2 pr-4">Login</th>
                                <th className="py-2 pr-4">Role</th>
                                <th className="py-2 pr-4">Stav</th>
                                <th className="py-2 pr-4">Reset hesla</th>
                                <th className="py-2 pr-4">Akce</th>
                            </tr>
                        </thead>
                        <tbody>
                            {overview.users.map((user) => {
                                const toggleActive = setUserActiveAction.bind(null, {
                                    userId: user.id,
                                    isActive: !user.isActive,
                                })
                                const resetPassword =
                                    resetUserPasswordAction.bind(null, {
                                        userId: user.id,
                                    })

                                return (
                                    <tr key={user.id} className="border-b">
                                        <td className="py-2 pr-4">
                                            {user.fullName}
                                        </td>
                                        <td className="py-2 pr-4">
                                            {user.email}
                                        </td>
                                        <td className="py-2 pr-4">
                                            {user.role}
                                        </td>
                                        <td className="py-2 pr-4">
                                            {user.isActive ? 'Aktivní' : 'Vypnutý'}
                                        </td>
                                        <td className="py-2 pr-4">
                                            <form
                                                action={resetPassword}
                                                className="flex items-center gap-2"
                                            >
                                                <input
                                                    name="password"
                                                    type="text"
                                                    required
                                                    minLength={4}
                                                    className={inputClass}
                                                    placeholder="Nové heslo"
                                                />
                                                <button
                                                    type="submit"
                                                    className={compactSecondaryButtonClass}
                                                >
                                                    Změnit
                                                </button>
                                            </form>
                                        </td>
                                        <td className="py-2 pr-4">
                                            <form action={toggleActive}>
                                                <ConfirmSubmitButton
                                                    confirmMessage={
                                                        user.isActive
                                                            ? 'Opravdu chceš deaktivovat uživatele?'
                                                            : 'Opravdu chceš aktivovat uživatele?'
                                                    }
                                                    className={compactSecondaryButtonClass}
                                                >
                                                    {user.isActive
                                                        ? 'Deaktivovat'
                                                        : 'Aktivovat'}
                                                </ConfirmSubmitButton>
                                            </form>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            </section>

            <section className="mt-8 rounded-xl border p-6">
                <h2 className="text-xl font-semibold">Tenanty</h2>
                <div className="mt-4 overflow-x-auto">
                    <table className="min-w-full border-collapse">
                        <thead>
                            <tr className="border-b text-left">
                                <th className="py-2 pr-4">Název</th>
                                <th className="py-2 pr-4">Slug</th>
                                <th className="py-2 pr-4">Vytvořeno</th>
                            </tr>
                        </thead>
                        <tbody>
                            {overview.tenants.map((tenant) => (
                                <tr key={tenant.id} className="border-b">
                                    <td className="py-2 pr-4">{tenant.name}</td>
                                    <td className="py-2 pr-4">{tenant.slug}</td>
                                    <td className="py-2 pr-4">
                                        {new Intl.DateTimeFormat('cs-CZ', {
                                            dateStyle: 'medium',
                                            timeStyle: 'short',
                                        }).format(tenant.createdAt)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>
        </main>
    )
}
