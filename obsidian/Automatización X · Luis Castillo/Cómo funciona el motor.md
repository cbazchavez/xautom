---
title: Cómo funciona el motor
tags: [tecnico, como-funciona, xautom]
actualizado: 2026-07-01
---

# ⚙️ Cómo funciona el motor

Explicación en simple del flujo. Ver índice: [[Automatización X · Luis Castillo]].

## El flujo, de principio a fin

```
profiles/luis.yaml  →  plan del batch  →  prompt  →  Claude (Opus)  →  out/luis-FECHA.md
   (la voz)            (código)          (texto)     (genera)          (EN + ES)
```

1. **La ficha** (`profiles/luis.yaml`) define quién es Luis y **cómo suena**: voz, ejemplos
   SÍ/NO, pilares con peso, tema activo, reglas. Es la **única fuente** de la voz.
2. **El plan del batch** (código) decide —de forma determinista— qué pilar le toca a cada
   borrador (según su peso), cuáles tejen el tema activo (~20%) y cuáles aterrizan producto
   (~1 de cada 9, nunca seguidos). No se deja al azar del modelo.
3. **El prompt** convierte la ficha en instrucciones de voz + qué generar en este batch.
4. **Claude (Opus)** escribe los borradores, cada uno en **inglés y español nativos**.
5. **La salida** es un Markdown en `out/` con los borradores lado a lado y sus metadatos,
   listo para revisar y elegir.

## Cómo se usa (para cuando esté la API key)

```bash
npm install
cp .env.example .env          # pegar ANTHROPIC_API_KEY

npm run draft -- --dry-run                 # ver los prompts sin gastar API
npm run draft -- --profile luis --count 6  # generar 6 borradores reales
```

Opciones: `--profile`, `--count`, `--model`, `--out`, `--dry-run`.

## Cómo se afina la voz

Todo se edita en `profiles/luis.yaml`. Lo que **más mueve la aguja**:

- **Ejemplos SÍ / NO** (`voz.ejemplos_si_suena` / `ejemplos_no_suena`) — el calibrador más
  potente. Si un borrador suena mal, se agrega esa frase a la lista NO.
- **Peso de los pilares** (`alto` / `medio` / `bajo`) — cambia la mezcla del batch.
- **Tema activo** — la campaña temporal (viaje a Seúl). Se borra al terminar.
- **Productos** — cuando haya datos reales, el motor empieza a aterrizarlos solo.

## Qué NO hace (por diseño)

- No publica en X.
- No responde comentarios ni conversaciones.
- No inventa datos personales de Luis.
- No usa base de datos ni dashboard (MVP deliberadamente simple).

---
*Ver también: [[Ficha de perfil · Luis Castillo]] · [[Estado del proyecto]]*
