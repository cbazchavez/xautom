import Anthropic from '@anthropic-ai/sdk';

export const DEFAULT_MODEL = process.env.XAUTOM_MODEL || 'claude-opus-4-8';

/**
 * Llama a la API de Anthropic y devuelve { drafts: [...] }.
 * Lanza un error claro si falta la clave o si la respuesta no es JSON válido.
 */
export async function generarBorradores({ system, user, model = DEFAULT_MODEL, count }) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error(
      'Falta ANTHROPIC_API_KEY. Copia .env.example a .env y pon tu clave, ' +
        'o usa --dry-run para inspeccionar el prompt sin llamar a la API.'
    );
  }

  const client = new Anthropic({ apiKey });

  const message = await client.messages.create({
    model,
    // Margen amplio: ~7 pares EN/ES de hasta 7 tweets entran de sobra.
    max_tokens: Math.min(16000, 2000 + count * 1400),
    system,
    messages: [{ role: 'user', content: user }],
  });

  const texto = message.content
    .filter((b) => b.type === 'text')
    .map((b) => b.text)
    .join('')
    .trim();

  const parsed = extraerJSON(texto);
  if (!parsed?.drafts || !Array.isArray(parsed.drafts)) {
    throw new Error('La respuesta del modelo no traía un arreglo "drafts" válido.');
  }

  return { drafts: parsed.drafts, usage: message.usage, model };
}

/** Tolera que el modelo envuelva el JSON en ```json ... ``` o texto extra. */
function extraerJSON(texto) {
  try {
    return JSON.parse(texto);
  } catch {
    const fence = texto.match(/```(?:json)?\s*([\s\S]*?)```/i);
    if (fence) {
      try {
        return JSON.parse(fence[1]);
      } catch {
        /* sigue intentando */
      }
    }
    const inicio = texto.indexOf('{');
    const fin = texto.lastIndexOf('}');
    if (inicio !== -1 && fin > inicio) {
      try {
        return JSON.parse(texto.slice(inicio, fin + 1));
      } catch {
        /* cae al return null */
      }
    }
    return null;
  }
}
