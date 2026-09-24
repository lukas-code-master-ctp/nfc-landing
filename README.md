# TapCar — Sitio web

Landing comercial de **TapCar**: la operación de tus vehículos a un toque. Cada vehículo guarda sus papeles (Permiso de Circulación, Revisión Técnica, SOAP, etc.), en el plan Flotas registra quién lo usa con un PIN, y abre su ficha pública desde un chip NFC —pegado al parabrisas o de llavero—.

Tiene dos planes —Uso particular y Flotas— con precio por vehículo, y perfiles aparte para automotoras, aseguradoras y gestorías.

Sitio estático en HTML/CSS/JS, implementado a partir de un diseño de [Claude Design](https://claude.ai/design).

## Páginas

| Página | Archivo | Contenido |
|---|---|---|
| Home / Landing | [`index.html`](index.html) | Hero con rotor de palabra, "¿Para quién es?", franja de empresas del rubro, "Cómo funciona", "Un toque, toda la operación", beneficios, showcase de la ficha, CTA |
| ¿Cómo funciona? | [`como-funciona/index.html`](como-funciona/index.html) | Paso a paso en dos fases (puesta en marcha 01–04, día a día 05–08) + FAQ de 9 preguntas |
| Planes | [`planes/index.html`](planes/index.html) | Pills de plan (Uso particular / Flotas), toggle mensual/anual con el ahorro, calculadora con slider por plan, "Todo incluido" por audiencia, FAQ, CTA |
| Empresas del rubro | [`socios/index.html`](socios/index.html) | Los tres perfiles (automotoras y aseguradoras con Convenio, gestorías con Envíos), cómo se empieza, FAQ de 5 preguntas y formulario de contacto. Enlazada desde la franja del home y el footer, no desde el nav |
| Términos de uso y privacidad | [`terminos/index.html`](terminos/index.html) | Términos del **sitio** y cómo trata los datos que se dejan en él. El servicio tiene sus propios términos, que la app pide aceptar al crear la cuenta según el tipo de cuenta. Enlazada solo desde el footer, no desde el nav |
| ¿Es legal? | [`legal/index.html`](legal/index.html) | Tabla documento por documento, las cuatro bases normativas, los tres requisitos de validez, qué pasa en un control, referencias oficiales y FAQ de 8 preguntas. **Es la página pensada para captar búsqueda**: "¿es legal mostrar los documentos del auto en digital?" es una consulta real y poco respondida |

## Estructura

```
.
├── index.html              # Home / Landing (autónoma, CSS incrustado)
├── como-funciona/index.html
├── planes/index.html
├── socios/index.html
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
├── api/contacto.js         # Función serverless: formularios de flota y de socios -> Resend
├── tools/schema.py         # Regenera el JSON-LD desde el contenido visible
└── _design_src/            # Archivos originales del diseño y fotos sin procesar
```

`_design_src/` está versionado pero **no es parte del sitio**: si lo publicas tal cual, esas rutas quedan accesibles. Por eso `robots.txt` las excluye.

## CSS: fuente única e incrustada

`styles.css` es **la fuente editable**. El mismo CSS va incrustado dentro del `<style>` de cada `.html` para que las páginas funcionen de forma autónoma (abrir con doble clic, sin servidor).

Tras editar `styles.css` hay que volver a incrustarlo en las seis páginas:

```bash
python -c "import io; css=io.open('styles.css',encoding='utf-8').read().rstrip(); [io.open(f,'w',encoding='utf-8',newline='').write(h[:h.index('<style>')+7]+'\n'+css+'\n'+h[h.index('  </style>'):]) for f in ['index.html','planes/index.html','legal/index.html','como-funciona/index.html','terminos/index.html','socios/index.html'] for h in [io.open(f,encoding='utf-8').read()]]"
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

- **Menú móvil** (las 6 páginas) — bajo 860px el nav pasa a un panel desplegable; marca el enlace activo comparando el `pathname`, y cierra con Escape, con clic fuera o al volver a escritorio. "Ingresar" se queda visible en la barra (no entra al panel) y "Crear cuenta" solo vive dentro del panel.
- **Rotor del hero** (home) — la palabra de "Tu _vehículo_ a un Tap." rota entre vehículo/flota/auto/moto/camioneta animando el ancho. El `h1` lleva un `aria-label` fijo con la frase completa y el rotor se desactiva con `prefers-reduced-motion`.
- **Reveal on scroll** (home y ¿Cómo funciona?) — `IntersectionObserver` con retraso escalonado.
- **Contador del hero** (home) — el número de vehículos cuenta desde 0 al entrar en pantalla. La cifra vive en el HTML (`data-valor` y el texto del span, las dos), así que sin JS se ve igual, solo que sin animar. `data-prefijo` es lo que va pegado delante (hoy `+`).
- **Calculadora** (planes) — dos sistemas de precio en pills (Uso particular y Flotas), toggle mensual/anual, slider de vehículos por plan, slider de cuentas de conductor en Flotas acotado al número de vehículos, ahorro anual, burbuja del slider y empujón al plan anual. Sobre 100 vehículos reemplaza el precio por un llamado a contacto.
- **Formulario de flota grande** (planes) — en el tramo de más de 100 vehículos, envía la consulta por `fetch` a `/api/contacto`. Botón deshabilitado mientras viaja, confirmación con foco al terminar y, si falla, un mensaje de error. El enlace `mailto:` queda visible siempre, así que ni sin JavaScript ni con la función caída alguien se queda sin forma de escribir.
- **Formulario de empresas del rubro** (socios) — el mismo patrón que el de flota grande, con un campo `tipo` (automotora, aseguradora, gestoría u otra) y sin cantidad de vehículos.

### Notas de responsive

- Las grillas usan `minmax(0, 1fr)`, no `1fr`: las fichas con texto que no envuelve (patentes, documentos) estiraban la columna y sacaban scroll lateral.
- `html` lleva `text-size-adjust: 100%` y `overflow-x: clip` (no `hidden`, que rompe el nav sticky) como red de seguridad contra el desborde horizontal en móviles reales.
- El titular del hero lleva un `<br class="lp-hero__nl">` que solo existe bajo 560px. Sin él, la palabra más larga del rotor ("camioneta") no cabe junto a "a un Tap." en pantallas angostas: el `h1` pasa de una línea a dos y todo el hero baja y sube en cada rotación. Con el salto forzado el titular mide siempre dos líneas. Si agregas palabras al rotor, ninguna debería ser tan larga que parta también la primera línea.

### Metadatos

Cada página lleva su bloque de `canonical` + Open Graph + Twitter Card, con **URLs absolutas a `https://tapcar.cl`**. `og:image` no admite rutas relativas, así que si cambia el dominio hay que actualizar los seis bloques a mano.

La tarjeta al compartir es `assets/og-tapcar.png` (1200×630). Está generada con Pillow usando Segoe UI, no Geist —las fuentes de marca no están instaladas localmente—, así que la tipografía no es exacta. Sirve, pero es candidata a rehacerse con las fuentes reales.

### Precios: fuente única

`precios.json` manda. Es la única fuente de las tarifas, y se sirve en **`https://tapcar.cl/precios.json`** porque el sitio es estático y cualquier archivo del repo queda publicado. Esa URL es el contrato que `app.tapcar.cl` puede verificar contra su configuración de cobro.

**Es un contrato para verificar, no una fuente de cobro en vivo.** Si la app lo leyera en runtime para facturar, un error de edición acá se cobraría de inmediato y sin revisión.

Tras editarlo:

```bash
python tools/precios.py --generar && python tools/schema.py
```

Para comprobar que el sitio calza con él:

```bash
python tools/precios.py
```

`tools/precios.py` hace dos cosas distintas a propósito:

- **`--generar`** escribe las constantes de la calculadora en `planes/index.html`, entre los marcadores `// <precios>` y `// </precios>`. Eso es dato estructurado y se genera sin riesgo. **Solo datos: la lógica que los usa —`descuento()`, `IVA`, `chip()`— vive fuera de los marcadores**, o el generador la borraría.
- **Sin argumentos, revisa.** Busca en el sitio toda cifra con forma de precio y avisa si aparece alguna que `precios.json` no explica, o si falta alguna que debería estar. Sale con código 1 si encuentra algo.

No genera la prosa a propósito: las frases del FAQ y de los términos llevan las cifras metidas en oraciones, y un generador que las escriba produce copy peor y un fuente ilegible. Revisar atrapa el mismo error —cambiaste un número y se te quedó uno viejo— sin pretender escribir español.

Lo que el revisor **no** ve: que el JavaScript siga funcionando. Solo compara cifras. Después de tocar el bloque generado, hay que abrir la página.

`tools/schema.py` también lee `precios.json`, así que el JSON-LD no es una segunda fuente.

### Schema.org (JSON-LD)

Cada página lleva un bloque `<script type="application/ld+json" data-schema>` con `Organization`, `WebSite`, `WebPage` y `BreadcrumbList`; la home y Planes suman `SoftwareApplication` con los dos precios, ¿Cómo funciona? suma `HowTo` (8 pasos) y `FAQPage` (9 preguntas), Planes suma `FAQPage` (9), ¿Es legal? un `FAQPage` de 8 y Empresas del rubro un `FAQPage` de 5.

**No se edita a mano.** Lo genera [`tools/schema.py`](tools/schema.py), que lee las preguntas y los pasos del propio HTML:

```bash
python tools/schema.py
```

Es idempotente: borra el bloque anterior y escribe uno nuevo. **Hay que volver a correrlo cada vez que cambien el FAQ, los pasos de ¿Cómo funciona?, los precios, los títulos o las descriptions**, o el marcado empieza a prometer cosas que la página ya no dice —que es exactamente lo que Google penaliza—.

### Analítica

El sitio está alojado en **Vercel**. Las 6 páginas llevan al final del `<body>` la variante **`html`** de la [documentación de Web Analytics](https://vercel.com/docs/analytics/quickstart): la cola `window.va` y el `<script defer>`.

**No se instala el paquete npm `@vercel/analytics`.** La guía de Vercel tiene un selector de framework; el `import { Analytics } from '@vercel/analytics/next'` que se ve por defecto corresponde al selector `nextjs`. En el selector `html` el paso de instalación aparece vacío: no hay npm. Acá no habría dónde importarlo — el sitio es HTML estático sin bundler — e instalarlo dejaría `package.json` y `node_modules` para un paquete que el navegador nunca cargaría.

La cola `window.va` no es opcional: el script va con `defer`, así que cualquier evento disparado antes de que cargue se perdería sin ella.

Dos condiciones para que mida:

1. **Web Analytics activado** en el proyecto de Vercel (sidebar → Analytics → Enable). Mientras no lo esté, el script responde 404 y falla en silencio.
2. Al activarlo, Vercel puede entregar una **ruta única** (`/<unique-path>/script.js`) además de `/_vercel/insights/script.js`. La ruta única resiste mejor a los bloqueadores de anuncios; si el dashboard te da una, cambiar el `src` es una línea en cada página.

### llms.txt

[`llms.txt`](llms.txt) resume el sitio para motores generativos (ChatGPT, Perplexity, Google AI Overviews): qué resuelve TapCar, **qué no es** —no es GPS, no emite documentos, no reemplaza los originales—, los precios, la base legal y cómo citar la marca. Es el archivo que evita que un modelo describa mal el producto. Hay que actualizarlo cuando cambien los precios o el alcance. Hoy además declara lo que el sitio no promete —la prueba gratis, el análisis de daños—, para que un modelo no lo invente.

## Backend: la función de contacto

`api/contacto.js` es **la única pieza de servidor del repo**. Recibe dos formularios: el del tramo "más de 100 vehículos" de `/planes/` y el de empresas del rubro de `/socios/`, que se distingue por el campo `tipo`. Los manda a contacto@tapcar.cl a través de [Resend](https://resend.com).

Vercel toma cualquier `.js` dentro de `/api` como función serverless, sin configuración. Está escrita en **CommonJS** y usa `fetch` nativo a propósito: un `.js` con `import` necesitaría un `package.json` con `"type": "module"`, y el SDK de Resend obligaría a instalar npm. Ninguna de las dos cosas entra acá.

Dos decisiones que conviene no deshacer:

- **El destinatario está escrito en el código**, nunca se lee del cuerpo de la petición. Es lo que impide que alguien use el endpoint para mandar correo a terceros: lo peor que puede pasar es que llenen la casilla de TapCar.
- **El correo va en texto plano** (campo `text` de Resend, nunca `html`). Con HTML habría que escapar cada valor antes de interpolarlo o se puede inyectar markup en el correo que llega.

El remitente es `no-replay@notifications.tapcar.cl`. El dominio verificado en Resend es **el subdominio `notifications.tapcar.cl`, no el apex `tapcar.cl`**: mandar desde `@tapcar.cl` lo rechaza, porque el apex solo tiene los registros de Google Workspace. Si algún día se verifica otro dominio, hay que cambiar la constante `REMITENTE` de la función.

Contra el spam hay un campo trampa (`sitio`), topes de largo en todos los campos y rechazo de todo lo que no sea POST. No hay captcha a propósito: agrega fricción a la consulta más valiosa del sitio y el destinatario fijo ya acota el daño. Si aparece abuso real, lo que corresponde es activar rate limiting en el WAF de Vercel desde el panel — disponible desde el plan Pro en adelante, no en Hobby — porque entre invocaciones serverless no hay estado compartido para implementarlo a mano.

### Pruebas

```bash
node tools/test_contacto.js
```

Sin dependencias y sin red: las pruebas reemplazan el `fetch` global por uno falso, así que **no hace falta ninguna API key para correrlas**. Cubren el método no permitido, el JSON malformado, cada regla de validación, la trampa, la key ausente, el error de Resend y el caso feliz.

Lo que las pruebas **no** pueden comprobar es que el correo llegue de verdad. Eso solo se ve desplegado.

### Variable de entorno

| Variable | Dónde | Para qué |
|---|---|---|
| `RESEND_API_KEY` | Vercel → el proyecto → Settings → Environment Variables | Autentica la llamada a Resend |

**Nunca va al repo.** Si falta, la función responde 500 con un mensaje claro y deja el detalle en los logs de Vercel; el formulario muestra el error y el enlace `mailto:` que siempre queda visible.

Cuando algo falla —la key expira, se cae la verificación DNS del dominio, se agota la cuota de Resend— cada consulta se pierde con un mensaje amable y el único rastro queda en los logs de Vercel. Hoy no hay alerta: conviene revisarlos de vez en cuando, o montar un log drain si el formulario empieza a traer volumen.

### Puesta en marcha

1. Crear cuenta en [resend.com](https://resend.com).
2. Agregar y verificar el dominio en Resend con los registros DNS que entrega. Hoy el verificado es **`notifications.tapcar.cl`**; el apex `tapcar.cl` no sirve como remitente.
3. Crear una API key con permiso de envío.
4. Cargarla en Vercel como `RESEND_API_KEY`, en los tres entornos.
5. **Volver a desplegar.** Las variables de entorno no se aplican a despliegues ya hechos.
6. Enviar una consulta de prueba desde `/planes/` y confirmar que llega a contacto@tapcar.cl.

## Pendientes conocidos

- **`/terminos/` no declara domicilio.** La sociedad ya está identificada (IMPULSE AI SpA, RUT 78.479.762-7) pero falta la dirección; en un documento legal conviene tenerla.
- **El documento no pasó por revisión legal.** Está escrito en lenguaje simple y describe el servicio tal como funciona, pero conviene que un abogado lo revise.
- Las fechas de vencimiento de las fichas de ejemplo **son ilustrativas a propósito**, no tienen que cuadrar con la fecha real.
- **`/legal/` afirma cosas sobre normativa chilena y lleva fecha.** Dice "vigente a agosto de 2026" en el disclaimer. Los cuatro enlaces oficiales están verificados uno por uno (BCN 196640 = Ley 19.799, BCN 1007469 = texto refundido de la Ley de Tránsito, el dictamen E71389/2021 de Contraloría y CONASET). Si la normativa cambia, hay que revisar la página y mover esa fecha.

## Datos de producto que la copy asume

- El **chip NFC va incluido siempre**, sin importar la cantidad de vehículos: el chip no se cobra, solo el despacho, y se cobra **en cada envío**, no una sola vez. Tramos con IVA incluido: **$2.000 hasta 2 chips, $5.000 de 3 a 50, $10.000 de 51 a 100**; sobre 100 se cotiza. La letra chica de la calculadora muestra la cifra que corresponde a la cantidad elegida, en vez de una tabla. `app.tapcar.cl` dejó de cobrar el chip el 2026-09-17, así que la landing y la caja por fin prometen lo mismo en este punto.
- Las **alertas del panel son fijas**, no configurables por el usuario.
- **No usar "en vivo" ni "tiempo real"** al describir el panel: se lee como GPS, que TapCar no ofrece.
- Hay dos sistemas de precio, seleccionables con pills. **Uso particular** (1 a 10 vehículos) son **$2.500 por vehículo al mes** o **$22.000 al año**, IVA incluido. **Flotas** (desde 5 vehículos) cobran por vehículo **UF 0,057 al mes** o **UF 0,5 al año**, más cada cuenta de conductor a **UF 0,12 al mes** o **UF 1,05 al año**; esos valores van más IVA. Las tres tarifas dan **−27%** en anual. La calculadora saca todo el dinero de las cifras mensual y anual, nunca del equivalente mensual redondeado: 12 × $1.833 da $21.996, no $22.000. Los rangos **se solapan a propósito entre 5 y 10**: ahí manda el tipo de cuenta que elige el cliente, no la cantidad. Bajo 5 solo hay Particular; desde 11, solo Flotas. En la banda común Flotas cuesta algo más y se toma por lo que habilita —cuentas de conductor y reportes—, no por precio, y cada tarjeta de la calculadora avisa de la otra. El plan Flotas **no tiene tope de vehículos**: el 100 es hasta dónde se contrata solo desde la web, y sobre eso la página manda a contacto.
- Los **datos de empresa (RUT, razón social, giro) son opcionales**: una cuenta personal puede saltárselos.
- La sociedad que opera el servicio es **IMPULSE AI SpA, RUT 78.479.762-7**. Se identifica en la sección 1 de `/terminos/` y en el `legalName` del schema; el pie lleva `© 2026 TapCar` y la pertenencia la comunica el lockup de Impulse AI, para no repetir la matriz dos veces en el mismo footer.
- TapCar es **una empresa de Impulse AI**. El footer lleva el lockup oficial, versión *color*, enlazado a `https://www.impulseai.cl/`. No se recolorea: es la marca de otra empresa.
  **Se usa el PNG oficial, no el SVG.** En el SVG exportado la palabra "Impulse AI" es un `<text>` sin `font-family` ni fuente incrustada, así que el navegador la dibuja con la fuente por defecto: ocupa 77 unidades en vez de ~280 y el lockup se ve chico y descuadrado dentro de una viewBox medio vacía. `assets/impulse-ai.webp` sale del PNG recortado y reescalado a 3x (349×72) para mostrarse a 24px de alto. Si algún día entregan un SVG con la tipografía trazada, conviene volver al vector.
- El correo de contacto es **contacto@tapcar.cl** (footer de las 6 páginas, los dos CTA secundarios de Planes, el CTA de Términos y la salida del formulario de Socios).
- El hero declara **+600 vehículos operando**, la última medición real al 2026-09-24. Es una cifra escrita a mano en `index.html`, no viene de la app: hay que actualizarla cuando cambie o queda desfasada sin que nada avise.
- **Uso particular no tiene conductores, PIN, Tomar/Entregar, bitácora, alertas, reportes ni equipo**: todo eso es de Flotas, y el sitio lo marca con la etiqueta `.plan-tag`. Lo que la auditoría de la app (2026-09-24) no asigna a Flotas —Carga inteligente, IA de vencimiento, fotos a PDF, categorías, copia sin conexión, autogestión del plan— se presenta como de los dos planes.
- **No prometer**: que la IA analiza daños (solo lee km, bencina y limpieza); la pauta de mantención por km en Particular (ahí el km no se actualiza); que los envíos de gestoría avisan el vencimiento (llegan sin fecha); las notificaciones de un convenio a sus clientes, salvo como servicio adicional a conversar; una prueba gratis (terminó el 2026-09-01); chips o facturación manual para socios.
- El **cobro es automático con tarjeta vía Flow**; al crear la cuenta se cobra el primer período. La factura electrónica del SII todavía no está.
- Los **perfiles del rubro** (automotoras, aseguradoras, gestorías) se piden al crear la cuenta con "Otra cosa" y los aprueba TapCar. Sus precios no se publican.
