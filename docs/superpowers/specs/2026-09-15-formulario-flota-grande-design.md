# Formulario de contacto para flotas de más de 100 vehículos

Fecha: 2026-09-15
Estado: aprobado para plan de implementación

## Problema

En `/planes/`, la pestaña Flotas deja de cotizar sobre 100 vehículos y muestra
un bloque con un enlace `mailto:contacto@tapcar.cl`. Ese enlace no hace nada
para quien usa webmail o un móvil sin cliente de correo configurado, que es
justo el visitante que se pierde en silencio.

Es además la consulta más valiosa del sitio: una flota de más de 100 vehículos.

Se reemplaza el enlace por un formulario que envía la consulta a
contacto@tapcar.cl. El enlace se queda abajo como salida de emergencia.

## Alcance

Solo el tramo "Más de 100" de `/planes/`. Los otros 21 enlaces `mailto:` del
sitio se quedan como están. El sitio no tiene ningún formulario hoy: este es el
primero, y con él entra el primer backend del repo.

## Arquitectura

```
navegador                      Vercel                     Resend
─────────                      ──────                     ──────
<form> en /planes/
   │ submit (JS)
   │ POST /api/contacto
   │ Content-Type: application/json
   ▼
                        api/contacto.js
                        · rechaza si no es POST
                        · valida los campos
                        · descarta si el honeypot viene lleno
                        · lee RESEND_API_KEY del entorno
                                │ POST https://api.resend.com/emails
                                ▼
                                                    correo a
                                                    contacto@tapcar.cl
   ◀── { ok: true } ────────────┘
```

### Por qué una función propia y no un servicio de formularios

Un servicio externo (Formspree, Web3Forms) se instala en diez minutos y no
necesita backend, pero pone un tope mensual ajeno entre el visitante y la
consulta más cara del sitio. Si el plan gratis se agota o el servicio cambia de
términos, las consultas se pierden sin aviso.

La función propia mantiene todo el camino bajo control y el volumen esperado
—unas pocas consultas al mes— cabe de sobra en el plan gratis de Resend (3.000
correos al mes).

### Sin npm

Vercel toma cualquier `.js` dentro de `/api` como función serverless, sin
configuración y sin `package.json`. La función se escribe en **CommonJS**
(`module.exports = async function (req, res)`), porque un `.js` con `import`
necesitaría un `package.json` con `"type": "module"`, y el README del repo
defiende explícitamente no meter npm.

La llamada a Resend usa `fetch` nativo, disponible en el runtime de Node de
Vercel. No se instala el SDK de Resend.

## La función: `api/contacto.js`

### Contrato

`POST /api/contacto`, `Content-Type: application/json`:

```json
{
  "nombre":    "Juan Pérez",
  "empresa":   "Transportes ACME SpA",
  "email":     "juan@acme.cl",
  "telefono":  "+56 9 1234 5678",
  "vehiculos": 150,
  "mensaje":   "Necesitamos control de documentos para dos sucursales.",
  "sitio":     ""
}
```

Respuestas:

| Código | Cuerpo | Cuándo |
|---|---|---|
| 200 | `{"ok": true}` | Enviado, **o** descartado por el honeypot |
| 400 | `{"ok": false, "error": "<texto para mostrar>"}` | Falla de validación o JSON malformado |
| 405 | `{"ok": false, "error": "..."}` | Método distinto de POST |
| 500 | `{"ok": false, "error": "..."}` | Falta `RESEND_API_KEY`, o Resend respondió con error |

El `error` de las respuestas 400 es texto en español listo para mostrarle al
visitante. El de las 500 es genérico: el detalle va a los logs de Vercel, no al
navegador.

### Validación

Es la autoritativa: los atributos `required` del HTML son comodidad, no
seguridad. Todos los valores se recortan con `trim()` antes de validar.

| Campo | Regla |
|---|---|
| `nombre` | Requerido. 1 a 120 caracteres. |
| `empresa` | Requerido. 1 a 120 caracteres. |
| `email` | Requerido. Máximo 160. Debe calzar `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`. |
| `telefono` | Opcional. Máximo 40. |
| `vehiculos` | Requerido. Entero entre 1 y 100.000. |
| `mensaje` | Opcional. Máximo 2.000. |
| `sitio` | Honeypot. Si trae cualquier cosa, se responde 200 y no se envía nada. |

La regex de correo rechaza espacios en blanco, y `\s` incluye saltos de línea.
Eso importa porque ese valor va al encabezado `reply_to`: un salto de línea ahí
sería inyección de encabezados.

### El correo

```
from:      TapCar web <web@tapcar.cl>
to:        contacto@tapcar.cl
reply_to:  <el correo que dejó el visitante>
subject:   Consulta de flota — <empresa> (<vehiculos> vehículos)
```

El cuerpo va en **texto plano**, no HTML. No es estética: con HTML habría que
escapar cada valor antes de interpolarlo o alguien puede inyectar markup en el
correo. En texto plano ese problema no existe.

```
Nueva consulta de flota desde tapcar.cl/planes/

Empresa:    Transportes ACME SpA
Nombre:     Juan Pérez
Correo:     juan@acme.cl
Teléfono:   +56 9 1234 5678
Vehículos:  150

Mensaje:
Necesitamos control de documentos para dos sucursales.
```

Los campos opcionales que vengan vacíos se omiten de la línea, no se imprimen
como "Teléfono: —".

