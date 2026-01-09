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

type TimeEntry = {
    id: string
    projectId: string
    projectName: string
    taskDescription: string
    date: Date
    hours: number
    billable: boolean
}

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

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true)
            try {
                const projectList = await projectService.getAllProjects()
                setProjects(projectList)
            } catch (error) {
                console.error("Error fetching projects:", error)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [])

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
        const start = startOfWeek(currentWeek)
        const end = endOfWeek(currentWeek)
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

    const stopTimer = () => {
        setTimerRunning(false)
        if (timerSeconds >= 60 && timerProject) {
            const project = projects.find((p) => p.id === timerProject)
            const newEntry: TimeEntry = {
                id: `entry-${Date.now()}`,
                projectId: timerProject,
                projectName: project?.name || "Unknown",
                taskDescription: timerDescription || "Timer entry",
                date: new Date(),
                hours: Math.round((timerSeconds / 3600) * 100) / 100,
                billable: true,
            }
            setEntries((prev) => [...prev, newEntry])
        }
        setTimerSeconds(0)
        setTimerDescription("")
    }

    const addManualEntry = (day: Date) => {
        if (!newEntryProject) return
        const dayKey = format(day, "yyyy-MM-dd")
        const hours = newEntryHours[dayKey] || 0
        if (hours <= 0) return

        const project = projects.find((p) => p.id === newEntryProject)
        const newEntry: TimeEntry = {
            id: `entry-${Date.now()}`,
            projectId: newEntryProject,
            projectName: project?.name || "Unknown",
            taskDescription: newEntryDescription || "Manual entry",
            date: day,
            hours,
            billable: newEntryBillable,
        }
        setEntries((prev) => [...prev, newEntry])
        setNewEntryHours((prev) => ({ ...prev, [dayKey]: 0 }))
    }

    const deleteEntry = (id: string) => {
        setEntries((prev) => prev.filter((e) => e.id !== id))
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
                        <p className="text-base font-medium text-foreground">Time Tracking</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={goToThisWeek}>
                            This Week
                        </Button>
                    </div>
                </div>
                <div className="flex items-center justify-between px-4 pb-3 pt-3">
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" onClick={prevWeek}>
                            <CaretLeft className="h-4 w-4" />
                        </Button>
                        <h2 className="text-lg font-semibold min-w-[280px] text-center">
                            {format(weekDays[0], "MMM d")} - {format(weekDays[6], "MMM d, yyyy")}
                        </h2>
                        <Button variant="ghost" size="icon" onClick={nextWeek}>
                            <CaretRight className="h-4 w-4" />
                        </Button>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span>{weekTotal.toFixed(1)}h total</span>
                        </div>
                        <div className="flex items-center gap-2 text-green-500">
                            <CurrencyDollar className="h-4 w-4" />
                            <span>{billableTotal.toFixed(1)}h billable</span>
                        </div>
                    </div>
                </div>
            </header>

            <div className="flex-1 overflow-auto p-4 space-y-6">
                {/* Timer Card */}
                <Card className="rounded-2xl border-border/60">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base font-semibold flex items-center gap-2">
                            <Timer className="h-5 w-5 text-primary" />
                            Quick Timer
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-4">
                            <Select value={timerProject} onValueChange={setTimerProject}>
                                <SelectTrigger className="w-[200px]">
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
                            <Input
                                placeholder="What are you working on?"
                                value={timerDescription}
                                onChange={(e) => setTimerDescription(e.target.value)}
                                className="flex-1"
                                disabled={timerRunning}
                            />
                            <div className="text-2xl font-mono font-bold min-w-[100px] text-center">
                                {formatTime(timerSeconds)}
                            </div>
                            {timerRunning ? (
                                <Button variant="destructive" size="icon" onClick={stopTimer}>
                                    <Stop className="h-5 w-5" weight="fill" />
                                </Button>
                            ) : (
                                <Button
                                    size="icon"
                                    onClick={startTimer}
                                    disabled={!timerProject}
                                    className="bg-green-500 hover:bg-green-600"
                                >
                                    <Play className="h-5 w-5" weight="fill" />
                                </Button>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Manual Entry Card */}
                <Card className="rounded-2xl border-border/60">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base font-semibold flex items-center gap-2">
                            <Plus className="h-5 w-5 text-primary" />
                            Add Time Entry
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-end gap-4 mb-4">
                            <div className="flex-1">
                                <label className="text-sm text-muted-foreground mb-1 block">Project</label>
                                <Select value={newEntryProject} onValueChange={setNewEntryProject}>
                                    <SelectTrigger>
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
                            <div className="flex-1">
                                <label className="text-sm text-muted-foreground mb-1 block">Description</label>
                                <Input
                                    placeholder="What did you work on?"
                                    value={newEntryDescription}
                                    onChange={(e) => setNewEntryDescription(e.target.value)}
                                />
                            </div>
                            <Button
                                variant={newEntryBillable ? "default" : "outline"}
                                size="sm"
                                onClick={() => setNewEntryBillable(!newEntryBillable)}
                                className="gap-1"
                            >
                                <CurrencyDollar className="h-4 w-4" />
                                {newEntryBillable ? "Billable" : "Non-billable"}
                            </Button>
                        </div>

                        {/* Weekly grid */}
                        <div className="grid grid-cols-7 gap-2">
                            {weekDays.map((day) => {
                                const dayKey = format(day, "yyyy-MM-dd")
                                const dayTotal = getDayTotal(day)
                                return (
                                    <div
                                        key={dayKey}
                                        className={cn(
                                            "text-center p-3 rounded-xl border border-border/60",
                                            isToday(day) && "ring-2 ring-primary ring-offset-2"
                                        )}
                                    >
                                        <div className="text-xs text-muted-foreground mb-1">
                                            {format(day, "EEE")}
                                        </div>
                                        <div className="text-sm font-medium mb-2">{format(day, "d")}</div>
                                        <Input
                                            type="number"
                                            step="0.25"
                                            min="0"
                                            max="24"
                                            placeholder="0"
                                            className="text-center h-8 text-sm"
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
                                            className="mt-2 w-full text-xs h-7"
                                            onClick={() => addManualEntry(day)}
                                            disabled={!newEntryProject || !newEntryHours[dayKey]}
                                        >
                                            Add
                                        </Button>
                                        {dayTotal > 0 && (
                                            <div className="mt-2 text-xs text-green-500 font-medium">
                                                {dayTotal.toFixed(1)}h
                                            </div>
                                        )}
                                    </div>
                                )
                            })}
                        </div>
                    </CardContent>
                </Card>

                {/* Entries List */}
                {entries.length > 0 && (
                    <Card className="rounded-2xl border-border/60">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base font-semibold">
                                Time Entries This Week
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                {entries
                                    .filter((e) => weekDays.some((d) => isSameDay(d, e.date)))
                                    .sort((a, b) => b.date.getTime() - a.date.getTime())
                                    .map((entry) => (
                                        <div
                                            key={entry.id}
                                            className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="text-sm font-medium">
                                                    {format(entry.date, "EEE, MMM d")}
                                                </div>
                                                <Badge variant="outline">{entry.projectName}</Badge>
                                                <span className="text-sm text-muted-foreground">
                                                    {entry.taskDescription}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                {entry.billable && (
                                                    <Badge className="bg-green-500/10 text-green-500 border-green-500/20">
                                                        Billable
                                                    </Badge>
                                                )}
                                                <span className="font-medium">{entry.hours.toFixed(2)}h</span>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-7 w-7 text-destructive"
                                                    onClick={() => deleteEntry(entry.id)}
                                                >
                                                    <Trash className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    )
}
