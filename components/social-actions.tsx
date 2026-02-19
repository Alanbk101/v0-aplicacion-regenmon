"use client"

import { useState, useEffect, useCallback } from "react"
import { cn } from "@/lib/utils"
import {
  feedRegenmon,
  sendGift,
  fetchMessages,
  sendMessage as sendHubMessage,
  getHubId,
  getHubBalance,
  setHubBalance,
  getOwnerName,
} from "@/hooks/use-hub"
import type { HubMessage } from "@/hooks/use-hub"
import { Loader2, Send } from "lucide-react"

interface SocialActionsProps {
  targetId: string
  targetName: string
}

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

export function SocialActions({ targetId, targetName }: SocialActionsProps) {
  const [balance, setBalance] = useState(0)
  const [hubId, setHubIdState] = useState<string | null>(null)
  const [feedLoading, setFeedLoading] = useState(false)
  const [giftLoading, setGiftLoading] = useState<number | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const [messages, setMessages] = useState<HubMessage[]>([])
  const [msgLoading, setMsgLoading] = useState(true)
  const [newMessage, setNewMessage] = useState("")
  const [sendingMsg, setSendingMsg] = useState(false)
  const [feedAnim, setFeedAnim] = useState(false)

  useEffect(() => {
    const id = getHubId()
    setHubIdState(id)
    setBalance(getHubBalance())

    // Load messages
    fetchMessages(targetId)
      .then((res) => setMessages(res.data?.messages ?? []))
      .catch(() => {})
      .finally(() => setMsgLoading(false))
  }, [targetId])

  const showToast = useCallback((msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }, [])

  const refreshBalance = useCallback(() => {
    setBalance(getHubBalance())
  }, [])

  const handleFeed = useCallback(async () => {
    if (!hubId || balance < 10) return
    setFeedLoading(true)
    setFeedAnim(true)
    try {
      const res = await feedRegenmon(targetId, hubId)
      setHubBalance(res.data.senderBalance)
      setBalance(res.data.senderBalance)
      showToast(`Le diste de comer a ${res.data.targetName}! -${res.data.cost} $FRUTA`)
    } catch {
      showToast("El HUB esta descansando, intenta despues")
    } finally {
      setFeedLoading(false)
      setTimeout(() => setFeedAnim(false), 1000)
    }
  }, [hubId, balance, targetId, showToast])

  const handleGift = useCallback(
    async (amount: number) => {
      if (!hubId || balance < amount) return
      setGiftLoading(amount)
      try {
        const res = await sendGift(targetId, hubId, amount)
        setHubBalance(res.data.senderBalance)
        setBalance(res.data.senderBalance)
        showToast(`Enviaste ${res.data.amount} $FRUTA a ${res.data.targetName}!`)
      } catch {
        showToast("El HUB esta descansando, intenta despues")
      } finally {
        setGiftLoading(null)
      }
    },
    [hubId, balance, targetId, showToast]
  )

  const handleSendMessage = useCallback(async () => {
    if (!hubId || !newMessage.trim()) return
    setSendingMsg(true)
    const ownerName = getOwnerName() || "Anonimo"
    const text = newMessage.trim()
    try {
      await sendHubMessage(targetId, hubId, ownerName, text)
      setMessages((prev) => [
        { id: Date.now().toString(), fromName: ownerName, message: text, createdAt: new Date().toISOString() },
        ...prev,
      ])
      setNewMessage("")
      showToast("Mensaje enviado!")
    } catch {
      showToast("No se pudo enviar el mensaje")
    } finally {
      setSendingMsg(false)
    }
  }, [hubId, newMessage, targetId, showToast])

  if (!hubId) {
    return (
      <div className="p-4 rounded-xl bg-secondary/30 border border-border text-center">
        <p className="text-xs font-mono text-muted-foreground">
          Registrate en el HUB para interactuar (tab Social en la pantalla principal)
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Toast */}
      {toast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-xl bg-card border border-[hsl(var(--neon-green)/0.4)] shadow-lg">
          <p className="text-xs font-mono font-bold text-[hsl(var(--neon-green))]">{toast}</p>
        </div>
      )}

      {/* Balance display */}
      <div className="flex items-center justify-between p-2 rounded-lg bg-secondary/30 border border-border">
        <span className="text-[10px] font-mono text-muted-foreground">Tu balance:</span>
        <span className="text-xs font-mono font-bold text-[hsl(var(--neon-yellow))]">
          {balance} $FRUTA
        </span>
      </div>

      {/* Feed action */}
      <div className="flex flex-col gap-2">
        <h4 className="text-xs font-mono font-bold text-foreground uppercase tracking-wider">Alimentar</h4>
        <div className="relative">
          <button
            onClick={handleFeed}
            disabled={feedLoading || balance < 10}
            className={cn(
              "w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-mono font-bold transition-all",
              balance >= 10
                ? "bg-[hsl(var(--neon-pink)/0.1)] text-[hsl(var(--neon-pink))] border border-[hsl(330_100%_60%/0.3)] hover:border-[hsl(var(--neon-pink))] hover:shadow-[0_0_12px_hsl(330_100%_60%/0.2)]"
                : "bg-secondary/20 text-muted-foreground/50 border border-border cursor-not-allowed"
            )}
          >
            {feedLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              "\uD83C\uDF4E"
            )}
            {balance >= 10 ? "Dar de comer (-10 $FRUTA)" : "Sin $FRUTA suficiente"}
          </button>
          {feedAnim && (
            <span className="absolute top-0 right-1/4 text-2xl animate-bounce pointer-events-none">
              {"\uD83C\uDF4E"}
            </span>
          )}
        </div>
      </div>

      {/* Gift action */}
      <div className="flex flex-col gap-2">
        <h4 className="text-xs font-mono font-bold text-foreground uppercase tracking-wider">Enviar Regalo</h4>
        <div className="flex gap-2">
          {[5, 10, 25].map((amount) => (
            <button
              key={amount}
              onClick={() => handleGift(amount)}
              disabled={giftLoading !== null || balance < amount}
              className={cn(
                "flex-1 flex items-center justify-center gap-1 py-2.5 rounded-xl text-xs font-mono font-bold transition-all",
                balance >= amount
                  ? "bg-[hsl(var(--neon-yellow)/0.1)] text-[hsl(var(--neon-yellow))] border border-[hsl(50_100%_55%/0.3)] hover:border-[hsl(var(--neon-yellow))] hover:shadow-[0_0_12px_hsl(50_100%_55%/0.15)]"
                  : "bg-secondary/20 text-muted-foreground/50 border border-border cursor-not-allowed"
              )}
            >
              {giftLoading === amount ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <>
                  {"\uD83C\uDF81"} {amount}
                </>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Messages */}
      <div className="flex flex-col gap-3">
        <h4 className="text-xs font-mono font-bold text-foreground uppercase tracking-wider">Mensajes</h4>

        {/* Send message form */}
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value.slice(0, 140))}
              onKeyDown={(e) => e.key === "Enter" && !sendingMsg && handleSendMessage()}
              placeholder="Escribe un mensaje..."
              maxLength={140}
              className={cn(
                "w-full px-3 py-2 rounded-lg text-xs font-mono",
                "bg-secondary/60 border border-border text-foreground placeholder:text-muted-foreground",
                "focus:outline-none focus:border-[hsl(var(--neon-cyan))] focus:ring-1 focus:ring-[hsl(170_100%_50%/0.3)]"
              )}
            />
            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[8px] font-mono text-muted-foreground">
              {newMessage.length}/140
            </span>
          </div>
          <button
            onClick={handleSendMessage}
            disabled={sendingMsg || !newMessage.trim()}
            className={cn(
              "flex items-center justify-center w-10 h-10 rounded-lg transition-all",
              newMessage.trim()
                ? "bg-[hsl(var(--neon-cyan)/0.1)] text-[hsl(var(--neon-cyan))] border border-[hsl(170_100%_50%/0.3)] hover:border-[hsl(var(--neon-cyan))]"
                : "bg-secondary/20 text-muted-foreground/40 border border-border cursor-not-allowed"
            )}
            aria-label="Enviar mensaje"
          >
            {sendingMsg ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Message list */}
        {msgLoading ? (
          <div className="flex justify-center py-4">
            <Loader2 className="w-5 h-5 text-muted-foreground animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <p className="text-[10px] font-mono text-muted-foreground text-center py-3">
            No hay mensajes aun. Se el primero!
          </p>
        ) : (
          <div className="flex flex-col gap-1.5 max-h-60 overflow-y-auto">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className="flex flex-col gap-0.5 p-2 rounded-lg bg-secondary/30 border border-border"
              >
                <div className="flex items-baseline gap-2">
                  <span className="text-[10px] font-mono font-bold text-[hsl(var(--neon-cyan))]">
                    {msg.fromName}
                  </span>
                  <span className="text-[8px] font-mono text-muted-foreground">
                    {formatTimeAgo(msg.createdAt)}
                  </span>
                </div>
                <p className="text-xs font-mono text-foreground break-words">{msg.message}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
