"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { useAuth } from "@/components/auth-provider"
import { toast } from "sonner"
import {
    User,
    Bell,
    Palette,
    Shield,
    SignOut,
    Moon,
    Sun,
    Desktop,
} from "@phosphor-icons/react/dist/ssr"

export function SettingsContent() {
    const { user, logout } = useAuth()
    const [theme, setTheme] = useState<"light" | "dark" | "system">("system")
    const [notifications, setNotifications] = useState({
        email: true,
        push: true,
        projectUpdates: true,
        taskAssignments: true,
        weeklyDigest: false,
    })

    const handleThemeChange = (value: string) => {
        setTheme(value as "light" | "dark" | "system")
        // In a real app, this would update the theme
        document.documentElement.classList.remove("light", "dark")
        if (value !== "system") {
            document.documentElement.classList.add(value)
        }
        toast.success(`Theme changed to ${value}`)
    }

    const handleLogout = async () => {
        await logout()
        toast.success("Logged out successfully")
    }

    return (
        <div className="flex flex-1 flex-col bg-background mx-2 my-2 border border-border rounded-lg min-w-0 overflow-auto">
            {/* Header */}
            <div className="border-b border-border/40 px-6 py-4">
                <h1 className="text-2xl font-bold">Settings</h1>
                <p className="text-sm text-muted-foreground mt-1">
                    Manage your account and preferences
                </p>
            </div>

            <div className="p-6 space-y-6 max-w-3xl">
                {/* Profile Section */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <User className="h-5 w-5 text-primary" />
                            <CardTitle>Profile</CardTitle>
                        </div>
                        <CardDescription>Your personal information</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center gap-4">
                            <Avatar className="h-16 w-16">
                                <AvatarImage src={user?.photoURL || ""} />
                                <AvatarFallback className="text-lg">
                                    {user?.displayName?.charAt(0) || "U"}
                                </AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="font-medium">{user?.displayName || "User"}</p>
                                <p className="text-sm text-muted-foreground">{user?.email}</p>
                            </div>
                        </div>
                        <Separator />
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="displayName">Display Name</Label>
                                <Input id="displayName" defaultValue={user?.displayName || ""} disabled />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input id="email" type="email" defaultValue={user?.email || ""} disabled />
                            </div>
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Profile information is managed by your Google account
                        </p>
                    </CardContent>
                </Card>

                {/* Appearance Section */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Palette className="h-5 w-5 text-primary" />
                            <CardTitle>Appearance</CardTitle>
                        </div>
                        <CardDescription>Customize how the app looks</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label>Theme</Label>
                                <p className="text-sm text-muted-foreground">
                                    Select your preferred color scheme
                                </p>
                            </div>
                            <Select value={theme} onValueChange={handleThemeChange}>
                                <SelectTrigger className="w-[140px]">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="light">
                                        <div className="flex items-center gap-2">
                                            <Sun className="h-4 w-4" />
                                            Light
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="dark">
                                        <div className="flex items-center gap-2">
                                            <Moon className="h-4 w-4" />
                                            Dark
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="system">
                                        <div className="flex items-center gap-2">
                                            <Desktop className="h-4 w-4" />
                                            System
                                        </div>
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>

                {/* Notifications Section */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Bell className="h-5 w-5 text-primary" />
                            <CardTitle>Notifications</CardTitle>
                        </div>
                        <CardDescription>Configure how you receive notifications</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label>Email Notifications</Label>
                                <p className="text-sm text-muted-foreground">
                                    Receive notifications via email
                                </p>
                            </div>
                            <Switch
                                checked={notifications.email}
                                onCheckedChange={(checked) =>
                                    setNotifications({ ...notifications, email: checked })
                                }
                            />
                        </div>
                        <Separator />
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label>Push Notifications</Label>
                                <p className="text-sm text-muted-foreground">
                                    Receive in-app push notifications
                                </p>
                            </div>
                            <Switch
                                checked={notifications.push}
                                onCheckedChange={(checked) =>
                                    setNotifications({ ...notifications, push: checked })
                                }
                            />
                        </div>
                        <Separator />
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label>Project Updates</Label>
                                <p className="text-sm text-muted-foreground">
                                    Get notified about project status changes
                                </p>
                            </div>
                            <Switch
                                checked={notifications.projectUpdates}
                                onCheckedChange={(checked) =>
                                    setNotifications({ ...notifications, projectUpdates: checked })
                                }
                            />
                        </div>
                        <Separator />
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label>Task Assignments</Label>
                                <p className="text-sm text-muted-foreground">
                                    Get notified when tasks are assigned to you
                                </p>
                            </div>
                            <Switch
                                checked={notifications.taskAssignments}
                                onCheckedChange={(checked) =>
                                    setNotifications({ ...notifications, taskAssignments: checked })
                                }
                            />
                        </div>
                        <Separator />
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label>Weekly Digest</Label>
                                <p className="text-sm text-muted-foreground">
                                    Receive a weekly summary of activity
                                </p>
                            </div>
                            <Switch
                                checked={notifications.weeklyDigest}
                                onCheckedChange={(checked) =>
                                    setNotifications({ ...notifications, weeklyDigest: checked })
                                }
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Security Section */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Shield className="h-5 w-5 text-primary" />
                            <CardTitle>Security</CardTitle>
                        </div>
                        <CardDescription>Manage your account security</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label>Sign out</Label>
                                <p className="text-sm text-muted-foreground">
                                    Sign out of your account on this device
                                </p>
                            </div>
                            <Button variant="destructive" onClick={handleLogout} className="gap-2">
                                <SignOut className="h-4 w-4" />
                                Sign Out
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
