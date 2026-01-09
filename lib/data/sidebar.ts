export type NavItemId = "inbox" | "my-tasks" | "projects" | "clients" | "performance" | "calendar" | "time-tracking" | "reports"

export type SidebarFooterItemId = "settings" | "templates" | "help"

export type NavItem = {
    id: NavItemId
    label: string
    href: string
    badge?: number
}

export type ActiveProjectSummary = {
    id: string
    name: string
    color: string
    progress: number
}

export type SidebarFooterItem = {
    id: SidebarFooterItemId
    label: string
    href: string
}

export const navItems: NavItem[] = [
    { id: "inbox", label: "Inbox", href: "/inbox" },
    { id: "my-tasks", label: "My Tasks", href: "/my-tasks" },
    { id: "projects", label: "Projects", href: "/" },
    { id: "clients", label: "Clients", href: "/clients" },
    { id: "calendar", label: "Calendar", href: "/calendar" },
    { id: "time-tracking", label: "Time Tracking", href: "/time-tracking" },
    { id: "performance", label: "Performance", href: "/performance" },
    { id: "reports", label: "Reports", href: "/reports" },
]

export const activeProjects: ActiveProjectSummary[] = [
    { id: "ai-learning", name: "AI Learning Platform", color: "var(--chart-5)", progress: 25 },
    { id: "fintech-app", name: "Fintech Mobile App", color: "var(--chart-3)", progress: 80 },
    { id: "ecommerce-admin", name: "E-commerce Admin", color: "var(--chart-3)", progress: 65 },
    { id: "healthcare-app", name: "Healthcare Booking App", color: "var(--chart-2)", progress: 10 },
]

export const footerItems: SidebarFooterItem[] = [
    { id: "settings", label: "Settings", href: "/settings" },
    { id: "templates", label: "Templates", href: "/templates" },
    { id: "help", label: "Help", href: "/help" },
]
