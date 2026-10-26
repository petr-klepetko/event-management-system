'use client'

import {
    useEffect,
    useRef,
} from 'react'
import type { ComponentPropsWithoutRef } from 'react'

export type PersistedFormField = {
    name: string
    type: string
    value: string
    checked?: boolean
}

type PersistedFormProps = Omit<ComponentPropsWithoutRef<'form'>, 'action'> & {
    action?: ComponentPropsWithoutRef<'form'>['action'] | ((formData: FormData) => void)
    storageKey: string
    restoreOnParams?: string[]
}

function canPersistElement(
    element: Element
): element is HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement {
    if (
        !(
            element instanceof HTMLInputElement ||
            element instanceof HTMLSelectElement ||
            element instanceof HTMLTextAreaElement
        )
    ) {
        return false
    }

    if (
        !element.name ||
        element.dataset.persistIgnore === 'true' ||
        element.name.toLowerCase().includes('password')
    ) {
        return false
    }

    if (element instanceof HTMLInputElement) {
        return !['button', 'file', 'image', 'password', 'reset', 'submit'].includes(
            element.type
        )
    }

    return true
}

function getFields(form: HTMLFormElement): PersistedFormField[] {
    return Array.from(form.elements).filter(canPersistElement).map((element) => ({
        name: element.name,
        type: element instanceof HTMLInputElement ? element.type : element.tagName,
        value: element.value,
        checked:
            element instanceof HTMLInputElement &&
            ['checkbox', 'radio'].includes(element.type)
                ? element.checked
                : undefined,
    }))
}

function setElementValue(
    element: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement,
    field: PersistedFormField
) {
    if (
        element instanceof HTMLInputElement &&
        ['checkbox', 'radio'].includes(element.type)
    ) {
        element.checked = Boolean(field.checked)
    } else {
        const prototype = Object.getPrototypeOf(element)
        const descriptor = Object.getOwnPropertyDescriptor(prototype, 'value')

        descriptor?.set?.call(element, field.value)
    }

    element.dispatchEvent(new Event('input', { bubbles: true }))
    element.dispatchEvent(new Event('change', { bubbles: true }))
}

export default function PersistedForm({
    children,
    onChange,
    onInput,
    onSubmit,
    restoreOnParams = ['error'],
    storageKey,
    ...props
}: PersistedFormProps) {
    const formRef = useRef<HTMLFormElement>(null)

    useEffect(() => {
        const form = formRef.current
        const searchParams = new URLSearchParams(window.location.search)
        const shouldRestore = restoreOnParams.some((param) => searchParams.has(param))

        if (!form) {
            return
        }

        if (!shouldRestore) {
            window.sessionStorage.removeItem(storageKey)
            return
        }

        const savedValue = window.sessionStorage.getItem(storageKey)

        if (!savedValue) {
            return
        }

        try {
            const savedFields = JSON.parse(savedValue) as PersistedFormField[]
            const elements = Array.from(form.elements).filter(canPersistElement)

            for (const includeHidden of [false, true]) {
                const indexByName = new Map<string, number>()

                for (const element of elements) {
                    if (
                        element instanceof HTMLInputElement &&
                        (element.type === 'hidden') !== includeHidden
                    ) {
                        continue
                    }

                    if (!(element instanceof HTMLInputElement) && includeHidden) {
                        continue
                    }

                    const currentIndex = indexByName.get(element.name) ?? 0
                    const matchingField = savedFields.filter(
                        (field) => field.name === element.name
                    )[currentIndex]

                    indexByName.set(element.name, currentIndex + 1)

                    if (matchingField) {
                        setElementValue(element, matchingField)
                    }
                }
            }
        } catch {
            window.sessionStorage.removeItem(storageKey)
        }
    }, [restoreOnParams, storageKey])

    function saveFormState() {
        const form = formRef.current

        if (!form) {
            return
        }

        window.sessionStorage.setItem(storageKey, JSON.stringify(getFields(form)))
    }

    return (
        <form
            ref={formRef}
            onChange={(event) => {
                saveFormState()
                onChange?.(event)
            }}
            onInput={(event) => {
                saveFormState()
                onInput?.(event)
            }}
            onSubmit={(event) => {
                saveFormState()
                onSubmit?.(event)
            }}
            {...props}
        >
            {children}
        </form>
    )
}
