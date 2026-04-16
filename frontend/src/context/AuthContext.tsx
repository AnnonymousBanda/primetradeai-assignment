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

function normalizeRole(role: string | undefined): Role | null {
    if (role === 'USER' || role === 'ADMIN') {
        return role
    }

    return null
}

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<CurrentUser | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const router = useRouter()

    useEffect(() => {
        let cancelled = false

        const delay = (ms: number) =>
            new Promise<void>((resolve) => {
                setTimeout(resolve, ms)
            })

        void (async () => {
            for (let attempt = 0; attempt < 3; attempt += 1) {
                try {
                    const meResponse = await authApi.me({
                        redirectOnUnauthorized: false,
                    })
                    if (!meResponse.success) {
                        throw new Error('Invalid session response')
                    }

                    const currentUser = meResponse.data
                    const role = normalizeRole(currentUser.role)

                    if (!role) {
                        throw new Error('Invalid role in session response')
                    }

                    if (!cancelled) {
                        setUser({
                            id: currentUser.id,
                            email: currentUser.email,
                            role,
                        })
                        setIsLoading(false)
                    }

                    return
                } catch {
                    if (attempt < 2) {
                        await delay(250)
                        continue
                    }

                    if (!cancelled) {
                        setUser(null)
                        setIsLoading(false)
                    }
                }
            }
        })()

        return () => {
            cancelled = true
        }
    }, [])

    const redirectForRole = (role: Role) => {
        router.replace(role === 'ADMIN' ? '/admin/dashboard' : '/dashboard')
    }

    const login = async (email: string, password: string) => {
        const loginResponse = await authApi.login({ email, password })
        if (!loginResponse.success) {
            throw new Error('Login failed')
        }

        const session = loginResponse.data
        const role = normalizeRole(session.role)
        if (!role) {
            throw new Error('Invalid role in login response')
        }

        const userData: CurrentUser = {
            id: session.id,
            email: session.email,
            role,
        }
        setUser(userData)
        redirectForRole(role)
    }

    const register = async (email: string, password: string) => {
        const registerResponse = await authApi.register({ email, password })
        if (!registerResponse.success) {
            throw new Error('Registration failed')
        }

        const session = registerResponse.data
        const role = normalizeRole(session.role)
        if (!role) {
            throw new Error('Invalid role in registration response')
        }

        const userData: CurrentUser = {
            id: session.id,
            email: session.email,
            role,
        }
        setUser(userData)
        redirectForRole(role)
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
