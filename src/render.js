/**
 * Renderiza los borradores a un Markdown legible: EN y ES lado a lado por
 * borrador, con metadatos (pilar, formato, tema activo, producto) para que
 * Luis revise rápido y elija qué publicar.
 */
export function renderMarkdown({ profile, drafts, model, fecha }) {
  const out = [];
  const nombre = profile.perfil?.nombre ?? profile.perfil?.id ?? 'perfil';
  const handle = profile.perfil?.handle ?? '';

  out.push(`# Borradores de X — ${nombre}`);
  out.push('');
  out.push(`- **Fecha:** ${fecha}`);
  if (handle) out.push(`- **Handle:** ${handle}`);
  out.push(`- **Modelo:** ${model}`);
  out.push(`- **Borradores:** ${drafts.length}`);
  out.push('');
  out.push(
    '> Revisión: para cada borrador, marca si publicas **EN**, **ES** o **ambos** (como posts separados). ' +
      'Borra lo que no sirva. La voz es provisional: anota qué se siente fuera de tono para recalibrar la ficha.'
  );
  out.push('');
  out.push('---');
  out.push('');

  drafts.forEach((d, i) => {
    out.push(`## Borrador ${i + 1} — ${d.angle ?? d.pillar ?? ''}`);
    out.push('');
    out.push(metaLinea(d));
    out.push('');

    out.push('**🇬🇧 EN**');
    out.push('');
    out.push(...renderTweets(d.en?.tweets));
    out.push('');

    out.push('**🇪🇸 ES**');
    out.push('');
    out.push(...renderTweets(d.es?.tweets));
    out.push('');
    out.push('---');
    out.push('');
  });

  return out.join('\n');
}

function metaLinea(d) {
  const tags = [];
  if (d.pillar) tags.push(`pilar: \`${d.pillar}\``);
  if (d.format) tags.push(`formato: \`${d.format}\``);
  if (d.uses_active_topic) tags.push(`tema activo: \`${d.uses_active_topic}\``);
  if (d.product) tags.push(`producto: \`${d.product}\``);
  if (d.news_ref) tags.push(`noticia: ${d.news_ref}`);
  if (d.quote_of) tags.push(`**publicar como quote-tweet de ${d.quote_of}**`);
  return `_${tags.join(' · ')}_`;
}

function renderTweets(tweets) {
  if (!Array.isArray(tweets) || tweets.length === 0) {
    return ['_(sin contenido)_'];
  }
  if (tweets.length === 1) {
    return [bloque(tweets[0])];
  }
  return tweets.flatMap((t, i) => [`**${i + 1}/${tweets.length}**`, bloque(t)]);
}

function bloque(texto) {
  const chars = String(texto ?? '').length;
  const aviso = chars > 280 ? `  ⚠️ ${chars} chars (>280)` : '';
  return String(texto ?? '')
    .split('\n')
    .map((l) => `> ${l}`)
    .join('\n') + aviso;
}
