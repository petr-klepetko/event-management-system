import { prisma } from '@/lib/db/prisma'

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

export async function getServiceCatalogItemsForAdmin() {
    return prisma.serviceCatalogItem.findMany({
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

export async function getServiceCatalogItemById(id: string) {
    return prisma.serviceCatalogItem.findUnique({
        where: {
            id,
        },
    })
}

export async function createServiceCatalogItem(
    input: CreateServiceCatalogItemInput
) {
    return prisma.serviceCatalogItem.create({
        data: {
            name: input.name,
            description: input.description ?? null,
            defaultPrice: input.defaultPrice,
        },
    })
}

export async function updateServiceCatalogItem(
    input: UpdateServiceCatalogItemInput
) {
    return prisma.serviceCatalogItem.update({
        where: {
            id: input.id,
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
    isActive: boolean
) {
    return prisma.serviceCatalogItem.update({
        where: {
            id,
        },
        data: {
            isActive,
        },
    })
}
