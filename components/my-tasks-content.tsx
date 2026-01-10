"use client"

import { useEffect, useState, useMemo } from "react"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { ViewOptionsPopover } from "@/components/view-options-popover"
import { TaskCardsView } from "@/components/task-cards-view"
import { TaskBoardView } from "@/components/task-board-view"
import { projectService } from "@/lib/services/project-service"
import { DEFAULT_VIEW_OPTIONS, type ViewOptions } from "@/lib/view-options"
import { Spinner, Plus } from "@phosphor-icons/react/dist/ssr"
import { Button } from "@/components/ui/button"
import { CreateTaskDialog } from "@/components/create-task-dialog"
import { isToday, isPast, isFuture } from "date-fns"
import { Sun } from "@phosphor-icons/react/dist/ssr"

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
    const [viewOptions, setViewOptions] = useState<ViewOptions>(DEFAULT_VIEW_OPTIONS)
    const [createOpen, setCreateOpen] = useState(false)
    const [showMyDay, setShowMyDay] = useState(false)

    const fetchTasks = async () => {
        setLoading(true)
        try {
            const projects = await projectService.getAllProjects()
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

    useEffect(() => {
        fetchTasks()
    }, [])

    const stats = useMemo(() => ({
        total: tasks.length,
        todo: tasks.filter((t) => t.status === "todo").length,
        inProgress: tasks.filter((t) => t.status === "in-progress").length,
        done: tasks.filter((t) => t.status === "done").length,
    }), [tasks])

    const displayedTasks = useMemo(() => {
        if (showMyDay) {
            return tasks.filter(t => t.endDate && isToday(new Date(t.endDate)) && t.status !== 'done')
        }
        return tasks
    }, [tasks, showMyDay])

    if (loading) {
        return (
            <div className="flex flex-1 items-center justify-center">
                <Spinner className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="flex flex-1 flex-col bg-background mx-2 my-2 border border-border rounded-lg min-w-0 overflow-auto">
            {/* Header - same structure as ProjectHeader */}
            <header className="flex flex-col border-b border-border/40">
                <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                    <div className="flex items-center gap-3">
                        <SidebarTrigger className="h-8 w-8 rounded-lg hover:bg-accent text-muted-foreground" />
                        <p className="text-base font-medium text-foreground">My Tasks</p>
                    </div>
                </div>
                <div className="flex items-center justify-between px-4 py-3">
                    <div className="flex items-center gap-2 ml-auto">
                        <Button size="sm" className="gap-2" onClick={() => setCreateOpen(true)}>
                            <Plus className="h-4 w-4" />
                            Create Task
                        </Button>
                        <Button
                            variant={showMyDay ? "default" : "outline"}
                            size="sm"
                            className="gap-2"
                            onClick={() => setShowMyDay(!showMyDay)}
                        >
                            <Sun className="h-4 w-4" weight={showMyDay ? "fill" : "regular"} />
                            My Day
                        </Button>
                        <ViewOptionsPopover options={viewOptions} onChange={setViewOptions} />
                    </div>
                </div>
            </header>

            {/* Content based on view type from ViewOptionsPopover */}
            {
                viewOptions.viewType === "list" && (
                    <TaskCardsView tasks={displayedTasks} loading={loading} />
                )
            }

            {
                viewOptions.viewType === "board" && (
                    <TaskBoardView tasks={displayedTasks} loading={loading} />
                )
            }

            {
                viewOptions.viewType === "timeline" && (
                    <div className="flex-1 p-6">
                        <div className="text-center py-12 text-muted-foreground">
                            <p>Timeline view for tasks coming soon</p>
                        </div>
                    </div>
                )
            }

            <CreateTaskDialog
                open={createOpen}
                onOpenChange={setCreateOpen}
                onTaskCreated={fetchTasks}
            />
        </div >
    )
}
