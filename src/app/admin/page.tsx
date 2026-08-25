import Breadcrumbs from '@/components/navigation/Breadcrumbs'
import ClientSideListFilter from '@/components/filters/ClientSideListFilter'
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
        <main className="mx-auto max-w-6xl p-4 sm:p-8">
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

            <section className="mt-8 rounded-xl border p-4 sm:p-6">
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

            <section className="mt-8 rounded-xl border p-4 sm:p-6">
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
                                minLength={8}
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

            <section className="mt-8 rounded-xl border p-4 sm:p-6">
                <h2 className="text-xl font-semibold">Uživatelé</h2>

                <ClientSideListFilter
                    listId="admin-users"
                    placeholder="Hledat podle jména, loginu, role nebo stavu..."
                />

                <p
                    data-filter-empty="admin-users"
                    hidden
                    className="mt-4 text-sm text-gray-600"
                >
                    Žádný uživatel neodpovídá filtru.
                </p>

                <div data-filter-list="admin-users" className="mt-4 grid gap-4 md:hidden">
                    {overview.users.map((user) => {
                        const toggleActive = setUserActiveAction.bind(null, {
                            userId: user.id,
                            isActive: !user.isActive,
                        })
                        const resetPassword = resetUserPasswordAction.bind(null, {
                            userId: user.id,
                        })
                        const filterText = [
                            user.fullName,
                            user.email,
                            user.role,
                            user.isActive ? 'aktivní' : 'vypnutý',
                        ].join(' ')

                        return (
                            <article
                                key={user.id}
                                data-filter-item
                                data-filter-text={filterText}
                                className="rounded-lg border border-slate-200 bg-white p-4"
                            >
                                <div>
                                    <h3 className="text-base font-semibold">
                                        {user.fullName}
                                    </h3>
                                    <p className="mt-1 break-words text-sm text-gray-600">
                                        {user.email}
                                    </p>
                                </div>

                                <dl className="mt-4 grid gap-3 text-sm">
                                    <div>
                                        <dt className="font-medium text-gray-500">Role</dt>
                                        <dd className="mt-1">{user.role}</dd>
                                    </div>
                                    <div>
                                        <dt className="font-medium text-gray-500">Stav</dt>
                                        <dd className="mt-1">
                                            {user.isActive ? 'Aktivní' : 'Vypnutý'}
                                        </dd>
                                    </div>
                                </dl>

                                <form action={resetPassword} className="mt-4 grid gap-2">
                                    <label
                                        htmlFor={`mobile-password-${user.id}`}
                                        className="text-sm font-medium text-gray-500"
                                    >
                                        Reset hesla
                                    </label>
                                    <div className="flex flex-wrap items-center gap-2">
                                        <input
                                            id={`mobile-password-${user.id}`}
                                            name="password"
                                            type="text"
                                            required
                                            minLength={8}
                                            className={inputClass}
                                            placeholder="Nové heslo"
                                        />
                                        <button
                                            type="submit"
                                            className={compactSecondaryButtonClass}
                                        >
                                            Změnit
                                        </button>
                                    </div>
                                </form>

                                <form action={toggleActive} className="mt-4">
                                    <ConfirmSubmitButton
                                        confirmMessage={
                                            user.isActive
                                                ? 'Opravdu chceš deaktivovat uživatele?'
                                                : 'Opravdu chceš aktivovat uživatele?'
                                        }
                                        className={compactSecondaryButtonClass}
                                    >
                                        {user.isActive ? 'Deaktivovat' : 'Aktivovat'}
                                    </ConfirmSubmitButton>
                                </form>
                            </article>
                        )
                    })}
                </div>

                <div data-filter-list="admin-users" className="mt-4 hidden overflow-x-auto md:block">
                    <table className="min-w-full border-collapse">
                        <thead>
                            <tr className="border-b text-left">
                                <th className="py-2 px-2">Jméno</th>
                                <th className="py-2 px-2">Login</th>
                                <th className="py-2 px-2">Role</th>
                                <th className="py-2 px-2">Stav</th>
                                <th className="py-2 px-2">Reset hesla</th>
                                <th className="py-2 px-2">Akce</th>
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
                                const filterText = [
                                    user.fullName,
                                    user.email,
                                    user.role,
                                    user.isActive ? 'aktivní' : 'vypnutý',
                                ].join(' ')

                                return (
                                    <tr
                                        key={user.id}
                                        data-filter-item
                                        data-filter-text={filterText}
                                        className="border-b"
                                    >
                                        <td className="py-2 px-2">
                                            {user.fullName}
                                        </td>
                                        <td className="py-2 px-2">
                                            {user.email}
                                        </td>
                                        <td className="py-2 px-2">
                                            {user.role}
                                        </td>
                                        <td className="py-2 px-2">
                                            {user.isActive ? 'Aktivní' : 'Vypnutý'}
                                        </td>
                                        <td className="py-2 px-2">
                                            <form
                                                action={resetPassword}
                                                className="flex items-center gap-2"
                                            >
                                                <input
                                                    name="password"
                                                    type="text"
                                                    required
                                                    minLength={8}
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
                                        <td className="py-2 px-2">
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

            <section className="mt-8 rounded-xl border p-4 sm:p-6">
                <h2 className="text-xl font-semibold">Tenanty</h2>

                <ClientSideListFilter
                    listId="admin-tenants"
                    placeholder="Hledat podle názvu nebo slugu..."
                />

                <p
                    data-filter-empty="admin-tenants"
                    hidden
                    className="mt-4 text-sm text-gray-600"
                >
                    Žádný tenant neodpovídá filtru.
                </p>

                <div data-filter-list="admin-tenants" className="mt-4 grid gap-4 md:hidden">
                    {overview.tenants.map((tenant) => (
                        <article
                            key={tenant.id}
                            data-filter-item
                            data-filter-text={`${tenant.name} ${tenant.slug}`}
                            className="rounded-lg border border-slate-200 bg-white p-4"
                        >
                            <h3 className="text-base font-semibold">{tenant.name}</h3>
                            <dl className="mt-4 grid gap-3 text-sm">
                                <div>
                                    <dt className="font-medium text-gray-500">Slug</dt>
                                    <dd className="mt-1 break-words">{tenant.slug}</dd>
                                </div>
                                <div>
                                    <dt className="font-medium text-gray-500">
                                        Vytvořeno
                                    </dt>
                                    <dd className="mt-1">
                                        {new Intl.DateTimeFormat('cs-CZ', {
                                            dateStyle: 'medium',
                                            timeStyle: 'short',
                                        }).format(tenant.createdAt)}
                                    </dd>
                                </div>
                            </dl>
                        </article>
                    ))}
                </div>

                <div data-filter-list="admin-tenants" className="mt-4 hidden overflow-x-auto md:block">
                    <table className="min-w-full border-collapse">
                        <thead>
                            <tr className="border-b text-left">
                                <th className="py-2 px-2">Název</th>
                                <th className="py-2 px-2">Slug</th>
                                <th className="py-2 px-2">Vytvořeno</th>
                            </tr>
                        </thead>
                        <tbody>
                            {overview.tenants.map((tenant) => (
                                <tr
                                    key={tenant.id}
                                    data-filter-item
                                    data-filter-text={`${tenant.name} ${tenant.slug}`}
                                    className="border-b"
                                >
                                    <td className="py-2 px-2">{tenant.name}</td>
                                    <td className="py-2 px-2">{tenant.slug}</td>
                                    <td className="py-2 px-2">
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
