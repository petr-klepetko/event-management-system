import { EventStatus } from '@prisma/client'

const eventStatusLabels: Record<EventStatus, string> = {
    DRAFT: 'Rozpracováno',
    CONFIRMED: 'Potvrzeno',
    COMPLETED: 'Dokončeno',
    CANCELLED: 'Zrušeno',
}

export function mapEventStatusToLabel(status: EventStatus) {
    return eventStatusLabels[status]
}
