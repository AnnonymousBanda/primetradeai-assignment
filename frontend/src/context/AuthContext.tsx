'use client'

import {
    createContext,
    useContext,
    useState,
    useEffect,
    type ReactNode,
} from 'react'
import { useRouter } from 'next/navigation'

interface User {
    id: string
    email: string
    role: 'USER' | 'ADMIN'
}

interface AuthContextType {
    user: User | null
    token: string | null
    login: (email: string, password: string) => Promise<void>
    register: (email: string, password: string) => Promise<void>
    logout: () => void
    isLoading: boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [token, setToken] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const router = useRouter()

    useEffect(() => {
        try {
            const savedToken = localStorage.getItem('token')
            const savedUser = localStorage.getItem('user')
            if (savedToken && savedUser) {
                setToken(savedToken)
                setUser(JSON.parse(savedUser))
            }
        } catch {
            localStorage.removeItem('token')
            localStorage.removeItem('user')
        }
        setIsLoading(false)
    }, [])

    const handleAuthResponse = (data: {
        token: string
        id: string
        email: string
        role: 'USER' | 'ADMIN'
    }) => {
        const userData: User = {
            id: data.id,
            email: data.email,
            role: data.role,
        }
        setToken(data.token)
        setUser(userData)
        localStorage.setItem('token', data.token)
        localStorage.setItem('user', JSON.stringify(userData))

        if (data.role === 'ADMIN') {
            router.replace('/admin/dashboard')
        } else {
            router.replace('/dashboard')
        }
    }

    const login = async (email: string, password: string) => {
        const res = await fetch('http://localhost:8000/api/v1/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        })
        const json = await res.json()
        if (!json.success)
            throw new Error(json.error?.message || 'Login failed')
        handleAuthResponse(json.data)
    }

    const register = async (email: string, password: string) => {
        const res = await fetch('http://localhost:8000/api/v1/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        })
        const json = await res.json()
        if (!json.success)
            throw new Error(json.error?.message || 'Registration failed')
        handleAuthResponse(json.data)
    }

    const logout = () => {
        setToken(null)
        setUser(null)
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        router.replace('/login')
    }

    return (
        <AuthContext.Provider
            value={{ user, token, login, register, logout, isLoading }}
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
