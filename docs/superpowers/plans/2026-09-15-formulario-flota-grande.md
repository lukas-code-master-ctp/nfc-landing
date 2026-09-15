# Formulario de flotas de más de 100 vehículos — plan de implementación

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reemplazar el enlace `mailto:` del tramo "Más de 100 vehículos" de `/planes/` por un formulario que envía la consulta a contacto@tapcar.cl.

**Architecture:** Un `<form>` en la página envía JSON por `fetch` a `api/contacto.js`, una función serverless de Vercel que valida los datos y llama a la API de Resend. El destinatario está escrito en el código, no viene del formulario. El sitio no tiene npm ni build, y este plan no los agrega.

**Tech Stack:** HTML + CSS + JavaScript ES5 en el navegador; Node en CommonJS para la función; Resend por HTTP con `fetch` nativo; pruebas con `node:assert`, sin dependencias.

**Spec:** [`docs/superpowers/specs/2026-09-15-formulario-flota-grande-design.md`](../specs/2026-09-15-formulario-flota-grande-design.md)

## Global Constraints

- **Sin npm.** No se crea `package.json`, no se instala el SDK de Resend, no se agregan dependencias. El README del repo defiende esto explícitamente.
- **La función va en CommonJS** (`module.exports = async function (req, res)`). Un `.js` con `import` necesitaría un `package.json` con `"type": "module"`.
- **El JavaScript del navegador va en ES5.** Nada de `const`, `let`, arrow functions ni template literals: el resto de los scripts del sitio son ES5 y no hay transpilación.
- **El destinatario `contacto@tapcar.cl` está escrito en el código de la función**, nunca se lee del cuerpo de la petición. Es la protección que impide usar el endpoint para mandar correo a terceros.
- **El cuerpo del correo va en texto plano**, campo `text` de Resend, nunca `html`. Con HTML habría que escapar cada valor o se puede inyectar markup en el correo.
- **El campo de Resend para responder es `reply_to`**, en snake_case. La API REST no acepta `replyTo`, que es la forma del SDK.
- **`RESEND_API_KEY` se lee de `process.env` y nunca se escribe en el repo.**
- **El enlace `mailto:contacto@tapcar.cl` se queda visible** bajo el formulario, en todos los estados.
- **Idioma.** Español neutro latinoamericano, con "tú" (nunca "vos"). Los comentarios del código también.
- **`styles.css` es la fuente editable**, incrustada literal en los cinco HTML del sitio. Tras editarla hay que re-incrustarla.

## File Structure

| Archivo | Responsabilidad | Tarea |
|---|---|---|
| `api/contacto.js` | Nuevo. La función: valida, arma el correo y llama a Resend. Primer backend del repo. | 1 |
| `tools/test_contacto.js` | Nuevo. Pruebas de la función, sin dependencias ni red. | 1 |
| `planes/index.html` § `.calc__contacto` | El markup del formulario. | 2 |
| `planes/index.html` § scripts | Un IIFE nuevo que envía el formulario. Separado del de la calculadora: es otra responsabilidad. | 2 |
| `styles.css` + los 5 HTML | Estilos del formulario. | 2 |
| `README.md` | La función, la variable de entorno y los pasos de Resend. | 3 |

## Comandos de verificación

- Pruebas de la función: `node tools/test_contacto.js`
- Servidor local para mirar la página: `python -m http.server 4310` → `http://localhost:4310/planes/`

**El servidor estático no ejecuta la función.** `python -m http.server` sirve archivos: un POST a `/api/contacto` desde local va a dar 501 o 404. Eso es esperado y no es un fallo del código. La función se prueba con `node tools/test_contacto.js`; que el correo llegue de verdad solo se comprueba desplegado, después de los pasos manuales de la Tarea 3.

---

### Task 1: La función y sus pruebas

Se escriben primero las pruebas. Cubren todos los caminos de la función sin tocar la red: reemplazan el `fetch` global por uno falso que registra la llamada.

**Files:**
- Create: `tools/test_contacto.js`
- Create: `api/contacto.js`

**Interfaces:**
- Consumes: nada.
- Produces: el endpoint `POST /api/contacto` que consume la Tarea 2.
  - Cuerpo que acepta: `{nombre, empresa, email, telefono, vehiculos, mensaje, sitio}`, todos strings salvo `vehiculos`, que puede venir como número o como string numérico.
  - Respuestas: `200 {"ok":true}` · `400 {"ok":false,"error":"<texto en español>"}` · `405 {"ok":false,"error":...}` · `500 {"ok":false,"error":...}`.
  - `module.exports` es el handler `(req, res)`, y nada más. Las pruebas lo ejercitan de punta a punta y leen lo que le mandó al `fetch` falso, así que `normalizar`, `validar` y `cuerpo` se quedan privadas del módulo.

- [ ] **Step 1: Escribir las pruebas**

Crear `tools/test_contacto.js` con exactamente esto:

