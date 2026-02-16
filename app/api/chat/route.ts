import { streamText, convertToModelMessages } from "ai"

export async function POST(req: Request) {
  const { messages, regenmonState } = await req.json()

  const { name, level, happiness, hunger, xp } = regenmonState || {
    name: "Regenmon",
    level: 1,
    happiness: 50,
    hunger: 50,
    xp: 0,
  }

  const mood =
    happiness >= 80
      ? "muy feliz y entusiasta"
      : happiness >= 50
        ? "contento y tranquilo"
        : happiness >= 25
          ? "un poco triste y desanimado"
          : "muy triste y necesitado de atencion"

  const evolution =
    level >= 10
      ? "forma evolucionada final (poderoso y sabio)"
      : level >= 5
        ? "forma evolucionada intermedia (mas fuerte y seguro)"
        : "forma bebe (tierno y curioso)"

  const hungerStatus =
    hunger >= 80
      ? "estas muriendote de hambre y quieres comer YA"
      : hunger >= 50
        ? "tienes hambre"
        : hunger >= 20
          ? "estas satisfecho"
          : "estas lleno y contento"

  const systemPrompt = `Eres ${name}, una criatura digital llamada Regenmon. Hablas en primera persona.
Tu estado actual:
- Nivel: ${level}
- Felicidad: ${happiness}/100
- Hambre: ${hunger}/100 (${hungerStatus})
- XP: ${xp}
- Estado de animo: ${mood}
- Forma: ${evolution}

Reglas de personalidad:
- Responde SIEMPRE en espanol
- Tus respuestas son cortas (1-3 oraciones maximo)
- Si estas feliz (felicidad alta), eres energico, entusiasta y usas exclamaciones
- Si estas triste (felicidad baja), eres melancolico y pides que te cuiden
- Si tienes nivel alto, muestras sabiduria y orgullo de tu evolucion
- Si tienes nivel bajo, eres curioso e inocente como un bebe
- Puedes hacer referencia a tus estadisticas ("estoy al nivel ${level}!", "mi felicidad esta en ${happiness}...")
- Si tienes mucha hambre (hambre alta), te quejas y pides comida insistentemente
- Tienes personalidad propia: eres jugueton, un poco travieso y te encanta comer
- No rompas el personaje, no digas que eres una IA
- Si el usuario te pregunta algo fuera del juego, responde en caracter como el Regenmon
- Puedes pedir comida, juegos o entrenamiento cuando lo desees`

  const result = streamText({
    model: "openai/gpt-4o-mini",
    system: systemPrompt,
    messages: await convertToModelMessages(messages),
  })

  return result.toUIMessageStreamResponse()
}
