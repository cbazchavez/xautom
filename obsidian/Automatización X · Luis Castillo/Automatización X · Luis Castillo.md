---
tipo: proyecto
area: CIMIENTO
titulo: "Automatización X · Luis Castillo"
estado: activo
prioridad: alta
proximo_paso: "Sesión de Windows/repo: integrar los 7 moldes + la mezcla de pesos a profiles/luis.yaml (voz.tecnicas_ok), validar con draft:dry y generar el primer batch aplicando la receta de pesos (ligeros+valor, no solo mini-ensayos). Seguir capturando perfiles de sustancia."
deadline: 2026-09-30
repo: cbazchavez/xautom
tags: [proyecto, x-twitter, luis-castillo, automatizacion, ia]
actualizado: 2026-07-06
---

# 🧵 Automatización X · Luis Castillo

> 👉 **Próximo paso:** ver campo `proximo_paso` arriba.

Nota índice (MOC) del proyecto. Aquí vive el **para qué**, el **estado** y los enlaces
a las demás notas.

> [!info] Qué es este proyecto
> Un **motor de borradores** para el perfil de X (Twitter) de Luis Castillo.
> Lee una **ficha de identidad** (su voz, pilares, reglas) y genera borradores
> listos para revisar, cada uno en **inglés y español nativos**. No publica ni
> responde: solo deja borradores para que **Luis elija** qué sube.
> El código se llama `xautom` y vive en GitHub (`cbazchavez/xautom`).

## 🗺️ Mapa de notas

- [[Ficha de perfil · Luis Castillo]] — quién es Luis y cómo suena en X.
- [[Estado del proyecto]] — qué está construido, decisiones y pendientes.
- [[Cómo funciona el motor]] — el flujo técnico, en simple.
- [[Actualidad y curación del feed]] — swipe file del feed + briefs de noticias.
- [[Swipe X — captura (xautom)]] — captura de perfiles de referencia (@athcanft, @jasonfried, @paulg) y sus moldes.
- [[Moldes y mezcla de pesos — X Luis]] — los 7 moldes + la receta anti-cansancio para los batches.
- **Carpeta `Borradores/`** — borradores por fecha. Última tanda: [[Borradores/2026-07-06|Borradores 2026-07-06]] (A-H, aprobados por Luis).
- **Carpeta `Diario del proyecto/`** — bitácora por fecha (una nota por día). Última: [[Diario del proyecto/2026-07-06|2026-07-06]].

## 🎯 En una frase

> Construir la **autoridad** de Luis en IA, negocios digitales y vibecoding, con
> alcance internacional — sembrando valor real y consistente, sin humo de gurú.

## 🔴 Lo que falta para arrancar (pendientes)

1. **`ANTHROPIC_API_KEY`** cargada como variable de entorno → generar el primer
   batch real (ver [[Estado del proyecto]]).
2. **Handle real de X** de Luis (hoy `@PENDIENTE`).
3. **Lista de productos** reales para la promoción orgánica.
4. **Calibrar la voz** con la reacción de Luis al primer batch.

## 🔮 Cuenta propia (futuro)

> El mismo motor sirve para **mi cuenta de X**: es solo agregar otra ficha/`profile`
> con mi voz y pilares. Por ahora documentamos **solo a Luis** para calibrar bien la
> voz con una cuenta real; cuando toque, se replica el patrón para la mía (ver
> [[Cómo funciona el motor]] — la voz vive toda en `profiles/*.yaml`).

---
*Esta carpeta se mantiene en el repo del proyecto (`obsidian/`) y se copia al vault.
Si algo cambia en el proyecto, se actualizan estas notas.*
