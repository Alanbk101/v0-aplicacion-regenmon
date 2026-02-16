"use client"

import { createContext, useContext } from "react"

const PRIVY_APP_ID = process.env.NEXT_PUBLIC_PRIVY_APP_ID

// Context to signal if Privy is available
const PrivyAvailableContext = createContext(false)

export function useIsPrivyAvailable() {
  return useContext(PrivyAvailableContext)
}

export function PrivyProvider({ children }: { children: React.ReactNode }) {
  // Always render without Privy — the user can add NEXT_PUBLIC_PRIVY_APP_ID later
  // to enable authentication. The game works fully without it.
  void PRIVY_APP_ID
  return (
    <PrivyAvailableContext.Provider value={false}>
      {children}
    </PrivyAvailableContext.Provider>
  )
}
