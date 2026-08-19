//src/app/clients/actions.ts

'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { ClientType } from '@prisma/client'
import { createClient } from '@/modules/clients/client.service'

export async function createClientAction(formData: FormData) {
  let errorMessage: string | null = null

  try {
    const name = String(formData.get('name') ?? '').trim()
    const typeRaw = String(formData.get('type') ?? 'COMPANY')
    const ico = String(formData.get('ico') ?? '').trim()
    const dic = String(formData.get('dic') ?? '').trim()
    const city = String(formData.get('city') ?? '').trim()
    const country = String(formData.get('country') ?? '').trim()

    if (!name) {
      throw new Error('Název klienta je povinný.')
    }

    const allowedTypes: ClientType[] = ['COMPANY', 'SCHOOL', 'PERSON']
    const type = allowedTypes.includes(typeRaw as ClientType)
      ? (typeRaw as ClientType)
      : 'COMPANY'

    await createClient({
      name,
      type,
      ico: ico || null,
      dic: dic || null,
      city: city || null,
      country: country || null,
    })

    revalidatePath('/clients')
  } catch (error) {
    errorMessage =
      error instanceof Error
        ? error.message
        : 'Klienta se nepodařilo vytvořit.'
  }

  if (errorMessage) {
    redirect(`/clients?error=${encodeURIComponent(errorMessage)}`)
  }

  redirect('/clients?success=KlientBylVytvoren')
}
