"use client"

export function GameHeader() {
  return (
    <header className="flex flex-col items-center gap-1 py-6">
      <div className="flex items-center gap-2">
        <span className="text-3xl" role="img" aria-label="huevo">{"🥚"}</span>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tighter font-mono">
          <span className="text-[hsl(var(--neon-cyan))]">REGEN</span>
          <span className="text-[hsl(var(--neon-pink))]">MON</span>
        </h1>
      </div>
      <p className="text-xs font-mono tracking-[0.3em] uppercase text-muted-foreground">
        Mascota Virtual
      </p>
      {/* Scan line decoration */}
      <div className="w-48 h-px mt-2 bg-gradient-to-r from-transparent via-[hsl(var(--neon-cyan))] to-transparent opacity-50" />
    </header>
  )
}
