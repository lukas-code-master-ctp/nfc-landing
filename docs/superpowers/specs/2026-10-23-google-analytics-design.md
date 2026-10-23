# Google Analytics 4 en la landing

Fecha: 2026-10-23
Estado: aprobado para plan de implementación (Lukas: "vamos con tus recomendaciones")

## Qué pidió el usuario

Tener la analítica de tapcar.cl en Google Analytics 4, además de la que hoy
entrega Vercel Web Analytics.

## Decisiones (las recomendaciones que Lukas aceptó)

1. **Alcance: solo la landing.** La app (app.tapcar.cl) queda para otro hilo.
   Con la landing se ve el clic en "Crear cuenta gratis", no la cuenta creada.
2. **Vercel Web Analytics se queda en paralelo.** No usa cookies y cuenta al
   100 % de las visitas, también a quien rechaza las cookies; sirve de control
   para comparar contra GA4.
3. **Propiedad:** se reusa la que Firebase creó para el proyecto `nfc-vehiculo`
   (543491249, cuenta "Lukas" de lukas@impulseai.cl), con el flujo web
   `G-VQ42VL3F5T`. Así la landing y, más adelante, la app comparten la misma
   propiedad y se puede armar el embudo completo. El ajuste de la propiedad
   (nombre TapCar, zona America/Santiago, moneda CLP, URL del flujo, medición
   mejorada) se hace en la consola de Google y no depende de este código.
4. **Consentimiento: modo de consentimiento de Google v2, modo avanzado.**
   - Por defecto todo denegado (`analytics_storage`, `ad_storage`,
     `ad_user_data`, `ad_personalization`). En ese estado gtag no escribe
     cookies y manda pings sin identificador, que GA usa para modelar.
   - "Aceptar" concede solo `analytics_storage`. Los tres de publicidad quedan
     **siempre denegados**: no hacemos publicidad y los Términos lo dicen.
   - "Rechazar" deja todo denegado.
   - La decisión se guarda en `localStorage` (`tapcar-consentimiento`, con
     `{ v: 1, analitica: true|false, fecha }`). Si `localStorage` falla (modo
     privado, bloqueado), el banner vuelve a aparecer en cada página y nada se
     rompe.
   - Motivo: la Ley 21.719 entra en vigencia el 1-12-2026, y hoy los Términos
     prometen que el sitio no instala cookies.
5. **Eventos** (nombres en snake_case, parámetros cortos):
   | Evento | Cuándo | Parámetros |
   | --- | --- | --- |
   | `clic_crear_cuenta` | clic en cualquier enlace a app.tapcar.cl que no sea "Ingresar" | `ubicacion` (data-ubicacion del enlace), `texto` (texto visible) |
   | `clic_ingresar` | clic en "Ingresar" (`.nav__login`) | `ubicacion` |
   | `enviar_formulario` | respuesta OK de `/api/contacto` | `formulario`: `flota` o `socios` |
   | `clic_correo` | clic en un `mailto:` | `ubicacion` |
   | `usar_calculadora` | primera vez por página que se mueve un slider de Planes | `calculadora`: `particular` o `flotas` |
   La página (`page_location`) la manda GA solo. `ubicacion` sale de un
   atributo `data-ubicacion` en cada CTA (`nav`, `hero`, `cta-final`,
   `tarjeta-gratis`, etc.); si falta, se usa `sin-ubicacion` para que se note
   en los informes.
   Los eventos también se mandan a Vercel (`window.va('event', …)`), que ya
   tiene la cola armada, para comparar los dos.
6. **Banner:** franja fija abajo, sobria, con el texto
   "Usamos cookies de Google Analytics para saber qué partes del sitio sirven.
   Puedes aceptarlas o rechazarlas." + enlace "Más información" a
   `/terminos/#cookies`, y dos botones del mismo tamaño y peso visual:
   "Rechazar" y "Aceptar". En celular ocupa el ancho, no tapa más de lo
   necesario y deja espacio abajo para que el último CTA no quede oculto
   (padding-bottom del body mientras está visible). Respeta
   `prefers-reduced-motion` (sin animación de entrada).
   El pie de las seis páginas suma un botón "Preferencias de cookies" que
   vuelve a abrir el banner.
7. **Términos** (`/terminos/`): se reescriben las secciones 6 (datos) y 7
   (cookies) y la fecha de actualización. Dicen: qué es GA4, que solo instala
   cookies si aceptas (`_ga` y `_ga_<ID>`, que duran hasta 2 años, el
   plazo por defecto de GA4), que sin aceptar se envían
   señales sin identificador, que los datos los procesa Google fuera de Chile,
   cómo cambiar la decisión, y que Vercel Web Analytics sigue sin cookies.
   Se mantiene "No vendemos tus datos ni los usamos para publicidad".

## Implementación

- Un solo archivo nuevo **`assets/analitica.js`** (JS plano, ES5 como el resto
  del sitio, sin dependencias), cargado con `<script src="/assets/analitica.js">`
  **sin defer, al final del body** en las seis páginas, junto al de Vercel. Se
  elige un archivo compartido y no incrustado porque es lógica, no estilo, y
  seis copias de lógica de consentimiento divergen.
  - Define `dataLayer`, `gtag`, el `consent default` denegado y
    `wait_for_update: 500` antes de cargar `gtag/js?id=G-VQ42VL3F5T` (async).
  - `gtag('config', ID, {})`, **sin linker** a app.tapcar.cl: con la
    analítica aceptada, el linker agrega `_gl` (el identificador de GA) a los
    enlaces a la app, y eso no está en los Términos. Se suma con el hilo de la
    app, junto con su frase en los Términos.
  - Expone `window.tapcarEvento(nombre, params)` para los formularios y
    sliders, que manda a gtag y a `va`.
  - Delegación de clics en `document` para enlaces a app.tapcar.cl y `mailto:`.
  - Banner: lo crea por DOM (no HTML en las páginas), con `role="region"` y
    `aria-label="Aviso de cookies"`; los botones son `<button>`.
- El **CSS del banner** va en `styles.css` y se re-incrusta en las seis páginas
  con el comando del README.
- La lógica de decisión (leer/escribir el consentimiento, qué estado de gtag
  corresponde) se escribe para poder probarse en Node:
  `tools/test_analitica.js`, sin dependencias, con un DOM falso mínimo.
- Nada de esto cambia `precios.json`, el JSON-LD ni las cifras.

## Qué queda fuera

- Integrar GA4 en la app (otro hilo).
- Google Tag Manager, píxeles de publicidad, remarketing.
- Ajustar la propiedad en la consola de Google (lo hace Lukas o una sesión con
  su aprobación en el PC).

## Riesgos

- **Promesa pública:** los Términos dicen hoy "no instala cookies". El cambio
  de texto sale en el mismo PR que el tag, nunca antes ni después.
- **La landing no tiene staging:** `main` publica a tapcar.cl. El PR queda
  abierto y sin mergear hasta el OK de Lukas.
- El tag no puede romper la página: si Google está bloqueado (adblock), los
  enlaces y formularios siguen funcionando; `tapcarEvento` nunca lanza.