Con `reply_to` puesto, responder desde Gmail le llega al visitante directamente.

### Seguridad

- **El destinatario está escrito en el código**, nunca viene del formulario. Es
  la protección que importa: nadie puede usar el endpoint para mandar correo a
  terceros. En el peor caso de abuso, el spam llega a la casilla de TapCar.
- **Honeypot** `sitio`, un campo que un humano nunca ve ni llena.
- **Topes de largo** en todos los campos, para que nadie mande megabytes.
- **Sin captcha.** Agrega fricción al lead más valioso del sitio y el
  destinatario fijo ya acota el daño. Si aparece abuso real, la respuesta es
  activar rate limiting en el WAF de Vercel desde el panel — no hay estado
  compartido entre invocaciones serverless para implementarlo a mano.

### La API key

`RESEND_API_KEY` se lee de `process.env`. **No vive en el repo.** Se guarda como
variable de entorno en el proyecto de Vercel.

Si falta, la función responde 500 y deja un mensaje claro en los logs. No falla
en silencio.

## El formulario

Reemplaza el contenido del bloque `.calc__contacto`, conservando el título
"Más de 100 vehículos" y su bajada.

Campos, en este orden: empresa y nombre (una fila de dos columnas en escritorio),
correo y teléfono (otra fila), cantidad de vehículos, mensaje. Obligatorios:
empresa, nombre, correo y cantidad. El campo de cantidad es `type="number"` y
parte con el valor 100 — "100+" no sirve para cotizar, el número real sí.

El campo parte en 100 porque es el tramo donde vive, pero **el servidor acepta
desde 1 a propósito**: el visitante puede corregir la cifra hacia abajo y una
consulta con un número menor vale más que un rechazo. El número real llega en el
asunto del correo y lo lee una persona.

El honeypot va fuera de pantalla con `position: absolute`, más `tabindex="-1"`,
`autocomplete="off"` y `aria-hidden="true"`. No se usa `display: none`: hay bots
que leen el CSS y se saltan justamente esos.

### Los tres estados

1. **Reposo** — el formulario, con el botón "Enviar consulta".
2. **Enviando** — botón deshabilitado y con el texto "Enviando…". Evita el doble
   envío.
3. **Resultado** — si salió bien, el formulario se reemplaza por una
   confirmación y el foco se mueve ahí, para que un lector de pantalla la anuncie.
   Si falló, un mensaje en un contenedor con `role="alert"` y el botón vuelve a
   estar disponible.

**El enlace `mailto:contacto@tapcar.cl` se queda visible bajo el formulario, en
los tres estados.** Si la función está caída o el visitante tiene JavaScript
desactivado, nunca se queda sin forma de contactar.

### Accesibilidad

Cada campo con su `<label>` asociado por `for`/`id`. El contenedor del mensaje
de estado con `role="alert"` y `aria-live="polite"`, para que el resultado se
anuncie sin tener que buscarlo.

## Qué se puede verificar y qué no

Esta es la parte incómoda y conviene dejarla escrita.

**Se verifica solo, sin cuentas ni despliegue:** toda la lógica de la función.
Se prueba con un script de Node que importa `api/contacto.js`, le pasa objetos
`req`/`res` falsos y una implementación falsa de `fetch`, y comprueba cada
camino: método no permitido, JSON malformado, cada regla de validación, el
honeypot, la key ausente, el error de Resend, y el caso feliz —incluyendo que el
cuerpo del correo y el `reply_to` salgan bien armados—.

**No se puede verificar sin intervención del usuario:** que el correo llegue de
verdad. Eso necesita una cuenta de Resend, el dominio `tapcar.cl` verificado y la
key cargada en Vercel. Son pasos que solo puede dar quien tiene esas cuentas.

El trabajo no se declara terminado hasta que una consulta de prueba llegue a
contacto@tapcar.cl desde un despliegue real. Hasta entonces: código listo,
entrega sin comprobar.

## Pasos manuales para quien despliega

1. Crear cuenta en [resend.com](https://resend.com).
2. Agregar y verificar el dominio **`tapcar.cl`** (registros DNS que entrega
   Resend). El remitente `web@tapcar.cl` depende de esta verificación: si se
   verifica otro dominio o subdominio, hay que ajustar el `from` de la función.
3. Crear una API key con permiso de envío.
4. En Vercel → el proyecto → Settings → Environment Variables, agregar
   `RESEND_API_KEY` con ese valor, para los tres entornos.
5. Volver a desplegar (las variables de entorno no se aplican a despliegues ya
   hechos).
6. Enviar una consulta de prueba desde `/planes/` y confirmar que llega.

## Archivos

| Archivo | Qué cambia |
|---|---|
| `api/contacto.js` | Nuevo. La función. Primer backend del repo. |
| `planes/index.html` | El markup del formulario dentro de `.calc__contacto`, y el JS que lo envía. |
| `styles.css` | Estilos del formulario, más el re-incrustado en los cinco HTML. |
| `README.md` | La función, la variable de entorno y los pasos de Resend. |
| `tools/test_contacto.js` | Nuevo. Las pruebas de la función. |

El JSON-LD no cambia: un formulario de contacto no altera las ofertas ni el FAQ.
Aun así hay que dejar `python tools/schema.py` idempotente, o sea sin correrlo
salvo que algo del contenido cambie.
