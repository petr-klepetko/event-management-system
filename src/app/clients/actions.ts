//src/app/clients/actions.ts

'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { ClientType } from '@prisma/client'
import { createClient, updateClient } from '@/modules/clients/client.service'
import { requireTenantManagerContext } from '@/lib/auth/current-user'

function readClientFormData(formData: FormData) {
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

  return {
    name,
    type,
    ico: ico || null,
    dic: dic || null,
    city: city || null,
    country: country || null,
  }
}

export async function createClientAction(formData: FormData) {
  const auth = await requireTenantManagerContext()
  let errorMessage: string | null = null

  try {
    const input = readClientFormData(formData)

    await createClient(input, auth)

    revalidatePath('/clients')
  } catch (error) {
    errorMessage =
      error instanceof Error
        ? error.message
        : 'Klienta se nepodařilo vytvořit.'
  }

  if (errorMessage) {
    redirect(`/clients/new?error=${encodeURIComponent(errorMessage)}`)
  }

  redirect('/clients?success=KlientBylVytvoren')
}

type UpdateClientActionArgs = {
  clientId: string
}

export async function updateClientAction(
  args: UpdateClientActionArgs,
  formData: FormData
) {
  const auth = await requireTenantManagerContext()
  let errorMessage: string | null = null

  try {
    const input = readClientFormData(formData)

    await updateClient({
      id: args.clientId,
      ...input,
    }, auth)

    revalidatePath('/clients')
    revalidatePath(`/clients/${args.clientId}`)
  } catch (error) {
    errorMessage =
      error instanceof Error
        ? error.message
        : 'Klienta se nepodařilo upravit.'
  }

  if (errorMessage) {
    redirect(
      `/clients/${args.clientId}/edit?error=${encodeURIComponent(errorMessage)}`
    )
  }

  redirect(`/clients/${args.clientId}?success=KlientBylUlozen`)
}
