//src/app/clients/actions.ts

'use server'

import { revalidatePath } from 'next/cache'
import { ClientType } from '@prisma/client'
import { createClient } from '@/modules/clients/client.service'

export async function createClientAction(formData: FormData) {
  const name = String(formData.get('name') ?? '').trim()
  const typeRaw = String(formData.get('type') ?? 'COMPANY')
  const ico = String(formData.get('ico') ?? '').trim()
  const dic = String(formData.get('dic') ?? '').trim()
  const city = String(formData.get('city') ?? '').trim()
  const country = String(formData.get('country') ?? '').trim()

  if (!name) {
    throw new Error('Client name is required.')
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
}