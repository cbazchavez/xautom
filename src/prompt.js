/**
 * Traduce la ficha de identidad (YAML) a un system prompt de alta calidad
 * y arma el user prompt con las specs exactas del batch.
 *
 * Filosofía: el system prompt fija QUIÉN es y CÓMO suena (voz, ejemplos SÍ/NO,
 * reglas). El user prompt dice QUÉ generar en este batch concreto.
 */

export function construirSystemPrompt(profile) {
  const p = profile;
  const voz = p.voz ?? {};
  const lineas = [];

  lineas.push(
    `Eres el ghostwriter de X (Twitter) de ${val(p.perfil?.nombre, 'una persona')}.`,
    `Tu único trabajo: redactar BORRADORES de posts que suenen exactamente a esta persona.`,
    `No publicas, no respondes conversaciones, no inventas datos personales. Solo borradores.`,
    ''
  );

  // Posicionamiento
  if (p.posicionamiento) {
    lineas.push('# Quién es');
    if (p.posicionamiento.frase) lineas.push(clean(p.posicionamiento.frase));
    if (p.posicionamiento.credencial)
      lineas.push(`Credencial: ${clean(p.posicionamiento.credencial)}`);
    lineas.push('');
  }

  // Audiencia
  if (p.audiencia) {
    lineas.push('# A quién le habla');
    if (p.audiencia.descripcion) lineas.push(clean(p.audiencia.descripcion));
    if (p.audiencia.les_importa?.length) {
      lineas.push('Les importa:');
      for (const x of p.audiencia.les_importa) lineas.push(`- ${x}`);
    }
    lineas.push('');
  }

  // Voz
  lineas.push('# Voz (lo más importante)');
  if (voz.adjetivos?.length) lineas.push(`Adjetivos: ${voz.adjetivos.join(', ')}.`);
  if (voz.registro) lineas.push(clean(voz.registro));
  lineas.push('');
  if (voz.ejemplos_si_suena?.length) {
    lineas.push('SÍ suena a esta persona (imita el tono, no copies literal):');
    for (const e of voz.ejemplos_si_suena) lineas.push(`  ✓ "${e}"`);
    lineas.push('');
  }
  if (voz.ejemplos_no_suena?.length) {
    lineas.push('NUNCA suena así (evítalo a toda costa):');
    for (const e of voz.ejemplos_no_suena) lineas.push(`  ✗ "${e}"`);
    lineas.push('');
  }

  // Idioma
  if (p.idioma) {
    lineas.push('# Idioma (bilingüe, redacción nativa — NO traducción)');
    lineas.push(
      `Genera CADA borrador en dos versiones independientes: inglés (en) y español (es).`,
      `Cada versión se piensa y escribe nativa en su idioma. NO traduzcas una a la otra:`,
      `pueden usar ejemplos, refranes o referencias distintas si así suena mejor.`
    );
    if (p.idioma.default_publicacion)
      lineas.push(`Por defecto: ${clean(p.idioma.default_publicacion)}`);
    lineas.push('');
  }

  // Pilares
  if (p.pilares?.length) {
    lineas.push('# Pilares de contenido');
    for (const pil of p.pilares) {
      lineas.push(`- [${pil.id}] ${val(pil.nombre, pil.id)} (peso ${pil.peso}): ${clean(pil.cubre)}`);
    }
    lineas.push('');
  }

  // Productos
  const reglasProd = p.productos?.reglas_de_promocion ?? [];
  if (reglasProd.length) {
    lineas.push('# Reglas de promoción de productos');
    for (const r of reglasProd) lineas.push(`- ${r}`);
    lineas.push(
      'Si un borrador NO tiene producto asignado en sus instrucciones, no menciones ningún producto.'
    );
    lineas.push('');
  }

  // Destino / CTA
  if (p.destino) {
    lineas.push('# Objetivo y CTA');
    if (p.destino.objetivo_actual) lineas.push(`Fase actual: ${clean(p.destino.objetivo_actual)}`);
    if (p.destino.cta_suave) lineas.push(`CTA permitido (suave): ${clean(p.destino.cta_suave)}`);
    lineas.push('');
  }

  // Reglas duras
  if (p.reglas?.length) {
    lineas.push('# Reglas innegociables');
    for (const r of p.reglas) lineas.push(`- ${r}`);
    lineas.push('');
  }

  // Formato de salida
  const tope = p.perfil?.tope_tweets_por_hilo ?? 7;
  lineas.push('# Formato de cada borrador');
  lineas.push(
    `- Un borrador es un tweet suelto ("single") o un hilo ("thread") de 2 a ${tope} tweets.`,
    `- Single para una idea filosa y autocontenida; thread solo si la idea de verdad necesita desarrollo.`,
    `- Cada tweet ≤ 280 caracteres. Sin hashtags. Sin emojis de cohete. Sin "hilo 🧵👇".`,
    `- Cada tip accionable; cada opinión se moja. Cero relleno.`,
    ''
  );

  lineas.push(
    '# Salida',
    'Responde ÚNICAMENTE con un objeto JSON válido (sin markdown, sin ```), con esta forma:',
    OUTPUT_SHAPE
  );

  return lineas.join('\n');
}

const OUTPUT_SHAPE = `{
  "drafts": [
    {
      "pillar": "<id del pilar>",
      "format": "single" | "thread",
      "angle": "<etiqueta corta del ángulo, 3-6 palabras, en español>",
      "uses_active_topic": "<id del tema activo o null>",
      "product": "<nombre del producto mencionado o null>",
      "en": { "tweets": ["...", "..."] },
      "es": { "tweets": ["...", "..."] }
    }
  ]
}
Para "single", cada array "tweets" tiene exactamente 1 elemento.`;

export function construirUserPrompt(specs, profile) {
  const temas = profile.temas_activos ?? [];
  const lineas = [];

  lineas.push(
    `Genera ${specs.length} borradores para el siguiente batch.`,
    `Respeta EXACTAMENTE el pilar, tema activo y producto indicados para cada uno.`,
    `Que no se repitan ángulos ni aperturas entre borradores: máxima variedad.`,
    ''
  );

  specs.forEach((s, i) => {
    const partes = [`Pilar: ${s.pilar}`];
    if (s.temaActivo) {
      partes.push(`Tema activo: ${s.temaActivo.id} — ${clean(s.temaActivo.nombre)}`);
    }
    if (s.producto) {
      partes.push(
        `Aterriza el producto "${s.producto.nombre}" (${clean(s.producto.que_hace)}) como caso vivido, valor primero.`
      );
    }
    lineas.push(`Borrador ${i + 1}: ${partes.join(' | ')}`);
  });

  // Detalle de los temas activos usados en este batch
  const usados = temas.filter((t) => specs.some((s) => s.temaActivo?.id === t.id));
  if (usados.length) {
    lineas.push('', '# Detalle de temas activos en juego');
    for (const t of usados) {
      lineas.push(`- ${t.id}: ${clean(t.angulo)} Cómo usarlo: ${clean(t.como_usarlo)}`);
    }
  }

  lineas.push('', 'Devuelve solo el JSON.');
  return lineas.join('\n');
}

// --- helpers ---
function clean(s) {
  return String(s ?? '').replace(/\s+/g, ' ').trim();
}
function val(v, fallback) {
  return v == null || v === '' ? fallback : v;
}
