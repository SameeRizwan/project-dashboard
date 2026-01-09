"use client"

import { useEffect, useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { projectService } from "@/lib/services/project-service"
import type { Project } from "@/lib/data/projects"
import {
    Spinner,
    TrendUp,
    TrendDown,
    CheckCircle,
    Clock,
    Users,
    Folder,
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
    LineChart,
    Line,
    Legend,
} from "recharts"

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"]

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
        }))
    }, [projects])

    const progressData = useMemo(() => {
        return projects
            .slice(0, 8)
            .map((p) => ({
                name: p.name.length > 20 ? p.name.slice(0, 20) + "..." : p.name,
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
            {/* Header */}
            <div className="border-b border-border/40 px-6 py-4">
                <h1 className="text-2xl font-bold">Performance</h1>
                <p className="text-sm text-muted-foreground mt-1">
                    Track project metrics and team performance
                </p>
            </div>

            {/* KPI Cards */}
            <div className="grid gap-4 p-6 sm:grid-cols-2 lg:grid-cols-4">
                <KPICard
                    title="Total Projects"
                    value={stats.totalProjects}
                    icon={<Folder className="h-5 w-5" />}
                    trend={stats.activeProjects > 0 ? "up" : undefined}
                    trendValue={`${stats.activeProjects} active`}
                />
                <KPICard
                    title="Completion Rate"
                    value={`${stats.completionRate}%`}
                    icon={<CheckCircle className="h-5 w-5" />}
                    trend={stats.completionRate > 50 ? "up" : "down"}
                    trendValue={`${stats.completedProjects} completed`}
                />
                <KPICard
                    title="Total Tasks"
                    value={stats.totalTasks}
                    icon={<Clock className="h-5 w-5" />}
                    trendValue={`${stats.taskCompletionRate}% done`}
                />
                <KPICard
                    title="Avg Progress"
                    value={`${stats.avgProgress}%`}
                    icon={<TrendUp className="h-5 w-5" />}
                    trend={stats.avgProgress > 40 ? "up" : "down"}
                />
            </div>

            {/* Charts Row */}
            <div className="grid gap-6 px-6 pb-6 lg:grid-cols-2">
                {/* Project Progress Bar Chart */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Project Progress</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={progressData} layout="vertical">
                                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                    <XAxis type="number" domain={[0, 100]} />
                                    <YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 12 }} />
                                    <Tooltip
                                        contentStyle={{ borderRadius: "8px", border: "1px solid #e5e7eb" }}
                                        formatter={(value: number) => [`${value}%`, "Progress"]}
                                    />
                                    <Bar dataKey="progress" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Status Pie Chart */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Projects by Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={statusData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={100}
                                        paddingAngle={4}
                                        dataKey="value"
                                        label={({ name, value }) => `${name}: ${value}`}
                                    >
                                        {statusData.map((_, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Priority Distribution */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Priority Distribution</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={priorityData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="name" />
                                    <YAxis allowDecimals={false} />
                                    <Tooltip
                                        contentStyle={{ borderRadius: "8px", border: "1px solid #e5e7eb" }}
                                    />
                                    <Bar dataKey="value" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Task Completion */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Task Overview</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground">Tasks Completed</span>
                                <span className="text-2xl font-bold text-green-500">{stats.completedTasks}</span>
                            </div>
                            <div className="w-full bg-muted rounded-full h-3">
                                <div
                                    className="bg-green-500 h-3 rounded-full transition-all"
                                    style={{ width: `${stats.taskCompletionRate}%` }}
                                />
                            </div>
                            <div className="flex justify-between text-sm text-muted-foreground">
                                <span>{stats.completedTasks} completed</span>
                                <span>{stats.totalTasks - stats.completedTasks} remaining</span>
                            </div>

                            <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                                <div className="text-center">
                                    <div className="text-xl font-bold text-blue-500">
                                        {projects.reduce((acc, p) => acc + p.tasks.filter((t) => t.status === "todo").length, 0)}
                                    </div>
                                    <div className="text-xs text-muted-foreground">To Do</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-xl font-bold text-amber-500">
                                        {projects.reduce((acc, p) => acc + p.tasks.filter((t) => t.status === "in-progress").length, 0)}
                                    </div>
                                    <div className="text-xs text-muted-foreground">In Progress</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-xl font-bold text-green-500">{stats.completedTasks}</div>
                                    <div className="text-xs text-muted-foreground">Done</div>
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
    trend,
    trendValue,
}: {
    title: string
    value: string | number
    icon: React.ReactNode
    trend?: "up" | "down"
    trendValue?: string
}) {
    return (
        <Card>
            <CardContent className="pt-4">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-muted-foreground">{icon}</span>
                    {trend && (
                        <span
                            className={cn(
                                "text-xs flex items-center gap-1",
                                trend === "up" ? "text-green-500" : "text-red-500"
                            )}
                        >
                            {trend === "up" ? <TrendUp className="h-3 w-3" /> : <TrendDown className="h-3 w-3" />}
                        </span>
                    )}
                </div>
                <div className="text-2xl font-bold">{value}</div>
                <div className="text-xs text-muted-foreground">{title}</div>
                {trendValue && (
                    <div className="text-xs text-muted-foreground mt-1">{trendValue}</div>
                )}
            </CardContent>
        </Card>
    )
}
