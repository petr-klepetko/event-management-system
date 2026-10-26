'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { inputClass } from '@/lib/ui/styles'

type CalendarItem = {
    id: string
    href: string
    kind: 'EVENT' | 'CALENDAR_ENTRY'
    title: string
    dateStart: string
    eyebrow: string
    details: Array<{
        label: string
        value: string
    }>
}

type EventsMonthCalendarProps = {
    items: CalendarItem[]
}

const dayLabels = ['Po', 'Út', 'St', 'Čt', 'Pá', 'So', 'Ne']
const monthOptions = [
    'Leden',
    'Únor',
    'Březen',
    'Duben',
    'Květen',
    'Červen',
    'Červenec',
    'Srpen',
    'Září',
    'Říjen',
    'Listopad',
    'Prosinec',
]

function parseItemDate(item: CalendarItem) {
    return new Date(item.dateStart)
}

function getMonthAnchor(items: CalendarItem[]) {
    const now = new Date()
    const currentMonthItems = items.filter((item) => {
        const dateStart = parseItemDate(item)

        return (
            dateStart.getFullYear() === now.getFullYear() &&
            dateStart.getMonth() === now.getMonth()
        )
    })

    if (currentMonthItems.length > 0) {
        return new Date(now.getFullYear(), now.getMonth(), 1)
    }

    const futureItems = items
        .filter((item) => parseItemDate(item) >= now)
        .sort(
            (a, b) =>
                parseItemDate(a).getTime() - parseItemDate(b).getTime()
        )

    const fallbackItem =
        futureItems[0] ??
        [...items].sort(
            (a, b) =>
                parseItemDate(b).getTime() - parseItemDate(a).getTime()
        )[0]

    if (!fallbackItem) {
        return new Date(now.getFullYear(), now.getMonth(), 1)
    }

    const fallbackDate = parseItemDate(fallbackItem)

    return new Date(fallbackDate.getFullYear(), fallbackDate.getMonth(), 1)
}

function getMondayBasedDayIndex(date: Date) {
    return (date.getDay() + 6) % 7
}

function getCalendarDays(monthAnchor: Date) {
    const firstDay = new Date(
        monthAnchor.getFullYear(),
        monthAnchor.getMonth(),
        1
    )
    const lastDay = new Date(
        monthAnchor.getFullYear(),
        monthAnchor.getMonth() + 1,
        0
    )
    const startDate = new Date(firstDay)
    const endDate = new Date(lastDay)

    startDate.setDate(firstDay.getDate() - getMondayBasedDayIndex(firstDay))
    endDate.setDate(lastDay.getDate() + (6 - getMondayBasedDayIndex(lastDay)))

    const days: Date[] = []
    const cursor = new Date(startDate)

    while (cursor <= endDate) {
        days.push(new Date(cursor))
        cursor.setDate(cursor.getDate() + 1)
    }

    return days
}

function formatDayKey(date: Date) {
    return [
        date.getFullYear(),
        String(date.getMonth() + 1).padStart(2, '0'),
        String(date.getDate()).padStart(2, '0'),
    ].join('-')
}

function formatTime(date: Date) {
    return new Intl.DateTimeFormat('cs-CZ', {
        hour: '2-digit',
        minute: '2-digit',
    }).format(date)
}

function formatMonth(date: Date) {
    return new Intl.DateTimeFormat('cs-CZ', {
        month: 'long',
        year: 'numeric',
    }).format(date)
}

function getYearOptions(items: CalendarItem[]) {
    const currentYear = new Date().getFullYear()
    const itemYears = items.map((item) => parseItemDate(item).getFullYear())
    const minYear = Math.min(currentYear - 1, ...itemYears)
    const maxYear = Math.max(currentYear + 2, ...itemYears)
    const years: number[] = []

    for (let year = minYear; year <= maxYear; year += 1) {
        years.push(year)
    }

    return years
}

function getItemLinkClass(kind: CalendarItem['kind']) {
    if (kind === 'CALENDAR_ENTRY') {
        return 'block min-w-0 rounded-md border border-indigo-100 bg-indigo-50 px-2 py-1 text-[0.7rem] font-medium leading-tight text-indigo-950 hover:border-indigo-300 hover:bg-indigo-100'
    }

    return 'block min-w-0 rounded-md border border-teal-100 bg-teal-50 px-2 py-1 text-[0.7rem] font-medium leading-tight text-teal-900 hover:border-teal-300 hover:bg-teal-100'
}

function getItemTimeClass(kind: CalendarItem['kind']) {
    return kind === 'CALENDAR_ENTRY' ? 'text-indigo-700' : 'text-teal-700'
}

