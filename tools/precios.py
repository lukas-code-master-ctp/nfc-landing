# -*- coding: utf-8 -*-
"""Mantiene el sitio calzado con precios.json, la fuente unica de los precios.

Hace dos cosas distintas a proposito:

  --generar   Escribe las constantes de la calculadora en planes/index.html,
              entre los marcadores // <precios> y // </precios>. Eso es dato
              estructurado y se puede generar sin riesgo.

  (sin args)  Revisa. Busca en el sitio toda cifra con forma de precio y avisa
              si aparece alguna que precios.json no explica, o si falta alguna
              que deberia estar. Sale con codigo 1 si encuentra algo.

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

# El JS reescribe estos nodos en cada render: lo que diga el HTML ahi es un
# ejemplo para el valor inicial del slider, no una promesa. Revisarlo obligaria
# a reimplementar la aritmetica de la calculadora en Python, o sea a tener dos
# fuentes para la misma cuenta.
ESCRITOS_POR_JS = re.compile(
    r'data-(total|fineprint|formula|envio-part|save-amount|save-note'
    r'|nudge-total|nudge-amount|linea-label|linea-monto|bubble|scale-max)')

# Cifras con forma de precio. El ultimo caracter tiene que ser digito para no
# tragarse el punto que cierra la oracion.
PATRON = re.compile(r'\$\s?\d[\d.]*\d|\$\s?\d|UF\s\d+(?:,\d+)?|\d{1,3}%')

MARCA_INI = '      // <precios>'
MARCA_FIN = '      // </precios>'


def cargar():
    with io.open(os.path.join(RAIZ, 'precios.json'), encoding='utf-8') as f:
        return json.load(f)


def clp(n):
    return '$' + '{:,}'.format(int(round(n))).replace(',', '.')


def uf(n):
    # 0.5 -> "UF 0,5"   0.057 -> "UF 0,057"   sin ceros de relleno
    s = ('%f' % n).rstrip('0').rstrip('.')
    return 'UF ' + s.replace('.', ',')


def descuento(t):
    # Solo Flotas tiene descuento: Uso particular es solo anual desde el
    # 2026-10-20, asi que no hay precio mensual contra el cual compararlo.
    return int(round((1 - t['anio'] / (t['mes'] * 12.0)) * 100))


def esperados(p):
    """Todas las cifras que el sitio puede decir legitimamente.

    Uso particular: el $0 del plan gratis, el precio anual por vehiculo y los
    totales de 1 al maximo de vehiculos -- "2 autos son $10.000" es una cifra
    que el FAQ o un ejemplo pueden decir, y sale de multiplicar, no de una
    tabla aparte --, mas su despacho propio. Ya no hay mensual, descuento,
    ahorro ni la nota del redondeo: el plan es solo anual y nada se divide.

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
    pesos.add(envio['particular']['precio'])
    for tramo in envio['tramos']:
        pesos.add(tramo['precio'])

    for t in (flota['vehiculo'], flota['cuenta_conductor']):
        ufs.add(t['mes'])
        ufs.add(t['anio'])
        pct.add(descuento(t))

    return (set(clp(n) for n in pesos),
            set(uf(n) for n in ufs),
            set('%d%%' % n for n in pct))


def texto_visible(ruta, crudo):
    """Saca lo generado y lo que no es prosa, para no revisarlo dos veces.

    Lo recortado se reemplaza por lineas en blanco en vez de borrarse, para que
    el numero de linea que se reporta sea el del archivo y no el del recorte.
    """
    def blanquear(m):
        return chr(10) * m.group(0).count(chr(10))

    if ruta.endswith('.html'):
        crudo = re.sub(r'<style>.*?</style>', blanquear, crudo, flags=re.S)
        crudo = re.sub(r'<script type="application/ld\+json".*?</script>',
                       blanquear, crudo, flags=re.S)
        crudo = re.sub(re.escape(MARCA_INI) + r'.*?' + re.escape(MARCA_FIN),
                       blanquear, crudo, flags=re.S)
    return crudo


def revisar(p):
    ok_pesos, ok_ufs, ok_pct = esperados(p)
    conocidas = ok_pesos | ok_ufs | ok_pct
    ajenas = set(k for k in p.get('cifras_ajenas', {}) if not k.startswith('_'))
    problemas = []
    vistas = set()

    for ruta in REVISAR:
        fs = os.path.join(RAIZ, ruta)
        if not os.path.exists(fs):
            continue
        with io.open(fs, encoding='utf-8') as f:
            texto = texto_visible(ruta, f.read())
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
                if cifra in conocidas or cifra in ajenas:
                    vistas.add(cifra)
                else:
                    problemas.append(
                        '  %s:%d  %s  <- precios.json no explica esta cifra'
                        % (ruta, linea_n, cifra))

    # Solo se exige que aparezcan las canonicas: las tarifas que alguien tiene
    # que poder leer en el sitio sin mover un slider. Las derivadas (el total
    # de 7 vehiculos, el ahorro anual de Flotas) solo existen en tiempo de
    # ejecucion.
    canonicas = set([clp(p['planes']['particular']['vehiculo']['anio']),
                     clp(p['envio_chips']['particular']['precio'])])
    for tramo in p['envio_chips']['tramos']:
        canonicas.add(clp(tramo['precio']))
    flota = p['planes']['flota']
    for t in (flota['vehiculo'], flota['cuenta_conductor']):
        canonicas.add(uf(t['anio']))
    faltan = sorted(canonicas - vistas)
    return problemas, faltan


def bloque_js(p):
    """Las constantes de la calculadora, y nada mas que constantes.

    Uso particular no tiene `mes`: es solo anual. `gratis` es cuantos
    vehiculos cubre el plan gratis. ENVIO_PARTICULAR es un monto fijo (de 1 a
    10 chips cuesta lo mismo), asi que va como constante y no como funcion;
    envio() sigue siendo la de los tramos, que es la que usa Flotas.
    """
    part = p['planes']['particular']
    flota = p['planes']['flota']
    tramos = p['envio_chips']['tramos']

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
        '      var ENVIO_PARTICULAR = %d;' % p['envio_chips']['particular']['precio'],
        '      function envio(chips) {',
    ]
    for tramo in tramos[:-1]:
        lineas.append('        if (chips <= %d) return %d;'
                      % (tramo['hasta'], tramo['precio']))
    lineas.append('        return %d;' % tramos[-1]['precio'])
    lineas.append('      }')
    lineas.append(MARCA_FIN)
    return '\n'.join(lineas)


def generar(p):
    fs = os.path.join(RAIZ, 'planes/index.html')
    with io.open(fs, encoding='utf-8', newline='') as f:
        html = f.read()
    salto = '\r\n' if '\r\n' in html else '\n'
    patron = re.compile(re.escape(MARCA_INI) + r'.*?' + re.escape(MARCA_FIN), re.S)
    if not patron.search(html):
        print('ERROR: no encontre los marcadores // <precios> ... // </precios> '
              'en planes/index.html')
        return 1
    nuevo = patron.sub(lambda _: bloque_js(p).replace('\n', salto), html, count=1)
    if nuevo == html:
        print('planes/index.html ya estaba al dia')
        return 0
    with io.open(fs, 'w', encoding='utf-8', newline='') as f:
        f.write(nuevo)
    print('planes/index.html: constantes de la calculadora regeneradas')
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
        print('Cifras de precios.json que no aparecen en ninguna parte del sitio:')
        for x in faltan:
            print('  %s' % x)
    if not problemas and not faltan:
        print('OK: el sitio calza con precios.json')
        return 0
    return 1


if __name__ == '__main__':
    sys.exit(main())
