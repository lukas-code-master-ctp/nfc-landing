# -*- coding: utf-8 -*-
"""Mantiene el sitio calzado con precios.json, la fuente unica de los precios.

Hace dos cosas distintas a proposito:

  --generar   Escribe las constantes de la calculadora en planes/index.html,
              entre los marcadores // <precios> y // </precios>, y las filas
              de la tabla de despacho por region, entre <!-- <envio-regiones> -->
              y <!-- </envio-regiones> -->. Eso es dato estructurado y se puede
              generar sin riesgo.

  (sin args)  Revisa. Busca en el sitio toda cifra con forma de precio y avisa
              si aparece alguna que precios.json no explica, o si falta alguna
              que deberia estar, o si un bloque generado quedo viejo. Sale con
              codigo 1 si encuentra algo.

Por que NO genera la prosa: las frases del FAQ y de los terminos llevan las
cifras metidas en oraciones. Un generador que las escriba produce copy peor y
un archivo fuente ilegible. Revisar atrapa el mismo error -- cambiaste un
numero y se te quedo uno viejo por ahi -- sin pretender escribir espanol.

Uso:
    python tools/precios.py              # revisa
    python tools/precios.py --generar    # reescribe las constantes del JS
"""
import io
import json
import os
import re
import sys

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# Archivos donde vive prosa con precios. Los generados no se revisan: el bloque
# JSON-LD y el <style> se excluyen mas abajo.
REVISAR = [
    'index.html',
    'planes/index.html',
    'como-funciona/index.html',
    'terminos/index.html',
    'legal/index.html',
    'socios/index.html',
    'llms.txt',
    'README.md',
]

# Nodos que el JS reescribe con un resultado que DEPENDE DEL SLIDER (o del
# toggle mensual/anual): lo que diga el HTML ahi es un ejemplo para el valor
# inicial, no una promesa. Revisarlo obligaria a reimplementar la aritmetica de
# la calculadora en Python, o sea a tener dos fuentes para la misma cuenta.
#
# Lo que el JS escribe pero NO depende del slider no va aca: `data-envio-desde`
# (el "desde" del despacho en Uso particular) es una constante, la misma con 1
# o con 10 chips, y el HTML la dice como promesa. Si estuviera en esta lista,
# un $3.000 viejo en esa linea pasaria sin aviso.
ESCRITOS_POR_JS = re.compile(
    r'data-(total|fineprint|formula|save-amount|save-note'
    r'|nudge-total|nudge-amount|linea-label|linea-monto|bubble|scale-max)')

# Cifras con forma de precio. El ultimo caracter tiene que ser digito para no
# tragarse el punto que cierra la oracion.
PATRON = re.compile(r'\$\s?\d[\d.]*\d|\$\s?\d|UF\s\d+(?:,\d+)?|\d{1,3}%')

# Cifras ancladas a SU nodo. Que una cifra aparezca en el archivo no prueba
# que este donde se promete: $5.000 es tambien el tramo de 3 a 50 chips y
# $10.000 el total de 2 vehiculos, asi que con la tarjeta de TapCar+
# diciendo $10.000 (o sin precio) el archivo seguia "teniendo" las dos cifras
# y la revision pasaba. Lo mismo con el "desde" del despacho: $3.800 (el
# desde de 51 a 100 chips) y cualquier precio de region son cifras validas en
# el archivo, pero en la nota de Uso particular solo cabe el desde de 1 a 50.
# Cada ancla es (archivo, que es, regex con UN grupo que captura
# el texto del nodo, funcion que da la cifra esperada desde precios.json).
# La regex tiene que encontrar el nodo EXACTAMENTE una vez: cero es que alguien
# cambio la clase o el atributo (y el ancla dejo de mirar), dos es ambiguo.
ANCLAS = [
    ('planes/index.html', 'monto de la tarjeta Gratis',
     r'<article class="card plan-card">.*?<span class="plan-card__monto">([^<]*)</span>',
     lambda p: clp(0)),
    ('planes/index.html', 'monto de la tarjeta TapCar+',
     r'<article class="card plan-card plan-card--pro">.*?<span class="plan-card__monto">([^<]*)</span>',
     lambda p: clp(p['planes']['particular']['vehiculo']['anio'])),
    ('planes/index.html', 'despacho de Uso particular [data-envio-desde]',
     r'<[^>]*\bdata-envio-desde\b[^>]*>([^<]*)<',
     lambda p: clp(envio_desde(p, 0))),
]

