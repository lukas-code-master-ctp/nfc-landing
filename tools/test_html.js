// Pruebas del HTML de las seis páginas, en lo que toca a la analítica.
// Sin dependencias:  node tools/test_html.js
//
// assets/analitica.js se prueba aparte (tools/test_analitica.js), pero esa
// prueba no ve el HTML. Lo que se rompe sin que ningún test lo note es lo
// que vive en las páginas:
//  - un CTA nuevo sin `data-ubicacion`, que sale como `sin-ubicacion` y ya
//    no se sabe de dónde vino el clic;
//  - una página que deja de cargar analitica.js o pierde el botón
//    "Preferencias de cookies" (los Términos prometen que siempre se puede
//    cambiar la decisión);
//  - `enviar_formulario` movido fuera de la rama de éxito, que contaría
//    como conversión un envío que falló;
//  - la marca de "una vez por página" de `usar_calculadora`, sin la cual
//    cada paso del slider manda un evento.
// Son verificaciones de texto, no un parser de HTML ni de JS: alcanzan
// para lo que hay en el sitio, que es HTML escrito a mano y ordenado.

var assert = require('node:assert');
var fs = require('node:fs');
var path = require('node:path');

var RAIZ = path.join(__dirname, '..');
var PAGINAS = ['index.html', 'como-funciona/index.html', 'planes/index.html',
  'socios/index.html', 'legal/index.html', 'terminos/index.html'];

var corridas = 0, fallos = 0;
function prueba(nombre, fn) {
  corridas++;
  try {
    fn();
    console.log('  ok  ' + nombre);
  } catch (e) {
    fallos++;
    console.log('  FALLA  ' + nombre);
    console.log('        ' + (e && e.message ? e.message.split('\n').join('\n        ') : e));
  }
}

function leer(p) { return fs.readFileSync(path.join(RAIZ, p), 'utf8'); }

// Los <a ...> (la etiqueta de apertura, aunque ocupe varias líneas) cuyo
// href apunta a la app o es un mailto: los mismos que mide analitica.js.
function enlacesMedidos(html) {
  var tags = html.match(/<a\b[^>]*>/gi) || [];
  return tags.filter(function (t) {
    return /\shref\s*=\s*["']?\s*(https:\/\/app\.tapcar\.cl|mailto:)/i.test(t);
  });
}

// El cuerpo entre la llave que abre en `desde` y su llave de cierre.
// Cuenta llaves sin entender strings ni comentarios: basta porque el JS de
// estos bloques no tiene llaves dentro de textos.
function bloque(js, desde) {
  var abre = js.indexOf('{', desde);
  if (abre === -1) return null;
  var nivel = 0;
  for (var i = abre; i < js.length; i++) {
    if (js[i] === '{') nivel++;
    else if (js[i] === '}' && --nivel === 0) return js.slice(abre + 1, i);
  }
  return null;
}

console.log('html (seis páginas)');

PAGINAS.forEach(function (p) {
  var html = leer(p);

  prueba(p + ': todo enlace a app.tapcar.cl o mailto lleva data-ubicacion en kebab-case', function () {
    var enlaces = enlacesMedidos(html);
    assert.ok(enlaces.length > 0, 'no se encontró ningún enlace medido');
    var malos = enlaces.filter(function (t) {
      var m = /\sdata-ubicacion\s*=\s*"([^"]*)"/.exec(t);
      return !m || !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(m[1]);
    });
    assert.deepStrictEqual(malos, []);
  });

  prueba(p + ': carga /assets/analitica.js y tiene "Preferencias de cookies"', function () {
    assert.ok(/<script\s+src="\/assets\/analitica\.js"><\/script>/.test(html), 'falta el script');
    assert.ok(/\sdata-preferencias-cookies[\s>=]/.test(html), 'falta [data-preferencias-cookies]');
  });
});

[['planes/index.html', 'flota'], ['socios/index.html', 'socios']].forEach(function (par) {
  var p = par[0], formulario = par[1];
  prueba(p + ": enviar_formulario '" + formulario + "' va dentro de la rama de éxito, una sola vez", function () {
    var html = leer(p);
    var llamada = "window.tapcarEvento && window.tapcarEvento('enviar_formulario', { formulario: '" + formulario + "' });";
    assert.strictEqual(html.split("'enviar_formulario'").length - 1, 1, 'enviar_formulario debe aparecer una sola vez');
    var si = html.indexOf('if (r.ok && r.cuerpo && r.cuerpo.ok)');
    assert.ok(si !== -1, 'no está la rama de éxito de /api/contacto');
    var cuerpo = bloque(html, si);
    assert.ok(cuerpo && cuerpo.indexOf(llamada) !== -1, 'la llamada no está dentro del if de éxito');
  });
});

prueba('planes/index.html: usar_calculadora se marca y se manda una sola vez por calculadora', function () {
  var html = leer('planes/index.html');
  var i = html.indexOf('function medirUso(cual)');
  assert.ok(i !== -1, 'falta medirUso');
  var cuerpo = bloque(html, i);
  var guardia = cuerpo.indexOf('if (usada[cual]) return;');
  var marca = cuerpo.indexOf('usada[cual] = true;');
  var envio = cuerpo.indexOf("window.tapcarEvento('usar_calculadora'");
  assert.ok(guardia !== -1, 'falta la guardia if (usada[cual]) return;');
  assert.ok(marca !== -1, 'falta la marca usada[cual] = true;');
  assert.ok(envio !== -1, 'falta el envío de usar_calculadora');
  assert.ok(guardia < envio && marca < envio, 'la guardia y la marca van antes del envío');
  ["medirUso('particular')", "medirUso('flotas')"].forEach(function (c) {
    assert.ok(html.indexOf(c) !== -1, 'falta ' + c);
  });
});

console.log('');
console.log(corridas + ' pruebas, ' + fallos + ' fallo(s)');
process.exit(fallos ? 1 : 0);
