'use client'

import { useEffect, useState } from 'react'
import SearchableSelect from '@/components/forms/SearchableSelect'
import PriceInput from '@/components/forms/PriceInput'
import { formatEditablePrice } from '@/lib/money'
import type { PersistedFormField } from '@/components/forms/PersistedForm'
import { compactSecondaryButtonClass, inputClass } from '@/lib/ui/styles'

type AssignableUser = {
    id: string
    fullName: string
    email: string
}

type AssignmentValue = {
    rowId: string
    type: 'INTERNAL' | 'EXTERNAL' | 'COST'
    userId: string
    supplierName: string
    costName: string
    role: 'RESPONSIBLE' | 'WORKER'
    workDescription: string
    reward: string
}

type EventServiceAssignmentsEditorProps = {
    users: AssignableUser[]
    defaultAssignments?: Array<{
        id: string
        userId: string | null
        supplierName: string | null
        costName: string | null
        role: 'RESPONSIBLE' | 'WORKER'
        workDescription: string | null
        reward: string
    }>
    persistenceKey?: string
}

function createEmptyAssignment(rowId: string): AssignmentValue {
    return {
        rowId,
        type: 'INTERNAL',
        userId: '',
        supplierName: '',
        costName: '',
        role: 'WORKER',
        workDescription: '',
        reward: formatEditablePrice('0'),
    }
}

function getPersistedAssignments(persistenceKey?: string) {
    if (!persistenceKey || !new URLSearchParams(window.location.search).has('error')) {
        return null
    }

    const savedValue = window.sessionStorage.getItem(persistenceKey)

    if (!savedValue) {
        return null
    }

    try {
        const savedFields = JSON.parse(savedValue) as PersistedFormField[]
        const fieldsByName = new Map<string, PersistedFormField[]>()

        for (const field of savedFields) {
            fieldsByName.set(field.name, [
                ...(fieldsByName.get(field.name) ?? []),
                field,
            ])
        }

        const rowCount = Math.max(
            fieldsByName.get('assignmentType')?.length ?? 0,
            fieldsByName.get('assignmentUserId')?.length ?? 0,
            fieldsByName.get('assignmentSupplierName')?.length ?? 0,
            fieldsByName.get('assignmentCostName')?.length ?? 0,
            fieldsByName.get('assignmentRole')?.length ?? 0,
            fieldsByName.get('assignmentWorkDescription')?.length ?? 0,
            fieldsByName.get('assignmentReward')?.length ?? 0
        )

        return Array.from({ length: rowCount }, (_, index) => {
            const userId = fieldsByName.get('assignmentUserId')?.[index]?.value ?? ''
            const supplierName =
                fieldsByName.get('assignmentSupplierName')?.[index]?.value ?? ''
            const costName = fieldsByName.get('assignmentCostName')?.[index]?.value ?? ''
            const savedType = fieldsByName.get('assignmentType')?.[index]?.value
            const roleValue =
                fieldsByName.get('assignmentRole')?.[index]?.value === 'RESPONSIBLE'
                    ? 'RESPONSIBLE'
                    : 'WORKER'

            return {
                rowId: `persisted-assignment-${index}`,
                type: savedType === 'COST' || savedType === 'EXTERNAL' || savedType === 'INTERNAL'
                    ? savedType
                    : costName ? 'COST' : userId ? 'INTERNAL' : 'EXTERNAL',
                userId,
                supplierName,
                costName,
                role: roleValue,
                workDescription:
                    fieldsByName.get('assignmentWorkDescription')?.[index]?.value ?? '',
                reward: formatEditablePrice(fieldsByName.get('assignmentReward')?.[index]?.value || '0'),
            } satisfies AssignmentValue
        })
    } catch {
        window.sessionStorage.removeItem(persistenceKey)
        return null
    }
}

