"use client"

import { useCallback, useRef } from "react"
import { GameHeader } from "@/components/game-header"
import { RegenmonCard } from "@/components/regenmon-card"
import { RegenmonCreator } from "@/components/regenmon-creator"
import { RegenmonChat } from "@/components/regenmon-chat"
import { useRegenmon } from "@/hooks/use-regenmon"

export default function Home() {
  const regenmon = useRegenmon()
  const consecutiveRef = useRef(0)

  const handleChatMessage = useCallback(() => {
    consecutiveRef.current += 1
    regenmon.chatMessage(consecutiveRef.current)
  }, [regenmon.chatMessage])

  return (
    <main className="relative min-h-screen flex flex-col items-center justify-start px-4 py-8 overflow-hidden">
      {/* Background grid pattern */}
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

      {/* Ambient glow spots */}
      <div className="pointer-events-none fixed top-1/4 left-1/4 w-96 h-96 rounded-full bg-[hsl(170_100%_50%/0.03)] blur-3xl" />
      <div className="pointer-events-none fixed bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-[hsl(330_100%_60%/0.03)] blur-3xl" />

      <div className="relative z-10 w-full max-w-lg flex flex-col items-center gap-4 pb-8">
        <GameHeader />
        {regenmon.mounted ? (
          regenmon.hasRegenmon && regenmon.state ? (
            <>
              <RegenmonCard
                state={regenmon.state}
                cooldown={regenmon.cooldown}
                celebrating={regenmon.celebrating}
                xpPerLevel={regenmon.xpPerLevel}
                onFeed={regenmon.feed}
                onPlay={regenmon.play}
                onTrain={regenmon.train}
                onSetName={regenmon.setName}
                onReset={regenmon.resetGame}
              />
              <RegenmonChat
                state={regenmon.state}
                onChatMessage={handleChatMessage}
              />
            </>
          ) : (
            <RegenmonCreator onCreate={regenmon.createRegenmon} />
          )
        ) : (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="w-8 h-8 border-2 border-[hsl(var(--neon-cyan))] border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>
    </main>
  )
}