```js
// Pruebas de api/contacto.js. Sin dependencias:  node tools/test_contacto.js
//
// La funcion habla con Resend por fetch, asi que estas pruebas reemplazan el
// fetch global por uno falso que registra la llamada. Nunca sale una peticion
// de verdad, y por eso no hace falta ninguna API key para correrlas.

var assert = require('node:assert');
var path = require('node:path');
var handler = require(path.join(__dirname, '..', 'api', 'contacto.js'));

var corridas = 0, fallos = 0;
var enviados = [];
var fetchOriginal = globalThis.fetch;
var keyOriginal = process.env.RESEND_API_KEY;

// ── Dobles de prueba ────────────────────────────────────────────────
// Un res que guarda el codigo y el cuerpo en vez de escribir a la red.
function res() {
  var r = { codigo: 0, cuerpo: null };
  r.status = function (c) { r.codigo = c; return r; };
  r.json = function (o) { r.cuerpo = o; return r; };
  return r;
}

function req(body, metodo) {
  return { method: metodo || 'POST', body: body };
}

// Vercel expone req.body como getter y lanza cuando el JSON viene malformado.
function reqRoto() {
  var o = { method: 'POST' };
  Object.defineProperty(o, 'body', {
    get: function () { throw new SyntaxError('JSON malformado'); }
  });
  return o;
}

// fetch falso. `respuesta` simula lo que devuelve Resend; si es null, lanza.
function fetchFalso(respuesta) {
  globalThis.fetch = function (url, opciones) {
    enviados.push({ url: url, opciones: opciones });
    if (!respuesta) return Promise.reject(new Error('sin red'));
    return Promise.resolve(respuesta);
  };
}

function resendOk() {
  return { ok: true, status: 200, text: function () { return Promise.resolve('{"id":"abc"}'); } };
}

function resendError() {
  return { ok: false, status: 422, text: function () { return Promise.resolve('{"message":"dominio no verificado"}'); } };
}

function datos(extra) {
  var d = {
    nombre: 'Juan Pérez',
    empresa: 'Transportes ACME SpA',
    email: 'juan@acme.cl',
    telefono: '',
    vehiculos: 150,
    mensaje: '',
    sitio: ''
  };
  for (var k in (extra || {})) d[k] = extra[k];
  return d;
}

// El cuerpo JSON que la funcion le mando a Resend en la ultima llamada.
function ultimoCorreo() {
  return JSON.parse(enviados[enviados.length - 1].opciones.body);
}

async function prueba(nombre, fn) {
  corridas++;
  enviados = [];
  process.env.RESEND_API_KEY = 're_prueba';
  fetchFalso(resendOk());
  try {
    await fn();
    console.log('  ok    ' + nombre);
  } catch (e) {
    fallos++;
    console.log('  FALLA ' + nombre);
    console.log('        ' + e.message);
  }
}

// ── Las pruebas ─────────────────────────────────────────────────────
async function main() {
  console.log('api/contacto.js');

  await prueba('rechaza los metodos que no son POST', async function () {
    var r = res();
    await handler(req(datos(), 'GET'), r);
    assert.strictEqual(r.codigo, 405);
    assert.strictEqual(r.cuerpo.ok, false);
    assert.strictEqual(enviados.length, 0);
  });

  await prueba('responde 400 cuando el JSON viene malformado', async function () {
    var r = res();
    await handler(reqRoto(), r);
    assert.strictEqual(r.codigo, 400);
    assert.strictEqual(enviados.length, 0);
  });

  await prueba('exige el nombre', async function () {
    var r = res();
    await handler(req(datos({ nombre: '   ' })), r);
    assert.strictEqual(r.codigo, 400);
    assert.match(r.cuerpo.error, /nombre/i);
    assert.strictEqual(enviados.length, 0);
  });

  await prueba('exige la empresa', async function () {
    var r = res();
    await handler(req(datos({ empresa: '' })), r);
    assert.strictEqual(r.codigo, 400);
    assert.match(r.cuerpo.error, /empresa/i);
  });

  await prueba('rechaza un correo sin arroba', async function () {
    var r = res();
    await handler(req(datos({ email: 'juan.acme.cl' })), r);
    assert.strictEqual(r.codigo, 400);
    assert.strictEqual(enviados.length, 0);
  });

  // Este valor va al encabezado reply_to: un salto de linea ahi seria
  // inyeccion de encabezados.
  await prueba('rechaza un correo con salto de linea', async function () {
    var r = res();
    await handler(req(datos({ email: 'juan@acme.cl\nBcc: otro@ejemplo.cl' })), r);
    assert.strictEqual(r.codigo, 400);
    assert.strictEqual(enviados.length, 0);
  });

  await prueba('rechaza una cantidad de vehiculos que no es entera', async function () {
    var r = res();
    await handler(req(datos({ vehiculos: 'muchos' })), r);
    assert.strictEqual(r.codigo, 400);
  });

  await prueba('rechaza una cantidad de vehiculos fuera de rango', async function () {
    var r = res();
    await handler(req(datos({ vehiculos: 0 })), r);
    assert.strictEqual(r.codigo, 400);
    var r2 = res();
    await handler(req(datos({ vehiculos: 100001 })), r2);
    assert.strictEqual(r2.codigo, 400);
  });

  await prueba('acepta la cantidad como string numerico', async function () {
    var r = res();
    await handler(req(datos({ vehiculos: '150' })), r);
    assert.strictEqual(r.codigo, 200);
    assert.match(ultimoCorreo().subject, /150 vehículos/);
  });

  await prueba('rechaza un mensaje demasiado largo', async function () {
    var r = res();
    await handler(req(datos({ mensaje: 'x'.repeat(2001) })), r);
    assert.strictEqual(r.codigo, 400);
  });

  // Al bot se le responde 200 para no darle la señal de que fue detectado.
  await prueba('descarta en silencio cuando la trampa viene llena', async function () {
    var r = res();
    await handler(req(datos({ sitio: 'http://spam.example' })), r);
    assert.strictEqual(r.codigo, 200);
    assert.strictEqual(r.cuerpo.ok, true);
    assert.strictEqual(enviados.length, 0);
  });

  await prueba('responde 500 si falta RESEND_API_KEY', async function () {
    delete process.env.RESEND_API_KEY;
    var r = res();
    await handler(req(datos()), r);
    assert.strictEqual(r.codigo, 500);
    assert.strictEqual(enviados.length, 0);
  });

  await prueba('responde 500 cuando Resend devuelve error', async function () {
    fetchFalso(resendError());
    var r = res();
    await handler(req(datos()), r);
    assert.strictEqual(r.codigo, 500);
    assert.strictEqual(r.cuerpo.ok, false);
  });

  await prueba('responde 500 cuando la llamada a Resend falla', async function () {
    fetchFalso(null);
    var r = res();
    await handler(req(datos()), r);
    assert.strictEqual(r.codigo, 500);
  });

  await prueba('envia la consulta y responde 200', async function () {
    var r = res();
    await handler(req(datos({ telefono: '+56 9 1234 5678', mensaje: 'Dos sucursales.' })), r);
    assert.strictEqual(r.codigo, 200);
    assert.strictEqual(r.cuerpo.ok, true);
    assert.strictEqual(enviados.length, 1);

    var llamada = enviados[0];
    assert.strictEqual(llamada.url, 'https://api.resend.com/emails');
    assert.strictEqual(llamada.opciones.method, 'POST');
    assert.strictEqual(llamada.opciones.headers.Authorization, 'Bearer re_prueba');

    var correo = ultimoCorreo();
    assert.deepStrictEqual(correo.to, ['contacto@tapcar.cl']);
    assert.strictEqual(correo.reply_to, 'juan@acme.cl');
    assert.match(correo.subject, /Transportes ACME SpA/);
    assert.match(correo.subject, /150 vehículos/);
    assert.match(correo.text, /Transportes ACME SpA/);
    assert.match(correo.text, /Juan Pérez/);
    assert.match(correo.text, /\+56 9 1234 5678/);
    assert.match(correo.text, /Dos sucursales\./);
    // En texto plano, nunca HTML: evita tener que escapar los valores.
    assert.strictEqual(correo.html, undefined);
  });

  await prueba('omite los campos opcionales vacios del cuerpo', async function () {
    var r = res();
    await handler(req(datos()), r);
    assert.strictEqual(r.codigo, 200);
    var correo = ultimoCorreo();
    assert.doesNotMatch(correo.text, /Teléfono/);
    assert.doesNotMatch(correo.text, /Mensaje/);
  });

  // La proteccion que de verdad importa: el endpoint no puede usarse para
  // mandar correo a terceros.
  await prueba('ignora un destinatario que venga en el cuerpo', async function () {
    var r = res();
    await handler(req(datos({ to: 'victima@ejemplo.cl', from: 'falso@ejemplo.cl' })), r);
    assert.strictEqual(r.codigo, 200);
    var correo = ultimoCorreo();
    assert.deepStrictEqual(correo.to, ['contacto@tapcar.cl']);
    assert.match(correo.from, /tapcar\.cl/);
  });

  await prueba('recorta los espacios de los campos', async function () {
    var r = res();
    await handler(req(datos({ nombre: '  Juan Pérez  ', email: '  juan@acme.cl ' })), r);
    assert.strictEqual(r.codigo, 200);
    assert.strictEqual(ultimoCorreo().reply_to, 'juan@acme.cl');
  });

  // ── Cierre ────────────────────────────────────────────────────────
  globalThis.fetch = fetchOriginal;
  if (keyOriginal === undefined) delete process.env.RESEND_API_KEY;
  else process.env.RESEND_API_KEY = keyOriginal;

  console.log('');
  console.log(corridas + ' pruebas, ' + fallos + ' fallo(s)');
  process.exit(fallos ? 1 : 0);
}

main();
```

