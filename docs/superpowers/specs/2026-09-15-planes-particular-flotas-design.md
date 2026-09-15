# /planes — dos sistemas de precio: Uso particular y Flotas

Fecha: 2026-09-15
Estado: aprobado para plan de implementación

## Problema

Hoy `/planes` tiene un solo sistema de precios: $2.500 por vehículo al mes o
$20.000 al año, con un slider de 1 a 100 vehículos. No distingue entre alguien
con dos autos y una empresa con sesenta, y no tiene dónde cobrar las cuentas de
conductor.

Se parte en dos planes con tarifas distintas, seleccionables con pills, y se
suma el cobro por cuenta de conductor fijo en Flotas.

## Tarifas

Las tres filas redondean al mismo **−27%**, así que el badge del toggle de
facturación es uno solo y no hay que explicar diferencias entre planes.

| Concepto | Mensual | Anual | Descuento | Equivalente mensual | Ahorro |
|---|---|---|---|---|---|
| Particular — vehículo | $2.500 /mes | **$22.000 /año** | 26,67% → 27% | $1.833 | $8.000 /veh/año |
| Flota — vehículo | UF 0,057 /mes | **UF 0,5 /año** | 26,90% → 27% | UF 0,0417 | UF 0,184 /veh/año |
| Flota — cuenta de conductor | UF 0,12 /mes | **UF 1,05 /año** | 27,08% → 27% | UF 0,0875 | UF 0,39 /cuenta/año |

Las cifras ancla son la mensual y la anual. El equivalente mensual se muestra
pero **nunca se usa para calcular**: 12 × $1.833 da $21.996, no $22.000. Esta
regla ya existe en el código actual y se mantiene.

Los precios mensuales de Flota (UF 0,057 y UF 0,12) son los precios lista; los
anuales (UF 0,5 y UF 1,05) son el precio ya con el descuento aplicado.

### IVA

- **Particular**: pesos chilenos, IVA incluido. Se muestran tal cual, sin nota.
- **Flotas**: UF **más IVA**. La letra chica de la calculadora y la FAQ lo dicen
  explícitamente: "Valores en UF, no incluyen IVA."

### Rangos

- **Particular**: 1 a 10 vehículos. En 10 aparece un puente hacia Flotas.
- **Flotas**: 10 a 100 vehículos, más un tramo "Más de 100" que reemplaza el
  precio por un llamado a contacto.
- **Cuentas de conductor**: 0 al número de vehículos seleccionado. Un conductor
  fijo es el titular de un vehículo específico, así que no puede haber más
  cuentas que vehículos.

## Estructura de la página

```
HERO
PLAN PILLS        [ Uso particular ] [ Flotas ]
BILLING TOGGLE    [ Mensual ] [ Anual −27% ]   + anotación manuscrita
GRID
  ├── CALC particular   (visible si plan = particular)
  ├── CALC flota        (visible si plan = flota)
  └── INCLUIDO          (una sola columna, un grupo condicional)
FAQ
CTA
```

Las pills van arriba del toggle, centradas, reusando el lenguaje visual de
`.billing-toggle` (píldora blanca con borde, opción activa en azul) para que se
lean como dos controles de la misma familia. La anotación manuscrita "Aprovecha
la promoción anual" se queda apuntando al toggle, sin cambios.

El estado son dos variables independientes: `plan` (`particular` | `flota`) y
`period` (`mensual` | `anual`). Cambiar de pill **conserva** el periodo elegido.

### Dos tarjetas `.calc`, no una

Se usan dos tarjetas `.calc` separadas (`data-calc="particular"` y
`data-calc="flota"`), alternadas con el atributo `hidden`, en vez de una sola
tarjeta con filas condicionales. La tarjeta de Flotas tiene dos sliders, dos
líneas de fórmula y un estado de contacto; meter todo eso en la misma tarjeta
con condicionales deja un render difícil de seguir y fácil de romper.

El costo es duplicar la lista de confianza y los botones de acción. Es
aceptable: son bloques estáticos que no cambian.

### Periodo del número grande

Aquí las dos tarjetas divergen a propósito, y es el único punto donde lo hacen:

- **Particular** mantiene el comportamiento actual: el número grande es
  **siempre mensual**. En anual muestra el equivalente ($1.833 × vehículos) y la
  letra chica dice cuánto se factura una vez al año. Es el relato del café.
