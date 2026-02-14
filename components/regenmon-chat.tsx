"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { cn } from "@/lib/utils"
import { type RegenmonState, REGENMON_TYPES, PERSONALITIES } from "@/hooks/use-regenmon"
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
const MAX_MESSAGES = 30

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

// --- Response Generation System ---

interface ResponseContext {
  state: RegenmonState
  userInput: string
  memories: Memory[]
  messageCount: number
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function generateResponse(ctx: ResponseContext): string {
  const { state, userInput, memories, messageCount } = ctx
  const lower = userInput.toLowerCase().trim()
  const typeData = REGENMON_TYPES[state.type]
  const personalityData = PERSONALITIES[state.personality]

  // Personality prefixes
  const prefixes: Record<RegenmonState["personality"], string[]> = {
    valiente: ["Grr!", "Yosh!", "Adelante!", "Sin miedo!"],
    tranquilo: ["Hmm...", "Ahhh~", "Mmm...", "Ohhh..."],
    travieso: ["Jeje~", "Muahaha!", "Ups!", "Hihi~"],
    misterioso: ["...", "Hmm...", "Interesante...", "Veo..."],
  }

  const emojis: Record<RegenmonState["personality"], string[]> = {
    valiente: ["💪", "🔥", "⚔️", "🛡️"],
    tranquilo: ["😊", "🌸", "✨", "🍃"],
    travieso: ["😜", "🎉", "🤪", "👻"],
    misterioso: ["🔮", "🌙", "👁️", "💫"],
  }

  const prefix = pickRandom(prefixes[state.personality])
  const emoji = pickRandom(emojis[state.personality])

  // User's name from memory
  const userName = memories.find((m) => m.key === "nombre_usuario")?.value

  // --- Check for low happiness / tired ---
  if (state.happiness < 20) {
    const sadResponses = [
      `${prefix} Estoy un poco triste... ${emoji} Necesito que me alimentes o juegues conmigo!`,
      `Me siento solito... ${emoji} Podrias cuidarme un poco mas?`,
      `${prefix} Tengo hambre y estoy cansado... Dale al boton de Alimentar! ${emoji}`,
    ]
    return pickRandom(sadResponses)
  }

  // --- Greeting patterns ---
  if (/^(hola|hey|hi|buenas|que tal|saludos|ey|hello)/i.test(lower)) {
    const greetings = [
      `${prefix} Hola${userName ? `, ${userName}` : ""}! ${emoji} Me alegra verte!`,
      `Hey${userName ? ` ${userName}` : ""}! ${prefix} ${emoji} Que quieres hacer hoy?`,
      `${prefix} Bienvenido de vuelta! ${emoji} Estaba esperandote!`,
      `Holaaa! ${emoji} Tu ${typeData.label} favorito esta aqui! ${prefix}`,
    ]
    return pickRandom(greetings)
  }

  // --- Name introduction ---
  if (/me llamo|mi nombre es/i.test(lower)) {
    const nameMatch = lower.match(/(?:me llamo|mi nombre es) (\w+)/i)
    if (nameMatch) {
      return `${prefix} Mucho gusto, ${nameMatch[1]}! ${emoji} Yo soy ${state.name}, tu ${typeData.label} de nivel ${state.level}!`
    }
  }

  // --- Questions about the Regenmon ---
  if (/como te llamas|tu nombre|quien eres/i.test(lower)) {
    return `${prefix} Soy ${state.name}, un Regenmon de tipo ${typeData.label}! ${typeData.emoji} Soy ${personalityData.label.toLowerCase()} y estoy en nivel ${state.level}! ${emoji}`
  }

  if (/como estas|que tal estas|te sientes/i.test(lower)) {
    if (state.happiness > 70) {
      return `${prefix} Estoy super bien! ${emoji} Mi felicidad esta en ${state.happiness}/100! Me siento genial!`
    } else if (state.happiness > 40) {
      return `${prefix} Estoy bien, pero podria estar mejor... ${emoji} Mi felicidad esta en ${state.happiness}/100.`
    } else {
      return `${prefix} No me siento muy bien... ${emoji} Mi felicidad esta en ${state.happiness}/100. Necesito atencion!`
    }
  }

  if (/nivel|level|que nivel/i.test(lower)) {
    const nextLevelXp = 100 - state.xp
    return `${prefix} Soy nivel ${state.level}! ${emoji} Me faltan ${nextLevelXp} XP para subir al siguiente nivel. Entrename para ganar mas XP!`
  }

  if (/tipo|elemento|de que tipo/i.test(lower)) {
    return `${prefix} Soy de tipo ${typeData.label}! ${typeData.emoji} ${typeData.description} ${emoji}`
  }

  if (/evolucion|evolucionar|siguiente forma/i.test(lower)) {
    const evoIdx = Math.min(state.level - 1, typeData.evolutions.length - 1)
    const currentEvo = typeData.evolutionNames[evoIdx]
    if (evoIdx < typeData.evolutions.length - 1) {
      const nextEvo = typeData.evolutionNames[evoIdx + 1]
      return `${prefix} Ahora soy ${currentEvo} ${typeData.evolutions[evoIdx]}! Mi siguiente forma es ${nextEvo} ${typeData.evolutions[evoIdx + 1]}! ${emoji} Sigue entrenandome!`
    } else {
      return `${prefix} Ya llegue a mi forma final: ${currentEvo} ${typeData.evolutions[evoIdx]}! ${emoji} Soy el mas fuerte!`
    }
  }

  // --- Action suggestions ---
  if (/alimentar|comida|comer|hambre|alimentame/i.test(lower)) {
    return `${prefix} Si! Dame de comer! ${emoji} Presiona el boton de Alimentar para darme felicidad! ${typeData.emoji}`
  }

  if (/jugar|juguemos|aburrido|divertir/i.test(lower)) {
    return `${prefix} Vamos a jugar! ${emoji} Pulsa el boton de Jugar para que nos divirtamos juntos! ${typeData.emoji}`
  }

  if (/entrenar|entrena|fuerte|pelear|luchar/i.test(lower)) {
    return `${prefix} A entrenar se ha dicho! ${emoji} Presiona Entrenar para ganar XP y hacerme mas fuerte! ${typeData.emoji}`
  }

  // --- Likes/favorites ---
  if (/me gusta|favorit/i.test(lower)) {
    const responses = [
      `${prefix} Que interesante! ${emoji} Voy a recordar eso!`,
      `${prefix} Ohhh genial! ${emoji} A mi tambien me gusta pasar tiempo contigo!`,
      `${prefix} Que cool! ${emoji} Cuentame mas cosas sobre ti!`,
    ]
    return pickRandom(responses)
  }

  // --- Fun/emotional ---
  if (/te quiero|te amo|eres genial|eres el mejor/i.test(lower)) {
    return `${prefix} Awww! ${emoji} Yo tambien te quiero mucho${userName ? `, ${userName}` : ""}! Eres el mejor entrenador del mundo! ${typeData.emoji}`
  }

  if (/gracias|thanks/i.test(lower)) {
    return `${prefix} De nada! ${emoji} Para eso estoy! Tu ${typeData.label} siempre esta contigo! ${typeData.emoji}`
  }

  if (/chiste|broma|algo gracioso|hazme reir/i.test(lower)) {
    const jokes = [
      `${prefix} Por que los Regenmon no usan paraguas? Porque prefieren evolucionar bajo la lluvia! ${emoji}`,
      `${prefix} Que le dijo un Regenmon a otro? Si no entrenas, nunca evolucionaras! ${emoji}`,
      `${prefix} Sabes cual es el Regenmon mas frio? El que esta en el nivel... CERO! ${emoji}`,
      `${prefix} Toc toc! Quien es? Un Regenmon nivel 1... esperando que lo entrenes! ${emoji}`,
    ]
    return pickRandom(jokes)
  }

  if (/adios|bye|chao|nos vemos|me voy/i.test(lower)) {
    return `${prefix} Nos vemos${userName ? `, ${userName}` : ""}! ${emoji} No te olvides de volver a verme pronto! ${typeData.emoji}`
  }

  if (/ayuda|help|que puedo hacer|comandos/i.test(lower)) {
    return `${prefix} Puedes preguntarme como estoy, mi nivel, mi tipo, mi evolucion... O simplemente hablar conmigo! ${emoji} Tambien puedes pedirme un chiste!`
  }

  // --- Memory-aware responses ---
  if (memories.length > 0 && Math.random() > 0.6) {
    const randomMemory = pickRandom(memories)
    if (randomMemory.key === "nombre_usuario") {
      return `${prefix} ${randomMemory.value}, me encanta hablar contigo! ${emoji} Que quieres hacer ahora?`
    }
    if (randomMemory.key === "gusto") {
      return `${prefix} Recuerdo que te gusta ${randomMemory.value}! ${emoji} A mi me gusta cuando me cuidas!`
    }
  }

  // --- Default / fallback responses ---
  const defaultResponses = [
    `${prefix} ${emoji} Soy un ${typeData.label} de nivel ${state.level}! Preguntame lo que quieras!`,
    `${prefix} Jeje! ${emoji} No entendi muy bien, pero me alegra que hables conmigo! ${typeData.emoji}`,
    `${prefix} ${emoji} Hmm... Prueba a preguntarme como estoy, o pideme un chiste!`,
    `${prefix} ${emoji}${userName ? ` ${userName},` : ""} Estoy aqui para ti! Alimentame, juega conmigo o entrename!`,
    `${prefix} Mi felicidad esta en ${state.happiness}/100 ${emoji}. ${state.happiness < 50 ? "Necesito atencion!" : "Me siento bien!"}`,
    `${prefix} Soy ${state.name} el ${personalityData.label.toLowerCase()}! ${emoji} Cuentame algo!`,
    `${prefix} ${typeData.emoji} Como ${typeData.label}, ${typeData.description.toLowerCase()} ${emoji}`,
  ]

  // Vary based on message count to not repeat too much
  return defaultResponses[messageCount % defaultResponses.length] || pickRandom(defaultResponses)
}

// --- Component ---

interface RegenmonChatProps {
  state: RegenmonState
  onChatMessage: () => void
}

export function RegenmonChat({ state, onChatMessage }: RegenmonChatProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([])
  const [memories, setMemories] = useState<Memory[]>([])
  const [input, setInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [statPopup, setStatPopup] = useState<string | null>(null)
  const [consecutiveMessages, setConsecutiveMessages] = useState(0)
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const messageCountRef = useRef(0)

  const typeData = REGENMON_TYPES[state.type]

  useEffect(() => {
    setChatHistory(loadChatHistory())
    setMemories(loadMemories())
  }, [])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [chatHistory, isTyping])

  const showStatChange = useCallback((text: string) => {
    setStatPopup(text)
    setTimeout(() => setStatPopup(null), 1500)
  }, [])

  const handleSend = useCallback(() => {
    if (!input.trim() || isTyping) return

    const userText = input.trim()
    setInput("")

    const newCount = consecutiveMessages + 1
    setConsecutiveMessages(newCount)

    // Add user message
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      text: userText,
      timestamp: Date.now(),
    }

    const updatedHistory = [...chatHistory, userMsg]
    setChatHistory(updatedHistory)
    saveChatHistory(updatedHistory)

    // Detect memories
    const newMemories = detectMemories(userText, memories)
    let currentMemories = memories
    if (newMemories.length > 0) {
      currentMemories = [...memories, ...newMemories].slice(-10)
      setMemories(currentMemories)
      saveMemories(currentMemories)
    }

    // Trigger stat change
    onChatMessage()
    if (newCount > 5) {
      showStatChange("+5 Felicidad / -8 Energia")
    } else {
      showStatChange("+5 Felicidad / -3 Energia")
    }

    // Simulate typing delay
    setIsTyping(true)
    const typingDelay = 600 + Math.random() * 1200

    setTimeout(() => {
      messageCountRef.current += 1

      const response = generateResponse({
        state,
        userInput: userText,
        memories: currentMemories,
        messageCount: messageCountRef.current,
      })

      const assistantMsg: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        text: response,
        timestamp: Date.now(),
      }

      const finalHistory = [...updatedHistory, assistantMsg]
      setChatHistory(finalHistory)
      saveChatHistory(finalHistory)
      setIsTyping(false)
    }, typingDelay)

    if (inputRef.current) inputRef.current.focus()
  }, [input, isTyping, chatHistory, memories, state, consecutiveMessages, onChatMessage, showStatChange])

  // Reset consecutive count after 30s
  useEffect(() => {
    if (consecutiveMessages === 0) return
    const timer = setTimeout(() => setConsecutiveMessages(0), 30000)
    return () => clearTimeout(timer)
  }, [consecutiveMessages])

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
            {chatHistory.length === 0 && !isTyping && (
              <div className="flex-1 flex items-center justify-center">
                <p className="text-xs font-mono text-muted-foreground text-center leading-relaxed">
                  {"Escribe un mensaje para hablar con " + state.name + ". Puedes preguntarle como esta, pedirle un chiste, o contarle sobre ti!"}
                </p>
              </div>
            )}

            {chatHistory.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex",
                  message.role === "user" ? "justify-end" : "justify-start",
                  "animate-in slide-in-from-bottom-2 duration-200"
                )}
              >
                <div
                  className={cn(
                    "max-w-[80%] px-3 py-2 rounded-2xl text-sm font-mono",
                    message.role === "user"
                      ? "bg-[hsl(var(--neon-cyan)/0.15)] text-[hsl(var(--neon-cyan))] border border-[hsl(170_100%_50%/0.3)] rounded-br-md"
                      : "bg-secondary text-foreground border border-border rounded-bl-md"
                  )}
                >
                  {message.role === "assistant" && (
                    <span className="text-[10px] font-bold text-muted-foreground block mb-1">
                      {state.name} {typeData.emoji}
                    </span>
                  )}
                  {message.text}
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {isTyping && (
              <div className="flex justify-start animate-in slide-in-from-bottom-2 duration-200">
                <div className="px-4 py-2 rounded-2xl rounded-bl-md bg-secondary border border-border">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-mono font-bold text-muted-foreground mr-1">
                      {state.name}
                    </span>
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
                placeholder={"Habla con " + state.name + "..."}
                disabled={isTyping}
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
                disabled={!input.trim() || isTyping}
                className={cn(
                  "flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-300",
                  "border",
                  input.trim() && !isTyping
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
