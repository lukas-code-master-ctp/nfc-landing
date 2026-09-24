# La landing calza con lo que hace la app

Fecha: 2026-09-24
Estado: aprobado para plan de implementación

## Por qué

El 2026-09-24 se auditó el sitio completo contra el código de `app.tapcar.cl`.
Salieron tres tipos de problema:

1. **El sitio dice cosas falsas**: una cifra de vehículos vieja, una forma de pago
   que no existe, un "importar vehículos desde Excel" que no existe, un plan
   Particular que promete PIN y panel, un documento que la app ya no ofrece.
2. **La app hace cosas que el sitio no vende**: la Carga inteligente con IA, las
   mantenciones, la copia sin conexión de la ficha, transferir un vehículo,
   reportes descargables, el control de la entrega, la autogestión del plan.
3. **Hay tres perfiles nuevos que no aparecen en ninguna página**: automotoras y
   aseguradoras (Convenio) y gestorías (Envíos).

**La auditoría es la fuente de verdad sobre la app.** Nada de lo que se publica
en este cambio puede salir de otro lado. Donde la auditoría no dice algo, el sitio
tampoco lo dice.

## Decisiones tomadas con el usuario

- **Hero**: la cifra pasa de +500 a **+600 vehículos**, que es la última medición
  real (2026-09-24). Se mantiene el contador animado.
