/**
 * Loop de medición: convierte el registro manual de métricas de X (analytics
 * nativo, sin API) en un reporte por pilar / formato / idioma, y sugiere cómo
 * recalibrar los pesos de la ficha.
 *
 * Filosofía (la misma que le dijimos a Luis): ningún número avala un post antes
 * de publicarlo. Esto NO predice; mide lo ya publicado y cierra el loop hacia
 * `profiles/<id>.yaml`. Con muestra pequeña, no sugiere pesos en vez de
 * inventar señal.
 */

// Columnas del registro (metrics/<id>.csv). El motor siembra las primeras 6;
// Luis llena de `published_at` en adelante con lo que ve en X Analytics.
export const COLUMNS = [
  'batch',          // fecha del batch (p.ej. 2026-06-23)
  'draft',          // # de borrador dentro del batch
  'lang',           // en | es
  'pillar',         // pilar (sembrado del batch)
  'format',         // single | thread (sembrado del batch)
  'active_topic',   // id del tema activo o vacío (sembrado del batch)
  'published_at',   // fecha de publicación (lo llena Luis)
  'url',            // link al post
  'impressions',    // --- de aquí en adelante, de X Analytics ---
  'likes',
  'replies',
  'reposts',
  'bookmarks',
  'profile_clicks',
  'link_clicks',    // clics a la liga del post (embudo; NO entra al score de alcance)
  'follows',
  'notes',
];

/**
 * Pesos del heavy-ranker OPEN-SOURCE de X (README de the-algorithm-ml, 5-abr-2023):
 * like 0.5, retweet/repost 1, reply 13.5, profile-click ("good") 12. Son los valores
 * CRUDOS del código, no la "fórmula simplificada" que circula en blogs (esa infla el
 * repost a 20 y no tiene respaldo en la fuente primaria).
 *
 * bookmarks=10 es una ESTIMACIÓN: X confirmó en 2024 que los bookmarks cuentan para el
 * alcance, pero nunca publicó un peso oficial. Direccionalmente plausible, no es un hecho.
 *
 * Señales más fuertes del algoritmo que NO entran aquí porque la analítica nativa no las
 * expone: reply respondido por el autor = 75 (el peso positivo #1), permanencia ≥2 min = 11,
 * report = −369, mute/block = −74. El score mide solo lo que Luis puede copiar a mano.
 *
 * Fuente: github.com/twitter/the-algorithm-ml/blob/main/projects/home/recap/README.md
 * Ajústalos si X publica nuevos (el propio README dice que viven en un config y se recalibran).
 */
export const ALGO_PESOS = {
  likes: 0.5,
  reposts: 1,
  replies: 13.5,
  profile_clicks: 12,
  bookmarks: 10, // estimación: X confirma que cuenta, sin número oficial
};

const ORDEN_PESO = ['alto', 'medio', 'medio', 'bajo']; // mapa rank→peso (4 pilares)

// --------------------------------------------------------------------------
// Métricas por post
// --------------------------------------------------------------------------

/**
 * Métricas de un post publicado. Devuelve null si la fila no tiene
 * impresiones (= no publicado todavía / sin datos), para ignorarla.
 */
export function metricasPost(row) {
  const imp = num(row.impressions);
  if (!imp) return null;

  const e = {
    likes: num(row.likes),
    replies: num(row.replies),
    reposts: num(row.reposts),
    bookmarks: num(row.bookmarks),
    profile_clicks: num(row.profile_clicks),
    link_clicks: num(row.link_clicks),
    follows: num(row.follows),
  };

  const engagements =
    e.likes + e.replies + e.reposts + e.bookmarks + e.profile_clicks;

  const reachScore =
    (e.likes * ALGO_PESOS.likes +
      e.reposts * ALGO_PESOS.reposts +
      e.replies * ALGO_PESOS.replies +
      e.profile_clicks * ALGO_PESOS.profile_clicks +
      e.bookmarks * ALGO_PESOS.bookmarks) /
    imp;

  return {
    imp,
    ...e,
    er: engagements / imp,                                  // ER por impresiones
    reachScore,                                             // ponderado por algoritmo
    bookmarkRate: e.bookmarks / imp,                        // north star 1
    replyRate: e.replies / imp,                             // señal de conversación
    linkClickRate: e.link_clicks / imp,                     // embudo (no entra al score)
    followRate: e.follows / imp,
    followPerVisit: e.profile_clicks ? e.follows / e.profile_clicks : 0, // north star 2
  };
}

/** Toma filas crudas y devuelve solo las publicadas, con sus métricas. */
export function postsPublicados(rows) {
  return rows
    .map((row) => ({ row, m: metricasPost(row) }))
    .filter((p) => p.m !== null);
}

// --------------------------------------------------------------------------
// Agregación
// --------------------------------------------------------------------------

const PROMEDIABLES = [
  'er',
  'reachScore',
  'bookmarkRate',
  'replyRate',
  'linkClickRate',
  'followRate',
  'followPerVisit',
];