- **Flotas** sigue el periodo de facturación: `UF 2,625 /mes` en mensual,
  `UF 23 /año` en anual. Es un contrato B2B en UF; verlo prorrateado a UF 1,917
  al mes no ayuda a nadie. En anual, la letra chica indica el equivalente
  mensual.

En ambos casos el rótulo del periodo va pegado al número, así que no hay
ambigüedad de lectura.

### Calculadora — Particular

```
Calcula tu plan
Vehículos a registrar
[slider 1–10 con burbuja]
1 ───────────── 10
──────────────────────
3 vehículos × $2.500
$7.500 /mes
[badge café]            (solo mensual)
[caja verde de ahorro]  (solo anual)
letra chica
[empujón a anual]       (solo mensual)
[puente a Flotas]       (solo con el slider en 10)
lista de confianza · botones
```

El puente a Flotas aparece cuando el slider llega a 10:

> ¿Más de 10 vehículos? Tu plan es Flotas. **[Ver plan Flotas →]**

El botón cambia la pill activa a Flotas y deja el slider de vehículos en 10.

### Calculadora — Flotas

```
Calcula tu plan
Vehículos de la flota
[slider 10–100, con tramo "Más de 100"]
10 ───────────── 100+
Cuentas de conductor
[slider 0–(nº de vehículos)]
0 ───────────── 25
──────────────────────
25 vehículos × UF 0,5              UF 12,5
10 cuentas de conductor × UF 1,05  UF 10,5
UF 23 /año
[caja verde de ahorro]  (solo anual)
Valores en UF, no incluyen IVA. …
[empujón a anual]       (solo mensual)
lista de confianza · botones
```

Cuando hay 0 cuentas de conductor, la segunda línea de la fórmula se oculta.

El slider de cuentas se sincroniza con el de vehículos: su máximo es el número
de vehículos, y si se bajan los vehículos por debajo de las cuentas elegidas,
las cuentas se recortan solas.

**Tramo "Más de 100"**: el slider de vehículos va de 10 a 101; la posición 101
se rotula "Más de 100 vehículos" y, en vez del precio, muestra:

> **Más de 100 vehículos**
> Contáctanos para revisar tu solicitud y armarte una propuesta a la medida.
> **[contacto@tapcar.cl]**

En ese estado se ocultan la fórmula, el total, la caja de ahorro, el empujón y
el slider de cuentas de conductor.

### Columna "Todo incluido"

Una sola columna para los dos planes. Los dos grupos actuales se quedan tal
cual. Se suma un tercer grupo, visible **solo en Flotas**, con la distinción
entre asignación y cuenta. El texto introductorio cambia según el plan.

Duplicar la columna entera por plan significaría mantener nueve ítems en dos
lugares; se desincronizan a la primera edición.

## Copy nuevo

### Conductor fijo (grupo solo-Flotas en la columna de incluidos)

> **Conductor fijo**
>
> **La asignación va incluida.** El vehículo tiene un conductor titular. Al
> abrir la ficha pública desde el chip aparece él prellenado en vez de la lista
> completa y, si la empresa lo configuró así, sin pedir PIN. "Soy otro
> conductor" sigue estando: es un atajo, no un candado.
>
> **La cuenta cuesta UF 0,12 al mes.** Ese conductor entra con su propio usuario
> y ve solo su vehículo: sube documentos y mantenciones, y recibe los avisos de
> vencimiento. No ve la flota ni a sus compañeros, y no ocupa lugar en el tope
> de 5 personas del equipo.
>
> Se cobra la cuenta, no la asignación.

### Hero

Título sin cambios. La bajada pasa a nombrar los dos planes:

> $2.500 por vehículo al mes para uso particular, y tarifa por flota desde 10
> vehículos. Documentos, uso con PIN, panel y fiscalización incluidos. Sin
> permanencia — cambia o cancela cuando quieras.

### CTA

> $2.500 por vehículo al mes, o tarifa de flota desde 10 vehículos. Registra tus
> vehículos y empieza a operar con un Tap.

### FAQ

Se **actualizan** dos preguntas:

- *¿Cuánto cuesta?* — $2.500 al mes o $22.000 al año (27% menos) hasta 10
  vehículos; desde 10, plan Flotas a UF 0,5 por vehículo al año más IVA.
