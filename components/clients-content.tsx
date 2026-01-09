"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { clientService, type Client } from "@/lib/services/client-service"
import {
    Plus,
    DotsThreeVertical,
    PencilSimple,
    Trash,
    MagnifyingGlass,
    Spinner,
    Buildings,
    EnvelopeSimple,
    Phone,
    Folder,
    CurrencyDollar,
} from "@phosphor-icons/react/dist/ssr"
import { toast } from "sonner"

type ClientFormData = {
    name: string
    email: string
    company: string
    phone: string
    status: "active" | "inactive" | "lead"
    notes: string
}

const defaultFormData: ClientFormData = {
    name: "",
    email: "",
    company: "",
    phone: "",
    status: "lead",
    notes: "",
}

export function ClientsContent() {
    const [clients, setClients] = useState<Client[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")
    const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive" | "lead">("all")

    // Dialog state
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [editingClient, setEditingClient] = useState<Client | null>(null)
    const [formData, setFormData] = useState<ClientFormData>(defaultFormData)
    const [isSaving, setIsSaving] = useState(false)

    const fetchClients = async () => {
        setLoading(true)
        try {
            const list = await clientService.getAllClients()
            setClients(list)
        } catch (error) {
            toast.error("Failed to load clients")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchClients()
    }, [])

    const handleSeed = async () => {
        await clientService.seedClients()
        fetchClients()
        toast.success("Sample clients added!")
    }

    const openCreateDialog = () => {
        setEditingClient(null)
        setFormData(defaultFormData)
        setIsDialogOpen(true)
    }

    const openEditDialog = (client: Client) => {
        setEditingClient(client)
        setFormData({
            name: client.name,
            email: client.email,
            company: client.company,
            phone: client.phone || "",
            status: client.status,
            notes: client.notes || "",
        })
        setIsDialogOpen(true)
    }

    const handleSubmit = async () => {
        if (!formData.name || !formData.email || !formData.company) {
            toast.error("Please fill in all required fields")
            return
        }

        setIsSaving(true)
        try {
            if (editingClient) {
                await clientService.updateClient(editingClient.id, {
                    ...formData,
                    projectCount: editingClient.projectCount,
                    totalValue: editingClient.totalValue,
                })
                toast.success("Client updated!")
            } else {
                await clientService.createClient({
                    ...formData,
                    projectCount: 0,
                    totalValue: 0,
                })
                toast.success("Client created!")
            }
            setIsDialogOpen(false)
            fetchClients()
        } catch (error) {
            toast.error("Failed to save client")
        } finally {
            setIsSaving(false)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this client?")) return

        try {
            await clientService.deleteClient(id)
            toast.success("Client deleted!")
            fetchClients()
        } catch (error) {
            toast.error("Failed to delete client")
        }
    }

    const filteredClients = clients.filter((client) => {
        const matchesSearch =
            client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            client.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
            client.email.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesStatus = statusFilter === "all" || client.status === statusFilter
        return matchesSearch && matchesStatus
    })

    if (loading) {
        return (
            <div className="flex flex-1 items-center justify-center">
                <Spinner className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="flex flex-1 flex-col bg-background mx-2 my-2 border border-border rounded-lg min-w-0 overflow-auto">
            {/* Header */}
            <div className="border-b border-border/40 px-6 py-4 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Clients</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Manage your client relationships
                    </p>
                </div>
                <Button onClick={openCreateDialog} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Add Client
                </Button>
            </div>

            {/* Filters */}
            <div className="px-6 py-4 flex flex-col sm:flex-row gap-4 border-b border-border/40">
                <div className="relative flex-1">
                    <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search clients..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9"
                    />
                </div>
                <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)}>
                    <SelectTrigger className="w-[160px]">
                        <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="lead">Lead</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Content */}
            {clients.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-12 text-center">
                    <Buildings className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium">No clients yet</h3>
                    <p className="text-sm text-muted-foreground mt-1 mb-4">
                        Get started by adding your first client
                    </p>
                    <div className="flex gap-2">
                        <Button onClick={openCreateDialog} variant="default">
                            Add Client
                        </Button>
                        <Button onClick={handleSeed} variant="outline">
                            Seed Sample Data
                        </Button>
                    </div>
                </div>
            ) : (
                <div className="grid gap-4 p-6 md:grid-cols-2 lg:grid-cols-3">
                    {filteredClients.map((client) => (
                        <ClientCard
                            key={client.id}
                            client={client}
                            onEdit={() => openEditDialog(client)}
                            onDelete={() => handleDelete(client.id)}
                        />
                    ))}
                </div>
            )}

            {/* Create/Edit Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[480px]">
                    <DialogHeader>
                        <DialogTitle>
                            {editingClient ? "Edit Client" : "Add New Client"}
                        </DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Name *</Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="Client name"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="company">Company *</Label>
                            <Input
                                id="company"
                                value={formData.company}
                                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                                placeholder="Company name"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="email">Email *</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    placeholder="email@example.com"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="phone">Phone</Label>
                                <Input
                                    id="phone"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    placeholder="+1 555-0100"
                                />
                            </div>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="status">Status</Label>
                            <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v as any })}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="lead">Lead</SelectItem>
                                    <SelectItem value="active">Active</SelectItem>
                                    <SelectItem value="inactive">Inactive</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="notes">Notes</Label>
                            <Textarea
                                id="notes"
                                value={formData.notes}
                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                placeholder="Add any notes about this client..."
                                rows={3}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleSubmit} disabled={isSaving}>
                            {isSaving && <Spinner className="h-4 w-4 mr-2 animate-spin" />}
                            {editingClient ? "Save Changes" : "Create Client"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}

function ClientCard({
    client,
    onEdit,
    onDelete,
}: {
    client: Client
    onEdit: () => void
    onDelete: () => void
}) {
    const statusColors = {
        active: "bg-green-500/10 text-green-600 border-green-200",
        inactive: "bg-gray-500/10 text-gray-600 border-gray-200",
        lead: "bg-blue-500/10 text-blue-600 border-blue-200",
    }

    return (
        <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                            <AvatarImage src={client.avatar} />
                            <AvatarFallback className="bg-primary/10 text-primary">
                                {client.name.slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <h3 className="font-medium">{client.name}</h3>
                            <p className="text-xs text-muted-foreground">{client.company}</p>
                        </div>
                    </div>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                <DotsThreeVertical className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={onEdit}>
                                <PencilSimple className="h-4 w-4 mr-2" />
                                Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={onDelete} className="text-destructive">
                                <Trash className="h-4 w-4 mr-2" />
                                Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                <Badge variant="outline" className={cn("mb-3", statusColors[client.status])}>
                    {client.status.charAt(0).toUpperCase() + client.status.slice(1)}
                </Badge>

                <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <EnvelopeSimple className="h-4 w-4" />
                        <span className="truncate">{client.email}</span>
                    </div>
                    {client.phone && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <Phone className="h-4 w-4" />
                            <span>{client.phone}</span>
                        </div>
                    )}
                    <div className="flex items-center justify-between pt-2 border-t">
                        <div className="flex items-center gap-1 text-muted-foreground">
                            <Folder className="h-4 w-4" />
                            <span>{client.projectCount} projects</span>
                        </div>
                        {client.totalValue !== undefined && client.totalValue > 0 && (
                            <div className="flex items-center gap-1 text-green-600 font-medium">
                                <CurrencyDollar className="h-4 w-4" />
                                <span>{(client.totalValue / 1000).toFixed(0)}k</span>
                            </div>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
