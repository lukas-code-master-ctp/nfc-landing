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

  // `empresa` viaja al asunto, que es un encabezado del correo: mismo riesgo
  // que reply_to, que ya estaba cubierto.
  await prueba('limpia los saltos de linea de la empresa antes del asunto', async function () {
    var r = res();
    await handler(req(datos({ empresa: 'ACME\nBcc: victima@ejemplo.cl' })), r);
    assert.strictEqual(r.codigo, 200);
    var correo = ultimoCorreo();
    assert.doesNotMatch(correo.subject, /[\r\n]/);
    assert.match(correo.subject, /ACME Bcc: victima@ejemplo\.cl/);
  });

  await prueba('limpia los saltos de linea del nombre y del telefono', async function () {
    var r = res();
    await handler(req(datos({ nombre: 'Juan\r\nPérez', telefono: '+56 9\n1234' })), r);
    assert.strictEqual(r.codigo, 200);
    var correo = ultimoCorreo();
    assert.match(correo.text, /Nombre:     Juan Pérez/);
    assert.match(correo.text, /Teléfono:   \+56 9 1234/);
  });

  // El mensaje si puede llevar saltos: va al cuerpo en texto plano, no a un
  // encabezado.
  await prueba('conserva los saltos de linea del mensaje', async function () {
    var r = res();
    await handler(req(datos({ mensaje: 'Primera línea.\nSegunda línea.' })), r);
    assert.strictEqual(r.codigo, 200);
    assert.match(ultimoCorreo().text, /Primera línea\.\nSegunda línea\./);
  });

  await prueba('acepta el limite superior de vehiculos', async function () {
    var r = res();
    await handler(req(datos({ vehiculos: 100000 })), r);
    assert.strictEqual(r.codigo, 200);
  });

  await prueba('rechaza los campos de una linea demasiado largos', async function () {
    var casos = [{ nombre: 'x'.repeat(121) }, { empresa: 'x'.repeat(121) }, { telefono: 'x'.repeat(41) }];
    for (var i = 0; i < casos.length; i++) {
      var r = res();
      await handler(req(datos(casos[i])), r);
      assert.strictEqual(r.codigo, 400, 'el caso ' + i + ' deberia rechazarse');
    }
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
