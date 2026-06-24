#!/usr/bin/env node
import { parseArgs } from 'node:util';
import { readFile, writeFile, mkdir, readdir } from 'node:fs/promises';
import { resolve, join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import { loadProfile } from './profile.js';
import {
  parseCSV, toCSV, COLUMNS,
  filasSemilla, claveFila,
  postsPublicados, agrupar, mediana, sugerirPesos,
} from './metrics.js';
import { renderReporte, resumenConsola } from './report.js';
import { renderDashboard } from './dashboard.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

async function main() {
  const { values, positionals } = parseArgs({
    allowPositionals: true,
    options: {
      profile: { type: 'string', short: 'p', default: 'luis' },
      batch: { type: 'string', short: 'b' },
      file: { type: 'string', short: 'f' },
      out: { type: 'string', short: 'o' },
      langs: { type: 'string', default: 'en,es' },
      'min-total': { type: 'string', default: '15' },
      'min-pilar': { type: 'string', default: '4' },
      followers: { type: 'string' },
      demo: { type: 'boolean', default: false },
      help: { type: 'boolean', short: 'h', default: false },
    },
  });

  const cmd = positionals[0];
  if (values.help || !cmd) return ayuda();

  const profile = await loadProfile(values.profile);
  const id = profile.perfil.id;
  // En --demo, por defecto se lee el registro de ejemplo (metrics/<id>-demo.csv).
  const csvDefault = values.demo ? `${id}-demo.csv` : `${id}.csv`;
  const csvPath = values.file
    ? resolve(process.cwd(), values.file)
    : join(ROOT, 'metrics', csvDefault);

  if (cmd === 'track') return track({ profile, id, csvPath, values });
  if (cmd === 'report') return report({ profile, id, csvPath, values });
  if (cmd === 'dashboard') return dashboard({ profile, id, csvPath, values });
  throw new Error(`Subcomando desconocido: "${cmd}". Usa "track", "report" o "dashboard" (--help).`);
}

// --- track: siembra el registro con los borradores de un batch ---
async function track({ id, csvPath, values }) {
  const batchPath = values.batch
    ? resolve(process.cwd(), values.batch)
    : await sidecarMasReciente(id);
  const sidecar = JSON.parse(await readFile(batchPath, 'utf8'));
  const langs = values.langs.split(',').map((s) => s.trim()).filter(Boolean);

  const nuevas = filasSemilla(sidecar, langs);

  let existentes = [];
  try {
    existentes = parseCSV(await readFile(csvPath, 'utf8')).rows;
  } catch { /* primer sembrado */ }

  const yaHay = new Set(existentes.map(claveFila));
  const agregar = nuevas.filter((f) => !yaHay.has(claveFila(f)));
  const filas = [...existentes, ...agregar];

  await mkdir(dirname(csvPath), { recursive: true });
  await writeFile(csvPath, toCSV(filas, COLUMNS), 'utf8');

  console.log(`📒 Registro: ${csvPath}`);
  console.log(`   batch ${batchPath.split('/').pop()} · +${agregar.length} filas (${existentes.length} ya estaban)`);
  console.log(`   Llena published_at, url y las métricas de X Analytics; luego: npm run report`);
}

// --- núcleo compartido: lee el registro y calcula todo ---
async function analizar({ profile, csvPath, values }) {
  let rows;
  try {
    rows = parseCSV(await readFile(csvPath, 'utf8')).rows;
  } catch {
    throw new Error(`No encontré el registro ${csvPath}. Siembra primero: npm run track -- --batch out/<batch>.json`);
  }

  const posts = postsPublicados(rows);
  const fechas = posts.map((p) => p.row.published_at).filter(Boolean).sort();
  const sumFollows = posts.reduce((s, p) => s + p.m.follows, 0);
  const sumClics = posts.reduce((s, p) => s + p.m.profile_clicks, 0);
  // Seguidores: bandera --followers o perfil.seguidores. Para el reach ratio
  // (impresiones ÷ seguidores): ≥2× = el algoritmo te empuja fuera de tus seguidores.
  const followers = int(values.followers, profile.perfil?.seguidores ?? 0);
  const resumen = {
    total: posts.length,
    impTotal: posts.reduce((s, p) => s + p.m.imp, 0),
    erMedio: mean(posts.map((p) => p.m.er)),
    reachMediana: mediana(posts.map((p) => p.m.reachScore)),
    bmMedio: mean(posts.map((p) => p.m.bookmarkRate)),
    replyMedio: mean(posts.map((p) => p.m.replyRate)),
    followVisitaMedio: mean(posts.map((p) => p.m.followPerVisit)),
    followVisita: sumClics ? sumFollows / sumClics : 0, // razón agregada (menos ruido)
    followers,
    reachRatio: followers ? mediana(posts.map((p) => p.m.imp / followers)) : null,
    rango: fechas.length ? `${fechas[0]} → ${fechas[fechas.length - 1]}` : '',
  };

  const porPilar = agrupar(posts, (r) => r.pillar);
  const porFormato = agrupar(posts, (r) => r.format);
  const porIdioma = agrupar(posts, (r) => r.lang);

  const ordenados = [...posts].sort((a, b) => b.m.reachScore - a.m.reachScore);
  const top = ordenados.slice(0, 3);
  const bottom = posts.length > 6 ? ordenados.slice(-3).reverse() : [];

  const actuales = Object.fromEntries((profile.pilares ?? []).map((p) => [p.id, p.peso]));
  const pesos = sugerirPesos(porPilar, {
    total: posts.length,
    minTotal: int(values['min-total'], 15),
    minPorPilar: int(values['min-pilar'], 4),
    pilaresEsperados: Object.keys(actuales),
  });
  pesos.actuales = actuales;

  return { resumen, porPilar, porFormato, porIdioma, top, bottom, pesos };
}

// --- report: cruza las métricas del registro y sugiere pesos ---
async function report({ profile, id, csvPath, values }) {
  const data = await analizar({ profile, csvPath, values });
  const fecha = new Date().toISOString().slice(0, 10);
  const meta = { id, nombre: profile.perfil.nombre ?? id, handle: profile.perfil.handle ?? '', fecha };
  const md = renderReporte({ meta, ...data });

  const outPath = values.out
    ? resolve(process.cwd(), values.out)
    : join(ROOT, 'metrics', `${id}-reporte-${fecha}.md`);
  await mkdir(dirname(outPath), { recursive: true });
  await writeFile(outPath, md, 'utf8');

  console.log(resumenConsola({ resumen: data.resumen, porPilar: data.porPilar, pesos: data.pesos }));
  console.log(`\n📊 Reporte: ${outPath}`);
}

// --- dashboard: tablero HTML autocontenido (se abre con doble clic) ---
async function dashboard({ profile, id, csvPath, values }) {
  const data = await analizar({ profile, csvPath, values });

  // Contenido de los borradores (para la sección del batch y los ángulos).
  let drafts = [];
  let batchFecha = '';
  try {
    const batchPath = values.batch
      ? resolve(process.cwd(), values.batch)
      : await sidecarMasReciente(id);
    const sidecar = JSON.parse(await readFile(batchPath, 'utf8'));
    drafts = sidecar.drafts ?? [];
    batchFecha = sidecar.fecha ?? '';
  } catch { /* sin sidecar: el tablero igual muestra las métricas */ }

  const fecha = new Date().toISOString().slice(0, 10);
  const meta = {
    id,
    nombre: profile.perfil.nombre ?? id,
    handle: profile.perfil.handle ?? '',
    fecha,
    demo: values.demo,
  };
  const html = renderDashboard({ meta, ...data, drafts, batchFecha });

  const outPath = values.out
    ? resolve(process.cwd(), values.out)
    : join(ROOT, 'metrics', `${id}-dashboard.html`);
  await mkdir(dirname(outPath), { recursive: true });
  await writeFile(outPath, html, 'utf8');

  console.log(resumenConsola({ resumen: data.resumen, porPilar: data.porPilar, pesos: data.pesos }));
  console.log(`\n🖥️  Tablero: ${outPath}`);
  console.log(`   Ábrelo con doble clic (no necesita servidor ni internet).`);
}

async function sidecarMasReciente(id) {
  const dir = join(ROOT, 'out');
  let archivos;
  try {
    archivos = await readdir(dir);
  } catch {
    throw new Error(`No hay carpeta out/. Genera un batch primero (npm run draft) o pasa --batch <ruta>.`);
  }
  const sidecars = archivos
    .filter((f) => f.startsWith(`${id}-`) && f.endsWith('.json') && !f.includes('reporte'))
    .sort()
    .reverse();
  if (!sidecars.length) {
    throw new Error(`No encontré sidecars ${id}-*.json en out/. Pasa --batch <ruta>.`);
  }
  return join(dir, sidecars[0]);
}

function ayuda() {
  console.log(`xautom — loop de medición (registro manual de X Analytics)

Uso:
  npm run track     -- [--batch out/<id>-<fecha>.json] [--langs en,es]
  npm run report    -- [--min-total 15] [--min-pilar 4]
  npm run dashboard -- [--demo]

Flujo:
  1) npm run track            siembra metrics/<id>.csv con los borradores del batch.
  2) Llenas published_at, url, impressions, likes, replies, reposts, bookmarks,
     profile_clicks, link_clicks y follows desde X Analytics (a mano).
  3) npm run report           cruza por pilar/formato/idioma y sugiere pesos.
     npm run dashboard         genera un tablero HTML autocontenido.
     npm run dashboard -- --demo   tablero con datos de ejemplo (para mostrar la idea).

Captura (todo GRATIS desde la app móvil, "Ver analíticas del post"):
  impressions, likes, replies, reposts, profile_clicks (= profile visits) y link_clicks.
  · bookmarks: del contador público del tweet (no siempre está en el popup).
  · follows POR POST es una estimación de X (a menudo 0): úsala con reserva o llena el
    neto a nivel cuenta. El dashboard de cuenta y el export CSV requieren Premium.

Opciones:
  -p, --profile <id>   Ficha (default: luis)
  -b, --batch <ruta>   Sidecar JSON del batch (default: el más reciente en out/)
  -f, --file <ruta>    CSV del registro (default: metrics/<id>.csv; con --demo: -demo.csv)
  -o, --out <ruta>     Salida (default: metrics/<id>-reporte-<fecha>.md o -dashboard.html)
      --langs <lista>  Idiomas a sembrar (default: en,es)
      --min-total <n>  Posts mínimos para sugerir pesos (default: 15)
      --min-pilar <n>  Posts mínimos por pilar (default: 4)
      --followers <n>  Conteo de seguidores, para el reach ratio (imp ÷ seg, ≥2× sano)
      --demo           Usa el registro de ejemplo (metrics/<id>-demo.csv)
`);
}

function int(v, fallback) {
  const n = Number.parseInt(v, 10);
  return Number.isNaN(n) ? fallback : n;
}
function mean(a) { return a.length ? a.reduce((s, x) => s + x, 0) / a.length : 0; }

main().catch((err) => {
  console.error(`\n❌ ${err.message}`);
  process.exit(1);
});
