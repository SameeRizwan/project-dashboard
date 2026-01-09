"use client"

import React, { useEffect, useMemo, useState } from "react"
import { TaskCard } from "@/components/task-card"
import { Skeleton } from "@/components/ui/skeleton"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { DotsThreeVertical, Plus, Circle, CircleNotch, CheckCircle } from "@phosphor-icons/react/dist/ssr"

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

function columnStatusIcon(status: Task["status"]): React.JSX.Element {
    switch (status) {
        case "todo":
            return <Circle className="h-4 w-4 text-muted-foreground" />
        case "in-progress":
            return <CircleNotch className="h-4 w-4 text-amber-500" />
        case "done":
            return <CheckCircle className="h-4 w-4 text-green-500" />
        default:
            return <Circle className="h-4 w-4 text-muted-foreground" />
    }
}

type TaskBoardViewProps = {
    tasks: Task[]
    loading?: boolean
}

const COLUMN_ORDER: Array<Task["status"]> = ["todo", "in-progress", "done"]

function columnStatusLabel(status: Task["status"]): string {
    switch (status) {
        case "todo":
            return "To Do"
        case "in-progress":
            return "In Progress"
        case "done":
            return "Done"
        default:
            return status
    }
}

export function TaskBoardView({ tasks, loading = false }: TaskBoardViewProps) {
    const [items, setItems] = useState<Task[]>(tasks)
    const [draggingId, setDraggingId] = useState<string | null>(null)

    useEffect(() => {
        setItems(tasks)
    }, [tasks])

    const groups = useMemo(() => {
        const m = new Map<Task["status"], Task[]>()
        for (const s of COLUMN_ORDER) m.set(s, [])
        for (const t of items) {
            const arr = m.get(t.status)
            if (arr) {
                arr.push(t)
            }
        }
        return m
    }, [items])

    const onDropTo = (status: Task["status"]) => (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault()
        const id = e.dataTransfer.getData("text/id")
        if (!id) return
        setDraggingId(null)
        setItems((prev) => prev.map((t) => (t.id === id ? { ...t, status } : t)))
    }

    const onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault()
    }

    const draggableCard = (t: Task) => (
        <div
            key={t.id}
            draggable
            className={`transition-all ${draggingId === t.id
                    ? "cursor-grabbing opacity-70 shadow-lg shadow-lg/20 scale-[0.98]"
                    : "cursor-grab"
                }`}
            onDragStart={(e) => {
                e.dataTransfer.setData("text/id", t.id)
                setDraggingId(t.id)
            }}
            onDragEnd={() => setDraggingId(null)}
        >
            <TaskCard
                task={t}
                variant="board"
                actions={
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg">
                                <DotsThreeVertical className="h-4 w-4" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-40 p-2" align="end">
                            <div className="space-y-1">
                                {COLUMN_ORDER.map((s) => (
                                    <button
                                        key={s}
                                        className="w-full rounded-md px-2 py-1 text-left text-sm hover:bg-accent"
                                        onClick={() => setItems((prev) => prev.map((x) => (x.id === t.id ? { ...x, status: s } : x)))}
                                    >
                                        Move to {columnStatusLabel(s)}
                                    </button>
                                ))}
                            </div>
                        </PopoverContent>
                    </Popover>
                }
            />
        </div>
    )

    if (loading) {
        return (
            <div className="p-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    {COLUMN_ORDER.map((s) => (
                        <div key={s} className="rounded-xl bg-background/60">
                            <div className="flex items-center justify-between px-3 py-2 border-b border-border/60">
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-3 w-6" />
                            </div>
                            <div className="p-3 space-y-3">
                                {Array.from({ length: 3 }).map((_, i) => (
                                    <Skeleton key={i} className="h-32 rounded-2xl" />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )
    }

    const total = items.length
    if (total === 0) {
        return (
            <div className="p-8 text-center text-sm text-muted-foreground">No tasks found</div>
        )
    }

    return (
        <div className="p-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                {COLUMN_ORDER.map((status) => (
                    <div
                        key={status}
                        className="rounded-xl bg-muted"
                        onDragOver={onDragOver}
                        onDrop={onDropTo(status)}
                    >
                        <div className="flex items-center justify-between px-3 py-3">
                            <div className="flex items-center gap-2">
                                {columnStatusIcon(status)}
                                <span className="inline-flex items-center gap-1 text-sm font-medium">
                                    {columnStatusLabel(status)}
                                </span>
                                <span className="text-xs text-muted-foreground">{groups.get(status)?.length ?? 0}</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 rounded-lg"
                                    type="button"
                                >
                                    <DotsThreeVertical className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                        <div className="px-3 pb-3 space-y-3 min-h-[120px]">
                            {(groups.get(status) ?? []).map(draggableCard)}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
