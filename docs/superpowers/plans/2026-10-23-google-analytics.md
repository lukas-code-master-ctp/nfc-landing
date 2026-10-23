# Plan: Google Analytics 4 en la landing

Spec: `docs/superpowers/specs/2026-10-23-google-analytics-design.md`
Rama: `claude/project-thread-50k4mz`. Un commit por tarea. PR a `main` sin mergear.

## Tarea 1 — Tag GA4, consentimiento y banner

1. Crear `assets/analitica.js` (ES5, IIFE, sin dependencias):
   - `ID = 'G-VQ42VL3F5T'`, `CLAVE = 'tapcar-consentimiento'`.
   - `dataLayer`, `gtag`, `consent default` (los cuatro denegados,
     `wait_for_update: 500`); si hay consentimiento guardado con
     `analitica: true`, `consent update` con `analytics_storage: 'granted'`
     inmediatamente después del default y antes del `config`.
   - `gtag('js', new Date())`, `gtag('config', ID, { linker: { domains: ['app.tapcar.cl'] } })`.
   - Inserta `<script async src="https://www.googletagmanager.com/gtag/js?id=G-VQ42VL3F5T">`.
   - Banner creado por DOM si no hay decisión guardada; botones "Rechazar" y
     "Aceptar"; enlace "Más información" a `/terminos/#cookies`. Al decidir:
     guarda, actualiza consent, oculta el banner y devuelve el foco al body.
   - Cualquier `[data-preferencias-cookies]` reabre el banner.
   - Toda lectura/escritura de `localStorage` en try/catch.
   - Exportar para tests: si `typeof module !== 'undefined'`, exportar las
     funciones puras (`leerConsentimiento(storage)`,
     `guardarConsentimiento(storage, analitica, ahora)`,
     `estadoConsentimiento(analitica)`).
2. CSS del banner (`.cookies`, `.cookies__texto`, `.cookies__acciones`,
   `.cookies__btn`) en `styles.css`, con los tokens existentes; botones del
   mismo tamaño; en ≤ 640 px los botones van en fila a lo ancho. Re-incrustar
   en las seis páginas con el comando del README. Clase en `body`
   (`con-cookies`) que agrega `padding-bottom` mientras el banner está visible.
3. En las seis páginas, tras el script de Vercel:
   `<script src="/assets/analitica.js"></script>`.
4. En el pie de las seis páginas, columna "Empresa", después de "Términos y
   privacidad": `<button type="button" class="footer__link footer__link--btn" data-preferencias-cookies>Preferencias de cookies</button>`
   (con el reset de botón en CSS para que se vea igual que los enlaces).
5. `tools/test_analitica.js` (Node, sin dependencias, mismo estilo que
   `test_contacto.js`): consentimiento ausente / aceptado / rechazado /
   corrupto / versión distinta / storage que lanza; `estadoConsentimiento`
   nunca concede los tres de publicidad.

## Tarea 2 — Eventos

1. En `assets/analitica.js`: `window.tapcarEvento(nombre, params)` que manda a
   `gtag('event', …)` y a `window.va('event', { name, data })` si existe;
   nunca lanza. Delegación de clics:
   - `a[href^="https://app.tapcar.cl"]` → `clic_ingresar` si tiene
     `.nav__login` (o `data-evento="ingresar"`), si no `clic_crear_cuenta`;
     params `ubicacion` (`data-ubicacion` del enlace o `sin-ubicacion`) y
     `texto` (texto visible recortado a 60).
   - `a[href^="mailto:"]` → `clic_correo` con `ubicacion`.
2. `data-ubicacion` en cada enlace a app.tapcar.cl y en cada mailto de las seis
   páginas (`nav`, `nav-movil`, `hero`, `cta-final`, `tarjeta-gratis`,
   `tarjeta-pago`, `calculadora`, `flotas`, `footer`, …), según el lugar.
3. En `planes/index.html` y `socios/index.html`, en la rama de éxito de
   `/api/contacto`: `window.tapcarEvento && window.tapcarEvento('enviar_formulario', { formulario: 'flota' | 'socios' })`.
4. En `planes/index.html`, primer `input` de cada slider →
   `usar_calculadora` con `calculadora: 'particular' | 'flotas'`, una vez por
   carga de página.
5. Ampliar `tools/test_analitica.js` con la clasificación de enlaces
   (función pura `eventoDeEnlace(href, clases, ubicacion, texto)`).

## Tarea 3 — Términos y documentación

1. `terminos/index.html`: secciones 6 y 7 según el spec; fecha de "Última
   actualización" y "Vigente desde" al 23 de octubre de 2026. No tocar otras
   secciones.
2. `README.md`: fila de `assets/analitica.js` en Estructura, sección corta
   "Analítica" (GA4 + Vercel, consentimiento, eventos, dónde cambiar el ID),
   y el comando `node tools/test_analitica.js`.
3. Revisar `llms.txt` por menciones de cookies o analítica.

## Verificación y QA

- `node tools/test_contacto.js`, `node tools/test_analitica.js`,
  `python3 tools/precios.py` (sin `--generar`).
- QA con `http-server` local + Playwright (Chromium de `/opt/pw-browsers`),
  escritorio y móvil: banner visible al entrar; Rechazar → no hay cookies
  `_ga`; Aceptar → `dataLayer` con `consent update` granted; recargar no
  vuelve a mostrar el banner; "Preferencias de cookies" lo reabre; clic en
  "Crear cuenta gratis" deja el evento en `dataLayer`; el banner no tapa el
  CTA final en móvil. La red a googletagmanager.com puede estar bloqueada en
  la nube: se verifica por `dataLayer`, no por la petición.
