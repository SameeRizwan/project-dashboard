"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@phosphor-icons/react/dist/ssr"
import type { Project } from "@/lib/data/projects"
import { projectService } from "@/lib/services/project-service"
import { toast } from "sonner"
import { format } from "date-fns"

// Strip HTML tags from text
function stripHtml(html: string | undefined): string {
    if (!html) return ""
    return html.replace(/<[^>]*>/g, "").trim()
}

interface EditProjectDialogProps {
    project: Project | null
    open: boolean
    onOpenChange: (open: boolean) => void
    onSave?: () => void
}

export function EditProjectDialog({ project, open, onOpenChange, onSave }: EditProjectDialogProps) {
    const [name, setName] = useState("")
    const [status, setStatus] = useState<Project["status"]>("planned")
    const [priority, setPriority] = useState<Project["priority"]>("medium")
    const [client, setClient] = useState("")
    const [endDate, setEndDate] = useState("")
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (project) {
            setName(stripHtml(project.name))
            setStatus(project.status)
            setPriority(project.priority)
            setClient(project.client || "")
            setEndDate(project.endDate ? format(project.endDate, "yyyy-MM-dd") : "")
        }
    }, [project])

    const handleSave = async () => {
        if (!project) return

        setLoading(true)
        try {
            await projectService.updateProject(project.id, {
                name,
                status,
                priority,
                client,
                endDate: endDate ? new Date(endDate) : project.endDate,
            })
            toast.success("Project updated successfully")
            onSave?.()
            onOpenChange(false)
        } catch (error) {
            toast.error("Failed to update project")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Edit Project</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="name">Project Name</Label>
                        <Input
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Enter project name"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="status">Status</Label>
                            <Select value={status} onValueChange={(val) => setStatus(val as Project["status"])}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="backlog">Backlog</SelectItem>
                                    <SelectItem value="planned">Planned</SelectItem>
                                    <SelectItem value="active">Active</SelectItem>
                                    <SelectItem value="completed">Completed</SelectItem>
                                    <SelectItem value="cancelled">Cancelled</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="priority">Priority</Label>
                            <Select value={priority} onValueChange={(val) => setPriority(val as Project["priority"])}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="low">Low</SelectItem>
                                    <SelectItem value="medium">Medium</SelectItem>
                                    <SelectItem value="high">High</SelectItem>
                                    <SelectItem value="urgent">Urgent</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="client">Client</Label>
                        <Input
                            id="client"
                            value={client}
                            onChange={(e) => setClient(e.target.value)}
                            placeholder="Client name (optional)"
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="endDate">Due Date</Label>
                        <div className="relative">
                            <Input
                                id="endDate"
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="pl-10"
                            />
                            <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        </div>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button onClick={handleSave} disabled={loading || !name.trim()}>
                        {loading ? "Saving..." : "Save Changes"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
