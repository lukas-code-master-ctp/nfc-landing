// Pruebas de assets/analitica.js. Sin dependencias:  node tools/test_analitica.js
//
// Se prueban las funciones puras que el archivo exporta cuando corre en
// Node (leer y guardar la decisión, qué estado de consentimiento le
// corresponde, el orden de los comandos de gtag y qué cookies borrar) y
// además `iniciar(win)`, la parte del navegador, contra un DOM falso
// mínimo: doble carga, dónde queda el banner, qué pasa al rechazar y al
// aceptar. En Node no hay `window`, así que al hacer require el archivo
// no arranca solo.
//
// Lo que más importa vigilar: que nunca se conceda nada por un dato que no
// se pudo leer, y que los tres permisos de publicidad no se concedan nunca.

var assert = require('node:assert');
var path = require('node:path');
var a = require(path.join(__dirname, '..', 'assets', 'analitica.js'));

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

// ── Dobles de prueba ────────────────────────────────────────────────
// Un localStorage en memoria.
function storage(inicial) {
  var datos = {};
  for (var k in (inicial || {})) datos[k] = inicial[k];
  return {
    datos: datos,
    getItem: function (c) { return Object.prototype.hasOwnProperty.call(datos, c) ? datos[c] : null; },
    setItem: function (c, v) { datos[c] = String(v); }
  };
}

// Un storage que lanza en todo, como Safari en modo privado o Chrome con
// las cookies bloqueadas.
function storageRoto() {
  return {
    getItem: function () { throw new Error('SecurityError'); },
    setItem: function () { throw new Error('QuotaExceededError'); }
  };
}

function con(valor) {
  var o = {};
  o[a.CLAVE] = typeof valor === 'string' ? valor : JSON.stringify(valor);
  return storage(o);
}

var PUBLICIDAD = ['ad_storage', 'ad_user_data', 'ad_personalization'];

console.log('analitica.js');

// ── leerConsentimiento ──────────────────────────────────────────────
prueba('sin decisión guardada devuelve null', function () {
  assert.strictEqual(a.leerConsentimiento(storage()), null);
});

prueba('sin storage devuelve null', function () {
  assert.strictEqual(a.leerConsentimiento(null), null);
});

prueba('una aceptación guardada se lee como aceptada', function () {
  var r = a.leerConsentimiento(con({ v: 1, analitica: true, fecha: '2026-10-23T12:00:00.000Z' }));
  assert.deepStrictEqual(r, { analitica: true, fecha: '2026-10-23T12:00:00.000Z' });
});

prueba('un rechazo guardado se lee como rechazo (y no como "sin decidir")', function () {
  var r = a.leerConsentimiento(con({ v: 1, analitica: false, fecha: '2026-10-23T12:00:00.000Z' }));
  assert.deepStrictEqual(r, { analitica: false, fecha: '2026-10-23T12:00:00.000Z' });
});

prueba('JSON corrupto devuelve null', function () {
  assert.strictEqual(a.leerConsentimiento(con('{"v":1,"analitica":tru')), null);
});

prueba('un JSON que no es objeto devuelve null', function () {
  assert.strictEqual(a.leerConsentimiento(con('true')), null);
  assert.strictEqual(a.leerConsentimiento(con('null')), null);
});

prueba('otra versión devuelve null (hay que volver a preguntar)', function () {
  assert.strictEqual(a.leerConsentimiento(con({ v: 2, analitica: true })), null);
  assert.strictEqual(a.leerConsentimiento(con({ analitica: true })), null);
});

prueba('una analitica que no es booleana devuelve null', function () {
  assert.strictEqual(a.leerConsentimiento(con({ v: 1, analitica: 'true' })), null);
  assert.strictEqual(a.leerConsentimiento(con({ v: 1, analitica: 1 })), null);
});

prueba('un storage que lanza devuelve null y no lanza', function () {
  assert.strictEqual(a.leerConsentimiento(storageRoto()), null);
});

