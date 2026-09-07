import { CalendarEntryVisibility } from '@prisma/client'
import PersistedForm from '@/components/forms/PersistedForm'
import {
    inputClass,
    optionClass,
    primaryButtonClass,
} from '@/lib/ui/styles'

type CalendarEntryFormUser = {
    id: string
    fullName: string
    email: string
}

type CalendarEntryFormProps = {
    action: (formData: FormData) => void
    buttonLabel: string
    storageKey: string
    users: CalendarEntryFormUser[]
    defaultValues?: {
        title?: string
        description?: string | null
        visibility?: CalendarEntryVisibility
        dateStart?: Date
        participantUserIds?: string[]
    }
}

function formatDateTimeLocal(value?: Date) {
    if (!value) {
        return ''
    }

    const offsetMs = value.getTimezoneOffset() * 60 * 1000
    const localDate = new Date(value.getTime() - offsetMs)

    return localDate.toISOString().slice(0, 16)
}

export default function CalendarEntryForm({
    action,
    buttonLabel,
    storageKey,
    users,
    defaultValues,
}: CalendarEntryFormProps) {
    const participantUserIds = new Set(defaultValues?.participantUserIds ?? [])

    return (
        <PersistedForm action={action} className="mt-4 grid gap-4" storageKey={storageKey}>
            <div className="grid gap-2">
                <label htmlFor="title" className="font-medium">
                    Název
                </label>
                <input
                    id="title"
                    name="title"
                    type="text"
                    required
                    defaultValue={defaultValues?.title ?? ''}
                    className={inputClass}
                    placeholder="Např. nakládka techniky"
                />
            </div>

            <div className="grid gap-2 sm:grid-cols-2">
                <div className="grid gap-2">
                    <label htmlFor="dateStart" className="font-medium">
                        Datum a čas
                    </label>
                    <input
                        id="dateStart"
                        name="dateStart"
                        type="datetime-local"
                        required
                        defaultValue={formatDateTimeLocal(defaultValues?.dateStart)}
                        className={inputClass}
                    />
                </div>

                <div className="grid gap-2">
                    <label htmlFor="visibility" className="font-medium">
                        Typ události
                    </label>
                    <select
                        id="visibility"
                        name="visibility"
                        defaultValue={
                            defaultValues?.visibility ?? CalendarEntryVisibility.PRIVATE
                        }
                        className={inputClass}
                    >
                        <option className={optionClass} value="PRIVATE">
                            Soukromá
                        </option>
                        <option className={optionClass} value="PUBLIC">
                            Veřejná
                        </option>
                    </select>
                </div>
            </div>

            <div className="grid gap-2">
                <label htmlFor="description" className="font-medium">
                    Popis
                </label>
                <textarea
                    id="description"
                    name="description"
                    rows={4}
                    defaultValue={defaultValues?.description ?? ''}
                    className={inputClass}
                    placeholder="Co se má stát, kde a s kým..."
                />
            </div>

            <fieldset className="grid gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4">
                <legend className="px-1 font-medium">Účastníci</legend>
                {users.length === 0 ? (
                    <p className="text-sm text-gray-600">
                        V tenantu nejsou žádní aktivní uživatelé k přiřazení.
                    </p>
                ) : (
                    <div className="grid gap-2 sm:grid-cols-2">
                        {users.map((user) => (
                            <label
                                key={user.id}
                                className="flex items-start gap-2 rounded-md bg-white px-3 py-2 text-sm"
                            >
                                <input
                                    name="participantUserId"
                                    type="checkbox"
                                    value={user.id}
                                    defaultChecked={participantUserIds.has(user.id)}
                                    className="mt-1"
                                />
                                <span>
                                    <span className="block font-medium">{user.fullName}</span>
                                    <span className="block break-words text-gray-600">
                                        {user.email}
                                    </span>
                                </span>
                            </label>
                        ))}
                    </div>
                )}
            </fieldset>

            <button type="submit" className={primaryButtonClass}>
                {buttonLabel}
            </button>
        </PersistedForm>
    )
}
