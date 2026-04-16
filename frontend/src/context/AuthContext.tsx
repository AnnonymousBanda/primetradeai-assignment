'use client'

import {
    createContext,
    useContext,
    useState,
    useEffect,
    type ReactNode,
} from 'react'
import { useRouter } from 'next/navigation'
import { authApi, type CurrentUser, type Role } from '@/lib/api'

interface AuthContextType {
    user: CurrentUser | null
    login: (email: string, password: string) => Promise<void>
    register: (email: string, password: string) => Promise<void>
    logout: () => Promise<void>
    isLoading: boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<CurrentUser | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const router = useRouter()

    useEffect(() => {
        void (async () => {
            try {
                const currentUser = await authApi.me({
                    redirectOnUnauthorized: false,
                })
                setUser({
                    id: currentUser.id,
                    email: currentUser.email,
                    role: currentUser.role,
                })
            } catch {
                setUser(null)
            } finally {
                setIsLoading(false)
            }
        })()
    }, [])

    const redirectForRole = (role: Role) => {
        router.replace(role === 'ADMIN' ? '/admin/dashboard' : '/dashboard')
    }

    const login = async (email: string, password: string) => {
        const session = await authApi.login({ email, password })
        const userData: CurrentUser = {
            id: session.data.id,
            email: session.data.email,
            role: session.data.role,
        }
        setUser(userData)
        redirectForRole(session.data.role)
    }

    const register = async (email: string, password: string) => {
        const session = await authApi.register({ email, password })
        const userData: CurrentUser = {
            id: session.data.id,
            email: session.data.email,
            role: session.data.role,
        }
        setUser(userData)
        redirectForRole(session.data.role)
    }

    const logout = async () => {
        await authApi.logout()
        setUser(null)
        router.replace('/login')
    }

    return (
        <AuthContext.Provider
            value={{ user, login, register, logout, isLoading }}
        >
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const ctx = useContext(AuthContext)
    if (!ctx) throw new Error('useAuth must be used within AuthProvider')
    return ctx
}
