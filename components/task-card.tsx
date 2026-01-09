"use client"

import { format } from "date-fns"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getAvatarUrl } from "@/lib/assets/avatars"
import { CalendarBlank, CheckCircle, Circle, CircleNotch, Flag, User } from "@phosphor-icons/react/dist/ssr"
import { cn } from "@/lib/utils"
import { PriorityBadge } from "@/components/priority-badge"

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

type TaskCardProps = {
    task: Task
    actions?: React.ReactNode
    variant?: "list" | "board"
}

function statusConfig(status: Task["status"]) {
    switch (status) {
        case "todo":
            return { label: "To Do", dot: "bg-zinc-500", pill: "text-zinc-700 border-zinc-200 bg-zinc-50", icon: Circle }
        case "in-progress":
            return { label: "In Progress", dot: "bg-amber-500", pill: "text-amber-700 border-amber-200 bg-amber-50", icon: CircleNotch }
        case "done":
            return { label: "Done", dot: "bg-green-500", pill: "text-green-700 border-green-200 bg-green-50", icon: CheckCircle }
        default:
            return { label: status, dot: "bg-zinc-400", pill: "text-zinc-700 border-zinc-200 bg-zinc-50", icon: Circle }
    }
}

export function TaskCard({ task, actions, variant = "list" }: TaskCardProps) {
    const s = statusConfig(task.status)
    const StatusIcon = s.icon
    const assignee = task.assignee
    const dueDate = task.endDate
    const avatarUrl = getAvatarUrl(assignee)
    const isBoard = variant === "board"

    const initials = assignee ? assignee.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase() : null

    const dueLabel = (() => {
        if (!dueDate) return "No due date"
        return format(dueDate, "MMM d")
    })()

    return (
        <div className="rounded-2xl border border-border bg-background hover:shadow-lg/5 transition-shadow cursor-pointer">
            <div className="p-4">
                <div className="flex items-center justify-between">
                    {isBoard ? (
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Flag className="h-4 w-4" />
                            <span>{dueLabel}</span>
                        </div>
                    ) : (
                        <div className="text-muted-foreground">
                            <StatusIcon className={cn("h-5 w-5", task.status === "done" && "text-green-500", task.status === "in-progress" && "text-amber-500")} weight={task.status === "done" ? "fill" : "regular"} />
                        </div>
                    )}
                    <div className="flex items-center gap-2">
                        {!isBoard && (
                            <div className={cn("flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium", s.pill)}>
                                <span className={cn("inline-block size-1.5 rounded-full", s.dot)} />
                                {s.label}
                            </div>
                        )}
                        {isBoard && (
                            <PriorityBadge level={task.priority} appearance="inline" />
                        )}
                        {actions ? <div className="shrink-0">{actions}</div> : null}
                    </div>
                </div>

                <div className="mt-3">
                    <p className={cn("text-[15px] font-semibold text-foreground leading-6", task.status === "done" && "line-through text-muted-foreground")}>
                        {task.name}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground truncate">
                        {task.projectName}
                    </p>
                </div>

                {!isBoard && (
                    <div className="mt-2 flex items-center justify-between text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                            <CalendarBlank className="h-4 w-4" />
                            <span>{dueDate ? format(dueDate, "MMM d, yyyy") : "—"}</span>
                        </div>
                        <PriorityBadge level={task.priority} appearance="inline" />
                    </div>
                )}

                <div className="mt-4 border-t border-border/60" />

                <div className="mt-3 flex items-center justify-between">
                    <div className="text-xs text-muted-foreground">
                        {task.status === "done" ? "Completed" : `Due ${format(task.endDate, "MMM d")}`}
                    </div>
                    <Avatar className="size-6 border border-border">
                        <AvatarImage alt={assignee ?? ""} src={avatarUrl} />
                        <AvatarFallback className="text-xs">
                            {initials ? initials : <User className="h-4 w-4 text-muted-foreground" />}
                        </AvatarFallback>
                    </Avatar>
                </div>
            </div>
        </div>
    )
}
