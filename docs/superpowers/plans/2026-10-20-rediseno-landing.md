# Rediseño de la landing con Particular gratis — plan

Diseño: `docs/superpowers/specs/2026-10-20-rediseno-landing-design.md`.
Rama `claude/project-thread-ydl8mu`. Un commit por tarea. PR a `main` sin
mergear (se publica el día que la app sale a producción).

Reglas para cada tarea:
- `styles.css` es la fuente; tras tocarlo se reincrusta en las seis páginas con
  el one-liner del README. Nunca editar el `<style>` de un `.html` a mano.
- Toda animación bajo `prefers-reduced-motion: no-preference`, solo
  `transform`/`opacity`, y el estado base es el final.
- Español neutro de Chile, tuteando.
- Al cerrar cada tarea: `python tools/precios.py` (desde la tarea 5 debe estar en
  verde), `node tools/test_contacto.js`, y servir con `python -m http.server`
  para abrir la página tocada sin errores en consola.

1. **Precios.** `precios.json` con el particular nuevo y el despacho propio.
   *(Hecho: `dd7e349`.)*
2. **Sistema visual.** Tokens de la app en `:root` de `styles.css` (colores,
   estados `-texto`/`-suave`, radios, sombras, `ease-salir`, duraciones);
   botones, tarjeta, pill de estado, placa, chip de ícono, nav y footer nuevos
   (nav: Inicio · ¿Cómo funciona? · Planes · Socios · ¿Es legal? · Ingresar ·
   Crear cuenta gratis); patrón único de aparición al scroll. Se aplica a las
   seis páginas (nav/footer reemplazados en cada `.html`). ¿Es legal? y Términos
   quedan terminadas aquí (texto intacto). Se quita Caveat.
3. **Escena Tap.** Bloque reutilizable HTML + SVG + CSS (+ JS mínimo para
   pausarla fuera de pantalla) con la secuencia del spec, a partir de
   `components/brand/Llavero.tsx`, `components/onboarding/mocks/Mocks.tsx` y la
   escena de `AvisoVehiculoNuevo.tsx` del repo `nfc`. Con movimiento reducido:
   ficha completa y quieta. Se integra en el hero del inicio en la tarea 4.
4. **Inicio desde cero.** Estructura y textos del spec (≤ 350 palabras
   visibles), escena Tap en el hero, rotor y contador conservados, 3 pasos con
   mini-escenas que se animan una vez, 3 tarjetas de audiencia, 4 beneficios,
   CTA final.
5. **Planes desde cero + generador.** `tools/precios.py` adaptado (cifras
   esperadas, canónicas, bloque JS con `gratis`, `veh.anio` y
   `envioParticular`); `--generar`; tarjetas Gratis / Plan completo, slider 1–10
   con total anual, nota de chips; Flotas con su calculadora y toggle intactos;
   FAQ y "Todo incluido" recortados y con precios nuevos; formulario de flota
   grande intacto. `python tools/precios.py` en verde.
6. **¿Cómo funciona? y Socios con menos texto.** Pasos de ≤ 30 palabras, bloque
   compacto de Flotas venido del inicio, FAQ recortados; Socios ≤ 60% del texto,
   formulario intacto.
7. **Prosa, metadatos y documentación.** `llms.txt` y README con los precios y
   la estructura nuevos; descriptions si cambiaron; `python tools/schema.py`;
   `python tools/precios.py` en verde; `node tools/test_contacto.js`.

Después: QA con Chromium headless (escritorio 1440 y celular 390): capturas de
cada página, con y sin movimiento reducido; recorrido de todos los enlaces y
botones, menú móvil, pills, sliders, toggle de Flotas, formularios (con
`fetch` a `/api/contacto` interceptado); sin scroll horizontal a 360 px; sin
errores en consola. Corregir bugs claros, repetir. PR a `main` e informe.