- [ ] **Step 2: Correr las pruebas para verlas fallar**

Run: `node tools/test_contacto.js`

Expected: falla al arrancar, antes de correr ninguna prueba, con una traza de `node:internal/modules/cjs/loader` y `Error: Cannot find module` apuntando a `api/contacto.js`. Todavía no existe, y eso es exactamente lo que debe pasar en este paso.

- [ ] **Step 3: Escribir la función**

Crear `api/contacto.js` con exactamente esto:

```js
// Recibe el formulario de flotas grandes de /planes/ y manda la consulta a
// contacto@tapcar.cl a traves de Resend.
//
// CommonJS a proposito: un .js con `import` necesitaria un package.json con
// "type": "module", y este repo no tiene npm. Vercel toma cualquier .js dentro
// de /api como funcion serverless, sin configuracion.

// El destinatario esta escrito aca y nunca se lee del cuerpo de la peticion.
// Es lo que impide que alguien use este endpoint para mandar correo a otros:
// lo peor que puede pasar es que llenen la casilla de TapCar.
var DESTINO = 'contacto@tapcar.cl';
// Depende de que tapcar.cl este verificado como dominio en Resend. Si algun
// dia se verifica otro dominio o subdominio, se cambia esta linea.
var REMITENTE = 'TapCar web <web@tapcar.cl>';
var RESEND = 'https://api.resend.com/emails';

var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function texto(v) {
  return typeof v === 'string' ? v.trim() : '';
}

function entero(v) {
  if (typeof v === 'number' && Number.isInteger(v)) return v;
  if (typeof v === 'string' && /^\d+$/.test(v.trim())) return parseInt(v.trim(), 10);
  return null;
}

function normalizar(body) {
  var b = body || {};
  return {
    nombre: texto(b.nombre),
    empresa: texto(b.empresa),
    email: texto(b.email),
    telefono: texto(b.telefono),
    vehiculos: entero(b.vehiculos),
    mensaje: texto(b.mensaje),
    sitio: texto(b.sitio)
  };
}

// Devuelve el primer error como texto listo para mostrarle al visitante, o
// null si los datos sirven. Es la validacion autoritativa: los `required` del
// HTML son comodidad, no seguridad.
function validar(d) {
  if (!d.nombre) return 'Falta tu nombre.';
  if (d.nombre.length > 120) return 'El nombre es demasiado largo.';
  if (!d.empresa) return 'Falta el nombre de la empresa.';
  if (d.empresa.length > 120) return 'El nombre de la empresa es demasiado largo.';
  if (!d.email) return 'Falta tu correo.';
  if (d.email.length > 160) return 'El correo es demasiado largo.';
  // La regex rechaza cualquier espacio en blanco, y \s incluye los saltos de
  // linea. Eso importa: este valor va al encabezado reply_to, y un salto ahi
  // seria inyeccion de encabezados.
  if (!EMAIL_RE.test(d.email)) return 'Ese correo no parece válido.';
  if (d.telefono.length > 40) return 'El teléfono es demasiado largo.';
  if (d.vehiculos === null) return 'Indica cuántos vehículos tiene tu flota.';
  if (d.vehiculos < 1 || d.vehiculos > 100000) {
    return 'La cantidad de vehículos debe estar entre 1 y 100.000.';
  }
  if (d.mensaje.length > 2000) return 'El mensaje es demasiado largo.';
  return null;
}

// Texto plano, nunca HTML: con HTML habria que escapar cada valor antes de
// interpolarlo o alguien puede inyectar markup en el correo que llega.
function cuerpo(d) {
  var lineas = [
    'Nueva consulta de flota desde tapcar.cl/planes/',
    '',
    'Empresa:    ' + d.empresa,
    'Nombre:     ' + d.nombre,
    'Correo:     ' + d.email
  ];
  if (d.telefono) lineas.push('Teléfono:   ' + d.telefono);
  lineas.push('Vehículos:  ' + d.vehiculos);
  if (d.mensaje) lineas.push('', 'Mensaje:', d.mensaje);
  return lineas.join('\n');
}

function falla(res) {
  return res.status(500).json({
    ok: false,
    error: 'No pudimos enviar tu consulta. Escríbenos a ' + DESTINO + '.'
  });
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Método no permitido.' });
  }

  var body;
  try {
    // Vercel parsea el cuerpo solo cuando el Content-Type es JSON, y expone
    // req.body como getter que lanza si el JSON viene malformado.
    body = req.body;
  } catch (e) {
    return res.status(400).json({ ok: false, error: 'No pudimos leer el formulario.' });
  }

  var d = normalizar(body);

  // Trampa para bots: un humano nunca ve ni llena este campo. Se responde 200
  // para no darle al bot la señal de que fue detectado.
  if (d.sitio) return res.status(200).json({ ok: true });

  var error = validar(d);
  if (error) return res.status(400).json({ ok: false, error: error });

  var key = process.env.RESEND_API_KEY;
  if (!key) {
    console.error('[contacto] falta RESEND_API_KEY en el entorno');
    return falla(res);
  }

  try {
    var r = await fetch(RESEND, {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + key,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: REMITENTE,
        to: [DESTINO],
        reply_to: d.email,
        subject: 'Consulta de flota — ' + d.empresa + ' (' + d.vehiculos + ' vehículos)',
        text: cuerpo(d)
      })
    });
    if (!r.ok) {
      var detalle = await r.text();
      console.error('[contacto] Resend respondió ' + r.status + ': ' + detalle);
      return falla(res);
    }
  } catch (e) {
    console.error('[contacto] falló la llamada a Resend: ' + e.message);
    return falla(res);
  }

  return res.status(200).json({ ok: true });
};
```