MARCA_INI = '      // <precios>'
MARCA_FIN = '      // </precios>'
# Las filas de la tabla de despacho por region (planes/index.html). Van entre
# marcadores de comentario HTML, con la sangria del <tbody>.
TABLA_INI = '              <!-- <envio-regiones> -->'
TABLA_FIN = '              <!-- </envio-regiones> -->'


def cargar():
    with io.open(os.path.join(RAIZ, 'precios.json'), encoding='utf-8') as f:
        return json.load(f)


def clp(n):
    return '$' + '{:,}'.format(int(round(n))).replace(',', '.')


def uf(n):
    # 0.5 -> "UF 0,5"   0.057 -> "UF 0,057"   sin ceros de relleno
    s = ('%f' % n).rstrip('0').rstrip('.')
    return 'UF ' + s.replace('.', ',')


def envio_desde(p, i):
    """El "desde" del despacho para la talla i (0 = XS, 1 = S): el precio de la
    region mas barata. Se calcula de la tabla, no se escribe aparte, para que
    el "desde" que promete el sitio no pueda quedar por debajo de lo que de
    verdad se cobra en alguna region (ni por encima de la mas barata)."""
    clave = p['envio_chips']['tallas'][i]['talla'].lower()
    return min(r[clave] for r in p['envio_chips']['regiones'])


def descuento(t):
    # Solo Flotas tiene descuento: Uso particular es solo anual desde el
    # 2026-10-20, asi que no hay precio mensual contra el cual compararlo.
    return int(round((1 - t['anio'] / (t['mes'] * 12.0)) * 100))


def esperados(p):
    """Todas las cifras que el sitio puede decir legitimamente.

    Uso particular: el $0 del plan gratis, el precio anual por vehiculo y los
    totales de 1 al maximo de vehiculos -- "2 autos son $10.000" es una cifra
    que el FAQ o un ejemplo pueden decir, y sale de multiplicar, no de una
    tabla aparte. Ya no hay mensual, descuento, ahorro ni la nota del
    redondeo: el plan es solo anual y nada se divide.

    Despacho: cualquier precio de la tabla por region, en cualquiera de sus
    tallas ("a Magallanes cuesta $8.300" es legitimo). Los "desde" son el
    minimo de cada talla, asi que ya estan entre ellos.

    Flotas: sus tarifas en UF, mensual y anual, y el porcentaje de descuento
    del anual, que se calcula y no se escribe a mano.
    """
    part = p['planes']['particular']
    flota = p['planes']['flota']
    envio = p['envio_chips']
    pesos, ufs, pct = set(), set(), set()

    pesos.add(0)                                # la tarjeta "Gratis"
    anio = part['vehiculo']['anio']
    for n in range(part['vehiculos']['min'], part['vehiculos']['max'] + 1):
        pesos.add(n * anio)                     # incluye el 1 x $5.000
    for region in envio['regiones']:
        for talla in envio['tallas']:
            pesos.add(region[talla['talla'].lower()])

    for t in (flota['vehiculo'], flota['cuenta_conductor']):
        ufs.add(t['mes'])
        ufs.add(t['anio'])
        pct.add(descuento(t))

    return (set(clp(n) for n in pesos),
            set(uf(n) for n in ufs),
            set('%d%%' % n for n in pct))


def blanquear(m):
    return chr(10) * m.group(0).count(chr(10))


