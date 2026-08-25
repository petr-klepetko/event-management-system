import type { EventServiceItemAssignmentInput } from '@/modules/event-services/event-service.service'

export function readEventServiceAssignments(
    formData: FormData
): EventServiceItemAssignmentInput[] {
    const userIds = formData
        .getAll('assignmentUserId')
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

    return userIds.flatMap((userId, index) => {
        const role = roles[index] ?? 'WORKER'
        const reward = rewards[index] ?? ''
        const workDescription = workDescriptions[index] ?? ''

        if (!userId && !reward && !workDescription) {
            return []
        }

        if (!userId) {
            throw new Error('U každého řádku pracovníka vyber uživatele.')
        }

        if (!reward) {
            throw new Error('U každého pracovníka vyplň odměnu.')
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
                userId,
                role,
                workDescription: workDescription || null,
                reward: parsedReward.toFixed(2),
            },
        ]
    })
}
