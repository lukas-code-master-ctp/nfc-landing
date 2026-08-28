# -*- coding: utf-8 -*-
"""Regenera el JSON-LD (schema.org) de todas las páginas.

El schema se DERIVA del contenido visible: las preguntas del FAQ y los pasos
de "Cómo funciona" se leen del propio HTML. Así el marcado nunca promete algo
que la página no muestra, que es justo lo que penaliza Google.

Uso:  python tools/schema.py

Es idempotente: borra el bloque anterior (script[data-schema]) y escribe uno
nuevo. Hay que volver a correrlo cada vez que cambien el FAQ, los pasos o los
precios.
"""
import io
import json
import os
import re
from bs4 import BeautifulSoup

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SITIO = 'https://tapcar.cl'
ORG = SITIO + '/#organizacion'
WEB = SITIO + '/#sitio'
PROD = SITIO + '/#producto'

PAGINAS = [
    ('index.html', '/', 'Inicio'),
    ('como-funciona/index.html', '/como-funciona/', 'Cómo funciona'),
    ('legal/index.html', '/legal/', 'Validez legal'),
    ('planes/index.html', '/planes/', 'Planes y precios'),
    ('terminos/index.html', '/terminos/', 'Términos y Condiciones'),
]


def limpio(el):
    return re.sub(r'\s+', ' ', el.get_text(' ', strip=True)).strip()


def organizacion():
    return {
        '@type': 'Organization',
        '@id': ORG,
        'name': 'TapCar',
        'legalName': 'IMPULSE AI SpA',
        'taxID': '78.479.762-7',
        'url': SITIO + '/',
        'email': 'contacto@tapcar.cl',
        'logo': {
            '@type': 'ImageObject',
            'url': SITIO + '/assets/og-tapcar.png',
            'width': 1200,
            'height': 630,
        },
        'areaServed': {'@type': 'Country', 'name': 'Chile'},
        'contactPoint': {
            '@type': 'ContactPoint',
            'email': 'contacto@tapcar.cl',
            'contactType': 'customer support',
            'availableLanguage': ['Spanish'],
        },
    }


def sitio_web():
    return {
        '@type': 'WebSite',
        '@id': WEB,
        'url': SITIO + '/',
        'name': 'TapCar',
        'inLanguage': 'es-CL',
        'publisher': {'@id': ORG},
    }


def producto():
    # Los dos planes que publica /planes/. El precio es POR VEHÍCULO y eso se
    # dice en el nombre y la descripción, porque schema.org no tiene una forma
    # limpia de expresar "por unidad de X al mes".
    return {
        '@type': 'SoftwareApplication',
        '@id': PROD,
        'name': 'TapCar',
        'url': SITIO + '/',
        'applicationCategory': 'BusinessApplication',
        'applicationSubCategory': 'Gestión de documentación vehicular',
        'operatingSystem': 'Navegador web (sin instalación)',
        'inLanguage': 'es-CL',
        'description': (
            'Plataforma chilena para tener la documentación de tus vehículos al día '
            'y mostrarla en una fiscalización con un toque a un chip NFC. Guarda '
            'Permiso de Circulación, Revisión Técnica, SOAP, Certificado de Gases y '
            'Padrón con su fecha de vencimiento, avisa por correo antes de que '
            'venzan, y registra con un PIN quién usa cada vehículo y en qué estado '
            'lo entrega.'
        ),
        'featureList': [
            'Documentos del vehículo con fecha de vencimiento y estado: Vigente, Por vencer o Vencido',
            'Ficha pública de solo lectura que se abre con un chip NFC, sin instalar aplicaciones',
            'Recordatorios por correo antes de cada vencimiento',
            'Registro de uso por conductor con PIN de 4 dígitos, sin cuentas',
            'Fotos de entrega con lectura automática de kilometraje, combustible y limpieza',
            'Panel con el estado de la flota, alertas de daño y bitácora filtrable',
            'Datos del vehículo: combustible, neumáticos, transmisión y aceite',
        ],
        'provider': {'@id': ORG},
        'offers': {
            '@type': 'AggregateOffer',
            'priceCurrency': 'CLP',
            'lowPrice': '20000',
            'highPrice': '30000',
            'offerCount': 2,
            'offers': [
                {
                    '@type': 'Offer',
                    'name': 'Plan mensual',
                    'description': '$2.500 por vehículo al mes, sin permanencia.',
                    'price': '2500',
                    'priceCurrency': 'CLP',
                    'availability': 'https://schema.org/InStock',
                    'url': SITIO + '/planes/',
                    'priceSpecification': {
                        '@type': 'UnitPriceSpecification',
                        'price': '2500',
                        'priceCurrency': 'CLP',
                        'unitText': 'vehículo',
                        'billingIncrement': 1,
                        'billingDuration': 1,
                        'referenceQuantity': {
                            '@type': 'QuantitativeValue', 'value': 1, 'unitCode': 'MON'
                        },
                    },
                },
                {
                    '@type': 'Offer',
                    'name': 'Plan anual',
                    'description': '$20.000 por vehículo al año, un 33% menos que pagando mes a mes.',
                    'price': '20000',
                    'priceCurrency': 'CLP',
                    'availability': 'https://schema.org/InStock',
                    'url': SITIO + '/planes/',
                    'priceSpecification': {
                        '@type': 'UnitPriceSpecification',
                        'price': '20000',
                        'priceCurrency': 'CLP',
                        'unitText': 'vehículo',
                        'billingIncrement': 1,
                        'billingDuration': 1,
                        'referenceQuantity': {
                            '@type': 'QuantitativeValue', 'value': 1, 'unitCode': 'ANN'
                        },
                    },
                },
            ],
        },
    }


