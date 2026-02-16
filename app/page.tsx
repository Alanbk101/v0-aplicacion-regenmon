"use client"

import { useState, useEffect, useCallback } from "react"
import { GameHeader } from "@/components/game-header"
import { RegenmonCard } from "@/components/regenmon-card"
import { useCoins } from "@/hooks/use-coins"
import { useActionHistory } from "@/hooks/use-action-history"

/* ---------- inline auth (no external deps, works with React 19) ---------- */
const AUTH_KEY = "regenmon-auth"

function loadAuth(): { id: string; email: string } | null {
  if (typeof window === "undefined") return null
  try {
    const raw = localStorage.getItem(AUTH_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function saveAuth(u: { id: string; email: string } | null) {
  if (typeof window === "undefined") return
  if (u) localStorage.setItem(AUTH_KEY, JSON.stringify(u))
  else localStorage.removeItem(AUTH_KEY)
}

function useAuth() {
  const [user, setUser] = useState<{ id: string; email: string } | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    setUser(loadAuth())
    setReady(true)
  }, [])

  const login = useCallback(() => {
    const email = window.prompt(
      "Ingresa tu email o Gmail para iniciar sesion:"
    )
    if (!email?.trim()) return
    const t = email.trim().toLowerCase()
    if (!t.includes("@") || !t.includes(".")) {
      window.alert("Por favor ingresa un email valido.")
      return
    }
    const next = { id: `user-${btoa(t)}`, email: t }
    setUser(next)
    saveAuth(next)
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    saveAuth(null)
  }, [])

  return {
    ready,
    authenticated: !!user,
    user,
    login,
    logout,
  }
}

/* ---------- page component ---------- */
export default function Home() {
  const { ready, authenticated, user, login, logout } = useAuth()
  const userId = user?.id ?? null
  const userEmail = user?.email ?? null

  const {
    coins,
    coinDelta,
    spendCoins,
    earnCoins,
    canAfford,
    tryEarnFromChat,
    feedCost,
  } = useCoins(userId)
  const { history, logAction } = useActionHistory(userId)

  if (!ready) {
    return (
      <main className="relative min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-2 border-[hsl(170_100%_50%)] border-t-transparent rounded-full animate-spin" />
      </main>
    )
  }

  return (
    <main className="relative min-h-screen flex flex-col items-center justify-center px-4 py-8 overflow-hidden">
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

      {/* Ambient glow */}
      <div className="pointer-events-none fixed top-1/4 left-1/4 w-96 h-96 rounded-full bg-[hsl(170_100%_50%/0.03)] blur-3xl" />
      <div className="pointer-events-none fixed bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-[hsl(330_100%_60%/0.03)] blur-3xl" />

      <div className="relative z-10 w-full max-w-md flex flex-col items-center gap-2">
        <GameHeader
          authenticated={authenticated}
          userEmail={userEmail}
          coins={coins}
          coinDelta={coinDelta}
          onLogin={login}
          onLogout={logout}
        />
        <RegenmonCard
          userId={userId}
          authenticated={authenticated}
          coins={coins}
          feedCost={feedCost}
          canAfford={canAfford}
          spendCoins={spendCoins}
          earnCoins={earnCoins}
          tryEarnFromChat={tryEarnFromChat}
          logAction={logAction}
          history={history}
        />
      </div>
    </main>
  )
}
