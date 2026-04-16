'use client'

import { ReactNode, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'

interface ProtectedRouteProps {
    children: ReactNode
    requiredRole?: 'USER' | 'ADMIN'
}

export function ProtectedRoute({
    children,
    requiredRole,
}: ProtectedRouteProps) {
    const { user, isLoading } = useAuth()
    const router = useRouter()

    useEffect(() => {
        if (!isLoading && !user) {
            router.replace('/login')
            return
        }

        if (!isLoading && user && requiredRole && user.role !== requiredRole) {
            router.replace('/login')
        }
    }, [isLoading, requiredRole, router, user])

    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
        )
    }

    if (!user) {
        return null
    }

    if (requiredRole && user.role !== requiredRole) {
        return null
    }

    return <>{children}</>
}
