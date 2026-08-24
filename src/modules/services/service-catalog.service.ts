import { prisma } from '@/lib/db/prisma'
import { AuthContext, getTenantScopedWhere } from '@/lib/auth/current-user'

export type CreateServiceCatalogItemInput = {
    name: string
    description?: string | null
    defaultPrice: string
}

export type UpdateServiceCatalogItemInput = {
    id: string
    name: string
    description?: string | null
    defaultPrice: string
}

export async function getServiceCatalogItemsForAdmin(auth: AuthContext) {
    return prisma.serviceCatalogItem.findMany({
        where: getTenantScopedWhere(auth),
        orderBy: [
            {
                isActive: 'desc',
            },
            {
                name: 'asc',
            },
        ],
    })
}

export async function getServiceCatalogItemById(id: string, auth: AuthContext) {
    return prisma.serviceCatalogItem.findUnique({
        where: {
            id,
            ...getTenantScopedWhere(auth),
        },
    })
}

export async function createServiceCatalogItem(
    input: CreateServiceCatalogItemInput,
    auth: AuthContext
) {
    if (!auth.tenantId && !auth.isAdmin) {
        throw new Error('Uživatel není přiřazený k žádnému tenantu.')
    }

    return prisma.serviceCatalogItem.create({
        data: {
            tenantId: auth.tenantId ?? 'default-tenant',
            ownerUserId: auth.userId,
            name: input.name,
            description: input.description ?? null,
            defaultPrice: input.defaultPrice,
        },
    })
}

export async function updateServiceCatalogItem(
    input: UpdateServiceCatalogItemInput,
    auth: AuthContext
) {
    return prisma.serviceCatalogItem.update({
        where: {
            id: input.id,
            ...getTenantScopedWhere(auth),
        },
        data: {
            name: input.name,
            description: input.description ?? null,
            defaultPrice: input.defaultPrice,
        },
    })
}

export async function setServiceCatalogItemActive(
    id: string,
    isActive: boolean,
    auth: AuthContext
) {
    return prisma.serviceCatalogItem.update({
        where: {
            id,
            ...getTenantScopedWhere(auth),
        },
        data: {
            isActive,
        },
    })
}