def texto_visible(ruta, crudo):
    """Saca lo generado y lo que no es prosa, para no revisarlo dos veces.

    Devuelve (cabeza, cuerpo): dos textos del MISMO largo en lineas que el
    archivo, cada uno con la otra parte en blanco. Lo recortado se reemplaza
    por lineas en blanco en vez de borrarse, para que el numero de linea que
    se reporta sea el del archivo y no el del recorte.

    El <head> va aparte a proposito. Sus cifras SI se revisan (un $ viejo en
    la meta description es igual de falso que en el cuerpo, y es lo que sale
    en Google), pero NO cuentan como "el archivo dice esta cifra": el title y
    las metas no los ve nadie que este en la pagina, asi que no pueden cubrir
    a la tarjeta de precio que se borro. Para los .txt/.md todo es cuerpo.
    """
    if not ruta.endswith('.html'):
        return '', crudo
    crudo = re.sub(r'<style>.*?</style>', blanquear, crudo, flags=re.S)
    crudo = re.sub(r'<script type="application/ld\+json".*?</script>',
                   blanquear, crudo, flags=re.S)
    crudo = re.sub(re.escape(MARCA_INI) + r'.*?' + re.escape(MARCA_FIN),
                   blanquear, crudo, flags=re.S)
    # Las filas de la tabla tampoco cuentan: las escribe --generar desde
    # precios.json (revisar_generados() comprueba que esten al dia), y si
    # contaran, la tabla sola "diria" siempre los dos desde y la canonica no
    # avisaria cuando alguien borra el desde de la prosa.
    crudo = re.sub(re.escape(TABLA_INI) + r'.*?' + re.escape(TABLA_FIN),
                   blanquear, crudo, flags=re.S)
    m = re.search(r'<head\b.*?</head>', crudo, flags=re.S)
    if not m:
        return '', crudo
    antes, head, despues = crudo[:m.start()], m.group(0), crudo[m.end():]
    en_blanco = blanquear(m)
    cabeza = re.sub(r'[^\n]', '', antes) + head + re.sub(r'[^\n]', '', despues)
    cuerpo = antes + en_blanco + despues
    return cabeza, cuerpo


def revisar_anclas(p):
    """Cada ancla: su nodo existe una sola vez y dice exactamente su cifra."""
    problemas = []
    for ruta, que, regex, esperada in ANCLAS:
        with io.open(os.path.join(RAIZ, ruta), encoding='utf-8') as f:
            _, cuerpo = texto_visible(ruta, f.read())
        hallados = re.findall(regex, cuerpo, flags=re.S)
        if len(hallados) != 1:
            problemas.append('  %s  %s: el nodo aparece %d veces (tiene que '
                             'ser 1; si cambiaste la clase, actualiza ANCLAS)'
                             % (ruta, que, len(hallados)))
            continue
        dice = ' '.join(hallados[0].split()).replace('$ ', '$')
        if dice != esperada(p):
            problemas.append('  %s  %s dice "%s" y precios.json dice "%s"'
                             % (ruta, que, dice, esperada(p)))
    return problemas