- **/terminos/**: la app pide aceptar sus propios términos al crear la cuenta,
  según el tipo de cuenta. Por eso los términos de la landing pasan a cubrir
  **solo el sitio** —qué datos se tratan acá, cookies, uso del sitio— y describen
  el producto muy brevemente. Todo lo que era del servicio (cuenta, pagos,
  cancelación, conductores, ficha) sale de este documento.

## Decisiones de diseño (tomadas acá, se muestran antes de publicar)

### Particular y Flotas se distinguen en todo el sitio

La corrección 1d no es un subtítulo: el sitio entero hablaba como si todo fuera
para todos. La regla es:

| En los dos planes | Solo en Flotas |
|---|---|
| Documentos, ficha NFC, recordatorios, mantenciones (pauta por meses), datos del vehículo, transferir un vehículo, el chip, Carga inteligente, IA que sugiere el vencimiento, documentos desde fotos, aviso de documentos faltantes, categorías/buscador/filtros, copia sin conexión, autogestión del plan | Conductores con PIN, Tomar/Entregar con fotos, bitácora, alertas, reportes descargables, control de la entrega, pauta de mantención por km, equipo de hasta 5, cuentas de conductor |

Lo que la auditoría no asigna a Flotas (Carga inteligente, IA de vencimiento,
fotos a PDF, categorías, copia sin conexión, autogestión) se presenta como de los
dos planes: la lista de Flotas de la auditoría es explícita y cerrada.

Para marcarlo se agrega un componente nuevo, **`.plan-tag`**: una píldora chica
("Uso particular" / "Flotas" / "Solo en Flotas") que va junto al ícono de la
tarjeta o entre los chips de un paso.

### Home

- **¿Para quién es?** Las dos tarjetas llevan su plan en una `.plan-tag`, y
  debajo se agrega una **franja "Para empresas del rubro"** que enlaza a
  `/socios/`. Es una franja y no una tercera tarjeta porque es otro tipo de
  cliente: no usa TapCar para sus autos, se lo regala o le manda documentos a
  los suyos.
- **Cómo funciona (3 pasos)**: el paso 01 pasa a ser la Carga inteligente.
- **"Un toque, toda la operación"** pasa a presentarse como lo que es: Flotas.
  Suma dos tarjetas (control de la entrega y conductor fijo con cuenta) y queda en 6.
- **"Por qué TapCar"** queda con lo que es de los dos planes (12 tarjetas) y la
  única de Flotas, Equipo, va marcada. Salen de acá las tres de Flotas que se
  repetían con la sección anterior (control de uso, alertas de daño, reportes) y
  "Datos de la empresa", que no aporta frente a lo que entra.
- **La ficha NFC**: la lista de documentos correcta, mantenciones y aviso de
  daño, y la copia sin conexión. Tomar/Entregar se marca como de Flotas.

### Página nueva: `/socios/`

Se elige `/socios/` y no `/convenios/` porque las gestorías no tienen convenio:
tienen Envíos. El `h1` es "TapCar para automotoras, aseguradoras y gestorías".

Estructura: hero con CTA a `#contacto` · tres tarjetas (una por perfil) ·
"Cómo se empieza" en tres pasos · FAQ · formulario de contacto.

**No va en el nav.** El nav habla con quien compra TapCar para sus vehículos y
ya tiene cuatro enlaces; quien viene por un convenio llega desde la franja del
home o desde el footer, que suma el enlace "Para empresas del rubro" en las seis
páginas.

### El formulario de `/socios/` reutiliza `api/contacto.js`

Se agrega un campo **`tipo`** (`automotora`, `aseguradora`, `gestoria`, `otra`):

- Sin `tipo`, la función se comporta exactamente como hoy (formulario de flota
  de `/planes/`, con `vehiculos` obligatorio). Las 31 pruebas actuales no cambian.
- Con `tipo` válido, `vehiculos` no se pide ni se manda, y el correo dice de qué
  tipo de empresa es y de qué página viene.
- Con `tipo` desconocido, 400.
- El destinatario sigue escrito en el código: `tipo` no cambia a quién llega.

El formulario vive sobre un fondo `azul-soft`, igual que el de `/planes/`, así
que usa los mismos bordes y anillo de foco medidos contra ese fondo (3,4:1 y
3,6:1). El `<select>` necesita estilo propio.

### /terminos/ se reescribe como términos del sitio

Título nuevo: **"Términos de uso y privacidad"**. Secciones:

1. Quiénes somos (sin cambios de fondo).
2. Qué es TapCar (breve: dos planes, perfiles del rubro, qué no es).
3. Este sitio y el servicio son cosas distintas: el servicio tiene sus propios
   términos, que se aceptan en `app.tapcar.cl` según el tipo de cuenta.
4. Precios publicados.
5. Uso del sitio.
6. Qué datos tratamos en este sitio: formularios, medición de visitas, registros
   técnicos del hosting, tipografías.
7. Cookies: el sitio no instala cookies.
8. Tus derechos.
9. Límites.
10. Cambios a este documento.
11. Contacto y ley aplicable.

Todo lo que dice de los datos se verificó contra el repo: el sitio no usa
`localStorage`, `sessionStorage` ni `document.cookie`; mide con Vercel Web
Analytics (sin cookies); carga Geist desde Google Fonts; los formularios viajan
por `api/contacto.js` a Resend y llegan a contacto@tapcar.cl.

## Qué NO se promete (de la auditoría, sección 4)

- La IA **no analiza daños**: solo lee km, bencina y limpieza. El daño lo reporta
  el conductor. Donde el sitio hable de fotos de entrega, lo dice así.
- **Pauta por km no se vende para Particular**: se dice "por meses" en lo común y
  "también por kilómetros" solo en Flotas.
- Los envíos de gestoría **no se venden con aviso de vencimiento**. La sección de
  gestorías no menciona vencimientos.
- Las notificaciones de un convenio a sus clientes aparecen solo como **servicio
  adicional a conversar**.
- **No hay prueba gratis.** Ninguna página la menciona; `llms.txt` lo dice
  explícitamente para que un modelo no la invente.
- **No hay inventario de chips para socios** ni facturación manual de convenios:
  `/socios/` no habla de chips ni de facturas.
- Los precios de los convenios **no se publican**.

## Qué no cambia

- `precios.json`: calza con la app. Ninguna cifra de precio cambia.
- La calculadora: solo cambian los textos de los puentes entre planes.
- El nav.
- `/legal/` conserva la fila "Certificado de Gases" como información legal, con
  un texto que ya no sugiere que TapCar la guarde aparte.

## Riesgos y cómo se cubren

- **El JSON-LD promete lo que la página ya no dice.** `tools/schema.py` se corre
  al final y además se actualizan sus dos textos escritos a mano (la
  `description` y el `featureList` del producto), que hoy nombran el
  Certificado de Gases y el PIN como si fueran de todos.
- **Una cifra de precio nueva escrita de pasada.** `tools/precios.py` revisa
  también `/socios/` (se agrega a su lista).
- **El formulario nuevo rompe el viejo.** Las 31 pruebas de la función siguen
  corriendo sin cambios y se agregan las del `tipo`.
- **CRLF.** Los HTML están en CRLF; ninguna edición puede convertirlos.

## Dudas que quedan para el usuario antes de publicar

1. **/terminos/ es un documento legal.** La versión nueva deja de prometer el
   aviso de 15 días (ese compromiso es con quien tiene cuenta y vive ahora en los
   términos de la app) y dice que, ante una diferencia, mandan los términos que
   se aceptaron al contratar. Conviene que lo lea un abogado.
2. **"Con un botón para renovar"** en los recordatorios es texto previo que la
   auditoría no confirma ni desmiente. Se deja.
3. **La ficha pública muestra el aviso de daño activo** a quien la abra, incluido
   quien fiscaliza. Es un hecho de la auditoría y se publica porque el usuario lo
   pidió, pero es una cara del producto que algunos dueños podrían no querer ver
   destacada.

## Verificación

1. `node tools/test_contacto.js`: todas en verde, las viejas y las nuevas.
2. `python tools/schema.py`: corre sin error, es idempotente y `/socios/` sale
   con `WebPage`, `BreadcrumbList` y `FAQPage`.
3. `python tools/precios.py`: `OK: el sitio calza con precios.json`.
4. Barrido de texto: ninguna página dice "Certificado de Gases" fuera de la tabla
   de `/legal/`, ni "desde Excel" aplicado a vehículos, ni "+500", ni
   "coordinamos el cobro", ni "Nunca más una multa".
5. En el navegador, las seis páginas sin errores de consola y sin scroll lateral
   a 375 px; el formulario de `/socios/` valida y muestra su error.
6. Capturas de las secciones nuevas para mostrarle al usuario antes de publicar.
