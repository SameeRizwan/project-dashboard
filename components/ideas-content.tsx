"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Plus, DotsThree, Pencil, Trash, Lightbulb } from "@phosphor-icons/react/dist/ssr"
import { ideaService } from "@/lib/services/idea-service"
import { Idea } from "@/components/ideas/types"
import { format } from "date-fns"

export function IdeasContent() {
    const [ideas, setIdeas] = useState<Idea[]>([])
    const [loading, setLoading] = useState(true)
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
    const [editingIdea, setEditingIdea] = useState<Idea | null>(null)

    // Form states
    const [title, setTitle] = useState("")
    const [description, setDescription] = useState("")

    useEffect(() => {
        fetchIdeas()
    }, [])

    const fetchIdeas = async () => {
        setLoading(true)
        try {
            const fetchedIdeas = await ideaService.getAllIdeas()
            setIdeas(fetchedIdeas)
        } catch (error) {
            console.error("Failed to fetch ideas", error)
        } finally {
            setLoading(false)
        }
    }

    const handleAddIdea = async () => {
        if (!title.trim()) return

        try {
            await ideaService.addIdea({
                title,
                description,
            })
            setTitle("")
            setDescription("")
            setIsAddDialogOpen(false)
            fetchIdeas()
        } catch (error) {
            console.error("Failed to add idea", error)
        }
    }

    const handleEditIdea = async () => {
        if (!editingIdea || !title.trim()) return

        try {
            await ideaService.updateIdea(editingIdea.id, {
                title,
                description,
            })
            setEditingIdea(null)
            setTitle("")
            setDescription("")
            fetchIdeas()
        } catch (error) {
            console.error("Failed to update idea", error)
        }
    }

    const handleDeleteIdea = async (id: string) => {
        if (confirm("Are you sure you want to delete this idea?")) {
            try {
                await ideaService.deleteIdea(id)
                fetchIdeas()
            } catch (error) {
                console.error("Failed to delete idea", error)
            }
        }
    }

    const openEditDialog = (idea: Idea) => {
        setEditingIdea(idea)
        setTitle(idea.title)
        setDescription(idea.description)
    }

    return (
        <div className="flex flex-1 flex-col bg-background mx-2 my-2 border border-border rounded-lg min-w-0 overflow-auto">
            <div className="border-b border-border/40 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <h1 className="text-2xl font-bold">Ideas</h1>
                    <div className="flex items-center justify-center p-1 bg-amber-100 rounded-full">
                        <Lightbulb className="h-5 w-5 text-amber-600" weight="fill" />
                    </div>
                </div>
                <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Add Idea
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add New Idea</DialogTitle>
                            <DialogDescription>
                                Capture your latest brainstorm or feature request.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <label htmlFor="title" className="text-sm font-medium">
                                    Title
                                </label>
                                <Input
                                    id="title"
                                    placeholder="Idea title..."
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="description" className="text-sm font-medium">
                                    Description
                                </label>
                                <Textarea
                                    id="description"
                                    placeholder="Describe your idea..."
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button onClick={handleAddIdea} disabled={!title.trim()}>
                                Save Idea
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="p-6">
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                ) : ideas.length === 0 ? (
                    <div className="text-center py-12 border-2 border-dashed border-border rounded-lg">
                        <Lightbulb className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-medium">No ideas yet</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                            Start brainstorming and add your first idea!
                        </p>
                        <Button onClick={() => setIsAddDialogOpen(true)}>
                            <Plus className="mr-2 h-4 w-4" />
                            Add Idea
                        </Button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {ideas.map((idea) => (
                            <Card key={idea.id} className="flex flex-col">
                                <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                                    <div className="space-y-1">
                                        <CardTitle className="text-base font-semibold leading-tight">
                                            {idea.title}
                                        </CardTitle>
                                        <CardDescription className="text-xs">
                                            Created {format(idea.createdAt, 'MMM d, yyyy')}
                                        </CardDescription>
                                    </div>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" className="h-8 w-8 p-0">
                                                <DotsThree className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={() => openEditDialog(idea)}>
                                                <Pencil className="mr-2 h-4 w-4" />
                                                Edit
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                className="text-destructive focus:text-destructive"
                                                onClick={() => handleDeleteIdea(idea.id)}
                                            >
                                                <Trash className="mr-2 h-4 w-4" />
                                                Delete
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </CardHeader>
                                <CardContent className="flex-1">
                                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                        {idea.description}
                                    </p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>

            {/* Edit Dialog */}
            <Dialog open={!!editingIdea} onOpenChange={(open) => !open && setEditingIdea(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Idea</DialogTitle>
                        <DialogDescription>
                            Update your idea details.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <label htmlFor="edit-title" className="text-sm font-medium">
                                Title
                            </label>
                            <Input
                                id="edit-title"
                                placeholder="Idea title..."
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="edit-description" className="text-sm font-medium">
                                Description
                            </label>
                            <Textarea
                                id="edit-description"
                                placeholder="Describe your idea..."
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setEditingIdea(null)}>
                            Cancel
                        </Button>
                        <Button onClick={handleEditIdea} disabled={!title.trim()}>
                            Save Changes
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
