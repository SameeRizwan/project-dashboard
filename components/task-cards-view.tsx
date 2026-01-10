"use client"

import type { Project } from "@/lib/data/projects"
import { projectService } from "@/lib/services/project-service"
import { toast } from "sonner"
import { TaskCard } from "@/components/task-card"
import { Plus, ListChecks, DotsThreeVertical, PencilSimple, Trash } from "@phosphor-icons/react/dist/ssr"
import { Skeleton } from "@/components/ui/skeleton"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { EditTaskDialog } from "@/components/edit-task-dialog"

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

type TaskCardsViewProps = {
    tasks: Task[]
    loading?: boolean
}

export function TaskCardsView({ tasks, loading = false }: TaskCardsViewProps) {
    const isEmpty = !loading && tasks.length === 0
    const [editingTask, setEditingTask] = useState<Task | null>(null)

    // We need local state to remove item immediately from view or trigger reload
    // But since tasks come from props, ideally we call a refresh from parent or refresh page
    // For simplicity, we'll reload page on delete for now to match edit behavior
    const handleDeleteTask = async (task: Task) => {
        if (!confirm("Are you sure you want to delete this task?")) return
        try {
            await projectService.deleteTask(task.projectId, task.id)
            toast.success("Task deleted")
            window.location.reload()
        } catch (error) {
            toast.error("Failed to delete task")
        }
    }

    return (
        <div className="p-4">
            {loading ? (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {Array.from({ length: 8 }).map((_, i) => (
                        <Skeleton key={i} className="h-40 rounded-2xl" />
                    ))}
                </div>
            ) : isEmpty ? (
                <div className="flex h-60 flex-col items-center justify-center text-center">
                    <div className="p-3 bg-muted rounded-md mb-4">
                        <ListChecks className="h-6 w-6 text-foreground" />
                    </div>
                    <h3 className="mb-2 text-lg font-semibold text-foreground">No tasks found</h3>
                    <p className="mb-6 text-sm text-muted-foreground">Tasks from your projects will appear here</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {tasks.map((t) => (
                        <TaskCard
                            key={t.id}
                            task={t}
                            actions={
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                                            <DotsThreeVertical className="h-4 w-4" />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-40 p-2" align="end">
                                        <button
                                            className="w-full rounded-md px-2 py-1 text-left text-sm hover:bg-accent flex items-center gap-2"
                                            onClick={() => setEditingTask(t)}
                                        >
                                            <PencilSimple className="h-3.5 w-3.5" />
                                            Edit Task
                                        </button>
                                        <div className="h-px bg-border my-1" />
                                        <button
                                            className="w-full rounded-md px-2 py-1 text-left text-sm hover:bg-accent text-red-500 flex items-center gap-2"
                                            onClick={() => handleDeleteTask(t)}
                                        >
                                            <Trash className="h-3.5 w-3.5" />
                                            Delete
                                        </button>
                                    </PopoverContent>
                                </Popover>
                            }
                        />
                    ))}
                </div>
            )}
            {editingTask && (
                <EditTaskDialog
                    open={!!editingTask}
                    onOpenChange={(open) => !open && setEditingTask(null)}
                    task={editingTask as any}
                    projectId={editingTask.projectId}
                    onTaskUpdated={() => window.location.reload()}
                />
            )}
        </div>
    )
}