def migas(ruta, etiqueta):
    items = [{'@type': 'ListItem', 'position': 1, 'name': 'Inicio', 'item': SITIO + '/'}]
    if ruta != '/':
        items.append({
            '@type': 'ListItem', 'position': 2, 'name': etiqueta, 'item': SITIO + ruta
        })
    return {
        '@type': 'BreadcrumbList',
        '@id': SITIO + ruta + '#migas',
        'itemListElement': items,
    }


def faq_de(sopa, ruta):
    pares = []
    for item in sopa.select('.faq__item'):
        q = item.select_one('.faq__q')
        a = item.select_one('.faq__a')
        if q and a:
            pares.append({
                '@type': 'Question',
                'name': limpio(q),
                'acceptedAnswer': {'@type': 'Answer', 'text': limpio(a)},
            })
    if not pares:
        return None
    return {'@type': 'FAQPage', '@id': SITIO + ruta + '#faq', 'mainEntity': pares}


def faq_legal_de(sopa, ruta):
    """/legal/ no usa .faq__item: su par pregunta-respuesta es el h1 mas el
    bloque .legal-answer. Se marca igual porque es la duda con mas busqueda
    real de todo el sitio, y ambas partes estan a la vista."""
    h1 = sopa.select_one('h1')
    titulo = sopa.select_one('.legal-answer__title')
    texto = sopa.select_one('.legal-answer__text')
    if not (h1 and titulo and texto):
        return None
    return {
        '@type': 'FAQPage',
        '@id': SITIO + ruta + '#faq',
        'mainEntity': [{
            '@type': 'Question',
            'name': limpio(h1),
            'acceptedAnswer': {
                '@type': 'Answer',
                'text': limpio(titulo) + ' ' + limpio(texto),
            },
        }],
    }


def howto_de(sopa, ruta):
    pasos = []
    for i, paso in enumerate(sopa.select('.hw-step'), 1):
        t = paso.select_one('.hw-step__title')
        x = paso.select_one('.hw-step__text')
        if t and x:
            pasos.append({
                '@type': 'HowToStep', 'position': i, 'name': limpio(t), 'text': limpio(x)
            })
    if not pasos:
        return None
    return {
        '@type': 'HowTo',
        '@id': SITIO + ruta + '#pasos',
        'name': 'Cómo poner en marcha TapCar y operar tus vehículos con un Tap',
        'description': (
            'Los cuatro pasos de puesta en marcha y los cuatro del día a día, desde '
            'crear la cuenta hasta controlar todo desde el panel.'
        ),
        'inLanguage': 'es-CL',
        'step': pasos,
    }


def pagina_web(sopa, ruta, etiqueta):
    h1 = sopa.select_one('h1')
    desc = sopa.select_one('meta[name="description"]')
    return {
        '@type': 'WebPage',
        '@id': SITIO + ruta + '#pagina',
        'url': SITIO + ruta,
        'name': limpio(h1) if h1 else etiqueta,
        'description': desc['content'] if desc else '',
        'inLanguage': 'es-CL',
        'isPartOf': {'@id': WEB},
        'about': {'@id': PROD},
        'breadcrumb': {'@id': SITIO + ruta + '#migas'},
        'publisher': {'@id': ORG},
    }


def main():
    for archivo, ruta, etiqueta in PAGINAS:
        ruta_fs = os.path.join(RAIZ, archivo)
        html = io.open(ruta_fs, encoding='utf-8', newline='').read()
        sopa = BeautifulSoup(html, 'html.parser')

        grafo = [
            organizacion(),
            sitio_web(),
            pagina_web(sopa, ruta, etiqueta),
            migas(ruta, etiqueta),
        ]
        # El producto con sus precios va en la home y en Planes: las dos páginas
        # donde esa información está efectivamente a la vista.
        if ruta in ('/', '/planes/'):
            grafo.append(producto())
        faq = faq_de(sopa, ruta) or faq_legal_de(sopa, ruta)
        if faq:
            grafo.append(faq)
        howto = howto_de(sopa, ruta)
        if howto:
            grafo.append(howto)

        cuerpo = json.dumps(
            {'@context': 'https://schema.org', '@graph': grafo},
            ensure_ascii=False, indent=2,
        )
        bloque = ('  <script type="application/ld+json" data-schema>\n'
                  + cuerpo + '\n  </script>\n')

        # Borra el bloque anterior y escribe el nuevo justo antes de </head>.
        html = re.sub(
            r'[ \t]*<script type="application/ld\+json" data-schema>.*?</script>\n',
            '', html, flags=re.S,
        )
        html = html.replace('</head>', bloque + '</head>', 1)
        io.open(ruta_fs, 'w', encoding='utf-8', newline='').write(html)

        detalle = []
        for n in grafo:
            t = n['@type']
            if t == 'FAQPage':
                t += '(%d)' % len(n['mainEntity'])
            if t == 'HowTo':
                t += '(%d)' % len(n['step'])
            detalle.append(t)
        print('%-26s %s' % (archivo, ' · '.join(detalle)))


if __name__ == '__main__':
    main()
