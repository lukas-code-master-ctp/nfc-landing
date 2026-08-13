# TapCar — Sitio web

Landing comercial de **TapCar**: la operación de tus vehículos a un toque. Cada vehículo guarda sus papeles (Permiso de Circulación, Revisión Técnica, SOAP, etc.), registra quién lo usa con un PIN y abre su ficha pública desde un chip NFC —pegado al parabrisas o de llavero—.

Sirve tanto para un auto particular como para una flota de empresa; el precio es por vehículo.

Sitio estático en HTML/CSS/JS, implementado a partir de un diseño de [Claude Design](https://claude.ai/design).

## Páginas

| Página | Archivo | Contenido |
|---|---|---|
| Home / Landing | [`index.html`](index.html) | Hero con rotor de palabra, "¿Para quién es?", "Cómo funciona", "Un toque, toda la operación", beneficios, showcase de la ficha, CTA |
| ¿Cómo funciona? | [`como-funciona/index.html`](como-funciona/index.html) | Paso a paso en dos fases (puesta en marcha 01–04, día a día 05–08) + FAQ de 9 preguntas |
| Planes | [`planes/index.html`](planes/index.html) | Calculadora con slider, toggle mensual/anual con el ahorro en pesos, "Todo incluido" por audiencia, FAQ, CTA |
| ¿Es legal? | [`legal/index.html`](legal/index.html) | Legalidad de los documentos digitales en Chile (Ley 19.799, Contraloría), referencias y disclaimer |

## Estructura

```
.
├── index.html              # Home / Landing (autónoma, CSS incrustado)
├── como-funciona/index.html
├── planes/index.html
├── legal/index.html
├── styles.css              # Design system compartido (fuente editable)
├── assets/                 # Imágenes publicadas (llavero NFC en PNG y WebP)
├── favicon.svg
└── _design_src/            # Archivos originales del diseño y fotos sin procesar
```

## CSS: fuente única e incrustada

`styles.css` es **la fuente editable**. El mismo CSS va incrustado dentro del `<style>` de cada `.html` para que las páginas funcionen de forma autónoma (abrir con doble clic, sin servidor).

Tras editar `styles.css` hay que volver a incrustarlo en las cuatro páginas:

```bash
python -c "import io; css=io.open('styles.css',encoding='utf-8').read().rstrip(); [io.open(f,'w',encoding='utf-8',newline='').write(h[:h.index('<style>')+7]+'\n'+css+'\n'+h[h.index('  </style>'):]) for f in ['index.html','planes/index.html','legal/index.html','como-funciona/index.html'] for h in [io.open(f,encoding='utf-8').read()]]"
```

Editar el `<style>` de un `.html` a mano hace que ese cambio se pierda en la siguiente sincronización.

## Uso

Abre `index.html` en el navegador, o sirve la carpeta con cualquier servidor estático:

```bash
python -m http.server 4310
```

Sírvela en vez de abrir el archivo si vas a probar la navegación: los enlaces entre páginas son absolutos (`/planes/`) y las imágenes viven en `/assets/`.

## Diseño

- Tipografías: **Geist** / **Geist Mono**; **Caveat** solo para la anotación manuscrita de Planes (Google Fonts)
- Color de marca: `#2952e6`
- Componentes reproducidos del TapCar Design System: Button, Card, IconChip, StatusBadge, VehicleCard, DocumentRow

### Comportamientos con JS

Cada página lleva su script incrustado al final del `<body>`:

- **Menú móvil** (las 4 páginas) — bajo 860px el nav pasa a un panel desplegable; marca el enlace activo comparando el `pathname`, y cierra con Escape, con clic fuera o al volver a escritorio. "Ingresar" se queda visible en la barra (no entra al panel) y "Crear cuenta" solo vive dentro del panel.
- **Rotor del hero** (home) — la palabra de "Tu _flota_ a un Tap." rota entre flota/auto/moto/camioneta animando el ancho. El `h1` lleva un `aria-label` fijo con la frase completa y el rotor se desactiva con `prefers-reduced-motion`.
- **Reveal on scroll** (home y ¿Cómo funciona?) — `IntersectionObserver` con retraso escalonado.
- **Contador del hero** (home) — el número de vehículos cuenta desde 0 al entrar en pantalla. La cifra vive en el HTML (`data-valor` y el texto del span, las dos), así que sin JS se ve igual, solo que sin animar. `data-prefijo` es lo que va pegado delante (hoy `+`).
- **Calculadora** (planes) — precio por vehículo, ahorro anual en pesos, burbuja del slider y empujón al plan anual.

### Notas de responsive

- Las grillas usan `minmax(0, 1fr)`, no `1fr`: las fichas con texto que no envuelve (patentes, documentos) estiraban la columna y sacaban scroll lateral.
- `html` lleva `text-size-adjust: 100%` y `overflow-x: clip` (no `hidden`, que rompe el nav sticky) como red de seguridad contra el desborde horizontal en móviles reales.
- El titular del hero lleva un `<br class="lp-hero__nl">` que solo existe bajo 560px. Sin él, la palabra más larga del rotor ("camioneta") no cabe junto a "a un Tap." en pantallas angostas: el `h1` pasa de una línea a dos y todo el hero baja y sube en cada rotación. Con el salto forzado el titular mide siempre dos líneas. Si agregas palabras al rotor, ninguna debería ser tan larga que parta también la primera línea.

## Datos de producto que la copy asume

- El **chip NFC va incluido siempre**, sin importar la cantidad de vehículos; solo se paga el envío. **Pendiente:** reflejarlo en el flujo de compra de `app.tapcar.cl`.
- Las **alertas del panel son fijas**, no configurables por el usuario.
- **No usar "en vivo" ni "tiempo real"** al describir el panel: se lee como GPS, que TapCar no ofrece.
- El **plan anual tiene 35% de descuento**: $1.944 por vehículo al mes frente a $2.990.
- El hero declara **+100 vehículos operando**. Es una cifra escrita a mano en `index.html`, no viene de la app: hay que actualizarla cuando cambie o queda desfasada sin que nada avise.
