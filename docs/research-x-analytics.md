# Investigación: analítica de X y pesos del algoritmo

> Hallazgos de la investigación que calibró el loop de medición de xautom.
> Método: 3 agentes en paralelo (analítica nativa de X · prácticas de top creators ·
> pesos del algoritmo open-source). Fecha: junio 2026. Cada afirmación marca
> **HECHO** (fuente primaria) vs **FOLCLORE** (circula sin respaldo).

Este documento es la memoria del *por qué* detrás de las decisiones en
`src/metrics.js` (pesos del Score) y el tablero. Si X cambia, se actualiza aquí.

---

## 1. Pesos del algoritmo de X (el Score de alcance)

**Fuente primaria:** README del heavy-ranker open-source de X
(`github.com/twitter/the-algorithm-ml/blob/main/projects/home/recap/README.md`,
valores fechados **5-abr-2023**). El score de ranking = Σ(peso × probabilidad de
cada acción).

| Acción | Peso (código real) | Nota |
|---|---:|---|
| like (fav) | **0.5** | acción barata |
| repost (retweet) | **1.0** | — |
| reply | **13.5** | un reply ≈ 27 likes |
| **reply respondido por el autor** | **75.0** | el peso positivo más alto |
| profile click (good) | **12.0** | click al perfil + like/reply |
| good_click (permanencia ≥2 min) | **11.0** | el "dwell" real del código |
| video 50% visto | **0.005** | — |
| feedback negativo (mute/block) | **−74.0** | — |
| report | **−369.0** | la penalización más fuerte |

**HECHO:** los pesos viven en un config y X dice que "se recalibran periódicamente".
Son una foto de 2023, no una constante eterna.

**FOLCLORE (circula en blogs de marketing, sin respaldo en el código):**
- "repost = 20" → el código dice **1.0**. Error de ~20×.
- "bookmark = 10" → **no existe peso oficial de bookmark**. X confirmó en 2024 que
  los bookmarks cuentan para el alcance, pero **nunca publicó un número**.
- "dwell de 15s/20s" → el código solo tiene el umbral discreto de ≥2 min (peso 11).

**Cambios posteriores (2023–2026):**
- **Penalización a ligas externas** en el cuerpo del post: confirmado por Musk
  (26-nov-2024); se reporta una suavización en oct-2025. Heurística de filtrado,
  no un peso del ranker. Regla práctica: **la liga va en el primer reply.**
- **Boost a Premium/verificados:** reportado (2x–4x) pero **no** está en la tabla
  open-source; X no publicó el multiplicador. Tratar como reportado.
- **Grok (ene-2026):** X anunció un nuevo sistema de recomendación basado en
  transformer; **no liberó pesos nuevos**. Cualquier número de la versión 2026
  carece de fuente primaria.

**Decisión en xautom:** `ALGO_PESOS` usa los valores crudos del código
(like 0.5, repost 1, reply 13.5, profile_click 12) y mantiene bookmark=10
**etiquetado como estimación**. Las señales más fuertes (reply-respondido-por-autor,
dwell, negativos) no entran porque la analítica nativa no las expone.

---

## 2. Qué datos entrega la analítica nativa de X

**Por post** ("Ver analíticas del post", **gratis en la app móvil**, sin Premium):
- **HECHO, directos del popup:** impressions, engagements, engagement rate, likes,
  replies, reposts, profile visits/clicks, link clicks, detail expands, video views.
- **`bookmarks`:** PARCIAL en el popup; el **contador es público en el tweet**
  (desde 2024), de ahí se lee confiable.
- **`follows` por post:** DÉBIL. X muestra "nuevos seguidores de este post" pero es
  **estimación, a menudo 0 o subreportada**, y no existe en la API. La columna más
  frágil del esquema. Confiable solo el **neto a nivel cuenta**.

**A nivel cuenta** (`x.com/i/account_analytics`, **requiere Premium**):
impresiones, profile visits, follows netos, engagement rate, top posts, demografía
(edad/ubicación/intereses), ratio seguidores vs no-seguidores. Rango 7d/28d/3m/año.

