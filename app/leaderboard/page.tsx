"use client"

import { useState, useEffect, useCallback } from "react"
import { cn } from "@/lib/utils"
import { fetchLeaderboard } from "@/hooks/use-hub"
import type { LeaderboardEntry } from "@/hooks/use-hub"
import { ArrowLeft, ChevronLeft, ChevronRight, Loader2, Trophy } from "lucide-react"
import Link from "next/link"

export default function LeaderboardPage() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadPage = useCallback(async (p: number) => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetchLeaderboard(p, 10)
      setEntries(res.data ?? [])
      setTotalPages(res.pagination?.totalPages ?? 1)
      setPage(p)
    } catch {
      setError("El HUB esta descansando, intenta despues")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadPage(1)
  }, [loadPage])

  function getRankDisplay(rank: number) {
    if (rank === 1) return "\uD83E\uDD47"
    if (rank === 2) return "\uD83E\uDD48"
    if (rank === 3) return "\uD83E\uDD49"
    return `#${rank}`
  }

  function getStageName(stage: number) {
    if (stage >= 3) return "Adulto"
    if (stage >= 2) return "Joven"
    return "Bebe"
  }

  return (
    <main className="min-h-screen flex flex-col items-center px-4 py-8">
      {/* Background grid */}
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(hsl(170 100% 50%) 1px, transparent 1px),
            linear-gradient(90deg, hsl(170 100% 50%) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
        }}
      />

      <div className="relative z-10 w-full max-w-lg flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className={cn(
              "flex items-center justify-center w-9 h-9 rounded-xl",
              "text-muted-foreground hover:text-foreground",
              "border border-border hover:border-[hsl(var(--neon-cyan))] transition-all"
            )}
            aria-label="Volver"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-[hsl(var(--neon-yellow))]" />
            <h1 className="text-xl font-mono font-bold text-foreground">Leaderboard</h1>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-8 h-8 text-[hsl(var(--neon-cyan))] animate-spin" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center gap-3 py-16">
            <p className="text-sm font-mono text-muted-foreground text-center">{error}</p>
            <button
              onClick={() => loadPage(page)}
              className={cn(
                "px-4 py-2 rounded-xl text-xs font-mono font-bold",
                "text-[hsl(var(--neon-cyan))] border border-[hsl(170_100%_50%/0.3)]",
                "hover:border-[hsl(var(--neon-cyan))] transition-all"
              )}
            >
              Reintentar
            </button>
          </div>
        ) : entries.length === 0 ? (
          <p className="text-sm font-mono text-muted-foreground text-center py-16">
            No hay Regenmons registrados aun.
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {entries.map((entry) => (
              <Link
                key={entry.id}
                href={`/regenmon/${entry.id}`}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-xl transition-all",
                  "bg-card border border-border hover:border-[hsl(var(--neon-cyan)/0.4)]",
                  "hover:shadow-[0_0_12px_hsl(170_100%_50%/0.1)]",
                  entry.rank <= 3 && "border-[hsl(50_100%_55%/0.2)]"
                )}
              >
                {/* Rank */}
                <div className="w-10 text-center shrink-0">
                  <span
                    className={cn(
                      "font-mono font-bold",
                      entry.rank <= 3 ? "text-lg" : "text-xs text-muted-foreground"
                    )}
                  >
                    {getRankDisplay(entry.rank)}
                  </span>
                </div>

                {/* Sprite */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={entry.sprite}
                  alt={entry.name}
                  className="w-10 h-10 shrink-0"
                  crossOrigin="anonymous"
                />

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-mono font-bold text-foreground truncate">
                    {entry.name}
                  </p>
                  <p className="text-[10px] font-mono text-muted-foreground truncate">
                    {entry.ownerName} | {getStageName(entry.stage)}
                  </p>
                </div>

                {/* Stats */}
                <div className="flex flex-col items-end gap-0.5 shrink-0">
                  <span className="text-xs font-mono font-bold text-[hsl(var(--neon-yellow))]">
                    {entry.totalPoints} pts
                  </span>
                  <span className="text-[10px] font-mono text-muted-foreground">
                    {entry.balance} $FRUTA
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Pagination */}
        {!loading && !error && totalPages > 1 && (
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => loadPage(page - 1)}
              disabled={page <= 1}
              className={cn(
                "flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-mono font-bold transition-all",
                "border border-border",
                page <= 1
                  ? "text-muted-foreground/40 cursor-not-allowed"
                  : "text-foreground hover:border-[hsl(var(--neon-cyan))]"
              )}
            >
              <ChevronLeft className="w-4 h-4" />
              Anterior
            </button>
            <span className="text-xs font-mono text-muted-foreground">
              {page} / {totalPages}
            </span>
            <button
              onClick={() => loadPage(page + 1)}
              disabled={page >= totalPages}
              className={cn(
                "flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-mono font-bold transition-all",
                "border border-border",
                page >= totalPages
                  ? "text-muted-foreground/40 cursor-not-allowed"
                  : "text-foreground hover:border-[hsl(var(--neon-cyan))]"
              )}
            >
              Siguiente
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </main>
  )
}
