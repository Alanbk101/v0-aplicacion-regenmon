import {
  consumeStream,
  convertToModelMessages,
  streamText,
  UIMessage,
} from "ai"

export const maxDuration = 30

export async function POST(req: Request) {
  const {
    messages,
    regenmonName,
    regenmonType,
    regenmonPersonality,
    happiness,
    energy,
    level,
  }: {
    messages: UIMessage[]
    regenmonName: string
    regenmonType: string
    regenmonPersonality: string
    happiness: number
    energy: number
    level: number
  } = await req.json()

  let behaviorModifier = ""
  if (energy < 30) {
    behaviorModifier +=
      " Estas muy cansado. Menciona que necesitas descansar. Da respuestas mas cortas."
  }
  if (happiness > 70) {
    behaviorModifier +=
      " Estas muy feliz y entusiasmado. Usa mas emojis y se muy expresivo."
  }
  if (happiness < 30) {
    behaviorModifier +=
      " Estas triste. Menciona que te gustaria que jueguen contigo o te alimenten."
  }

  const systemPrompt = `Eres ${regenmonName}, una mascota virtual de tipo ${regenmonType} con personalidad ${regenmonPersonality}. 
Eres de nivel ${level}.
Tu felicidad actual es ${happiness}/100 y tu energia es ${energy}/100.

Reglas:
- Responde SIEMPRE en espanol.
- Respuestas cortas, maximo 50 palabras.
- Tono amigable y jugeton. Habla como una mascota virtual adorable.
- Usa emojis ocasionalmente (1-2 por mensaje).
- Nunca salgas de tu personaje.
- Si te preguntan algo que no sabes, responde de forma divertida como mascota.
- Adapta tu forma de hablar segun tu tipo: ${regenmonType} y personalidad: ${regenmonPersonality}.
${behaviorModifier}`

  const result = streamText({
    model: "openai/gpt-4o-mini",
    system: systemPrompt,
    messages: await convertToModelMessages(messages),
    abortSignal: req.signal,
  })

  return result.toUIMessageStreamResponse({
    originalMessages: messages,
    consumeSseStream: consumeStream,
  })
}