- [ ] **Step 4: Correr las pruebas para verlas pasar**

Run: `node tools/test_contacto.js`

Expected: las 18 pruebas en `ok`, y la última línea `18 pruebas, 0 fallo(s)`. El comando sale con código 0.

Entre medio de las pruebas aparecen estas tres líneas:

```
[contacto] falta RESEND_API_KEY en el entorno
[contacto] Resend respondió 422: {"message":"dominio no verificado"}
[contacto] falló la llamada a Resend: sin red
```

**No son fallas.** Son los `console.error` de la propia función, que las tres pruebas de error provocan a propósito; verlos confirma que la función deja rastro en los logs de Vercel cuando algo sale mal. Lo que importa es que las 18 líneas digan `ok` y que el conteo final sea `0 fallo(s)`.

- [ ] **Step 5: Commit**

```bash
git add api/contacto.js tools/test_contacto.js
git commit -m "Contacto: funcion que manda la consulta de flota por Resend"
```

---

### Task 2: El formulario en la página

**Files:**
- Modify: `planes/index.html`, el bloque `<div class="calc__contacto" data-contacto hidden>`
- Modify: `planes/index.html`, agregar un `<script>` nuevo después del de la calculadora
- Modify: `styles.css`
- Modify: `index.html`, `planes/index.html`, `como-funciona/index.html`, `legal/index.html`, `terminos/index.html` (bloque `<style>` regenerado)

