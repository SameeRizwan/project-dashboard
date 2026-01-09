"use client"

import { createContext, useContext, useEffect, useState } from "react"
import {
    User,
    GoogleAuthProvider,
    signInWithPopup,
    signOut,
    onAuthStateChanged
} from "firebase/auth"
import { auth } from "@/lib/firebase"
import { useRouter, usePathname } from "next/navigation"
import { toast } from "sonner"

interface AuthContextType {
    user: User | null
    loading: boolean
    signInWithGoogle: () => Promise<void>
    logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType)

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)
    const router = useRouter()
    const pathname = usePathname()

    const WHITELISTED_EMAIL = "sameerizwan3@gmail.com"

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            setLoading(true)

            if (currentUser) {
                if (currentUser.email === WHITELISTED_EMAIL) {
                    setUser(currentUser)
                    if (pathname === "/login") {
                        router.push("/")
                    }
                } else {
                    await signOut(auth)
                    setUser(null)
                    toast.error("Access Denied: Email not authorized.")
                    router.push("/login")
                }
            } else {
                setUser(null)
                if (pathname !== "/login") {
                    router.push("/login")
                }
            }

            setLoading(false)
        })

        return () => unsubscribe()
    }, [pathname, router])

    const signInWithGoogle = async () => {
        try {
            const provider = new GoogleAuthProvider()
            await signInWithPopup(auth, provider)
        } catch (error) {
            console.error("Error signing in with Google", error)
            toast.error("Error signing in with Google")
        }
    }

    const logout = async () => {
        try {
            await signOut(auth)
            router.push("/login")
        } catch (error) {
            console.error("Error signing out", error)
        }
    }

    return (
        <AuthContext.Provider value={{ user, loading, signInWithGoogle, logout }}>
            {!loading && children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => useContext(AuthContext)
