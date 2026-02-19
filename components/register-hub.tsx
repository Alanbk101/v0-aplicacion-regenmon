"use client"

import { useState, useEffect, useCallback } from "react"
import { cn } from "@/lib/utils"
import {
  registerInHub,
  fetchActivity,
  getSpriteUrl,
  getHubId,
  isRegistered as checkRegistered,
  getHubBalance,
  getOwnerName,
  setOwnerName as saveOwnerName,
  HUB_ID_KEY,
} from "@/hooks/use-hub"
import type { ActivityItem } from "@/hooks/use-hub"
import { Trophy, User, Globe, Loader2, ExternalLink } from "lucide-react"
import Link from "next/link"

interface RegisterHubProps {
  regenmonName: string
  regenmonEmoji: string
  stats: { happiness: number; hunger: number }
  totalPoints: number
  onRegistered?: () => void
}

export function RegisterHub({
  regenmonName,
  regenmonEmoji,
  stats,
  totalPoints,
  onRegistered,
}: RegisterHubProps) {
  const [mounted, setMounted] = useState(false)
  const [registered, setRegistered] = useState(false)
  const [hubId, setHubId] = useState<string | null>(null)
  const [balance, setBalance] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [ownerName, setOwnerName] = useState("")
  const [email, setEmail] = useState("")
  const [activity, setActivity] = useState<ActivityItem[]>([])
  const [activityLoading, setActivityLoading] = useState(false)

  useEffect(() => {
    setMounted(true)
    const reg = checkRegistered()
    const id = getHubId()
    setRegistered(reg)
    setHubId(id)
    setBalance(getHubBalance())
    setOwnerName(getOwnerName())

    if (reg && id) {
      setActivityLoading(true)
      fetchActivity(id)
        .then((res) => setActivity(res.data?.activity ?? []))
        .catch(() => {})
        .finally(() => setActivityLoading(false))
    }
  }, [])

  const handleRegister = useCallback(async () => {
    if (!ownerName.trim()) {
      setError("Escribe tu nombre de dueño/a")
      return
    }

    setLoading(true)
    setError(null)

    try {
      saveOwnerName(ownerName.trim())
      const spriteUrl = getSpriteUrl(regenmonEmoji)
      const appUrl = typeof window !== "undefined" ? window.location.origin : ""

      const res = await registerInHub({
        name: regenmonName,
        ownerName: ownerName.trim(),
        ownerEmail: email.trim() || undefined,
        appUrl,
        sprite: spriteUrl,
      })

      setHubId(res.data.id)
      setBalance(res.data.balance ?? 0)
      setRegistered(true)
      onRegistered?.()

      // Fetch activity after registration
      try {
        const actRes = await fetchActivity(res.data.id)
        setActivity(actRes.data?.activity ?? [])
      } catch {
        // ok
      }
    } catch {
      setError("El HUB esta descansando, intenta despues")
    } finally {
      setLoading(false)
    }
  }, [ownerName, email, regenmonName, regenmonEmoji, onRegistered])

  if (!mounted) return null

  // --- POST-REGISTRATION VIEW ---
  if (registered && hubId) {
    return (
      <div className="flex flex-col gap-5">
        {/* HUB MEMBER badge */}
        <div className="flex flex-col items-center gap-3">
          <div
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-full",
              "bg-[hsl(var(--neon-green)/0.12)] border border-[hsl(120_70%_50%/0.4)]"
            )}
          >
            <Globe className="w-4 h-4 text-[hsl(var(--neon-green))]" />
            <span className="text-xs font-mono font-bold text-[hsl(var(--neon-green))]">
              HUB MEMBER
            </span>
          </div>
          <p className="text-sm font-mono text-foreground text-center">
            {regenmonName}
          </p>
          <p className="text-[10px] font-mono text-muted-foreground">
            Balance: <span className="text-[hsl(var(--neon-yellow))]">{balance} $FRUTA</span>
          </p>
        </div>

        {/* Navigation buttons */}
        <div className="flex flex-col gap-2">
          <Link
            href="/leaderboard"
            className={cn(
              "flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-mono font-bold",
              "bg-[hsl(var(--neon-yellow)/0.1)] text-[hsl(var(--neon-yellow))]",
              "border border-[hsl(50_100%_55%/0.3)] hover:border-[hsl(var(--neon-yellow))]",
              "hover:shadow-[0_0_15px_hsl(50_100%_55%/0.2)] transition-all"
            )}
          >
            <Trophy className="w-4 h-4" />
            Leaderboard
          </Link>
          <Link
            href={`/regenmon/${hubId}`}
            className={cn(
              "flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-mono font-bold",
              "bg-[hsl(var(--neon-cyan)/0.1)] text-[hsl(var(--neon-cyan))]",
              "border border-[hsl(170_100%_50%/0.3)] hover:border-[hsl(var(--neon-cyan))]",
              "hover:shadow-[0_0_15px_hsl(170_100%_50%/0.2)] transition-all"
            )}
          >
            <User className="w-4 h-4" />
            Mi Perfil
          </Link>
        </div>

        {/* Activity feed */}
        <div className="flex flex-col gap-2">
          <h3 className="text-xs font-mono font-bold text-foreground tracking-wider uppercase">
            Actividad Reciente
          </h3>
          {activityLoading ? (
            <div className="flex justify-center py-4">
              <Loader2 className="w-5 h-5 text-muted-foreground animate-spin" />
            </div>
          ) : activity.length === 0 ? (
            <p className="text-[10px] font-mono text-muted-foreground text-center py-4">
              {"Aun no hay actividad. Comparte tu perfil!"}
            </p>
          ) : (
            <div className="flex flex-col gap-1.5 max-h-48 overflow-y-auto">
              {activity.map((item, i) => (
                <div
                  key={i}
                  className="flex items-start gap-2 p-2 rounded-lg bg-secondary/30 border border-border"
                >
                  <span className="text-sm shrink-0">
                    {item.type === "feed_received"
                      ? "\uD83C\uDF4E"
                      : item.type === "gift_received"
                        ? "\uD83C\uDF81"
                        : "\uD83D\uDCE8"}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-mono text-foreground truncate">
                      {item.description}
                    </p>
                    <p className="text-[8px] font-mono text-muted-foreground">
                      {formatTimeAgo(item.createdAt)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    )
  }

  // --- REGISTRATION VIEW ---
  const spriteUrl = getSpriteUrl(regenmonEmoji)

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col items-center gap-1">
        <Globe className="w-6 h-6 text-[hsl(var(--neon-cyan))]" />
        <h3 className="text-sm font-mono font-bold text-foreground">
          Conectar al HUB
        </h3>
        <p className="text-[10px] font-mono text-muted-foreground text-center">
          Registra tu Regenmon en el ranking global
        </p>
      </div>

      {/* Preview card */}
      <div
        className={cn(
          "flex items-center gap-3 p-3 rounded-xl",
          "bg-secondary/40 border border-border"
        )}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={spriteUrl}
          alt={regenmonName}
          className="w-12 h-12"
          crossOrigin="anonymous"
        />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-mono font-bold text-foreground truncate">
            {regenmonName}
          </p>
          <p className="text-[10px] font-mono text-muted-foreground">
            {totalPoints} pts | Felicidad: {stats.happiness}%
          </p>
        </div>
      </div>

      {/* Owner name field */}
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="hub-owner"
          className="text-[10px] font-mono font-bold text-muted-foreground uppercase tracking-wider"
        >
          Tu nombre (requerido)
        </label>
        <input
          id="hub-owner"
          type="text"
          value={ownerName}
          onChange={(e) => setOwnerName(e.target.value)}
          placeholder="Tu nombre"
          maxLength={30}
          className={cn(
            "w-full px-3 py-2 rounded-lg text-sm font-mono",
            "bg-secondary/60 border border-border text-foreground placeholder:text-muted-foreground",
            "focus:outline-none focus:border-[hsl(var(--neon-cyan))] focus:ring-1 focus:ring-[hsl(170_100%_50%/0.3)]"
          )}
        />
      </div>

      {/* Email field (optional) */}
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="hub-email"
          className="text-[10px] font-mono font-bold text-muted-foreground uppercase tracking-wider"
        >
          Email (opcional)
        </label>
        <input
          id="hub-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="tu@email.com"
          className={cn(
            "w-full px-3 py-2 rounded-lg text-sm font-mono",
            "bg-secondary/60 border border-border text-foreground placeholder:text-muted-foreground",
            "focus:outline-none focus:border-[hsl(var(--neon-cyan))] focus:ring-1 focus:ring-[hsl(170_100%_50%/0.3)]"
          )}
        />
      </div>

      {/* Error */}
      {error && (
        <p className="text-xs font-mono text-destructive text-center">{error}</p>
      )}

      {/* Register button */}
      <button
        onClick={handleRegister}
        disabled={loading}
        className={cn(
          "flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-mono font-bold transition-all",
          "bg-[hsl(var(--neon-cyan)/0.15)] text-[hsl(var(--neon-cyan))]",
          "border border-[hsl(170_100%_50%/0.4)] hover:border-[hsl(var(--neon-cyan))]",
          "hover:shadow-[0_0_20px_hsl(170_100%_50%/0.3)]",
          loading && "opacity-50 cursor-not-allowed"
        )}
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <ExternalLink className="w-4 h-4" />
        )}
        {loading ? "Registrando..." : "Registrar en el HUB"}
      </button>
    </div>
  )
}

// --- Helper ---
function formatTimeAgo(dateStr: string): string {
  try {
    const diff = Date.now() - new Date(dateStr).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 1) return "ahora"
    if (mins < 60) return `hace ${mins} min`
    const hours = Math.floor(mins / 60)
    if (hours < 24) return `hace ${hours}h`
    const days = Math.floor(hours / 24)
    return `hace ${days}d`
  } catch {
    return ""
  }
}
