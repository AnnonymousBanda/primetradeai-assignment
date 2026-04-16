import Link from 'next/link'
import type { ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { Activity, ArrowRight, BarChart3, Shield, Zap } from 'lucide-react'

export default function Home() {
    return (
        <div className="flex min-h-[calc(100vh-4rem)] flex-col">
            <section className="flex flex-1 flex-col items-center justify-center px-4 text-center">
                <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm text-primary">
                    <Zap className="h-3.5 w-3.5" />
                    Real-time Crypto Intelligence
                </div>

                <h1 className="mb-4 max-w-3xl text-5xl font-bold leading-tight tracking-tight text-foreground md:text-7xl">
                    Trade Smarter with
                    <span className="text-primary"> AI Signals</span>
                </h1>

                <p className="mb-8 max-w-xl text-lg text-muted-foreground">
                    Get institutional-grade crypto trading signals, manage your
                    watchlist, and stay ahead of the market with our
                    intelligence platform.
                </p>

                <div className="flex gap-4">
                    <Button size="lg" className="glow-primary" asChild>
                        <Link href="/register">
                            Get Started
                            <ArrowRight className="ml-1 h-4 w-4" />
                        </Link>
                    </Button>
                    <Button size="lg" variant="outline" asChild>
                        <Link href="/login">Sign In</Link>
                    </Button>
                </div>
            </section>

            <section className="border-t border-border/50 bg-card/50 px-4 py-16">
                <div className="container mx-auto grid gap-8 md:grid-cols-3">
                    <FeatureCard
                        icon={<Activity className="h-6 w-6 text-primary" />}
                        title="Live Signals"
                        description="Receive real-time LONG and SHORT signals with entry, target, and stop-loss prices."
                    />
                    <FeatureCard
                        icon={<BarChart3 className="h-6 w-6 text-primary" />}
                        title="Personal Watchlist"
                        description="Track only the assets you care about. Signals are filtered to your watchlist."
                    />
                    <FeatureCard
                        icon={<Shield className="h-6 w-6 text-primary" />}
                        title="Secure & Fast"
                        description="JWT-authenticated, role-based access with a blazing fast API backend."
                    />
                </div>
            </section>
        </div>
    )
}

function FeatureCard({
    icon,
    title,
    description,
}: {
    icon: ReactNode
    title: string
    description: string
}) {
    return (
        <div className="rounded-xl border border-border/50 bg-card p-6 transition-colors hover:border-primary/30">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                {icon}
            </div>
            <h3 className="mb-2 text-lg font-semibold text-foreground">
                {title}
            </h3>
            <p className="text-sm text-muted-foreground">{description}</p>
        </div>
    )
}
