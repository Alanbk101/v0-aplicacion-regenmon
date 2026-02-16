"use client"

import { cn } from "@/lib/utils"
import { Utensils, Gamepad2, Dumbbell, MessageCircle } from "lucide-react"

interface ActionButtonsProps {
  onFeed: () => void
  onPlay: () => void
  onTrain: () => void
  onChat: () => void
  cooldown: boolean
  canAffordFeed: boolean
  authenticated: boolean
}

interface ActionButtonProps {
  onClick: () => void
  disabled: boolean
  icon: React.ReactNode
  label: string
  color: "cyan" | "pink" | "yellow" | "green"
}

const colorStyles = {
  cyan: {
    bg: "bg-[hsl(var(--neon-cyan)/0.1)]",
    border: "border-[hsl(170_100%_50%/0.3)]",
    hoverBorder: "hover:border-[hsl(var(--neon-cyan))]",
    text: "text-[hsl(var(--neon-cyan))]",
    shadow: "hover:shadow-[0_0_20px_hsl(170_100%_50%/0.3)]",
  },
  pink: {
    bg: "bg-[hsl(var(--neon-pink)/0.1)]",
    border: "border-[hsl(330_100%_60%/0.3)]",
    hoverBorder: "hover:border-[hsl(var(--neon-pink))]",
    text: "text-[hsl(var(--neon-pink))]",
    shadow: "hover:shadow-[0_0_20px_hsl(330_100%_60%/0.3)]",
  },
  yellow: {
    bg: "bg-[hsl(var(--neon-yellow)/0.1)]",
    border: "border-[hsl(50_100%_55%/0.3)]",
    hoverBorder: "hover:border-[hsl(var(--neon-yellow))]",
    text: "text-[hsl(var(--neon-yellow))]",
    shadow: "hover:shadow-[0_0_20px_hsl(50_100%_55%/0.3)]",
  },
  green: {
    bg: "bg-[hsl(var(--neon-green)/0.1)]",
    border: "border-[hsl(120_70%_50%/0.3)]",
    hoverBorder: "hover:border-[hsl(var(--neon-green))]",
    text: "text-[hsl(var(--neon-green))]",
    shadow: "hover:shadow-[0_0_20px_hsl(120_70%_50%/0.3)]",
  },
}

function ActionButton({ onClick, disabled, icon, label, color }: ActionButtonProps) {
  const styles = colorStyles[color]

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "flex flex-col items-center justify-center gap-1.5 px-3 py-3 rounded-xl",
        "border transition-all duration-200 font-mono text-xs font-bold",
        styles.bg,
        styles.border,
        styles.text,
        !disabled && styles.hoverBorder,
        !disabled && styles.shadow,
        "disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:shadow-none"
      )}
    >
      {icon}
      <span>{label}</span>
    </button>
  )
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
  return (
    <div className="grid grid-cols-4 gap-2">
      <ActionButton
        onClick={onFeed}
        disabled={cooldown || (authenticated && !canAffordFeed)}
        icon={<Utensils className="w-5 h-5" />}
        label="Alimentar"
        color="cyan"
      />
      <ActionButton
        onClick={onPlay}
        disabled={cooldown}
        icon={<Gamepad2 className="w-5 h-5" />}
        label="Jugar"
        color="pink"
      />
      <ActionButton
        onClick={onTrain}
        disabled={cooldown}
        icon={<Dumbbell className="w-5 h-5" />}
        label="Entrenar"
        color="yellow"
      />
      <ActionButton
        onClick={onChat}
        disabled={false}
        icon={<MessageCircle className="w-5 h-5" />}
        label="Hablar"
        color="green"
      />
    </div>
  )
}