**Interfaces:**
- Consumes: `POST /api/contacto` de la Tarea 1, con el cuerpo y las respuestas descritas ahí.
- Produces: nada para tareas posteriores.

> Los números de línea son de antes de tocar el archivo. Ancla en el texto, no en el número.

- [ ] **Step 1: Agregar el CSS del formulario**

En `styles.css`, justo **después** del bloque que termina con la regla `.calc__contacto__mail` (el comentario que lo abre es `/* Flotas — tramo "Más de 100": reemplaza el precio por un llamado a contacto. */`), insertar:

```css
/* Planes — Formulario de la consulta de flota grande */
.form { margin: 18px 0 0; display: flex; flex-direction: column; gap: 14px; }
.form[hidden] { display: none; }
.form__fila { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
/* min-width: 0 para que un input no ensanche su columna y saque scroll. */
.form__campo { display: flex; flex-direction: column; gap: 6px; min-width: 0; }
.form__label { font-size: 13px; font-weight: 600; color: var(--tinta); }
.form__opcional { font-weight: 400; color: var(--acero); }
.form__input {
  width: 100%; font-family: var(--font-sans); font-size: 15px; color: var(--tinta);
  padding: 10px 12px; background: var(--superficie);
  border: 1px solid var(--linea); border-radius: var(--radius-sm);
  transition: border-color var(--duration-base) var(--ease-standard),
              box-shadow var(--duration-base) var(--ease-standard);
}
.form__input:focus { outline: none; border-color: var(--azul); box-shadow: 0 0 0 3px var(--azul-soft); }
.form__input--corto { max-width: 150px; }
.form__textarea { resize: vertical; min-height: 76px; }
.form__enviar { margin-top: 4px; }
.form__enviar[disabled] { opacity: 0.6; cursor: default; }
.form__estado { margin: 0; font-size: 13px; line-height: 1.5; color: var(--estado-vencido-fg); }
.form__estado:empty { display: none; }
.form__salida { margin: 14px 0 0; font-size: 13px; color: var(--acero); }
.form__salida a { color: var(--azul); font-weight: 600; }

/* Trampa para bots. Fuera de pantalla y no display:none, porque hay bots que
   leen el CSS y se saltan justamente los campos ocultos de esa forma. */
.form__trampa {
  position: absolute; width: 1px; height: 1px; overflow: hidden;
  clip-path: inset(50%); white-space: nowrap;
}

/* Confirmación de envío */
.form__ok {
  display: flex; align-items: flex-start; gap: 12px; margin: 18px 0 0;
  padding: 16px 18px; border-radius: var(--radius-md);
  background: var(--estado-vigente-bg); color: var(--estado-vigente-fg);
}
.form__ok[hidden] { display: none; }
.form__ok:focus { outline: none; }
.form__ok__icon { flex: 0 0 auto; margin-top: 2px; }
.form__ok__title { margin: 0; font-size: 16px; font-weight: 700; }
.form__ok__text { margin: 4px 0 0; font-size: 14px; line-height: 1.5; opacity: 0.9; }
```

- [ ] **Step 2: Agregar el CSS móvil del formulario**

En `styles.css`, dentro del `@media (max-width: 560px)`, justo **después** de la línea `.calc__linea { font-size: 13px; }`, insertar:

```css
  /* Bajo 560px las dos columnas no caben: los campos se apilan. */
  .form__fila { grid-template-columns: 1fr; }
  .form__input--corto { max-width: none; }
```

- [ ] **Step 3: Reemplazar el bloque de contacto por el formulario**

En `planes/index.html`, reemplazar el `<div class="calc__contacto" data-contacto hidden>` completo (desde esa etiqueta hasta su `</div>` de cierre) por:

