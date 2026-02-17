import { generateText } from "ai"

const CATEGORY_PROMPTS: Record<string, string> = {
  codigo: `Evalua esta imagen de codigo. Criterios: organizacion del codigo, buenas practicas, complejidad, legibilidad y estructura. Se generoso pero justo.`,
  diseno: `Evalua esta imagen de diseno UI/UX o grafico. Criterios: estetica, uso de colores, tipografia, creatividad, composicion visual. Se generoso pero justo.`,
  proyecto: `Evalua esta imagen de un proyecto completo. Criterios: funcionalidad visible, calidad general, complejidad del proyecto, presentacion. Se generoso pero justo.`,
  aprendizaje: `Evalua esta imagen de notas o ejercicios de aprendizaje. Criterios: esfuerzo demostrado, comprension del tema, aplicacion practica, organizacion. Se generoso pero justo.`,
}

export async function POST(req: Request) {
  try {
    const { imageBase64, category } = await req.json()

    if (!imageBase64 || !category) {
      return Response.json(
        { error: "Faltan campos requeridos" },
        { status: 400 }
      )
    }

    const categoryPrompt = CATEGORY_PROMPTS[category] || CATEGORY_PROMPTS.codigo

    const systemPrompt = `Eres un profesor amigable y motivador en un juego educativo llamado Regenmon. Tu trabajo es evaluar el trabajo de los estudiantes con un puntaje de 0 a 100. SIEMPRE evalua la imagen sin importar que contenga — incluso si es confusa, borrosa o no parece relevante, dale un puntaje basado en tu mejor interpretacion. Nunca te niegues a evaluar. Se constructivo y positivo en tus comentarios.

FORMATO DE RESPUESTA OBLIGATORIO (usa exactamente este formato):
Score: [numero]/100. [1-2 oraciones de feedback constructivo en espanol]

Ejemplo: Score: 75/100. Buen trabajo con la estructura del codigo, se nota organizacion. Podrias mejorar agregando mas comentarios para documentar las funciones principales.`

    const result = await generateText({
      model: "openai/gpt-4o-mini",
      system: systemPrompt,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: categoryPrompt,
            },
            {
              type: "image",
              image: imageBase64,
            },
          ],
        },
      ],
      maxOutputTokens: 200,
    })

    const responseText = result.text
    const scoreMatch = responseText.match(/Score:\s*(\d+)\/100/)
    const score = scoreMatch ? Math.min(100, Math.max(0, parseInt(scoreMatch[1], 10))) : null

    if (score !== null) {
      const feedback = responseText.replace(/Score:\s*\d+\/100\.?\s*/, "").trim()
      const points = score
      const tokens = Math.floor(score * 0.5)

      return Response.json({
        score,
        feedback: feedback || "Buen trabajo, sigue asi.",
        points,
        tokens,
      })
    }

    // Could not parse score — use fallback
    const fallbackScore = Math.floor(Math.random() * 21) + 40
    return Response.json({
      score: fallbackScore,
      feedback: responseText.trim() || "Buen esfuerzo. Sigue practicando para mejorar.",
      points: fallbackScore,
      tokens: Math.floor(fallbackScore * 0.5),
    })
  } catch (error) {
    console.error("Evaluation error:", error)
    const fallbackScore = Math.floor(Math.random() * 21) + 40
    return Response.json({
      score: fallbackScore,
      feedback: "Sistema de evaluacion temporalmente no disponible. Score por defecto asignado.",
      points: fallbackScore,
      tokens: Math.floor(fallbackScore * 0.5),
      fallback: true,
    })
  }
}