// ── guardarConsentimiento ───────────────────────────────────────────
prueba('guarda la aceptación con versión y fecha, y se vuelve a leer igual', function () {
  var s = storage();
  var ahora = new Date('2026-10-23T15:30:00.000Z');
  assert.strictEqual(a.guardarConsentimiento(s, true, ahora), true);
  assert.deepStrictEqual(JSON.parse(s.datos[a.CLAVE]), { v: 1, analitica: true, fecha: '2026-10-23T15:30:00.000Z' });
  assert.deepStrictEqual(a.leerConsentimiento(s), { analitica: true, fecha: '2026-10-23T15:30:00.000Z' });
});

prueba('guarda el rechazo', function () {
  var s = storage();
  a.guardarConsentimiento(s, false, new Date('2026-10-23T15:30:00.000Z'));
  assert.strictEqual(a.leerConsentimiento(s).analitica, false);
});

prueba('solo un true estricto se guarda como aceptación', function () {
  var s = storage();
  a.guardarConsentimiento(s, 'true', new Date());
  assert.strictEqual(a.leerConsentimiento(s).analitica, false);
});

prueba('un storage que lanza devuelve false y no lanza', function () {
  assert.strictEqual(a.guardarConsentimiento(storageRoto(), true, new Date()), false);
  assert.strictEqual(a.guardarConsentimiento(null, true, new Date()), false);
});

// ── estadoConsentimiento ────────────────────────────────────────────
prueba('aceptar concede solo analytics_storage', function () {
  assert.deepStrictEqual(a.estadoConsentimiento(true), {
    analytics_storage: 'granted',
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied'
  });
});

prueba('rechazar deja todo denegado', function () {
  var e = a.estadoConsentimiento(false);
  assert.strictEqual(e.analytics_storage, 'denied');
});

prueba('ningún valor concede los tres de publicidad', function () {
  [true, false, 'true', 1, null, undefined, {}].forEach(function (v) {
    var e = a.estadoConsentimiento(v);
    PUBLICIDAD.forEach(function (p) { assert.strictEqual(e[p], 'denied', p + ' con ' + String(v)); });
  });
});

prueba('solo un true estricto concede analytics_storage', function () {
  ['true', 1, {}, null, undefined].forEach(function (v) {
    assert.strictEqual(a.estadoConsentimiento(v).analytics_storage, 'denied', String(v));
  });
});

// ── comandosIniciales ───────────────────────────────────────────────
var AHORA = new Date('2026-10-23T12:00:00.000Z');

prueba('sin decisión: default denegado con wait_for_update, js y config, sin update', function () {
  var c = a.comandosIniciales(null, AHORA);
  assert.deepStrictEqual(c.map(function (x) { return x[0] + (x[0] === 'consent' ? ' ' + x[1] : ''); }),
    ['consent default', 'js', 'config']);
  var def = c[0][2];
  assert.strictEqual(def.wait_for_update, 500);
  assert.strictEqual(def.analytics_storage, 'denied');
  PUBLICIDAD.forEach(function (p) { assert.strictEqual(def[p], 'denied', p); });
  assert.strictEqual(c[1][1], AHORA);
  assert.strictEqual(c[2][1], 'G-VQ42VL3F5T');
  assert.deepStrictEqual(c[2][2], {}, 'sin linker: los Términos no mencionan el _gl');
});

prueba('con aceptación guardada: el update va justo después del default y antes del config', function () {
  var c = a.comandosIniciales({ analitica: true, fecha: null }, AHORA);
  assert.deepStrictEqual(c[0].slice(0, 2), ['consent', 'default']);
  assert.deepStrictEqual(c[1], ['consent', 'update', a.estadoConsentimiento(true)]);
  assert.strictEqual(c[2][0], 'js');
  assert.strictEqual(c[3][0], 'config');
  assert.strictEqual(c.length, 4);
});

prueba('con rechazo guardado no hay update (sigue el default denegado)', function () {
  var c = a.comandosIniciales({ analitica: false, fecha: null }, AHORA);
  assert.strictEqual(c.filter(function (x) { return x[0] === 'consent'; }).length, 1);
});

prueba('el default nunca concede nada, ni con aceptación guardada', function () {
  var def = a.comandosIniciales({ analitica: true }, AHORA)[0][2];
  assert.strictEqual(def.analytics_storage, 'denied');
});

// ── fecha ───────────────────────────────────────────────────────────
prueba('guardar con una fecha inválida no lanza y guarda una fecha válida', function () {
  var s = storage();
  assert.strictEqual(a.guardarConsentimiento(s, true, new Date('no es fecha')), true);
  var f = JSON.parse(s.datos[a.CLAVE]).fecha;
  assert.ok(typeof f === 'string' && !isNaN(Date.parse(f)), f);
});

