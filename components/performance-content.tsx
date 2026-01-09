"use client"

import { useEffect, useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"
import { projectService } from "@/lib/services/project-service"
import type { Project } from "@/lib/data/projects"
import {
    Spinner,
    TrendUp,
    TrendDown,
    CheckCircle,
    Clock,
    Folder,
    ChartBar,
    ListChecks,
    Target,
} from "@phosphor-icons/react/dist/ssr"
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Legend,
} from "recharts"

const CHART_COLORS = {
    primary: "#3b82f6",
    success: "#10b981",
    warning: "#f59e0b",
    danger: "#ef4444",
    purple: "#8b5cf6",
    pink: "#ec4899",
}

const STATUS_COLORS: Record<string, string> = {
    Active: CHART_COLORS.primary,
    Completed: CHART_COLORS.success,
    Planned: CHART_COLORS.warning,
    Backlog: CHART_COLORS.purple,
    Cancelled: CHART_COLORS.danger,
}

const PRIORITY_COLORS: Record<string, string> = {
    Urgent: CHART_COLORS.danger,
    High: CHART_COLORS.warning,
    Medium: CHART_COLORS.primary,
    Low: CHART_COLORS.success,
}

export function PerformanceContent() {
    const [projects, setProjects] = useState<Project[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true)
            try {
                const list = await projectService.getAllProjects()
                setProjects(list)
            } catch (error) {
                console.error("Error fetching projects:", error)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [])

    // Calculate statistics
    const stats = useMemo(() => {
        const totalProjects = projects.length
        const completedProjects = projects.filter((p) => p.status === "completed").length
        const activeProjects = projects.filter((p) => p.status === "active").length
        const totalTasks = projects.reduce((acc, p) => acc + p.tasks.length, 0)
        const completedTasks = projects.reduce(
            (acc, p) => acc + p.tasks.filter((t) => t.status === "done").length,
            0
        )
        const avgProgress = projects.length
            ? Math.round(projects.reduce((acc, p) => acc + p.progress, 0) / projects.length)
            : 0

        return {
            totalProjects,
            completedProjects,
            activeProjects,
            totalTasks,
            completedTasks,
            avgProgress,
            completionRate: totalProjects ? Math.round((completedProjects / totalProjects) * 100) : 0,
            taskCompletionRate: totalTasks ? Math.round((completedTasks / totalTasks) * 100) : 0,
        }
    }, [projects])

    // Chart data
    const statusData = useMemo(() => {
        const statusCounts = projects.reduce((acc, p) => {
            acc[p.status] = (acc[p.status] || 0) + 1
            return acc
        }, {} as Record<string, number>)

        return Object.entries(statusCounts).map(([name, value]) => ({
            name: name.charAt(0).toUpperCase() + name.slice(1),
            value,
            fill: STATUS_COLORS[name.charAt(0).toUpperCase() + name.slice(1)] || CHART_COLORS.primary,
        }))
    }, [projects])

    const priorityData = useMemo(() => {
        const priorityCounts = projects.reduce((acc, p) => {
            acc[p.priority] = (acc[p.priority] || 0) + 1
            return acc
        }, {} as Record<string, number>)

        return Object.entries(priorityCounts).map(([name, value]) => ({
            name: name.charAt(0).toUpperCase() + name.slice(1),
            value,
            fill: PRIORITY_COLORS[name.charAt(0).toUpperCase() + name.slice(1)] || CHART_COLORS.primary,
        }))
    }, [projects])

    const progressData = useMemo(() => {
        return projects
            .slice(0, 8)
            .map((p) => ({
                name: p.name.length > 15 ? p.name.slice(0, 15) + "..." : p.name,
                progress: p.progress,
                tasks: p.taskCount,
            }))
    }, [projects])

    if (loading) {
        return (
            <div className="flex flex-1 items-center justify-center">
                <Spinner className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="flex flex-1 flex-col bg-background mx-2 my-2 border border-border rounded-lg min-w-0 overflow-auto">
            {/* Header - matching project page style */}
            <header className="flex flex-col border-b border-border/40">
                <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                    <div className="flex items-center gap-3">
                        <SidebarTrigger className="h-8 w-8 rounded-lg hover:bg-accent text-muted-foreground" />
                        <p className="text-base font-medium text-foreground">Performance</p>
                    </div>
                </div>
                <div className="flex items-center justify-between px-4 pb-3 pt-3">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1.5">
                            <Folder className="h-4 w-4" />
                            {stats.totalProjects} projects
                        </span>
                        <span className="flex items-center gap-1.5">
                            <ListChecks className="h-4 w-4" />
                            {stats.totalTasks} tasks
                        </span>
                        <span className="flex items-center gap-1.5 text-green-500">
                            <CheckCircle className="h-4 w-4" />
                            {stats.completedTasks} completed
                        </span>
                    </div>
                </div>
            </header>

            {/* KPI Cards */}
            <div className="grid gap-4 p-6 sm:grid-cols-2 lg:grid-cols-4">
                <KPICard
                    title="Total Projects"
                    value={stats.totalProjects}
                    icon={<Folder className="h-5 w-5" />}
                    color="primary"
                    subtitle={`${stats.activeProjects} active`}
                />
                <KPICard
                    title="Completion Rate"
                    value={`${stats.completionRate}%`}
                    icon={<Target className="h-5 w-5" />}
                    color="success"
                    trend={stats.completionRate > 50 ? "up" : "down"}
                    subtitle={`${stats.completedProjects} completed`}
                />
                <KPICard
                    title="Total Tasks"
                    value={stats.totalTasks}
                    icon={<ListChecks className="h-5 w-5" />}
                    color="warning"
                    subtitle={`${stats.taskCompletionRate}% done`}
                />
                <KPICard
                    title="Avg Progress"
                    value={`${stats.avgProgress}%`}
                    icon={<ChartBar className="h-5 w-5" />}
                    color="purple"
                    trend={stats.avgProgress > 40 ? "up" : "down"}
                />
            </div>

            {/* Charts Row */}
            <div className="grid gap-6 px-6 pb-6 lg:grid-cols-2">
                {/* Project Progress Bar Chart */}
                <Card className="rounded-2xl border-border/60">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base font-semibold flex items-center gap-2">
                            <ChartBar className="h-5 w-5 text-primary" />
                            Project Progress
                        </CardTitle>
                        <CardDescription>Progress overview of active projects</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[280px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={progressData} layout="vertical" margin={{ left: 0, right: 20 }}>
                                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
                                    <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                                    <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                                    <Tooltip
                                        contentStyle={{
                                            borderRadius: "12px",
                                            border: "1px solid hsl(var(--border))",
                                            background: "hsl(var(--background))",
                                            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                                        }}
                                        formatter={(value: number) => [`${value}%`, "Progress"]}
                                    />
                                    <Bar dataKey="progress" fill={CHART_COLORS.primary} radius={[0, 6, 6, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Status Pie Chart */}
                <Card className="rounded-2xl border-border/60">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base font-semibold flex items-center gap-2">
                            <Folder className="h-5 w-5 text-primary" />
                            Projects by Status
                        </CardTitle>
                        <CardDescription>Distribution across project statuses</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[280px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={statusData}
                                        cx="50%"
                                        cy="45%"
                                        innerRadius={50}
                                        outerRadius={85}
                                        paddingAngle={4}
                                        dataKey="value"
                                    >
                                        {statusData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.fill} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{
                                            borderRadius: "12px",
                                            border: "1px solid hsl(var(--border))",
                                            background: "hsl(var(--background))",
                                        }}
                                    />
                                    <Legend
                                        verticalAlign="bottom"
                                        height={36}
                                        formatter={(value) => <span className="text-sm text-foreground">{value}</span>}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Priority Distribution */}
                <Card className="rounded-2xl border-border/60">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base font-semibold flex items-center gap-2">
                            <Target className="h-5 w-5 text-primary" />
                            Priority Distribution
                        </CardTitle>
                        <CardDescription>Projects organized by priority level</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[280px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={priorityData} margin={{ top: 10, right: 20, bottom: 20, left: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                                    <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                                    <YAxis allowDecimals={false} tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                                    <Tooltip
                                        contentStyle={{
                                            borderRadius: "12px",
                                            border: "1px solid hsl(var(--border))",
                                            background: "hsl(var(--background))",
                                        }}
                                    />
                                    <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                                        {priorityData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.fill} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Task Completion */}
                <Card className="rounded-2xl border-border/60">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base font-semibold flex items-center gap-2">
                            <CheckCircle className="h-5 w-5 text-primary" />
                            Task Overview
                        </CardTitle>
                        <CardDescription>Track task completion across all projects</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-6">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground">Tasks Completed</span>
                                <span className="text-3xl font-bold text-green-500">{stats.completedTasks}</span>
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Progress</span>
                                    <span className="font-medium">{stats.taskCompletionRate}%</span>
                                </div>
                                <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
                                    <div
                                        className="bg-gradient-to-r from-green-400 to-green-500 h-3 rounded-full transition-all duration-500"
                                        style={{ width: `${stats.taskCompletionRate}%` }}
                                    />
                                </div>
                                <div className="flex justify-between text-xs text-muted-foreground">
                                    <span>{stats.completedTasks} completed</span>
                                    <span>{stats.totalTasks - stats.completedTasks} remaining</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border/60">
                                <div className="text-center p-3 rounded-xl bg-blue-50 dark:bg-blue-950/30">
                                    <div className="text-xl font-bold text-blue-500">
                                        {projects.reduce((acc, p) => acc + p.tasks.filter((t) => t.status === "todo").length, 0)}
                                    </div>
                                    <div className="text-xs text-muted-foreground mt-1">To Do</div>
                                </div>
                                <div className="text-center p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30">
                                    <div className="text-xl font-bold text-amber-500">
                                        {projects.reduce((acc, p) => acc + p.tasks.filter((t) => t.status === "in-progress").length, 0)}
                                    </div>
                                    <div className="text-xs text-muted-foreground mt-1">In Progress</div>
                                </div>
                                <div className="text-center p-3 rounded-xl bg-green-50 dark:bg-green-950/30">
                                    <div className="text-xl font-bold text-green-500">{stats.completedTasks}</div>
                                    <div className="text-xs text-muted-foreground mt-1">Done</div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

function KPICard({
    title,
    value,
    icon,
    color,
    trend,
    subtitle,
}: {
    title: string
    value: string | number
    icon: React.ReactNode
    color: "primary" | "success" | "warning" | "purple"
    trend?: "up" | "down"
    subtitle?: string
}) {
    const colorClasses = {
        primary: "bg-blue-50 text-blue-500 dark:bg-blue-950/30",
        success: "bg-green-50 text-green-500 dark:bg-green-950/30",
        warning: "bg-amber-50 text-amber-500 dark:bg-amber-950/30",
        purple: "bg-purple-50 text-purple-500 dark:bg-purple-950/30",
    }

    return (
        <Card className="rounded-2xl border-border/60 hover:shadow-md transition-shadow">
            <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                    <div className={cn("p-2.5 rounded-xl", colorClasses[color])}>
                        {icon}
                    </div>
                    {trend && (
                        <div
                            className={cn(
                                "flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full",
                                trend === "up" ? "bg-green-50 text-green-500 dark:bg-green-950/30" : "bg-red-50 text-red-500 dark:bg-red-950/30"
                            )}
                        >
                            {trend === "up" ? <TrendUp className="h-3 w-3" /> : <TrendDown className="h-3 w-3" />}
                            {trend === "up" ? "Up" : "Down"}
                        </div>
                    )}
                </div>
                <div className="text-2xl font-bold">{value}</div>
                <div className="text-sm text-muted-foreground mt-0.5">{title}</div>
                {subtitle && (
                    <div className="text-xs text-muted-foreground mt-1">{subtitle}</div>
                )}
            </CardContent>
        </Card>
    )
}