```html
        <div class="calc__contacto" data-contacto hidden>
          <p class="calc__contacto__title">Más de 100 vehículos</p>
          <p class="calc__contacto__text">Cuéntanos de tu operación y te armamos una propuesta a la medida.</p>

          <form class="form" data-form-flota>
            <div class="form__fila">
              <div class="form__campo">
                <label class="form__label" for="f-empresa">Empresa</label>
                <input class="form__input" id="f-empresa" name="empresa" type="text" maxlength="120" required autocomplete="organization">
              </div>
              <div class="form__campo">
                <label class="form__label" for="f-nombre">Tu nombre</label>
                <input class="form__input" id="f-nombre" name="nombre" type="text" maxlength="120" required autocomplete="name">
              </div>
            </div>
            <div class="form__fila">
              <div class="form__campo">
                <label class="form__label" for="f-email">Correo</label>
                <input class="form__input" id="f-email" name="email" type="email" maxlength="160" required autocomplete="email">
              </div>
              <div class="form__campo">
                <label class="form__label" for="f-telefono">Teléfono <span class="form__opcional">(opcional)</span></label>
                <input class="form__input" id="f-telefono" name="telefono" type="tel" maxlength="40" autocomplete="tel">
              </div>
            </div>
            <div class="form__campo">
              <label class="form__label" for="f-vehiculos">Vehículos de la flota</label>
              <input class="form__input form__input--corto" id="f-vehiculos" name="vehiculos" type="number" min="1" max="100000" step="1" value="100" required>
            </div>
            <div class="form__campo">
              <label class="form__label" for="f-mensaje">Mensaje <span class="form__opcional">(opcional)</span></label>
              <textarea class="form__input form__textarea" id="f-mensaje" name="mensaje" maxlength="2000" rows="3"></textarea>
            </div>

            <div class="form__trampa" aria-hidden="true">
              <label for="f-sitio">No llenes este campo</label>
              <input id="f-sitio" name="sitio" type="text" tabindex="-1" autocomplete="off">
            </div>

            <button type="submit" class="btn btn--primary btn--lg form__enviar" data-form-btn>Enviar consulta</button>
            <p class="form__estado" data-form-estado role="alert" aria-live="polite"></p>
          </form>

          <div class="form__ok" data-form-ok hidden tabindex="-1">
            <svg class="form__ok__icon" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>
            <span>
              <p class="form__ok__title">Consulta enviada</p>
              <p class="form__ok__text">Te respondemos a la brevedad al correo que nos dejaste.</p>
            </span>
          </div>

          <p class="form__salida">O escríbenos directo a <a href="mailto:contacto@tapcar.cl">contacto@tapcar.cl</a></p>
        </div>
```

El formulario **no** lleva `novalidate`: la validación nativa del navegador da el primer aviso sin viaje a la red, y la función vuelve a validar del lado del servidor, que es la que manda.

- [ ] **Step 4: Agregar el script que envía el formulario**

En `planes/index.html`, insertar este `<script>` completo justo **después** del `</script>` de la calculadora y **antes** del `<script>` del menú móvil:

```html
  <script>
    // ── Envío de la consulta de flota grande ───────────────────────
    (function () {
      var form = document.querySelector('[data-form-flota]');
      if (!form) return;
      var btn = form.querySelector('[data-form-btn]');
      var estado = form.querySelector('[data-form-estado]');
      var ok = document.querySelector('[data-form-ok]');
      var SALIDA = 'No pudimos enviar tu consulta. Escríbenos a contacto@tapcar.cl.';

      function fallar(mensaje) {
        estado.textContent = mensaje;
        btn.disabled = false;
        btn.textContent = 'Enviar consulta';
      }

      form.addEventListener('submit', function (e) {
        e.preventDefault();
        estado.textContent = '';
        // Deshabilitar el botón evita el doble envío mientras viaja la petición.
        btn.disabled = true;
        btn.textContent = 'Enviando…';

        fetch('/api/contacto', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            nombre: form.nombre.value,
            empresa: form.empresa.value,
            email: form.email.value,
            telefono: form.telefono.value,
            vehiculos: form.vehiculos.value,
            mensaje: form.mensaje.value,
            sitio: form.sitio.value
          })
        }).then(function (r) {
          // Si la respuesta no es JSON (por ejemplo, una página de error de
          // Vercel), json() rechaza y cae en el catch de abajo.
          return r.json().then(function (cuerpo) { return { ok: r.ok, cuerpo: cuerpo }; });
        }).then(function (r) {
          if (r.ok && r.cuerpo && r.cuerpo.ok) {
            form.hidden = true;
            ok.hidden = false;
            // Mover el foco hace que un lector de pantalla anuncie el resultado.
            ok.focus();
            return;
          }
          fallar((r.cuerpo && r.cuerpo.error) || SALIDA);
        })['catch'](function () {
          fallar(SALIDA);
        });
      });
    })();
  </script>
```

`['catch'](...)` y no `.catch(...)`: `catch` es palabra reservada en ES3 y el resto del sitio se mantiene conservador con eso.

- [ ] **Step 5: Re-incrustar el CSS en las cinco páginas**

```bash
python -c "import io; css=io.open('styles.css',encoding='utf-8').read().rstrip(); [io.open(f,'w',encoding='utf-8',newline='').write(h[:h.index('<style>')+7]+'\n'+css+'\n'+h[h.index('  </style>'):]) for f in ['index.html','planes/index.html','legal/index.html','como-funciona/index.html','terminos/index.html'] for h in [io.open(f,encoding='utf-8').read()]]"
```

