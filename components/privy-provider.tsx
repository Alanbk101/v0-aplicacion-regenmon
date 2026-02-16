"use client"

import { createContext, useContext } from "react"
import { PrivyProvider as BasePrivyProvider } from "@privy-io/react-auth"

const PRIVY_APP_ID = process.env.NEXT_PUBLIC_PRIVY_APP_ID

console.log("[v0] PRIVY_APP_ID available:", !!PRIVY_APP_ID)

// Context to signal if Privy is available
const PrivyAvailableContext = createContext(false)

export function useIsPrivyAvailable() {
  return useContext(PrivyAvailableContext)
}

export function PrivyProvider({ children }: { children: React.ReactNode }) {
  if (!PRIVY_APP_ID) {
    console.log("[v0] No PRIVY_APP_ID, rendering without Privy")
    return (
      <PrivyAvailableContext.Provider value={false}>
        {children}
      </PrivyAvailableContext.Provider>
    )
  }

  return (
    <PrivyAvailableContext.Provider value={true}>
      <BasePrivyProvider
        appId={PRIVY_APP_ID}
        config={{
          appearance: {
            theme: "dark",
            accentColor: "#00FFCC",
          },
        }}
      >
        {children}
      </BasePrivyProvider>
    </PrivyAvailableContext.Provider>
  )
}
