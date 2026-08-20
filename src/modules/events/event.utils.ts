import { EventStatus } from '@prisma/client'

const eventStatusLabels: Record<EventStatus, string> = {
    DRAFT: 'Rozpracováno',
    CONFIRMED: 'Potvrzeno',
    COMPLETED: 'Dokončeno',
    CANCELLED: 'Zrušeno',
}

export const eventStatusOptions = Object.entries(eventStatusLabels).map(
    ([value, label]) => ({
        value: value as EventStatus,
        label,
    })
)

export function mapEventStatusToLabel(status: EventStatus) {
    return eventStatusLabels[status]
}
