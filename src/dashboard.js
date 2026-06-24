/**
 * Genera un tablero HTML autocontenido (sin CDN, sin servidor, sin JS externo)
 * a partir de las mismas métricas que el reporte. Se abre con doble clic y se
 * puede compartir como un solo archivo. Pensado para MOSTRAR el loop: borradores
 * → publicación → métricas → recalibración de la ficha.
 */

import { ALGO_PESOS } from './metrics.js';

const PESO_LABEL = { likes: 'like', reposts: 'repost', replies: 'reply', profile_clicks: 'profile click', bookmarks: 'bookmark' };

export function renderDashboard({ meta, resumen, porPilar, porFormato, porIdioma, top, bottom, pesos, drafts, batchFecha }) {
  const anguloDe = (batch, draft) =>
    batch === batchFecha && drafts?.[draft - 1] ? drafts[draft - 1].angle : '';

  // Benchmarks publicados (Typefully, growth guides 2025-26): follow÷visita 10-15% sano,
  // <5% bio/pinned flojos; reach ratio ≥2× = el algoritmo te empuja fuera de tus seguidores.
  const fvTone = resumen.followVisita >= 0.10 ? 'good' : resumen.followVisita >= 0.05 ? 'warn' : 'bad';
  const rr = resumen.reachRatio;
  const rrVal = rr == null ? '—' : `${rr.toFixed(2)}×`;
  const rrTone = rr == null ? '' : rr >= 2 ? 'good' : rr >= 1 ? 'warn' : 'bad';
  const pesosTxt = Object.entries(ALGO_PESOS).map(([k, v]) => `${PESO_LABEL[k] || k} ${v}`).join(' · ');

  const html = `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Tablero — ${esc(meta.nombre)}</title>
<style>
  :root{
    --bg:#0d1117; --panel:#161b22; --panel2:#1c2230; --line:#283041;
    --txt:#e6edf3; --muted:#8b949e; --accent:#3fb6ff; --accent2:#7ee787;
    --warn:#f2cc60; --bad:#ff7b72;
  }
  *{box-sizing:border-box}
  body{margin:0;background:var(--bg);color:var(--txt);
    font:15px/1.5 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif}
  main{max-width:1040px;margin:0 auto;padding:32px 20px 64px}
  h1{font-size:24px;margin:0 0 4px} h2{font-size:16px;margin:32px 0 12px;color:var(--muted);
    text-transform:uppercase;letter-spacing:.06em;font-weight:600}
  .sub{color:var(--muted);margin:0}
  a{color:var(--accent);text-decoration:none}
  .banner{margin:16px 0 0;padding:10px 14px;border:1px solid var(--warn);
    border-radius:8px;background:rgba(242,204,96,.08);color:var(--warn);font-size:13px}
  .flow{display:flex;gap:8px;flex-wrap:wrap;margin:20px 0 4px}
  .flow .step{flex:1;min-width:150px;background:var(--panel);border:1px solid var(--line);
    border-radius:10px;padding:12px 14px}
  .flow .step .k{font-size:12px;color:var(--muted)}
  .flow .step .v{font-weight:600;margin-top:2px}
  .flow .step.on{border-color:var(--accent);box-shadow:0 0 0 1px var(--accent) inset}
  .cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:12px;margin-top:8px}
  .card{background:var(--panel);border:1px solid var(--line);border-radius:12px;padding:16px}
  .card.star{border-color:var(--accent);background:linear-gradient(180deg,rgba(63,182,255,.10),var(--panel))}
  .card .k{font-size:12px;color:var(--muted)} .card .v{font-size:26px;font-weight:700;margin-top:4px}
  .card .v.good{color:var(--accent2)} .card .v.warn{color:var(--warn)} .card .v.bad{color:var(--bad)}
  .card .u{font-size:12px;color:var(--muted);margin-left:4px}
  .grid2{display:grid;grid-template-columns:1.4fr 1fr;gap:16px}
  @media(max-width:760px){.grid2{grid-template-columns:1fr}}
  .panel{background:var(--panel);border:1px solid var(--line);border-radius:12px;padding:16px 18px}
  .bars{display:flex;flex-direction:column;gap:10px;margin-top:4px}
  .row{display:grid;grid-template-columns:140px 1fr 54px;align-items:center;gap:10px}
  .row .lbl{font-size:13px;color:var(--txt);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .track{background:var(--panel2);border-radius:6px;height:20px;overflow:hidden}
  .fill{height:100%;background:linear-gradient(90deg,var(--accent),#2a7fd0);border-radius:6px}
  .fill.alt{background:linear-gradient(90deg,var(--accent2),#46a758)}
  .row .num{text-align:right;font-variant-numeric:tabular-nums;font-size:13px;color:var(--muted)}
  .mini{font-size:12px;color:var(--muted);margin:2px 0 0}
  table{width:100%;border-collapse:collapse;margin-top:6px;font-size:13px}
  th,td{text-align:left;padding:8px 10px;border-bottom:1px solid var(--line)}
  th{color:var(--muted);font-weight:600} td.n,th.n{text-align:right;font-variant-numeric:tabular-nums}
  .tag{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:12px;color:var(--accent)}
  .pill{display:inline-block;font-size:11px;padding:1px 7px;border-radius:999px;border:1px solid var(--line);color:var(--muted)}
  .sug td{border-bottom:1px solid var(--line)} .chg{color:var(--accent2);font-weight:600}
  .keep{color:var(--muted)}
  details{background:var(--panel);border:1px solid var(--line);border-radius:10px;padding:10px 14px;margin-bottom:8px}
  summary{cursor:pointer;font-weight:600;display:flex;gap:10px;align-items:center;flex-wrap:wrap}
  summary .pill{font-weight:400}
  .tw{color:var(--muted);font-size:13px;margin:8px 0 0;padding-left:12px;border-left:2px solid var(--line)}
  footer{color:var(--muted);font-size:12px;margin-top:32px;border-top:1px solid var(--line);padding-top:16px}
  .good{color:var(--accent2)} .warnt{color:var(--warn)}
</style>
</head>
<body>
<main>
  <h1>Tablero de desempeño — ${esc(meta.nombre)}</h1>
  <p class="sub">Handle ${esc(meta.handle || '—')} · generado ${esc(meta.fecha)}${resumen.rango ? ' · ' + esc(resumen.rango) : ''}</p>
  ${meta.demo ? `<div class="banner">⚠️ MODO DEMO — datos de ejemplo (≈3 semanas simuladas) para mostrar el tablero. Aún no hay cuenta publicada; los números son ilustrativos, no reales.</div>` : ''}

  <div class="flow">
    ${step('1 · Borradores', `${drafts?.length ?? 0} en EN/ES`, false)}
    ${step('2 · Publicar', 'Luis elige idioma', false)}
    ${step('3 · Métricas', 'X Analytics (manual)', true)}
    ${step('4 · Recalibrar', 'pesos por pilar', true)}
  </div>
  <p class="mini">El tablero vive en los pasos 3–4: mide lo publicado y propone cómo recalibrar la ficha. No predice.</p>

  ${resumen.total === 0 ? `
  <div class="panel" style="margin-top:18px">
    <strong>Aún sin datos.</strong> Llena <span class="tag">metrics/${esc(meta.id)}.csv</span> con los números de X Analytics y regenera el tablero.
    Para ver cómo se verá, corre <span class="tag">npm run dashboard -- --demo</span>.
  </div>` : `
  <h2>Norte · lo que perseguimos</h2>
  <div class="cards">
    ${card('Score de alcance', per1k(resumen.reachMediana), '/1k · mediana', true)}
    ${card('Bookmarks', per1k(resumen.bmMedio), '/1k · medio', true)}
    ${card('Follow / visita', pct(resumen.followVisita), 'sigue ÷ visita · meta ≥10%', true, fvTone)}
  </div>
  <h2>Contexto · para leer el norte, no para presumir</h2>
  <div class="cards">
    ${card('Posts medidos', fmt(resumen.total), 'confianza')}
    ${card('Impresiones', fmt(resumen.impTotal), 'alcance')}
    ${card('Reach ratio', rrVal, `imp ÷ seg · meta ≥2×${resumen.followers ? ` (${fmt(resumen.followers)} seg)` : ''}`, false, rrTone)}
    ${card('Replies', per1k(resumen.replyMedio), '/1k · conversación')}
  </div>

  <h2>Desempeño por pilar</h2>
  <div class="grid2">
    <div class="panel">
      <div class="mini">Score de alcance (interacción ponderada por el algoritmo de X) · por 1k impresiones</div>
      ${barras(porPilar, 'reachScore', per1k)}
    </div>
    <div class="panel">
      <div class="mini">Bookmarks por 1k impresiones (lo que la audiencia guarda)</div>
      ${barras(porPilar, 'bookmarkRate', per1k, true)}
    </div>
  </div>

  <div class="grid2" style="margin-top:16px">
    <div class="panel">
      <div class="mini">Por formato · score/1k</div>
      ${barras(porFormato, 'reachScore', per1k)}
    </div>
    <div class="panel">
      <div class="mini">Por idioma · score/1k</div>
      ${barras(porIdioma, 'reachScore', per1k)}
    </div>
  </div>

  <details class="note"><summary>Cómo se calcula el Score de alcance (y qué no mide)</summary>
    <div style="margin-top:8px">
      <p class="mini">Score = Σ(interacción × peso) ÷ impresiones. Pesos crudos del heavy-ranker open-source de X (README, abr-2023):</p>
      <p class="tw"><b>${esc(pesosTxt)}</b></p>
      <p class="mini">El <b>bookmark (10)</b> es estimación: X confirmó en 2024 que cuenta para el alcance pero nunca publicó un peso oficial. Las señales más fuertes del algoritmo —reply respondido por el autor (75), permanencia ≥2 min (11), report (−369)— no aparecen en la analítica nativa, así que no entran al score. Fuente: github.com/twitter/the-algorithm-ml. Ojo: una liga en el cuerpo del post cuesta −30 a −50% de alcance; ponla en el primer reply.</p>
    </div>
  </details>

  <h2>Mejores y peores posts</h2>
  <table>
    <thead><tr><th>Post</th><th>Ángulo</th><th class="n">Score/1k</th><th class="n">ER</th><th class="n">Bookmarks</th></tr></thead>
    <tbody>
      ${[...top.map((p) => fila(p, anguloDe, 'good')), ...bottom.map((p) => fila(p, anguloDe, 'warnt'))].join('\n      ')}
    </tbody>
  </table>
  <p class="mini">▲ mejores por score de alcance · ▼ cola. El score premia replies y bookmarks por encima de likes.</p>

  <h2>Sugerencia para la ficha</h2>
  <div class="panel">
    ${pesos.suficiente ? `
    <div class="mini">Ordenando pilares por score medido. Esto recalibra <span class="tag">pilares[].peso</span> en la ficha.</div>
    <table class="sug">
      <thead><tr><th>Pilar</th><th class="n">n</th><th class="n">Score/1k</th><th>Actual</th><th>Sugerido</th></tr></thead>
      <tbody>
        ${pesos.sugerencia.map((s) => {
          const actual = pesos.actuales?.[s.id] ?? '—';
          const cambia = actual !== s.pesoSugerido;
          return `<tr><td class="tag">${esc(s.id)}</td><td class="n">${s.n}</td><td class="n">${per1k(s.reachScore)}</td><td>${esc(actual)}</td><td class="${cambia ? 'chg' : 'keep'}">${esc(s.pesoSugerido)}${cambia ? ' ⟵' : ''}</td></tr>`;
        }).join('\n        ')}
      </tbody>
    </table>
    <p class="mini">Sugerencia, no orden: aplícalo a mano si concuerda con lo que ves.</p>` : `
    <strong class="warnt">Muestra insuficiente.</strong>
    <p class="mini">${esc(pesos.motivo)} No se toca la ficha con ruido — la barra existe a propósito.</p>`}
  </div>

  <h2>El batch que se está midiendo</h2>
  ${(drafts ?? []).map((d, i) => detalleBorrador(d, i)).join('\n  ')}
  `}

  <footer>
    Se mide lo publicado, no se predice. <strong>Score de alcance</strong> = Σ(interacción × peso reportado del algoritmo de X) / impresiones —
    replies y bookmarks pesan mucho más que un like. Norte de la siembra: bookmarks/1k y follow/visita, no likes ni followers absolutos.
    Entrada manual desde X Analytics (sin API). Generado por xautom.
  </footer>
</main>
</body>
</html>
`;
  return html;
}

