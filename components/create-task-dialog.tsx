"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"
import { CalendarBlank, Spinner } from "@phosphor-icons/react/dist/ssr"
import { cn } from "@/lib/utils"
import { projectService } from "@/lib/services/project-service"
import type { Project } from "@/lib/data/projects"
import { toast } from "sonner"

interface CreateTaskDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onTaskCreated?: () => void
    defaultProjectId?: string
}

export function CreateTaskDialog({ open, onOpenChange, onTaskCreated, defaultProjectId }: CreateTaskDialogProps) {
    const [loading, setLoading] = useState(false)
    const [projects, setProjects] = useState<Project[]>([])
    const [projectsLoading, setProjectsLoading] = useState(false)

    // Form State
    const [name, setName] = useState("")
    const [projectId, setProjectId] = useState(defaultProjectId || "")
    const [assignee, setAssignee] = useState("")
    const [priority, setPriority] = useState<"urgent" | "high" | "medium" | "low">("medium")
    const [dueDate, setDueDate] = useState<Date | undefined>(new Date())

    // Fetch projects on mount/open
    useEffect(() => {
        const fetchProjects = async () => {
            setProjectsLoading(true)
            try {
                const list = await projectService.getAllProjects()
                setProjects(list)
                // If only one project and no default, select it
                if (!projectId && list.length > 0) {
                    // Optional: Auto-select if desired, currently sticking to explicit or default
                }
            } catch (error) {
                console.error("Failed to load projects", error)
            } finally {
                setProjectsLoading(false)
            }
        }

        if (open) {
            fetchProjects()
            // Reset form if needed, or keep persistent? Better to reset on new open usually.
            if (!defaultProjectId) setProjectId("")
            setName("")
            setAssignee("")
            setPriority("medium")
            setDueDate(new Date())
        }
    }, [open, defaultProjectId])

    console.log("CreateTaskDialog render:", { open, projectId, defaultProjectId })

    const handleProjectChange = (val: string) => {
        console.log("Selected project:", val)
        setProjectId(val)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!name || !projectId || !dueDate) {
            toast.error("Please fill in all required fields")
            return
        }

        setLoading(true)
        try {
            await projectService.addTask(projectId, {
                name,
                assignee: assignee || "Unassigned",
                status: "todo",
                startDate: new Date(), // Task starts now
                endDate: dueDate,
                priority: priority as any // Typecast for safety
            })
            toast.success("Task created successfully")
            onTaskCreated?.()
            onOpenChange(false)
        } catch (error) {
            toast.error("Failed to create task")
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Create New Task</DialogTitle>
                    <DialogDescription>
                        Add a new task to a project. Click save when you're done.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right">
                            Task
                        </Label>
                        <Input
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g. Design Homepage"
                            className="col-span-3"
                            autoFocus
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="project" className="text-right">
                            Project
                        </Label>
                        <Select value={projectId} onValueChange={handleProjectChange} disabled={projectsLoading}>
                            <SelectTrigger className="col-span-3">
                                <SelectValue placeholder={projectsLoading ? "Loading..." : "Select project"} />
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
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="assignee" className="text-right">
                            Assignee
                        </Label>
                        <Input
                            id="assignee"
                            value={assignee}
                            onChange={(e) => setAssignee(e.target.value)}
                            placeholder="e.g. Jason Duong"
                            className="col-span-3"
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="priority" className="text-right">
                            Priority
                        </Label>
                        <Select value={priority} onValueChange={(v: any) => setPriority(v)}>
                            <SelectTrigger className="col-span-3">
                                <SelectValue placeholder="Select priority" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="low">Low</SelectItem>
                                <SelectItem value="medium">Medium</SelectItem>
                                <SelectItem value="high">High</SelectItem>
                                <SelectItem value="urgent">Urgent</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label className="text-right">Due Date</Label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant={"outline"}
                                    className={cn(
                                        "col-span-3 justify-start text-left font-normal",
                                        !dueDate && "text-muted-foreground"
                                    )}
                                >
                                    <CalendarBlank className="mr-2 h-4 w-4" />
                                    {dueDate ? format(dueDate, "PPP") : <span>Pick a date</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                    mode="single"
                                    selected={dueDate}
                                    onSelect={setDueDate}
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                    </div>
                </form>
                <DialogFooter>
                    <Button type="submit" onClick={handleSubmit} disabled={loading}>
                        {loading && <Spinner className="mr-2 h-4 w-4 animate-spin" />}
                        Create Task
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
