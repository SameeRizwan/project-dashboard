"use client"

import { useEffect, useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import { projectService } from "@/lib/services/project-service"
import type { Project } from "@/lib/data/projects"
import {
    Spinner,
    CurrencyDollar,
    Users,
    TrendUp,
    ChartLine,
    Briefcase,
    Clock,
    Target,
    ArrowUp,
    ArrowDown,
    Export,
} from "@phosphor-icons/react/dist/ssr"
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    LineChart,
    Line,
    PieChart,
    Pie,
    Cell,
    Legend,
    AreaChart,
    Area,
} from "recharts"
import { format, subMonths, addMonths, startOfMonth } from "date-fns"

// Strip HTML
function stripHtml(html: string | undefined): string {
    if (!html) return ""
    return html.replace(/<[^>]*>/g, "").trim()
}

// Mock billing rates per project for demo
const HOURLY_RATES: Record<string, number> = {}
const DEFAULT_RATE = 150

// Mock time entries for demo
function generateMockTimeData(projects: Project[]) {
    const months = Array.from({ length: 6 }, (_, i) => {
        const date = subMonths(new Date(), 5 - i)
        return {
            month: format(date, "MMM"),
            date: startOfMonth(date),
        }
    })

    return months.map(({ month }) => {
        const billable = Math.floor(Math.random() * 300) + 100
        const nonBillable = Math.floor(Math.random() * 50) + 20
        return {
            month,
            billable,
            nonBillable,
            total: billable + nonBillable,
            revenue: billable * DEFAULT_RATE,
        }
    })
}

const CHART_COLORS = {
    primary: "#3b82f6",
    success: "#10b981",
    warning: "#f59e0b",
    purple: "#8b5cf6",
    pink: "#ec4899",
    danger: "#ef4444",
}

