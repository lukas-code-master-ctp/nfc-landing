# TapCar — Sitio web

Landing comercial de **TapCar**: la operación de tus vehículos a un toque. Cada vehículo guarda sus papeles (Permiso de Circulación, Revisión Técnica, SOAP, etc.), registra quién lo usa con un PIN y abre su ficha pública desde un chip NFC —pegado al parabrisas o de llavero—.

Sirve tanto para un auto particular como para una flota de empresa; el precio es por vehículo.

Sitio estático en HTML/CSS/JS, implementado a partir de un diseño de [Claude Design](https://claude.ai/design).

## Páginas

| Página | Archivo | Contenido |
|---|---|---|
| Home / Landing | [`index.html`](index.html) | Hero con rotor de palabra, "¿Para quién es?", "Cómo funciona", "Un toque, toda la operación", beneficios, showcase de la ficha, CTA |
| ¿Cómo funciona? | [`como-funciona/index.html`](como-funciona/index.html) | Paso a paso en dos fases (puesta en marcha 01–04, día a día 05–08) + FAQ de 9 preguntas |
| Planes | [`planes/index.html`](planes/index.html) | Pills de plan (Uso particular / Flotas), toggle mensual/anual con el ahorro, calculadora con slider por plan, "Todo incluido" por audiencia, FAQ, CTA |
| Términos y Condiciones | [`terminos/index.html`](terminos/index.html) | Términos del servicio con la política de privacidad incluida. Enlazada solo desde el footer, no desde el nav |
| ¿Es legal? | [`legal/index.html`](legal/index.html) | Tabla documento por documento, las cuatro bases normativas, los tres requisitos de validez, qué pasa en un control, referencias oficiales y FAQ de 8 preguntas. **Es la página pensada para captar búsqueda**: "¿es legal mostrar los documentos del auto en digital?" es una consulta real y poco respondida |

## Estructura

```
.
├── index.html              # Home / Landing (autónoma, CSS incrustado)
├── como-funciona/index.html
├── planes/index.html
├── legal/index.html
├── terminos/index.html
├── styles.css              # Design system compartido (fuente editable)
├── assets/                 # Imágenes publicadas
│   ├── chip-llavero.webp   # Foto del llavero NFC
│   ├── impulse-ai.webp     # Lockup de la matriz, para el footer (3x)
│   └── og-tapcar.png       # Tarjeta 1200×630 al compartir el link
├── favicon.svg
├── robots.txt              # Bloquea /_design_src/, apunta al sitemap
├── sitemap.xml
├── llms.txt                # Resumen del sitio para motores generativos
├── tools/schema.py         # Regenera el JSON-LD desde el contenido visible
└── _design_src/            # Archivos originales del diseño y fotos sin procesar
```

`_design_src/` está versionado pero **no es parte del sitio**: si lo publicas tal cual, esas rutas quedan accesibles. Por eso `robots.txt` las excluye.

## CSS: fuente única e incrustada

`styles.css` es **la fuente editable**. El mismo CSS va incrustado dentro del `<style>` de cada `.html` para que las páginas funcionen de forma autónoma (abrir con doble clic, sin servidor).

Tras editar `styles.css` hay que volver a incrustarlo en las cinco páginas:

```bash
python -c "import io; css=io.open('styles.css',encoding='utf-8').read().rstrip(); [io.open(f,'w',encoding='utf-8',newline='').write(h[:h.index('<style>')+7]+'\n'+css+'\n'+h[h.index('  </style>'):]) for f in ['index.html','planes/index.html','legal/index.html','como-funciona/index.html','terminos/index.html'] for h in [io.open(f,encoding='utf-8').read()]]"
```

Editar el `<style>` de un `.html` a mano hace que ese cambio se pierda en la siguiente sincronización.

## Uso

Abre `index.html` en el navegador, o sirve la carpeta con cualquier servidor estático:

```bash
python -m http.server 4310
```

Sírvela en vez de abrir el archivo si vas a probar la navegación: los enlaces entre páginas son absolutos (`/planes/`) y las imágenes viven en `/assets/`.

## Diseño

- Tipografías: **Geist** / **Geist Mono**; **Caveat** solo para la anotación manuscrita de Planes (Google Fonts)
- Color de marca: `#2952e6`
- Componentes reproducidos del TapCar Design System: Button, Card, IconChip, StatusBadge, VehicleCard, DocumentRow

### Comportamientos con JS

Cada página lleva su script incrustado al final del `<body>`:

- **Menú móvil** (las 5 páginas) — bajo 860px el nav pasa a un panel desplegable; marca el enlace activo comparando el `pathname`, y cierra con Escape, con clic fuera o al volver a escritorio. "Ingresar" se queda visible en la barra (no entra al panel) y "Crear cuenta" solo vive dentro del panel.
- **Rotor del hero** (home) — la palabra de "Tu _flota_ a un Tap." rota entre flota/auto/moto/camioneta animando el ancho. El `h1` lleva un `aria-label` fijo con la frase completa y el rotor se desactiva con `prefers-reduced-motion`.
- **Reveal on scroll** (home y ¿Cómo funciona?) — `IntersectionObserver` con retraso escalonado.
- **Contador del hero** (home) — el número de vehículos cuenta desde 0 al entrar en pantalla. La cifra vive en el HTML (`data-valor` y el texto del span, las dos), así que sin JS se ve igual, solo que sin animar. `data-prefijo` es lo que va pegado delante (hoy `+`).
- **Calculadora** (planes) — dos sistemas de precio en pills (Uso particular y Flotas), toggle mensual/anual, slider de vehículos por plan, slider de cuentas de conductor en Flotas acotado al número de vehículos, ahorro anual, burbuja del slider y empujón al plan anual. Sobre 100 vehículos reemplaza el precio por un llamado a contacto.

### Notas de responsive

- Las grillas usan `minmax(0, 1fr)`, no `1fr`: las fichas con texto que no envuelve (patentes, documentos) estiraban la columna y sacaban scroll lateral.
- `html` lleva `text-size-adjust: 100%` y `overflow-x: clip` (no `hidden`, que rompe el nav sticky) como red de seguridad contra el desborde horizontal en móviles reales.
- El titular del hero lleva un `<br class="lp-hero__nl">` que solo existe bajo 560px. Sin él, la palabra más larga del rotor ("camioneta") no cabe junto a "a un Tap." en pantallas angostas: el `h1` pasa de una línea a dos y todo el hero baja y sube en cada rotación. Con el salto forzado el titular mide siempre dos líneas. Si agregas palabras al rotor, ninguna debería ser tan larga que parta también la primera línea.

### Metadatos

Cada página lleva su bloque de `canonical` + Open Graph + Twitter Card, con **URLs absolutas a `https://tapcar.cl`**. `og:image` no admite rutas relativas, así que si cambia el dominio hay que actualizar los cinco bloques a mano.

La tarjeta al compartir es `assets/og-tapcar.png` (1200×630). Está generada con Pillow usando Segoe UI, no Geist —las fuentes de marca no están instaladas localmente—, así que la tipografía no es exacta. Sirve, pero es candidata a rehacerse con las fuentes reales.

### Schema.org (JSON-LD)

Cada página lleva un bloque `<script type="application/ld+json" data-schema>` con `Organization`, `WebSite`, `WebPage` y `BreadcrumbList`; la home y Planes suman `SoftwareApplication` con los dos precios, ¿Cómo funciona? suma `HowTo` (8 pasos) y `FAQPage` (9 preguntas), Planes suma `FAQPage` (6) y ¿Es legal? un `FAQPage` de 1.

**No se edita a mano.** Lo genera [`tools/schema.py`](tools/schema.py), que lee las preguntas y los pasos del propio HTML:

```bash
python tools/schema.py
```

Es idempotente: borra el bloque anterior y escribe uno nuevo. **Hay que volver a correrlo cada vez que cambien el FAQ, los pasos de ¿Cómo funciona?, los precios, los títulos o las descriptions**, o el marcado empieza a prometer cosas que la página ya no dice —que es exactamente lo que Google penaliza—.

### Analítica

El sitio está alojado en **Vercel**. Las 5 páginas llevan al final del `<body>` la variante **`html`** de la [documentación de Web Analytics](https://vercel.com/docs/analytics/quickstart): la cola `window.va` y el `<script defer>`.

**No se instala el paquete npm `@vercel/analytics`.** La guía de Vercel tiene un selector de framework; el `import { Analytics } from '@vercel/analytics/next'` que se ve por defecto corresponde al selector `nextjs`. En el selector `html` el paso de instalación aparece vacío: no hay npm. Acá no habría dónde importarlo — el sitio es HTML estático sin bundler — e instalarlo dejaría `package.json` y `node_modules` para un paquete que el navegador nunca cargaría.

La cola `window.va` no es opcional: el script va con `defer`, así que cualquier evento disparado antes de que cargue se perdería sin ella.

Dos condiciones para que mida:

1. **Web Analytics activado** en el proyecto de Vercel (sidebar → Analytics → Enable). Mientras no lo esté, el script responde 404 y falla en silencio.
2. Al activarlo, Vercel puede entregar una **ruta única** (`/<unique-path>/script.js`) además de `/_vercel/insights/script.js`. La ruta única resiste mejor a los bloqueadores de anuncios; si el dashboard te da una, cambiar el `src` es una línea en cada página.

### llms.txt

[`llms.txt`](llms.txt) resume el sitio para motores generativos (ChatGPT, Perplexity, Google AI Overviews): qué resuelve TapCar, **qué no es** —no es GPS, no emite documentos, no reemplaza los originales—, los precios, la base legal y cómo citar la marca. Es el archivo que evita que un modelo describa mal el producto. Hay que actualizarlo cuando cambien los precios o el alcance.

## Pendientes conocidos

- **`/terminos/` no declara domicilio.** La sociedad ya está identificada (IMPULSE AI SpA, RUT 78.479.762-7) pero falta la dirección; en un documento legal conviene tenerla.
- **El documento no pasó por revisión legal.** Está escrito en lenguaje simple y describe el servicio tal como funciona, pero conviene que un abogado lo revise.
- Las fechas de vencimiento de las fichas de ejemplo **son ilustrativas a propósito**, no tienen que cuadrar con la fecha real.
- **`/legal/` afirma cosas sobre normativa chilena y lleva fecha.** Dice "vigente a agosto de 2026" en el disclaimer. Los cuatro enlaces oficiales están verificados uno por uno (BCN 196640 = Ley 19.799, BCN 1007469 = texto refundido de la Ley de Tránsito, el dictamen E71389/2021 de Contraloría y CONASET). Si la normativa cambia, hay que revisar la página y mover esa fecha.

## Datos de producto que la copy asume

- El **chip NFC va incluido siempre**, sin importar la cantidad de vehículos; solo se paga el envío. **Pendiente:** reflejarlo en el flujo de compra de `app.tapcar.cl`.
- Las **alertas del panel son fijas**, no configurables por el usuario.
- **No usar "en vivo" ni "tiempo real"** al describir el panel: se lee como GPS, que TapCar no ofrece.
- Hay dos sistemas de precio, seleccionables con pills. **Uso particular** (1 a 10 vehículos) son **$2.500 por vehículo al mes** o **$22.000 al año**, IVA incluido. **Flotas** (desde el vehículo 11) cobran por vehículo **UF 0,057 al mes** o **UF 0,5 al año**, más cada cuenta de conductor a **UF 0,12 al mes** o **UF 1,05 al año**; esos valores van más IVA. Las tres tarifas dan **−27%** en anual. La calculadora saca todo el dinero de las cifras mensual y anual, nunca del equivalente mensual redondeado: 12 × $1.833 da $21.996, no $22.000. Sobre 100 vehículos la página deja de cotizar y manda a contacto.
- Los **datos de empresa (RUT, razón social, giro) son opcionales**: una cuenta personal puede saltárselos.
- La sociedad que opera el servicio es **IMPULSE AI SpA, RUT 78.479.762-7**. Se identifica en la sección 1 de `/terminos/` y en el `legalName` del schema; el pie lleva `© 2026 TapCar` y la pertenencia la comunica el lockup de Impulse AI, para no repetir la matriz dos veces en el mismo footer.
- TapCar es **una empresa de Impulse AI**. El footer lleva el lockup oficial, versión *color*, enlazado a `https://www.impulseai.cl/`. No se recolorea: es la marca de otra empresa.
  **Se usa el PNG oficial, no el SVG.** En el SVG exportado la palabra "Impulse AI" es un `<text>` sin `font-family` ni fuente incrustada, así que el navegador la dibuja con la fuente por defecto: ocupa 77 unidades en vez de ~280 y el lockup se ve chico y descuadrado dentro de una viewBox medio vacía. `assets/impulse-ai.webp` sale del PNG recortado y reescalado a 3x (349×72) para mostrarse a 24px de alto. Si algún día entregan un SVG con la tipografía trazada, conviene volver al vector.
- El correo de contacto es **contacto@tapcar.cl** (footer de las 5 páginas, los dos CTA secundarios de Planes y el CTA de Términos).
- El hero declara **+500 vehículos operando**. Es una cifra escrita a mano en `index.html`, no viene de la app: hay que actualizarla cuando cambie o queda desfasada sin que nada avise.
