import Link from 'next/link'
import { getCurrentAuthContext } from '@/lib/auth/current-user'
import { logoutAction } from '@/app/login/actions'
import { compactSecondaryButtonClass } from '@/lib/ui/styles'

type BreadcrumbItem = {
    label: string
    href?: string
}

type BreadcrumbsProps = {
    items: BreadcrumbItem[]
}

export default async function Breadcrumbs({ items }: BreadcrumbsProps) {
    const auth = await getCurrentAuthContext()

    return (
        <div className="top-navigation">
            <nav aria-label="Drobečková navigace" className="breadcrumbs">
                <ol>
                    {items.map((item, index) => {
                        const isLast = index === items.length - 1

                        return (
                            <li key={`${item.label}-${index}`}>
                                {item.href ? (
                                    <Link
                                        href={item.href}
                                        aria-current={isLast ? 'page' : undefined}
                                    >
                                        {item.label}
                                    </Link>
                                ) : (
                                    <span aria-current={isLast ? 'page' : undefined}>
                                        {item.label}
                                    </span>
                                )}
                            </li>
                        )
                    })}
                </ol>
            </nav>

            {auth ? (
                <div className="user-menu">
                    <span>{auth.fullName}</span>
                    <form action={logoutAction}>
                        <button
                            type="submit"
                            className={compactSecondaryButtonClass}
                        >
                            Odhlásit
                        </button>
                    </form>
                </div>
            ) : null}
        </div>
    )
}
