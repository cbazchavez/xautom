/**
 * Renderiza el reporte de métricas a Markdown legible: tablas por pilar,
 * formato e idioma, mejores/peores posts, y la sugerencia de pesos (o el aviso
 * honesto de muestra insuficiente). No muta la ficha; solo recomienda.
 */

export function renderReporte({ meta, resumen, porPilar, porFormato, porIdioma, top, bottom, pesos }) {
  const o = [];
  o.push(`# Reporte de métricas — ${meta.nombre}`);
  o.push('');
  o.push(`- **Generado:** ${meta.fecha}`);
  if (meta.handle) o.push(`- **Handle:** ${meta.handle}`);
  o.push(`- **Posts medidos:** ${resumen.total}` + (resumen.rango ? ` (${resumen.rango})` : ''));
  o.push(`- **Impresiones totales:** ${fmt(resumen.impTotal)}`);
  o.push(`- **ER medio (por impresiones):** ${pct(resumen.erMedio)}`);
  o.push(`- **Mediana de score de alcance:** ${per1k(resumen.reachMediana)} /1k imp`);
  o.push('');
  o.push(
    '> **Score de alcance** = interacción ponderada por los pesos del algoritmo de X ' +
      '(replies y bookmarks pesan más que un like). Métricas principales: **bookmarks/1k** ' +
      'y **follow/visita** (conversión a seguidor).'
  );
  o.push('');

  if (resumen.total === 0) {
    o.push('---', '', '_Aún no hay posts con impresiones en el registro. Llena `metrics/' + meta.id + '.csv` con los números de X Analytics y vuelve a correr el reporte._', '');
    return o.join('\n');
  }

  o.push('---', '', '## Por pilar', '', ...tabla(porPilar, 'Pilar'));
  o.push('', '## Por formato', '', ...tabla(porFormato, 'Formato'));
  o.push('', '## Por idioma', '', ...tabla(porIdioma, 'Idioma'));

  o.push('', '## Mejores y peores posts (por score de alcance)', '');
  o.push('**Top:**');
  for (const p of top) o.push(`- ${etiquetaPost(p)} — ${per1k(p.m.reachScore)}/1k · ER ${pct(p.m.er)} · ${p.m.bookmarks} bookmarks`);
  o.push('', '**Cola:**');
  for (const p of bottom) o.push(`- ${etiquetaPost(p)} — ${per1k(p.m.reachScore)}/1k · ER ${pct(p.m.er)} · ${p.m.bookmarks} bookmarks`);
  o.push('');

  o.push('## Sugerencia de pesos para la ficha', '');
  if (!pesos.suficiente) {
    o.push(`⚠️ **Muestra insuficiente.** ${pesos.motivo}`);
    o.push('');
    o.push('_Con muestra insuficiente no se ajustan los pesos de `profiles/' + meta.id + '.yaml`._');
  } else {
    o.push('Ordenando los pilares por score de alcance medido (mejor → peor):');
    o.push('');
    o.push('| Pilar | n | Score/1k | Peso actual | Peso sugerido |');
    o.push('|---|---:|---:|---|---|');
    for (const s of pesos.sugerencia) {
      const actual = pesos.actuales?.[s.id] ?? '—';
      const flecha = actual !== s.pesoSugerido ? ` ⟵ cambia` : '';
      o.push(`| \`${s.id}\` | ${s.n} | ${per1k(s.reachScore)} | ${actual} | **${s.pesoSugerido}**${flecha} |`);
    }
    o.push('');
    o.push('_Aplica los cambios a mano en `pilares[].peso` si concuerdan con lo medido. Revísalo cada batch._');
  }
  o.push('');
  o.push('---', '', '_Cálculo: ER = (likes+replies+reposts+bookmarks+profile\\_clicks)/impresiones. ' +
    'Score de alcance = Σ(interacción × peso del algoritmo)/impresiones. Las tasas se muestran por cada 1,000 impresiones._');
  o.push('');
  return o.join('\n');
}

/** Resumen compacto para consola. */
export function resumenConsola({ resumen, porPilar, pesos }) {
  const l = [];
  l.push(`Posts medidos: ${resumen.total} · ER medio: ${pct(resumen.erMedio)} · mediana score: ${per1k(resumen.reachMediana)}/1k`);
  l.push('Por pilar (score/1k):');
  for (const f of porPilar) l.push(`  ${f.clave.padEnd(20)} n=${f.n}  ${per1k(f.reachScore)}  (bm/1k ${per1k(f.bookmarkRate)})`);
  l.push(pesos.suficiente ? 'Sugerencia de pesos lista (ver reporte).' : `Pesos: sin tocar — ${pesos.motivo}`);
  return l.join('\n');
}

// --- helpers de formato ---
function tabla(filas, titulo) {
  const out = [
    `| ${titulo} | n | Imp | ER | Score/1k | Bm/1k | Repl/1k | Follow/visita |`,
    '|---|---:|---:|---:|---:|---:|---:|---:|',
  ];
  for (const f of filas) {
    out.push(
      `| ${f.clave} | ${f.n} | ${fmt(f.impTotal)} | ${pct(f.er)} | ${per1k(f.reachScore)} | ${per1k(f.bookmarkRate)} | ${per1k(f.replyRate)} | ${pct(f.followPerVisit)} |`
    );
  }
  return out;
}
function etiquetaPost(p) {
  return `B${p.row.draft} ${p.row.lang} · \`${p.row.pillar}\` · ${p.row.format}`;
}
function pct(x, d = 2) { return `${(x * 100).toFixed(d)}%`; }
function per1k(x, d = 1) { return (x * 1000).toFixed(d); }
function fmt(n) { return Number(n).toLocaleString('en-US'); }
