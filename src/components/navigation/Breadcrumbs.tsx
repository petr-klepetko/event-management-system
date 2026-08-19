import Link from 'next/link'

type BreadcrumbItem = {
    label: string
    href?: string
}

type BreadcrumbsProps = {
    items: BreadcrumbItem[]
}

export default function Breadcrumbs({ items }: BreadcrumbsProps) {
    return (
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
    )
}
