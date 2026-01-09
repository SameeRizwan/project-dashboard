"use client"

import { format } from "date-fns"
import type { Project } from "@/lib/data/projects"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getAvatarUrl } from "@/lib/assets/avatars"
import { Folder, CalendarBlank, Flag, User } from "@phosphor-icons/react/dist/ssr"
import { cn } from "@/lib/utils"
import { PriorityBadge } from "@/components/priority-badge"
import { ProjectProgress } from "@/components/project-progress"

// Strip HTML tags from text
function stripHtml(html: string | undefined): string {
  if (!html) return ""
  return html.replace(/<[^>]*>/g, "").trim()
}

type ProjectCardProps = {
  project: Project
  actions?: React.ReactNode
  variant?: "list" | "board"
}

function statusConfig(status: Project["status"]) {
  switch (status) {
    case "active":
      return { label: "Active", dot: "bg-teal-600", pill: "text-teal-700 border-teal-200 bg-teal-50" }
    case "planned":
      return { label: "Planned", dot: "bg-zinc-900", pill: "text-zinc-900 border-zinc-200 bg-zinc-50" }
    case "backlog":
      return { label: "Backlog", dot: "bg-orange-600", pill: "text-orange-700 border-orange-200 bg-orange-50" }
    case "completed":
      return { label: "Completed", dot: "bg-blue-600", pill: "text-blue-700 border-blue-200 bg-blue-50" }
    case "cancelled":
      return { label: "Cancelled", dot: "bg-rose-600", pill: "text-rose-700 border-rose-200 bg-rose-50" }
    default:
      return { label: status, dot: "bg-zinc-400", pill: "text-zinc-700 border-zinc-200 bg-zinc-50" }
  }
}

function priorityLabel(priority: Project["priority"]) {
  if (priority === "urgent") return "Urgent"
  return priority.charAt(0).toUpperCase() + priority.slice(1)
}

export function ProjectCard({ project, actions, variant = "list" }: ProjectCardProps) {
  const s = statusConfig(project.status)
  const assignee = project.members?.[0]
  const dueDate = project.endDate
  const avatarUrl = getAvatarUrl(assignee)
  const isBoard = variant === "board"

  const initials = assignee ? assignee.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase() : null

  const secondaryLine = (() => {
    const a = project.client
    const b = project.typeLabel
    const c = project.durationLabel
    if (a || b || c) {
      return [a, b, c].filter(Boolean).join(" • ")
    }
    if (project.tags && project.tags.length > 0) {
      return project.tags.join(" • ")
    }
    return ""
  })()

  const dueLabel = (() => {
    if (!dueDate) return "No due date"
    // Board view: dùng format ngắn gọn cho header
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
              <Folder className="h-5 w-5" />
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
              <PriorityBadge level={project.priority} appearance="inline" />
            )}
            {actions ? <div className="shrink-0">{actions}</div> : null}
          </div>
        </div>

        <div className="mt-3">
          <p className="text-[15px] font-semibold text-foreground leading-6">
            {stripHtml(project.name)}
          </p>
          {isBoard ? (
            <div className="mt-1 text-sm text-muted-foreground truncate">
              {secondaryLine}
            </div>
          ) : (
            (() => {
              const a = project.client
              const b = project.typeLabel
              const c = project.durationLabel
              if (a || b || c) {
                return (
                  <p className="mt-1 text-sm text-muted-foreground truncate">
                    {[a, b, c].filter(Boolean).join(" • ")}
                  </p>
                )
              }
              if (project.tags && project.tags.length > 0) {
                return (
                  <p className="mt-1 text-sm text-muted-foreground truncate">{project.tags.join(" • ")}</p>
                )
              }
              return null
            })()
          )}
        </div>


        {!isBoard && (
          <div className="mt-2 flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <CalendarBlank className="h-4 w-4" />
              <span>{dueDate ? format(dueDate, "MMM d, yyyy") : "—"}</span>
            </div>
            <PriorityBadge level={project.priority} appearance="inline" />
          </div>
        )}

        <div className="mt-4 border-t border-border/60" />

        <div className="mt-3 flex items-center justify-between">
          <ProjectProgress project={project} size={isBoard ? 20 : 18} />
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
