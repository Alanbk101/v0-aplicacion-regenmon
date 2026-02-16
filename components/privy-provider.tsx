"use client"

import { createContext, useContext } from "react"
import { PrivyProvider as BasePrivyProvider } from "@privy-io/react-auth"

const PRIVY_APP_ID = process.env.NEXT_PUBLIC_PRIVY_APP_ID

// Context to signal if Privy is available
const PrivyAvailableContext = createContext(false)

export function useIsPrivyAvailable() {
  return useContext(PrivyAvailableContext)
}

export function PrivyProvider({ children }: { children: React.ReactNode }) {
  if (!PRIVY_APP_ID) {
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
          loginMethods: ["google", "email"],
          appearance: {
            theme: "dark",
            accentColor: "#00FFCC",
            showWalletLoginFirst: false,
          },
          embeddedWallets: {
            createOnLogin: "off",
          },
        }}
      >
        {children}
      </BasePrivyProvider>
    </PrivyAvailableContext.Provider>
  )
}
