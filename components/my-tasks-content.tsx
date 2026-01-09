"use client"

import { useEffect, useState, useMemo } from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { projectService } from "@/lib/services/project-service"
import type { Project } from "@/lib/data/projects"
import { PriorityGlyphIcon } from "@/components/priority-badge"
import { CalendarBlank, Clock, CheckCircle, Circle, Spinner } from "@phosphor-icons/react/dist/ssr"
import { format, isToday, isPast, isFuture, addDays } from "date-fns"

type Task = {
    id: string
    name: string
    assignee: string
    status: "todo" | "in-progress" | "done"
    startDate: Date
    endDate: Date
    projectId: string
    projectName: string
    priority: "urgent" | "high" | "medium" | "low"
}

export function MyTasksContent() {
    const [tasks, setTasks] = useState<Task[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchTasks = async () => {
            setLoading(true)
            try {
                const projects = await projectService.getAllProjects()
                // Flatten all tasks from all projects
                const allTasks: Task[] = projects.flatMap((project) =>
                    project.tasks.map((task) => ({
                        ...task,
                        projectId: project.id,
                        projectName: project.name,
                        priority: project.priority,
                    }))
                )
                setTasks(allTasks)
            } catch (error) {
                console.error("Error fetching tasks:", error)
            } finally {
                setLoading(false)
            }
        }
        fetchTasks()
    }, [])

    const { overdue, today, upcoming, completed } = useMemo(() => {
        const now = new Date()
        const weekFromNow = addDays(now, 7)

        return {
            overdue: tasks.filter((t) => t.status !== "done" && isPast(t.endDate) && !isToday(t.endDate)),
            today: tasks.filter((t) => t.status !== "done" && isToday(t.endDate)),
            upcoming: tasks.filter(
                (t) => t.status !== "done" && isFuture(t.endDate) && t.endDate <= weekFromNow
            ),
            completed: tasks.filter((t) => t.status === "done"),
        }
    }, [tasks])

    const stats = useMemo(() => ({
        total: tasks.length,
        todo: tasks.filter((t) => t.status === "todo").length,
        inProgress: tasks.filter((t) => t.status === "in-progress").length,
        done: tasks.filter((t) => t.status === "done").length,
    }), [tasks])

    if (loading) {
        return (
            <div className="flex flex-1 items-center justify-center">
                <Spinner className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="flex flex-1 flex-col bg-background mx-2 my-2 border border-border rounded-lg min-w-0 overflow-auto">
            {/* Header */}
            <div className="border-b border-border/40 px-6 py-4">
                <h1 className="text-2xl font-bold">My Tasks</h1>
                <p className="text-sm text-muted-foreground mt-1">
                    Manage and track all your assigned tasks
                </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6">
                <Card>
                    <CardContent className="pt-4">
                        <div className="text-2xl font-bold">{stats.total}</div>
                        <div className="text-xs text-muted-foreground">Total Tasks</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-4">
                        <div className="text-2xl font-bold text-blue-500">{stats.todo}</div>
                        <div className="text-xs text-muted-foreground">To Do</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-4">
                        <div className="text-2xl font-bold text-amber-500">{stats.inProgress}</div>
                        <div className="text-xs text-muted-foreground">In Progress</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-4">
                        <div className="text-2xl font-bold text-green-500">{stats.done}</div>
                        <div className="text-xs text-muted-foreground">Completed</div>
                    </CardContent>
                </Card>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="all" className="flex-1 px-6 pb-6">
                <TabsList className="mb-4">
                    <TabsTrigger value="all">All Tasks</TabsTrigger>
                    <TabsTrigger value="overdue" className="text-red-500">
                        Overdue ({overdue.length})
                    </TabsTrigger>
                    <TabsTrigger value="today">Today ({today.length})</TabsTrigger>
                    <TabsTrigger value="upcoming">Upcoming ({upcoming.length})</TabsTrigger>
                </TabsList>

                <TabsContent value="all" className="space-y-4">
                    <TaskSection title="Overdue" tasks={overdue} variant="overdue" />
                    <TaskSection title="Due Today" tasks={today} variant="today" />
                    <TaskSection title="Upcoming (Next 7 Days)" tasks={upcoming} variant="default" />
                    <TaskSection title="Completed" tasks={completed} variant="completed" />
                </TabsContent>

                <TabsContent value="overdue">
                    <TaskSection title="Overdue Tasks" tasks={overdue} variant="overdue" />
                </TabsContent>

                <TabsContent value="today">
                    <TaskSection title="Due Today" tasks={today} variant="today" />
                </TabsContent>

                <TabsContent value="upcoming">
                    <TaskSection title="Upcoming Tasks" tasks={upcoming} variant="default" />
                </TabsContent>
            </Tabs>
        </div>
    )
}

function TaskSection({
    title,
    tasks,
    variant = "default",
}: {
    title: string
    tasks: Task[]
    variant?: "default" | "overdue" | "today" | "completed"
}) {
    if (tasks.length === 0) return null

    return (
        <div className="space-y-2">
            <h3
                className={cn(
                    "text-sm font-medium",
                    variant === "overdue" && "text-red-500",
                    variant === "today" && "text-amber-500",
                    variant === "completed" && "text-green-500"
                )}
            >
                {title}
            </h3>
            <div className="space-y-2">
                {tasks.map((task) => (
                    <TaskRow key={task.id} task={task} variant={variant} />
                ))}
            </div>
        </div>
    )
}

function TaskRow({ task, variant }: { task: Task; variant: string }) {
    const statusIcon =
        task.status === "done" ? (
            <CheckCircle className="h-5 w-5 text-green-500" weight="fill" />
        ) : task.status === "in-progress" ? (
            <Spinner className="h-5 w-5 text-amber-500" />
        ) : (
            <Circle className="h-5 w-5 text-muted-foreground" />
        )

    return (
        <Card className={cn(variant === "overdue" && "border-red-200 bg-red-50/50 dark:bg-red-950/10")}>
            <CardContent className="flex items-center gap-4 p-4">
                <div className="shrink-0">{statusIcon}</div>
                <div className="flex-1 min-w-0">
                    <div className={cn("font-medium truncate", task.status === "done" && "line-through text-muted-foreground")}>
                        {task.name}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                        <span className="truncate">{task.projectName}</span>
                        <span>•</span>
                        <PriorityGlyphIcon level={task.priority} size="sm" />
                        <span>•</span>
                        <div className="flex items-center gap-1">
                            <CalendarBlank className="h-3 w-3" />
                            <span>{format(task.endDate, "MMM d")}</span>
                        </div>
                    </div>
                </div>
                <Badge
                    variant={
                        task.status === "done" ? "default" : task.status === "in-progress" ? "secondary" : "outline"
                    }
                    className="shrink-0"
                >
                    {task.status === "in-progress" ? "In Progress" : task.status === "done" ? "Done" : "To Do"}
                </Badge>
            </CardContent>
        </Card>
    )
}
