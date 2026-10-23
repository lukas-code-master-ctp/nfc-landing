/* ===================================================================
   TapCar — Analítica (Google Analytics 4 + modo de consentimiento v2)

   Un solo archivo compartido por las seis páginas, y no una copia
   incrustada en cada una: es lógica de consentimiento, y seis copias de
   esa lógica terminan diciendo cosas distintas.

   Qué hace, en orden:
     1. Arma `dataLayer` y `gtag`, y manda el `consent default` con todo
        DENEGADO antes de cargar Google. En ese estado gtag no escribe
        cookies: manda señales sin identificador que GA usa para modelar.
     2. Si la persona ya había aceptado, manda el `consent update` a
        granted JUSTO después del default y antes del `config`: si fuera
        después del `config`, la primera página vista de cada visita
        saldría sin cookie y GA la contaría como una visita nueva.
     3. Carga gtag.js (async) y, si no hay decisión guardada, muestra el
        banner. Cualquier `[data-preferencias-cookies]` lo vuelve a abrir.

   Los tres permisos de publicidad (`ad_storage`, `ad_user_data`,
   `ad_personalization`) van SIEMPRE denegados, también al aceptar: no
   hacemos publicidad y los Términos lo prometen.

   ES5 a propósito (var, function), como el JS inline del sitio: no hay
   bundler que lo traduzca. Además se puede `require` desde Node para
   tools/test_analitica.js: la parte del navegador vive en `iniciar(win)`,
   que solo se llama sola cuando existe `window`, y los tests la llaman
   con un DOM falso.
   =================================================================== */