def revisar(p):
    ok_pesos, ok_ufs, ok_pct = esperados(p)
    conocidas = ok_pesos | ok_ufs | ok_pct
    ajenas = set(k for k in p.get('cifras_ajenas', {}) if not k.startswith('_'))
    problemas = []
    vistas = {}     # ruta -> cifras vistas en ESE archivo

    for ruta in REVISAR:
        fs = os.path.join(RAIZ, ruta)
        if not os.path.exists(fs):
            continue
        with io.open(fs, encoding='utf-8') as f:
            cabeza, cuerpo = texto_visible(ruta, f.read())
        for es_cabeza, texto in ((True, cabeza), (False, cuerpo)):
            for linea_n, linea in enumerate(texto.split('\n'), 1):
                # Si el JS reescribe la linea, su cifra es un ejemplo del valor
                # inicial del slider, no una promesa del sitio.
                if ESCRITOS_POR_JS.search(linea):
                    continue
                for m in re.finditer(PATRON, linea):
                    cifra = m.group(0).replace('$ ', '$')
                    # El README es documentacion: sus porcentajes pueden ser de
                    # cualquier cosa, como un text-size-adjust.
                    if cifra.endswith('%') and ruta == 'README.md':
                        continue
                    if cifra not in conocidas and cifra not in ajenas:
                        problemas.append(
                            '  %s:%d  %s  <- precios.json no explica esta cifra%s'
                            % (ruta, linea_n, cifra,
                               ' (en el <head>)' if es_cabeza else ''))
                    elif not es_cabeza:
                        # Solo el cuerpo cuenta como "el archivo la dice".
                        vistas.setdefault(ruta, set()).add(cifra)

    # Solo se exige que aparezcan las canonicas: las tarifas que alguien tiene
    # que poder leer en el sitio sin mover un slider. Las derivadas (el total
    # de 7 vehiculos, el ahorro anual de Flotas) solo existen en tiempo de
    # ejecucion.
    #
    # Y se exigen EN SU ARCHIVO, no en el sitio entero. Con un conjunto global,
    # borrar todos los $5.000 de Planes no avisaba: $5.000 es tambien el tramo
    # de 3 a 50 chips, y cualquier otro archivo (llms.txt, el FAQ) lo seguia
    # diciendo.
    #
    # Y aun en su archivo no basta: las tres cifras que mas importan (los dos
    # montos de las tarjetas y el despacho) se exigen en SU nodo, ver ANCLAS.
    faltan = []
    for ruta, cifras in sorted(canonicas_por_archivo(p).items()):
        for cifra in sorted(cifras - vistas.get(ruta, set())):
            faltan.append('%s  %s' % (ruta, cifra))
    return problemas + revisar_anclas(p) + revisar_generados(p), faltan


def revisar_generados(p):
    """Los bloques generados de planes/index.html calzan con precios.json.

    Sin esto, editar precios.json y olvidar el --generar dejaba la tabla por
    region con los precios viejos y la revision en OK, porque las filas no se
    leen como prosa (ver texto_visible)."""
    with io.open(os.path.join(RAIZ, 'planes/index.html'), encoding='utf-8') as f:
        html = f.read()
    problemas = []
    for ini, fin, esperado in BLOQUES(p):
        m = re.search(re.escape(ini) + r'.*?' + re.escape(fin), html, flags=re.S)
        if not m:
            problemas.append('  planes/index.html: no encontre los marcadores %s ... %s'
                             % (ini.strip(), fin.strip()))
        elif m.group(0) != esperado:
            problemas.append('  planes/index.html: el bloque %s no calza con '
                             'precios.json (corre --generar)' % ini.strip())
    return problemas


def canonicas_por_archivo(p):
    """Que cifras tiene que decir cada archivo, leidas como promesa.

    Planes es la pagina de precios: tiene que mostrar el $0 del plan gratis, el
    precio anual por vehiculo, los dos "desde" del despacho (de 1 a 50 chips y
    de 51 a 100; la nota de Uso particular y el FAQ del chip), las dos tarifas
    anuales de Flotas en UF y el descuento del anual (el toggle). Todo eso sin
    mover un slider ni abrir la tabla por region, que no cuenta (es generada).
    ¿Como funciona? dice los dos "desde" del despacho en el paso del chip.
    """
    part = p['planes']['particular']
    flota = p['planes']['flota']
    desde = set(clp(envio_desde(p, i))
                for i in range(len(p['envio_chips']['tallas'])))
    planes = set([clp(0), clp(part['vehiculo']['anio'])]) | desde
    for t in (flota['vehiculo'], flota['cuenta_conductor']):
        planes.add(uf(t['anio']))
        planes.add('%d%%' % descuento(t))
    # El paso del chip de ¿Como funciona? promete los "desde" del despacho.
    return {'planes/index.html': planes,
            'como-funciona/index.html': desde}


