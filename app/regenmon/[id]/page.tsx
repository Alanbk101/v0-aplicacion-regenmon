"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { cn } from "@/lib/utils"
import { fetchProfile, getHubId } from "@/hooks/use-hub"
import type { RegenmonProfile } from "@/hooks/use-hub"
import { SocialActions } from "@/components/social-actions"
import { ArrowLeft, Loader2, Eye, Calendar } from "lucide-react"
import Link from "next/link"

function getStageName(stage: number) {
  if (stage >= 3) return "Adulto"
  if (stage >= 2) return "Joven"
  return "Bebe"
}

function getStageEmoji(stage: number) {
  if (stage >= 3) return "\uD83D\uDC09"
  if (stage >= 2) return "\uD83D\uDC23"
  return "\uD83E\uDD5A"
}

function StatBarSimple({
  label,
  value,
  color,
}: {
  label: string
  value: number
  color: string
}) {
  const colorMap: Record<string, string> = {
    cyan: "hsl(var(--neon-cyan))",
    pink: "hsl(var(--neon-pink))",
    yellow: "hsl(var(--neon-yellow))",
    green: "hsl(var(--neon-green))",
  }
  const barColor = colorMap[color] ?? colorMap.cyan

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-mono text-muted-foreground">{label}</span>
        <span className="text-[10px] font-mono text-foreground">{value}%</span>
      </div>
      <div className="h-2 rounded-full bg-secondary/60 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${Math.max(0, Math.min(100, value))}%`, backgroundColor: barColor }}
        />
      </div>
    </div>
  )
}

