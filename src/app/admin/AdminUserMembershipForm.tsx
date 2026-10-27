'use client'

import { useState } from 'react'
import {
    compactSecondaryButtonClass,
    inputClass,
    optionClass,
} from '@/lib/ui/styles'
import { updateUserMembershipAction } from './actions'

type TenantRoleValue = 'MANAGER' | 'WORKER'

type AdminUserMembershipFormProps = {
    userId: string
    initialTenantId: string
    initialRole: TenantRoleValue
    tenants: { id: string; name: string }[]
    compact?: boolean
}

export default function AdminUserMembershipForm({
    userId,
    initialTenantId,
    initialRole,
    tenants,
    compact = false,
}: AdminUserMembershipFormProps) {
    const [tenantId, setTenantId] = useState(initialTenantId)
    const [tenantRole, setTenantRole] = useState<TenantRoleValue>(initialRole)
    const changed = tenantId !== initialTenantId || tenantRole !== initialRole

    return (
        <form
            action={updateUserMembershipAction}
            className="flex flex-wrap items-center gap-2"
        >
            <input type="hidden" name="userId" value={userId} />
            <label className={compact ? 'inline-flex' : 'grid gap-1 text-sm'}>
                <span className={compact ? 'sr-only' : ''}>Tenant</span>
                <select
                    name="tenantId"
                    value={tenantId}
                    onChange={(event) => setTenantId(event.target.value)}
                    required
                    className={inputClass}
                >
                    {!initialTenantId ? (
                        <option className={optionClass} value="">
                            Vyber tenant
                        </option>
                    ) : null}
                    {tenants.map((tenant) => (
                        <option
                            className={optionClass}
                            key={tenant.id}
                            value={tenant.id}
                        >
                            {tenant.name}
                        </option>
                    ))}
                </select>
            </label>
            <label className={compact ? 'inline-flex' : 'grid gap-1 text-sm'}>
                <span className={compact ? 'sr-only' : ''}>Role</span>
                <select
                    name="tenantRole"
                    value={tenantRole}
                    onChange={(event) =>
                        setTenantRole(event.target.value as TenantRoleValue)
                    }
                    className={inputClass}
                >
                    <option className={optionClass} value="WORKER">
                        Pracovník
                    </option>
                    <option className={optionClass} value="MANAGER">
                        Správce skupiny
                    </option>
                </select>
            </label>
            {changed ? (
                <button type="submit" className={compactSecondaryButtonClass}>
                    Uložit
                </button>
            ) : null}
        </form>
    )
}
