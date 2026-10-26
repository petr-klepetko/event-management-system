import fs from 'node:fs'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

function loadEnv() {
    const envPath = '.env'

    if (!fs.existsSync(envPath)) {
        return
    }

    for (const line of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
        if (!line || line.trim().startsWith('#')) {
            continue
        }

        const separatorIndex = line.indexOf('=')

        if (separatorIndex === -1) {
            continue
        }

        const key = line.slice(0, separatorIndex).trim()
        const value = line
            .slice(separatorIndex + 1)
            .trim()
            .replace(/^"|"$/g, '')

        if (!process.env[key]) {
            process.env[key] = value
        }
    }
}

function money(value) {
    return value.toFixed(2)
}

loadEnv()

if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not set')
}

if (process.env.ALLOW_FINANCE_YEAR_SEED !== '1') {
    throw new Error(
        'Refusing to seed finance years. Set ALLOW_FINANCE_YEAR_SEED=1 when you intentionally want to write demo finance data.'
    )
}

const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
})

async function firstOrThrow(model, where, label) {
    const row = await model.findFirst({ where })

    if (!row) {
        throw new Error(`Missing seed dependency: ${label}`)
    }

    return row
}

async function ensureEvent({ tenant, client, contact, owner, title, dateStart }) {
    const existing = await prisma.event.findFirst({
        where: {
            tenantId: tenant.id,
            title,
        },
    })

    if (existing) {
        return existing
    }

    return prisma.event.create({
        data: {
            tenantId: tenant.id,
            ownerUserId: owner.id,
            title,
            eventType: 'Maturitní ples',
            status: 'DRAFT',
            dateStart,
            venueName: 'Kulturní dům Alfa',
            clientId: client.id,
            primaryContactId: contact?.id ?? null,
            createdByUserId: owner.id,
            internalNote: 'Ukázková akce pro finanční přehled.',
        },
    })
}

async function ensureServiceItem({ tenant, owner, event, service, customName, price }) {
    const existing = await prisma.eventServiceItem.findFirst({
        where: {
            tenantId: tenant.id,
            eventId: event.id,
            customName,
        },
    })

    if (existing) {
        return existing
    }

    const count = await prisma.eventServiceItem.count({
        where: {
            tenantId: tenant.id,
            eventId: event.id,
        },
    })

    return prisma.eventServiceItem.create({
        data: {
            tenantId: tenant.id,
            ownerUserId: owner.id,
            eventId: event.id,
            serviceCatalogItemId: service?.id ?? null,
            customName,
            description: service?.description ?? 'Ukázková služba pro finanční přehled.',
            price: money(price),
            sortOrder: count,
        },
    })
}

async function ensureAssignment({
    tenant,
    serviceItem,
    user,
    role,
    reward,
    workDescription,
}) {
    await prisma.eventServiceItemAssignment.upsert({
        where: {
            eventServiceItemId_userId: {
                eventServiceItemId: serviceItem.id,
                userId: user.id,
            },
        },
        create: {
            tenantId: tenant.id,
            eventServiceItemId: serviceItem.id,
            userId: user.id,
            role,
            reward: money(reward),
            workDescription,
        },
        update: {
            role,
            reward: money(reward),
            workDescription,
        },
    })
}

async function ensureCost({ tenant, owner, event, name, amount, note }) {
    const existing = await prisma.eventCost.findFirst({
        where: {
            tenantId: tenant.id,
            eventId: event.id,
            name,
        },
    })

    if (existing) {
        await prisma.eventCost.update({
            where: {
                id: existing.id,
            },
            data: {
                amount: money(amount),
                note,
            },
        })
        return
    }

    await prisma.eventCost.create({
        data: {
            tenantId: tenant.id,
            eventId: event.id,
            ownerUserId: owner.id,
            name,
            amount: money(amount),
            note,
        },
    })
}

async function main() {
    const tenants = await prisma.tenant.findMany({
        orderBy: {
            slug: 'asc',
        },
        take: 2,
    })

    for (const tenant of tenants) {
        const ownerMembership = await firstOrThrow(
            prisma.tenantMembership,
            {
                tenantId: tenant.id,
                isActive: true,
                user: {
                    isActive: true,
                },
            },
            `active membership for tenant ${tenant.slug}`
        )
        const owner = await firstOrThrow(
            prisma.user,
            { id: ownerMembership.userId },
            `owner user for tenant ${tenant.slug}`
        )
        const workers = await prisma.user.findMany({
            where: {
                isActive: true,
                memberships: {
                    some: {
                        tenantId: tenant.id,
                        isActive: true,
                    },
                },
            },
            orderBy: {
                fullName: 'asc',
            },
            take: 2,
        })
        const client = await firstOrThrow(
            prisma.client,
            { tenantId: tenant.id, isActive: true },
            `active client for tenant ${tenant.slug}`
        )
        const contact = await prisma.contactPerson.findFirst({
            where: {
                tenantId: tenant.id,
                clientId: client.id,
            },
            orderBy: {
                createdAt: 'asc',
            },
        })
        const services = await prisma.serviceCatalogItem.findMany({
            where: {
                tenantId: tenant.id,
                isActive: true,
            },
            orderBy: {
                name: 'asc',
            },
            take: 2,
        })

        const lastYearEvent = await ensureEvent({
            tenant,
            client,
            contact,
            owner,
            title: `${tenant.name} finanční test 2025`,
            dateStart: new Date('2025-11-15T19:00:00.000Z'),
        })
        const nextYearEvent = await ensureEvent({
            tenant,
            client,
            contact,
            owner,
            title: `${tenant.name} finanční test 2027`,
            dateStart: new Date('2027-03-20T19:00:00.000Z'),
        })

        const lastYearService = await ensureServiceItem({
            tenant,
            owner,
            event: lastYearEvent,
            service: services[0],
            customName: 'Hudební program',
            price: 22000,
        })
        const nextYearService = await ensureServiceItem({
            tenant,
            owner,
            event: nextYearEvent,
            service: services[1] ?? services[0],
            customName: 'Technické zajištění',
            price: 28000,
        })

        if (workers[0]) {
            await ensureAssignment({
                tenant,
                serviceItem: lastYearService,
                user: workers[0],
                role: 'RESPONSIBLE',
                reward: 6500,
                workDescription: 'Koordinace služby na místě.',
            })
        }

        if (workers[1]) {
            await ensureAssignment({
                tenant,
                serviceItem: nextYearService,
                user: workers[1],
                role: 'WORKER',
                reward: 7500,
                workDescription: 'Realizace služby během akce.',
            })
        }

        await ensureCost({
            tenant,
            owner,
            event: lastYearEvent,
            name: 'Doprava',
            amount: 2800,
            note: 'Ukázkový náklad pro minulý rok.',
        })
        await ensureCost({
            tenant,
            owner,
            event: nextYearEvent,
            name: 'Materiál',
            amount: 3900,
            note: 'Ukázkový náklad pro budoucí rok.',
        })
    }
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (error) => {
        console.error(error)
        await prisma.$disconnect()
        process.exit(1)
    })
