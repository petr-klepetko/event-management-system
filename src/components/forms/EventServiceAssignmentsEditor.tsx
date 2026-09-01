'use client'

import { useState } from 'react'
import SearchableSelect from '@/components/forms/SearchableSelect'
import { compactSecondaryButtonClass, inputClass } from '@/lib/ui/styles'

type AssignableUser = {
    id: string
    fullName: string
    email: string
}

type AssignmentValue = {
    rowId: string
    type: 'INTERNAL' | 'EXTERNAL'
    userId: string
    supplierName: string
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
        role: 'RESPONSIBLE' | 'WORKER'
        workDescription: string | null
        reward: string
    }>
}

function createEmptyAssignment(rowId: string): AssignmentValue {
    return {
        rowId,
        type: 'INTERNAL',
        userId: '',
        supplierName: '',
        role: 'WORKER',
        workDescription: '',
        reward: '0',
    }
}

export default function EventServiceAssignmentsEditor({
    users,
    defaultAssignments = [],
}: EventServiceAssignmentsEditorProps) {
    const [assignments, setAssignments] = useState<AssignmentValue[]>(
        defaultAssignments.length > 0
            ? defaultAssignments.map((assignment) => ({
                  rowId: assignment.id,
                  type: assignment.userId ? 'INTERNAL' : 'EXTERNAL',
                  userId: assignment.userId ?? '',
                  supplierName: assignment.supplierName ?? '',
                  role: assignment.role,
                  workDescription: assignment.workDescription ?? '',
                  reward: assignment.reward || '0',
              }))
            : [createEmptyAssignment('assignment-empty-0')]
    )

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
                <h3 className="font-medium">Pracovníci a dodavatelé na službě</h3>
                <p className="mt-1 text-sm text-gray-600">
                    Ke službě můžeš přiřadit více lidí z tenantu včetně popisu práce
                    a odměny. Pokud nejde o interního uživatele, vyplň jen dodavatele.
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
                                Pracovník {index + 1}
                            </p>
                            <button
                                type="button"
                                onClick={() => removeAssignment(assignment.rowId)}
                                className={compactSecondaryButtonClass}
                                aria-label={`Odebrat pracovníka ${index + 1}`}
                            >
                                Odebrat
                            </button>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            <button
                                type="button"
                                onClick={() =>
                                    updateAssignment(assignment.rowId, {
                                        type: 'INTERNAL',
                                        supplierName: '',
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
                            ) : (
                                <div className="grid gap-2">
                                    <label
                                        htmlFor={`assignment-supplier-${assignment.rowId}`}
                                        className="text-sm font-medium text-gray-500"
                                    >
                                        Externí dodavatel
                                    </label>
                                    <input name="assignmentUserId" type="hidden" value="" />
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
                            )}

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
                        </div>

                        <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_14rem]">
                            <div className="grid gap-2">
                                <label
                                    htmlFor={`assignment-description-${assignment.rowId}`}
                                    className="text-sm font-medium text-gray-500"
                                >
                                    Popis práce
                                </label>
                                <input
                                    id={`assignment-description-${assignment.rowId}`}
                                    name="assignmentWorkDescription"
                                    type="text"
                                    value={assignment.workDescription}
                                    onChange={(event) =>
                                        updateAssignment(assignment.rowId, {
                                            workDescription: event.target.value,
                                        })
                                    }
                                    className={inputClass}
                                    placeholder="Např. ozvučení sálu"
                                />
                            </div>

                            <div className="grid gap-2">
                                <label
                                    htmlFor={`assignment-reward-${assignment.rowId}`}
                                    className="text-sm font-medium text-gray-500"
                                >
                                    Odměna
                                </label>
                                <input
                                    id={`assignment-reward-${assignment.rowId}`}
                                    name="assignmentReward"
                                    type="text"
                                    value={assignment.reward}
                                    onChange={(event) =>
                                        updateAssignment(assignment.rowId, {
                                            reward: event.target.value,
                                        })
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
                    Ke službě zatím není přiřazený žádný pracovník ani dodavatel.
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
                Přidat pracovníka / dodavatele
            </button>
        </section>
    )
}
