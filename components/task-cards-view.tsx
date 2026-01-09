"use client"

import type { Project } from "@/lib/data/projects"
import { TaskCard } from "@/components/task-card"
import { Plus, ListChecks } from "@phosphor-icons/react/dist/ssr"
import { Skeleton } from "@/components/ui/skeleton"

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
                        <TaskCard key={t.id} task={t} />
                    ))}
                </div>
            )}
        </div>
    )
}
