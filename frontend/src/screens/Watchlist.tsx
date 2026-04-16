"use client";

import { useEffect, useState, type FormEvent } from "react";
import { apiFetch } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Eye, Plus, Trash2 } from "lucide-react";

interface WatchlistItem {
  id: string;
  asset: string;
}

export default function Watchlist() {
  const [items, setItems] = useState<WatchlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [asset, setAsset] = useState("");
  const [adding, setAdding] = useState(false);

  const fetchWatchlist = async () => {
    try {
      const data = await apiFetch<WatchlistItem[]>("/watchlist");
      setItems(data);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to load watchlist");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWatchlist();
  }, []);

  const handleAdd = async (e: FormEvent) => {
    e.preventDefault();
    if (!asset.trim()) return;
    setAdding(true);
    try {
      await apiFetch("/watchlist", {
        method: "POST",
        body: JSON.stringify({ asset: asset.trim().toUpperCase() }),
      });
      toast.success(`${asset.trim().toUpperCase()} added to watchlist`);
      setAsset("");
      await fetchWatchlist();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to add asset");
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    try {
      await apiFetch(`/watchlist/${id}`, { method: "DELETE" });
      toast.success(`${name} removed from watchlist`);
      setItems((prev) => prev.filter((i) => i.id !== id));
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to remove asset");
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="flex items-center gap-2 text-3xl font-bold text-foreground">
          <Eye className="h-7 w-7 text-primary" />
          Watchlist
        </h1>
        <p className="text-muted-foreground">Manage the assets you want to track</p>
      </div>

      <Card className="mb-6 border-border/50 bg-card">
        <CardHeader>
          <CardTitle className="text-base">Add Asset</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAdd} className="flex gap-3">
            <Input
              placeholder="e.g. BTC/USDT"
              value={asset}
              onChange={(e) => setAsset(e.target.value)}
              className="max-w-xs"
            />
            <Button type="submit" disabled={adding}>
              <Plus className="mr-1 h-4 w-4" />
              {adding ? "Adding..." : "Add"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-14 rounded-lg" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <Card className="border-border/50 bg-card">
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Your watchlist is empty. Add an asset above to get started.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between rounded-lg border border-border/50 bg-card px-4 py-3"
            >
              <span className="font-mono font-medium text-foreground">{item.asset}</span>
              <Button variant="ghost" size="sm" onClick={() => handleDelete(item.id, item.asset)}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}