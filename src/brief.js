import { readFile, readdir } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { parse } from 'yaml';

/**
 * Carga el brief de actualidad (noticias + tweets curados del feed de Luis)
 * que alimenta borradores "actuales". Ver research/README.md para el formato.
 *
 * Modos:
 *   'none'        → sin brief (batch evergreen, como antes)
 *   'latest'      → el brief-*.yaml más reciente de research/ (o null si no hay)
 *   <ruta .yaml>  → un brief concreto
 */
export async function cargarBrief(modo, root) {
  if (!modo || modo === 'none') return null;

  let path;
  if (modo === 'latest') {
    path = await ultimoBrief(join(root, 'research'));
    if (!path) return null; // sin briefs aún: no es error
  } else {
    path = resolve(process.cwd(), modo);
  }

  let raw;
  try {
    raw = await readFile(path, 'utf8');
  } catch {
    throw new Error(`No pude leer el brief: ${path}`);
  }

  const brief = parse(raw);
  if (!brief || (!Array.isArray(brief.noticias) && !Array.isArray(brief.feed))) {
    throw new Error(
      `El brief "${path}" no tiene 'noticias' ni 'feed'. Ver research/README.md.`
    );
  }
  brief.noticias = brief.noticias ?? [];
  brief.feed = brief.feed ?? [];
  brief.__path = path;
  return brief;
}

async function ultimoBrief(dir) {
  let files;
  try {
    files = await readdir(dir);
  } catch {
    return null; // research/ no existe todavía
  }
  const briefs = files
    .filter((f) => /^brief-\d{4}-\d{2}-\d{2}\.ya?ml$/.test(f))
    .sort(); // el nombre lleva la fecha ISO: orden lexicográfico = cronológico
  return briefs.length ? join(dir, briefs[briefs.length - 1]) : null;
}
