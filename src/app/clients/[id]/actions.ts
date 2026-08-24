'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createContact } from '@/modules/clients/client.service'
import { requireAuthContext } from '@/lib/auth/current-user'

type CreateContactActionArgs = {
    clientId: string
}

export async function createContactAction(
    args: CreateContactActionArgs,
    formData: FormData
) {
    let errorMessage: string | null = null

    try {
        const auth = await requireAuthContext()
        const firstName = String(formData.get('firstName') ?? '').trim()
        const lastName = String(formData.get('lastName') ?? '').trim()
        const email = String(formData.get('email') ?? '').trim()
        const phone = String(formData.get('phone') ?? '').trim()
        const instagram = String(formData.get('instagram') ?? '').trim()
        const roleLabel = String(formData.get('roleLabel') ?? '').trim()
        const note = String(formData.get('note') ?? '').trim()
        const isPrimary = formData.get('isPrimary') === 'on'

        if (!firstName) {
            throw new Error('Jméno je povinné.')
        }

        if (!lastName) {
            throw new Error('Příjmení je povinné.')
        }

        await createContact({
            clientId: args.clientId,
            firstName,
            lastName,
            email: email || null,
            phone: phone || null,
            instagram: instagram || null,
            roleLabel: roleLabel || null,
            note: note || null,
            isPrimary,
        }, auth)

        revalidatePath(`/clients/${args.clientId}`)
    } catch (error) {
        errorMessage =
            error instanceof Error
                ? error.message
                : 'Kontakt se nepodařilo přidat.'
    }

    if (errorMessage) {
        redirect(
            `/clients/${args.clientId}?error=${encodeURIComponent(errorMessage)}`
        )
    }

    redirect(`/clients/${args.clientId}?success=KontaktBylPridan`)
}
