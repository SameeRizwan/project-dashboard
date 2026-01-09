"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import {
    Bell,
    CheckCircle,
    UserCirclePlus,
    Folder,
    ChatCircle,
    Clock,
    Check,
    Trash,
} from "@phosphor-icons/react/dist/ssr"

type Notification = {
    id: string
    type: "assignment" | "mention" | "update" | "comment"
    title: string
    description: string
    project?: string
    time: string
    read: boolean
}

const SAMPLE_NOTIFICATIONS: Notification[] = [
    {
        id: "1",
        type: "assignment",
        title: "New task assigned",
        description: "You've been assigned to 'Design system cleanup' in the Marketing Site project",
        project: "Marketing Site Refresh",
        time: "2 hours ago",
        read: false,
    },
    {
        id: "2",
        type: "mention",
        title: "You were mentioned",
        description: "Jason mentioned you in a comment: '@user can you review this?'",
        project: "Fintech Mobile App",
        time: "4 hours ago",
        read: false,
    },
    {
        id: "3",
        type: "update",
        title: "Project status updated",
        description: "AI Learning Platform has been moved to 'Active'",
        project: "AI Learning Platform",
        time: "Yesterday",
        read: true,
    },
    {
        id: "4",
        type: "comment",
        title: "New comment on your task",
        description: "Sarah commented: 'Great progress on the wireframes!'",
        project: "Internal PM System",
        time: "Yesterday",
        read: true,
    },
    {
        id: "5",
        type: "assignment",
        title: "Task completed",
        description: "Mike marked 'API endpoints' as complete",
        project: "Internal PM System",
        time: "2 days ago",
        read: true,
    },
]

export function InboxContent() {
    const [notifications, setNotifications] = useState<Notification[]>(SAMPLE_NOTIFICATIONS)

    const unreadCount = notifications.filter((n) => !n.read).length

    const markAsRead = (id: string) => {
        setNotifications((prev) =>
            prev.map((n) => (n.id === id ? { ...n, read: true } : n))
        )
    }

    const markAllAsRead = () => {
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
    }

    const deleteNotification = (id: string) => {
        setNotifications((prev) => prev.filter((n) => n.id !== id))
    }

    const getIcon = (type: Notification["type"]) => {
        switch (type) {
            case "assignment":
                return <UserCirclePlus className="h-5 w-5 text-blue-500" />
            case "mention":
                return <ChatCircle className="h-5 w-5 text-purple-500" />
            case "update":
                return <Folder className="h-5 w-5 text-green-500" />
            case "comment":
                return <ChatCircle className="h-5 w-5 text-amber-500" />
            default:
                return <Bell className="h-5 w-5" />
        }
    }

    return (
        <div className="flex flex-1 flex-col bg-background mx-2 my-2 border border-border rounded-lg min-w-0 overflow-auto">
            {/* Header */}
            <div className="border-b border-border/40 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <h1 className="text-2xl font-bold">Inbox</h1>
                    {unreadCount > 0 && (
                        <Badge variant="default" className="rounded-full">
                            {unreadCount} new
                        </Badge>
                    )}
                </div>
                <Button variant="outline" size="sm" onClick={markAllAsRead} disabled={unreadCount === 0}>
                    <Check className="h-4 w-4 mr-2" />
                    Mark all as read
                </Button>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="all" className="flex-1">
                <div className="px-6 pt-4 border-b border-border/40">
                    <TabsList>
                        <TabsTrigger value="all">All</TabsTrigger>
                        <TabsTrigger value="unread">
                            Unread ({unreadCount})
                        </TabsTrigger>
                        <TabsTrigger value="mentions">Mentions</TabsTrigger>
                    </TabsList>
                </div>

                <TabsContent value="all" className="p-6 space-y-3 m-0">
                    {notifications.length === 0 ? (
                        <EmptyState />
                    ) : (
                        notifications.map((notification) => (
                            <NotificationCard
                                key={notification.id}
                                notification={notification}
                                icon={getIcon(notification.type)}
                                onMarkAsRead={() => markAsRead(notification.id)}
                                onDelete={() => deleteNotification(notification.id)}
                            />
                        ))
                    )}
                </TabsContent>

                <TabsContent value="unread" className="p-6 space-y-3 m-0">
                    {unreadCount === 0 ? (
                        <EmptyState message="No unread notifications" />
                    ) : (
                        notifications
                            .filter((n) => !n.read)
                            .map((notification) => (
                                <NotificationCard
                                    key={notification.id}
                                    notification={notification}
                                    icon={getIcon(notification.type)}
                                    onMarkAsRead={() => markAsRead(notification.id)}
                                    onDelete={() => deleteNotification(notification.id)}
                                />
                            ))
                    )}
                </TabsContent>

                <TabsContent value="mentions" className="p-6 space-y-3 m-0">
                    {notifications.filter((n) => n.type === "mention").length === 0 ? (
                        <EmptyState message="No mentions yet" />
                    ) : (
                        notifications
                            .filter((n) => n.type === "mention")
                            .map((notification) => (
                                <NotificationCard
                                    key={notification.id}
                                    notification={notification}
                                    icon={getIcon(notification.type)}
                                    onMarkAsRead={() => markAsRead(notification.id)}
                                    onDelete={() => deleteNotification(notification.id)}
                                />
                            ))
                    )}
                </TabsContent>
            </Tabs>
        </div>
    )
}

function NotificationCard({
    notification,
    icon,
    onMarkAsRead,
    onDelete,
}: {
    notification: Notification
    icon: React.ReactNode
    onMarkAsRead: () => void
    onDelete: () => void
}) {
    return (
        <Card
            className={cn(
                "transition-colors",
                !notification.read && "bg-primary/5 border-primary/20"
            )}
        >
            <CardContent className="flex items-start gap-4 p-4">
                <div className="shrink-0 mt-0.5">{icon}</div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                        <div>
                            <p className={cn("font-medium", !notification.read && "text-primary")}>
                                {notification.title}
                            </p>
                            <p className="text-sm text-muted-foreground mt-0.5">
                                {notification.description}
                            </p>
                        </div>
                        {!notification.read && (
                            <div className="h-2 w-2 rounded-full bg-primary shrink-0 mt-2" />
                        )}
                    </div>
                    <div className="flex items-center gap-3 mt-2">
                        {notification.project && (
                            <Badge variant="outline" className="text-xs">
                                {notification.project}
                            </Badge>
                        )}
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {notification.time}
                        </span>
                    </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                    {!notification.read && (
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onMarkAsRead}>
                            <CheckCircle className="h-4 w-4" />
                        </Button>
                    )}
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={onDelete}
                    >
                        <Trash className="h-4 w-4" />
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}

function EmptyState({ message = "No notifications" }: { message?: string }) {
    return (
        <div className="text-center py-12">
            <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium">{message}</h3>
            <p className="text-sm text-muted-foreground">You're all caught up!</p>
        </div>
    )
}
