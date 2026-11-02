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

function formatDay(date: Date) {
    return new Intl.DateTimeFormat('cs-CZ', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    }).format(date)
}

function getDefaultSelectedDayKey(monthAnchor: Date, items: CalendarItem[]) {
    const today = new Date()
    if (
        today.getFullYear() === monthAnchor.getFullYear() &&
        today.getMonth() === monthAnchor.getMonth()
    ) {
        return formatDayKey(today)
    }

    const firstItem = items
        .map(parseItemDate)
        .filter(
            (date) =>
                date.getFullYear() === monthAnchor.getFullYear() &&
                date.getMonth() === monthAnchor.getMonth()
        )
        .sort((a, b) => a.getTime() - b.getTime())[0]

    return formatDayKey(firstItem ?? monthAnchor)
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
    const [selectedDayKey, setSelectedDayKey] = useState(() =>
        getDefaultSelectedDayKey(initialMonthAnchor, items)
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

    const selectedDay =
        calendarDays.find((day) => formatDayKey(day) === selectedDayKey) ??
        monthAnchor
    const selectedDayItems = itemsByDay.get(formatDayKey(selectedDay)) ?? []

    function selectMonth(year: number, month: number) {
        const nextMonth = new Date(year, month, 1)
        setSelectedMonth(nextMonth.getMonth())
        setSelectedYear(nextMonth.getFullYear())
        setSelectedDayKey(getDefaultSelectedDayKey(nextMonth, items))
    }

    function changeMonth(offset: number) {
        const nextMonth = new Date(selectedYear, selectedMonth + offset, 1)
        selectMonth(nextMonth.getFullYear(), nextMonth.getMonth())
    }

    function selectDay(day: Date) {
        if (
            day.getMonth() !== selectedMonth ||
            day.getFullYear() !== selectedYear
        ) {
            setSelectedMonth(day.getMonth())
            setSelectedYear(day.getFullYear())
        }
        setSelectedDayKey(formatDayKey(day))
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

                <div className="grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto sm:flex-wrap sm:items-center">
                    <button
                        type="button"
                        onClick={() => changeMonth(-1)}
                        className="order-1 rounded-md border px-3 py-2 text-sm font-medium sm:order-none"
                    >
                        Předchozí
                    </button>
                    <select
                        value={selectedMonth}
                        onChange={(event) =>
                            selectMonth(selectedYear, Number(event.target.value))
                        }
                        className={`${inputClass} order-3 min-w-0 w-full sm:order-none sm:w-auto`}
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
                            selectMonth(Number(event.target.value), selectedMonth)
                        }
                        className={`${inputClass} order-4 min-w-0 w-full sm:order-none sm:w-auto`}
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
                        className="order-2 rounded-md border px-3 py-2 text-sm font-medium sm:order-none"
                    >
                        Další
                    </button>
                </div>
            </div>

            <div className="mt-4">
                <div className="grid min-w-0 grid-cols-7 gap-0.5 rounded-lg sm:gap-px sm:overflow-hidden sm:border sm:border-slate-200 sm:bg-slate-200">
                    {dayLabels.map((dayLabel) => (
                        <div
                            key={dayLabel}
                            className="min-w-0 px-0.5 py-2 text-center text-xs font-semibold text-gray-500 sm:bg-slate-50 sm:px-2"
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
                        const dayNumberClass = `h-6 w-6 items-center justify-center rounded-full text-xs font-semibold ${
                            isToday
                                ? 'bg-teal-700 text-white'
                                : isCurrentMonth
                                  ? 'text-gray-600'
                                  : 'text-gray-400'
                        }`

                        return (
                            <div
                                key={dayKey}
                                className={`min-h-20 min-w-0 rounded-md p-0.5 sm:min-h-32 sm:rounded-none sm:p-2 ${
                                    isCurrentMonth
                                        ? dayItems.length > 0
                                            ? 'bg-white sm:bg-white'
                                            : 'bg-slate-50 sm:bg-white'
                                        : 'bg-slate-100 sm:bg-slate-50'
                                }`}
                            >
                                <button
                                    type="button"
                                    onClick={() => selectDay(day)}
                                    aria-label={`${formatDay(day)}, počet položek: ${dayItems.length}`}
                                    aria-pressed={selectedDayKey === dayKey}
                                    className={`flex min-h-18 w-full flex-col items-start rounded-md p-0.5 text-left sm:hidden ${
                                        selectedDayKey === dayKey
                                            ? 'bg-teal-50 ring-1 ring-inset ring-teal-700'
                                            : ''
                                    }`}
                                >
                                    <span className={`flex ${dayNumberClass}`}>
                                        {day.getDate()}
                                    </span>
                                    <span aria-hidden="true" className="mt-1 flex w-full flex-col gap-0.5">
                                        {dayItems.slice(0, 2).map((item) => (
                                            <span
                                                key={`${item.kind}-${item.id}`}
                                                className={`block h-4 w-full truncate rounded-sm border px-0.5 text-[0.6rem] font-semibold leading-[0.875rem] ${
                                                    item.kind === 'CALENDAR_ENTRY'
                                                        ? 'border-indigo-200 bg-indigo-100 text-indigo-900'
                                                        : 'border-teal-200 bg-teal-100 text-teal-900'
                                                }`}
                                            >
                                                {item.title}
                                            </span>
                                        ))}
                                    </span>
                                    {dayItems.length > 2 ? (
                                        <span className="mt-0.5 text-[0.65rem] font-bold leading-none text-gray-700">
                                            +{dayItems.length - 2}
                                        </span>
                                    ) : null}
                                </button>

                                <div className={`${dayNumberClass} mb-2 hidden sm:flex`}>
                                    {day.getDate()}
                                </div>

                                <div className="hidden min-w-0 gap-1 sm:grid">
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

            <div className="mt-4 sm:hidden">
                <h3 className="text-sm font-semibold capitalize">
                    {formatDay(selectedDay)}
                </h3>
                {selectedDayItems.length === 0 ? (
                    <p className="mt-2 text-sm text-gray-600">
                        Na tento den nejsou naplánované žádné položky.
                    </p>
                ) : (
                    <div className="mt-2 grid gap-2">
                        {selectedDayItems.map((item) => (
                            <Link
                                key={`${item.kind}-${item.id}`}
                                href={item.href}
                                className={`block min-w-0 rounded-lg border p-3 text-sm ${
                                    item.kind === 'CALENDAR_ENTRY'
                                        ? 'border-indigo-100 bg-indigo-50 text-indigo-950'
                                        : 'border-teal-100 bg-teal-50 text-teal-900'
                                }`}
                            >
                                <span className={`block text-xs ${getItemTimeClass(item.kind)}`}>
                                    {formatTime(parseItemDate(item))} · {item.eyebrow}
                                </span>
                                <span className="mt-1 block break-words font-medium">
                                    {item.title}
                                </span>
                            </Link>
                        ))}
                    </div>
                )}
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