- [ ] **Step 6: Verificar que los cinco bloques `<style>` quedaron idénticos a `styles.css`**

```bash
python -c "
import io, sys
css = io.open('styles.css', encoding='utf-8').read().strip()
malos = []
for f in ['index.html','planes/index.html','legal/index.html','como-funciona/index.html','terminos/index.html']:
    h = io.open(f, encoding='utf-8').read()
    emb = h[h.index('<style>')+7:h.index('  </style>')].strip()
    if emb != css: malos.append(f)
    print(('  OK  ' if emb == css else '  MAL '), f)
sys.exit(1 if malos else 0)
"
```

Expected: cinco `OK` y código de salida 0.

- [ ] **Step 7: Verificar el formulario en el navegador**

Levanta `python -m http.server 4310` y abre `http://localhost:4310/planes/`. Cambia a la pestaña Flotas y lleva el slider de vehículos al tope, hasta "Más de 100 vehículos".

Expected:
- Se ve el formulario con los seis campos, "Empresa" y "Tu nombre" en una fila de dos columnas, lo mismo "Correo" y "Teléfono".
- "Vehículos de la flota" parte en 100.
- El enlace a contacto@tapcar.cl sigue visible bajo el botón.
- El campo trampa **no** se ve por ningún lado.
- La consola no tiene errores.

- [ ] **Step 8: Verificar la validación nativa y el estado de error**

En la página, con el formulario a la vista:

1. Aprieta "Enviar consulta" con los campos vacíos. Expected: el navegador bloquea el envío y marca el primer campo obligatorio; no sale ninguna petición.
2. Llena empresa, nombre y un correo válido, y vuelve a enviar. Expected: el botón pasa a "Enviando…" y queda deshabilitado; como el servidor estático no ejecuta funciones, el POST falla y aparece el mensaje "No pudimos enviar tu consulta. Escríbenos a contacto@tapcar.cl." y el botón vuelve a estar disponible. **Ese fallo es el esperado en local** — confirma justamente que el camino de error funciona y que el visitante nunca queda sin salida.

- [ ] **Step 9: Verificar la trampa y el estado de éxito**

En la consola del navegador:

```js
var f = document.querySelector('[data-form-flota]');
console.log('trampa invisible:', f.querySelector('[name=sitio]').getBoundingClientRect().width <= 1);
// Simular la respuesta buena del servidor sin tener la función corriendo.
var real = window.fetch;
window.fetch = function () { return Promise.resolve({ ok: true, json: function () { return Promise.resolve({ ok: true }); } }); };
f.empresa.value = 'ACME'; f.nombre.value = 'Juan'; f.email.value = 'juan@acme.cl';
f.requestSubmit();
setTimeout(function () {
  console.log('formulario oculto:', f.hidden,
              '· confirmación visible:', !document.querySelector('[data-form-ok]').hidden,
              '· foco en la confirmación:', document.activeElement === document.querySelector('[data-form-ok]'));
  window.fetch = real;
}, 200);
```

Expected:
```
trampa invisible: true
formulario oculto: true · confirmación visible: true · foco en la confirmación: true
```

- [ ] **Step 10: Verificar el móvil**

Con el viewport a 375px, en el tramo "Más de 100":

Expected: los campos se apilan en una columna, el de vehículos ocupa el ancho, y no hay scroll horizontal. Comprobarlo en la consola:

```js
console.log('scroll horizontal:', document.documentElement.scrollWidth > document.documentElement.clientWidth);
```

Expected: `scroll horizontal: false`

- [ ] **Step 11: Commit**

```bash
git add styles.css index.html planes/index.html como-funciona/index.html legal/index.html terminos/index.html
git commit -m "Planes: el tramo de mas de 100 vehiculos pasa a un formulario"
```

---

### Task 3: Documentar la función y el despliegue

Sin esto, la función queda en el repo sin que nadie sepa que necesita una variable de entorno para funcionar. Es el paso que convierte el código en algo desplegable.

**Files:**
- Modify: `README.md`

**Interfaces:**
- Consumes: nada.
- Produces: nada.

- [ ] **Step 1: Agregar la sección del backend**

En `README.md`, insertar esta sección completa justo **antes** de la sección `### Analítica`:

