"use client"

import { useState, useEffect } from "react"
import type { Project } from "@/lib/data/projects"
import { ProjectCard } from "@/components/project-card"
import { EditProjectDialog } from "@/components/edit-project-dialog"
import { Plus, FolderOpen, DotsThreeVertical, Trash, PencilSimple } from "@phosphor-icons/react/dist/ssr"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { projectService } from "@/lib/services/project-service"
import { toast } from "sonner"

type ProjectCardsViewProps = {
  projects: Project[]
  loading?: boolean
  onCreateProject?: () => void
  onRefresh?: () => void
}

export function ProjectCardsView({ projects, loading = false, onCreateProject, onRefresh }: ProjectCardsViewProps) {
  const [items, setItems] = useState(projects)
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [editDialogOpen, setEditDialogOpen] = useState(false)

  // Sync with projects prop
  useEffect(() => {
    setItems(projects)
  }, [projects])

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this project?")) return
    try {
      await projectService.deleteProject(id)
      setItems((prev) => prev.filter((p) => p.id !== id))
      toast.success("Project deleted")
      onRefresh?.()
    } catch (error) {
      toast.error("Failed to delete project")
    }
  }

  const handleEdit = (project: Project) => {
    setEditingProject(project)
    setEditDialogOpen(true)
  }

  const isEmpty = !loading && items.length === 0

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
            <FolderOpen className="h-6 w-6 text-foreground" />
          </div>
          <h3 className="mb-2 text-lg font-semibold text-foreground">No projects yet</h3>
          <p className="mb-6 text-sm text-muted-foreground">Create your first project to get started</p>
          <button
            className="rounded-lg border border-border bg-background px-4 py-2 text-sm hover:bg-accent transition-colors cursor-pointer"
            onClick={onCreateProject}
          >
            <Plus className="mr-2 inline h-4 w-4" />
            Create new project
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {items.map((p) => (
            <ProjectCard
              key={p.id}
              project={p}
              actions={
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg">
                      <DotsThreeVertical className="h-4 w-4" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-40 p-2" align="end">
                    <div className="space-y-1">
                      <button
                        className="w-full rounded-md px-2 py-1 text-left text-sm hover:bg-accent flex items-center gap-2"
                        onClick={() => handleEdit(p)}
                      >
                        <PencilSimple className="h-4 w-4" />
                        Edit
                      </button>
                      <div className="border-t border-border my-1" />
                      <button
                        className="w-full rounded-md px-2 py-1 text-left text-sm hover:bg-destructive/10 text-destructive flex items-center gap-2"
                        onClick={() => handleDelete(p.id)}
                      >
                        <Trash className="h-4 w-4" />
                        Delete
                      </button>
                    </div>
                  </PopoverContent>
                </Popover>
              }
            />
          ))}
          <button
            className="rounded-2xl border border-dashed border-border/60 bg-background p-6 text-center text-sm text-muted-foreground hover:border-solid hover:border-border/80 hover:text-foreground transition-colors min-h-[180px] flex flex-col items-center justify-center cursor-pointer"
            onClick={onCreateProject}
          >
            <Plus className="mb-2 h-5 w-5" />
            Create new project
          </button>
        </div>
      )}

      {/* Edit Project Dialog */}
      <EditProjectDialog
        project={editingProject}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onSave={onRefresh}
      />
    </div>
  )
}