prueba('una fecha guardada ilegible se lee como null sin anular la decisión', function () {
  [123, { x: 1 }, 'ayer', null].forEach(function (f) {
    var r = a.leerConsentimiento(con({ v: 1, analitica: true, fecha: f }));
    assert.deepStrictEqual(r, { analitica: true, fecha: null }, JSON.stringify(f));
  });
});

// ── cookiesABorrar ──────────────────────────────────────────────────
prueba('borra _ga y _ga_<ID> sin dominio y en el host y cada dominio padre', function () {
  var r = a.cookiesABorrar('_ga=GA1.1.1; otra=1; _ga_VQ42VL3F5T=GS1', 'www.tapcar.cl');
  assert.deepStrictEqual(r, [
    '_ga=; Max-Age=0; path=/',
    '_ga=; Max-Age=0; path=/; domain=.www.tapcar.cl',
    '_ga=; Max-Age=0; path=/; domain=.tapcar.cl',
    '_ga_VQ42VL3F5T=; Max-Age=0; path=/',
    '_ga_VQ42VL3F5T=; Max-Age=0; path=/; domain=.www.tapcar.cl',
    '_ga_VQ42VL3F5T=; Max-Age=0; path=/; domain=.tapcar.cl'
  ]);
});

prueba('no toca cookies de nombre parecido ni devuelve nada sin _ga', function () {
  assert.deepStrictEqual(a.cookiesABorrar('_gat=1; x_ga=2; _gax=3', 'tapcar.cl'), []);
  assert.deepStrictEqual(a.cookiesABorrar('', 'tapcar.cl'), []);
  assert.deepStrictEqual(a.cookiesABorrar(undefined, undefined), []);
});

// ── iniciar(win) con un DOM falso ───────────────────────────────────
// Lo justo para que corra el código del navegador: elementos con hijos,
// clases, atributos y clics; un document.cookie que se comporta como un
// frasco (Max-Age=0 borra), y un ResizeObserver que registra qué observa.
function elemento(tag) {
  var el = {
    tagName: String(tag).toUpperCase(), childNodes: [], parentNode: null,
    className: '', hidden: false, offsetHeight: 80, atributos: {}, oyentes: {},
    enfocado: false
  };
  var props = {};
  el.style = {
    setProperty: function (k, v) { props[k] = v; },
    removeProperty: function (k) { delete props[k]; },
    getPropertyValue: function (k) { return props[k] || ''; }
  };
  el.classList = {
    add: function (c) { if (!this.contains(c)) el.className = (el.className + ' ' + c).trim(); },
    remove: function (c) { el.className = el.className.split(' ').filter(function (x) { return x && x !== c; }).join(' '); },
    contains: function (c) { return el.className.split(' ').indexOf(c) !== -1; }
  };
  el.setAttribute = function (k, v) { el.atributos[k] = String(v); };
  el.getAttribute = function (k) { return Object.prototype.hasOwnProperty.call(el.atributos, k) ? el.atributos[k] : null; };
  el.hasAttribute = function (k) { return Object.prototype.hasOwnProperty.call(el.atributos, k); };
  el.insertBefore = function (hijo, ref) {
    var i = ref ? el.childNodes.indexOf(ref) : -1;
    if (i === -1) el.childNodes.push(hijo); else el.childNodes.splice(i, 0, hijo);
    hijo.parentNode = el;
    return hijo;
  };
  el.appendChild = function (hijo) { return el.insertBefore(hijo, null); };
  Object.defineProperty(el, 'firstChild', { get: function () { return el.childNodes[0] || null; } });
  Object.defineProperty(el, 'nextSibling', {
    get: function () {
      if (!el.parentNode) return null;
      var hs = el.parentNode.childNodes;
      return hs[hs.indexOf(el) + 1] || null;
    }
  });
  el.addEventListener = function (tipo, fn) { (el.oyentes[tipo] = el.oyentes[tipo] || []).push(fn); };
  el.click = function () {
    var ev = { target: el, preventDefault: function () {} };
    for (var n = el; n; n = n.parentNode) (n.oyentes.click || []).forEach(function (fn) { fn(ev); });
  };
  el.focus = function () { el.enfocado = true; if (el.dueno) el.dueno.activeElement = el; };
  el.blur = function () { el.enfocado = false; };
  el.todos = function (pred) {
    var r = [];
    (function rec(n) { n.childNodes.forEach(function (h) { if (pred(h)) r.push(h); if (h.childNodes) rec(h); }); })(el);
    return r;
  };
  el.querySelector = function (sel) {
    if (sel.charAt(0) !== '.') throw new Error('selector no soportado: ' + sel);
    var c = sel.slice(1);
    return el.todos(function (h) { return h.classList && h.classList.contains(c); })[0] || null;
  };
  el.closest = function (sel) {
    var m = /^\[([\w-]+)\]$/.exec(sel);
    if (!m) throw new Error('selector no soportado: ' + sel);
    for (var n = el; n && n.hasAttribute; n = n.parentNode) if (n.hasAttribute(m[1])) return n;
    return null;
  };
  el.contains = function (otro) { for (var n = otro; n; n = n.parentNode) if (n === el) return true; return false; };
  return el;
}

