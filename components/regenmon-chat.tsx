"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport } from "ai"
import { cn } from "@/lib/utils"
import { type RegenmonState, REGENMON_TYPES } from "@/hooks/use-regenmon"
import { Send, MessageCircle, Brain, ChevronDown, ChevronUp } from "lucide-react"

interface ChatMessage {
  id: string
  role: "user" | "assistant"
  text: string
  timestamp: number
}

interface Memory {
  key: string
  value: string
  timestamp: number
}

const CHAT_STORAGE_KEY = "regenmon-chat"
const MEMORY_STORAGE_KEY = "regenmon-memories"
const MAX_MESSAGES = 20

function loadChatHistory(): ChatMessage[] {
  if (typeof window === "undefined") return []
  try {
    const saved = localStorage.getItem(CHAT_STORAGE_KEY)
    if (saved) return JSON.parse(saved)
  } catch { /* ignore */ }
  return []
}

function saveChatHistory(messages: ChatMessage[]) {
  if (typeof window === "undefined") return
  try {
    const toSave = messages.slice(-MAX_MESSAGES)
    localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(toSave))
  } catch { /* ignore */ }
}

function loadMemories(): Memory[] {
  if (typeof window === "undefined") return []
  try {
    const saved = localStorage.getItem(MEMORY_STORAGE_KEY)
    if (saved) return JSON.parse(saved)
  } catch { /* ignore */ }
  return []
}

function saveMemories(memories: Memory[]) {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(MEMORY_STORAGE_KEY, JSON.stringify(memories))
  } catch { /* ignore */ }
}

function detectMemories(text: string, existing: Memory[]): Memory[] {
  const newMemories: Memory[] = []
  const lower = text.toLowerCase()

  const patterns = [
    { regex: /me llamo (\w+)/i, key: "nombre_usuario" },
    { regex: /mi nombre es (\w+)/i, key: "nombre_usuario" },
    { regex: /me gusta (?:el |la |los |las )?(.+)/i, key: "gusto" },
    { regex: /mi (?:color |comida |animal |juego )favorit[oa] es (.+)/i, key: "favorito" },
    { regex: /soy de (.+)/i, key: "origen" },
    { regex: /tengo (\d+) a[nñ]os/i, key: "edad" },
  ]

  for (const { regex, key } of patterns) {
    const match = lower.match(regex)
    if (match && match[1]) {
      const value = match[1].trim().replace(/[.!?,;]$/, "")
      if (value.length > 0 && value.length < 50) {
        const isDuplicate = existing.some(
          (m) => m.key === key && m.value.toLowerCase() === value.toLowerCase()
        )
        if (!isDuplicate) {
          newMemories.push({ key, value, timestamp: Date.now() })
        }
      }
    }
  }

  return newMemories
}

interface RegenmonChatProps {
  state: RegenmonState
  onChatMessage: () => void
}

