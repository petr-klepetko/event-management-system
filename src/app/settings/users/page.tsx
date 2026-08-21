import Breadcrumbs from '@/components/navigation/Breadcrumbs'
import { inputClass, optionClass, primaryButtonClass } from '@/lib/ui/styles'
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
        <main className="mx-auto max-w-5xl p-8">
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

            <section className="mt-8 rounded-xl border p-6">
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

            <section className="mt-8 rounded-xl border p-6">
                <h2 className="text-xl font-semibold">Členové</h2>

                <div className="mt-4 overflow-x-auto">
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

            <section className="mt-8 rounded-xl border p-6">
                <h2 className="text-xl font-semibold">Otevřené pozvánky</h2>

                {invites.length === 0 ? (
                    <p className="mt-4 text-sm text-gray-600">
                        Žádné otevřené pozvánky.
                    </p>
                ) : (
                    <div className="mt-4 overflow-x-auto">
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
                )}
            </section>
        </main>
    )
}
