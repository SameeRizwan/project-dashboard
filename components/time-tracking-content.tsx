"use client"

import { useEffect, useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { projectService } from "@/lib/services/project-service"
import { timeService, type TimeEntry } from "@/lib/services/time-service"
import type { Project } from "@/lib/data/projects"
import { useAuth } from "@/components/auth-provider"
import {
    Play,
    Stop,
    Plus,
    Trash,
    Clock,
    CaretLeft,
    CaretRight,
    Spinner,
    Timer,
    CurrencyDollar,
    CheckCircle,
    CalendarBlank
} from "@phosphor-icons/react/dist/ssr"
import {
    format,
    startOfWeek,
    addWeeks,
    subWeeks,
    eachDayOfInterval,
    endOfWeek,
    isToday,
    isSameDay,
} from "date-fns"

export function TimeTrackingContent() {
    const { user } = useAuth()
    const [currentWeek, setCurrentWeek] = useState(new Date())
    const [projects, setProjects] = useState<Project[]>([])
    const [loading, setLoading] = useState(true)
    const [entries, setEntries] = useState<TimeEntry[]>([])

    // Timer state
    const [timerRunning, setTimerRunning] = useState(false)
    const [timerSeconds, setTimerSeconds] = useState(0)
    const [timerProject, setTimerProject] = useState<string>("")
    const [timerDescription, setTimerDescription] = useState("")

    // New entry state
    const [newEntryProject, setNewEntryProject] = useState<string>("")
    const [newEntryDescription, setNewEntryDescription] = useState("")
    const [newEntryHours, setNewEntryHours] = useState<Record<string, number>>({})
    const [newEntryBillable, setNewEntryBillable] = useState(true)

    // Fetch Projects
    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const projectList = await projectService.getAllProjects()
                setProjects(projectList)
            } catch (error) {
                console.error("Error fetching projects:", error)
            }
        }
        fetchProjects()
    }, [])

    // Fetch Time Entries
    useEffect(() => {
        const fetchEntries = async () => {
            if (!user) return
            setLoading(true)
            try {
                const fetchedEntries = await timeService.getTimeEntries(user.uid)
                setEntries(fetchedEntries)
            } catch (error) {
                console.error("Error fetching time entries:", error)
            } finally {
                setLoading(false)
            }
        }
        fetchEntries()
    }, [user]) // Re-fetch when user changes

    // Timer effect
    useEffect(() => {
        let interval: NodeJS.Timeout
        if (timerRunning) {
            interval = setInterval(() => {
                setTimerSeconds((s) => s + 1)
            }, 1000)
        }
        return () => clearInterval(interval)
    }, [timerRunning])

    // Week days
    const weekDays = useMemo(() => {
        const start = startOfWeek(currentWeek, { weekStartsOn: 1 }) // Mon start
        const end = endOfWeek(currentWeek, { weekStartsOn: 1 })
        return eachDayOfInterval({ start, end })
    }, [currentWeek])

    const prevWeek = () => setCurrentWeek(subWeeks(currentWeek, 1))
    const nextWeek = () => setCurrentWeek(addWeeks(currentWeek, 1))
    const goToThisWeek = () => setCurrentWeek(new Date())

    const formatTime = (seconds: number) => {
        const h = Math.floor(seconds / 3600)
        const m = Math.floor((seconds % 3600) / 60)
        const s = seconds % 60
        return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`
    }

    const startTimer = () => {
        if (!timerProject) return
        setTimerRunning(true)
    }

    const stopTimer = async () => {
        setTimerRunning(false)
        if (timerSeconds >= 60 && timerProject && user) {
            const project = projects.find((p) => p.id === timerProject)
            const hours = Math.round((timerSeconds / 3600) * 100) / 100

            try {
                const newEntry = await timeService.addTimeEntry({
                    userId: user.uid,
                    projectId: timerProject,
                    projectName: project?.name || "Unknown",
                    taskDescription: timerDescription || "Timer entry",
                    date: new Date(), // Today
                    hours: hours,
                    billable: true, // Default to true for timer
                })
                setEntries((prev) => [newEntry, ...prev])
            } catch (error) {
                console.error("Failed to save timer entry", error)
            }
        }
        setTimerSeconds(0)
        setTimerDescription("")
    }

    const addManualEntry = async (day: Date) => {
        if (!newEntryProject || !user) return
        const dayKey = format(day, "yyyy-MM-dd")
        const hours = newEntryHours[dayKey] || 0
        if (hours <= 0) return

        const project = projects.find((p) => p.id === newEntryProject)

        try {
            const newEntry = await timeService.addTimeEntry({
                userId: user.uid,
                projectId: newEntryProject,
                projectName: project?.name || "Unknown",
                taskDescription: newEntryDescription || "Manual entry",
                date: day,
                hours: hours,
                billable: newEntryBillable,
            })

            setEntries((prev) => [newEntry, ...prev])
            setNewEntryHours((prev) => ({ ...prev, [dayKey]: 0 }))
        } catch (error) {
            console.error("Failed to add manual entry", error)
        }
    }

    const deleteEntry = async (id: string) => {
        try {
            await timeService.deleteTimeEntry(id)
            setEntries((prev) => prev.filter((e) => e.id !== id))
        } catch (error) {
            console.error("Failed to delete entry", error)
        }
    }

    const getEntriesForDay = (day: Date) => {
        return entries.filter((e) => isSameDay(e.date, day))
    }

    const getDayTotal = (day: Date) => {
        return getEntriesForDay(day).reduce((sum, e) => sum + e.hours, 0)
    }

    const weekTotal = weekDays.reduce((sum, day) => sum + getDayTotal(day), 0)
    const billableTotal = entries
        .filter((e) => weekDays.some((d) => isSameDay(d, e.date)) && e.billable)
        .reduce((sum, e) => sum + e.hours, 0)

    if (loading) {
        return (
            <div className="flex flex-1 items-center justify-center h-full">
                <Spinner className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="flex flex-1 flex-col bg-background/50 h-full overflow-hidden">
            {/* Header */}
            <header className="flex flex-col border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-10">
                <div className="flex items-center justify-between px-6 py-4">
                    <div className="flex items-center gap-3">
                        <SidebarTrigger className="-ml-2 h-9 w-9 rounded-lg hover:bg-accent text-muted-foreground transition-colors" />
                        <div>
                            <h1 className="text-xl font-semibold text-foreground tracking-tight">Time Tracking</h1>
                            <p className="text-xs text-muted-foreground">Manage your hours and timesheets</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-4 text-sm bg-muted/30 px-3 py-1.5 rounded-md border border-border/20">
                            <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-primary" />
                                <span className="font-medium">{weekTotal.toFixed(1)}h <span className="text-muted-foreground font-normal">total</span></span>
                            </div>
                            <div className="h-4 w-px bg-border/40" />
                            <div className="flex items-center gap-2 text-green-600 dark:text-green-500">
                                <CurrencyDollar className="h-4 w-4" />
                                <span className="font-medium">{billableTotal.toFixed(1)}h <span className="text-muted-foreground/80 font-normal">billable</span></span>
                            </div>
                        </div>
                        <Button variant="outline" size="sm" onClick={goToThisWeek} className="h-8">
                            This Week
                        </Button>
                    </div>
                </div>

                {/* Week Navigation */}
                <div className="flex items-center justify-center pb-4 relative">
                    <div className="absolute left-6 top-0 bottom-4 flex items-center">
                        {/* Placeholder for left-aligned controls if needed */}
                    </div>
                    <div className="flex items-center gap-4 bg-muted/30 p-1 rounded-lg border border-border/40">
                        <Button variant="ghost" size="icon" onClick={prevWeek} className="h-7 w-7 rounded-md hover:bg-background hover:shadow-sm">
                            <CaretLeft className="h-4 w-4" />
                        </Button>
                        <div className="flex items-center gap-2 min-w-[140px] justify-center">
                            <CalendarBlank className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm font-medium">
                                {format(weekDays[0], "MMM d")} - {format(weekDays[6], "MMM d, yyyy")}
                            </span>
                        </div>
                        <Button variant="ghost" size="icon" onClick={nextWeek} className="h-7 w-7 rounded-md hover:bg-background hover:shadow-sm">
                            <CaretRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </header>

            <div className="flex-1 overflow-auto p-6 space-y-8">

                {/* Timer Section */}
                <Card className="rounded-xl border-border/60 shadow-sm bg-gradient-to-r from-background to-muted/20">
                    <CardContent className="p-5">
                        <div className="flex items-center gap-4">
                            <div className="flex-1 max-w-[240px]">
                                <label className="text-xs text-muted-foreground font-medium mb-1.5 block uppercase tracking-wide">Project</label>
                                <Select value={timerProject} onValueChange={setTimerProject}>
                                    <SelectTrigger className="w-full bg-background">
                                        <SelectValue placeholder="Select project" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {projects.map((p) => (
                                            <SelectItem key={p.id} value={p.id}>
                                                {p.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex-[2]">
                                <label className="text-xs text-muted-foreground font-medium mb-1.5 block uppercase tracking-wide">Task Description</label>
                                <Input
                                    placeholder="What are you working on right now?"
                                    value={timerDescription}
                                    onChange={(e) => setTimerDescription(e.target.value)}
                                    className="w-full bg-background"
                                    disabled={timerRunning}
                                />
                            </div>
                            <div className="flex flex-col items-center justify-center px-4">
                                <label className="text-xs text-muted-foreground font-medium mb-1 block uppercase tracking-wide opacity-0">Timer</label>
                                <div className={cn(
                                    "text-3xl font-mono font-bold tabular-nums tracking-widest transition-colors",
                                    timerRunning ? "text-primary" : "text-muted-foreground"
                                )}>
                                    {formatTime(timerSeconds)}
                                </div>
                            </div>
                            <div className="pt-5">
                                {timerRunning ? (
                                    <Button variant="destructive" size="icon" onClick={stopTimer} className="h-10 w-10 rounded-full shadow-lg hover:shadow-xl transition-all">
                                        <Stop className="h-5 w-5" weight="fill" />
                                    </Button>
                                ) : (
                                    <Button
                                        size="icon"
                                        onClick={startTimer}
                                        disabled={!timerProject}
                                        className="h-10 w-10 rounded-full bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
                                    >
                                        <Play className="h-5 w-5" weight="fill" />
                                    </Button>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Weekly Time Sheet */}
                <div className="space-y-4">
                    <div className="flex items-end gap-3 px-1">
                        <CheckCircle className="w-5 h-5 text-primary" />
                        <h2 className="text-lg font-semibold tracking-tight">Timesheet Entry</h2>
                    </div>

                    <Card className="rounded-xl border-border/60 shadow-sm overflow-hidden">
                        <div className="p-4 bg-muted/10 border-b border-border/40 grid grid-cols-1 md:grid-cols-[1.5fr_2fr_auto] gap-4 items-end">
                            <div>
                                <label className="text-xs text-muted-foreground font-medium mb-1.5 block">Project</label>
                                <Select value={newEntryProject} onValueChange={setNewEntryProject}>
                                    <SelectTrigger className="bg-background">
                                        <SelectValue placeholder="Select..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {projects.map((p) => (
                                            <SelectItem key={p.id} value={p.id}>
                                                {p.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <label className="text-xs text-muted-foreground font-medium mb-1.5 block">Description</label>
                                <Input
                                    placeholder="Task details..."
                                    value={newEntryDescription}
                                    onChange={(e) => setNewEntryDescription(e.target.value)}
                                    className="bg-background"
                                />
                            </div>
                            <div className="flex items-center gap-2 pb-0.5">
                                <Button
                                    variant={newEntryBillable ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => setNewEntryBillable(!newEntryBillable)}
                                    className={cn(
                                        "gap-1.5 h-9 transition-all",
                                        newEntryBillable ? "bg-green-600 hover:bg-green-700 text-white" : "text-muted-foreground"
                                    )}
                                >
                                    <CurrencyDollar className="h-4 w-4" />
                                    {newEntryBillable ? "Billable" : "Non-billable"}
                                </Button>
                            </div>
                        </div>

                        <div className="grid grid-cols-7 divide-x divide-border/40">
                            {weekDays.map((day) => {
                                const dayKey = format(day, "yyyy-MM-dd")
                                const dayTotal = getDayTotal(day)
                                const isCurrentDay = isToday(day)

                                return (
                                    <div
                                        key={dayKey}
                                        className={cn(
                                            "flex flex-col items-center p-3 transition-colors",
                                            isCurrentDay ? "bg-primary/5" : "hover:bg-muted/30"
                                        )}
                                    >
                                        <div className="text-center mb-3 w-full border-b border-border/20 pb-2">
                                            <div className={cn("text-[11px] uppercase font-bold tracking-wider mb-0.5", isCurrentDay ? "text-primary" : "text-muted-foreground")}>
                                                {format(day, "EEE")}
                                            </div>
                                            <div className={cn("text-base font-semibold", isCurrentDay ? "text-primary" : "text-foreground")}>
                                                {format(day, "d")}
                                            </div>
                                        </div>

                                        <div className="w-full max-w-[60px] space-y-2">
                                            <Input
                                                type="number"
                                                step="0.5"
                                                min="0"
                                                max="24"
                                                placeholder="-"
                                                className={cn(
                                                    "text-center h-9 text-sm font-medium border-border/60 focus:border-primary",
                                                    isCurrentDay && "bg-background shadow-sm"
                                                )}
                                                value={newEntryHours[dayKey] || ""}
                                                onChange={(e) =>
                                                    setNewEntryHours((prev) => ({
                                                        ...prev,
                                                        [dayKey]: parseFloat(e.target.value) || 0,
                                                    }))
                                                }
                                            />
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                className="w-full h-6 text-[10px] uppercase font-bold text-primary opacity-0 group-hover:opacity-100 data-[visible=true]:opacity-100"
                                                data-visible={!!(newEntryHours[dayKey] && newEntryHours[dayKey] > 0)}
                                                onClick={() => addManualEntry(day)}
                                                disabled={!newEntryProject || !newEntryHours[dayKey]}
                                            >
                                                Save
                                            </Button>
                                        </div>

                                        <div className="mt-auto pt-3">
                                            {dayTotal > 0 && (
                                                <Badge variant="secondary" className="text-[10px] font-mono hover:bg-secondary">
                                                    {dayTotal.toFixed(1)}h
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </Card>
                </div>

                {/* Recent Entries List */}
                {entries.length > 0 && (
                    <div className="space-y-4 pb-10">
                        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                            Recent Activity
                        </h3>
                        <div className="grid gap-2">
                            {entries
                                .filter((e) => weekDays.some((d) => isSameDay(d, e.date)))
                                .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
                                .map((entry) => (
                                    <div
                                        key={entry.id}
                                        className="group flex items-center justify-between p-3 rounded-xl bg-card border border-border/40 hover:border-border/80 hover:shadow-sm transition-all"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="flex flex-col items-center justify-center bg-muted/50 w-12 h-12 rounded-lg border border-border/20">
                                                <span className="text-[10px] uppercase font-bold text-muted-foreground/70">{format(entry.date, "MMM")}</span>
                                                <span className="text-lg font-bold leading-none">{format(entry.date, "d")}</span>
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2 mb-0.5">
                                                    <Badge variant="outline" className="text-[10px] h-5 px-1.5 font-semibold bg-background">{entry.projectName}</Badge>
                                                    {entry.billable && (
                                                        <span className="flex items-center gap-0.5 text-[10px] font-medium text-green-600">
                                                            <CurrencyDollar className="w-3 h-3" /> Billable
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-sm text-foreground/80 font-medium">{entry.taskDescription}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4">
                                            <span className="font-mono font-bold text-lg text-foreground">{entry.hours.toFixed(2)}<span className="text-sm text-muted-foreground ml-0.5">h</span></span>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                                                onClick={() => deleteEntry(entry.id)}
                                            >
                                                <Trash className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
