"use client"

import { Suspense } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"

interface SharedLayoutProps {
    children: React.ReactNode
}

export function SharedLayout({ children }: SharedLayoutProps) {
    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
                <Suspense fallback={null}>
                    {children}
                </Suspense>
            </SidebarInset>
        </SidebarProvider>
    )
}
