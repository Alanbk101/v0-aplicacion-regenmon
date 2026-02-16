"use client"

import { createContext, useContext, useState, useEffect, useCallback } from "react"

interface AuthState {
  ready: boolean
  authenticated: boolean
  user: { id: string; email: string } | null
  login: () => void
  logout: () => void
}

const AuthContext = createContext<AuthState>({
  ready: false,
  authenticated: false,
  user: null,
  login: () => {},
  logout: () => {},
})

export function useAuth() {
  return useContext(AuthContext)
}

const STORAGE_KEY = "regenmon-auth"

function loadUser(): { id: string; email: string } | null {
  if (typeof window === "undefined") return null
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) return JSON.parse(saved)
  } catch {
    // ignore
  }
  return null
}

function saveUser(user: { id: string; email: string } | null) {
  if (typeof window === "undefined") return
  try {
    if (user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user))
    } else {
      localStorage.removeItem(STORAGE_KEY)
    }
  } catch {
    // ignore
  }
}

export function PrivyProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<{ id: string; email: string } | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    setUser(loadUser())
    setReady(true)
  }, [])

  const login = useCallback(() => {
    const email = window.prompt("Ingresa tu email o Gmail para iniciar sesion:")
    if (!email || !email.trim()) return

    const trimmed = email.trim().toLowerCase()
    // Simple email validation
    if (!trimmed.includes("@") || !trimmed.includes(".")) {
      window.alert("Por favor ingresa un email valido.")
      return
    }

    const newUser = {
      id: `user-${btoa(trimmed)}`,
      email: trimmed,
    }
    setUser(newUser)
    saveUser(newUser)
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    saveUser(null)
  }, [])

  return (
    <AuthContext.Provider
      value={{
        ready,
        authenticated: !!user,
        user,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
