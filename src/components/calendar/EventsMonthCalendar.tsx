'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { inputClass } from '@/lib/ui/styles'

type EventStatus = 'DRAFT' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED'

type CalendarEvent = {
    id: string
    title: string
    eventType: string
    status: EventStatus
    dateStart: string
    venueName: string | null
    client?: {
        name: string
    }
    primaryContact: {
        firstName: string
        lastName: string
    } | null
}

type EventsMonthCalendarProps = {
    events: CalendarEvent[]
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

const eventStatusLabels: Record<EventStatus, string> = {
    DRAFT: 'Rozpracováno',
    CONFIRMED: 'Potvrzeno',
    COMPLETED: 'Dokončeno',
    CANCELLED: 'Zrušeno',
}

function parseEventDate(event: CalendarEvent) {
    return new Date(event.dateStart)
}

function getMonthAnchor(events: CalendarEvent[]) {
    const now = new Date()
    const currentMonthEvents = events.filter((event) => {
        const dateStart = parseEventDate(event)

        return (
            dateStart.getFullYear() === now.getFullYear() &&
            dateStart.getMonth() === now.getMonth()
        )
    })

    if (currentMonthEvents.length > 0) {
        return new Date(now.getFullYear(), now.getMonth(), 1)
    }

    const futureEvents = events
        .filter((event) => parseEventDate(event) >= now)
        .sort(
            (a, b) =>
                parseEventDate(a).getTime() - parseEventDate(b).getTime()
        )

    const fallbackEvent =
        futureEvents[0] ??
        [...events].sort(
            (a, b) =>
                parseEventDate(b).getTime() - parseEventDate(a).getTime()
        )[0]

    if (!fallbackEvent) {
        return new Date(now.getFullYear(), now.getMonth(), 1)
    }

    const fallbackDate = parseEventDate(fallbackEvent)

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

function getYearOptions(events: CalendarEvent[]) {
    const currentYear = new Date().getFullYear()
    const eventYears = events.map((event) => parseEventDate(event).getFullYear())
    const minYear = Math.min(currentYear - 1, ...eventYears)
    const maxYear = Math.max(currentYear + 2, ...eventYears)
    const years: number[] = []

    for (let year = minYear; year <= maxYear; year += 1) {
        years.push(year)
    }

    return years
}

export default function EventsMonthCalendar({ events }: EventsMonthCalendarProps) {
    const initialMonthAnchor = useMemo(() => getMonthAnchor(events), [events])
    const [selectedMonth, setSelectedMonth] = useState(
        initialMonthAnchor.getMonth()
    )
    const [selectedYear, setSelectedYear] = useState(
        initialMonthAnchor.getFullYear()
    )
    const monthAnchor = new Date(selectedYear, selectedMonth, 1)
    const calendarDays = getCalendarDays(monthAnchor)
    const yearOptions = getYearOptions(events)

    const eventsByDay = useMemo(() => {
        const groupedEvents = new Map<string, CalendarEvent[]>()

        for (const event of events) {
            const dayKey = formatDayKey(parseEventDate(event))
            const dayEvents = groupedEvents.get(dayKey) ?? []

            dayEvents.push(event)
            groupedEvents.set(dayKey, dayEvents)
        }

        for (const dayEvents of groupedEvents.values()) {
            dayEvents.sort(
                (a, b) =>
                    parseEventDate(a).getTime() - parseEventDate(b).getTime()
            )
        }

        return groupedEvents
    }, [events])

    function changeMonth(offset: number) {
        const nextMonth = new Date(selectedYear, selectedMonth + offset, 1)

        setSelectedMonth(nextMonth.getMonth())
        setSelectedYear(nextMonth.getFullYear())
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
                        const dayEvents = eventsByDay.get(dayKey) ?? []
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
                                    {dayEvents.map((event) => {
                                        const dateStart = parseEventDate(event)
                                        return (
                                            <div
                                                key={event.id}
                                                className="group relative min-w-0"
                                            >
                                                <Link
                                                    href={`/events/${event.id}`}
                                                    className="block min-w-0 rounded-md border border-teal-100 bg-teal-50 px-2 py-1 text-[0.7rem] font-medium leading-tight text-teal-900 hover:border-teal-300 hover:bg-teal-100"
                                                >
                                                    <span className="block truncate text-teal-700">
                                                        {formatTime(dateStart)}
                                                    </span>
                                                    <span className="block truncate">
                                                        {event.title}
                                                    </span>
                                                </Link>
                                                <div className="pointer-events-none absolute left-1/2 top-full z-20 mt-1 hidden w-64 max-w-[calc(100vw-2rem)] -translate-x-1/2 rounded-md border border-slate-200 bg-white p-3 text-xs shadow-xl group-hover:block group-focus-within:block">
                                                    <p className="font-semibold text-gray-900">
                                                        {event.title}
                                                    </p>
                                                    <dl className="mt-2 grid gap-1">
                                                        <div>
                                                            <dt className="text-gray-500">
                                                                Čas
                                                            </dt>
                                                            <dd>{formatTime(dateStart)}</dd>
                                                        </div>
                                                        {event.client ? (
                                                            <div>
                                                                <dt className="text-gray-500">
                                                                    Klient
                                                                </dt>
                                                                <dd>{event.client.name}</dd>
                                                            </div>
                                                        ) : null}
                                                        {event.primaryContact ? (
                                                            <div>
                                                                <dt className="text-gray-500">
                                                                    Kontakt
                                                                </dt>
                                                                <dd>
                                                                    {`${event.primaryContact.firstName} ${event.primaryContact.lastName}`}
                                                                </dd>
                                                            </div>
                                                        ) : null}
                                                        <div>
                                                            <dt className="text-gray-500">
                                                                Stav
                                                            </dt>
                                                            <dd>
                                                                {
                                                                    eventStatusLabels[
                                                                        event.status
                                                                    ]
                                                                }
                                                            </dd>
                                                        </div>
                                                        <div>
                                                            <dt className="text-gray-500">
                                                                Místo
                                                            </dt>
                                                            <dd>
                                                                {event.venueName ?? '—'}
                                                            </dd>
                                                        </div>
                                                    </dl>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        </section>
    )
}