function formatDate(dateStr: string): string {
  try {
    return new Intl.DateTimeFormat("es", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(new Date(dateStr))
  } catch {
    return dateStr
  }
}

export default function RegenmonProfilePage() {
  const params = useParams()
  const id = params.id as string

  const [profile, setProfile] = useState<RegenmonProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isMyProfile, setIsMyProfile] = useState(false)

  useEffect(() => {
    const myId = getHubId()
    setIsMyProfile(myId === id)

    fetchProfile(id)
      .then((res) => setProfile(res.data))
      .catch(() => setError("El HUB esta descansando, intenta despues"))
      .finally(() => setLoading(false))
  }, [id])

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

      <div className="relative z-10 w-full max-w-md flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Link
            href="/leaderboard"
            className={cn(
              "flex items-center justify-center w-9 h-9 rounded-xl",
              "text-muted-foreground hover:text-foreground",
              "border border-border hover:border-[hsl(var(--neon-cyan))] transition-all"
            )}
            aria-label="Volver al leaderboard"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <h1 className="text-lg font-mono font-bold text-foreground">Perfil</h1>
          {isMyProfile && (
            <span className="ml-auto text-[10px] font-mono text-[hsl(var(--neon-green))] bg-[hsl(var(--neon-green)/0.1)] px-2 py-0.5 rounded-full border border-[hsl(120_70%_50%/0.3)]">
              Tu Perfil
            </span>
          )}
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex justify-center py-16">
            <Loader2 className="w-8 h-8 text-[hsl(var(--neon-cyan))] animate-spin" />
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="flex flex-col items-center gap-3 py-16">
            <p className="text-sm font-mono text-muted-foreground text-center">{error}</p>
            <Link
              href="/leaderboard"
              className={cn(
                "px-4 py-2 rounded-xl text-xs font-mono font-bold",
                "text-[hsl(var(--neon-cyan))] border border-[hsl(170_100%_50%/0.3)]",
                "hover:border-[hsl(var(--neon-cyan))] transition-all"
              )}
            >
              Volver al Leaderboard
            </Link>
          </div>
        )}

        {/* Profile card */}
        {profile && (
          <div
            className={cn(
              "rounded-2xl overflow-hidden",
              "bg-card border border-border"
            )}
          >
            {/* Neon top border */}
            <div className="h-0.5 w-full bg-gradient-to-r from-[hsl(var(--neon-cyan))] via-[hsl(var(--neon-pink))] to-[hsl(var(--neon-yellow))]" />

            <div className="p-6 flex flex-col gap-5">
              {/* Sprite + basic info */}
              <div className="flex flex-col items-center gap-3">
                <div className="relative">
                  <div className="absolute inset-0 rounded-full blur-xl opacity-30 bg-[hsl(var(--neon-cyan))]" />
                  <div
                    className={cn(
                      "relative w-28 h-28 rounded-full flex items-center justify-center",
                      "border-2 border-[hsl(var(--neon-cyan))]",
                      "shadow-[0_0_30px_hsl(170_100%_50%/0.2)]"
                    )}
                    style={{
                      background: "radial-gradient(circle at 30% 30%, hsl(240 20% 16%), hsl(240 20% 6%))",
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={profile.sprite}
                      alt={profile.name}
                      className="w-16 h-16"
                      crossOrigin="anonymous"
                    />
                  </div>
                </div>

                <div className="text-center">
                  <h2 className="text-xl font-mono font-bold text-foreground">{profile.name}</h2>
                  <p className="text-xs font-mono text-muted-foreground">
                    Entrenador: {profile.ownerName}
                  </p>
                </div>

                {/* Stage badge */}
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary/40 border border-border">
                  <span className="text-sm">{getStageEmoji(profile.stage)}</span>
                  <span className="text-[10px] font-mono text-muted-foreground">
                    {getStageName(profile.stage)} (Etapa {profile.stage}/3)
                  </span>
                </div>
              </div>

              {/* Stats */}
              <div className="flex flex-col gap-3">
                <StatBarSimple
                  label="Felicidad"
                  value={profile.stats?.happiness ?? 0}
                  color={profile.stats?.happiness >= 50 ? "pink" : "cyan"}
                />
                <StatBarSimple
                  label="Energia"
                  value={profile.stats?.energy ?? 0}
                  color="yellow"
                />
                <StatBarSimple
                  label="Hambre"
                  value={profile.stats?.hunger ?? 0}
                  color={profile.stats?.hunger >= 70 ? "cyan" : "yellow"}
                />
              </div>

              {/* Points and balance */}
              <div className="flex gap-3">
                <div className="flex-1 flex flex-col items-center gap-1 p-3 rounded-xl bg-secondary/30 border border-border">
                  <span className="text-lg font-mono font-bold text-[hsl(var(--neon-yellow))]">
                    {profile.totalPoints}
                  </span>
                  <span className="text-[10px] font-mono text-muted-foreground">Puntos</span>
                </div>
                <div className="flex-1 flex flex-col items-center gap-1 p-3 rounded-xl bg-secondary/30 border border-border">
                  <span className="text-lg font-mono font-bold text-[hsl(var(--neon-green))]">
                    {profile.balance}
                  </span>
                  <span className="text-[10px] font-mono text-muted-foreground">$FRUTA</span>
                </div>
              </div>

              {/* Meta info */}
              <div className="flex items-center justify-between text-[10px] font-mono text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Eye className="w-3 h-3" />
                  {profile.totalVisits ?? 0} visitas
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {formatDate(profile.registeredAt)}
                </div>
              </div>
            </div>

            {/* Neon bottom border */}
            <div className="h-0.5 w-full bg-gradient-to-r from-[hsl(var(--neon-yellow))] via-[hsl(var(--neon-pink))] to-[hsl(var(--neon-cyan))]" />
          </div>
        )}

        {/* Social interactions (only for other profiles) */}
        {profile && !isMyProfile && (
          <div
            className={cn(
              "rounded-2xl overflow-hidden",
              "bg-card border border-border"
            )}
          >
            <div className="h-0.5 w-full bg-gradient-to-r from-[hsl(var(--neon-pink))] to-[hsl(var(--neon-cyan))]" />
            <div className="p-6">
              <SocialActions targetId={id} targetName={profile.name} />
            </div>
          </div>
        )}

        {/* My profile - no social actions */}
        {profile && isMyProfile && (
          <p className="text-xs font-mono text-muted-foreground text-center">
            Este es tu perfil. Otros jugadores pueden verte y enviarte regalos aqui.
          </p>
        )}

        {/* Back link */}
        <div className="flex justify-center">
          <Link
            href="/"
            className="text-xs font-mono text-muted-foreground hover:text-[hsl(var(--neon-cyan))] transition-colors"
          >
            Volver a mi Regenmon
          </Link>
        </div>
      </div>
    </main>
  )
}