export function RegenmonChat({ state, onChatMessage }: RegenmonChatProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [localHistory, setLocalHistory] = useState<ChatMessage[]>([])
  const [memories, setMemories] = useState<Memory[]>([])
  const [input, setInput] = useState("")
  const [statPopup, setStatPopup] = useState<string | null>(null)
  const [consecutiveMessages, setConsecutiveMessages] = useState(0)
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const typeData = REGENMON_TYPES[state.type]

  // Load history and memories on mount
  useEffect(() => {
    setLocalHistory(loadChatHistory())
    setMemories(loadMemories())
  }, [])

  // Calculate energy from happiness (simulated energy = happiness * 0.8)
  const energy = Math.round(state.happiness * 0.8)

  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/chat",
      prepareSendMessagesRequest: ({ id, messages: msgs }) => ({
        body: {
          messages: msgs,
          id,
          regenmonName: state.name,
          regenmonType: typeData.label,
          regenmonPersonality: state.personality,
          happiness: state.happiness,
          energy,
          level: state.level,
        },
      }),
    }),
  })

  const isLoading = status === "streaming" || status === "submitted"

  // Sync AI SDK messages to local history
  useEffect(() => {
    if (messages.length === 0) return

    const newHistory: ChatMessage[] = messages.map((m) => {
      const text =
        m.parts
          ?.filter((p): p is { type: "text"; text: string } => p.type === "text")
          .map((p) => p.text)
          .join("") || ""
      return {
        id: m.id,
        role: m.role as "user" | "assistant",
        text,
        timestamp: Date.now(),
      }
    })

    setLocalHistory(newHistory)
    saveChatHistory(newHistory)
  }, [messages])

  // Auto scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, isLoading])

  // Detect memories from user messages
  useEffect(() => {
    if (messages.length === 0) return
    const lastMsg = messages[messages.length - 1]
    if (lastMsg.role !== "user") return

    const text =
      lastMsg.parts
        ?.filter((p): p is { type: "text"; text: string } => p.type === "text")
        .map((p) => p.text)
        .join("") || ""

    const newMemories = detectMemories(text, memories)
    if (newMemories.length > 0) {
      const updated = [...memories, ...newMemories].slice(-10)
      setMemories(updated)
      saveMemories(updated)
    }
  }, [messages, memories])

  const showStatChange = useCallback((text: string) => {
    setStatPopup(text)
    setTimeout(() => setStatPopup(null), 1500)
  }, [])

  const handleSend = () => {
    if (!input.trim() || isLoading) return

    const newCount = consecutiveMessages + 1
    setConsecutiveMessages(newCount)

    sendMessage({ text: input.trim() })
    setInput("")
    onChatMessage()

    if (newCount > 5) {
      showStatChange("+5 Felicidad / -8 Energia")
    } else {
      showStatChange("+5 Felicidad / -3 Energia")
    }

    if (inputRef.current) inputRef.current.focus()
  }

  // Reset consecutive count after 30s of no messages
  useEffect(() => {
    if (consecutiveMessages === 0) return
    const timer = setTimeout(() => setConsecutiveMessages(0), 30000)
    return () => clearTimeout(timer)
  }, [consecutiveMessages])

  const displayMessages = messages.length > 0 ? messages : localHistory.length > 0
    ? localHistory.map((m) => ({
        id: m.id,
        role: m.role,
        parts: [{ type: "text" as const, text: m.text }],
      }))
    : []

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Toggle button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full flex items-center justify-between px-4 py-3 rounded-xl font-mono text-sm font-bold transition-all duration-300",
          "border",
          isOpen
            ? "bg-[hsl(var(--neon-cyan)/0.1)] text-[hsl(var(--neon-cyan))] border-[hsl(170_100%_50%/0.4)]"
            : "bg-card text-muted-foreground border-border hover:text-foreground hover:border-muted-foreground/40"
        )}
      >
        <div className="flex items-center gap-2">
          <MessageCircle className="w-4 h-4" />
          <span>Chat con {state.name}</span>
        </div>
        <div className="flex items-center gap-3">
          {memories.length > 0 && (
            <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
              <Brain className="w-3 h-3" />
              {memories.length}
            </span>
          )}
          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      {/* Chat panel */}
      {isOpen && (
        <div
          className={cn(
            "mt-2 rounded-2xl overflow-hidden border border-border bg-card",
            "animate-in slide-in-from-top-2 duration-300"
          )}
        >
          {/* Neon top border */}
          <div className="h-0.5 w-full bg-gradient-to-r from-[hsl(var(--neon-cyan))] via-[hsl(var(--neon-pink))] to-[hsl(var(--neon-yellow))]" />

          {/* Stat popup */}
          {statPopup && (
            <div className="flex justify-center py-2">
              <span
                className={cn(
                  "inline-flex px-3 py-1 rounded-full text-[10px] font-mono font-bold",
                  "bg-[hsl(var(--neon-green)/0.15)] text-[hsl(var(--neon-green))]",
                  "border border-[hsl(120_70%_50%/0.3)]",
                  "animate-in fade-in zoom-in-95 duration-300"
                )}
              >
                {statPopup}
              </span>
            </div>
          )}

          {/* Messages area */}
          <div
            ref={scrollRef}
            className="h-64 overflow-y-auto p-4 flex flex-col gap-3 scroll-smooth"
          >
            {displayMessages.length === 0 && (
              <div className="flex-1 flex items-center justify-center">
                <p className="text-xs font-mono text-muted-foreground text-center">
                  Escribe un mensaje para hablar con {state.name}
                </p>
              </div>
            )}

            {displayMessages.map((message, i) => {
              const text =
                "text" in message
                  ? (message as ChatMessage).text
                  : (message as { parts: Array<{ type: string; text?: string }> }).parts
                      ?.filter((p) => p.type === "text")
                      .map((p) => p.text)
                      .join("") || ""

              const isUser = message.role === "user"

              return (
                <div
                  key={message.id || i}
                  className={cn(
                    "flex",
                    isUser ? "justify-end" : "justify-start",
                    "animate-in slide-in-from-bottom-2 duration-200"
                  )}
                >
                  <div
                    className={cn(
                      "max-w-[80%] px-3 py-2 rounded-2xl text-sm font-mono",
                      isUser
                        ? "bg-[hsl(var(--neon-cyan)/0.15)] text-[hsl(var(--neon-cyan))] border border-[hsl(170_100%_50%/0.3)] rounded-br-md"
                        : "bg-secondary text-foreground border border-border rounded-bl-md"
                    )}
                  >
                    {!isUser && (
                      <span className="text-[10px] font-bold text-muted-foreground block mb-1">
                        {state.name}
                      </span>
                    )}
                    {text}
                  </div>
                </div>
              )
            })}

            {/* Typing indicator */}
            {isLoading && (
              <div className="flex justify-start animate-in slide-in-from-bottom-2 duration-200">
                <div className="px-4 py-2 rounded-2xl rounded-bl-md bg-secondary border border-border">
                  <div className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input area */}
          <div className="p-3 border-t border-border">
            <form
              onSubmit={(e) => {
                e.preventDefault()
                handleSend()
              }}
              className="flex items-center gap-2"
            >
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={`Habla con ${state.name}...`}
                disabled={isLoading}
                maxLength={200}
                className={cn(
                  "flex-1 px-4 py-2.5 rounded-xl bg-secondary/50 border border-border",
                  "font-mono text-sm text-foreground placeholder:text-muted-foreground/50",
                  "outline-none transition-all duration-300",
                  "focus:border-[hsl(var(--neon-cyan))] focus:shadow-[0_0_10px_hsl(170_100%_50%/0.15)]",
                  "disabled:opacity-50"
                )}
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className={cn(
                  "flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-300",
                  "border",
                  input.trim() && !isLoading
                    ? "bg-[hsl(var(--neon-cyan)/0.15)] text-[hsl(var(--neon-cyan))] border-[hsl(170_100%_50%/0.4)] hover:shadow-[0_0_15px_hsl(170_100%_50%/0.3)]"
                    : "bg-secondary text-muted-foreground border-border cursor-not-allowed"
                )}
                aria-label="Enviar mensaje"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>

          {/* Neon bottom border */}
          <div className="h-0.5 w-full bg-gradient-to-r from-[hsl(var(--neon-yellow))] via-[hsl(var(--neon-pink))] to-[hsl(var(--neon-cyan))]" />
        </div>
      )}
    </div>
  )
}