def bloque_js(p):
    """Las constantes de la calculadora, y nada mas que constantes.

    Uso particular no tiene `mes`: es solo anual. `gratis` es cuantos
    vehiculos cubre el plan gratis. La calculadora no sabe la region de
    destino, asi que del despacho solo lleva los "desde": ENVIO_DESDE (el de
    1 a 50 chips, la nota de Uso particular) y envioDesde(chips), el de la
    talla que toca, o null sobre la ultima talla (se cotiza), que usa Flotas.
    """
    part = p['planes']['particular']
    flota = p['planes']['flota']
    tallas = p['envio_chips']['tallas']

    lineas = [
        MARCA_INI + '  Generado por tools/precios.py desde precios.json.',
        '      // No editar a mano: el proximo --generar lo pisa.',
        '      var PLANES = {',
        '        particular: { gratis: %d, veh: { anio: %d }, min: %d, max: %d },'
        % (part['gratis']['vehiculos'], part['vehiculo']['anio'],
           part['vehiculos']['min'], part['vehiculos']['max']),
        '        flota: {',
        '          veh: { mes: %s, anio: %s },'
        % (flota['vehiculo']['mes'], flota['vehiculo']['anio']),
        '          cuenta: { mes: %s, anio: %s },'
        % (flota['cuenta_conductor']['mes'], flota['cuenta_conductor']['anio']),
        '          min: %d, max: %d' % (flota['vehiculos']['min'],
                                        flota['vehiculos']['max']),
        '        }',
        '      };',
        '      var ENVIO_DESDE = %d;' % envio_desde(p, 0),
        '      function envioDesde(chips) {',
    ]
    for i, talla in enumerate(tallas):
        lineas.append('        if (chips <= %d) return %d;'
                      % (talla['hasta'], envio_desde(p, i)))
    lineas.append('        return null;')
    lineas.append('      }')
    lineas.append(MARCA_FIN)
    return '\n'.join(lineas)


def html_txt(s):
    return s.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')


def bloque_tabla(p):
    """Las filas de la tabla de despacho por region, en el orden de
    precios.json (de norte a sur). Una columna por talla."""
    envio = p['envio_chips']
    lineas = [TABLA_INI]
    for r in envio['regiones']:
        celdas = ''.join('<td>%s</td>' % clp(r[t['talla'].lower()])
                         for t in envio['tallas'])
        lineas.append('              <tr><th scope="row">%s</th>%s</tr>'
                      % (html_txt(r['nombre']), celdas))
    lineas.append(TABLA_FIN)
    return '\n'.join(lineas)


def BLOQUES(p):
    """(marca de inicio, marca de fin, contenido esperado) de cada bloque
    generado de planes/index.html."""
    return [(MARCA_INI, MARCA_FIN, bloque_js(p)),
            (TABLA_INI, TABLA_FIN, bloque_tabla(p))]


def generar(p):
    fs = os.path.join(RAIZ, 'planes/index.html')
    with io.open(fs, encoding='utf-8', newline='') as f:
        html = f.read()
    salto = '\r\n' if '\r\n' in html else '\n'
    nuevo = html
    for ini, fin, bloque in BLOQUES(p):
        patron = re.compile(re.escape(ini) + r'.*?' + re.escape(fin), re.S)
        if not patron.search(nuevo):
            print('ERROR: no encontre los marcadores %s ... %s en planes/index.html'
                  % (ini.strip(), fin.strip()))
            return 1
        nuevo = patron.sub(lambda _: bloque.replace('\n', salto), nuevo, count=1)
    if nuevo == html:
        print('planes/index.html ya estaba al dia')
        return 0
    with io.open(fs, 'w', encoding='utf-8', newline='') as f:
        f.write(nuevo)
    print('planes/index.html: constantes de la calculadora y tabla de despacho regeneradas')
    return 0


def main():
    p = cargar()
    if '--generar' in sys.argv:
        return generar(p)

    problemas, faltan = revisar(p)
    if problemas:
        print('Cifras que el sitio dice y precios.json no respalda:')
        for x in problemas:
            print(x)
    if faltan:
        print('Cifras de precios.json que faltan en el archivo donde corresponde:')
        for x in faltan:
            print('  %s' % x)
    if not problemas and not faltan:
        print('OK: el sitio calza con precios.json')
        return 0
    return 1


if __name__ == '__main__':
    sys.exit(main())
