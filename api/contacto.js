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
