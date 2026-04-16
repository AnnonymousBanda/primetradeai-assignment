'use client'

import { useEffect, useState } from 'react'
import { apiFetch } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import { ArrowUpRight, ArrowDownRight, Target, ShieldAlert } from 'lucide-react'

interface Signal {
    id: string
    asset: string
    action: 'LONG' | 'SHORT'
    entryPrice: number
    targetPrice: number
    stopLoss: number
    status: string
    createdAt: string
}

interface WatchlistItem {
    id: string
    asset: string
}

export default function Dashboard() {
    const [signals, setSignals] = useState<Signal[]>([])
    const [watchlist, setWatchlist] = useState<WatchlistItem[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [signalsData, watchlistData] = await Promise.all([
                    apiFetch<Signal[]>('/signal?status=ACTIVE'),
                    apiFetch<WatchlistItem[]>('/watchlist'),
                ])
                setSignals(signalsData)
                setWatchlist(watchlistData)
            } catch (err: unknown) {
                toast.error(
                    err instanceof Error ? err.message : 'Failed to load data',
                )
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [])

    const watchlistAssets = new Set(watchlist.map((w) => w.asset))
    const filteredSignals = signals.filter((s) => watchlistAssets.has(s.asset))

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <h1 className="mb-6 text-3xl font-bold text-foreground">
                    Dashboard
                </h1>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <Skeleton key={i} className="h-48 rounded-xl" />
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
                    Showing {filteredSignals.length} signals matching your
                    watchlist
                </p>
            </div>

            {filteredSignals.length === 0 ? (
                <Card className="border-border/50 bg-card">
                    <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                        <ShieldAlert className="mb-4 h-12 w-12 text-muted-foreground" />
                        <p className="text-lg font-medium text-foreground">
                            No matching signals
                        </p>
                        <p className="text-sm text-muted-foreground">
                            Add assets to your watchlist to see relevant signals
                            here.
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {filteredSignals.map((signal) => (
                        <SignalCard key={signal.id} signal={signal} />
                    ))}
                </div>
            )}
        </div>
    )
}

function SignalCard({ signal }: { signal: Signal }) {
    const isLong = signal.action === 'LONG'

    return (
        <Card className="border-border/50 bg-card transition-colors hover:border-primary/20">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg font-semibold">
                    {signal.asset}
                </CardTitle>
                <Badge
                    className={
                        isLong
                            ? 'bg-long/15 text-long border-long/30'
                            : 'bg-short/15 text-short border-short/30'
                    }
                >
                    {isLong ? (
                        <ArrowUpRight className="mr-1 h-3 w-3" />
                    ) : (
                        <ArrowDownRight className="mr-1 h-3 w-3" />
                    )}
                    {signal.action}
                </Badge>
            </CardHeader>
            <CardContent className="space-y-3">
                <div className="grid grid-cols-3 gap-2 text-sm">
                    <div>
                        <p className="text-muted-foreground">Entry</p>
                        <p className="font-mono font-medium text-foreground">
                            ${signal.entryPrice}
                        </p>
                    </div>
                    <div>
                        <p className="text-muted-foreground">Target</p>
                        <p className="font-mono font-medium text-long">
                            <Target className="mr-1 inline h-3 w-3" />$
                            {signal.targetPrice}
                        </p>
                    </div>
                    <div>
                        <p className="text-muted-foreground">Stop Loss</p>
                        <p className="font-mono font-medium text-short">
                            ${signal.stopLoss}
                        </p>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
