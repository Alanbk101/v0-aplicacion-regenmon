"use client"

import { cn } from "@/lib/utils"
import { CoinDisplay } from "@/components/coin-display"
import { LogIn, LogOut, User } from "lucide-react"

interface GameHeaderProps {
  authenticated: boolean
  userEmail?: string | null
  coins: number
  coinDelta: { amount: number; id: number } | null
  onLogin: () => void
  onLogout: () => void
}

export function GameHeader({
  authenticated,
  userEmail,
  coins,
  coinDelta,
  onLogin,
  onLogout,
}: GameHeaderProps) {
  return (
    <header className="flex flex-col items-center gap-1 py-6 w-full">
      {/* Top bar: coins left, auth right */}
      <div className="flex items-center justify-between w-full px-1 mb-3">
        <CoinDisplay
          coins={coins}
          authenticated={authenticated}
          coinDelta={coinDelta}
        />

        {authenticated ? (
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-[hsl(var(--neon-cyan))]" />
              <span className="text-[10px] font-mono text-muted-foreground truncate max-w-[100px]">
                {userEmail ?? "Usuario"}
              </span>
            </div>
            <button
              onClick={onLogout}
              className={cn(
                "flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-mono",
                "text-muted-foreground hover:text-destructive transition-colors",
                "border border-border hover:border-destructive/40"
              )}
            >
              <LogOut className="w-3 h-3" />
              <span className="sr-only sm:not-sr-only">Salir</span>
            </button>
          </div>
        ) : (
          <button
            onClick={onLogin}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold",
              "text-[hsl(var(--neon-cyan))] bg-[hsl(170_100%_50%/0.08)]",
              "border border-[hsl(170_100%_50%/0.3)] hover:border-[hsl(var(--neon-cyan))]",
              "hover:bg-[hsl(170_100%_50%/0.15)] hover:shadow-[0_0_15px_hsl(170_100%_50%/0.2)]",
              "transition-all"
            )}
          >
            <LogIn className="w-3.5 h-3.5" />
            Iniciar Sesion
          </button>
        )}
      </div>

      {/* Logo */}
      <div className="flex items-center gap-2">
        <span className="text-3xl" role="img" aria-label="huevo">{"🥚"}</span>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tighter font-mono text-balance">
          <span className="text-[hsl(var(--neon-cyan))]">REGEN</span>
          <span className="text-[hsl(var(--neon-pink))]">MON</span>
        </h1>
      </div>
      <p className="text-xs font-mono tracking-[0.3em] uppercase text-muted-foreground">
        Mascota Virtual
      </p>
      {/* Scan line decoration */}
      <div className="w-48 h-px mt-2 bg-gradient-to-r from-transparent via-[hsl(var(--neon-cyan))] to-transparent opacity-50" />
    </header>
  )
}