export default function EventsMonthCalendar({ items }: EventsMonthCalendarProps) {
    const initialMonthAnchor = useMemo(() => getMonthAnchor(items), [items])
    const [selectedMonth, setSelectedMonth] = useState(
        initialMonthAnchor.getMonth()
    )
    const [selectedYear, setSelectedYear] = useState(
        initialMonthAnchor.getFullYear()
    )
    const [activeTooltip, setActiveTooltip] = useState<{
        item: CalendarItem
        x: number
        y: number
    } | null>(null)
    const monthAnchor = new Date(selectedYear, selectedMonth, 1)
    const calendarDays = getCalendarDays(monthAnchor)
    const yearOptions = getYearOptions(items)

    const itemsByDay = useMemo(() => {
        const groupedItems = new Map<string, CalendarItem[]>()

        for (const item of items) {
            const dayKey = formatDayKey(parseItemDate(item))
            const dayItems = groupedItems.get(dayKey) ?? []

            dayItems.push(item)
            groupedItems.set(dayKey, dayItems)
        }

        for (const dayItems of groupedItems.values()) {
            dayItems.sort(
                (a, b) =>
                    parseItemDate(a).getTime() - parseItemDate(b).getTime()
            )
        }

        return groupedItems
    }, [items])

    function changeMonth(offset: number) {
        const nextMonth = new Date(selectedYear, selectedMonth + offset, 1)

        setSelectedMonth(nextMonth.getMonth())
        setSelectedYear(nextMonth.getFullYear())
    }

    function showTooltip(item: CalendarItem, element: HTMLElement) {
        const rect = element.getBoundingClientRect()
        const tooltipHalfWidth = 128
        const viewportPadding = 16
        const centeredX = rect.left + rect.width / 2

        setActiveTooltip({
            item,
            x: Math.min(
                Math.max(centeredX, tooltipHalfWidth + viewportPadding),
                window.innerWidth - tooltipHalfWidth - viewportPadding
            ),
            y: rect.top,
        })
    }

    return (
        <section className="mt-8 overflow-visible rounded-xl border p-4 sm:p-6">
            <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                    <h2 className="text-xl font-semibold">Kalendář akcí</h2>
                    <p className="mt-1 text-sm text-gray-600">
                        {formatMonth(monthAnchor)}
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <button
                        type="button"
                        onClick={() => changeMonth(-1)}
                        className="rounded-md border px-3 py-2 text-sm font-medium"
                    >
                        Předchozí
                    </button>
                    <select
                        value={selectedMonth}
                        onChange={(event) =>
                            setSelectedMonth(Number(event.target.value))
                        }
                        className={inputClass}
                        aria-label="Měsíc"
                    >
                        {monthOptions.map((month, index) => (
                            <option key={month} value={index}>
                                {month}
                            </option>
                        ))}
                    </select>
                    <select
                        value={selectedYear}
                        onChange={(event) =>
                            setSelectedYear(Number(event.target.value))
                        }
                        className={inputClass}
                        aria-label="Rok"
                    >
                        {yearOptions.map((year) => (
                            <option key={year} value={year}>
                                {year}
                            </option>
                        ))}
                    </select>
                    <button
                        type="button"
                        onClick={() => changeMonth(1)}
                        className="rounded-md border px-3 py-2 text-sm font-medium"
                    >
                        Další
                    </button>
                </div>
            </div>

            <div className="mt-4 overflow-x-auto pb-2">
                <div className="grid min-w-[44rem] grid-cols-7 gap-px rounded-lg border border-slate-200 bg-slate-200">
                    {dayLabels.map((dayLabel) => (
                        <div
                            key={dayLabel}
                            className="bg-slate-50 px-2 py-2 text-center text-xs font-semibold text-gray-500"
                        >
                            {dayLabel}
                        </div>
                    ))}

                    {calendarDays.map((day) => {
                        const dayKey = formatDayKey(day)
                        const dayItems = itemsByDay.get(dayKey) ?? []
                        const isCurrentMonth =
                            day.getMonth() === monthAnchor.getMonth()
                        const isToday = dayKey === formatDayKey(new Date())

                        return (
                            <div
                                key={dayKey}
                                className={`min-h-32 min-w-0 p-2 ${
                                    isCurrentMonth ? 'bg-white' : 'bg-slate-50'
                                }`}
                            >
                                <div
                                    className={`mb-2 flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold ${
                                        isToday
                                            ? 'bg-teal-700 text-white'
                                            : isCurrentMonth
                                              ? 'text-gray-600'
                                              : 'text-gray-400'
                                    }`}
                                >
                                    {day.getDate()}
                                </div>

                                <div className="grid min-w-0 gap-1">
                                    {dayItems.map((item) => {
                                        const dateStart = parseItemDate(item)
                                        return (
                                            <div
                                                key={`${item.kind}-${item.id}`}
                                                className="min-w-0"
                                                onMouseLeave={() => setActiveTooltip(null)}
                                            >
                                                <Link
                                                    href={item.href}
                                                    onMouseEnter={(linkEvent) =>
                                                        showTooltip(
                                                            item,
                                                            linkEvent.currentTarget
                                                        )
                                                    }
                                                    onFocus={(focusEvent) =>
                                                        showTooltip(
                                                            item,
                                                            focusEvent.currentTarget
                                                        )
                                                    }
                                                    onBlur={() => setActiveTooltip(null)}
                                                    className={getItemLinkClass(item.kind)}
                                                >
                                                    <span
                                                        className={`block truncate ${getItemTimeClass(item.kind)}`}
                                                    >
                                                        {formatTime(dateStart)}
                                                    </span>
                                                    <span className="block truncate">
                                                        {item.title}
                                                    </span>
                                                </Link>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>

            {activeTooltip ? (
                <div
                    className="pointer-events-none fixed z-50 w-64 max-w-[calc(100vw-2rem)] rounded-md border border-slate-200 bg-white p-3 text-xs shadow-xl"
                    style={{
                        left: activeTooltip.x,
                        top: activeTooltip.y,
                        transform: 'translate(-50%, calc(-100% - 0.5rem))',
                    }}
                >
                    <p className="font-semibold text-gray-900">
                        {activeTooltip.item.title}
                    </p>
                    <dl className="mt-2 grid gap-1">
                        <div>
                            <dt className="text-gray-500">Čas</dt>
                            <dd>
                                {formatTime(parseItemDate(activeTooltip.item))}
                            </dd>
                        </div>
                        <div>
                            <dt className="text-gray-500">Typ</dt>
                            <dd>{activeTooltip.item.eyebrow}</dd>
                        </div>
                        {activeTooltip.item.details.map((detail) => (
                            <div key={detail.label}>
                                <dt className="text-gray-500">{detail.label}</dt>
                                <dd>{detail.value}</dd>
                            </div>
                        ))}
                    </dl>
                </div>
            ) : null}
        </section>
    )
}
