# xautom

Motor de **borradores** de X (Twitter) calibrado por voz.

Lee una **ficha de identidad** (YAML) y genera un batch de borradores listos para
revisar: cada uno en **inglés y español nativos** (no traducción), respetando los
pilares de contenido, su jerarquía, los temas activos temporales y las reglas de
promoción orgánica de productos.

No publica. No responde conversaciones. Solo deja borradores en un `.md` para que
**Luis decida** qué publicar y en qué idioma.

## Cómo funciona

```
profiles/luis.yaml   →   plan del batch (código)   →   prompt   →   Claude   →   out/luis-2026-06-22.md
   (la voz)              (pilares por peso,            (system +     (Opus)        (EN + ES lado a lado)
                          tema activo, productos)       user)
```

1. **`profiles/<id>.yaml`** define quién es, cómo suena (ejemplos SÍ/NO), sus
   pilares con peso, temas activos y reglas. Es la única fuente de la voz.
2. **El plan del batch** (`src/distribute.js`) decide en código —determinista y
   auditable— qué pilar le toca a cada borrador (por peso), cuáles tejen un tema
   activo (~20%) y cuáles aterrizan producto (~1 de cada 9, nunca seguidos).
3. **El prompt** (`src/prompt.js`) convierte la ficha en un system prompt de voz
   y le pasa al modelo las instrucciones exactas por borrador.
4. **La salida** (`out/<id>-<fecha>.md`) muestra cada borrador en EN y ES con sus
   metadatos para revisión rápida.

## Uso

```bash
npm install
cp .env.example .env      # y pon tu ANTHROPIC_API_KEY

# Inspeccionar los prompts sin gastar API:
npm run draft -- --dry-run

# Generar 6 borradores para Luis:
npm run draft -- --profile luis --count 6
```

Opciones: `--profile/-p`, `--count/-n`, `--model/-m`, `--out/-o`, `--dry-run`, `--help/-h`.

Modelo por defecto: `claude-opus-4-8` (mejor calidad de voz para calibrar). Para
batches grandes y más baratos, `--model claude-sonnet-4-6`.

## Editar la voz

Todo vive en `profiles/luis.yaml`. Lo que más mueve la aguja:

- **`voz.ejemplos_si_suena` / `ejemplos_no_suena`** — el calibrador más potente.
  Cuando un borrador suene fuera de tono, agrega un ejemplo NO con esa frase.
- **`pilares[].peso`** (`alto`/`medio`/`bajo`) — cambia la mezcla del batch.
- **`temas_activos`** — campañas temporales (p.ej. el viaje a Seúl). Bórralo al
  terminar y el lente queda como pilar.
- **`productos.lista`** — cuando tengas los datos reales, el motor empieza a
  aterrizar producto solo (siguiendo `reglas_de_promocion`). Mientras esté vacío,
  nunca menciona productos.

## Pendientes conocidos

- `perfil.handle` real (hoy `@PENDIENTE`).
- `productos.lista` con los productos reales y su etapa (`publico`/`beta`/`stealth`).
- La voz es **provisional**: se calibra con la reacción de Luis al primer batch.
