'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { getUserWatchlistSignals, type Signal } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { ArrowDownRight, ArrowUpRight, Eye, AlertCircle } from 'lucide-react'

export default function DashboardPage() {
    const { user, isLoading } = useAuth()
    const router = useRouter()
    const [signals, setSignals] = useState<Signal[]>([])
    const [isSignalsLoading, setIsSignalsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (!isLoading && !user) {
            router.replace('/login')
            return
        }

        if (!isLoading && user && user.role !== 'USER') {
            router.replace(
                user.role === 'ADMIN' ? '/admin/dashboard' : '/dashboard',
            )
        }
    }, [isLoading, router, user])

    useEffect(() => {
        if (isLoading || !user || user.role !== 'USER') {
            return
        }

        let cancelled = false

        const run = async () => {
            setIsSignalsLoading(true)
            setError(null)

            try {
                const response = await getUserWatchlistSignals()
                if (response.success && !cancelled) {
                    setSignals(response.data)
                }
            } catch (e) {
                if (!cancelled) {
                    setError(
                        e instanceof Error
                            ? e.message
                            : 'Failed to load watchlist signals',
                    )
                }
            } finally {
                if (!cancelled) {
                    setIsSignalsLoading(false)
                }
            }
        }

        void run()

        return () => {
            cancelled = true
        }
    }, [isLoading, user])

    if (isLoading || !user || user.role !== 'USER') {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
        )
    }

    if (isSignalsLoading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <h1 className="mb-6 text-3xl font-bold text-foreground">
                    Dashboard
                </h1>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <Skeleton key={i} className="h-44 rounded-xl" />
                    ))}
                </div>
            </div>
        )
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-foreground">
                    Dashboard
                </h1>
                <p className="text-muted-foreground">
                    Watchlist-matched active signals
                </p>
            </div>

            {error ? (
                <Card className="border-destructive/20 bg-destructive/5">
                    <CardContent className="flex items-center gap-3 py-8">
                        <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0" />
                        <p className="text-sm text-destructive">{error}</p>
                    </CardContent>
                </Card>
            ) : signals.length === 0 ? (
                <Card className="border-border/50">
                    <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                        <div className="mb-4 rounded-full bg-primary/10 p-4">
                            <Eye className="h-8 w-8 text-primary" />
                        </div>
                        <h2 className="mb-2 text-lg font-semibold text-foreground">
                            No Active Signals
                        </h2>
                        <p className="mb-6 max-w-sm text-sm text-muted-foreground">
                            Your watchlist doesn't have any active signals yet.
                            Start by adding assets to your watchlist to see
                            matching signals here.
                        </p>
                        <Button onClick={() => router.push('/watchlist')}>
                            <Eye className="mr-2 h-4 w-4" />
                            Go to Watchlist
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {signals.map((signal) => (
                        <Card key={signal.id}>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-lg">
                                    {signal.asset}
                                </CardTitle>
                                <Badge
                                    className={
                                        signal.action === 'LONG'
                                            ? 'bg-long/15 text-long border-long/30'
                                            : 'bg-short/15 text-short border-short/30'
                                    }
                                >
                                    {signal.action === 'LONG' ? (
                                        <ArrowUpRight className="mr-1 h-3 w-3" />
                                    ) : (
                                        <ArrowDownRight className="mr-1 h-3 w-3" />
                                    )}
                                    {signal.action}
                                </Badge>
                            </CardHeader>
                            <CardContent className="grid grid-cols-3 gap-2 text-sm">
                                <div>
                                    <p className="text-muted-foreground">
                                        Entry
                                    </p>
                                    <p className="font-mono font-medium">
                                        ${signal.entryPrice}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground">
                                        Target
                                    </p>
                                    <p className="font-mono font-medium text-long">
                                        ${signal.targetPrice}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground">
                                        Stop Loss
                                    </p>
                                    <p className="font-mono font-medium text-short">
                                        ${signal.stopLoss}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}
