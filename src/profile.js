import { readFile } from 'node:fs/promises';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse } from 'yaml';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROFILES_DIR = resolve(__dirname, '..', 'profiles');

/**
 * Carga una ficha de identidad por id (p.ej. "luis" -> profiles/luis.yaml).
 * Acepta también una ruta directa a un .yaml.
 */
export async function loadProfile(idOrPath) {
  const path = idOrPath.endsWith('.yaml') || idOrPath.endsWith('.yml')
    ? resolve(process.cwd(), idOrPath)
    : join(PROFILES_DIR, `${idOrPath}.yaml`);

  let raw;
  try {
    raw = await readFile(path, 'utf8');
  } catch {
    throw new Error(`No encontré la ficha "${idOrPath}". Busqué en: ${path}`);
  }

  const profile = parse(raw);
  if (!profile?.perfil?.id) {
    throw new Error(`La ficha "${path}" no tiene 'perfil.id'. ¿Es un YAML válido?`);
  }
  profile.__path = path;
  return profile;
}
