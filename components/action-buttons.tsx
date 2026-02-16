"use client"

import { cn } from "@/lib/utils"
import { UtensilsCrossed, Gamepad2, Dumbbell, MessageCircle } from "lucide-react"

interface ActionButtonsProps {
  onFeed: () => void
  onPlay: () => void
  onTrain: () => void
  onChat: () => void
  cooldown: boolean
  canAffordFeed: boolean
  authenticated: boolean
}

interface ActionConfig {
  label: string
  detail: string
  icon: React.ReactNode
  onClick: () => void
  colorClass: string
  glowClass: string
  borderClass: string
  ignoresCooldown?: boolean
  disabled?: boolean
  tooltip?: string
}

export function ActionButtons({
  onFeed,
  onPlay,
  onTrain,
  onChat,
  cooldown,
  canAffordFeed,
  authenticated,
}: ActionButtonsProps) {
  const feedDisabled = authenticated && !canAffordFeed

  const actions: ActionConfig[] = [
    {
      label: "Alimentar",
      detail: authenticated ? "10 $FRUTA" : "+20 Felicidad",
      icon: <UtensilsCrossed className="w-5 h-5" />,
      onClick: onFeed,
      colorClass: "text-[hsl(var(--neon-cyan))]",
      glowClass: "hover:shadow-[0_0_25px_hsl(170_100%_50%/0.3)] active:shadow-[0_0_35px_hsl(170_100%_50%/0.5)]",
      borderClass: "border-[hsl(170_100%_50%/0.3)] hover:border-[hsl(var(--neon-cyan))]",
      disabled: feedDisabled,
      tooltip: feedDisabled ? "Habla con tu Regenmon para ganar monedas" : undefined,
    },
    {
      label: "Jugar",
      detail: "+15 Felicidad, +10 XP",
      icon: <Gamepad2 className="w-5 h-5" />,
      onClick: onPlay,
      colorClass: "text-[hsl(var(--neon-pink))]",
      glowClass: "hover:shadow-[0_0_25px_hsl(330_100%_60%/0.3)] active:shadow-[0_0_35px_hsl(330_100%_60%/0.5)]",
      borderClass: "border-[hsl(330_100%_60%/0.3)] hover:border-[hsl(var(--neon-pink))]",
    },
    {
      label: "Entrenar",
      detail: "+5 Felicidad, +20 XP",
      icon: <Dumbbell className="w-5 h-5" />,
      onClick: onTrain,
      colorClass: "text-[hsl(var(--neon-yellow))]",
      glowClass: "hover:shadow-[0_0_25px_hsl(50_100%_55%/0.3)] active:shadow-[0_0_35px_hsl(50_100%_55%/0.5)]",
      borderClass: "border-[hsl(50_100%_55%/0.3)] hover:border-[hsl(var(--neon-yellow))]",
    },
    {
      label: "Hablar",
      detail: "Chat con IA",
      icon: <MessageCircle className="w-5 h-5" />,
      onClick: onChat,
      colorClass: "text-[hsl(var(--neon-green))]",
      glowClass: "hover:shadow-[0_0_25px_hsl(120_70%_50%/0.3)] active:shadow-[0_0_35px_hsl(120_70%_50%/0.5)]",
      borderClass: "border-[hsl(120_70%_50%/0.3)] hover:border-[hsl(var(--neon-green))]",
      ignoresCooldown: true,
    },
  ]

  return (
    <div className="grid grid-cols-4 gap-3">
      {actions.map((action) => {
        const isDisabled = action.disabled || (cooldown && !action.ignoresCooldown)
        return (
          <div key={action.label} className="relative group/action">
            <button
              onClick={action.onClick}
              disabled={isDisabled}
              className={cn(
                "w-full flex flex-col items-center gap-2 p-4 rounded-xl",
                "bg-secondary/50 border transition-all duration-300",
                "disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:shadow-none",
                action.borderClass,
                !isDisabled && action.glowClass
              )}
            >
              <div className={cn("transition-transform duration-200 group-hover/action:scale-110 group-active/action:scale-95", action.colorClass)}>
                {action.icon}
              </div>
              <span className={cn("text-sm font-semibold", action.colorClass)}>
                {action.label}
              </span>
              <span className="text-[10px] font-mono text-muted-foreground leading-tight text-center">
                {action.detail}
              </span>

              {/* Cooldown overlay */}
              {cooldown && !action.ignoresCooldown && !action.disabled && (
                <div className="absolute inset-0 rounded-xl bg-background/60 flex items-center justify-center">
                  <div className="w-4 h-4 border-2 border-muted-foreground border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </button>

            {/* Tooltip for can't afford */}
            {action.tooltip && (
              <div className="absolute -top-10 left-1/2 -translate-x-1/2 opacity-0 group-hover/action:opacity-100 transition-opacity pointer-events-none z-10">
                <div className="px-2 py-1 rounded-md bg-secondary border border-border text-[9px] font-mono text-muted-foreground whitespace-nowrap">
                  {action.tooltip}
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
