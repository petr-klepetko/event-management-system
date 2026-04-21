import { ClientType } from '@prisma/client'

export function mapClientTypeToLabel(type: ClientType): string {
    switch (type) {
        case 'COMPANY':
            return 'Firma'
        case 'SCHOOL':
            return 'Škola'
        case 'PERSON':
            return 'Osoba'
        default:
            return type
    }
}