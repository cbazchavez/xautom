/**
 * Decide, para un batch de N borradores, qué pilar le toca a cada uno,
 * cuáles tejen un tema activo, y cuáles aterrizan un producto.
 *
 * Todo esto se calcula en código (determinista y auditable) y luego se
 * le pasa al modelo como instrucciones precisas por borrador. Así controlamos
 * la variedad y las reglas de negocio sin dejarlas al azar del LLM.
 */

const PESO_A_NUMERO = { alto: 3, medio: 2, bajo: 1 };

// Mezcla de PESO de post (ligero/medio/pesado) por batch, para que el feed no
// canse. Objetivo (no cuota rígida) — ver voz.mezcla_pesos en la ficha.
const PESO_OBJETIVO = [
  { peso: 'ligero', frac: 0.4 },
  { peso: 'medio', frac: 0.45 },
  { peso: 'pesado', frac: 0.15 },
];
const MAX_PESADO_POR_BATCH = 2;

/** Reparte `count` slots entre pesos (largest remainder), capando 'pesado' a MAX. */
export function distribuirPesos(count) {
  const cuotas = PESO_OBJETIVO.map((p) => {
    const ideal = p.frac * count;
    return { peso: p.peso, n: Math.floor(ideal), rem: ideal - Math.floor(ideal) };
  });

  let asignados = cuotas.reduce((s, c) => s + c.n, 0);
  const porResto = [...cuotas].sort((a, b) => b.rem - a.rem);
  for (let i = 0; asignados < count; i++, asignados++) {
    porResto[i % porResto.length].n++;
  }

  // Cap de pesados: el excedente pasa a 'medio' (conserva el total).
  const pesado = cuotas.find((c) => c.peso === 'pesado');
  const medio = cuotas.find((c) => c.peso === 'medio');
  if (pesado.n > MAX_PESADO_POR_BATCH) {
    medio.n += pesado.n - MAX_PESADO_POR_BATCH;
    pesado.n = MAX_PESADO_POR_BATCH;
  }

  const slots = [];
  for (const c of cuotas) for (let i = 0; i < c.n; i++) slots.push(c.peso);
  return barajar(slots);
}

/** Reparte `count` slots entre pilares según su peso (largest remainder). */
export function distribuirPilares(pilares, count) {
  const ponderados = pilares.map((p) => ({
    id: p.id,
    w: PESO_A_NUMERO[p.peso] ?? 1,
  }));
  const total = ponderados.reduce((s, p) => s + p.w, 0) || 1;

  const cuotas = ponderados.map((p) => {
    const ideal = (p.w / total) * count;
    return { id: p.id, n: Math.floor(ideal), rem: ideal - Math.floor(ideal) };
  });

  let asignados = cuotas.reduce((s, c) => s + c.n, 0);
  const ordenadosPorResto = [...cuotas].sort((a, b) => b.rem - a.rem);
  for (let i = 0; asignados < count; i++, asignados++) {
    ordenadosPorResto[i % ordenadosPorResto.length].n++;
  }

  const slots = [];
  for (const c of cuotas) for (let i = 0; i < c.n; i++) slots.push(c.id);
  return barajar(slots);
}

/**
 * Construye la lista de "specs" de borradores: pilar + tema activo + producto.
 * @returns {Array<{pilar:string, temaActivo:object|null, producto:object|null}>}
 */
export function planearBatch(profile, count) {
  const pilares = profile.pilares ?? [];
  const slotsPilar = distribuirPilares(pilares, count);
  const slotsPeso = distribuirPesos(count); // pilar y peso se barajan independiente

  const specs = slotsPilar.map((pilar, i) => ({
    pilar,
    peso: slotsPeso[i] ?? null, // guarda: si faltara, el prompt lo omite
    temaActivo: null,
    producto: null,
  }));

  asignarTemasActivos(specs, profile);
  asignarProductos(specs, profile);

  return specs;
}

/** Teje ~20% del batch con un tema activo, preferentemente en su pilar asociado. */
function asignarTemasActivos(specs, profile) {
  const temas = profile.temas_activos ?? [];
  if (temas.length === 0) return;

  const cuantos = Math.max(1, Math.round(specs.length * 0.2));
  let puestos = 0;
  let t = 0;

  // Primero, slots cuyo pilar coincide con el pilar_asociado del tema.
  for (const tema of temas) {
    if (puestos >= cuantos) break;
    const idx = specs.findIndex(
      (s) => !s.temaActivo && s.pilar === tema.pilar_asociado
    );
    if (idx !== -1) {
      specs[idx].temaActivo = tema;
      puestos++;
    }
  }
  // Si falta, rellena en cualquier slot libre, rotando temas.
  for (const s of specs) {
    if (puestos >= cuantos) break;
    if (!s.temaActivo) {
      s.temaActivo = temas[t % temas.length];
      t++;
      puestos++;
    }
  }
}

/**
 * Aterriza producto en ~1 de cada 9 borradores (regla: 1 de cada 8–10),
 * nunca en slots consecutivos, solo productos mencionables y no 'stealth'.
 */
function asignarProductos(specs, profile) {
  const lista = profile.productos?.lista ?? [];
  const elegibles = lista.filter(
    (p) => p.mencionar === true && p.etapa !== 'stealth'
  );
  if (elegibles.length === 0) return;

  const cuantos = Math.floor(specs.length / 9); // 0 si el batch es chico: correcto
  let puestos = 0;
  let prod = 0;

  for (let i = 0; i < specs.length && puestos < cuantos; i += 2) {
    // paso de 2 garantiza no-consecutivos
    if (!specs[i].temaActivo || true) {
      specs[i].producto = elegibles[prod % elegibles.length];
      prod++;
      puestos++;
    }
  }
}

function barajar(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