/** Agrupa posts por una clave (pilar/formato/idioma) y promedia sus métricas. */
export function agrupar(posts, keyFn) {
  const grupos = new Map();
  for (const p of posts) {
    const k = keyFn(p.row) || '(sin etiqueta)';
    if (!grupos.has(k)) grupos.set(k, []);
    grupos.get(k).push(p.m);
  }
  const filas = [];
  for (const [clave, ms] of grupos) {
    const fila = { clave, n: ms.length, impTotal: sum(ms.map((m) => m.imp)) };
    for (const k of PROMEDIABLES) fila[k] = mean(ms.map((m) => m[k]));
    filas.push(fila);
  }
  return filas.sort((a, b) => b.reachScore - a.reachScore);
}

export function mediana(nums) {
  if (nums.length === 0) return 0;
  const s = [...nums].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
}

// --------------------------------------------------------------------------
// Sugerencia de pesos (con guardarraíles de muestra)
// --------------------------------------------------------------------------

/**
 * Propone pesos por pilar SOLO si hay muestra suficiente. Con poca data
 * devuelve { suficiente:false } y un motivo — nunca inventa una recomendación.
 */
export function sugerirPesos(porPilar, { total, minTotal = 15, minPorPilar = 4, pilaresEsperados = [] }) {
  if (total < minTotal) {
    return { suficiente: false, motivo: `Solo ${total} posts medidos (mínimo ${minTotal}). Sigue publicando; con esta muestra no se ajustan pesos.` };
  }
  const faltantes = pilaresEsperados.filter(
    (id) => !porPilar.some((f) => f.clave === id)
  );
  if (faltantes.length) {
    return { suficiente: false, motivo: `Sin datos para: ${faltantes.join(', ')}. Publica al menos uno de cada pilar antes de recalibrar.` };
  }
  const flojos = porPilar.filter((f) => f.n < minPorPilar);
  if (flojos.length) {
    return { suficiente: false, motivo: `Pilares con muestra pequeña (<${minPorPilar}): ${flojos.map((f) => `${f.clave} (n=${f.n})`).join(', ')}. Todavía no es señal confiable.` };
  }
  const ranked = [...porPilar].sort((a, b) => b.reachScore - a.reachScore);
  const sugerencia = ranked.map((f, i) => ({
    id: f.clave,
    pesoSugerido: ORDEN_PESO[Math.min(i, ORDEN_PESO.length - 1)],
    reachScore: f.reachScore,
    n: f.n,
  }));
  return { suficiente: true, sugerencia };
}

// --------------------------------------------------------------------------
// Sembrado del registro desde el sidecar del batch
// --------------------------------------------------------------------------

/** Filas semilla (una por draft × idioma) con la metadata ya rellenada. */
export function filasSemilla(sidecar, langs = ['en', 'es']) {
  const drafts = Array.isArray(sidecar) ? sidecar : sidecar.drafts ?? [];
  const batch = Array.isArray(sidecar) ? '' : sidecar.fecha ?? '';
  const filas = [];
  drafts.forEach((d, i) => {
    for (const lang of langs) {
      filas.push({
        batch,
        draft: String(i + 1),
        lang,
        pillar: d.pillar ?? '',
        format: d.format ?? '',
        active_topic: d.uses_active_topic ?? '',
        published_at: '',
        url: '',
        impressions: '',
        likes: '',
        replies: '',
        reposts: '',
        bookmarks: '',
        profile_clicks: '',
        link_clicks: '',
        follows: '',
        notes: '',
      });
    }
  });
  return filas;
}

/** Clave única de una fila del registro, para deduplicar al sembrar. */
export const claveFila = (f) => `${f.batch}|${f.draft}|${f.lang}`;

// --------------------------------------------------------------------------
// CSV mínimo (soporta campos entre comillas dobles con comas internas)
// --------------------------------------------------------------------------

export function parseCSV(text) {
  const lineas = String(text)
    .split(/\r?\n/)
    .filter((l) => l.trim() !== '');
  if (lineas.length === 0) return { header: [], rows: [] };
  const header = parseLinea(lineas[0]);
  const rows = lineas.slice(1).map((l) => {
    const celdas = parseLinea(l);
    const obj = {};
    header.forEach((h, i) => (obj[h] = celdas[i] ?? ''));
    return obj;
  });
  return { header, rows };
}

export function toCSV(rows, header = COLUMNS) {
  const líneas = [header.map(esc).join(',')];
  for (const r of rows) líneas.push(header.map((h) => esc(r[h] ?? '')).join(','));
  return líneas.join('\n') + '\n';
}

function parseLinea(linea) {
  const out = [];
  let cur = '';
  let enComillas = false;
  for (let i = 0; i < linea.length; i++) {
    const c = linea[i];
    if (enComillas) {
      if (c === '"') {
        if (linea[i + 1] === '"') { cur += '"'; i++; }
        else enComillas = false;
      } else cur += c;
    } else if (c === '"') {
      enComillas = true;
    } else if (c === ',') {
      out.push(cur); cur = '';
    } else cur += c;
  }
  out.push(cur);
  return out.map((s) => s.trim());
}

function esc(v) {
  const s = String(v ?? '');
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

// --------------------------------------------------------------------------
// helpers
// --------------------------------------------------------------------------
function num(v) {
  const n = Number(String(v ?? '').replace(/[, ]/g, ''));
  return Number.isFinite(n) ? n : 0;
}
function sum(a) { return a.reduce((s, x) => s + x, 0); }
function mean(a) { return a.length ? sum(a) / a.length : 0; }