function ventana(opciones) {
  opciones = opciones || {};
  var frasco = {};
  var observados = [];
  var doc = elemento('#document');
  doc.documentElement = elemento('html');
  // Los clics suben hasta document, donde escucha la delegación del pie.
  doc.appendChild(doc.documentElement);
  doc.head = elemento('head');
  doc.body = elemento('body');
  doc.documentElement.appendChild(doc.head);
  doc.documentElement.appendChild(doc.body);
  doc.createElement = function (t) { var e = elemento(t); e.dueno = doc; return e; };
  doc.createTextNode = function (t) { return { texto: t, childNodes: [], parentNode: null }; };
  doc.activeElement = doc.body;
  Object.defineProperty(doc, 'cookie', {
    get: function () { return Object.keys(frasco).map(function (k) { return k + '=' + frasco[k]; }).join('; '); },
    set: function (v) {
      var par = String(v).split(';')[0];
      var nombre = par.split('=')[0].trim();
      if (/max-age=0/i.test(v)) delete frasco[nombre];
      else frasco[nombre] = par.slice(nombre.length + 1);
    }
  });
  // Lo que hay en el body ANTES del script, como en las páginas reales.
  if (opciones.salto !== false) {
    var salto = elemento('a'); salto.className = 'skip-link'; doc.body.appendChild(salto);
  }
  var nav = elemento('header'); nav.className = 'nav'; doc.body.appendChild(nav);
  var pie = elemento('button'); pie.setAttribute('data-preferencias-cookies', ''); pie.dueno = doc;
  doc.body.appendChild(pie);
  (opciones.cookies || []).forEach(function (c) { doc.cookie = c; });
  var win = {
    document: doc,
    location: { hostname: 'tapcar.cl' },
    localStorage: opciones.storage || storage(),
    addEventListener: function () {},
    ResizeObserver: function (fn) { this.observe = function (el) { observados.push({ el: el, fn: fn }); }; }
  };
  win.observados = observados;
  win.pie = pie;
  return win;
}

function banners(win) {
  return win.document.body.todos(function (h) { return h.classList && h.classList.contains('cookies'); });
}
function consents(win) {
  return win.dataLayer.map(function (x) { return Array.prototype.slice.call(x); })
    .filter(function (x) { return x[0] === 'consent'; });
}
function botonDe(win, cual) {
  return win.document.body.todos(function (h) { return h.getAttribute && h.getAttribute('data-cookies') === cual; })[0];
}

prueba('iniciar dos veces no manda un segundo default ni deja un segundo banner', function () {
  var w = ventana();
  assert.strictEqual(a.iniciar(w), true);
  assert.strictEqual(a.iniciar(w), false);
  assert.strictEqual(consents(w).length, 1);
  assert.strictEqual(banners(w).length, 1);
  assert.strictEqual(w.document.head.childNodes.length, 1, 'un solo script de gtag');
});

