"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import {
    Plus,
    Folder,
    Code,
    Palette,
    Rocket,
    Bug,
    Lightning,
    MagnifyingGlass,
    ArrowRight,
} from "@phosphor-icons/react/dist/ssr"

type Template = {
    id: string
    name: string
    description: string
    category: string
    icon: React.ReactNode
    tasks: string[]
    usageCount: number
}

const TEMPLATES: Template[] = [
    {
        id: "1",
        name: "Web Development Project",
        description: "Standard web development workflow with discovery, design, development, and launch phases",
        category: "Development",
        icon: <Code className="h-6 w-6" />,
        tasks: [
            "Project kickoff & requirements",
            "Information architecture",
            "Wireframes & prototypes",
            "Visual design",
            "Frontend development",
            "Backend integration",
            "QA & testing",
            "Launch & deployment",
        ],
        usageCount: 24,
    },
    {
        id: "2",
        name: "Mobile App MVP",
        description: "Agile mobile app development from concept to app store submission",
        category: "Development",
        icon: <Rocket className="h-6 w-6" />,
        tasks: [
            "User research & personas",
            "Feature prioritization",
            "UX design sprints",
            "UI design system",
            "Core feature development",
            "Beta testing",
            "App store preparation",
            "Launch marketing",
        ],
        usageCount: 18,
    },
    {
        id: "3",
        name: "Brand Identity Design",
        description: "Complete brand identity project from strategy to guidelines",
        category: "Design",
        icon: <Palette className="h-6 w-6" />,
        tasks: [
            "Brand discovery workshop",
            "Competitive analysis",
            "Brand strategy",
            "Logo concepts",
            "Logo refinement",
            "Color & typography",
            "Brand applications",
            "Brand guidelines",
        ],
        usageCount: 12,
    },
    {
        id: "4",
        name: "Bug Fix Sprint",
        description: "Structured approach to addressing technical debt and bugs",
        category: "Maintenance",
        icon: <Bug className="h-6 w-6" />,
        tasks: [
            "Bug triage & prioritization",
            "Root cause analysis",
            "Fix implementation",
            "Code review",
            "Testing & verification",
            "Documentation update",
            "Deployment",
        ],
        usageCount: 31,
    },
    {
        id: "5",
        name: "Product Launch",
        description: "Go-to-market campaign and product launch coordination",
        category: "Marketing",
        icon: <Lightning className="h-6 w-6" />,
        tasks: [
            "Launch strategy",
            "Marketing assets",
            "Press kit preparation",
            "Email campaign setup",
            "Social media planning",
            "Partner coordination",
            "Launch day execution",
            "Post-launch analysis",
        ],
        usageCount: 9,
    },
]

export function TemplatesContent() {
    const [searchQuery, setSearchQuery] = useState("")
    const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null)
    const [isPreviewOpen, setIsPreviewOpen] = useState(false)
    const [projectName, setProjectName] = useState("")

    const filteredTemplates = TEMPLATES.filter((template) =>
        template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.category.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const handleUseTemplate = (template: Template) => {
        setSelectedTemplate(template)
        setProjectName("")
        setIsPreviewOpen(true)
    }

    const handleCreateProject = () => {
        if (!projectName.trim()) {
            toast.error("Please enter a project name")
            return
        }
        toast.success(`Project "${projectName}" created from template!`)
        setIsPreviewOpen(false)
        setProjectName("")
    }

    const categories = [...new Set(TEMPLATES.map((t) => t.category))]

    return (
        <div className="flex flex-1 flex-col bg-background mx-2 my-2 border border-border rounded-lg min-w-0 overflow-auto">
            {/* Header */}
            <div className="border-b border-border/40 px-6 py-4 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Templates</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Start new projects faster with pre-built templates
                    </p>
                </div>
                <Button variant="outline" className="gap-2">
                    <Plus className="h-4 w-4" />
                    Create Template
                </Button>
            </div>

            {/* Search */}
            <div className="px-6 py-4 border-b border-border/40">
                <div className="relative max-w-md">
                    <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search templates..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9"
                    />
                </div>
            </div>

            {/* Templates Grid */}
            <div className="p-6">
                {categories.map((category) => {
                    const categoryTemplates = filteredTemplates.filter((t) => t.category === category)
                    if (categoryTemplates.length === 0) return null

                    return (
                        <div key={category} className="mb-8">
                            <h2 className="text-lg font-semibold mb-4">{category}</h2>
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                {categoryTemplates.map((template) => (
                                    <TemplateCard
                                        key={template.id}
                                        template={template}
                                        onUse={() => handleUseTemplate(template)}
                                    />
                                ))}
                            </div>
                        </div>
                    )
                })}

                {filteredTemplates.length === 0 && (
                    <div className="text-center py-12">
                        <Folder className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-medium">No templates found</h3>
                        <p className="text-sm text-muted-foreground">
                            Try adjusting your search query
                        </p>
                    </div>
                )}
            </div>

            {/* Template Preview Dialog */}
            <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            {selectedTemplate?.icon}
                            {selectedTemplate?.name}
                        </DialogTitle>
                        <DialogDescription>{selectedTemplate?.description}</DialogDescription>
                    </DialogHeader>

                    <div className="py-4">
                        <Label className="text-sm font-medium mb-2 block">Included Tasks</Label>
                        <div className="space-y-2 max-h-[200px] overflow-auto">
                            {selectedTemplate?.tasks.map((task, index) => (
                                <div
                                    key={index}
                                    className="flex items-center gap-2 text-sm text-muted-foreground"
                                >
                                    <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                                    {task}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="projectName">Project Name</Label>
                        <Input
                            id="projectName"
                            placeholder="Enter project name"
                            value={projectName}
                            onChange={(e) => setProjectName(e.target.value)}
                        />
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsPreviewOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleCreateProject} className="gap-2">
                            Create Project
                            <ArrowRight className="h-4 w-4" />
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}

function TemplateCard({
    template,
    onUse,
}: {
    template: Template
    onUse: () => void
}) {
    return (
        <Card className="hover:shadow-md transition-shadow group cursor-pointer" onClick={onUse}>
            <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                    <div className="p-2 rounded-lg bg-primary/10 text-primary">
                        {template.icon}
                    </div>
                    <Badge variant="secondary">{template.category}</Badge>
                </div>
                <CardTitle className="text-lg mt-2">{template.name}</CardTitle>
                <CardDescription className="line-clamp-2">
                    {template.description}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>{template.tasks.length} tasks</span>
                    <span>Used {template.usageCount} times</span>
                </div>
                <Button
                    variant="ghost"
                    size="sm"
                    className="w-full mt-3 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                    Use Template
                    <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
            </CardContent>
        </Card>
    )
}
