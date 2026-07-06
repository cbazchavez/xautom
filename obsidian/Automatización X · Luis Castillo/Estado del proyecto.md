---
title: Estado del proyecto
tags: [estado, roadmap, decisiones, x-twitter, luis-castillo]
actualizado: 2026-07-06 12:40 CST
rama: claude/beautiful-darwin-5pee3l
repo: cbazchavez/xautom
---

# 📊 Estado del proyecto

> **🕐 Última actualización: 2026-07-06 12:40 (CST).**
> Esta nota es un **snapshot vivo**: se reescribe **al terminar cada sesión** con fecha y
> hora, explicando todo lo que el proyecto tiene en ese momento. Ver índice:
> [[Automatización X · Luis Castillo]].

## 🎯 Qué es (en una frase)

Motor `xautom` (Node) que lee la ficha de identidad de Luis (`profiles/luis.yaml`) y genera
**borradores bilingües EN/ES** de posts de X, listos para revisar. **No publica:** deja
borradores; **el operador (el usuario) elige y publica a mano** en la cuenta de Luis.

## ✅ Qué ya está construido (al 2026-07-06 12:40)

- **Motor de borradores** funcionando de punta a punta (validado en seco hasta v4).
- **Ficha `profiles/luis.yaml` → v5** (2026-07-06). Novedades v5:
  - **`voz.moldes`** — 7 moldes de post destilados del swipe (listicle, contrarian STOP,
    receipts, transformación+humildad, credencial-primero, aserción filosa, compartir
    generoso), cada uno con su peso. Ver [[Moldes y mezcla de pesos — X Luis]].
  - **`voz.mezcla_pesos`** — receta ligero/medio/pesado por batch (anti-cansancio).
  - **`ejemplos_si_suena`** ampliado con los **8 borradores aprobados** por Luis.
- **Reparto de pesos en el motor** (`src/distribute.js` → `distribuirPesos`) + render en
  `src/prompt.js`. Lógica verificada con simulación (batch de 12 → 5 ligeros/5 medios/2
  pesados). **⚠️ Falta `draft:dry` con Node** para validar en vivo (se editó en WSL).
- **Generación bilingüe** EN/ES nativa, salida Markdown lado a lado en `out/`.
- **Plan de batch determinista**: pilares por peso + tema activo (Asia/Seúl) + producto
  (~1/9) + **ahora también peso de post**.
- **Sistema de actualidad** (`research/` briefs) y **swipe file** (`swipe/`).
- **Notas de Obsidian** reorganizadas (2026-07-06): diario como carpeta por fecha
  (`Diario del proyecto/`), borradores en `Borradores/`, + notas Swipe y Moldes.

## 🧭 Decisiones tomadas

| Tema | Decisión |
|---|---|
| Meta del perfil | **Autoridad y comunidad** (no payout/monetización). Siembra. |
| Volumen | 10-12 posts/día **con barra de calidad dura** (se publica porque es bueno, no para llenar cuota). El motor genera; el operador elige. |
| Quién publica | **El operador (el usuario)**, a mano, en la cuenta de Luis. El motor NO publica. |
| Alcance del MVP | Motor de borradores. GUI local (tipo HaruLeads) **diferida**, se hará en **Node**. |
| Modelo de IA | **Opus** para calibrar. |
| Idioma | Inglés primario, español secundario, redacción nativa. |
| Perfiles de referencia | @athcanft = formato (robar CÓMO, tirar QUÉ); @jasonfried/@paulg = sustancia. |

## 🔴 Pendientes (en orden)

1. **`draft:dry` en sesión con Node** para validar la ficha v5 y el reparto de pesos
   (editado en WSL sin poder ejecutar el motor). Revisar que la distribución de pesos se
   vea bien antes del primer batch real.
2. **`ANTHROPIC_API_KEY`** como variable de entorno (ya guardada; entra en sesión nueva).
   Luego `npm run draft -- --profile luis --count 12` → primer batch con mezcla de pesos.
3. **Espejo `obsidian/` en el repo** ya sincronizado desde el vault (2026-07-06). Si se
   reorganiza en el vault otra vez, replicar vault→repo antes del próximo sync.
4. **Handle real de X** de Luis (hoy `@PENDIENTE` en la ficha).
5. **Seguir poblando el swipe**, sobre todo perfiles de **sustancia** (arquetipo
   cultura×negocio aún falta).
6. **Lista de productos** reales (`productos.lista`, hoy vacía) para promoción orgánica.
7. **GUI local** (diferida): dashboard Node con revisar borradores / swipe / rendimiento
   (métricas a mano) / botón prender-apagar.

## ⏭️ Próximo paso concreto

> **Sesión de Windows/repo con Node:** `git pull` de `xautom`, `npm run draft:dry` para
> validar v5 + el reparto de pesos, cargar la API key, y generar el **primer batch real de
> 12** con la mezcla de pesos. Revisar la distribución y la voz. Luego el operador empieza
> a **publicar** los mejores.

## 📌 Notas de contexto

- El entorno de trabajo es **efímero**: todo lo que importa se **commitea** al repo
  (incluida la carpeta `obsidian/`). El motor de la voz vive **solo** en `profiles/luis.yaml`.
- X está amurallado: Claude no lee links de X; el swipe y las métricas se alimentan con
  texto/screenshots a mano.
