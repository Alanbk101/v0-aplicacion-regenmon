"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { ChevronDown, Clock } from "lucide-react"
import type { ActionEntry } from "@/hooks/use-action-history"

interface ActionHistoryProps {
  history: ActionEntry[]
}

function timeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000)
  if (seconds < 60) return "ahora"
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `hace ${minutes}m`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `hace ${hours}h`
  return `hace ${Math.floor(hours / 24)}d`
}

export function ActionHistory({ history }: ActionHistoryProps) {
  const [open, setOpen] = useState(false)

  if (history.length === 0) return null

  return (
    <div className="w-full">
      <button
        onClick={() => setOpen((prev) => !prev)}
        className={cn(
          "flex items-center justify-between w-full px-3 py-2 rounded-lg",
          "text-xs font-mono text-muted-foreground",
          "hover:bg-secondary/30 transition-colors"
        )}
      >
        <span className="flex items-center gap-1.5">
          <Clock className="w-3 h-3" />
          Historial ({history.length})
        </span>
        <ChevronDown
          className={cn(
            "w-3 h-3 transition-transform duration-200",
            open && "rotate-180"
          )}
        />
      </button>

      {open && (
        <div className="flex flex-col gap-1 mt-1 max-h-[200px] overflow-y-auto">
          {history.map((entry, i) => (
            <div
              key={`${entry.timestamp}-${i}`}
              className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-secondary/20 text-[10px] font-mono"
            >
              <span className="text-muted-foreground">{entry.action}</span>
              <div className="flex items-center gap-2">
                {entry.coins !== 0 && (
                  <span
                    className={cn(
                      "font-bold",
                      entry.coins > 0
                        ? "text-[hsl(var(--neon-green))]"
                        : "text-destructive"
                    )}
                  >
                    {entry.coins > 0 ? `+${entry.coins}` : entry.coins}
                  </span>
                )}
                <span className="text-muted-foreground/60">
                  {timeAgo(entry.timestamp)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
