"use client"

import { useEffect, useState, useMemo } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { projectService } from "@/lib/services/project-service"
import type { Project } from "@/lib/data/projects"
import { collection, onSnapshot, Timestamp } from "firebase/firestore"
import { db } from "@/lib/firebase"
import {
    CaretLeft,
    CaretRight,
    Spinner,
    Circle,
    CalendarBlank,
    ListBullets,
    SquaresFour,
} from "@phosphor-icons/react/dist/ssr"
import {
    format,
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    addMonths,
    subMonths,
    addWeeks,
    subWeeks,
    eachDayOfInterval,
    isSameMonth,
    isSameDay,
    isToday,
} from "date-fns"

type CalendarEvent = {
    id: string
    title: string
    date: Date
    type: "deadline" | "task" | "milestone"
    projectName: string
    color: string
}

type ViewType = "month" | "week"

const PROJECT_COLORS = [
    "#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899", "#ef4444"
]

// Strip HTML tags from text
function stripHtml(html: string | undefined): string {
    if (!html) return ""
    return html.replace(/<[^>]*>/g, "").trim()
}

export function CalendarContent() {
    const [currentDate, setCurrentDate] = useState(new Date())
    const [events, setEvents] = useState<CalendarEvent[]>([])
    const [loading, setLoading] = useState(true)
    const [viewType, setViewType] = useState<ViewType>("month")
    const [selectedDate, setSelectedDate] = useState<Date | null>(null)



    useEffect(() => {
        setLoading(true)

        // Use onSnapshot for real-time updates
        const unsubscribe = onSnapshot(collection(db, "projects"), (snapshot: any) => {
            try {
                const calendarEvents: CalendarEvent[] = []

                snapshot.docs.forEach((doc: any, idx: number) => {
                    const data = doc.data()
                    // Reconstruct project object (similar to projectService.getAllProjects but simpler for calendar)
                    const project = {
                        ...data,
                        id: doc.id,
                        startDate: data.startDate instanceof Timestamp ? data.startDate.toDate() : new Date(data.startDate),
                        endDate: data.endDate instanceof Timestamp ? data.endDate.toDate() : new Date(data.endDate),
                        tasks: (data.tasks || []).map((t: any) => ({
                            ...t,
                            endDate: t.endDate instanceof Timestamp ? t.endDate.toDate() : new Date(t.endDate)
                        }))
                    } as Project

                    const color = PROJECT_COLORS[idx % PROJECT_COLORS.length]
                    const projectName = stripHtml(project.name)

                    // Add project deadline
                    if (project.endDate) {
                        calendarEvents.push({
                            id: `${project.id}-deadline`,
                            title: `${projectName} deadline`,
                            date: project.endDate,
                            type: "deadline",
                            projectName,
                            color,
                        })
                    }

                    // Add task due dates
                    project.tasks.forEach((task) => {
                        if (task.endDate && task.status !== "done") {
                            calendarEvents.push({
                                id: `${project.id}-${task.id}`,
                                title: stripHtml(task.name),
                                date: task.endDate,
                                type: "task",
                                projectName,
                                color,
                            })
                        }
                    })
                })

                setEvents(calendarEvents)
            } catch (error) {
                console.error("Error processing calendar data:", error)
            } finally {
                setLoading(false)
            }
        }, (error: any) => {
            console.error("Error listening to calendar data:", error)
            setLoading(false)
        })

        return () => unsubscribe()
    }, [])

    // Generate calendar days based on view type
    const calendarDays = useMemo(() => {
        if (viewType === "week") {
            const weekStart = startOfWeek(currentDate)
            const weekEnd = endOfWeek(currentDate)
            return eachDayOfInterval({ start: weekStart, end: weekEnd })
        }

        const monthStart = startOfMonth(currentDate)
        const monthEnd = endOfMonth(currentDate)
        const calendarStart = startOfWeek(monthStart)
        const calendarEnd = endOfWeek(monthEnd)
        return eachDayOfInterval({ start: calendarStart, end: calendarEnd })
    }, [currentDate, viewType])

    // Get events for a specific day
    const getEventsForDay = (day: Date) => {
        return events.filter((event) => isSameDay(event.date, day))
    }

    // Get events for selected date
    const selectedDateEvents = selectedDate
        ? getEventsForDay(selectedDate)
        : []

    const prevPeriod = () => {
        if (viewType === "week") {
            setCurrentDate(subWeeks(currentDate, 1))
        } else {
            setCurrentDate(subMonths(currentDate, 1))
        }
    }

    const nextPeriod = () => {
        if (viewType === "week") {
            setCurrentDate(addWeeks(currentDate, 1))
        } else {
            setCurrentDate(addMonths(currentDate, 1))
        }
    }

    const goToToday = () => {
        setCurrentDate(new Date())
        setSelectedDate(new Date())
    }

    const getHeaderTitle = () => {
        if (viewType === "week") {
            const weekStart = startOfWeek(currentDate)
            const weekEnd = endOfWeek(currentDate)
            return `${format(weekStart, "MMM d")} - ${format(weekEnd, "MMM d, yyyy")}`
        }
        return format(currentDate, "MMMM yyyy")
    }

    if (loading) {
        return (
            <div className="flex flex-1 items-center justify-center">
                <Spinner className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="flex flex-1 flex-col bg-background mx-2 my-2 border border-border rounded-lg min-w-0 overflow-hidden">
            {/* Header */}
            <header className="flex flex-col border-b border-border/40">
                <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                    <div className="flex items-center gap-3">
                        <SidebarTrigger className="h-8 w-8 rounded-lg hover:bg-accent text-muted-foreground" />
                        <p className="text-base font-medium text-foreground">Calendar</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={goToToday}>
                            Today
                        </Button>
                    </div>
                </div>
                <div className="flex items-center justify-between px-4 pb-3 pt-3">
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" onClick={prevPeriod}>
                            <CaretLeft className="h-4 w-4" />
                        </Button>
                        <h2 className="text-lg font-semibold min-w-[220px] text-center">
                            {getHeaderTitle()}
                        </h2>
                        <Button variant="ghost" size="icon" onClick={nextPeriod}>
                            <CaretRight className="h-4 w-4" />
                        </Button>
                    </div>
                    <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
                        <Button
                            variant={viewType === "month" ? "secondary" : "ghost"}
                            size="sm"
                            className="h-8 px-3 gap-2"
                            onClick={() => setViewType("month")}
                        >
                            <SquaresFour className="h-4 w-4" />
                            Month
                        </Button>
                        <Button
                            variant={viewType === "week" ? "secondary" : "ghost"}
                            size="sm"
                            className="h-8 px-3 gap-2"
                            onClick={() => setViewType("week")}
                        >
                            <ListBullets className="h-4 w-4" />
                            Week
                        </Button>
                    </div>
                </div>
            </header>

            {/* Calendar Grid */}
            <div className="flex flex-1 overflow-hidden">
                <div className="flex-1 p-4 overflow-auto">
                    {/* Day headers */}
                    <div className="grid grid-cols-7 mb-2">
                        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                            <div
                                key={day}
                                className="text-center text-sm font-medium text-muted-foreground py-2"
                            >
                                {day}
                            </div>
                        ))}
                    </div>

                    {/* Calendar days */}
                    <div className={cn(
                        "grid grid-cols-7 gap-1",
                        viewType === "week" && "min-h-[400px]"
                    )}>
                        {calendarDays.map((day) => {
                            const dayEvents = getEventsForDay(day)
                            const isCurrentMonth = viewType === "week" || isSameMonth(day, currentDate)
                            const isSelected = selectedDate && isSameDay(day, selectedDate)
                            const isDayToday = isToday(day)

                            return (
                                <div
                                    key={day.toISOString()}
                                    onClick={() => setSelectedDate(day)}
                                    className={cn(
                                        "p-2 rounded-lg border border-transparent cursor-pointer transition-colors",
                                        viewType === "month" ? "min-h-[100px]" : "min-h-[400px]",
                                        isCurrentMonth
                                            ? "bg-background hover:bg-accent/50"
                                            : "bg-muted/30 text-muted-foreground",
                                        isSelected && "border-primary bg-accent/50",
                                        isDayToday && "ring-2 ring-primary ring-offset-2"
                                    )}
                                >
                                    <div
                                        className={cn(
                                            "text-sm font-medium mb-1",
                                            viewType === "week" && "text-center pb-2 border-b border-border/40 mb-2",
                                            isDayToday && "text-primary font-bold"
                                        )}
                                    >
                                        {viewType === "week" ? format(day, "EEE d") : format(day, "d")}
                                    </div>
                                    <div className="space-y-1">
                                        {(viewType === "week" ? dayEvents : dayEvents.slice(0, 3)).map((event) => (
                                            <div
                                                key={event.id}
                                                className="text-xs truncate px-1.5 py-0.5 rounded"
                                                style={{ backgroundColor: `${event.color}20`, color: event.color }}
                                            >
                                                {event.title}
                                            </div>
                                        ))}
                                        {viewType === "month" && dayEvents.length > 3 && (
                                            <div className="text-xs text-muted-foreground px-1.5">
                                                +{dayEvents.length - 3} more
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>

                {/* Sidebar - Selected day details */}
                <div className="w-80 border-l border-border p-4 overflow-auto hidden lg:block">
                    <div className="sticky top-0">
                        <h3 className="font-semibold mb-4">
                            {selectedDate
                                ? format(selectedDate, "EEEE, MMMM d")
                                : "Select a date"}
                        </h3>

                        {selectedDate && selectedDateEvents.length === 0 && (
                            <div className="text-center py-8 text-muted-foreground">
                                <CalendarBlank className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                <p className="text-sm">No events on this day</p>
                            </div>
                        )}

                        <div className="space-y-3">
                            {selectedDateEvents.map((event) => (
                                <Card key={event.id} className="border-l-4" style={{ borderLeftColor: event.color }}>
                                    <CardContent className="p-3">
                                        <div className="flex items-start gap-2">
                                            <Circle
                                                className="h-3 w-3 mt-1 shrink-0"
                                                weight="fill"
                                                style={{ color: event.color }}
                                            />
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium text-sm truncate">{event.title}</p>
                                                <p className="text-xs text-muted-foreground mt-0.5">
                                                    {event.projectName}
                                                </p>
                                                <Badge
                                                    variant="secondary"
                                                    className="mt-2 text-xs"
                                                >
                                                    {event.type === "deadline" ? "Deadline" : "Task"}
                                                </Badge>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
