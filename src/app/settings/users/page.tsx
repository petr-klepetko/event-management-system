import Breadcrumbs from '@/components/navigation/Breadcrumbs'
import {
    compactSecondaryButtonClass,
    inputClass,
    optionClass,
    primaryButtonClass,
} from '@/lib/ui/styles'
import { requireAuthContext } from '@/lib/auth/current-user'
import {
    getTenantInvites,
    getTenantUsers,
} from '@/modules/tenants/tenant-user.service'
import {
    createTenantInviteAction,
    updateTenantMembershipRoleAction,
} from './actions'

type TenantUsersPageProps = {
    searchParams: Promise<{
        error?: string
        invite?: string
    }>
}

export default async function TenantUsersPage({
    searchParams,
}: TenantUsersPageProps) {
    const { error, invite } = await searchParams
    const auth = await requireAuthContext()
    const [memberships, invites] = await Promise.all([
        getTenantUsers(auth),
        getTenantInvites(auth),
    ])

    const inviteUrl = invite ? `/invite/${invite}` : null

    return (
        <main className="mx-auto max-w-5xl p-4 sm:p-8">
            <Breadcrumbs
                items={[
                    { label: 'Domů', href: '/' },
                    { label: 'Uživatelé', href: '/settings/users' },
                ]}
            />

            <div>
                <h1 className="text-3xl font-bold">Uživatelé</h1>
                <p className="mt-2 text-sm text-gray-600">
                    Správa členů a pozvánek v rámci tenantu.
                </p>
            </div>

            <section className="mt-8 rounded-xl border p-4 sm:p-6">
                <h2 className="text-xl font-semibold">Pozvat uživatele</h2>

                {error ? (
                    <p className="mt-4 rounded-md border border-red-500/40 px-4 py-3 text-sm text-red-300">
                        {error}
                    </p>
                ) : null}

                {inviteUrl ? (
                    <p className="mt-4 rounded-md border border-green-500/40 px-4 py-3 text-sm text-green-300">
                        Pozvánka byla vytvořena: {inviteUrl}
                    </p>
                ) : null}

                <form action={createTenantInviteAction} className="mt-4 grid gap-4">
                    <div className="grid gap-2 sm:grid-cols-2">
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
                            />
                        </div>
                        <div className="grid gap-2">
                            <label htmlFor="role" className="font-medium">
                                Role
                            </label>
                            <select
                                id="role"
                                name="role"
                                defaultValue="WORKER"
                                className={inputClass}
                            >
                                <option className={optionClass} value="WORKER">
                                    Pracovník
                                </option>
                                <option className={optionClass} value="MANAGER">
                                    Správce skupiny
                                </option>
                            </select>
                        </div>
                    </div>

                    <button type="submit" className={primaryButtonClass}>
                        Vytvořit pozvánku
                    </button>
                </form>
            </section>

            <section className="mt-8 rounded-xl border p-4 sm:p-6">
                <h2 className="text-xl font-semibold">Členové</h2>

                <div className="mt-4 grid gap-4 md:hidden">
                    {memberships.map((membership) => {
                        const updateRole =
                            updateTenantMembershipRoleAction.bind(null, {
                                membershipId: membership.id,
                            })

                        return (
                            <article
                                key={membership.id}
                                className="rounded-lg border border-slate-200 bg-white p-4"
                            >
                                <div>
                                    <h3 className="text-base font-semibold">
                                        {membership.user.fullName}
                                    </h3>
                                    <p className="mt-1 break-words text-sm text-gray-600">
                                        {membership.user.email}
                                    </p>
                                </div>

                                <dl className="mt-4 grid gap-3 text-sm">
                                    <div>
                                        <dt className="font-medium text-gray-500">Tenant</dt>
                                        <dd className="mt-1">
                                            {membership.tenant.name}
                                        </dd>
                                    </div>
                                </dl>

                                <form
                                    action={updateRole}
                                    className="mt-4 flex flex-wrap items-center gap-2"
                                >
                                    <select
                                        name="role"
                                        defaultValue={membership.role}
                                        className={inputClass}
                                    >
                                        <option className={optionClass} value="WORKER">
                                            Pracovník
                                        </option>
                                        <option className={optionClass} value="MANAGER">
                                            Správce skupiny
                                        </option>
                                    </select>
                                    <button
                                        type="submit"
                                        className={compactSecondaryButtonClass}
                                    >
                                        Uložit
                                    </button>
                                </form>
                            </article>
                        )
                    })}
                </div>

                <div className="mt-4 hidden overflow-x-auto md:block">
                    <table className="min-w-full border-collapse">
                        <thead>
                            <tr className="border-b text-left">
                                <th className="py-2 pr-4">Jméno</th>
                                <th className="py-2 pr-4">Email</th>
                                <th className="py-2 pr-4">Tenant</th>
                                <th className="py-2 pr-4">Role</th>
                            </tr>
                        </thead>
                        <tbody>
                            {memberships.map((membership) => {
                                const updateRole =
                                    updateTenantMembershipRoleAction.bind(null, {
                                        membershipId: membership.id,
                                    })

                                return (
                                    <tr key={membership.id} className="border-b">
                                        <td className="py-2 pr-4">
                                            {membership.user.fullName}
                                        </td>
                                        <td className="py-2 pr-4">
                                            {membership.user.email}
                                        </td>
                                        <td className="py-2 pr-4">
                                            {membership.tenant.name}
                                        </td>
                                        <td className="py-2 pr-4">
                                            <form
                                                action={updateRole}
                                                className="flex flex-wrap items-center gap-2"
                                            >
                                                <select
                                                    name="role"
                                                    defaultValue={membership.role}
                                                    className={inputClass}
                                                >
                                                    <option
                                                        className={optionClass}
                                                        value="WORKER"
                                                    >
                                                        Pracovník
                                                    </option>
                                                    <option
                                                        className={optionClass}
                                                        value="MANAGER"
                                                    >
                                                        Správce skupiny
                                                    </option>
                                                </select>
                                                <button
                                                    type="submit"
                                                    className={primaryButtonClass}
                                                >
                                                    Uložit
                                                </button>
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
                <h2 className="text-xl font-semibold">Otevřené pozvánky</h2>

                {invites.length === 0 ? (
                    <p className="mt-4 text-sm text-gray-600">
                        Žádné otevřené pozvánky.
                    </p>
                ) : (
                    <>
                    <div className="mt-4 grid gap-4 md:hidden">
                        {invites.map((tenantInvite) => (
                            <article
                                key={tenantInvite.id}
                                className="rounded-lg border border-slate-200 bg-white p-4"
                            >
                                <h3 className="break-words text-base font-semibold">
                                    {tenantInvite.email}
                                </h3>
                                <dl className="mt-4 grid gap-3 text-sm">
                                    <div>
                                        <dt className="font-medium text-gray-500">Role</dt>
                                        <dd className="mt-1">
                                            {tenantInvite.role === 'MANAGER'
                                                ? 'Správce skupiny'
                                                : 'Pracovník'}
                                        </dd>
                                    </div>
                                    <div>
                                        <dt className="font-medium text-gray-500">
                                            Platí do
                                        </dt>
                                        <dd className="mt-1">
                                            {new Intl.DateTimeFormat('cs-CZ', {
                                                dateStyle: 'medium',
                                                timeStyle: 'short',
                                            }).format(tenantInvite.expiresAt)}
                                        </dd>
                                    </div>
                                </dl>
                            </article>
                        ))}
                    </div>

                    <div className="mt-4 hidden overflow-x-auto md:block">
                        <table className="min-w-full border-collapse">
                            <thead>
                                <tr className="border-b text-left">
                                    <th className="py-2 pr-4">Email</th>
                                    <th className="py-2 pr-4">Role</th>
                                    <th className="py-2 pr-4">Platí do</th>
                                </tr>
                            </thead>
                            <tbody>
                                {invites.map((tenantInvite) => (
                                    <tr key={tenantInvite.id} className="border-b">
                                        <td className="py-2 pr-4">
                                            {tenantInvite.email}
                                        </td>
                                        <td className="py-2 pr-4">
                                            {tenantInvite.role === 'MANAGER'
                                                ? 'Správce skupiny'
                                                : 'Pracovník'}
                                        </td>
                                        <td className="py-2 pr-4">
                                            {new Intl.DateTimeFormat('cs-CZ', {
                                                dateStyle: 'medium',
                                                timeStyle: 'short',
                                            }).format(tenantInvite.expiresAt)}
                                        </td>
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
