'use server'

import { revalidatePath } from 'next/cache'
import { createContact } from '@/modules/clients/client.service'

type CreateContactActionArgs = {
    clientId: string
}

export async function createContactAction(
    args: CreateContactActionArgs,
    formData: FormData
) {
    const firstName = String(formData.get('firstName') ?? '').trim()
    const lastName = String(formData.get('lastName') ?? '').trim()
    const email = String(formData.get('email') ?? '').trim()
    const phone = String(formData.get('phone') ?? '').trim()
    const roleLabel = String(formData.get('roleLabel') ?? '').trim()
    const isPrimary = formData.get('isPrimary') === 'on'

    if (!firstName) {
        throw new Error('First name is required.')
    }

    if (!lastName) {
        throw new Error('Last name is required.')
    }

    await createContact({
        clientId: args.clientId,
        firstName,
        lastName,
        email: email || null,
        phone: phone || null,
        roleLabel: roleLabel || null,
        isPrimary,
    })

    revalidatePath(`/clients/${args.clientId}`)
}