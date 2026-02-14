"use client"

import { useRef, useEffect, useState } from "react"
import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport } from "ai"
import { cn } from "@/lib/utils"
import { Send, X, Loader2 } from "lucide-react"
import type { RegenmonState } from "@/hooks/use-regenmon"

interface RegenmonChatProps {
  regenmonState: RegenmonState
  onClose: () => void
}

function getUIMessageText(msg: { parts?: Array<{ type: string; text?: string }> }): string {
  if (!msg.parts || !Array.isArray(msg.parts)) return ""
  return msg.parts
    .filter((p): p is { type: "text"; text: string } => p.type === "text")
    .map((p) => p.text)
    .join("")
}

export function RegenmonChat({ regenmonState, onClose }: RegenmonChatProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const [input, setInput] = useState("")

  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/chat",
      prepareSendMessagesRequest: ({ id, messages }) => ({
        body: {
          id,
          messages,
          regenmonState: {
            name: regenmonState.name,
            level: regenmonState.level,
            happiness: regenmonState.happiness,
            xp: regenmonState.xp,
          },
        },
      }),
    }),
  })

  const isStreaming = status === "streaming" || status === "submitted"

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = input.trim()
    if (!trimmed || isStreaming) return
    sendMessage({ text: trimmed })
    setInput("")
  }

  return (
    <div
      className={cn(
        "flex flex-col rounded-2xl overflow-hidden",
        "border border-border bg-card",
        "w-full max-w-md mx-auto"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-secondary/30">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[hsl(var(--neon-green))] animate-pulse" />
          <span className="text-sm font-mono font-bold text-[hsl(var(--neon-cyan))]">
            Chat con {regenmonState.name}
          </span>
        </div>
        <button
          onClick={onClose}
          className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-lg hover:bg-secondary/50"
          aria-label="Cerrar chat"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        className="flex flex-col gap-3 p-4 overflow-y-auto min-h-[200px] max-h-[300px]"
      >
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-2 py-8 text-center">
            <span className="text-3xl">
              {regenmonState.happiness >= 50 ? "💬" : "😢"}
            </span>
            <p className="text-xs font-mono text-muted-foreground">
              {"Escribe algo para hablar con tu Regenmon"}
            </p>
          </div>
        )}

        {messages.map((message) => {
          const text = getUIMessageText(message)
          if (!text) return null

          const isUser = message.role === "user"

          return (
            <div
              key={message.id}
              className={cn(
                "flex",
                isUser ? "justify-end" : "justify-start"
              )}
            >
              <div
                className={cn(
                  "max-w-[80%] px-3 py-2 rounded-xl text-sm font-mono",
                  isUser
                    ? "bg-[hsl(var(--neon-cyan)/0.15)] text-[hsl(var(--neon-cyan))] border border-[hsl(170_100%_50%/0.3)]"
                    : "bg-secondary/60 text-foreground border border-border"
                )}
              >
                {!isUser && (
                  <span className="text-[10px] font-bold text-[hsl(var(--neon-pink))] block mb-1">
                    {regenmonState.name}
                  </span>
                )}
                <p className="whitespace-pre-wrap leading-relaxed">{text}</p>
              </div>
            </div>
          )
        })}

        {isStreaming && messages[messages.length - 1]?.role !== "assistant" && (
          <div className="flex justify-start">
            <div className="px-3 py-2 rounded-xl bg-secondary/60 border border-border">
              <Loader2 className="w-4 h-4 text-[hsl(var(--neon-pink))] animate-spin" />
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <form
        onSubmit={handleSubmit}
        className="flex items-center gap-2 px-4 py-3 border-t border-border bg-secondary/20"
      >
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={`Habla con ${regenmonState.name}...`}
          disabled={isStreaming}
          className={cn(
            "flex-1 bg-transparent text-sm font-mono text-foreground placeholder:text-muted-foreground",
            "outline-none border-none",
            "disabled:opacity-50"
          )}
        />
        <button
          type="submit"
          disabled={isStreaming || !input.trim()}
          className={cn(
            "flex items-center justify-center w-8 h-8 rounded-lg transition-all",
            "bg-[hsl(var(--neon-cyan)/0.15)] text-[hsl(var(--neon-cyan))]",
            "border border-[hsl(170_100%_50%/0.3)]",
            "hover:bg-[hsl(var(--neon-cyan)/0.25)] hover:shadow-[0_0_15px_hsl(170_100%_50%/0.3)]",
            "disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:shadow-none"
          )}
          aria-label="Enviar mensaje"
        >
          {isStreaming ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </button>
      </form>
    </div>
  )
}
