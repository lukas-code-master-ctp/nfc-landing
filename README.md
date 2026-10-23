# TapCar — Sitio web

Landing comercial de **TapCar**: los documentos de tus vehículos a un toque. Cada vehículo guarda sus papeles (Permiso de Circulación, Revisión Técnica, SOAP, etc.), abre su ficha pública desde un chip NFC —pegado al parabrisas o de llavero— y, en el plan Flotas, registra quién lo usa con un PIN.

Uso particular es **gratis con 1 vehículo**, con TapCar+, el plan de pago por vehículo al año; Flotas se cobra por vehículo en UF. Hay perfiles aparte para automotoras, aseguradoras y gestorías.

Sitio estático en HTML/CSS/JS, implementado a partir de un diseño de [Claude Design](https://claude.ai/design).

## Páginas

| Página | Archivo | Contenido |
|---|---|---|
| Inicio | [`index.html`](index.html) | Hero con la insignia "Gratis con 1 auto", el titular con rotor de palabra, un solo CTA ("Crear cuenta gratis") más "Ver planes", y la escena Tap; franja de prueba social con el contador (+600 vehículos); "Así de simple" (3 pasos con mini escenas); "¿Para quién es?" (Uso particular, Flotas, empresas del rubro); 4 beneficios; CTA final |
| ¿Cómo funciona? | [`como-funciona/index.html`](como-funciona/index.html) | Paso a paso en dos fases (puesta en marcha 01–04, día a día 05–08), con los pasos de Flotas marcados; bloque compacto "Con conductores, el mismo Tap controla la operación" (6 ítems de Flotas); enlace a ¿Es legal?; FAQ de 9 preguntas; CTA |
| Planes | [`planes/index.html`](planes/index.html) | Pills de plan (Uso particular / Flotas). Uso particular: dos tarjetas (Gratis, $0 con 1 vehículo; TapCar+, $5.000 al año por vehículo), franja "Calcula tu TapCar+" con slider 1–10, el total anual y un botón secundario "Empezar con TapCar+", nota de chips. `/planes/#flotas` abre directo la pestaña Flotas (¿Cómo funciona? enlaza ahí). Flotas: toggle mensual/anual con el ahorro, sliders de vehículos y cuentas de conductor, formulario sobre 100 vehículos. Franja de empresas del rubro, FAQ de 7 preguntas, CTA |
| Empresas del rubro | [`socios/index.html`](socios/index.html) | Los tres perfiles en tarjetas cortas (automotoras y aseguradoras con Convenio, gestorías con Envíos), tres pasos para empezar (el tercero, las condiciones, se conversa), FAQ de 4 preguntas y formulario de contacto. Enlazada desde el nav ("Socios"), la tarjeta de empresas del rubro del inicio, la franja de Planes y el footer |
| Términos de uso y privacidad | [`terminos/index.html`](terminos/index.html) | Términos del **sitio** y cómo trata los datos que se dejan en él; las secciones 6 (datos) y 7 (cookies, ancla `#cookies`, a la que enlaza el banner) describen Google Analytics y el consentimiento. El servicio tiene sus propios términos, que la app pide aceptar al crear la cuenta según el tipo de cuenta. Enlazada solo desde el footer, no desde el nav |
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
├── assets/                 # Imágenes publicadas y el script de analítica
│   ├── analitica.js        # Google Analytics 4: consentimiento, banner de cookies y eventos
│   ├── chip-llavero.webp   # Foto del llavero NFC
│   ├── impulse-ai.webp     # Lockup de la matriz, para el footer (3x)
│   └── og-tapcar.png       # Tarjeta 1200×630 al compartir el link
├── favicon.svg
├── robots.txt              # Bloquea /_design_src/, apunta al sitemap
├── sitemap.xml
├── llms.txt                # Resumen del sitio para motores generativos
├── precios.json            # Fuente única de las tarifas (publicada, es contrato con la app)
├── api/contacto.js         # Función serverless: formularios de flota y de socios -> Resend
├── tools/precios.py        # Revisa las cifras del sitio contra precios.json; --generar escribe la calculadora
├── tools/schema.py         # Regenera el JSON-LD desde el contenido visible
├── tools/test_contacto.js  # Pruebas de la función de contacto, sin red
├── tools/test_analitica.js # Pruebas de assets/analitica.js, con un DOM falso
├── tools/test_html.js      # Pruebas del HTML de las seis páginas para la analítica
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

El sistema visual **se toma de la app, no se inventa**: los tokens viven en `:root` de `styles.css` y copian `app/globals.css` y `docs/ui.md` del repo `nfc`.

- Tipografías: **Geist** / **Geist Mono** (Google Fonts, `display=swap`). **Caveat ya no se carga**: solo la usaba la anotación manuscrita de Planes, que desapareció con el rediseño.
- Color: `tinta #16191f`, `acero #5b6573`, `linea #e3e6ea`, `lienzo #f6f7f9`, `superficie #fff`, `azul #2952e6` (marca) con `azul-press`, `azul-50` y `azul-100`, y `ambar`. Los estados (Vigente, Por vencer, Vencido) tienen sus variantes `-texto` y `-suave`: un color de estado nunca va solo —siempre con texto o ícono—, y como texto siempre la variante `-texto`, que pasa 4,5:1.
- Movimiento: `ease-salir` (lo que entra), `ease-entrar` (lo que se va) y duraciones 120/200/320ms. Toda animación vive bajo `@media (prefers-reduced-motion: no-preference)` y mueve solo `transform` y `opacity`. **El estado base es el final**: con movimiento reducido, sin JavaScript o sin soporte de animación se ve todo armado y quieto, nunca a medio armar. Como regla, no más de uno o dos elementos animándose a la vez en una vista.
- Componentes: botón (`.btn`, alto mínimo 44px), tarjeta (`.card`), chip de ícono (`.icon-chip`), pill de estado (`.badge`, siempre con texto e ícono), placa de patente (`.placa`). Íconos SVG de trazo, familia Lucide como la app. Sin emoji.

#### Escena Tap (hero del inicio)

HTML + SVG + CSS, autónoma, con todo bajo el prefijo `tap-` (bloque `<escena-tap>` de `styles.css`). Un llavero NFC —el mismo dibujo de `components/brand/Llavero.tsx` de la app— entra desde la izquierda y toca el celular; nacen las ondas NFC y en la pantalla se abre la ficha pública: encabezado, placa `GJ·KP·47`, "Toyota Hilux · 2022", el resumen "1 por vencer" y tres filas escalonadas (Permiso de Circulación *Vigente*, Revisión Técnica *Por vencer*, SOAP *Vigente*), cada pill con un pequeño rebote. Pausa de lectura, se desvanece y vuelve el reposo. Ciclo de **6 s en bucle**; la línea de tiempo está comentada al inicio del bloque.

- **Se pausa fuera de pantalla**: un `IntersectionObserver` en el script del inicio le pone `.tap-pausada` a la escena cuando sale del viewport, y esa clase congela todo con `animation-play-state: paused`. Sin `IntersectionObserver` simplemente sigue corriendo.
- **Con movimiento reducido** se ve el estado final, quieto: la ficha abierta con las tres filas y el llavero junto al celular.
- Es decorativa (`aria-hidden="true"`): lo que muestra ya lo dice el subtítulo del hero.

#### Aparición al hacer scroll y turnos de los pasos

- Un solo patrón para todo el sitio: el HTML marca con `data-reveal` lo que aparece, y sube 8px con fundido, 320ms, escalonado 40ms entre hermanos (ver "Comportamientos con JS").
- Las tres mini escenas de "Así de simple" (documentos que caen a la ficha, el chip que se graba, el toque que abre la ficha) se animan **una sola vez**, cuando el patrón de aparición le pone `.is-visible` al paso. **Cada paso espera su turno** (`--paso-t`), 700ms después del anterior, para que nunca haya más de dos moviéndose a la vez. El turno lo reparte el script del inicio en **orden de entrada** —en celular, en una columna, los pasos entran de a uno o de a varios según el alto de la pantalla y la velocidad del scroll—; los `nth-child` del CSS (150/850/1550ms) son el respaldo para cuando el script no corre, y calzan con el caso de escritorio.

### Comportamientos con JS

Cada página lleva su script incrustado al final del `<body>`:

- **Menú móvil** (las 6 páginas) — bajo 860px el nav pasa a un panel desplegable; marca el enlace activo comparando el `pathname`, y cierra con Escape, con clic fuera o al volver a escritorio. En escritorio la barra lleva los cinco enlaces, "Ingresar" y "Crear cuenta gratis"; bajo 860px "Ingresar" se queda visible en la barra (no entra al panel) y "Crear cuenta gratis" pasa a vivir solo dentro del panel.
- **Rotor del hero** (inicio) — la palabra de "Tu _vehículo_ a un Tap." rota entre vehículo/flota/auto/moto/camioneta animando el ancho. El `h1` lleva un `aria-label` fijo con la frase completa y el rotor se desactiva con `prefers-reduced-motion`.
- **Escena Tap** (inicio) — el script solo la pausa fuera de pantalla; la animación es CSS. Ver "Escena Tap" en Diseño.
- **Turnos de los pasos** (inicio) — un `MutationObserver` mira cuándo cada paso recibe `.is-visible` y le asigna `--paso-t` en orden de entrada. Ver "Aparición al hacer scroll y turnos de los pasos".
- **Aparición al hacer scroll** (las 6 páginas, el mismo script que el menú) — un solo patrón: el HTML marca con `data-reveal` lo que aparece y sube 8px con fundido, 320ms, escalonado 40ms entre hermanos. Va con `animation` (no `transition`, que chocaba con el hover de las tarjetas) y solo bajo `prefers-reduced-motion: no-preference`: sin JS o con movimiento reducido todo se ve en su estado final.
- **Contador de la prueba social** (inicio) — el número de vehículos de la franja bajo el hero cuenta desde 0 al entrar en pantalla. La cifra vive en el HTML (`data-valor` y el texto del span, las dos), así que sin JS se ve igual, solo que sin animar. `data-prefijo` es lo que va pegado delante (hoy `+`).
- **Calculadora de Uso particular** (planes) — va en una franja a lo ancho bajo las dos tarjetas (Gratis y TapCar+): un slider de 1 a 10 vehículos con su burbuja, el total anual (`n × precio anual`, sin selector mensual/anual porque el plan es solo anual) y la fórmula ("2 vehículos × $5.000"). Escribe además el despacho de Uso particular desde `ENVIO_PARTICULAR`. Desde 5 vehículos muestra un puente al plan Flotas ("también puedes tomar Flotas"), y en 10 avisa que es el tope.
- **Calculadora de Flotas** (planes) — igual que antes del rediseño, solo con el estilo nuevo: toggle mensual/anual con el descuento, slider de vehículos, slider de cuentas de conductor acotado al número de vehículos, desglose en UF, ahorro anual, burbuja del slider, empujón al plan anual y el despacho por tramos según la cantidad de chips. Entre 5 y 10 vehículos recuerda que Uso particular también sirve (cuesta menos, sin conductores ni reportes). Sobre 100 vehículos reemplaza el precio por un llamado a contacto.
- **Formulario de flota grande** (planes) — en el tramo de más de 100 vehículos, envía la consulta por `fetch` a `/api/contacto`. Botón deshabilitado mientras viaja, confirmación con foco al terminar y, si falla, un mensaje de error. El enlace `mailto:` queda visible siempre, así que ni sin JavaScript ni con la función caída alguien se queda sin forma de escribir.
- **Formulario de empresas del rubro** (socios) — el mismo patrón que el de flota grande, con un campo `tipo` (automotora, aseguradora, gestoría u otra) y sin cantidad de vehículos.

### Notas de responsive

- Las grillas usan `minmax(0, 1fr)`, no `1fr`: las fichas con texto que no envuelve (patentes, documentos) estiraban la columna y sacaban scroll lateral.
- `html` lleva `text-size-adjust: 100%` y `overflow-x: clip` (no `hidden`, que rompe el nav sticky) como red de seguridad contra el desborde horizontal en móviles reales.
- El titular del hero lleva un `<br class="lp-hero__nl">` que **está activo en todos los anchos**: el titular se lee siempre en dos líneas, "Tu vehículo / a un Tap.". Antes solo existía bajo 560px, y en escritorio el `h1` cabía en una línea con "auto" y pasaba a dos con "camioneta" (y entre 1024 y 1100px también con "vehículo"); como la grilla del hero centra en vertical, todo el hero bajaba y subía ~30px cada 2,6 s, con cada vuelta del rotor. Con el salto forzado el alto del titular no depende de la palabra. Si agregas palabras al rotor, ninguna debería ser tan larga que parta también la primera línea ("Tu camioneta" es la más larga hoy).

### Metadatos

Cada página lleva su bloque de `canonical` + Open Graph + Twitter Card, con **URLs absolutas a `https://tapcar.cl`**. `og:image` no admite rutas relativas, así que si cambia el dominio hay que actualizar los seis bloques a mano.

La tarjeta al compartir es `assets/og-tapcar.png` (1200×630). Está generada con Pillow usando Segoe UI, no Geist —las fuentes de marca no están instaladas localmente—, así que la tipografía no es exacta. Sirve, pero es candidata a rehacerse con las fuentes reales.

### Precios: fuente única

`precios.json` manda. Es la única fuente de las tarifas, y se sirve en **`https://tapcar.cl/precios.json`** porque el sitio es estático y cualquier archivo del repo queda publicado. Esa URL es el contrato que `app.tapcar.cl` verifica contra su configuración de cobro.

**Es un contrato para verificar, no una fuente de cobro en vivo.** Si la app lo leyera en runtime para facturar, un error de edición acá se cobraría de inmediato y sin revisión.

Su forma desde el 2026-10-20:

- `planes.particular`: `gratis: { vehiculos: 1 }` (lo que cubre el plan gratis) y `vehiculo: { anio: 5000 }`. **No hay `mes`**: TapCar+ es solo anual y cobra cada vehículo, incluido el primero. Sigue con `vehiculos: { min: 1, max: 10 }`, `moneda: "CLP"` e `iva_incluido: true`.
- `planes.flota`: sin cambios (`vehiculo` y `cuenta_conductor` con `mes` y `anio` en UF, más IVA, de 5 a 100 vehículos desde la web).
- `envio_chips.particular: { hasta: 10, precio: 3000 }`: el despacho propio de Uso particular, un monto fijo de 1 a 10 chips. Los `tramos` ($2.000 / $5.000 / $10.000) son para los demás tipos de cuenta.

**Tiene que ser idéntico byte a byte a `lib/contrato/precios.tapcar.json` del repo `nfc`.** El workflow `contrato-precios.yml` de ese repo baja todos los lunes el archivo publicado y lo compara con `diff` contra su copia; si no calzan, falla. Por eso un cambio de precios **se publica el mismo día que la app**: si la web sale antes, promete un precio que la app todavía no cobra (y el contrato falla); si sale después, al revés. La copia de la app se hace copiando este archivo tal cual, no reescribiéndolo.

Tras editarlo:

```bash
python tools/precios.py --generar && python tools/schema.py
```

Para comprobar que el sitio calza con él:

```bash
python tools/precios.py
```

`tools/precios.py` hace dos cosas distintas a propósito:

- **`--generar`** escribe las constantes de la calculadora en `planes/index.html`, entre los marcadores `// <precios>` y `// </precios>`: `PLANES` (con `particular: { gratis: 1, veh: { anio: 5000 }, min, max }` y `flota: { veh: { mes, anio }, cuenta: { mes, anio }, min, max }`), `ENVIO_PARTICULAR` (el despacho fijo de Uso particular, una constante y no una función) y `envio(chips)` con los tramos, que usa Flotas. Eso es dato estructurado y se genera sin riesgo. **Solo datos: la lógica que los usa —`descuento()`, `IVA`, `chip()`— vive fuera de los marcadores**, o el generador la borraría.
- **Sin argumentos, revisa.** Busca en el sitio (las seis páginas, `llms.txt` y este README) toda cifra con forma de precio y avisa si aparece alguna que `precios.json` no explica. Las cifras legítimas de Uso particular son el $0 del plan gratis, el precio anual y los totales de 1 a 10 vehículos ($5.000 a $50.000), más su despacho; ya no hay mensual, descuento ni ahorro en Uso particular. Sale con código 1 si encuentra algo.
- **Y exige cada cifra canónica en su archivo** (`canonicas_por_archivo`), no en el sitio entero: Planes tiene que decir el $0, el precio anual por vehículo, el despacho de Uso particular, los tramos de despacho, las dos tarifas anuales de Flotas en UF y el descuento del anual; ¿Cómo funciona? tiene que decir el despacho de Uso particular en el paso del chip. Con un conjunto global, borrar todos los $5.000 de Planes no avisaba, porque $5.000 es también el tramo de 3 a 50 chips y otro archivo lo seguía diciendo.
- **Y las tres que más importan, en su nodo** (`ANCLAS`): el monto de la tarjeta Gratis tiene que ser exactamente $0, el de la tarjeta TapCar+ el precio anual por vehículo y el `[data-envio-part]` el despacho de Uso particular. Que la cifra esté en el archivo no basta: con la tarjeta diciendo $10.000 (el total de 2 vehículos) o el despacho en $2.000 (un tramo válido) la revisión por archivo pasaba. Cada ancla tiene que encontrar su nodo una sola vez; si cambias la clase o el atributo, actualiza `ANCLAS` o la revisión falla.
- **El `<head>` se revisa pero no cuenta.** Una cifra desconocida en el `<title>` o en una meta se marca igual (es lo que sale en Google), pero una cifra conocida ahí no satisface a la canónica: si se borra la tarjeta de precio, que la meta description todavía diga $5.000 no la tapa.

No genera la prosa a propósito: las frases del FAQ y de los términos llevan las cifras metidas en oraciones, y un generador que las escriba produce copy peor y un fuente ilegible. Revisar atrapa el mismo error —cambiaste un número y se te quedó uno viejo— sin pretender escribir español.

Lo que el revisor **no** ve: que el JavaScript siga funcionando. Solo compara cifras. Después de tocar el bloque generado, hay que abrir la página.

`tools/schema.py` también lee `precios.json`, así que el JSON-LD no es una segunda fuente.

### Schema.org (JSON-LD)

Cada página lleva un bloque `<script type="application/ld+json" data-schema>` con `Organization`, `WebSite`, `WebPage` y `BreadcrumbList`; el inicio y Planes suman `SoftwareApplication` con un `AggregateOffer` de cuatro ofertas (Uso particular gratis, TapCar+ anual por vehículo, Flotas por vehículo y cuenta de conductor fijo), ¿Cómo funciona? suma `HowTo` (8 pasos) y `FAQPage` (9 preguntas), Planes suma `FAQPage` (7), ¿Es legal? un `FAQPage` de 8 y Empresas del rubro un `FAQPage` de 4.

**No se edita a mano.** Lo genera [`tools/schema.py`](tools/schema.py), que lee las preguntas y los pasos del propio HTML:

```bash
python tools/schema.py
```

Es idempotente: borra el bloque anterior y escribe uno nuevo. **Hay que volver a correrlo cada vez que cambien el FAQ, los pasos de ¿Cómo funciona?, los precios, los títulos o las descriptions**, o el marcado empieza a prometer cosas que la página ya no dice —que es exactamente lo que Google penaliza—.

### Analítica

Dos mediciones en paralelo, en las seis páginas:

- **Google Analytics 4**: ID `G-VQ42VL3F5T`, propiedad "TapCar" de la cuenta lukas@impulseai.cl. Lo carga [`assets/analitica.js`](assets/analitica.js), un solo archivo compartido (`<script src="/assets/analitica.js">`, sin `defer`, al final del `<body>`).
- **Vercel Web Analytics**: sin cookies, cuenta al 100 % de las visitas —también a quien rechaza— y sirve de control para comparar contra GA4.

**El ID se cambia en un solo lugar**: la constante `ID` al principio de `assets/analitica.js`.

#### Consentimiento

Modo de consentimiento de Google v2, **modo avanzado**:

- Por defecto **todo denegado** (`analytics_storage`, `ad_storage`, `ad_user_data`, `ad_personalization`). En ese estado gtag no escribe cookies y manda señales sin identificador, que GA usa para modelar.
- **Aceptar** concede **solo** `analytics_storage`. Los tres permisos de publicidad quedan **siempre** denegados, también al aceptar: no hacemos publicidad y los Términos lo prometen.
- **Rechazar** deja todo denegado y borra las cookies `_ga` y `_ga_<ID>` que hubieran quedado de una aceptación anterior.
- La decisión se guarda en `localStorage`, clave `tapcar-consentimiento` (`{ v: 1, analitica: true|false, fecha }`). Sin decisión válida —o si `localStorage` falla— el banner vuelve a aparecer y gtag sigue denegado: nunca se concede por un dato que no se pudo leer.
- El banner lo crea el script (no está en el HTML): una tarjeta chica en la esquina inferior izquierda (en celular, a lo ancho con margen), con "Rechazar" (blanco) y "Aceptar" (azul) del mismo tamaño y en la misma fila. El botón **"Preferencias de cookies"** del pie (`[data-preferencias-cookies]`) lo vuelve a abrir.

#### Eventos

Cada evento va a GA4 (`gtag`) y a Vercel (`window.va`). Los formularios y la calculadora los mandan con `window.tapcarEvento(nombre, params)`, que nunca lanza; los clics en enlaces (también con el botón del medio, vía `auxclick`) se miden por delegación en `document`, sin frenar la navegación.

Ojo con Vercel: los eventos personalizados solo existen en los planes **Pro y Enterprise**; en Hobby `va('event')` no registra nada. En Pro cada evento admite **2 propiedades** como máximo, por eso ningún evento manda más de dos.

| Evento | Cuándo | Parámetros |
|---|---|---|
| `clic_crear_cuenta` | Clic en un enlace a `https://app.tapcar.cl` que no es "Ingresar" | `ubicacion`, `texto` (texto visible del enlace, hasta 60 caracteres) |
| `clic_ingresar` | Clic en "Ingresar" (`.nav__login` o `data-evento="ingresar"`) | `ubicacion` |
| `clic_correo` | Clic en un `mailto:` | `ubicacion` |
| `enviar_formulario` | Respuesta OK de `/api/contacto` | `formulario`: `flota` o `socios` |
| `usar_calculadora` | Primera vez por página que se mueve un slider de Planes | `calculadora`: `particular` o `flotas` |

`ubicacion` sale del atributo `data-ubicacion` del enlace. Valores en uso: `nav`, `nav-movil`, `hero`, `cta-final`, `tarjeta-gratis`, `tarjeta-pago`, `calculadora-particular`, `calculadora-flotas`, `formulario-flota`, `formulario-socios`, `footer-contacto`, `footer-soporte`, `terminos-derechos`, `terminos-contacto`.

**Todo enlace nuevo a `app.tapcar.cl` o `mailto:` debe llevar `data-ubicacion`.** Si falta, el evento sale con `sin-ubicacion`: se nota en los informes, pero ya no se sabe de dónde vino el clic.

#### Pruebas

```bash
node tools/test_analitica.js
node tools/test_html.js
```

Sin dependencias: prueba las funciones puras (leer y guardar la decisión, el estado de consentimiento, el orden de los comandos de gtag, qué cookies borrar, qué evento corresponde a cada enlace) y `iniciar(win)` contra un DOM falso. `test_html.js`, también sin dependencias, revisa las seis páginas: `data-ubicacion` en todo enlace a la app o `mailto:`, que carguen `analitica.js` y tengan "Preferencias de cookies", que `enviar_formulario` vaya dentro de la rama de éxito de `/api/contacto` y que `usar_calculadora` conserve su marca de "una vez por página".

#### Tag y Términos van siempre juntos

Las secciones 6 y 7 de [`terminos/index.html`](terminos/index.html) describen exactamente lo que hace `assets/analitica.js`: qué cookies, cuándo, qué se mide, que la publicidad va siempre denegada. **Cualquier cambio en el tag (otra herramienta, otro permiso, otro evento con datos nuevos) se publica en el mismo cambio que el texto de los Términos, nunca antes ni después**, y si cambia lo que se pregunta se sube `VERSION` en el script para que todos vuelvan a decidir.

#### Vercel Web Analytics

Las 6 páginas llevan al final del `<body>` la variante **`html`** de la [documentación de Web Analytics](https://vercel.com/docs/analytics/quickstart): la cola `window.va` y el `<script defer>`.

**No se instala el paquete npm `@vercel/analytics`.** La guía de Vercel tiene un selector de framework; el `import { Analytics } from '@vercel/analytics/next'` que se ve por defecto corresponde al selector `nextjs`. En el selector `html` el paso de instalación aparece vacío: no hay npm. Acá no habría dónde importarlo — el sitio es HTML estático sin bundler — e instalarlo dejaría `package.json` y `node_modules` para un paquete que el navegador nunca cargaría.

La cola `window.va` no es opcional: el script va con `defer`, así que cualquier evento disparado antes de que cargue se perdería sin ella.

Dos condiciones para que mida:

1. **Web Analytics activado** en el proyecto de Vercel (sidebar → Analytics → Enable). Mientras no lo esté, el script responde 404 y falla en silencio.
2. Al activarlo, Vercel puede entregar una **ruta única** (`/<unique-path>/script.js`) además de `/_vercel/insights/script.js`. La ruta única resiste mejor a los bloqueadores de anuncios; si el dashboard te da una, cambiar el `src` es una línea en cada página.

### llms.txt

[`llms.txt`](llms.txt) resume el sitio para motores generativos (ChatGPT, Perplexity, Google AI Overviews): qué resuelve TapCar, **qué no es** —no es GPS, no emite documentos, no reemplaza los originales—, los precios, la base legal y cómo citar la marca. Es el archivo que evita que un modelo describa mal el producto. Hay que actualizarlo cuando cambien los precios o el alcance. Hoy además declara lo que el sitio no promete —un período de prueba del plan de pago (el plan gratis de Uso particular existe, pero es otra cosa: permanente y con 1 vehículo), el análisis de daños—, para que un modelo no lo invente.

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

Sin dependencias y sin red: las pruebas reemplazan el `fetch` global por uno falso, así que **no hace falta ninguna API key para correrlas**. Cubren el método no permitido, el JSON malformado, cada regla de validación, la trampa, la key ausente, el error de Resend, el caso feliz y el campo `tipo` del formulario de socios.

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
6. Enviar una consulta de prueba desde `/planes/` y otra desde `/socios/`, y confirmar que las dos llegan a contacto@tapcar.cl.

## Pendientes conocidos

- **La landing no tiene staging.** `main` publica directo en `tapcar.cl`; lo que se revisa antes de mergear es la vista previa de Vercel del PR. Un cambio que dependa de la app (como los precios) se mergea el mismo día que la app sale a producción, con el OK del dueño del proyecto.

- **`/terminos/` no declara domicilio.** La sociedad ya está identificada (IMPULSE AI SpA, RUT 78.479.762-7) pero falta la dirección; en un documento legal conviene tenerla.
- **El documento no pasó por revisión legal.** Está escrito en lenguaje simple y, desde el 2026-09-24, cubre solo el sitio (el servicio tiene sus propios términos en la app), pero conviene que un abogado lo revise.
- Las fechas de vencimiento de las fichas de ejemplo **son ilustrativas a propósito**, no tienen que cuadrar con la fecha real.
- **`/legal/` afirma cosas sobre normativa chilena y lleva fecha.** Dice "vigente a agosto de 2026" en el disclaimer. Los cuatro enlaces oficiales están verificados uno por uno (BCN 196640 = Ley 19.799, BCN 1007469 = texto refundido de la Ley de Tránsito, el dictamen E71389/2021 de Contraloría y CONASET). Si la normativa cambia, hay que revisar la página y mover esa fecha.

## Datos de producto que la copy asume

- El **chip NFC va incluido siempre**, sin importar la cantidad de vehículos: el chip no se cobra, solo el despacho, y se cobra **en cada envío**, no una sola vez. En Uso particular el despacho es **$3.000 por envío de 1 a 10 chips**. En los demás planes va por tramos con IVA incluido: **$2.000 hasta 2 chips, $5.000 de 3 a 50, $10.000 de 51 a 100**; sobre 100 se cotiza. La letra chica de la calculadora de Flotas muestra la cifra que corresponde a la cantidad elegida, en vez de una tabla. `app.tapcar.cl` dejó de cobrar el chip el 2026-09-17.
- Las **alertas del panel son fijas**, no configurables por el usuario.
- **No usar "en vivo" ni "tiempo real"** al describir el panel: se lee como GPS, que TapCar no ofrece.
- Hay dos sistemas de precio, seleccionables con pills. **Uso particular** (1 a 10 vehículos) es **gratis con 1 vehículo** ($0, sin plazo) y su plan de pago, **TapCar+**, cuesta **$5.000 al año por cada vehículo, incluido el primero**, IVA incluido, **solo anual** con renovación automática. **Flotas** (desde 5 vehículos) cobran por vehículo **UF 0,057 al mes** o **UF 0,5 al año**, más cada cuenta de conductor a **UF 0,12 al mes** o **UF 1,05 al año**; esos valores van más IVA. Las dos tarifas de Flotas dan **−27%** en anual, y la calculadora saca todo de las cifras mensual y anual, nunca de un equivalente mensual redondeado. Los rangos **se solapan a propósito entre 5 y 10**: ahí manda el tipo de cuenta que elige el cliente, no la cantidad. Bajo 5 solo hay Particular; desde 11, solo Flotas. En la banda común Flotas cuesta algo más y se toma por lo que habilita —conductores con PIN, Tomar/Entregar, bitácora, alertas, reportes, equipo y cuentas de conductor—, no por precio, y cada tarjeta de la calculadora avisa de la otra. El plan Flotas **no tiene tope de vehículos**: el 100 es hasta dónde se contrata solo desde la web, y sobre eso la página manda a contacto.
- Los **datos de empresa (RUT, razón social, giro) son opcionales**: una cuenta personal puede saltárselos.
- La sociedad que opera el servicio es **IMPULSE AI SpA, RUT 78.479.762-7**. Se identifica en la sección 1 de `/terminos/` y en el `legalName` del schema; el pie lleva `© 2026 TapCar` y la pertenencia la comunica el lockup de Impulse AI, para no repetir la matriz dos veces en el mismo footer.
- TapCar es **una empresa de Impulse AI**. El footer lleva el lockup oficial, versión *color*, enlazado a `https://www.impulseai.cl/`. No se recolorea: es la marca de otra empresa.
  **Se usa el PNG oficial, no el SVG.** En el SVG exportado la palabra "Impulse AI" es un `<text>` sin `font-family` ni fuente incrustada, así que el navegador la dibuja con la fuente por defecto: ocupa 77 unidades en vez de ~280 y el lockup se ve chico y descuadrado dentro de una viewBox medio vacía. `assets/impulse-ai.webp` sale del PNG recortado y reescalado a 3x (349×72) para mostrarse a 24px de alto. Si algún día entregan un SVG con la tipografía trazada, conviene volver al vector.
- El correo de contacto es **contacto@tapcar.cl** (footer de las 6 páginas, los dos CTA secundarios de Planes, el CTA de Términos y la salida del formulario de Socios).
- El hero declara **+600 vehículos operando**, la última medición real al 2026-09-24. Es una cifra escrita a mano en `index.html`, no viene de la app: hay que actualizarla cuando cambie o queda desfasada sin que nada avise.
- **El plan gratis de Uso particular** trae los documentos de fiscalización (Permiso de Circulación, Revisión Técnica, SOAP, Padrón y Homologación), los avisos por correo, la ficha pública con un toque y la lectura con IA de la fecha de cada documento. **TapCar+** suma mantenciones, datos del vehículo, otros documentos, Carga inteligente, ficha sin conexión y cargas de combustible, y permite de 1 a 10 vehículos. En la app lo bloqueado se ve con candado, no se oculta.
- **Uso particular no tiene conductores, PIN, Tomar/Entregar, bitácora, alertas, reportes ni equipo**: todo eso es de Flotas, y el sitio lo marca con la etiqueta `.plan-tag`. Flotas incluye todo lo de TapCar+.
- **No prometer**: que la IA analiza daños (solo lee km, bencina y limpieza); la pauta de mantención por km en Particular (ahí el km no se actualiza); que los envíos de gestoría avisan el vencimiento (llegan sin fecha); las notificaciones de un convenio a sus clientes, salvo como servicio adicional a conversar; un **período de prueba** de TapCar+ o de Flotas (el que había terminó el 2026-09-01; lo que existe ahora es un **plan gratis** permanente con 1 vehículo, que no es una prueba y no hay que confundirlos); chips o facturación manual para socios.
- El **cobro es automático con tarjeta vía Flow**. El plan gratis no pide pago; TapCar+ se cobra al año y se renueva solo; Flotas, al mes o al año. Sumar vehículos se paga con la diferencia prorrateada. La factura electrónica del SII todavía no está.
- Los **perfiles del rubro** (automotoras, aseguradoras, gestorías) se piden al crear la cuenta con "Otra cosa" y los aprueba TapCar. Sus precios no se publican.