```markdown
### Backend: la función de contacto

`api/contacto.js` es **la única pieza de servidor del repo**. Recibe el formulario del tramo "más de 100 vehículos" de `/planes/` y manda la consulta a contacto@tapcar.cl a través de [Resend](https://resend.com).

Vercel toma cualquier `.js` dentro de `/api` como función serverless, sin configuración. Está escrita en **CommonJS** y usa `fetch` nativo a propósito: un `.js` con `import` necesitaría un `package.json` con `"type": "module"`, y el SDK de Resend obligaría a instalar npm. Ninguna de las dos cosas entra acá.

Dos decisiones que conviene no deshacer:

- **El destinatario está escrito en el código**, nunca se lee del cuerpo de la petición. Es lo que impide que alguien use el endpoint para mandar correo a terceros: lo peor que puede pasar es que llenen la casilla de TapCar.
- **El correo va en texto plano** (campo `text` de Resend, nunca `html`). Con HTML habría que escapar cada valor antes de interpolarlo o se puede inyectar markup en el correo que llega.

El remitente es `web@tapcar.cl` y depende de que **`tapcar.cl` esté verificado como dominio en Resend**. Si algún día se verifica otro dominio o subdominio, hay que cambiar la constante `REMITENTE` de la función.

Contra el spam hay un campo trampa (`sitio`), topes de largo en todos los campos y rechazo de todo lo que no sea POST. No hay captcha a propósito: agrega fricción a la consulta más valiosa del sitio y el destinatario fijo ya acota el daño. Si aparece abuso real, lo que corresponde es activar rate limiting en el WAF de Vercel desde el panel — entre invocaciones serverless no hay estado compartido para implementarlo a mano.

#### Pruebas

```bash
node tools/test_contacto.js
```

Sin dependencias y sin red: las pruebas reemplazan el `fetch` global por uno falso, así que **no hace falta ninguna API key para correrlas**. Cubren el método no permitido, el JSON malformado, cada regla de validación, la trampa, la key ausente, el error de Resend y el caso feliz.

Lo que las pruebas **no** pueden comprobar es que el correo llegue de verdad. Eso solo se ve desplegado.

#### Variable de entorno

| Variable | Dónde | Para qué |
|---|---|---|
| `RESEND_API_KEY` | Vercel → el proyecto → Settings → Environment Variables | Autentica la llamada a Resend |

**Nunca va al repo.** Si falta, la función responde 500 con un mensaje claro y deja el detalle en los logs de Vercel; el formulario muestra el error y el enlace `mailto:` que siempre queda visible.

#### Puesta en marcha

1. Crear cuenta en [resend.com](https://resend.com).
2. Agregar y verificar el dominio **`tapcar.cl`** con los registros DNS que entrega Resend.
3. Crear una API key con permiso de envío.
4. Cargarla en Vercel como `RESEND_API_KEY`, en los tres entornos.
5. **Volver a desplegar.** Las variables de entorno no se aplican a despliegues ya hechos.
6. Enviar una consulta de prueba desde `/planes/` y confirmar que llega a contacto@tapcar.cl.
```

- [ ] **Step 2: Agregar la función al árbol de archivos del README**

En `README.md`, en el bloque de código del árbol de archivos, reemplazar la línea

```
├── tools/schema.py         # Regenera el JSON-LD desde el contenido visible
```

por estas dos, en ese orden:

```
├── api/contacto.js         # Funcion serverless: formulario de flota -> Resend
├── tools/schema.py         # Regenera el JSON-LD desde el contenido visible
```

Los comentarios van alineados en la misma columna que el resto del árbol.

- [ ] **Step 3: Agregar la viñeta del formulario a "Comportamientos con JS"**

En `README.md`, en la lista de la sección "Comportamientos con JS", agregar al final:

```markdown
- **Formulario de flota grande** (planes) — en el tramo de más de 100 vehículos, envía la consulta por `fetch` a `/api/contacto`. Botón deshabilitado mientras viaja, confirmación con foco al terminar y, si falla, un mensaje de error. El enlace `mailto:` queda visible siempre, así que ni sin JavaScript ni con la función caída alguien se queda sin forma de escribir.
```

- [ ] **Step 4: Verificar que el README no promete nada falso**

```bash
grep -n 'RESEND_API_KEY\|resend.com\|api/contacto' README.md
```

Expected: las menciones de la sección nueva, del árbol y de la viñeta. Ninguna debe afirmar que el envío ya está verificado funcionando.

- [ ] **Step 5: Commit**

```bash
git add README.md
git commit -m "README: documenta la funcion de contacto y su puesta en marcha"
```

---

## Verificación final

- [ ] `node tools/test_contacto.js` da `18 pruebas, 0 fallo(s)` y sale con código 0.
- [ ] Los cinco bloques `<style>` siguen idénticos a `styles.css`.
- [ ] `python tools/schema.py` no deja diff: el JSON-LD no cambia con esta tarea, porque un formulario no altera las ofertas ni el FAQ.
- [ ] En `/planes/`, tramo "más de 100": el formulario se ve, valida en el navegador, muestra el error cuando el POST falla y el enlace `mailto:` queda visible en los tres estados.
- [ ] A 375px los campos se apilan y no hay scroll horizontal.
- [ ] `grep -rn 'RESEND_API_KEY' --include='*.js' --include='*.html' .` no encuentra ninguna key literal: solo la lectura de `process.env`.
- [ ] La consola del navegador no tiene errores.

## Lo que queda sin verificar, y hay que decirlo

**Que el correo llegue no está comprobado al terminar este plan.** Necesita la cuenta de Resend, el dominio verificado y la key cargada en Vercel — pasos que solo puede dar quien tiene esas cuentas.

Al entregar, el estado honesto es: la lógica de la función está probada, el formulario está probado en el navegador, y **el envío end-to-end está pendiente de la puesta en marcha**. No se declara funcionando hasta que una consulta de prueba llegue a contacto@tapcar.cl desde un despliegue real.
