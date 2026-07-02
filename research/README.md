# Sistema de actualidad (briefs de noticias + curación del feed)

Alimenta al motor con **lo que está pasando hoy** para que parte del batch salga
"actual" en vez de evergreen. Dos fuentes, un solo archivo por día.

## Flujo

1. **Investigación (Claude Code):** una sesión de Claude investiga noticias del día
   en los temas de Luis (IA, builders, mercados, y el tema activo vigente) con
   búsqueda web, y escribe `research/brief-YYYY-MM-DD.yaml`. Pedirlo con:
   _"genera el brief de hoy para xautom"_.
2. **Curación del feed (humano):** el equipo pega en la sección `feed:` del brief
   los tweets interesantes vistos en el timeline de Luis (autor + texto + ángulo).
   Es manual a propósito: el criterio de qué vale la pena es humano.
3. **Generación:** `npm run draft` toma el brief más reciente por default
   (`--brief latest`). Usar `--brief none` para un batch evergreen o
   `--brief research/brief-2026-07-02.yaml` para uno concreto.

## Formato del brief

```yaml
fecha: 2026-07-02
noticias:
  - titulo: "OpenAI lanza X"
    fuente: "TechCrunch"
    url: "https://..."
    resumen: "Qué pasó, con los datos duros (cifras, fechas, nombres)."
    por_que_importa: "El ángulo para builders — qué significa para quien construye."
    pilar_sugerido: modelos_de_negocio   # id de pilar de la ficha, opcional
feed:
  - autor: "@handle"
    tweet: "Texto del tweet visto en el timeline de Luis."
    idea: "Qué take podría tener Luis (opcional)."
```

## Reglas (las hace cumplir el prompt del motor)

- Las noticias son **opcionales por borrador** y solo si embonan con el pilar
  asignado; el borrador reporta la URL usada en `news_ref`.
- El modelo solo puede usar los datos del `resumen` — por eso el resumen debe
  traer las cifras exactas: si no están ahí, no existen.
- Los tweets del feed **jamás se copian ni se parafrasean de cerca**: generan el
  take propio de Luis. Si el borrador necesita el contexto del tweet original,
  sale marcado `quote_of: @autor` y se publica como **quote-tweet** citando al
  autor (curación legítima; copiar sería plagio y mataría la credibilidad de la
  cuenta).
- Los briefs se versionan en esta carpeta: son el registro de qué actualidad
  alimentó cada batch.

## Higiene

- Un brief por día como máximo; 5–8 noticias bien escogidas > 20 tiradas.
- Verificar que las noticias sean del día (o de las últimas 48 h): un "breaking"
  viejo hace ver la cuenta desactualizada, que es peor que evergreen.
- La contraseña de la cuenta de X **nunca** se guarda en este repo ni en el vault.
