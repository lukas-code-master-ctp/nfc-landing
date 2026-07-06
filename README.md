# TapCar — Sitio web

Landing comercial de **TapCar**: la documentación de tu flota, lista para la fiscalización en ruta. Cada vehículo guarda sus papeles (Permiso de Circulación, Revisión Técnica, SOAP, etc.) y los abre con un toque desde un chip NFC.

Sitio estático en HTML/CSS/JS, implementado a partir de un diseño de [Claude Design](https://claude.ai/design).

## Páginas

| Página | Archivo | Contenido |
|---|---|---|
| Home / Landing | [`index.html`](index.html) | Hero + preview de ficha NFC, "Cómo funciona", "Beneficios", showcase de la ficha, CTA |
| Planes | [`planes/index.html`](planes/index.html) | Calculadora de precio con slider, "Todo incluido", preguntas frecuentes, CTA |

## Estructura

```
.
├── index.html      # Home / Landing (autónoma, CSS incrustado)
├── planes/index.html     # Planes (autónoma, CSS incrustado)
├── styles.css      # Design system compartido (fuente editable)
└── _design_src/    # Archivos originales del diseño (referencia)
```

El CSS está incrustado en cada `.html` para que las páginas funcionen de forma autónoma (abrir con doble clic, en cualquier visor o servidor). `styles.css` es la hoja fuente editable; tras modificarla hay que volver a incrustarla en las páginas.

## Uso

Abre `index.html` en el navegador, o sirve la carpeta con cualquier servidor estático:

```bash
python -m http.server 8000
```

## Diseño

- Tipografías: **Geist** / **Geist Mono** (Google Fonts)
- Color de marca: `#2952e6`
- Componentes reproducidos del TapCar Design System: Button, Card, IconChip, StatusBadge, VehicleCard, DocumentRow
