---
title: Estado del proyecto
tags: [estado, roadmap, decisiones, x-twitter, luis-castillo]
actualizado: 2026-07-01
rama: claude/beautiful-darwin-5pee3l
repo: cbazchavez/xautom
---

# 📊 Estado del proyecto

Foto del proyecto al **2026-07-01**. Ver índice: [[Automatización X · Luis Castillo]].

## ✅ Qué ya está construido

- **Motor de borradores (`xautom`)** funcionando de punta a punta (validado en seco).
- **Ficha de identidad** de Luis en `profiles/luis.yaml` — **v3**, enriquecida con el deck
  de branding y los frameworks de Instagram (ver [[Ficha de perfil · Luis Castillo]]).
- **Generación bilingüe** EN/ES nativa, con salida en Markdown lado a lado.
- **Plan de batch determinista**: reparte pilares por peso, teje el tema activo (Asia/Seúl)
  y deja lista la mecánica de productos (aunque la lista esté vacía).
- **Material de referencia** versionado en `reference/` (deck + Reels), marcado como
  secundario.
- **Archivo de ejemplo** (`examples/luis-ejemplo.md`) para ver el formato de salida.

## 🧭 Decisiones tomadas

| Tema | Decisión |
|---|---|
| Alcance del MVP | Solo **motor de borradores**. Sin base de datos ni dashboard. |
| Analítica | **Fuera por ahora** (se retoma si duele la revisión). |
| Perfil de arranque | **1 ficha real** (Luis) para calibrar la voz antes de replicar. |
| Modelo de IA | **Opus** (mejor calidad de voz para calibrar). Sonnet si el costo aprieta. |
| Idioma | **Inglés primario**, español secundario, redacción nativa. |
| Publicación | El motor **no publica ni responde**: solo borradores; Luis elige. |
| Borradores generados | Se **versionan** en `out/` para revisarlos desde GitHub. |

## 🔴 Pendientes (en orden)

1. **Cargar `ANTHROPIC_API_KEY`** como variable de entorno del environment.
   - ⚠️ Ya se guardó, pero **entra en una sesión nueva** (esta arrancó sin ella).
   - Al tenerla: `npm run draft -- --profile luis --count 6` → primer batch real en `out/`.
2. **Calibrar la voz** con la reacción de Luis al primer batch (ajustar ejemplos SÍ/NO).
3. **Handle real de X** de Luis (hoy `@PENDIENTE`).
4. **Lista de productos** reales (nombre, qué hace, etapa, si se menciona) para la
   promoción orgánica.

## ⏭️ Próximo paso concreto

> Iniciar una **sesión nueva** sobre la rama `claude/beautiful-darwin-5pee3l` (para que
> cargue la API key), generar el primer batch real y **revisar la voz juntos**.

## 📌 Notas de contexto

- El entorno de trabajo es **efímero** (se recrea cada sesión): por eso todo lo que importa
  se **commitea** al repo, incluida esta carpeta de Obsidian.
- El motor de la voz vive **solo** en `profiles/luis.yaml`; el resto es andamiaje.
