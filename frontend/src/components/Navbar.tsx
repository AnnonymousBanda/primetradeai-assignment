'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/button'
import {
    Activity,
    Eye,
    LayoutDashboard,
    LogOut,
    UserPlus,
    LogIn,
} from 'lucide-react'

export function Navbar() {
    const { user, logout, isLoading } = useAuth()
    const pathname = usePathname()

    const isActive = (path: string) => pathname === path

    if (isLoading) {
        return (
            <nav className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
                <div className="container mx-auto flex h-16 items-center justify-between px-4" />
            </nav>
        )
    }

    return (
        <nav className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
            <div className="container mx-auto flex h-16 items-center justify-between px-4">
                <Link href="/" className="flex items-center gap-2">
                    <Activity className="h-6 w-6 text-primary" />
                    <span className="text-lg font-bold text-foreground">
                        CryptoIntel
                    </span>
                </Link>

                <div className="flex items-center gap-2">
                    {!user && (
                        <>
                            <Button
                                variant={
                                    isActive('/login') ? 'default' : 'ghost'
                                }
                                size="sm"
                                asChild
                            >
                                <Link href="/login">
                                    <LogIn className="mr-1 h-4 w-4" />
                                    Login
                                </Link>
                            </Button>
                            <Button
                                variant={
                                    isActive('/register') ? 'default' : 'ghost'
                                }
                                size="sm"
                                asChild
                            >
                                <Link href="/register">
                                    <UserPlus className="mr-1 h-4 w-4" />
                                    Register
                                </Link>
                            </Button>
                        </>
                    )}

                    {user?.role === 'USER' && (
                        <>
                            <Button
                                variant={
                                    isActive('/dashboard')
                                        ? 'secondary'
                                        : 'ghost'
                                }
                                size="sm"
                                asChild
                            >
                                <Link href="/dashboard">
                                    <LayoutDashboard className="mr-1 h-4 w-4" />
                                    Dashboard
                                </Link>
                            </Button>
                            <Button
                                variant={
                                    isActive('/watchlist')
                                        ? 'secondary'
                                        : 'ghost'
                                }
                                size="sm"
                                asChild
                            >
                                <Link href="/watchlist">
                                    <Eye className="mr-1 h-4 w-4" />
                                    Watchlist
                                </Link>
                            </Button>
                        </>
                    )}

                    {user?.role === 'ADMIN' && (
                        <Button
                            variant={
                                isActive('/admin/dashboard')
                                    ? 'secondary'
                                    : 'ghost'
                            }
                            size="sm"
                            asChild
                        >
                            <Link href="/admin/dashboard">
                                <LayoutDashboard className="mr-1 h-4 w-4" />
                                Admin
                            </Link>
                        </Button>
                    )}

                    {user && (
                        <Button variant="ghost" size="sm" onClick={logout}>
                            <LogOut className="mr-1 h-4 w-4" />
                            Logout
                        </Button>
                    )}
                </div>
            </div>
        </nav>
    )
}