// --- sub-render ---
function step(k, v, on) {
  return `<div class="step${on ? ' on' : ''}"><div class="k">${esc(k)}</div><div class="v">${esc(v)}</div></div>`;
}
function card(k, v, u = '', star = false, tone = '') {
  return `<div class="card${star ? ' star' : ''}"><div class="k">${esc(k)}</div><div class="v${tone ? ' ' + tone : ''}">${esc(v)}${u ? `<span class="u">${esc(u)}</span>` : ''}</div></div>`;
}
function barras(filas, key, fmtFn, alt = false) {
  const max = Math.max(...filas.map((f) => f[key]), 1e-9);
  const rows = filas.map((f) => {
    const w = Math.max(2, (f[key] / max) * 100);
    return `<div class="row"><div class="lbl">${esc(f.clave)} <span class="pill">n=${f.n}</span></div><div class="track"><div class="fill${alt ? ' alt' : ''}" style="width:${w.toFixed(1)}%"></div></div><div class="num">${fmtFn(f[key])}</div></div>`;
  });
  return `<div class="bars">${rows.join('')}</div>`;
}
function fila(p, anguloDe, cls) {
  const ang = anguloDe(p.row.batch, Number(p.row.draft));
  const mark = cls === 'good' ? '▲' : '▼';
  return `<tr><td><span class="${cls}">${mark}</span> B${esc(p.row.draft)} ${esc(p.row.lang)} · <span class="pill">${esc(p.row.pillar)}</span> ${esc(p.row.format)}</td><td>${esc(ang || '—')}</td><td class="n">${per1k(p.m.reachScore)}</td><td class="n">${pct(p.m.er)}</td><td class="n">${p.m.bookmarks}</td></tr>`;
}
function detalleBorrador(d, i) {
  const en = (d.en?.tweets ?? []).map((t) => `<p class="tw">${esc(t)}</p>`).join('');
  const es = (d.es?.tweets ?? []).map((t) => `<p class="tw">${esc(t)}</p>`).join('');
  return `<details><summary>B${i + 1} — ${esc(d.angle ?? '')} <span class="pill">${esc(d.pillar ?? '')}</span> <span class="pill">${esc(d.format ?? '')}</span>${d.uses_active_topic ? ` <span class="pill">${esc(d.uses_active_topic)}</span>` : ''}</summary><div style="margin-top:8px"><div class="mini">EN</div>${en}<div class="mini" style="margin-top:8px">ES</div>${es}</div></details>`;
}

// --- formato ---
function esc(v) {
  return String(v ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
function pct(x, d = 2) { return `${(x * 100).toFixed(d)}%`; }
function per1k(x, d = 1) { return (x * 1000).toFixed(d); }
function fmt(n) { return Number(n).toLocaleString('en-US'); }