(function () {
  'use strict';

  var ID = 'G-VQ42VL3F5T';
  var CLAVE = 'tapcar-consentimiento';
  // Versión del formato guardado. Si algún día cambia lo que se pregunta
  // (por ejemplo, otra herramienta), se sube y todos vuelven a decidir:
  // una aceptación vieja no puede valer para algo que no se le mostró.
  var VERSION = 1;

  // ── Funciones puras (se prueban en Node) ─────────────────────────

  // Una fecha usable: un Date cuyo tiempo no es NaN. `new Date('x')` es
  // instancia de Date pero inválida, y su toISOString() LANZA.
  function fechaValida(f) {
    return f instanceof Date && !isNaN(f.getTime());
  }

  // Devuelve { analitica: true|false, fecha } o null si no hay una
  // decisión válida. Null cubre todo lo que no sea una decisión explícita
  // de esta versión: ausente, JSON roto, otra versión, `analitica` que no
  // es booleano o un storage que lanza (Safari en modo privado, cookies
  // bloqueadas). Ante la duda se vuelve a preguntar y gtag sigue
  // denegado: nunca se concede por un dato que no se pudo leer.
  // Una `fecha` ilegible no anula la decisión (la decisión es lo que
  // importa), pero se devuelve como null y no como vino: quien la lea
  // después no puede encontrarse un número o un objeto.
  function leerConsentimiento(storage) {
    var crudo;
    try {
      if (!storage) return null;
      crudo = storage.getItem(CLAVE);
    } catch (e) {
      return null;
    }
    if (typeof crudo !== 'string' || !crudo) return null;
    var dato;
    try {
      dato = JSON.parse(crudo);
    } catch (e) {
      return null;
    }
    if (!dato || typeof dato !== 'object') return null;
    if (dato.v !== VERSION) return null;
    if (typeof dato.analitica !== 'boolean') return null;
    var fecha = typeof dato.fecha === 'string' && !isNaN(Date.parse(dato.fecha)) ? dato.fecha : null;
    return { analitica: dato.analitica, fecha: fecha };
  }

  // Guarda la decisión. Devuelve true si quedó escrita. Si el storage
  // lanza, devuelve false y no pasa nada más: la decisión vale para esta
  // página y el banner vuelve a aparecer en la siguiente, que es mejor
  // que romper la página o asumir un sí. La fecha se valida ANTES de
  // armar el dato: con un Date inválido, toISOString() lanzaría fuera del
  // try y el clic en Aceptar/Rechazar no cerraría el banner.
  function guardarConsentimiento(storage, analitica, ahora) {
    var dato = {
      v: VERSION,
      analitica: analitica === true,
      fecha: (fechaValida(ahora) ? ahora : new Date()).toISOString()
    };
    try {
      if (!storage) return false;
      storage.setItem(CLAVE, JSON.stringify(dato));
      return true;
    } catch (e) {
      return false;
    }
  }

  // El estado de consentimiento que corresponde a una decisión. Solo
  // `analitica === true` (estricto) concede: un "true" en texto o un 1 no
  // cuentan. Publicidad, siempre denegada.
  function estadoConsentimiento(analitica) {
    return {
      analytics_storage: analitica === true ? 'granted' : 'denied',
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied'
    };
  }

  // Los comandos de gtag que van al cargar, en el orden en que deben ir.
  // Separado de la ejecución para poder probar el ORDEN en Node, que es
  // lo que se rompe fácil (un update después del config pierde la
  // primera página vista).
  function comandosIniciales(guardado, ahora) {
    var porDefecto = estadoConsentimiento(false);
    // wait_for_update: cuánto espera gtag a un `consent update` asíncrono
    // (una CMP o un script que decide tarde) antes de mandar el primer
    // hit. NO cubre al visitante nuevo: en su primera visita no hay
    // decisión hasta que toca el banner, así que su primer page_view sale
    // siempre denegado y sin cookie (modo avanzado), por mucho que se
    // alargue el margen. Con una decisión guardada tampoco hace falta: el
    // update va sincrónico en la línea siguiente.
    porDefecto.wait_for_update = 500;
    var cmds = [['consent', 'default', porDefecto]];
    if (guardado && guardado.analitica === true) {
      cmds.push(['consent', 'update', estadoConsentimiento(true)]);
    }
    cmds.push(['js', fechaValida(ahora) ? ahora : new Date()]);
    // Sin linker a app.tapcar.cl a propósito: con la analítica aceptada,
    // el linker le agrega a cada enlace a la app un `_gl` con el
    // identificador de GA, que la app hoy no lee y que los Términos no
    // mencionan. Se agrega el día que la app tenga el mismo tag, junto con
    // la frase en los Términos.
    cmds.push(['config', ID, {}]);
    return cmds;
  }

  // Las asignaciones a document.cookie que borran las cookies de GA
  // (`_ga` y `_ga_<ID>`) presentes en `cookies`. Se borran sin dominio y
  // en el host y cada dominio padre, porque GA las pone en el dominio más
  // alto que puede (.tapcar.cl) y una cookie solo se borra con el mismo
  // dominio con que se creó. Un nombre parecido (`_gat`, `x_ga`) no se toca.
  function cookiesABorrar(cookies, hostname) {
    var nombres = [];
    var partes = String(cookies || '').split(';');
    for (var j = 0; j < partes.length; j++) {
      var nombre = partes[j].split('=')[0].replace(/^\s+|\s+$/g, '');
      if ((nombre === '_ga' || nombre.indexOf('_ga_') === 0) && nombres.indexOf(nombre) === -1) nombres.push(nombre);
    }
    var dominios = [''];
    var trozos = String(hostname || '').split('.');
    for (var k = 0; k < trozos.length - 1; k++) dominios.push('; domain=.' + trozos.slice(k).join('.'));
    var asignaciones = [];
    for (var n = 0; n < nombres.length; n++) {
      for (var d = 0; d < dominios.length; d++) {
        asignaciones.push(nombres[n] + '=; Max-Age=0; path=/' + dominios[d]);
      }
    }
    return asignaciones;
  }

  // ── Navegador ────────────────────────────────────────────────────
  // Todo lo que toca window/document. Recibe la ventana por parámetro
  // para que tools/test_analitica.js la pueda correr con un DOM falso.
  function iniciar(win) {
    var doc = win.document;
    // Si el script quedara incluido dos veces, el segundo no debe mandar
    // otro default denegado encima de un update concedido, ni dejar un
    // segundo banner.
    if (win.__tapcarAnalitica) return false;
    win.__tapcarAnalitica = true;

    // Acceder a `window.localStorage` ya puede lanzar (cookies bloqueadas
    // en Chrome), así que se pide dentro de un try y no en cada uso.
    var almacen = null;
    try { almacen = win.localStorage; } catch (e) { almacen = null; }

    win.dataLayer = win.dataLayer || [];
    // `arguments` y no un arreglo: gtag.js solo reconoce los comandos que
    // llegan como objeto arguments.
    win.gtag = win.gtag || function () { win.dataLayer.push(arguments); };

    var guardado = leerConsentimiento(almacen);
    var iniciales = comandosIniciales(guardado, new Date());
    for (var i = 0; i < iniciales.length; i++) win.gtag.apply(win, iniciales[i]);

    // Si Google está bloqueado (adblock, red), el script simplemente no
    // carga: dataLayer se queda como cola y la página sigue igual.
    var tag = doc.createElement('script');
    tag.async = true;
    tag.src = 'https://www.googletagmanager.com/gtag/js?id=' + ID;
    (doc.head || doc.documentElement).appendChild(tag);

    // ── Banner ─────────────────────────────────────────────────────
    // Se crea por DOM y no va en el HTML de las páginas: así existe una
    // sola versión del texto y quien no tiene JavaScript (y por lo tanto
    // tampoco GA) no ve un aviso que no aplica.
    var banner = null;
    var quienAbrio = null;
    var raiz = doc.documentElement;

    function boton(etiqueta, analitica) {
      var btn = doc.createElement('button');
      btn.type = 'button';
      btn.className = 'btn btn--secondary btn--md cookies__btn';
      btn.setAttribute('data-cookies', analitica ? 'aceptar' : 'rechazar');
      btn.appendChild(doc.createTextNode(etiqueta));
      btn.addEventListener('click', function () { decidir(analitica); });
      return btn;
    }

    function crearBanner() {
      var b = doc.createElement('div');
      b.className = 'cookies';
      b.setAttribute('role', 'region');
      b.setAttribute('aria-label', 'Aviso de cookies');
      b.hidden = true;

      var inner = doc.createElement('div');
      inner.className = 'cookies__inner container';

      var texto = doc.createElement('p');
      texto.className = 'cookies__texto';
      texto.appendChild(doc.createTextNode(
        'Usamos cookies de Google Analytics para saber qué partes del sitio sirven. Puedes aceptarlas o rechazarlas. '
      ));
      var mas = doc.createElement('a');
      mas.className = 'cookies__mas';
      mas.href = '/terminos/#cookies';
      mas.appendChild(doc.createTextNode('Más información'));
      texto.appendChild(mas);

      // Los dos botones con la MISMA clase: mismo tamaño, mismo color,
      // mismo peso. Rechazar no puede costar más que aceptar (patrón
      // oscuro).
      var acciones = doc.createElement('div');
      acciones.className = 'cookies__acciones';
      acciones.appendChild(boton('Rechazar', false));
      acciones.appendChild(boton('Aceptar', true));

      inner.appendChild(texto);
      inner.appendChild(acciones);
      b.appendChild(inner);

      // Al PRINCIPIO del body (tras "Saltar al contenido" si existe) y no
      // al final: con teclado o lector de pantalla se encuentra de
      // inmediato, y no después de recorrer la página entera (23 a 28
      // Tab). Visualmente da igual: es position: fixed abajo.
      var salto = doc.body.querySelector('.skip-link');
      var antesDe = salto && salto.parentNode === doc.body ? salto.nextSibling : doc.body.firstChild;
      doc.body.insertBefore(b, antesDe);

      // El alto cambia cuando carga la fuente web (Geist) o cambia el
      // ancho; ResizeObserver lo ve en ambos casos. El resize de la
      // ventana queda de respaldo para navegadores sin ResizeObserver.
      if (typeof win.ResizeObserver === 'function') {
        try { new win.ResizeObserver(ajustarEspacio).observe(b); } catch (e) { /* respaldo: resize */ }
      }
      return b;
    }

    // Mientras el banner está visible, la página reserva abajo su alto
    // real en --cookies-alto, sobre <html> y no sobre <body>, porque lo
    // usan las dos: el padding-bottom del body (el último CTA no queda
    // tapado al llegar al fondo) y el scroll-padding-bottom del html (al
    // avanzar con Tab, el navegador desplaza el elemento con foco para
    // que no quede debajo de la franja fija; WCAG 2.4.11).
    function ajustarEspacio() {
      if (!banner || banner.hidden) return;
      raiz.style.setProperty('--cookies-alto', banner.offsetHeight + 'px');
    }

    function mostrarBanner() {
      if (!banner) banner = crearBanner();
      banner.hidden = false;
      raiz.classList.add('con-cookies');
      ajustarEspacio();
    }

    function ocultarBanner() {
      if (!banner) return;
      banner.hidden = true;
      raiz.classList.remove('con-cookies');
      raiz.style.removeProperty('--cookies-alto');
    }

    function decidir(analitica) {
      guardarConsentimiento(almacen, analitica, new Date());
      win.gtag('consent', 'update', estadoConsentimiento(analitica));
      // El update a denied hace que gtag deje de escribir cookies, pero
      // las que ya estaban (si antes había aceptado) se quedarían hasta 2
      // años.
      if (!analitica) {
        var borrar = cookiesABorrar(doc.cookie, win.location && win.location.hostname);
        for (var c = 0; c < borrar.length; c++) doc.cookie = borrar[c];
      }
      ocultarBanner();
      // El botón con el foco acaba de desaparecer. Si el banner lo abrió
      // el pie, el foco vuelve a ese botón para que el teclado no salte
      // al inicio de la página; si apareció solo al cargar, se suelta
      // (queda en el body).
      if (quienAbrio && doc.body.contains(quienAbrio)) {
        quienAbrio.focus();
      } else if (doc.activeElement && doc.activeElement.blur) {
        doc.activeElement.blur();
      }
      quienAbrio = null;
    }

    if (!guardado) mostrarBanner();

    win.addEventListener('resize', ajustarEspacio);

    // Delegación en document: un solo listener para el botón del pie de
    // las seis páginas, y sirve aunque alguno se agregue después.
    doc.addEventListener('click', function (ev) {
      var t = ev.target;
      var abridor = t && t.closest ? t.closest('[data-preferencias-cookies]') : null;
      if (!abridor) return;
      ev.preventDefault();
      quienAbrio = abridor;
      mostrarBanner();
      // Abierto a pedido, el foco va al banner: si no, quien navega con
      // teclado o lector de pantalla no se entera de que apareció.
      var primero = banner.querySelector('.cookies__btn');
      if (primero) primero.focus();
    });
    return true;
  }

  // Exporta para tools/test_analitica.js. En el navegador `module` no
  // existe y esto no hace nada.
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
      ID: ID,
      CLAVE: CLAVE,
      VERSION: VERSION,
      leerConsentimiento: leerConsentimiento,
      guardarConsentimiento: guardarConsentimiento,
      estadoConsentimiento: estadoConsentimiento,
      comandosIniciales: comandosIniciales,
      cookiesABorrar: cookiesABorrar,
      iniciar: iniciar
    };
  }

  if (typeof window !== 'undefined' && typeof document !== 'undefined') iniciar(window);
})();
