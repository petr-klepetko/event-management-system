import type { EventServiceItemAssignmentInput } from '@/modules/event-services/event-service.service'
import { parseNonNegativePrice } from '@/lib/money'

export function readEventServiceAssignments(
    formData: FormData
): EventServiceItemAssignmentInput[] {
    const types = formData.getAll('assignmentType').map((value) => String(value))
    const userIds = formData
        .getAll('assignmentUserId')
        .map((value) => String(value).trim())
    const supplierNames = formData
        .getAll('assignmentSupplierName')
        .map((value) => String(value).trim())
    const costNames = formData
        .getAll('assignmentCostName')
        .map((value) => String(value).trim())
    const roles = formData
        .getAll('assignmentRole')
        .map((value) => String(value).trim())
    const workDescriptions = formData
        .getAll('assignmentWorkDescription')
        .map((value) => String(value).trim())
    const rewards = formData
        .getAll('assignmentReward')
        .map((value) => String(value).trim())

    const rowCount = Math.max(
        types.length,
        userIds.length,
        supplierNames.length,
        costNames.length,
        roles.length,
        workDescriptions.length,
        rewards.length
    )

    return Array.from({ length: rowCount }).flatMap((_, index) => {
        const userId = userIds[index] ?? ''
        const supplierName = supplierNames[index] ?? ''
        const costName = costNames[index] ?? ''
        const type = types[index] ?? 'INTERNAL'
        const role = roles[index] ?? 'WORKER'
        const reward = rewards[index] || '0'
        const workDescription = workDescriptions[index] ?? ''

        if (!['INTERNAL', 'EXTERNAL', 'COST'].includes(type)) {
            throw new Error('Typ položky u služby není platný.')
        }

        if (type === 'INTERNAL' && !userId && !supplierName && !costName && !workDescription) {
            return []
        }

        if ((type === 'COST' && (!costName || userId || supplierName)) ||
            (type === 'EXTERNAL' && (!supplierName || userId || costName)) ||
            (type === 'INTERNAL' && (!userId || supplierName || costName))) {
            throw new Error('Vyplň název nákladu nebo vyber pracovníka či dodavatele podle typu položky.')
        }

        if ([userId, supplierName, costName].filter(Boolean).length !== 1) {
            throw new Error(
                'U každého řádku vyber pracovníka, dodavatele nebo zadej náklad ke službě.'
            )
        }

        const parsedReward = parseNonNegativePrice(reward, costName ? 'Cena nákladu' : 'Odměna')

        if (role !== 'RESPONSIBLE' && role !== 'WORKER') {
            throw new Error('Role pracovníka u služby není platná.')
        }

        return [
            {
                userId: userId || null,
                supplierName: supplierName || null,
                costName: costName || null,
                role,
                workDescription: workDescription || null,
                reward: parsedReward,
            },
        ]
    })
}
