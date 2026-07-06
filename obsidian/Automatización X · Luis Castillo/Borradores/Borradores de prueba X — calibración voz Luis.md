---
title: Borradores de prueba X — calibración voz Luis
tags: [xautom, luis-castillo, borradores, calibracion-voz]
estado: A-H-aprobados-por-luis (candidatos a publicar)
creado: 2026-07-06
---

# 🧪 Borradores de prueba X — calibración de la voz de Luis

> Escritos **a mano** (sin motor) el 2026-07-06, aplicando los moldes de
> [[Swipe X — captura (xautom)]] con la mezcla de pesos de [[Moldes y mezcla de pesos — X Luis]].
> Objetivo: **que Luis reaccione** y calibremos la voz (frases a
> `voz.ejemplos_si_suena` / `_no_suena` de `profiles/luis.yaml`).
> EN primero (idioma principal por defecto), ES nativo debajo.
> ⚠️ Los datos marcados `[confirmar]` necesitan el dato real de Luis.

> [!success] Estado
> **A-H → ✅ TODOS APROBADOS por Luis** (2026-07-06). A-D primero ("A suena exactamente
> a Luis, B súper, C excelente, D suena a Luis"); su crítica —faltaban registros **menos
> trascendentes** y de **puro valor**— generó E-H, también aprobados ("están súper bien").
> **Los 8 son candidatos a publicar.** El sistema detrás: [[Moldes y mezcla de pesos — X Luis]].

---

# — Tanda 1: los 4 aprobados (registro pesado/medio) —

## Borrador A — Molde #4 (transformación + humildad) · Pilar: Construir con IA / Proceso

**EN**
```
i spent three weeks hand-coding a client dashboard last year.

last month i rebuilt the same thing in a weekend, with AI doing the boring 80%.

the lesson wasn't "AI is faster." it was that most of what i was proud of — the
plumbing — was never the value. the value was the 20% only i could judge.

i'm great at knowing what to build. i'm still learning to let the machine build it.
```

**ES**
```
El año pasado me tardé tres semanas picando a mano el dashboard de un cliente.

El mes pasado rehíce lo mismo en un fin de semana, con IA haciendo el 80% aburrido.

La lección no fue "la IA es más rápida". Fue que casi todo lo que me enorgullecía
—la plomería— nunca fue el valor. El valor era el 20% que solo yo podía juzgar.

Soy bueno decidiendo qué construir. Sigo aprendiendo a dejar que la máquina lo construya.
```
*Por qué es Luis: cierre humilde y autoconsciente (el molde que más jaló en @athcanft),
"el 20% que solo yo podía juzgar" = criterio. Cero hustle.*

---

## Borrador B — Molde #2 (contrarian "STOP") · Pilar: Modelos de negocio e ideas

**EN**
```
stop trying to build a product people love.

build the one thing they hate doing, and do it for them.

the best business i saw this month charges $40/mo to rename and file your invoices.
that's it. no delight, no magic. just "i never think about this again."

boring problems have the loosest wallets.
```

**ES**
```
Deja de intentar construir un producto que la gente ame.

Construye esa única cosa que odian hacer, y hazla por ellos.

El mejor negocio que vi este mes cobra $40 al mes por renombrar y archivar tus
facturas. Ya. Sin encanto, sin magia. Solo "nunca vuelvo a pensar en esto".

Los problemas aburridos son los que tienen la cartera más suelta.
```
*Por qué es Luis: opinión que se moja + número concreto ($40/mo), en la línea de su
ejemplo SÍ del SaaS de $9. `[confirmar]` si prefiere un negocio real que haya visto.*

---

## Borrador C — Molde #5 (credencial-primero) + #1 (listicle) · Pilar: Construir con IA

**EN**
```
i've shipped AI tools for companies and a couple of governments. here's what nobody
tells you:

- the model is never the hard part
- 90% of the work is deciding what NOT to automate
- "it works in the demo" and "it works tuesday at 4pm" are different products
- the client doesn't want AI. they want to stop worrying about the thing.
- taste is the moat. anyone can call the same API you do.
```

**ES**
```
He entregado herramientas de IA para empresas y un par de gobiernos. Esto es lo que
nadie te cuenta:

- el modelo nunca es la parte difícil
- el 90% del trabajo es decidir qué NO automatizar
- "funciona en el demo" y "funciona un martes a las 4pm" son productos distintos
- el cliente no quiere IA. quiere dejar de preocuparse por el problema.
- el gusto es el foso. cualquiera puede llamar a la misma API que tú.
```
*Por qué es Luis: credencial real al frente (compra la atención), "taste is the moat"
= su diferenciador. `[confirmar]` el fraseo exacto de la credencial empresas/gobiernos.*

---

## Borrador D — Observación (molde #4 suave) · Pilar: Vida y cultura / Lectura del mundo

**EN**
```
worked out of a friend's studio in mexico city last week. concrete, twelve-foot
ceilings, one long table, no dividers.

got more done in three days than the previous three weeks in my nice ergonomic setup.

we obsess over productivity apps. the room was the productivity app.
```

**ES**
```
La semana pasada trabajé desde el estudio de un amigo en la CDMX. Concreto, techos de
cuatro metros, una sola mesa larga, sin divisiones.

Avancé más en tres días que en las tres semanas previas en mi setup ergonómico bonito.

Nos obsesiona la app de productividad. El cuarto era la app de productividad.
```
*Por qué es Luis: pilar "Vida y cultura" sin moraleja forzada; toca su ángulo "los
espacios moldean cómo piensas". Atmósfera observacional, no venta.*

---

# — Tanda 2: los registros que faltaban (ligeros + puro valor) —

> Añadidos tras el feedback de Luis del 2026-07-06 ("faltan menos trascendentes y de
> puro valor, que no canse"). Modelos: @paulg (aserción filosa) y @jasonfried
> (compartir generoso). Pendientes de su reacción.

## Borrador E — Molde #6 (aserción filosa, PG) · 🪶 ligero · Pilar: Lectura del mundo / IA

**EN**
```
most "AI strategy" is just deciding what you're willing to be worse at, faster.
```

**ES**
```
casi toda la "estrategia de IA" es solo decidir en qué estás dispuesto a ser peor,
más rápido.
```
*Por qué es Luis: una idea filosa, sin historia ni atmósfera. Se moja. Registro PG.*

---

## Borrador F — Molde #6 (observación, ligero) · 🪶 ligero · Pilar: Vida y cultura

**EN**
```
the best menu in the city has nine items. the worst has ninety.

confidence is a form of respect.
```

**ES**
```
el mejor menú de la ciudad tiene nueve platillos. el peor, noventa.

la confianza es una forma de respeto.
```
*Por qué es Luis: gusto/criterio en dos líneas, sin moraleja de negocios forzada.
Ligero y observacional.*

---

## Borrador G — Puro valor / how-to accionable · ⚖️ medio · Pilar: Construir con IA / Negocio

**EN**
```
want to test a startup idea this weekend without code?

- write the landing page first, as if it already exists
- put a real price on it
- send it to 10 people who'd actually pay
- if nobody clicks "buy," you just saved 3 months

the idea was always the cheap part.
```

**ES**
```
¿quieres probar una idea de startup este finde sin escribir código?

- escribe primero la landing, como si ya existiera
- ponle un precio real
- mándasela a 10 personas que de verdad pagarían
- si nadie le da a "comprar", te ahorraste 3 meses

la idea siempre fue lo barato.
```
*Por qué es Luis: valor accionable de verdad (el lector puede hacerlo hoy), número
concreto, cero humo. Este es el registro "aporta valor" que Luis pidió.*

---

## Borrador H — Molde #7 (compartir generoso, JF) · 🪶 ligero · Pilar: Proceso y ejecución

**EN**
```
someone asked how i keep client projects from turning into chaos.

so i wrote down the exact setup i use: one doc, three sections, updated every friday.
nothing fancy. [link/recurso — confirmar]

steal it.
```

**ES**
```
alguien me preguntó cómo evito que los proyectos con clientes se vuelvan un caos.

así que dejé por escrito el setup exacto que uso: un doc, tres secciones, actualizado
cada viernes. nada del otro mundo. [link/recurso — confirmar]

róbatelo.
```
*Por qué es Luis: generoso y práctico, humaniza, cero pose. `[confirmar]`: necesita un
recurso/link real de Luis (o se adapta a algo que sí comparta). Registro JF.*

---
*Ver también: [[Swipe X — captura (xautom)]] · [[Moldes y mezcla de pesos — X Luis]] ·
[[Ficha de perfil · Luis Castillo]]*
