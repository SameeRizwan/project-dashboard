import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { format } from "date-fns"
import type { Project } from "@/lib/data/projects"
import { getAvatarUrl } from "@/lib/assets/avatars"
import { PriorityBadge } from "@/components/priority-badge"
import { ProjectProgress } from "@/components/project-progress"
import { CalendarBlank, User, Clock, Tag, Flag, CheckCircle } from "@phosphor-icons/react/dist/ssr"
import { useAuth } from "@/components/auth-provider"
import { cn } from "@/lib/utils"

interface ProjectDetailsSheetProps {
    project: Project | null
    open: boolean
    onOpenChange: (open: boolean) => void
}

function stripHtml(html: string | undefined): string {
    if (!html) return ""
    return html.replace(/<[^>]*>/g, "").trim()
}

export function ProjectDetailsSheet({ project, open, onOpenChange }: ProjectDetailsSheetProps) {
    const { user } = useAuth()

    if (!project) return null

    const assignee = project.members?.[0]

    // Consistent avatar resolution
    let avatarUrl = getAvatarUrl(assignee)
    if (!avatarUrl && user && assignee && (assignee.toLowerCase() === user.displayName?.toLowerCase() || assignee === "You")) {
        avatarUrl = user.photoURL || undefined
    }

    const initials = assignee ? assignee.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase() : null

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="sm:max-w-[600px] overflow-y-auto p-0 gap-0 border-l border-border/50 shadow-2xl bg-background/95 backdrop-blur-md">
                {/* Header Section */}
                <div className="px-6 py-6 border-b border-border/40">
                    <div className="flex items-center gap-2 mb-4">
                        <div className={cn(
                            "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                            project.status === 'active' ? "border-transparent bg-teal-500/15 text-teal-700 hover:bg-teal-500/25" :
                                project.status === 'completed' ? "border-transparent bg-blue-500/15 text-blue-700 hover:bg-blue-500/25" :
                                    "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80"
                        )}>
                            {project.status.toUpperCase()}
                        </div>
                        <PriorityBadge level={project.priority} appearance="inline" />
                    </div>

                    <SheetTitle className="text-3xl font-bold tracking-tight text-foreground mb-2">
                        {stripHtml(project.name)}
                    </SheetTitle>

                    <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                        {project.client && (
                            <div className="flex items-center gap-1.5 bg-muted/50 px-2 py-1 rounded-md">
                                <User className="w-4 h-4 opacity-70" />
                                <span>{project.client}</span>
                            </div>
                        )}
                        {project.typeLabel && (
                            <div className="flex items-center gap-1.5 bg-muted/50 px-2 py-1 rounded-md">
                                <Tag className="w-4 h-4 opacity-70" />
                                <span>{project.typeLabel}</span>
                            </div>
                        )}
                    </div>
                </div>

                <div className="p-6 space-y-8">
                    {/* Description */}
                    <div className="space-y-3">
                        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                            Project Description
                        </h3>
                        <div className="bg-muted/20 p-4 rounded-xl border border-border/40">
                            <div
                                className="prose prose-sm dark:prose-invert max-w-none text-foreground/80 leading-relaxed"
                                dangerouslySetInnerHTML={{ __html: project.description || "<span class='text-muted-foreground italic'>No description provided for this project.</span>" }}
                            />
                        </div>
                    </div>

                    {/* Key Metrics Grid */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-card p-4 rounded-xl border border-border/60 shadow-sm space-y-3 group hover:border-primary/20 transition-colors">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <CalendarBlank className="w-4 h-4 text-primary" />
                                <span className="font-medium text-foreground/70">Timeline</span>
                            </div>
                            <div className="space-y-1">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Start</span>
                                    <span className="font-medium">{project.startDate ? format(project.startDate, "MMM d, yyyy") : "TBD"}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Due</span>
                                    <span className="font-medium">{project.endDate ? format(project.endDate, "MMM d, yyyy") : "TBD"}</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-card p-4 rounded-xl border border-border/60 shadow-sm space-y-3 hover:border-primary/20 transition-colors">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Clock className="w-4 h-4 text-primary" />
                                <span className="font-medium text-foreground/70">Overview</span>
                            </div>
                            <div className="space-y-1">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Duration</span>
                                    <span className="font-medium">{project.durationLabel || "—"}</span>
                                </div>
                                <div className="flex justify-between text-sm items-center">
                                    <span className="text-muted-foreground">Tasks</span>
                                    <span className="inline-flex items-center justify-center bg-secondary px-2 py-0.5 rounded-full text-xs font-semibold">
                                        {project.taskCount}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Tags Section if existing */}
                    {(project.tags && project.tags.length > 0) && (
                        <div className="space-y-3">
                            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Tags</h3>
                            <div className="flex flex-wrap gap-2">
                                {project.tags.map(tag => (
                                    <span key={tag} className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-primary/10 text-primary hover:bg-primary/20 transition-colors border border-primary/10">
                                        #{tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Progress */}
                    <div className="space-y-3 bg-muted/30 p-5 rounded-xl border border-border/50">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                                <CheckCircle className="w-4 h-4 text-green-500" />
                                Progress Status
                            </h3>
                            <span className="text-sm font-bold text-foreground">{project.progress}%</span>
                        </div>
                        <ProjectProgress project={project} size={32} showTaskSummary={false} />
                        <p className="text-xs text-muted-foreground text-center mt-2">
                            {project.progress === 100 ? "Project Completed" : `${project.taskCount} tasks tracked`}
                        </p>
                    </div>

                    {/* Team Section */}
                    <div className="space-y-4">
                        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Project Team</h3>
                        <div className="flex items-center justify-between bg-card p-4 rounded-xl border border-border/60 shadow-sm">
                            <div className="flex items-center gap-4">
                                <Avatar className="h-12 w-12 border-2 border-background shadow-md">
                                    <AvatarImage alt={assignee ?? ""} src={avatarUrl} />
                                    <AvatarFallback className="bg-primary/10 text-primary font-bold">
                                        {initials ? initials : <User className="h-6 w-6" />}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="text-base font-semibold text-foreground leading-none mb-1">{assignee || "Unassigned"}</p>
                                    <div className="flex items-center gap-2">
                                        <Badge variant="secondary" className="text-[10px] uppercase font-bold text-muted-foreground">
                                            Owner
                                        </Badge>
                                        <span className="text-xs text-muted-foreground">
                                            {assignee === "You" || (user && assignee?.toLowerCase() === user.displayName?.toLowerCase()) ? "(That's you!)" : ""}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Action Placeholder */}
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                {/* Could add 'Message' or 'View Profile' button here later */}
                            </div>
                        </div>
                    </div>

                </div>
            </SheetContent>
        </Sheet>
    )
}
