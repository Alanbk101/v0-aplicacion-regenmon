"use client"

import { cn } from "@/lib/utils"
import { Coins } from "lucide-react"

interface CoinDisplayProps {
  coins: number
  authenticated: boolean
  coinDelta: { amount: number; id: number } | null
}

export function CoinDisplay({ coins, authenticated, coinDelta }: CoinDisplayProps) {
  return (
    <div className="relative flex items-center gap-1.5">
      <Coins className="w-4 h-4 text-[hsl(var(--neon-yellow))]" />
      <span className="text-sm font-mono font-bold text-[hsl(var(--neon-yellow))]">
        {authenticated ? `${coins} $FRUTA` : "$FRUTA"}
      </span>

      {/* Floating delta animation */}
      {coinDelta && authenticated && (
        <span
          key={coinDelta.id}
          className={cn(
            "absolute -top-5 left-1/2 -translate-x-1/2 text-xs font-mono font-bold pointer-events-none animate-float-up",
            coinDelta.amount > 0
              ? "text-[hsl(var(--neon-green))]"
              : "text-destructive"
          )}
        >
          {coinDelta.amount > 0 ? `+${coinDelta.amount}` : coinDelta.amount}
        </span>
      )}
    </div>
  )
}
