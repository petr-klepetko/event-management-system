import type { EventServiceItemAssignmentInput } from '@/modules/event-services/event-service.service'

export function readEventServiceAssignments(
    formData: FormData
): EventServiceItemAssignmentInput[] {
    const userIds = formData
        .getAll('assignmentUserId')
        .map((value) => String(value).trim())
    const supplierNames = formData
        .getAll('assignmentSupplierName')
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
        userIds.length,
        supplierNames.length,
        roles.length,
        workDescriptions.length,
        rewards.length
    )

    return Array.from({ length: rowCount }).flatMap((_, index) => {
        const userId = userIds[index] ?? ''
        const supplierName = supplierNames[index] ?? ''
        const role = roles[index] ?? 'WORKER'
        const reward = rewards[index] || '0'
        const workDescription = workDescriptions[index] ?? ''

        if (!userId && !supplierName && !workDescription) {
            return []
        }

        if (!userId && !supplierName) {
            throw new Error(
                'U každého řádku vyber pracovníka nebo napiš externího dodavatele.'
            )
        }

        const normalizedReward = reward.replace(',', '.')
        const parsedReward = Number(normalizedReward)

        if (Number.isNaN(parsedReward) || parsedReward < 0) {
            throw new Error('Odměna pracovníka musí být platné nezáporné číslo.')
        }

        if (role !== 'RESPONSIBLE' && role !== 'WORKER') {
            throw new Error('Role pracovníka u služby není platná.')
        }

        return [
            {
                userId: userId || null,
                supplierName: supplierName || null,
                role,
                workDescription: workDescription || null,
                reward: parsedReward.toFixed(2),
            },
        ]
    })
}