export default function EventServiceAssignmentsEditor({
    users,
    defaultAssignments = [],
    persistenceKey,
}: EventServiceAssignmentsEditorProps) {
    const [assignments, setAssignments] = useState<AssignmentValue[]>(
        defaultAssignments.length > 0
            ? defaultAssignments.map((assignment) => ({
                  rowId: assignment.id,
                  type: assignment.costName ? 'COST' : assignment.userId ? 'INTERNAL' : 'EXTERNAL',
                  userId: assignment.userId ?? '',
                  supplierName: assignment.supplierName ?? '',
                  costName: assignment.costName ?? '',
                  role: assignment.role,
                  workDescription: assignment.workDescription ?? '',
                  reward: formatEditablePrice(assignment.reward || '0'),
              }))
            : [createEmptyAssignment('assignment-empty-0')]
    )

    useEffect(() => {
        const persistedAssignments = getPersistedAssignments(persistenceKey)

        if (!persistedAssignments) {
            return
        }

        const timeoutId = window.setTimeout(() => {
            setAssignments(persistedAssignments)
        }, 0)

        return () => window.clearTimeout(timeoutId)
    }, [persistenceKey])

    function updateAssignment(
        rowId: string,
        patch: Partial<Omit<AssignmentValue, 'rowId'>>
    ) {
        setAssignments((currentAssignments) =>
            currentAssignments.map((assignment) =>
                assignment.rowId === rowId
                    ? {
                          ...assignment,
                          ...patch,
                      }
                    : assignment
            )
        )
    }

    function removeAssignment(rowId: string) {
        setAssignments((currentAssignments) =>
            currentAssignments.filter((assignment) => assignment.rowId !== rowId)
        )
    }

    return (
        <section className="grid gap-3">
            <div>
                <h3 className="font-medium">Pracovníci, dodavatelé a náklady na službě</h3>
                <p className="mt-1 text-sm text-gray-600">
                    Ke službě můžeš přiřadit pracovníky, dodavatele i samostatné náklady.
                </p>
            </div>

            <div className="grid gap-3">
                {assignments.map((assignment, index) => (
                    <div
                        key={assignment.rowId}
                        className="grid gap-4 rounded-lg border border-slate-200 bg-slate-50 p-4"
                    >
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <p className="text-sm font-semibold text-slate-700">
                                Položka {index + 1}
                            </p>
                            <button
                                type="button"
                                onClick={() => removeAssignment(assignment.rowId)}
                                className={compactSecondaryButtonClass}
                                aria-label={`Odebrat položku ${index + 1}`}
                            >
                                Odebrat
                            </button>
                        </div>

                        <input name="assignmentType" type="hidden" value={assignment.type} />

                        <div className="flex flex-wrap gap-2">
                            <button
                                type="button"
                                onClick={() =>
                                    updateAssignment(assignment.rowId, {
                                        type: 'INTERNAL',
                                        supplierName: '',
                                        costName: '',
                                    })
                                }
                                className={`rounded-md border px-3 py-2 text-sm font-medium transition-colors ${
                                    assignment.type === 'INTERNAL'
                                        ? 'btn-primary'
                                        : 'btn-secondary'
                                }`}
                            >
                                Interní pracovník
                            </button>
                            <button
                                type="button"
                                onClick={() =>
                                    updateAssignment(assignment.rowId, {
                                        type: 'EXTERNAL',
                                        userId: '',
                                        costName: '',
                                    })
                                }
                                className={`rounded-md border px-3 py-2 text-sm font-medium transition-colors ${
                                    assignment.type === 'EXTERNAL'
                                        ? 'btn-primary'
                                        : 'btn-secondary'
                                }`}
                            >
                                Externí dodavatel
                            </button>
                            <button
                                type="button"
                                onClick={() =>
                                    updateAssignment(assignment.rowId, {
                                        type: 'COST',
                                        userId: '',
                                        supplierName: '',
                                        role: 'WORKER',
                                    })
                                }
                                className={`rounded-md border px-3 py-2 text-sm font-medium transition-colors ${
                                    assignment.type === 'COST' ? 'btn-primary' : 'btn-secondary'
                                }`}
                            >
                                Náklad ke službě
                            </button>
                        </div>

                        <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_14rem]">
                            {assignment.type === 'INTERNAL' ? (
                                <div className="grid gap-2">
                                    <label
                                        htmlFor={`assignment-user-${assignment.rowId}`}
                                        className="text-sm font-medium text-gray-500"
                                    >
                                        Interní pracovník
                                    </label>
                                    <input name="assignmentSupplierName" type="hidden" value="" />
                                    <input name="assignmentCostName" type="hidden" value="" />
                                    <SearchableSelect
                                        key={`internal-${assignment.rowId}`}
                                        id={`assignment-user-${assignment.rowId}`}
                                        name="assignmentUserId"
                                        defaultValue={assignment.userId}
                                        placeholder="Vyber pracovníka..."
                                        emptyOptionLabel="Bez pracovníka"
                                        options={users.map((user) => ({
                                            value: user.id,
                                            label: `${user.fullName} (${user.email})`,
                                            searchText: `${user.fullName} ${user.email}`,
                                        }))}
                                        onValueChange={(value) =>
                                            updateAssignment(assignment.rowId, {
                                                userId: value,
                                            })
                                        }
                                    />
                                </div>
                            ) : assignment.type === 'EXTERNAL' ? (
                                <div className="grid gap-2">
                                    <label
                                        htmlFor={`assignment-supplier-${assignment.rowId}`}
                                        className="text-sm font-medium text-gray-500"
                                    >
                                        Externí dodavatel
                                    </label>
                                    <input name="assignmentUserId" type="hidden" value="" />
                                    <input name="assignmentCostName" type="hidden" value="" />
                                    <input
                                        id={`assignment-supplier-${assignment.rowId}`}
                                        name="assignmentSupplierName"
                                        type="text"
                                        value={assignment.supplierName}
                                        onChange={(event) =>
                                            updateAssignment(assignment.rowId, {
                                                supplierName: event.target.value,
                                            })
                                        }
                                        className={inputClass}
                                        placeholder="Např. DJ Novák"
                                    />
                                </div>
                            ) : (
                                <div className="grid gap-2">
                                    <label htmlFor={`assignment-cost-${assignment.rowId}`} className="text-sm font-medium text-gray-500">
                                        Náklad (název)
                                    </label>
                                    <input name="assignmentUserId" type="hidden" value="" />
                                    <input name="assignmentSupplierName" type="hidden" value="" />
                                    <input
                                        id={`assignment-cost-${assignment.rowId}`}
                                        name="assignmentCostName"
                                        type="text"
                                        value={assignment.costName}
                                        onChange={(event) => updateAssignment(assignment.rowId, { costName: event.target.value })}
                                        className={inputClass}
                                        placeholder="Např. materiál"
                                    />
                                </div>
                            )}

                            {assignment.type === 'COST' ? (
                                <input name="assignmentRole" type="hidden" value="WORKER" />
                            ) : (
                                <div className="grid gap-2">
                                    <label
                                        htmlFor={`assignment-role-${assignment.rowId}`}
                                        className="text-sm font-medium text-gray-500"
                                    >
                                        Role na službě
                                    </label>
                                    <select
                                        id={`assignment-role-${assignment.rowId}`}
                                        name="assignmentRole"
                                        value={assignment.role}
                                        onChange={(event) =>
                                            updateAssignment(assignment.rowId, {
                                                role:
                                                    event.target.value === 'RESPONSIBLE'
                                                        ? 'RESPONSIBLE'
                                                        : 'WORKER',
                                            })
                                        }
                                        className={inputClass}
                                    >
                                        <option value="RESPONSIBLE">Má na starost</option>
                                        <option value="WORKER">Pracovník</option>
                                    </select>
                                </div>
                            )}
                        </div>

                        <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_14rem]">
                            <div className="grid gap-2">
                                <label
                                    htmlFor={`assignment-description-${assignment.rowId}`}
                                    className="text-sm font-medium text-gray-500"
                                >
                                    {assignment.type === 'COST' ? 'Popis nákladu' : 'Popis práce'}
                                </label>
                                <textarea
                                    id={`assignment-description-${assignment.rowId}`}
                                    name="assignmentWorkDescription"
                                    rows={assignment.type === 'COST' ? 3 : 2}
                                    value={assignment.workDescription}
                                    onChange={(event) =>
                                        updateAssignment(assignment.rowId, {
                                            workDescription: event.target.value,
                                        })
                                    }
                                    className={inputClass}
                                    placeholder={assignment.type === 'COST' ? 'Např. spotřební materiál' : 'Např. ozvučení sálu'}
                                />
                            </div>

                            <div className="grid gap-2">
                                <label
                                    htmlFor={`assignment-reward-${assignment.rowId}`}
                                    className="text-sm font-medium text-gray-500"
                                >
                                    {assignment.type === 'COST' ? 'Cena' : 'Odměna'}
                                </label>
                                <PriceInput
                                    id={`assignment-reward-${assignment.rowId}`}
                                    name="assignmentReward"
                                    value={assignment.reward}
                                    onChange={(event) =>
                                        updateAssignment(assignment.rowId, {
                                            reward: event.target.value,
                                        })
                                    }
                                    onValueChange={(value) =>
                                        updateAssignment(assignment.rowId, { reward: value })
                                    }
                                    className={inputClass}
                                    placeholder="0"
                                />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {assignments.length === 0 ? (
                <p className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-gray-600">
                    Ke službě zatím není přiřazený žádný pracovník, dodavatel ani náklad.
                </p>
            ) : null}

            <button
                type="button"
                onClick={() =>
                    setAssignments((currentAssignments) => [
                        ...currentAssignments,
                        createEmptyAssignment(crypto.randomUUID()),
                    ])
                }
                className={compactSecondaryButtonClass}
            >
                Přidat pracovníka / dodavatele / náklad
            </button>
        </section>
    )
}
