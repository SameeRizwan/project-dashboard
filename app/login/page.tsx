"use client"

import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { GoogleLogo } from "@phosphor-icons/react"

export default function LoginPage() {
    const { signInWithGoogle } = useAuth()

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
            <Card className="w-full max-w-md shadow-lg">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
                    <CardDescription>
                        Sign in to access your project dashboard
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                    <Button
                        onClick={signInWithGoogle}
                        className="w-full flex items-center justify-center gap-2"
                        size="lg"
                    >
                        <GoogleLogo size={24} weight="bold" />
                        Sign in with Google
                    </Button>
                    <p className="text-center text-xs text-muted-foreground mt-4">
                        Restricted access: Only authorized personnel can sign in.
                    </p>
                </CardContent>
            </Card>
        </div>
    )
}
