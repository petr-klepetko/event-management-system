'use client'

type ConfirmSubmitButtonProps = {
    children: React.ReactNode
    confirmMessage?: string
    className?: string
}

export default function ConfirmSubmitButton({
    children,
    confirmMessage = 'Opravdu chceš pokračovat?',
    className,
}: ConfirmSubmitButtonProps) {
    return (
        <button
            type="submit"
            onClick={(e) => {
                if (!confirm(confirmMessage)) {
                    e.preventDefault()
                }
            }}
            className={className}
        >
            {children}
        </button>
    )
}