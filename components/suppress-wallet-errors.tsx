"use client"

import { useEffect } from "react"

/**
 * Suppresses unhandled promise rejections caused by browser wallet extensions
 * (MetaMask, Backpack, etc.) that inject scripts and try to interact with
 * window.ethereum on every page — even when the app has no Web3 functionality.
 */
export function SuppressWalletErrors() {
  useEffect(() => {
    function handleUnhandledRejection(event: PromiseRejectionEvent) {
      const message =
        event.reason?.message || event.reason?.toString?.() || ""

      // Suppress wallet-extension errors that are not related to our app
      if (
        message.includes("MetaMask") ||
        message.includes("window.ethereum") ||
        message.includes("Backpack") ||
        message.includes("chrome-extension://")
      ) {
        event.preventDefault()
      }
    }

    window.addEventListener("unhandledrejection", handleUnhandledRejection)
    return () => {
      window.removeEventListener(
        "unhandledrejection",
        handleUnhandledRejection
      )
    }
  }, [])

  return null
}