prueba('sin decisión: banner visible justo después de "Saltar al contenido"', function () {
  var w = ventana();
  a.iniciar(w);
  var hs = w.document.body.childNodes;
  assert.strictEqual(hs[0].className, 'skip-link');
  assert.strictEqual(hs[1].className, 'cookies');
  assert.strictEqual(hs[1].hidden, false);
  assert.strictEqual(hs[1].getAttribute('role'), 'region');
  assert.ok(w.document.documentElement.classList.contains('con-cookies'));
  assert.strictEqual(w.document.documentElement.style.getPropertyValue('--cookies-alto'), '80px');
});

prueba('sin "Saltar al contenido", el banner queda primero en el body', function () {
  var w = ventana({ salto: false });
  a.iniciar(w);
  assert.strictEqual(w.document.body.childNodes[0].className, 'cookies');
});

prueba('el alto se mide con ResizeObserver sobre el banner', function () {
  var w = ventana();
  a.iniciar(w);
  assert.strictEqual(w.observados.length, 1);
  assert.strictEqual(w.observados[0].el, banners(w)[0]);
  banners(w)[0].offsetHeight = 120; // cargó la fuente web: el texto creció
  w.observados[0].fn();
  assert.strictEqual(w.document.documentElement.style.getPropertyValue('--cookies-alto'), '120px');
});

prueba('Rechazar guarda, manda update denegado, borra las _ga y oculta el banner', function () {
  var w = ventana({ cookies: ['_ga=GA1.1.1', '_ga_VQ42VL3F5T=GS1', 'otra=1'] });
  a.iniciar(w);
  botonDe(w, 'rechazar').click();
  assert.strictEqual(a.leerConsentimiento(w.localStorage).analitica, false);
  var ult = consents(w).pop();
  assert.strictEqual(ult[1], 'update');
  assert.strictEqual(ult[2].analytics_storage, 'denied');
  assert.strictEqual(w.document.cookie, 'otra=1');
  assert.strictEqual(banners(w)[0].hidden, true);
  assert.ok(!w.document.documentElement.classList.contains('con-cookies'));
  assert.strictEqual(w.document.documentElement.style.getPropertyValue('--cookies-alto'), '');
});

prueba('Aceptar guarda, concede analytics_storage y no borra cookies', function () {
  var w = ventana({ cookies: ['_ga=GA1.1.1'] });
  a.iniciar(w);
  botonDe(w, 'aceptar').click();
  assert.strictEqual(a.leerConsentimiento(w.localStorage).analitica, true);
  assert.strictEqual(consents(w).pop()[2].analytics_storage, 'granted');
  assert.strictEqual(w.document.cookie, '_ga=GA1.1.1');
  assert.strictEqual(banners(w)[0].hidden, true);
});

prueba('con aceptación guardada: sin banner y el update granted va tras el default', function () {
  var s = storage();
  a.guardarConsentimiento(s, true, new Date());
  var w = ventana({ storage: s });
  a.iniciar(w);
  assert.strictEqual(banners(w).length, 0);
  var c = consents(w);
  assert.deepStrictEqual(c.map(function (x) { return x[1]; }), ['default', 'update']);
  assert.strictEqual(c[1][2].analytics_storage, 'granted');
});

prueba('el botón del pie reabre el banner y le pasa el foco', function () {
  var s = storage();
  a.guardarConsentimiento(s, false, new Date());
  var w = ventana({ storage: s });
  a.iniciar(w);
  assert.strictEqual(banners(w).length, 0);
  w.pie.click();
  assert.strictEqual(banners(w).length, 1);
  assert.strictEqual(banners(w)[0].hidden, false);
  assert.strictEqual(w.document.activeElement, botonDe(w, 'rechazar'));
  botonDe(w, 'aceptar').click();
  assert.strictEqual(w.document.activeElement, w.pie, 'el foco vuelve al pie');
});

prueba('un localStorage que lanza no rompe iniciar: el banner aparece igual', function () {
  var w = ventana();
  Object.defineProperty(w, 'localStorage', { get: function () { throw new Error('SecurityError'); } });
  assert.strictEqual(a.iniciar(w), true);
  assert.strictEqual(banners(w)[0].hidden, false);
  botonDe(w, 'aceptar').click();
  assert.strictEqual(banners(w)[0].hidden, true);
});

console.log('');
console.log(corridas + ' pruebas, ' + fallos + ' fallo(s)');
process.exit(fallos ? 1 : 0);
