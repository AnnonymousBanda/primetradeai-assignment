'use client'

import { useEffect, useState, type FormEvent } from 'react'
import { apiFetch } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { toast } from 'sonner'
import {
    ArrowUpRight,
    ArrowDownRight,
    Plus,
    X,
    CheckCircle,
    Trash2,
} from 'lucide-react'

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

export default function AdminDashboard() {
    const [signals, setSignals] = useState<Signal[]>([])
    const [loading, setLoading] = useState(true)
    const [dialogOpen, setDialogOpen] = useState(false)

    const [asset, setAsset] = useState('')
    const [action, setAction] = useState<'LONG' | 'SHORT'>('LONG')
    const [entryPrice, setEntryPrice] = useState('')
    const [targetPrice, setTargetPrice] = useState('')
    const [stopLoss, setStopLoss] = useState('')
    const [creating, setCreating] = useState(false)

    const fetchSignals = async () => {
        try {
            const data = await apiFetch<Signal[]>('/signal?status=ACTIVE')
            setSignals(data)
        } catch (err: unknown) {
            toast.error(
                err instanceof Error ? err.message : 'Failed to load signals',
            )
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchSignals()
    }, [])

    const handleCreate = async (e: FormEvent) => {
        e.preventDefault()
        setCreating(true)
        try {
            await apiFetch('/signal', {
                method: 'POST',
                body: JSON.stringify({
                    asset: asset.trim().toUpperCase(),
                    action,
                    entryPrice: parseFloat(entryPrice),
                    targetPrice: parseFloat(targetPrice),
                    stopLoss: parseFloat(stopLoss),
                }),
            })
            toast.success('Signal created')
            setDialogOpen(false)
            resetForm()
            await fetchSignals()
        } catch (err: unknown) {
            toast.error(
                err instanceof Error ? err.message : 'Failed to create signal',
            )
        } finally {
            setCreating(false)
        }
    }

    const handleClose = async (id: string) => {
        try {
            await apiFetch(`/signal/${id}`, {
                method: 'PUT',
                body: JSON.stringify({ status: 'CLOSED' }),
            })
            toast.success('Signal closed')
            await fetchSignals()
        } catch (err: unknown) {
            toast.error(
                err instanceof Error ? err.message : 'Failed to close signal',
            )
        }
    }

    const handleDelete = async (id: string) => {
        try {
            await apiFetch(`/signal/${id}`, { method: 'DELETE' })
            toast.success('Signal deleted')
            setSignals((prev) => prev.filter((s) => s.id !== id))
        } catch (err: unknown) {
            toast.error(
                err instanceof Error ? err.message : 'Failed to delete signal',
            )
        }
    }

    const resetForm = () => {
        setAsset('')
        setAction('LONG')
        setEntryPrice('')
        setTargetPrice('')
        setStopLoss('')
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">
                        Admin Dashboard
                    </h1>
                    <p className="text-muted-foreground">
                        {signals.length} active signals
                    </p>
                </div>
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-1 h-4 w-4" />
                            Create Signal
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="border-border/50 bg-card">
                        <DialogHeader>
                            <DialogTitle>Create New Signal</DialogTitle>
                            <DialogDescription>
                                Fill in the signal details below.
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleCreate} className="space-y-4">
                            <div className="space-y-2">
                                <Label>Asset</Label>
                                <Input
                                    placeholder="e.g. BTC/USDT"
                                    value={asset}
                                    onChange={(e) => setAsset(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Action</Label>
                                <Select
                                    value={action}
                                    onValueChange={(v) =>
                                        setAction(v as 'LONG' | 'SHORT')
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="LONG">
                                            LONG
                                        </SelectItem>
                                        <SelectItem value="SHORT">
                                            SHORT
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid grid-cols-3 gap-3">
                                <div className="space-y-2">
                                    <Label>Entry Price</Label>
                                    <Input
                                        type="number"
                                        step="any"
                                        value={entryPrice}
                                        onChange={(e) =>
                                            setEntryPrice(e.target.value)
                                        }
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Target Price</Label>
                                    <Input
                                        type="number"
                                        step="any"
                                        value={targetPrice}
                                        onChange={(e) =>
                                            setTargetPrice(e.target.value)
                                        }
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Stop Loss</Label>
                                    <Input
                                        type="number"
                                        step="any"
                                        value={stopLoss}
                                        onChange={(e) =>
                                            setStopLoss(e.target.value)
                                        }
                                        required
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setDialogOpen(false)}
                                >
                                    <X className="mr-1 h-4 w-4" />
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={creating}>
                                    {creating ? 'Creating...' : 'Create Signal'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {loading ? (
                <div className="space-y-3">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <Skeleton key={i} className="h-14 rounded-lg" />
                    ))}
                </div>
            ) : (
                <div className="rounded-lg border border-border/50">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Asset</TableHead>
                                <TableHead>Action</TableHead>
                                <TableHead>Entry</TableHead>
                                <TableHead>Target</TableHead>
                                <TableHead>Stop Loss</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">
                                    Actions
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {signals.map((signal) => {
                                const isLong = signal.action === 'LONG'
                                return (
                                    <TableRow key={signal.id}>
                                        <TableCell className="font-mono font-medium">
                                            {signal.asset}
                                        </TableCell>
                                        <TableCell>
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
                                        </TableCell>
                                        <TableCell className="font-mono">
                                            ${signal.entryPrice}
                                        </TableCell>
                                        <TableCell className="font-mono text-long">
                                            ${signal.targetPrice}
                                        </TableCell>
                                        <TableCell className="font-mono text-short">
                                            ${signal.stopLoss}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline">
                                                {signal.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() =>
                                                        handleClose(signal.id)
                                                    }
                                                    title="Close signal"
                                                >
                                                    <CheckCircle className="h-4 w-4 text-primary" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() =>
                                                        handleDelete(signal.id)
                                                    }
                                                    title="Delete signal"
                                                >
                                                    <Trash2 className="h-4 w-4 text-destructive" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )
                            })}
                        </TableBody>
                    </Table>
                </div>
            )}
        </div>
    )
}
