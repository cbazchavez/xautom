#!/usr/bin/env node
import { parseArgs } from 'node:util';
import { mkdir, writeFile, readFile } from 'node:fs/promises';
import { resolve, join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import { loadProfile } from './profile.js';
import { planearBatch } from './distribute.js';
import { construirSystemPrompt, construirUserPrompt } from './prompt.js';
import { generarBorradores, DEFAULT_MODEL } from './generate.js';
import { renderMarkdown } from './render.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

async function main() {
  await cargarEnv(join(ROOT, '.env'));

  const { values } = parseArgs({
    options: {
      profile: { type: 'string', short: 'p', default: 'luis' },
      count: { type: 'string', short: 'n', default: '6' },
      model: { type: 'string', short: 'm' },
      out: { type: 'string', short: 'o' },
      'dry-run': { type: 'boolean', default: false },
      help: { type: 'boolean', short: 'h', default: false },
    },
  });

  if (values.help) return ayuda();

  const count = clampInt(values.count, 1, 30, 6);
  const profile = await loadProfile(values.profile);
  const model = values.model || DEFAULT_MODEL;

  const specs = planearBatch(profile, count);
  const system = construirSystemPrompt(profile);
  const user = construirUserPrompt(specs, profile);

  console.log(`📋 Perfil: ${profile.perfil.nombre} (${profile.perfil.id})`);
  console.log(`🎯 Batch: ${count} borradores`);
  console.log(`🧱 Pilares: ${specs.map((s) => s.pilar).join(', ')}`);
  const conTema = specs.filter((s) => s.temaActivo).length;
  const conProd = specs.filter((s) => s.producto).length;
  if (conTema) console.log(`🌏 Con tema activo: ${conTema}`);
  if (conProd) console.log(`📦 Con producto: ${conProd}`);
  console.log(`🤖 Modelo: ${model}`);

  if (values['dry-run']) {
    console.log('\n--- DRY RUN: SYSTEM PROMPT ---\n');
    console.log(system);
    console.log('\n--- DRY RUN: USER PROMPT ---\n');
    console.log(user);
    console.log('\n(no se llamó a la API)');
    return;
  }

  console.log('\n⏳ Generando con la API de Anthropic...');
  const { drafts, usage } = await generarBorradores({ system, user, model, count });

  const fecha = new Date().toISOString().slice(0, 10);
  const md = renderMarkdown({ profile, drafts, model, fecha });

  const outPath = values.out
    ? resolve(process.cwd(), values.out)
    : join(ROOT, 'out', `${profile.perfil.id}-${fecha}.md`);
  await mkdir(dirname(outPath), { recursive: true });
  await writeFile(outPath, md, 'utf8');

  console.log(`\n✅ ${drafts.length} borradores escritos en: ${outPath}`);
  if (usage) {
    console.log(`   tokens: ${usage.input_tokens} in / ${usage.output_tokens} out`);
  }
}

function ayuda() {
  console.log(`xautom — motor de borradores de X (EN/ES nativos)

Uso:
  npm run draft -- [opciones]

Opciones:
  -p, --profile <id|ruta>   Ficha a usar (default: luis)
  -n, --count <n>           Número de borradores (1–30, default: 6)
  -m, --model <id>          Modelo de Anthropic (default: ${DEFAULT_MODEL})
  -o, --out <ruta>          Archivo .md de salida (default: out/<id>-<fecha>.md)
      --dry-run             Imprime los prompts sin llamar a la API
  -h, --help                Esta ayuda

Ejemplos:
  npm run draft -- --profile luis --count 6
  npm run draft -- --dry-run
`);
}

function clampInt(v, min, max, fallback) {
  const n = Number.parseInt(v, 10);
  if (Number.isNaN(n)) return fallback;
  return Math.max(min, Math.min(max, n));
}

/** Carga un .env mínimo (KEY=VALUE) sin dependencias externas. */
async function cargarEnv(path) {
  let raw;
  try {
    raw = await readFile(path, 'utf8');
  } catch {
    return; // sin .env, se usan las variables del entorno
  }
  for (const linea of raw.split('\n')) {
    const m = linea.match(/^\s*([\w.-]+)\s*=\s*(.*)\s*$/);
    if (!m) continue;
    const key = m[1];
    let val = m[2].trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (!(key in process.env)) process.env[key] = val;
  }
}

main().catch((err) => {
  console.error(`\n❌ ${err.message}`);
  process.exit(1);
});
