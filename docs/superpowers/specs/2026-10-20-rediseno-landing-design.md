# Rediseño de la landing con Particular gratis — diseño

Fecha: 2026-10-20. Hilo "Rediseño de la landing".

## Problema

1. **Demasiado texto.** El inicio tiene ~1.560 palabras visibles; ¿Cómo funciona?
   ~1.420 y Planes ~1.430. Un visitante no alcanza a entender en 10 segundos qué
   es TapCar y cuánto cuesta.
2. **Precios nuevos de Uso particular** (tarea 12 del plan
   `2026-10-20-particular-gratis.md` del repo `nfc`): gratis con 1 auto; plan de
   pago a $5.000 al año **por cada auto** (incluido el primero), solo anual;
   chips gratis con despacho de $3.000 por 1 a 10 chips. La web hoy dice
   $2.500 al mes / $22.000 al año con selector mensual/anual.
3. **La app cambió de cara** (pulido UI/UX, PR #152/#154, y la escena del primer
   vehículo, PR #165) y la web quedó con el diseño anterior.

## Decisiones (Lukas, 2026-10-20)

| # | Tema | Decisión |
|---|------|----------|
| 1 | Alcance | Inicio y Planes desde cero. ¿Cómo funciona? y Socios con el sistema visual nuevo y menos texto. ¿Es legal? y Términos solo con el estilo nuevo, texto intacto (SEO y legal). |
| 2 | Detalle que sale del inicio | Pasa a ¿Cómo funciona? y Planes, más corto. |
| 3 | Motion | Escena SVG/CSS en el hero: el celular se acerca al chip y se abre la ficha con los documentos como en la app nueva. Sin video ni Lottie. |
| 4 | Tecnología | Sigue estático (HTML/CSS/JS sin build). Astro queda como proyecto aparte. |
| 5 | Mensaje | "Gratis con 1 auto" en el hero, un solo CTA "Crear cuenta gratis". |
| 6 | Planes Particular | Dos tarjetas (Gratis / De pago $5.000 al año por auto) + slider 1 a 10 con el total. Sin selector mensual/anual. Flotas sin cambios. |
| 7 | Publicación | La landing no tiene staging: `main` publica tapcar.cl. PR a `main` **sin mergear**; se revisa en la vista previa de Vercel y se mergea el día que la app sale a producción, con OK de Lukas. |

## Sistema visual

Se toma del repo `nfc` (`app/globals.css`, `docs/ui.md`), no se inventa:

- **Color**: `tinta #16191f`, `acero #5b6573`, `linea #e3e6ea`, `lienzo #f6f7f9`,
  `superficie #fff`, `azul #2952e6`, `azul-press #1e3dae`, `azul-50 #eef2fe`,
  `azul-100 #dde5fd`, `ambar #f59e0b`. Estados con sus variantes `-texto` y
  `-suave` (un color de estado nunca va solo: siempre con texto o ícono, y como
  texto siempre la variante `-texto`, que pasa 4,5:1).
- **Tipografía**: Geist / Geist Mono (Google Fonts, `display=swap`). Caveat se
  elimina (solo la usaba la anotación manuscrita de Planes, que desaparece).
- **Movimiento**: los tokens de la app (`ease-salir cubic-bezier(.2,.8,.2,1)`,
  duraciones base/lenta 200/320 ms). Toda animación con
  `@media (prefers-reduced-motion: no-preference)`; sin ella se ve el **estado
  final**, nunca uno a medio armar (misma regla que `tc-*` y `mock-*` en la app).
  Solo `transform` y `opacity`.
- **Componentes**: botón primario/secundario (alto ≥ 44 px), tarjeta, pill de
  estado (Vigente / Por vencer / Vencido), la "placa" de patente, chip de ícono.
  Íconos SVG de trazo 1,75–2 px (familia Lucide, como la app). Sin emoji.
- **Layout**: contenedor máx. 1120 px, gutter 16 px en celular, grillas con
  `minmax(0,1fr)`, `overflow-x: clip` (se conserva lo aprendido, ver README).
- La skill `ui-ux-pro-max` se usa como checklist (accesibilidad, toque,
  rendimiento, animación). Su buscador (`scripts/search.py`) no está disponible
  en este entorno; la paleta y la tipografía no se eligen, son las de la marca.

## Motion graphics

1. **Escena "Tap" del hero** (la principal). Celular + llavero NFC (el mismo
   dibujo que `components/brand/Llavero.tsx`). Secuencia de ~6 s en bucle:
   el llavero se acerca al celular → ondas NFC → en la pantalla se abre la
   ficha pública (`Toyota Hilux · placa GJ·KP·47`) → aparecen escalonadas tres
   filas: Permiso de Circulación *Vigente*, Revisión Técnica *Por vencer*, SOAP
   *Vigente* → pausa → vuelve a empezar. Se pausa fuera de pantalla
   (`IntersectionObserver` + `animation-play-state`). Con movimiento reducido:
   la ficha completa, quieta. `aria-hidden` en la escena y una descripción
   textual cercana (el subtítulo ya lo dice).
2. **Pasos con mini-escenas** (inicio, 3 pasos): cada paso con una ilustración
   que se anima **una vez** al entrar en pantalla (documentos que caen a la
   ficha; chip que se graba; un toque que abre la ficha). Inspiradas en
   `components/onboarding/mocks/Mocks.tsx`.
3. **Aparición al hacer scroll**: un solo patrón (sube 8 px + fade, 320 ms,
   escalonado 40 ms) para bloques. Ya existe; se unifica.
4. **Contador** "+600 vehículos" se conserva.

Regla: máximo 1–2 elementos animados a la vez en una vista.

## Contenido

### Inicio (meta: ≤ 350 palabras visibles, hoy 1.557)

1. Nav: Inicio · ¿Cómo funciona? · Planes · Socios · ¿Es legal? · Ingresar ·
   **Crear cuenta gratis**.
2. Hero: eyebrow "Gratis con 1 auto"; titular con el rotor que ya existe
   ("Tu *vehículo* a un Tap."); una línea: "Acerca el celular al chip y muestra
   los documentos del auto en cualquier control."; CTA "Crear cuenta gratis" y
   enlace secundario "Ver planes"; microcopy "Sin apps que instalar". Escena Tap.
3. Prueba social: "+600 vehículos ya operan con un Tap".
4. "Así de simple" — 3 pasos, una línea cada uno.
5. "¿Para quién es?" — 3 tarjetas: Uso particular (gratis con 1 auto), Flotas
   (conductores con PIN, fotos de entrega, reportes), Empresas del rubro.
   Cada una: título, una línea, enlace.
6. Beneficios: 4 tiles de ícono + título + ≤ 8 palabras (Avisos antes de que
   venza; Estados claros; Lectura con IA; Válido en Chile → /legal/).
7. CTA final + footer compacto.

### Planes

- Pills Uso particular / Flotas (se conservan).
- **Uso particular**: dos tarjetas lado a lado (apiladas en celular).
  *Gratis* — $0, 1 vehículo, documentos de fiscalización (Permiso, Revisión
  Técnica, SOAP, Padrón, Homologación), avisos por correo, ficha pública con
  un toque. *Plan completo* — $5.000 al año por vehículo; todo lo gratis +
  mantenciones, datos del vehículo, carga inteligente con IA, otros documentos,
  ficha sin conexión. Slider 1–10 en una franja a lo ancho bajo las dos
  tarjetas ("Calcula tu plan completo") → "Total: $X al año (IVA incluido)".
  Chips: "Chips gratis. Despacho $3.000 por envío (1 a 10 chips)."
  Sin selector mensual/anual.
- **Flotas**: calculadora y selector mensual/anual tal cual (lógica intacta),
  con el estilo nuevo. Despacho por tramos de siempre.
- "Todo incluido" corto, FAQ con las respuestas actualizadas a los precios
  nuevos y recortadas.

### ¿Cómo funciona? (meta: ≤ 50% del texto de hoy)

Las dos fases se conservan con un párrafo de ≤ 30 palabras por paso. Recibe en
forma compacta el bloque "Flotas: toda la operación" del inicio (6 ítems de
≤ 20 palabras). FAQ: mismas preguntas, respuestas recortadas.

### Socios (meta: ≤ 60% del texto de hoy)

Tres perfiles, cómo se empieza y FAQ más cortos. El formulario no se toca
(mismos `name`, mismo `fetch` a `/api/contacto`).

### ¿Es legal? y Términos

Solo estilo (CSS compartido, nav y footer nuevos). Texto intacto, salvo cifras
de precio si las hubiera.

## Lo que no cambia

- URLs, `canonical`, Open Graph, `robots.txt`, `sitemap.xml`.
- `api/contacto.js` y su contrato con los formularios.
- La analítica de Vercel al final de cada página.
- Los flujos de `tools/` (`precios.py` revisa, `--generar` escribe la
  calculadora; `schema.py` regenera el JSON-LD).

## Precios: contrato

`precios.json` cambia (commit `dd7e349`):
`planes.particular = { gratis: { vehiculos: 1 }, vehiculo: { anio: 5000 } }`,
sin `mes`; `envio_chips.particular = { hasta: 10, precio: 3000 }`. El repo `nfc`
compara byte a byte `lib/contrato/precios.tapcar.json` contra el publicado
(`contrato-precios.yml`), así que el hilo de la app copia este archivo tal cual.

`tools/precios.py` se adapta: el particular ya no tiene `mes` ni descuento, las
cifras esperadas son $5.000, los totales de 1 a 10 autos ($5.000…$50.000) y los
$3.000 del despacho particular; el bloque generado expone
`particular: { gratis: 1, veh: { anio: 5000 }, ... }` y `ENVIO_PARTICULAR`.

## Riesgos

- **Publicar antes que la app**: la web prometería un plan gratis que la app no
  da y el contrato semanal fallaría. Mitigación: PR sin mergear hasta el OK.
- **Romper botones** (Lukas lo advirtió en el pulido de la app): el QA recorre
  cada enlace y botón de las seis páginas, menú móvil, pills, sliders,
  toggle de Flotas y los dos formularios.
- **SEO**: menos texto en el inicio puede bajar palabras clave. Se mantienen
  títulos, descriptions, headings con las palabras clave y la página ¿Es legal?
  intacta; el JSON-LD se regenera para no prometer lo que la página ya no dice.

## Fuera del alcance

- Migrar a Astro u otro framework.
- Rehacer `og-tapcar.png` con Geist.
- Modo oscuro.