- *¿Y si sumo más vehículos?* — se agregan cuando quieras; pasando de 10 la
  cuenta se cotiza como Flotas.

Se **agregan** tres:

- *¿Cuándo paso a Flotas?* — desde 10 vehículos.
- *¿Qué es un conductor fijo y qué se cobra?* — la distinción asignación /
  cuenta, en corto.
- *¿Los precios incluyen IVA?* — Particular sí, Flotas no.

## Cambios técnicos

### CSS (`styles.css`)

Clases nuevas:

- `.plan-pills`, `.plan-pills__opt`, `.plan-pills__opt.is-active` — el selector
  de plan, calcado de `.billing-toggle`.
- `.calc[hidden] { display: none; }` — las tarjetas usan `hidden`, y `.calc` es
  `display: flex`, que gana sobre el `[hidden]` del navegador.
- `.calc__control` — agrupa rótulo + slider, para poder apilar dos sliders con
  el espaciado correcto.
- `.calc__lineas`, `.calc__linea` — la fórmula de Flotas en dos líneas, con el
  subtotal alineado a la derecha.
- `.calc__contacto` — el bloque del tramo "Más de 100".
- `.calc__bridge` — el puente de Particular hacia Flotas.

`styles.css` es la fuente editable y los 5 HTML embeben una copia literal de las
líneas 33–1116. Tras editar `styles.css` hay que **regenerar el bloque `<style>`
de los 5 archivos** (`index.html`, `planes/index.html`, `como-funciona/`,
`legal/`, `terminos/`) con un script, no a mano.

### JS (`planes/index.html`, script de la calculadora)

Las tarifas quedan en una sola constante:

```js
var PLANES = {
  particular: { veh: { mes: 2500,  anio: 22000 }, min: 1,  max: 10  },
  flota:      { veh: { mes: 0.057, anio: 0.5   },
                cuenta: { mes: 0.12, anio: 1.05 }, min: 10, max: 100 }
};
```

`max: 100` es el tope real de la tarifa. El `max` del `<input type="range">` de
Flotas es 101: esa posición extra es el centinela del tramo "Más de 100" y no
corresponde a 101 vehículos.

El descuento se calcula, no se escribe: `Math.round((1 - anio / (mes * 12)) * 100)`
da 27 en las tres tarifas.

Formato:

- Pesos: `'$' + n.toLocaleString('es-CL')`
- UF: `'UF ' + n.toLocaleString('es-CL', { minimumFractionDigits: 0, maximumFractionDigits: 3 })`

`placeBubble` hoy lee el único slider global; pasa a recibir el slider y su
burbuja como argumentos, porque Flotas tiene dos.

El render se parte en `renderParticular()` y `renderFlota()`, con un `render()`
que despacha según el plan activo. Los listeners de las pills, del toggle y de
ambos sliders llaman a `render()`.

### Metadatos y datos estructurados

Arrastran los $20.000 / 33% viejos y hay que actualizarlos:

- `planes/index.html`: `<title>`, `meta description`, `og:title`,
  `og:description`, `twitter:title`, `twitter:description`, el `WebPage`
  description del JSON-LD, las dos `Offer` de precio y las respuestas del
  `FAQPage`.
- `planes/index.html`: se suman al `AggregateOffer` las ofertas de Flota
  (vehículo y cuenta de conductor), en UF. El `priceCurrency` de esas ofertas
  es `CLF`, el código ISO 4217 de la Unidad de Fomento.
- `index.html` (landing): las mismas dos `Offer` de Particular.
- `llms.txt`: líneas 21–22.
- `README.md`: la nota de la línea 134.

## Verificación

1. Las cinco páginas siguen con el mismo bloque `<style>` idéntico a
   `styles.css` (`diff` de las líneas 33–1116).
2. El JSON-LD de las dos páginas parsea como JSON válido.
3. En el navegador, sobre `/planes`:
   - Las cuatro combinaciones de plan × periodo muestran la tarifa correcta.
   - Particular: slider tope 10, el puente a Flotas aparece en 10 y el botón
     cambia de pill.
   - Flotas: el slider de cuentas se recorta al bajar los vehículos; el tramo
     "Más de 100" oculta el precio y muestra el contacto.
   - El total anual de Flotas para 25 vehículos y 10 cuentas da UF 23.
   - Sin errores en consola.
4. A 400 px de ancho no aparece scroll horizontal y las pills no se desbordan.
