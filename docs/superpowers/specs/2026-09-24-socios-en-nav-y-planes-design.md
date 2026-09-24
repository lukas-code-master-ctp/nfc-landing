# Socios en el nav y en Planes

Fecha: 2026-09-24
Estado: aprobado para plan de implementación

## Qué pidió el usuario

1. Que `/socios/` esté en la barra de navegación.
2. Que `/planes/` diga cómo funcionan los socios y lleve a `/socios/`, con algo
   como "¿Eres automotora o aseguradora?".

Esto revierte una decisión del spec anterior
(`2026-09-24-calzar-landing-con-app-design.md`), que dejaba `/socios/` fuera
del nav.

## Diseño

### Nav

- Un quinto enlace, **"Socios"**, después de "Planes", en el nav de escritorio y
  en el panel móvil de las seis páginas. En `/socios/` va con `is-active`; el
  panel móvil lo marca solo, porque compara `data-nav` con el `pathname`.
- Se elige "Socios" porque es corto, calza con la URL y no se confunde con
  Flotas, que es el plan "de empresa". "Para empresas" o "Empresas" se leerían
  como el plan de flotas.
- **Riesgo: el ancho.** El nav de escritorio vive hasta 861 px con marca, cinco
  enlaces y dos botones. Si a 861 px no cabe, se achica el `gap` de
  `.nav__links` en una media query entre 861 y 1000 px. Se mide, no se supone.

### Franja en Planes

Entre la sección de la calculadora y el FAQ, una franja con el mismo
componente `.rubro` del home (tarjeta con el texto a la izquierda y el detalle
a la derecha), para que las dos se reconozcan como la misma cosa.

A diferencia de la del home, esta explica **cómo funciona cada perfil** en una
línea, porque quien está en Planes está comparando cómo se paga:

- Izquierda: eyebrow "Empresas del rubro", título "¿Eres automotora,
  aseguradora o gestoría?", y un texto que dice que lo suyo no se calcula en
  esta página.
- Derecha: una lista de tres líneas, una por perfil, y el enlace "Ver cómo
  funcionan" a `/socios/`.

Todas las afirmaciones salen de la auditoría del 2026-09-24 y ya están
publicadas en `/socios/`: códigos de un solo uso, pago por activación,
gestorías que mandan el documento a la cuenta del cliente, aprobación de
TapCar, condiciones caso a caso. No se publica ningún precio.

No se agrega una pregunta al FAQ: la franja ya está a la vista justo antes, y
repetirla en el FAQ duplicaría el texto.

## Qué no cambia

- El footer sigue enlazando "Para empresas del rubro".
- La franja del home.
- `precios.json`, la calculadora y el JSON-LD (el nav y la franja no entran al
  marcado; `schema.py` se corre igual para confirmarlo).

## Verificación

1. El nav de escritorio no desborda ni parte en dos líneas entre 861 y 1280 px,
   medido en 861, 900, 1000 y 1280.
2. El panel móvil muestra "Socios" y lo marca activo en `/socios/`.
3. La franja de Planes se ve en escritorio y a 375 px sin scroll lateral.
4. `python tools/precios.py`, `python tools/schema.py` (idempotente) y
   `node tools/test_contacto.js` en verde.