**Exportar CSV:** existe (`analytics.x.com`, "Export data", máx 30 días / 3,000 posts,
UTC) pero **condicionado a Premium/Ads** hacia 2024–2025. La **API** v2 da los datos
pero requiere OAuth y tiers de pago — no viable "sin API".

**Cambios recientes:** dashboard de cuenta movido tras Premium (2024); bookmarks
visibles en analítica (2025); **Creator Studio en móvil** (dic-2025) acerca
monetización + analítica de cuenta al teléfono.

**Decisión en xautom:** el loop copia métricas **por post desde el móvil (gratis)**.
Se añadió la columna `link_clicks` (gratis en el popup). `follows` se documenta como
aproximado; preferir el neto de cuenta.

---

## 3. Qué miden los mejores creadores

**Consenso "importa de verdad":**
- **Profile visits → follow** = el leading indicator más citado del crecimiento;
  "la métrica de conversión escondida". Benchmark publicado: **follow÷visita
  10–15% sano, <5% = bio/pinned flojos**, hasta 25–40% en perfiles muy optimizados.
- **Bookmarks** = "la métrica nueva/silenciosa"; acción privada → señal de calidad
  pura. Alta relación bookmark/like = contenido evergreen (frameworks, how-tos) —
  justo los temas de Luis.
- **Reply rate / conversación** = la señal de engagement más pesada.
- **Impresiones como denominador** (no followers): X empuja al For You de
  no-seguidores, así que "/1k impresiones" es lo correcto.

**Consenso "vanidad":** likes (peso ~0.5, pasivo) y **followers absolutos**.
Justin Welsh: "tu número de seguidores es un espejismo".

**Herramientas y su "norte":** BlackMagic.so (separa engagement de seguidores vs
extraños → "¿qué tweets traen seguidores?"), Typefully (expone *conversion rate =
Follows ÷ Impressions*), Tweet Hunter ("qué tweets trajeron más seguidores"),
Hypefury. El gap que monetizan: **follower-conversion por post**, que la nativa no da.

**Benchmarks publicados (referencia, no oficiales de X):**
- Follow÷visita: **≥10–15% sano, <5% flojo**.
- Reach ratio (impresiones ÷ seguidores): **≥2× = el algoritmo te empuja fuera de
  tus seguidores**.
- Engagement rate sobre impresiones: mediana ~**0.12%**, "excelente" >**1.5%**.
- Cadencia: **2–3 posts/día**, 30–60 min de separación; el algoritmo castiga
  volumen alto con bajo engagement.
- **Threads** ganan en bookmarks/dwell; **singles** en velocidad de conversación.

**Decisión en xautom:** los KPIs Norte (score, bookmarks/1k, follow÷visita) y el
nuevo **reach ratio** quedan validados. Se pintan benchmarks con semáforo de 4
niveles solo en los KPIs con estándar publicado (follow÷visita, reach ratio).

---

## Fuentes

**Algoritmo (primario):**
- github.com/twitter/the-algorithm-ml/blob/main/projects/home/recap/README.md
- github.com/xai-org/x-algorithm · anotación: github.com/igorbrigadir/awesome-twitter-algo
- socialmediatoday.com/news/x-formerly-twitter-open-source-algorithm-ranking-factors/759702/ (X, 2025)
- businesstoday.in (penalización a ligas, Musk 2024-11-26)

**Analítica nativa:**
- sproutsocial.com/insights/twitter-analytics/ · blog.hootsuite.com/twitter-analytics-guide/ (2026)
- business.x.com/.../tweet-activity-dashboard y /export-csv-definitions · docs.x.com/x-api/fundamentals/metrics
- socialmediatoday.com (Creator Studio, dic-2025)

**Prácticas de creadores:**
- justinwelsh.me/newsletter/metrics-that-matter-going-beyond-followers-likes
- statweestics.com/blog/.../the-metrics-that-actually-predict-account-growth/
- blackmagic.so · support.typefully.com/en/articles/8718148-analytics-page-metrics · tweethunter.io
- tweetarchivist.com/twitter-engagement-rate-guide y /twitter-impressions-guide-2025
