---
title: Actualidad y curación del feed
tags: [actualidad, swipe, curacion, noticias, x-twitter, luis-castillo]
actualizado: 2026-07-02
---

# 📰 Actualidad y curación del feed

Dos sistemas nuevos (2026-07-02) para que los borradores dejen de ser solo evergreen.
Ver índice: [[Automatización X · Luis Castillo]].

## 1. Swipe file — base de datos del feed de Luis (`swipe/` en el repo)

Luis sigue perfiles que empatan con lo que queremos. Los tweets con **buen
performance** (hilos populares, hooks que jalan, formatos exitosos) se capturan en una
base de datos para estudiar **patrones**:

- **Captura:** pegas lo que veas en el feed, en crudo, en `swipe/inbox.md` (tip:
  guardarlos en Bookmarks de X y vaciarlos en una sentada). Una sesión de Claude los
  estructura en `swipe/tweets.yaml` con métricas y análisis de por qué funcionan.
- **Uso:** cada ~20 entradas, Claude destila los patrones ganadores (tipos de hook,
  largos de hilo, estructuras) y los propone como cambios a `voz.tecnicas_ok` de la
  ficha. El motor **no** lee la base directamente — de ahí salen patrones, nunca frases.
- **Regla dura:** el contenido ajeno jamás se copia ni se parafrasea de cerca. Un
  borrador que se parezca a una entrada del swipe se descarta.

## 2. Briefs de noticias (`research/` en el repo)

Para drafts "actuales": una sesión de Claude investiga noticias del día en los temas de
Luis y escribe `research/brief-YYYY-MM-DD.yaml` (pedirlo con *"genera el brief de hoy
para xautom"*). `npm run draft` toma el brief más reciente por default (`--brief none`
para batch evergreen). El borrador que use una noticia reporta la URL (`news_ref`) y
solo puede usar los datos del resumen — anti-alucinación.

El brief también tiene sección `feed:` para tweets del timeline sobre los que el motor
genera **el take propio de Luis** (si necesita contexto, sale marcado como quote-tweet
citando al autor).

**Primer brief real:** `research/brief-2026-07-02.yaml` — 7 noticias (megaproyectos
coreanos de IA/chips ~$872B — oro para el tema activo de Seúl —, Together AI $800M,
récord VC $510B en H1, brecha adopción/confianza del vibe coding, Meta y su cómputo
excedente).

---
*Ver también: [[Ficha de perfil · Luis Castillo]] · [[Estado del proyecto]] · [[Cómo funciona el motor]]*