export function ReportsContent() {
    const [projects, setProjects] = useState<Project[]>([])
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState("profitability")

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

    // Mock time data
    const timeData = useMemo(() => generateMockTimeData(projects), [projects])

    // Profitability data
    const profitabilityData = useMemo(() => {
        return projects.slice(0, 6).map((p) => {
            const hours = Math.floor(Math.random() * 200) + 50
            const rate = HOURLY_RATES[p.id] || DEFAULT_RATE
            const revenue = hours * rate
            const cost = hours * 75 // Assume $75/hr cost
            const profit = revenue - cost
            const margin = Math.round((profit / revenue) * 100)

            return {
                name: stripHtml(p.name).slice(0, 15),
                revenue,
                cost,
                profit,
                margin,
                hours,
            }
        })
    }, [projects])

    // Utilization data
    const utilizationData = useMemo(() => {
        const teamMembers = ["You", "Alex M", "Sarah C", "Mike R", "Hannah L"]
        return teamMembers.map((name) => {
            const billable = Math.floor(Math.random() * 140) + 40
            const nonBillable = Math.floor(Math.random() * 30) + 10
            const available = 160 // 40 hrs/week * 4 weeks
            const utilization = Math.round((billable / available) * 100)
            return {
                name,
                billable,
                nonBillable,
                available: available - billable - nonBillable,
                utilization,
            }
        })
    }, [])

    // Revenue forecast
    const forecastData = useMemo(() => {
        const months = Array.from({ length: 6 }, (_, i) => {
            const date = addMonths(new Date(), i)
            return format(date, "MMM yyyy")
        })

        return months.map((month, i) => {
            const base = 45000 + Math.floor(Math.random() * 15000)
            const projected = base * (1 + i * 0.05) // 5% growth per month
            const pipeline = projected * (0.3 + Math.random() * 0.4) // 30-70% pipeline
            return {
                month,
                projected: Math.round(projected),
                pipeline: Math.round(pipeline),
                confirmed: Math.round(projected * 0.6),
            }
        })
    }, [])

    // Summary stats
    const stats = useMemo(() => {
        const totalRevenue = timeData.reduce((sum, d) => sum + d.revenue, 0)
        const totalHours = timeData.reduce((sum, d) => sum + d.total, 0)
        const billableHours = timeData.reduce((sum, d) => sum + d.billable, 0)
        const avgUtilization = utilizationData.reduce((sum, d) => sum + d.utilization, 0) / utilizationData.length
        const nextMonthForecast = forecastData[1]?.projected || 0

        return {
            totalRevenue,
            totalHours,
            billableHours,
            avgUtilization: Math.round(avgUtilization),
            nextMonthForecast,
            utilizationChange: 5, // Mock
            revenueChange: 12, // Mock
        }
    }, [timeData, utilizationData, forecastData])

    if (loading) {
        return (
            <div className="flex flex-1 items-center justify-center">
                <Spinner className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="flex flex-1 flex-col bg-background mx-2 my-2 border border-border rounded-lg min-w-0 overflow-hidden">
            {/* Header */}
            <header className="flex flex-col border-b border-border/40">
                <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                    <div className="flex items-center gap-3">
                        <SidebarTrigger className="h-8 w-8 rounded-lg hover:bg-accent text-muted-foreground" />
                        <p className="text-base font-medium text-foreground">Reports</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" className="gap-2">
                            <Export className="h-4 w-4" />
                            Export
                        </Button>
                    </div>
                </div>
            </header>

            <div className="flex-1 overflow-auto p-6">
                {/* KPI Summary */}
                <div className="grid gap-4 mb-6 sm:grid-cols-2 lg:grid-cols-4">
                    <KPICard
                        title="Total Revenue (6mo)"
                        value={`$${(stats.totalRevenue / 1000).toFixed(0)}K`}
                        icon={<CurrencyDollar className="h-5 w-5" />}
                        color="success"
                        change={stats.revenueChange}
                    />
                    <KPICard
                        title="Billable Hours"
                        value={stats.billableHours.toLocaleString()}
                        icon={<Clock className="h-5 w-5" />}
                        color="primary"
                        subtitle={`of ${stats.totalHours} total`}
                    />
                    <KPICard
                        title="Avg Utilization"
                        value={`${stats.avgUtilization}%`}
                        icon={<Users className="h-5 w-5" />}
                        color="warning"
                        change={stats.utilizationChange}
                    />
                    <KPICard
                        title="Next Month Forecast"
                        value={`$${(stats.nextMonthForecast / 1000).toFixed(0)}K`}
                        icon={<TrendUp className="h-5 w-5" />}
                        color="purple"
                    />
                </div>

                {/* Tabs */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                    <TabsList className="bg-muted p-1 rounded-lg">
                        <TabsTrigger value="profitability" className="gap-2">
                            <CurrencyDollar className="h-4 w-4" />
                            Profitability
                        </TabsTrigger>
                        <TabsTrigger value="utilization" className="gap-2">
                            <Users className="h-4 w-4" />
                            Utilization
                        </TabsTrigger>
                        <TabsTrigger value="forecast" className="gap-2">
                            <ChartLine className="h-4 w-4" />
                            Revenue Forecast
                        </TabsTrigger>
                    </TabsList>

                    {/* Profitability Tab */}
                    <TabsContent value="profitability" className="space-y-6">
                        <div className="grid gap-6 lg:grid-cols-2">
                            <Card className="rounded-2xl">
                                <CardHeader>
                                    <CardTitle className="text-base">Project Profitability</CardTitle>
                                    <CardDescription>Revenue vs Cost by project</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="h-[300px]">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={profitabilityData} layout="vertical">
                                                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                                <XAxis type="number" tickFormatter={(val) => `$${val / 1000}K`} />
                                                <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 11 }} />
                                                <Tooltip
                                                    formatter={(val: number) => `$${val.toLocaleString()}`}
                                                    contentStyle={{ borderRadius: 12 }}
                                                />
                                                <Legend />
                                                <Bar dataKey="revenue" name="Revenue" fill={CHART_COLORS.success} radius={[0, 4, 4, 0]} />
                                                <Bar dataKey="cost" name="Cost" fill={CHART_COLORS.danger} radius={[0, 4, 4, 0]} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="rounded-2xl">
                                <CardHeader>
                                    <CardTitle className="text-base">Profit Margins</CardTitle>
                                    <CardDescription>Percentage margin by project</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="h-[300px]">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={profitabilityData}>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                                                <YAxis tickFormatter={(val) => `${val}%`} />
                                                <Tooltip formatter={(val: number) => `${val}%`} contentStyle={{ borderRadius: 12 }} />
                                                <Bar dataKey="margin" name="Margin %" fill={CHART_COLORS.primary} radius={[4, 4, 0, 0]}>
                                                    {profitabilityData.map((entry, index) => (
                                                        <Cell
                                                            key={`cell-${index}`}
                                                            fill={entry.margin > 40 ? CHART_COLORS.success : entry.margin > 20 ? CHART_COLORS.warning : CHART_COLORS.danger}
                                                        />
                                                    ))}
                                                </Bar>
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    {/* Utilization Tab */}
                    <TabsContent value="utilization" className="space-y-6">
                        <div className="grid gap-6 lg:grid-cols-2">
                            <Card className="rounded-2xl">
                                <CardHeader>
                                    <CardTitle className="text-base">Team Utilization</CardTitle>
                                    <CardDescription>Hours breakdown by team member</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="h-[300px]">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={utilizationData} layout="vertical">
                                                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                                <XAxis type="number" />
                                                <YAxis dataKey="name" type="category" width={80} />
                                                <Tooltip contentStyle={{ borderRadius: 12 }} />
                                                <Legend />
                                                <Bar dataKey="billable" name="Billable" stackId="a" fill={CHART_COLORS.success} />
                                                <Bar dataKey="nonBillable" name="Non-billable" stackId="a" fill={CHART_COLORS.warning} />
                                                <Bar dataKey="available" name="Available" stackId="a" fill="#e5e7eb" />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="rounded-2xl">
                                <CardHeader>
                                    <CardTitle className="text-base">Utilization Rate</CardTitle>
                                    <CardDescription>Target: 75%</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {utilizationData.map((member) => (
                                            <div key={member.name} className="space-y-2">
                                                <div className="flex justify-between text-sm">
                                                    <span className="font-medium">{member.name}</span>
                                                    <span className={cn(
                                                        "font-semibold",
                                                        member.utilization >= 75 ? "text-green-500" : member.utilization >= 50 ? "text-amber-500" : "text-red-500"
                                                    )}>
                                                        {member.utilization}%
                                                    </span>
                                                </div>
                                                <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                                                    <div
                                                        className={cn(
                                                            "h-2 rounded-full transition-all",
                                                            member.utilization >= 75 ? "bg-green-500" : member.utilization >= 50 ? "bg-amber-500" : "bg-red-500"
                                                        )}
                                                        style={{ width: `${member.utilization}%` }}
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    {/* Forecast Tab */}
                    <TabsContent value="forecast" className="space-y-6">
                        <div className="grid gap-6 lg:grid-cols-2">
                            <Card className="rounded-2xl lg:col-span-2">
                                <CardHeader>
                                    <CardTitle className="text-base">Revenue Forecast</CardTitle>
                                    <CardDescription>6-month projection based on current pipeline</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="h-[350px]">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <AreaChart data={forecastData}>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                                                <YAxis tickFormatter={(val) => `$${val / 1000}K`} />
                                                <Tooltip
                                                    formatter={(val: number) => `$${val.toLocaleString()}`}
                                                    contentStyle={{ borderRadius: 12 }}
                                                />
                                                <Legend />
                                                <Area
                                                    type="monotone"
                                                    dataKey="projected"
                                                    name="Projected"
                                                    stroke={CHART_COLORS.primary}
                                                    fill={`${CHART_COLORS.primary}30`}
                                                    strokeWidth={2}
                                                />
                                                <Area
                                                    type="monotone"
                                                    dataKey="confirmed"
                                                    name="Confirmed"
                                                    stroke={CHART_COLORS.success}
                                                    fill={`${CHART_COLORS.success}30`}
                                                    strokeWidth={2}
                                                />
                                                <Area
                                                    type="monotone"
                                                    dataKey="pipeline"
                                                    name="Pipeline"
                                                    stroke={CHART_COLORS.warning}
                                                    fill={`${CHART_COLORS.warning}30`}
                                                    strokeWidth={2}
                                                />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="rounded-2xl">
                                <CardHeader>
                                    <CardTitle className="text-base">Monthly Breakdown</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        {forecastData.slice(0, 4).map((month) => (
                                            <div key={month.month} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                                                <span className="font-medium">{month.month}</span>
                                                <div className="flex items-center gap-4 text-sm">
                                                    <span className="text-green-500">${(month.confirmed / 1000).toFixed(0)}K confirmed</span>
                                                    <span className="text-muted-foreground">+ ${(month.pipeline / 1000).toFixed(0)}K pipeline</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="rounded-2xl">
                                <CardHeader>
                                    <CardTitle className="text-base">Forecast Summary</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center">
                                            <span className="text-muted-foreground">Total Projected (6mo)</span>
                                            <span className="text-2xl font-bold">
                                                ${(forecastData.reduce((s, d) => s + d.projected, 0) / 1000).toFixed(0)}K
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-muted-foreground">Confirmed Revenue</span>
                                            <span className="text-xl font-semibold text-green-500">
                                                ${(forecastData.reduce((s, d) => s + d.confirmed, 0) / 1000).toFixed(0)}K
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-muted-foreground">In Pipeline</span>
                                            <span className="text-lg font-medium text-amber-500">
                                                ${(forecastData.reduce((s, d) => s + d.pipeline, 0) / 1000).toFixed(0)}K
                                            </span>
                                        </div>
                                        <div className="pt-4 border-t border-border">
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-muted-foreground">Conversion needed</span>
                                                <Badge variant="secondary">~60% of pipeline</Badge>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    )
}

function KPICard({
    title,
    value,
    icon,
    color,
    change,
    subtitle,
}: {
    title: string
    value: string
    icon: React.ReactNode
    color: "primary" | "success" | "warning" | "purple"
    change?: number
    subtitle?: string
}) {
    const colorClasses = {
        primary: "bg-blue-50 text-blue-500 dark:bg-blue-950/30",
        success: "bg-green-50 text-green-500 dark:bg-green-950/30",
        warning: "bg-amber-50 text-amber-500 dark:bg-amber-950/30",
        purple: "bg-purple-50 text-purple-500 dark:bg-purple-950/30",
    }

    return (
        <Card className="rounded-2xl hover:shadow-md transition-shadow">
            <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                    <div className={cn("p-2.5 rounded-xl", colorClasses[color])}>
                        {icon}
                    </div>
                    {change !== undefined && (
                        <div
                            className={cn(
                                "flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full",
                                change >= 0 ? "bg-green-50 text-green-500" : "bg-red-50 text-red-500"
                            )}
                        >
                            {change >= 0 ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                            {Math.abs(change)}%
                        </div>
                    )}
                </div>
                <div className="text-2xl font-bold">{value}</div>
                <div className="text-sm text-muted-foreground mt-0.5">{title}</div>
                {subtitle && <div className="text-xs text-muted-foreground mt-1">{subtitle}</div>}
            </CardContent>
        </Card>
    )
}
