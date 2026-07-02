# swipe/ — base de datos de tweets que funcionan

Corpus de referencia del nicho: tweets del feed de Luis (sigue perfiles que empatan
con lo que queremos) que tuvieron **buen performance** — hilos populares, hooks que
jalaron, formatos exitosos. Se estudia el **patrón**, jamás se copia el contenido.

## Flujo de captura (manual, 2 minutos)

1. Navegando el feed de Luis, cuando veas un tweet/hilo con buenos números:
   copia la **URL** y (si se puede) el texto y las métricas visibles.
2. Pégalo TODO en crudo en `swipe/inbox.md` — sin formato, como venga.
3. Pídele a una sesión de Claude Code: *"procesa el inbox del swipe"* → estructura
   las entradas en `swipe/tweets.yaml`, analiza por qué funciona cada una y vacía
   el inbox.

Tip: en X, guarda los candidatos en **Bookmarks** desde el teléfono y vacíalos al
inbox en una sentada.

## Cómo se usa (destilación → ficha)

El motor **no** lee esta base directamente — sería tentarlo a imitar de cerca. El
ciclo es:

1. Cada ~20 entradas nuevas (o antes de recalibrar), una sesión de Claude analiza
   `tweets.yaml`: qué hooks se repiten en los ganadores, qué largos de hilo, qué
   estructuras (número específico, contrarian, historia→lección…), qué formatos.
2. Los patrones destilados se proponen como cambios a `profiles/luis.yaml`
   (`voz.tecnicas_ok` y formato) — con Luis/el equipo aprobando.
3. La ficha versionada queda como registro de qué aprendió la voz y cuándo.

**Regla dura:** de aquí salen PATRONES (estructura, hook, cadencia), nunca frases.
Cualquier borrador que se parezca de cerca a una entrada del swipe se descarta.

## Formato de `tweets.yaml`

```yaml
- id: 1
  autor: "@handle"
  url: "https://x.com/..."
  capturado: 2026-07-02
  formato: single          # single | thread | quote
  tema: "vibecoding"
  texto: >
    Texto del tweet (o del primer tweet del hilo + resumen del resto).
  metricas:                # las visibles al capturar; null si no se ven
    vistas: 120000
    likes: 3400
    rts: 210
    respuestas: 85
  por_que_funciona: >
    Análisis corto: tipo de hook, estructura, por qué jaló.
```
