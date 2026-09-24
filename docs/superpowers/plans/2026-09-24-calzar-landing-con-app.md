# La landing calza con lo que hace la app — plan de implementación

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Que todo lo que dice tapcar.cl calce con la auditoría de `app.tapcar.cl` del 2026-09-24: corregir lo falso, vender lo que existe, separar Particular de Flotas en todo el sitio, y sumar la página `/socios/` con su formulario.

**Architecture:** Sitio estático. Siete tareas de contenido sobre HTML existente, una página nueva, un campo nuevo en la función `api/contacto.js`, y una tarea final de consistencia (footers, sitemap, JSON-LD, `llms.txt`, README). El CSS nuevo entra todo junto en la Tarea 2 para que ninguna tarea de página tenga que reincrustar.

**Tech Stack:** HTML + CSS + JavaScript ES5 incrustado; `api/contacto.js` en CommonJS sobre Vercel; `tools/schema.py` (Python + BeautifulSoup); `tools/precios.py`; `node tools/test_contacto.js`.

**Spec:** [`docs/superpowers/specs/2026-09-24-calzar-landing-con-app-design.md`](../specs/2026-09-24-calzar-landing-con-app-design.md)

## Global Constraints

- **Los textos de este plan son finales.** Se copian tal cual. No se agrega ninguna afirmación sobre la app que no esté acá: la auditoría es la única fuente y este plan ya la tradujo.
- **Español neutro latinoamericano con "tú"**, también en los comentarios. Nada de "vos", "tenés", "querés", "dale".
- **CRLF.** Los `.html` están en CRLF en la copia de trabajo (`core.autocrlf=true`; el índice guarda LF). Toda edición se hace leyendo y escribiendo con `newline=''` en Python, y cada reemplazo afirma que encontró su texto (`assert h.count(viejo) == 1`). `str.replace` no avisa cuando no encuentra nada. Al terminar cada tarea: `python -c "import io;b=io.open('ARCHIVO','rb').read();print(b.count(b'\r\n'), b.count(b'\n')-b.count(b'\r\n'))"` tiene que dar `N 0` (ningún LF suelto).
- **Cuidado con los `'\n'` dentro de strings de Python que no son raw**: para buscar texto que cruza líneas, busca en tramos de una sola línea o usa `'\r\n'` explícito.
- **UTF-8.** Las tildes tienen que sobrevivir. Ninguna página puede terminar con `Ã`, `â€` ni `�`.
- **JavaScript del navegador en ES5.** Nada de `const`, `let`, arrow functions ni template literals.
- **El bloque JSON-LD (`<script type="application/ld+json" data-schema>`) no se edita a mano.** Si el texto que buscas aparece dos veces en un archivo, una de ellas es el JSON-LD: ancla el reemplazo en el markup visible (la clase del elemento), no en el texto solo.
- **`styles.css` es la fuente.** El `<style>` de cada página no se edita a mano; se reincrusta con el comando de la Tarea 2.
- **`precios.json` no se toca.**
- **Íconos nuevos**: todos usan este envoltorio, igual al de los íconos existentes de tarjetas:
  `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">…</svg>`
  con estos contenidos:
  - `subir`: `<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m17 8-5-5-5 5"/><path d="M12 3v12"/>`
  - `camara`: `<path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/>`
  - `llave`: `<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>`
  - `falta`: `<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M12 12v3"/><path d="M12 18h.01"/>`
  - `transferir`: `<path d="M8 3 4 7l4 4"/><path d="M4 7h16"/><path d="m16 21 4-4-4-4"/><path d="M20 17H4"/>`
  - `buscar`: `<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>`
  - `tarjeta`: `<rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/>`
  - `medidor`: `<path d="m12 14 4-4"/><path d="M3.34 19a10 10 0 1 1 17.32 0"/>`
  - `titular`: `<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="m16 11 2 2 4-4"/>`
  - `escudo`: `<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/>`
  - `enviar`: `<path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/>`
  - `auto`: el mismo `<path>` + `<circle>` del ícono de auto que ya usa la tarjeta "Tu auto, o los de tu familia" del home.

## File Structure

| Archivo | Qué cambia | Tarea |
|---|---|---|
| `api/contacto.js` | Campo `tipo` para empresas del rubro | 1 |
| `tools/test_contacto.js` | Pruebas del `tipo` | 1 |
| `styles.css` + los 5 `<style>` | `.plan-tag`, `.tag-row`, franja `.rubro`, `.socios-grid`, `.contacto-box`, `<select>` | 2 |
| `index.html` | Home completo | 3 |
| `como-funciona/index.html` | Pasos y FAQ | 4 |
| `planes/index.html` | Subtítulo, "Todo incluido", FAQ, puentes de la calculadora | 5 |
| `legal/index.html` | Gases, "sin señal", ficha | 6 |
| `socios/index.html` | Página nueva | 7 |
| `terminos/index.html` | Reescritura como términos del sitio | 8 |
| footers de 5 páginas, `sitemap.xml`, `tools/schema.py`, `tools/precios.py`, `llms.txt`, `README.md` | Consistencia | 9 |

## Comandos de verificación

- `node tools/test_contacto.js`
- `python tools/precios.py` → `OK: el sitio calza con precios.json`
- `python tools/schema.py` (y una segunda corrida que no deje cambios nuevos)
- `python -m http.server 4310` → `http://localhost:4310/`

---

### Task 1: `api/contacto.js` acepta empresas del rubro

**Files:**
- Modify: `api/contacto.js`
- Modify: `tools/test_contacto.js`

**Interfaces:**
- Produces: el cuerpo JSON acepta `tipo` ∈ `automotora | aseguradora | gestoria | otra`. Lo consume la Tarea 7.

- [ ] **Step 1: Leer los dos archivos completos** y entender el helper de pruebas (cómo arma la petición, `ultimoCorreo()`, `enviados`).

- [ ] **Step 2: Escribir primero las pruebas nuevas** al final de la lista de pruebas de `tools/test_contacto.js`, con el mismo estilo que las existentes:
  1. Socio feliz: `{ tipo: 'automotora', empresa: 'Automotora Sur SpA', nombre: 'Ana Rojas', email: 'ana@sur.cl', mensaje: 'Queremos regalarlo.' }` sin `vehiculos` → 200, un correo enviado, `to` = `['contacto@tapcar.cl']`, `subject` contiene `Automotora Sur SpA` y `Automotora`, `text` contiene `Tipo:` y `Automotora` y `tapcar.cl/socios/`, y **no** contiene `Vehículos:`.
  2. Cada uno de `aseguradora`, `gestoria`, `otra` → 200. Para `gestoria` el asunto contiene `Gestoría` (con tilde).
  3. `tipo: 'banco'` → 400, `error` coincide con `/tipo de empresa/i`, cero correos.
  4. `tipo: 'AUTOMOTORA'` (mayúsculas) → 200: se normaliza a minúsculas.
  5. Socio con `vehiculos: 'abc'` → 200: con `tipo`, `vehiculos` se ignora.
  6. Socio sin `empresa` → 400 con `/empresa/i`.
  7. `tipo: 'automotora\r\nBcc: x@y.cl'` → 400 (no es un tipo válido después de limpiar).
  8. Sin `tipo` y sin `vehiculos` → 400 (el formulario de flota sigue igual).

- [ ] **Step 3: Correr las pruebas y ver que las nuevas fallan**

```bash
node tools/test_contacto.js
```

Expected: las 31 viejas pasan; las nuevas fallan.

- [ ] **Step 4: Implementar en `api/contacto.js`**

Cambiar el comentario de cabecera a:

```js
// Recibe dos formularios y manda la consulta a contacto@tapcar.cl a traves de
// Resend: el de flotas grandes de /planes/ y el de empresas del rubro de
// /socios/. Los distingue el campo `tipo`: sin el, es una consulta de flota.
```

(conservando el párrafo de CommonJS que sigue).

Agregar después de `EMAIL_RE`:

```js
// Tipos de empresa del formulario de /socios/. Sin `tipo`, la consulta es de
// flota y se valida como siempre. El tipo no cambia el destinatario: solo el
// asunto y el cuerpo del correo.
var TIPOS = {
  automotora: 'Automotora',
  aseguradora: 'Aseguradora',
  gestoria: 'Gestoría',
  otra: 'Otra empresa del rubro'
};
```

En `normalizar`, agregar `tipo: linea(b.tipo).toLowerCase(),`.

En `validar`, al principio:

```js
  if (d.tipo && !TIPOS.hasOwnProperty(d.tipo)) return 'Elige el tipo de empresa.';
```

y envolver las dos reglas de `vehiculos` para que solo corran sin `tipo`:

```js
  if (!d.tipo) {
    if (d.vehiculos === null) return 'Indica cuántos vehículos tiene tu flota.';
    if (d.vehiculos < 1 || d.vehiculos > 100000) {
      return 'La cantidad de vehículos debe estar entre 1 y 100.000.';
    }
  }
```

En `cuerpo(d)`: si hay `tipo`, la primera línea es `'Nueva consulta de empresa del rubro desde tapcar.cl/socios/'`, se agrega `'Tipo:       ' + TIPOS[d.tipo]` antes de `Empresa:`, y **no** va la línea de `Vehículos:`. Sin `tipo`, el cuerpo queda idéntico al de hoy.

El asunto: sin `tipo`, el de hoy. Con `tipo`:

```js
'Consulta de empresa del rubro — ' + d.empresa + ' (' + TIPOS[d.tipo] + ')'
```

- [ ] **Step 5: Correr las pruebas**

```bash
node tools/test_contacto.js
```

Expected: todas pasan, `0 fallo(s)`.

- [ ] **Step 6: Commit**

```bash
git add api/contacto.js tools/test_contacto.js
git commit -m "Contacto: la funcion recibe tambien consultas de empresas del rubro"
```

---

### Task 2: Componentes de CSS

**Files:**
- Modify: `styles.css`
- Modify (reincrustado): `index.html`, `planes/index.html`, `legal/index.html`, `como-funciona/index.html`, `terminos/index.html`

- [ ] **Step 1: Agregar al final de la sección "Landing — ¿Para quién es?" de `styles.css`** (después de `.aud-card__link:hover`):

```css
/* Etiqueta de plan: "Uso particular", "Flotas", "Solo en Flotas". Azul sobre
   azul-soft da 5,3:1, sobre el 4,5:1 que pide texto de 11px. */
.plan-tag {
  display: inline-flex; align-items: center; flex: 0 0 auto;
  padding: 4px 10px; border-radius: var(--radius-pill);
  background: var(--azul-soft); color: var(--azul);
  font-size: 11px; font-weight: 700; letter-spacing: 0.04em;
  text-transform: uppercase; line-height: 1.3; white-space: nowrap;
}
/* Cabeza de tarjeta con el ícono a la izquierda y la etiqueta a la derecha. */
.tag-row { display: flex; align-items: center; justify-content: space-between; gap: 12px; }

/* Home — franja "Para empresas del rubro", bajo las dos tarjetas de audiencia.
   Es otro tipo de cliente, por eso va aparte y no como tercera tarjeta. */
.rubro {
  margin-top: 20px; display: grid;
  grid-template-columns: minmax(0, 1.5fr) minmax(0, 1fr); gap: 28px; align-items: center;
}
.rubro__eyebrow {
  font-size: 12px; font-weight: 700; letter-spacing: 0.06em;
  text-transform: uppercase; color: var(--azul);
}
.rubro__title { margin: 8px 0 0; font-size: 21px; font-weight: 600; letter-spacing: -0.01em; }
.rubro__text { margin: 8px 0 0; font-size: 15px; line-height: 1.55; color: var(--acero); }
.rubro__lado { display: flex; flex-direction: column; align-items: flex-start; gap: 16px; }
.rubro__tipos { display: flex; flex-wrap: wrap; gap: 8px; }
```

- [ ] **Step 2: Agregar una sección nueva antes de "Página Legal (¿Es legal?)":**

```css
/* ===================================================================
   Empresas del rubro (/socios/)
   =================================================================== */
.socios-grid {
  display: grid; grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 20px; margin-top: 40px;
}
.contacto-box {
  max-width: 720px; margin: 0 auto; padding: 32px 36px;
  background: var(--azul-soft); border-radius: var(--radius-lg);
}
.contacto-box__title { margin: 0; font-size: 26px; line-height: 1.2; letter-spacing: -0.02em; font-weight: 700; }
.contacto-box__text { margin: 10px 0 0; font-size: 16px; line-height: 1.55; color: var(--acero); }
```

- [ ] **Step 3: Extender la regla de contraste del formulario.** Hoy dice `.calc__contacto .form__input { border-color: #6d7c9b; }` y `.calc__contacto .form__input:focus { … }`. Cambiar los dos selectores para que cubran también `.contacto-box`:

```css
.calc__contacto .form__input,
.contacto-box .form__input { border-color: #6d7c9b; }
.calc__contacto .form__input:focus,
.contacto-box .form__input:focus {
```

y actualizar el comentario de arriba para que diga que vale para los dos formularios (los dos viven sobre azul-soft).

- [ ] **Step 4: Estilo del `<select>`**, junto a `.form__textarea`:

```css
/* El select usa la misma caja que los inputs; la flecha nativa se reemplaza
   para que se vea igual en todos los navegadores. */
select.form__input {
  -webkit-appearance: none; appearance: none; cursor: pointer; padding-right: 38px;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%235b6573' stroke-width='2.4' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E");
  background-repeat: no-repeat; background-position: right 13px center;
}
```

- [ ] **Step 5: Responsive.** En `@media (max-width: 980px)`, junto a `.aud-grid`: `.socios-grid { grid-template-columns: minmax(0, 1fr); }`. En `@media (max-width: 860px)`: `.rubro { grid-template-columns: minmax(0, 1fr); gap: 18px; }`. En `@media (max-width: 560px)`: `.contacto-box { padding: 24px 20px; }` y `.contacto-box__title { font-size: 22px; }`.

- [ ] **Step 6: Reincrustar en las cinco páginas** con el comando del README:

```bash
python -c "import io; css=io.open('styles.css',encoding='utf-8').read().rstrip(); [io.open(f,'w',encoding='utf-8',newline='').write(h[:h.index('<style>')+7]+'\n'+css+'\n'+h[h.index('  </style>'):]) for f in ['index.html','planes/index.html','legal/index.html','como-funciona/index.html','terminos/index.html'] for h in [io.open(f,encoding='utf-8').read()]]"
```

**Ojo:** ese comando lee con `newline` por defecto, así que deja los archivos en LF. El repo tiene `core.autocrlf=true` (índice en LF, copia de trabajo en CRLF), así que el commit no cambia por eso; aun así se reconvierten los cinco a CRLF (`b.replace(b'\r\n', b'\n').replace(b'\n', b'\r\n')`) para que la copia de trabajo quede coherente, y se comprueba con el chequeo de las Global Constraints. `git diff --stat` de cada página tiene que tocar solo el bloque `<style>`.

- [ ] **Step 7: Commit**

```bash
git add styles.css index.html planes/index.html legal/index.html como-funciona/index.html terminos/index.html
git commit -m "CSS: etiqueta de plan, franja del rubro y formulario de socios"
```

---

### Task 3: Home

**Files:**
- Modify: `index.html`

- [ ] **Step 1: Hero.** En `.lp-hero__lead`:
  - Viejo: `Opera todos tus vehículos con un toque: documentos, quién usa cada uno y en qué estado lo entrega. La fiscalización en ruta es solo una de las cosas que resuelve.`
  - Nuevo: `Opera todos tus vehículos con un toque: documentos, mantenciones y, en flotas, quién usa cada uno y en qué estado lo entrega. La fiscalización en ruta es solo una de las cosas que resuelve.`

- [ ] **Step 2: Contador.** `data-valor="500"` → `data-valor="600"`, y el texto `+500` → `+600`. Al comentario que está encima agregar una línea: `Última medición: +600, el 2026-09-24.`

- [ ] **Step 3: ¿Para quién es? — cabecera.**
  - `h2`: `Da lo mismo si son dos autos o cincuenta.` → `Dos autos o cincuenta: hay un plan para cada caso.`
  - lead: `TapCar se cobra por vehículo, así que sirve igual para los autos de tu casa que para la flota de tu empresa. Cambia lo que usas de la plataforma, no el producto.` → `TapCar se cobra por vehículo, en dos planes: Uso particular para los autos de tu casa, y Flotas cuando hay conductores y equipo de por medio.`

- [ ] **Step 4: Tarjeta 1 ("Tu auto, o los de tu familia").**
  - Envolver su `<span class="icon-chip icon-chip--azul">…</span>` en `<div class="tag-row">…<span class="plan-tag">Uso particular</span></div>`.
  - Texto: `No necesitas una empresa para usar TapCar. Registra uno o varios vehículos y ten su documentación al día, a un toque.` → `No necesitas una empresa para usar TapCar. Registra de 1 a 10 vehículos y ten sus documentos y mantenciones al día, a un toque.`
  - Tercer ítem: `Aviso por correo antes de cada vencimiento` → `Aviso por correo antes de cada vencimiento y de cada mantención`
  - Agregar un cuarto ítem, con el mismo markup que los otros: `Si vendes el auto, se lo transfieres al comprador con sus documentos`

- [ ] **Step 5: Tarjeta 2 ("La flota de tu empresa").**
  - Mismo envoltorio `tag-row` con `<span class="plan-tag">Flotas</span>`.
  - Tercer ítem: `Panel, alertas y reportes por conductor` → `Alertas, bitácora y reportes en Excel y PDF`
  - Agregar un cuarto ítem: `Tu equipo de hasta 5 personas, cada una con su rol`

- [ ] **Step 6: Franja del rubro.** Justo después del cierre de `<div class="aud-grid">` (dentro del mismo `.container`):

```html
      <div class="card card--p28 rubro">
        <div>
          <span class="rubro__eyebrow">Para empresas del rubro</span>
          <h3 class="rubro__title">Automotoras, aseguradoras y gestorías</h3>
          <p class="rubro__text">Regálale TapCar a quien te compra un auto o a tus asegurados con códigos de un solo uso, o manda los documentos que tramitaste directo a la cuenta de tu cliente. Son perfiles aparte: se piden al crear la cuenta y los aprobamos nosotros.</p>
        </div>
        <div class="rubro__lado">
          <div class="rubro__tipos">
            <span class="hw-chip">Automotoras</span>
            <span class="hw-chip">Aseguradoras</span>
            <span class="hw-chip">Gestorías</span>
          </div>
          <a href="/socios/" class="aud-card__link">Conoce los convenios y envíos
            <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </a>
        </div>
      </div>
```

(respetando CRLF). En el script de reveal, agregar `.rubro` a la lista de selectores.

- [ ] **Step 7: Cómo funciona (3 pasos).**
  - Paso 01: ícono → `subir`. Título `Registra vehículos y conductores` → `Carga tus vehículos con IA`. Texto → `Suelta hasta 40 PDF o fotos de tus documentos: la IA detecta el tipo, la patente, el vencimiento y los datos del auto, agrupa por patente y te propone qué crear. Tú revisas antes de importar.`
  - Paso 02, texto: `Cada vehículo recibe una URL única. Grábala en su chip NFC —pegado al parabrisas o de llavero— una sola vez. Listo para siempre.` → `Cada vehículo recibe una URL única. Grábala en su chip NFC —pegado al parabrisas o de llavero— desde tu propio celular si es Android, o con NFC Tools y nuestra guía si es iPhone.`
  - Paso 03, texto: → `El mismo Tap abre la ficha para fiscalizar en ruta. En Flotas, además registra quién toma y entrega el vehículo, y mantiene tu panel al día.`

- [ ] **Step 8: "Un toque, toda la operación" pasa a ser la sección de Flotas.**
  - eyebrow: `Un toque, toda la operación` → `Flotas: toda la operación`
  - `h2`: `El mismo Tap hace mucho más que mostrar papeles.` → `Con conductores, el mismo Tap controla toda la operación.`
  - lead → `En el plan Flotas, TapCar pasa de guardar documentos a operar tus vehículos: quién usa cada uno, en qué estado lo entrega y cuánto se usa. Todo parte del mismo gesto.`
  - Tarjeta "Custodia con PIN": sin cambios.
  - Tarjeta "Fotos de entrega leídas por IA", texto → `Al entregar, el conductor sube las fotos que tú defines —por ejemplo, el tablero y la cabina— y puede reportar daños. La IA lee el kilometraje, la bencina y la limpieza; tú confirmas o corriges con un clic. Los daños los informa el conductor: la IA no los analiza.`
  - Tarjeta "Panel con el estado de tu flota", texto → `Ve qué vehículo está disponible y cuál está en uso, y por quién, en este momento. Una bandeja de alertas te avisa cuando hay un daño reportado o un uso sin entrega formal, y los daños y las incidencias al tomar un vehículo también te llegan por correo.`
  - Tarjeta "Reportes de responsabilidad": título → `Reportes para descargar`; texto → `Responsabilidad por conductor y bitácora filtrable por conductor, vehículo y fecha. Descárgalos en un Excel de 4 hojas —conductores, vehículos, uso por vehículo y vencimientos próximos— o en un PDF de resumen ejecutivo, y sigue la evolución de km, usos u horas por vehículo o conductor, por día, semana o mes.`
  - Agregar dos tarjetas nuevas al final del `.op-grid`, con el markup de las existentes (`card card--p28`, `icon-chip icon-chip--azul`, `op-card__title`, `op-card__text`):
    - ícono `medidor`, `Control de la entrega`: `TapCar marca «Revisar consumo» cuando un uso gastó más de lo esperado según el rendimiento y el estanque que configuraste, detecta si la foto del odómetro es antigua o reenviada y te avisa si un uso pasa de 12 horas —o del plazo que elijas—. Si uno quedó abierto, lo cierras tú.`
    - ícono `titular`, `Conductor fijo con cuenta propia`: `El titular de un vehículo puede entrar con su propio usuario: ve solo su vehículo, sube documentos y mantenciones, y recibe los avisos y un resumen propio por correo. No ve la flota ni a sus compañeros. La cuenta se cobra aparte.`

- [ ] **Step 9: "Por qué TapCar".** Dejar el `h2` y agregar debajo, dentro de `.bn-head`: `<p class="section__lead">Todo esto viene en los dos planes, salvo lo marcado como Flotas.</p>`. Reemplazar las 9 tarjetas del `.bn-grid` por estas 12, en este orden, con el markup de las existentes (`card card--p24`, `icon-chip icon-chip--<color>`, `bn-card__title`, `bn-card__text`). Las que se conservan mantienen su ícono.
  1. `azul`, ícono `subir` — **Carga inteligente con IA** — `Suelta hasta 40 PDF o fotos de tus documentos. La IA detecta el tipo, la patente, el vencimiento, la marca, el modelo, el año y el color, agrupa por patente y te propone qué crear. Tú revisas antes de importar.`
  2. `azul`, ícono `camara` — **Documentos desde fotos** — `Fotografía hasta 10 hojas por documento, recórtalas y TapCar las junta en un PDF. Al subirlo, la IA te sugiere la fecha de vencimiento; tú la confirmas.`
  3. la de hoy — **Recordatorios de vencimiento** — `Te llega un correo antes de que venza cada documento, con botón para renovar, para que la fecha no te pille desprevenido.`
  4. la de hoy, sin cambios — **Estados claros** (con sus tres badges).
  5. `vigente`, ícono `llave` — **Mantenciones al día** — `Pauta por meses —y en Flotas también por kilómetros—, con estado al día, próxima o vencida. Registras cada una con la foto de la constancia, la IA lee la fecha y el km, y te avisamos por correo.`
  6. `por_vencer`, ícono `falta` — **Documentos que faltan** — `Si a un vehículo le falta un documento obligatorio, lo ves marcado en el panel y te lo recordamos por correo una vez al mes.`
  7. la de hoy — **Ficha pública de solo lectura** — `Quien la abre solo ve: documentos, mantenciones, datos del vehículo y el aviso de daño si hay uno activo. Sin login ni acceso a tu cuenta, y la puedes guardar en tu teléfono para abrirla sin conexión durante 7 días.`
  8. `azul`, ícono `transferir` — **Transferir un vehículo** — `¿Vendes o cedes un auto? Lo transfieres a otra cuenta con sus documentos y mantenciones, y el otro acepta por correo aunque no tenga cuenta. Después vuelves a grabar el chip, porque el enlace cambia.`
  9. la de hoy, sin cambios — **Datos útiles del vehículo**.
  10. `azul`, ícono `buscar` — **Todo ordenado** — `Agrupa tus vehículos en categorías y encuentra cualquiera con el buscador y los filtros del panel.`
  11. `azul`, ícono `tarjeta` — **Tu plan, a tu manera** — `Sube o baja vehículos con prorrateo, pasa de mensual a anual, usa códigos promocionales y revisa tu historial de pagos. Si das de baja, se agenda al cierre del ciclo y la puedes deshacer.`
  12. la de hoy ("Equipo con roles"), con su ícono dentro de `<div class="tag-row">…<span class="plan-tag">Flotas</span></div>` — **Equipo con roles** — `Administrador, Editor y Visor comparten la flota según su rol. Invitaciones por correo, hasta 5 miembros por empresa.`

  Salen: "Control de uso por conductor", "Alertas de daño", "Reportes y bitácora" y "Datos de la empresa".

- [ ] **Step 10: La ficha NFC.**
  - `.fs-lead` → `La página que se abre con el Tap no es solo documentos: tiene un menú para ver la documentación, las mantenciones y la información del auto y, en Flotas, para tomar o entregar el vehículo. Para fiscalizar, el carabinero mira la pestaña de documentos y su estado — sin login, sin instalar nada.`
  - La `.fs-list` queda con cinco ítems, en este orden y con el markup de los de hoy (mismo ícono de check):
    1. `<strong>Documentos con su vencimiento</strong>` — `— Permiso de Circulación, Revisión Técnica, SOAP, Certificado de Homologación (C.H.I.-e) y Padrón.`
    2. `<strong>Mantenciones y aviso de daño</strong>` — `— el estado de cada mantención y el aviso de daño, si hay uno activo.`
    3. `<strong>Información del vehículo</strong>` — `— combustible, neumáticos, transmisión y más, para quien lo conduce.`
    4. `<strong>Tomar / Entregar</strong>` — `— en Flotas, el conductor registra el uso con su PIN, con fotos y reporte de daños.`
    5. `<strong>Sin conexión</strong>` — `— guárdala en tu teléfono y ábrela sin señal durante 7 días.`
  - El panel de ejemplo de la derecha no cambia.

- [ ] **Step 11: Verificar**

```bash
python - <<'EOF'
import io, re, sys
h = io.open('index.html', encoding='utf-8').read()
vis = re.sub(r'<script type="application/ld\+json".*?</script>', '', h, flags=re.S)
malos = ['+500', 'Certificado de Gases', 'Nunca más una multa', 'Listo para siempre', 'importarlos desde Excel', 'Cambia lo que usas']
for m in malos:
    print('  %-28s %s' % (m, 'MAL' if m in vis else 'ok'))
print('  plan-tag:', vis.count('class="plan-tag"'), '(esperado 3)')
print('  tarjetas bn:', len(re.findall(r'class="bn-card__title"', vis)), '(esperado 12)')
print('  tarjetas op:', len(re.findall(r'class="op-card__title"', vis)), '(esperado 6)')
print('  /socios/:', '/socios/' in vis)
EOF
```

Más el chequeo de CRLF y de mojibake, y `grep -nE '(^|[^a-zA-Z])(const|let) |=>' index.html` sin resultados en el JS.

- [ ] **Step 12: Commit**

```bash
git add index.html
git commit -m "Home: calza con la app y separa Uso particular de Flotas"
```

---

### Task 4: ¿Cómo funciona?

**Files:**
- Modify: `como-funciona/index.html`

Todos los reemplazos van anclados en el markup visible (`hw-step__title`, `hw-step__text`, `faq__q`, `faq__a`): el JSON-LD repite estos textos más arriba en el archivo.

- [ ] **Step 1: Paso 01.**
  - Título → `Crea tu cuenta y carga tus vehículos con IA`
  - Texto → `Registra cada vehículo a mano o usa la Carga inteligente: sueltas hasta 40 PDF o fotos de sus documentos y la IA detecta el tipo, la patente, el vencimiento, la marca, el modelo, el año y el color. Agrupa todo por patente y te propone qué crear; tú revisas antes de importar. Si operas como empresa, puedes sumar tus datos (RUT, razón social y giro); si son los autos de tu casa, no hace falta.`
  - Chips: `Importar desde Excel` → `Carga inteligente con IA`; agregar `Hasta 40 archivos` entre los dos; `Datos de empresa opcionales` se queda.

- [ ] **Step 2: Paso 02.** Texto → `Permiso de Circulación, Revisión Técnica, SOAP, Certificado de Homologación (C.H.I.-e), Padrón y cualquier otro con el nombre que quieras. Puedes subir el PDF o sacarle fotos —hasta 10 hojas por documento, con recorte— y TapCar las junta en un PDF. La IA te sugiere la fecha de vencimiento y tú la confirmas; desde ahí, TapCar calcula el estado de cada documento y lo mantiene a la vista.` Los tres badges se quedan.

- [ ] **Step 3: Paso 03 (conductores).**
  - Texto → `Cada conductor queda registrado con un PIN de 4 dígitos que tú le asignas. No crean cuenta, no descargan nada y no tienen que recordar una contraseña. Si ya los tienes en una planilla, pegas las filas desde Excel y quedan importados. Puedes cambiar el PIN o desactivar a un conductor cuando quieras.`
  - Chips: agregar al principio `<span class="plan-tag">Solo en Flotas</span>`; luego `PIN de 4 dígitos`, y `Sin cuentas ni apps` → `Importar desde Excel`.

- [ ] **Step 4: Paso 04 (chip).**
  - Texto → `Cada vehículo tiene una URL única. La grabas en su chip NFC desde tu propio celular si es Android; en iPhone, con la app NFC Tools y la guía que te damos. Lo dejas donde más te acomode: pegado al parabrisas o de llavero, junto a las llaves. Va un chip por cada vehículo que registres, incluido en tu plan: el chip no se cobra, solo el despacho, desde $2.000.`
  - Chips: `Una URL por vehículo`, agregar `Android o iPhone`, `Parabrisas o llavero`.

- [ ] **Step 5: Nota de la fase 2.** `Desde acá todo parte del mismo gesto. La misma ficha resuelve tres cosas distintas según quién la abra: el conductor, quien fiscaliza y tú.` → `Desde acá todo parte del mismo gesto. La misma ficha resuelve cosas distintas según quién la abra: quien fiscaliza, tú y, en Flotas, el conductor.`

- [ ] **Step 6: Paso 05.** Texto sin cambios. Chips: agregar al principio `<span class="plan-tag">Solo en Flotas</span>`.

- [ ] **Step 7: Paso 06.**
  - Título: `Al terminar, lo entrega con dos fotos` → `Al terminar, lo entrega con fotos` (agregado en la ejecución: el texto nuevo ya no fija dos fotos).
  - Texto → `Otro Tap, elige «Entregar» y sube las fotos que tú definiste, por ejemplo el tablero y la cabina. La IA lee el kilometraje, la bencina y la limpieza; tú confirmas o corriges con un clic. Si hay un golpe o una falla, el conductor lo reporta ahí mismo: el daño lo informa él, la IA no lo analiza. TapCar además marca «Revisar consumo» cuando el uso gastó más de lo esperado —si configuraste el rendimiento y el estanque—, detecta si la foto del odómetro es antigua o reenviada y te avisa si un uso pasa de 12 horas.`
  - Chips: `<span class="plan-tag">Solo en Flotas</span>`, `Lectura por IA`, `Reporte de daños`, `Revisar consumo`.

- [ ] **Step 8: Paso 07.**
  - Texto → `Quien fiscaliza acerca su teléfono y se abre la ficha pública: el vehículo, sus documentos con la fecha de vencimiento y el estado de cada uno, las mantenciones y el aviso de daño si hay uno activo. Es de solo lectura — no hay login, no se edita nada y no se accede a tu cuenta. ¿Vas a un lugar sin señal? Guarda la ficha en tu teléfono y la abres sin conexión durante 7 días.`
  - Chips: `Solo lectura`, `Sin login`, agregar `Sin conexión, 7 días`.

- [ ] **Step 9: Paso 08.**
  - Texto → `Ves los documentos y las mantenciones con su estado, una etiqueta si a un vehículo le falta un documento obligatorio, y categorías, buscador y filtros para encontrar cualquier vehículo. Los recordatorios llegan por correo antes de cada vencimiento y de cada mantención. En Flotas, además ves qué vehículo está en uso y por quién, las alertas de daños y de usos sin entrega, la bitácora, y reportes que descargas en Excel o PDF.`
  - Chips: `Estado de la flota` → `Documentos y mantenciones`; `Alertas` y `Bitácora y reportes` se quedan.

- [ ] **Step 10: FAQ.** Las preguntas se quedan salvo donde se indica. Respuestas nuevas:
  1. **¿Hay que instalar alguna app?** → `No para usar TapCar: ni tú, ni tus conductores, ni quien fiscaliza. El chip abre una página web en el navegador del teléfono. La única excepción es grabar el chip desde un iPhone, que se hace con la app NFC Tools.`
  2. **¿Qué pasa si el teléfono no lee NFC?** → `Cada vehículo tiene una URL única, así que la ficha se abre igual desde el enlace. El Tap es el atajo, no el requisito. Y si vas a estar sin señal, guarda la ficha en tu teléfono: se abre sin conexión durante 7 días.`
  3. **¿Qué ve exactamente quien fiscaliza?** → `La ficha pública de solo lectura: el vehículo, sus documentos con la fecha de vencimiento y el estado de cada uno, sus mantenciones y el aviso de daño si hay uno activo. No ve tu panel, no puede editar nada ni entrar a tu cuenta.`
  4. **¿Mis conductores necesitan una cuenta?** → `No. En Flotas se identifican con un PIN de 4 dígitos que tú les asignas, y puedes cambiarlo o desactivar a un conductor en cualquier momento. Si quieres que el conductor fijo de un vehículo lo mantenga él mismo, puede tener su propia cuenta: ve solo ese vehículo, sube documentos y mantenciones y recibe los avisos. Esa cuenta se cobra aparte.`
  5. **¿Qué documentos puedo cargar?** → `Permiso de Circulación, Revisión Técnica, SOAP, Certificado de Homologación (C.H.I.-e) y Padrón, y cualquier otro con el nombre que le pongas. Cada uno lleva su archivo —un PDF, o fotos de hasta 10 hojas que TapCar convierte en PDF— y su fecha de vencimiento. El Certificado de Gases no va aparte: viene dentro de la Revisión Técnica.`
  6. **¿Cómo me entero de que algo está por vencer?** → `Cada documento muestra su estado —Vigente, Por vencer o Vencido— y te llega un correo de recordatorio antes del vencimiento, con un botón para renovar. Las mantenciones avisan igual cuando están próximas o vencidas, y si a un vehículo le falta un documento obligatorio, te lo recordamos por correo una vez al mes.`
  7. **¿Y si un conductor no entrega el vehículo?** → `Queda como un uso sin entrega formal y aparece en la bandeja de alertas del panel, junto con los daños reportados. Si un uso pasa de 12 horas —o del plazo que elijas— te avisamos, y puedes cerrarlo tú. Esto es parte de Flotas, el plan con conductores.`
  8. **¿Cuánto demora dejar la flota lista?** → `Depende del tamaño, pero la Carga inteligente hace la parte lenta: sueltas hasta 40 PDF o fotos de los documentos y la IA te propone los vehículos armados, que revisas antes de importar. En una flota mediana queda listo en una tarde; grabar y pegar cada chip toma un par de minutos por vehículo.`
  9. **¿Puede entrar más de una persona al panel?** → `En Flotas, sí: invitas por correo hasta 5 miembros por empresa, con rol de Administrador, Editor o Visor. Las cuentas de conductor fijo no ocupan lugar en ese tope. En Uso particular la cuenta es solo tuya.`

- [ ] **Step 11: Verificar**: `Certificado de Gases` aparece en el texto visible una sola vez (la respuesta 5, que explica que no va aparte); `desde Excel` solo aparece asociado a conductores (paso 03); `plan-tag` aparece 3 veces; siguen existiendo 8 `.hw-step` y 9 `.faq__item`. Chequeo de CRLF y mojibake.

- [ ] **Step 12: Commit**

```bash
git add como-funciona/index.html
git commit -m "Como funciona: carga inteligente, documentos reales y lo que es de Flotas"
```

---

### Task 5: Planes

**Files:**
- Modify: `planes/index.html`

- [ ] **Step 1: Subtítulo del hero** (`.pl-hero__lead`): `$2.500 por vehículo al mes para uso particular, y tarifa por flota desde 5 vehículos. Documentos, uso con PIN, panel de control y fiscalización incluidos. Sin permanencia — cambia o cancela cuando quieras.` → `$2.500 por vehículo al mes para uso particular, y tarifa por flota desde 5 vehículos. Documentos, ficha NFC, recordatorios y mantenciones en los dos planes; conductores con PIN, reportes y equipo en Flotas. Sin permanencia — cambia o cancela cuando quieras.`

- [ ] **Step 2: "Todo incluido" — lead de Particular.** El texto `Una sola suscripción por vehículo, con toda la plataforma. Sin extras ni letra chica.` aparece dos veces (el HTML inicial de `[data-included-lead]` y `LEAD.particular` en el JS). Las dos pasan a `Una sola suscripción por vehículo, con todo lo que necesitas para tus autos. Sin extras ni letra chica.` `LEAD.flota` no cambia.

- [ ] **Step 3: Primer grupo.** Título `Para cualquier vehículo` → `En los dos planes`. La lista queda con estos ítems, en este orden, con el markup de los de hoy (`included__item` con su check):
  1. `Un chip NFC por vehículo, incluido — el chip no se cobra, solo el despacho, desde $2.000` (el de hoy)
  2. `Tus documentos listos para mostrar en fiscalización — solo lectura, y sin conexión por 7 días`
  3. `Carga inteligente: la IA arma tus vehículos a partir de los PDF o fotos de sus documentos`
  4. `Aviso por correo antes de que venza cada documento` (el de hoy)
  5. `Mantenciones con pauta por meses, estado y avisos por correo`
  6. `Datos del vehículo a mano: combustible, neumáticos, transmisión y más` (el de hoy)
  7. `Transfiere un vehículo a otra cuenta si lo vendes o lo cedes`
  8. `Sin permanencia — cancela cuando quieras` (el de hoy)

- [ ] **Step 4: Segundo grupo** (`data-grupo="flota"`, el primero de los dos). Título `Si tienes conductores o equipo` → `Solo en Flotas`. Ítems:
  1. `Conductores con PIN que toman y entregan el vehículo con un Tap`
  2. `Al entregar, las fotos que tú defines, y la IA anota kilometraje, bencina y limpieza`
  3. `Bitácora, alertas de daños y de usos sin entrega, y control de consumo y de usos largos`
  4. `Reportes en Excel y PDF, y la evolución de km, usos u horas`
  5. `Pauta de mantención también por kilómetros`
  6. `Invita a tu equipo (hasta 5 personas) como Administrador, Editor o Visor` (el de hoy)

  El grupo "Conductor fijo" no cambia.

- [ ] **Step 5: Puentes de la calculadora** (JS de `renderParticular` y `renderFlota`):
  - `' también puedes tomar Flotas: cuesta un poco más al mes y suma cuentas de conductor y reportes de uso.'` → `' también puedes tomar Flotas: cuesta un poco más al mes y suma conductores con PIN, Tomar/Entregar, reportes y equipo.'`
  - `' vehículos el plan es Flotas, que además suma cuentas de conductor y reportes de uso.'` → `' vehículos el plan es Flotas, que además suma conductores con PIN, Tomar/Entregar, reportes y equipo.'`
  - `' también puedes tomar Uso particular: cuesta menos, pero no incluye cuentas de conductor ni reportes de uso.'` → `' también puedes tomar Uso particular: cuesta menos, pero no incluye conductores, Tomar/Entregar, reportes ni equipo.'`

- [ ] **Step 6: FAQ** (anclado en `faq__a`; el JSON-LD repite los textos):
  - **¿Cuál de los dos planes me toca?** → `Depende de cuántos vehículos tengas y de qué necesitas. Con menos de 5 vehículos solo existe Uso particular. Desde 11 el plan es Flotas. Entre 5 y 10 eliges tú. Uso particular trae documentos, ficha NFC, recordatorios, mantenciones, datos del vehículo, transferencia de vehículos y el chip. Flotas suma conductores con PIN, Tomar/Entregar con fotos, bitácora, alertas, reportes, equipo de hasta 5 personas y cuentas de conductor, y cuesta algo más al mismo número de vehículos. Si no tienes conductores, Uso particular te sirve igual. Sobre 100 vehículos armamos la propuesta contigo: el plan no tiene tope, lo que llega hasta 100 es contratarlo solo desde la web.`
  - **¿Cómo se paga?** → `Con tarjeta, a través de Flow. El cobro es automático: al crear la cuenta se cobra el primer período, y los siguientes se cobran solos. La factura electrónica del SII llega en una próxima etapa.`
  - **¿Necesito instalar una app?** → `No. Ni tú, ni tus conductores, ni quien fiscaliza: todo se abre con un toque al chip NFC o desde el panel web. La única excepción es grabar el chip desde un iPhone, que se hace con la app NFC Tools.`
  - **¿Y si sumo más vehículos?** → `Los sumas tú desde el panel cuando quieras, y se cobra la diferencia prorrateada. También puedes bajar vehículos, pasar de mensual a anual, usar un código promocional y revisar tu historial de pagos. Uso particular llega hasta 10 vehículos: si pasas de ahí, necesitas el plan Flotas. Te enviamos los chips de los vehículos nuevos.`
  - **¿Puedo cancelar?** → `Sí, cuando quieras, sin contratos de permanencia ni penalizaciones. La baja se agenda para el cierre de tu ciclo: hasta ahí sigues usando TapCar, y si te arrepientes la puedes deshacer.`
  - Las otras cuatro (¿Cuánto cuesta?, conductor fijo, IVA, chip) no cambian.

- [ ] **Step 7: Verificar**
  - `python tools/precios.py` → `OK`.
  - Ningún texto visible dice `coordinamos el cobro`, `uso con PIN, panel de control`, `toda la plataforma. Sin extras` ni `cuentas de conductor y reportes de uso`.
  - En el navegador (`python -m http.server 4310`, `/planes/`): con Particular en 7 el puente dice "conductores con PIN, Tomar/Entregar, reportes y equipo"; en 10 dice el texto del tope; con Flotas en 7 la vuelta dice "no incluye conductores, Tomar/Entregar, reportes ni equipo"; el grupo "Solo en Flotas" no aparece con la pill de Particular. Consola sin errores.
  - Chequeo de CRLF y mojibake; ES5.

- [ ] **Step 8: Commit**

```bash
git add planes/index.html
git commit -m "Planes: Particular sin PIN ni panel, cobro con Flow y autogestion"
```

---

### Task 6: ¿Es legal?

**Files:**
- Modify: `legal/index.html`

- [ ] **Step 1: Fila "Certificado de Gases" de la tabla.** Texto de la tercera celda: `Va junto con la revisión técnica y sigue la misma lógica.` → `Se emite junto con la revisión técnica y se muestra con ella: en TapCar no es un documento aparte.`

- [ ] **Step 2: "El riesgo real es el teléfono, no la ley".** Texto → `Sin batería, no muestras nada: por eso conviene un respaldo impreso en la guantera, sobre todo en viajes largos. La señal pesa menos: la ficha de TapCar se puede guardar en el teléfono y abrir sin conexión durante 7 días, y se abre desde su enlace aunque el teléfono no lea NFC.`

- [ ] **Step 3: "Para ser claros".** En `.legal-answer__text` del bloque "TapCar no emite ni valida ningún documento": `Guarda y muestra los archivos que tú subes, tal como los subiste, con la fecha de vencimiento que tú registras.` → `Guarda y muestra los documentos que tú subes, con la fecha de vencimiento que tú confirmas.` El resto del párrafo se queda.

- [ ] **Step 4: FAQ** (anclado en `faq__a`):
  - **¿Necesito llevar igual los originales impresos?** → `No es una exigencia legal para estos documentos, pero sí una precaución razonable: si te quedas sin batería, no puedes mostrar nada. Contra la falta de señal, la ficha de TapCar se puede guardar en el teléfono y abrir sin conexión durante 7 días. Aun así, conviene un respaldo impreso en la guantera en viajes largos.`
  - **¿Quien abre mi ficha NFC puede ver algo más de mi cuenta?** → `No. La ficha pública es de solo lectura: muestra el vehículo, sus documentos con su estado, sus mantenciones y el aviso de daño si hay uno activo. No hay login, no se edita nada y no da acceso a tu cuenta ni al resto de tus vehículos.`

- [ ] **Step 5: Verificar**: siguen 8 `.faq__item`; la tabla sigue con sus 6 filas; `sin señal, no puedes mostrar nada` ya no aparece; chequeo de CRLF y mojibake.

- [ ] **Step 6: Commit**

```bash
git add legal/index.html
git commit -m "Legal: la ficha se abre sin conexion y el Certificado de Gases va con la revision tecnica"
```

---

### Task 7: Página nueva `/socios/`

**Files:**
- Create: `socios/index.html`

**Interfaces:**
- Consumes: `tipo` de la Tarea 1; `.plan-tag`, `.socios-grid`, `.contacto-box` y `select.form__input` de la Tarea 2.

- [ ] **Step 1: Esqueleto.** Copiar `legal/index.html` a `socios/index.html` y conservar: `<head>` (con los metadatos cambiados abajo), el `<style>` incrustado, el `<header class="nav">` (ningún enlace con `is-active`), el `<footer>`, el script del menú móvil y el de Vercel Analytics. Borrar el bloque JSON-LD (lo escribe `schema.py` en la Tarea 9) y todo el `<main>`, que se reemplaza por el de abajo. En el footer, en la columna "Empresa", agregar como primer enlace `<a href="/socios/" class="footer__link">Para empresas del rubro</a>`, y cambiar el texto del enlace `Términos y Condiciones` por `Términos y privacidad`.

- [ ] **Step 2: Metadatos.**
  - `<title>` y `og:title` y `twitter:title`: `TapCar para automotoras, aseguradoras y gestorías`
  - `description`, `og:description` y `twitter:description`: `Regálale TapCar a tus compradores o asegurados con códigos de un solo uso, o manda los documentos nuevos directo a la cuenta de tu cliente. Condiciones caso a caso.`
  - `canonical` y `og:url`: `https://tapcar.cl/socios/`

- [ ] **Step 3: `<main id="contenido">`**, en este orden:

**Hero** (`section.pl-hero > .pl-hero__inner`):
- eyebrow `Para empresas del rubro`
- `h1.pl-hero__title`: `TapCar para automotoras, aseguradoras y gestorías.`
- `p.pl-hero__lead`: `Tres formas de sumar TapCar a lo que ya haces con tus clientes. No se contratan desde la web: se piden al crear la cuenta y las aprobamos nosotros. Las condiciones se acuerdan caso a caso.`
- Botones, con el markup de `.lp-hero__actions` del home: `<a href="#contacto" class="btn btn--primary btn--lg">Conversemos</a>` y `<a href="https://app.tapcar.cl" class="btn btn--secondary btn--lg">Crear cuenta</a>`, dentro de un `div` con `style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap;margin-top:28px;"`.

**Perfiles** (`section.section > .container`): `.section__head` con eyebrow `Tres perfiles`, `h2.section__title` `Una forma de trabajar para cada rubro.` y sin lead. Después `div.socios-grid` con tres `div.card.card--p28.aud-card`, cada uno con: `div.tag-row` (ícono `icon-chip icon-chip--azul` + `span.plan-tag`), `h3.aud-card__title`, `p.aud-card__text`, `ul.aud-card__list` con `li.aud-card__item` que llevan el check verde del home (`aud-card__check`).

1. ícono `auto`, tag `Convenio`, **Automotoras** — `Regálale TapCar a quien te compra un auto.`
   - `Entregas códigos de un solo uso a tus compradores.`
   - `Desde el mesón transfieres el auto vendido con el código, y la cuenta del comprador queda armada: plan, vehículo y documentos.`
   - `Pagas por cada activación, el día 1 de cada mes.`
   - `Un portal con los códigos emitidos, los activados y lo del mes, con descargas en CSV.`
   - `Los vehículos de tu patio quedan cubiertos hasta un tope.`
2. ícono `escudo`, tag `Convenio`, **Aseguradoras** — `El mismo convenio, para regalarle TapCar a tus asegurados.`
   - `Entregas códigos de un solo uso a tus asegurados.`
   - `Pagas por cada activación, el día 1 de cada mes.`
   - `Un portal con los códigos emitidos, los activados y lo del mes, con descargas en CSV.`
3. ícono `enviar`, tag `Envíos`, **Gestorías** — `Manda el documento nuevo directo a la cuenta TapCar de tu cliente.`
   - `Envías el padrón, el permiso o el documento que tramitaste.`
   - `Tu cliente lo revisa con vista previa y lo acepta.`
   - `Queda en el vehículo que corresponde y, si ya había uno, reemplaza al anterior.`
   - `Ves tu historial de envíos, pero no la flota de tu cliente.`

**Cómo se empieza** (`section.section.section--surface > .container`): `.section__head` con eyebrow `Cómo se empieza`, `h2.section__title` `Tres pasos, y el tercero lo conversamos.` Después un `div.steps-grid` con tres `div.step > div.card.card--p28.card--fill`, cada uno con `span.step__num`, `span.icon-chip.icon-chip--azul` (íconos: `enviar`, `escudo`, `tarjeta`), `h3.step__title` y `p.step__text`:
- `01` **Cuéntanos de tu empresa** — `Déjanos tus datos en el formulario de abajo, o crea tu cuenta en app.tapcar.cl y elige «Otra cosa»: te pedimos la razón social, el RUT y un teléfono.`
- `02` **Revisamos y aprobamos el perfil** — `Estos perfiles no se activan solos. Revisamos cada solicitud y aprobamos el que corresponde a tu empresa.`
- `03` **Acordamos las condiciones** — `El precio de un convenio no se publica: lo conversamos contigo según tu volumen y tu operación.`

**FAQ** (`section.faq`, mismo markup que el FAQ de `/legal/`): eyebrow `Preguntas frecuentes`, `h2.faq__title` `Lo que suelen preguntarnos.`, y cinco `div.faq__item` con `h3.faq__q` y `p.faq__a`:
1. **¿Cuánto cuesta un convenio?** — `Se acuerda caso a caso. En los convenios de automotoras y aseguradoras se paga por cada código activado, el día 1 de cada mes; el valor lo conversamos contigo.`
2. **¿Qué recibe el comprador o el asegurado?** — `Un código de un solo uso para activar TapCar. En las automotoras, además, el auto se le transfiere desde el mesón con sus documentos, así que su cuenta queda armada: plan, vehículo y documentos.`
3. **¿La gestoría ve los vehículos de su cliente?** — `No. Ve su propio historial de envíos, pero no la flota del cliente. El cliente decide si acepta cada documento después de revisarlo con vista previa.`
4. **¿Podemos mandarles avisos a nuestros clientes?** — `Es posible, por ejemplo para un llamado a revisión, pero no viene activado en los convenios: es un servicio adicional que conversamos contigo.`
5. **¿Cómo pido uno de estos perfiles?** — `Escríbenos con el formulario de esta página, o crea tu cuenta y elige «Otra cosa»: te pedimos la razón social, el RUT y un teléfono. Revisamos la solicitud y la aprobamos nosotros.`

**Contacto** (`section.section#contacto > .container > div.contacto-box`):
- `h2.contacto-box__title`: `Conversemos`
- `p.contacto-box__text`: `Cuéntanos qué tipo de empresa eres y te contactamos para armar el convenio o habilitar los envíos.`
- `<form class="form" data-form-socios>` con, en este orden (ids con prefijo `s-` para no chocar con nada):
  - `div.form__campo`: label `Tipo de empresa` + `<select class="form__input" id="s-tipo" name="tipo" required>` con `<option value="">Elige una opción</option>`, `automotora` → `Automotora`, `aseguradora` → `Aseguradora`, `gestoria` → `Gestoría`, `otra` → `Otra empresa del rubro`.
  - `div.form__fila`: `Empresa` (`s-empresa`, `name="empresa"`, `maxlength="120"`, `required`, `autocomplete="organization"`) y `Tu nombre` (`s-nombre`, `name="nombre"`, `maxlength="120"`, `required`, `autocomplete="name"`).
  - `div.form__fila`: `Correo` (`s-email`, `type="email"`, `maxlength="160"`, `required`, `autocomplete="email"`) y `Teléfono <span class="form__opcional">(opcional)</span>` (`s-telefono`, `type="tel"`, `maxlength="40"`, `autocomplete="tel"`).
  - `div.form__campo`: `Mensaje <span class="form__opcional">(opcional)</span>` + `textarea.form__input.form__textarea` (`s-mensaje`, `maxlength="2000"`, `rows="3"`).
  - La trampa, igual a la de `/planes/`: `div.form__trampa[aria-hidden="true"]` con label `No llenes este campo` e `input#s-sitio name="sitio" tabindex="-1" autocomplete="off"`.
  - `<button type="submit" class="btn btn--primary btn--lg form__enviar" data-form-btn>Enviar consulta</button>` y `<p class="form__estado" data-form-estado role="alert"></p>`.
- Después del form: `div.form__ok[data-form-ok][hidden][tabindex="-1"]` con el mismo contenido que el de `/planes/` (ícono incluido): `Consulta enviada` / `Te respondemos a la brevedad al correo que nos dejaste.`
- `p.form__salida`: `O escríbenos directo a <a href="mailto:contacto@tapcar.cl">contacto@tapcar.cl</a>`

- [ ] **Step 4: Script del formulario**, antes del script del menú móvil. Es el de `/planes/` con estos cambios: selector `[data-form-socios]`, comentario de cabecera `// ── Envío de la consulta de empresas del rubro ────────────────`, y el cuerpo JSON manda `tipo`, `nombre`, `empresa`, `email`, `telefono`, `mensaje` y `sitio` (sin `vehiculos`). Todo lo demás —timeout de 12 s, botón deshabilitado, foco en la confirmación, mensaje de salida— igual. ES5.

- [ ] **Step 5: Incrustar el CSS actual** (la copia de `legal/` puede estar vieja si la Tarea 2 corrió antes: debería estar al día, pero se confirma) con el comando de la Tarea 2 agregando `'socios/index.html'` a la lista. Dejar el archivo en CRLF, como los demás.

- [ ] **Step 6: Verificar en el navegador** (`python -m http.server 4310`, `http://localhost:4310/socios/`):
  - La página carga sin errores de consola y sin scroll lateral a 375 px.
  - Las tres tarjetas se ven en tres columnas en escritorio y en una bajo 980 px.
  - Enviar el formulario vacío: el navegador frena en `Tipo de empresa`.
  - Con datos válidos, el servidor estático responde 501 a `POST /api/contacto`: el formulario tiene que mostrar el mensaje de error y rehabilitar el botón. (El envío real solo se prueba desplegado.)
  - El `<select>` muestra su flecha y el anillo de foco azul.
  - `grep -nE '(^|[^a-zA-Z])(const|let) |=>' socios/index.html` sin resultados.

- [ ] **Step 7: Commit**

```bash
git add socios/index.html
git commit -m "Socios: pagina para automotoras, aseguradoras y gestorias, con formulario"
```

---

### Task 8: /terminos/ pasa a ser los términos del sitio

**Files:**
- Modify: `terminos/index.html`

- [ ] **Step 1: Metadatos.**
  - `<title>`, `og:title`, `twitter:title`: `Términos de uso y privacidad del sitio | TapCar`
  - `description`, `og:description`, `twitter:description`: `Términos de uso de tapcar.cl y cómo tratamos los datos que dejas en este sitio. El servicio tiene sus propios términos, que aceptas al crear tu cuenta.`

- [ ] **Step 2: Hero.**
  - `h1`: `Términos y Condiciones` → `Términos de uso y privacidad`
  - lead: `Las reglas del servicio y cómo tratamos tus datos, en lenguaje simple. Si algo no te queda claro, escríbenos a …` → `Las reglas de este sitio y cómo tratamos los datos que dejas acá, en lenguaje simple. Si algo no te queda claro, escríbenos a …` (el enlace `mailto` se queda igual).

- [ ] **Step 3: Fechas** en `.doc__meta`: `Última actualización: 24 de septiembre de 2026` y `Vigente desde: 24 de septiembre de 2026`.

- [ ] **Step 4: Índice** (`.doc__toc-list`), once entradas: `#quienes` Quiénes somos · `#servicio` Qué es TapCar · `#alcance` Este sitio y el servicio · `#precios` Precios publicados · `#uso` Uso del sitio · `#datos` Qué datos tratamos · `#cookies` Cookies · `#derechos` Tus derechos · `#limites` Límites · `#cambios` Cambios a este documento · `#contacto` Contacto y ley aplicable.

- [ ] **Step 5: Reemplazar todas las `.doc__sec`** por estas once, con el mismo markup (`div.doc__sec#id > h2.doc__sec-title` + `p` / `ul > li`). Los enlaces internos llevan `href` relativo al sitio.

**1. Quiénes somos** (`#quienes`)
- `TapCar es un servicio operado por <strong>IMPULSE AI SpA</strong>, RUT <strong>78.479.762-7</strong>, sociedad constituida en Chile. En este documento nos referimos a esa empresa como «TapCar» o «nosotros»; y a ti, que visitas este sitio, como «tú».`
- `Estos términos rigen el uso de tapcar.cl. Al navegarlo o escribirnos desde sus formularios, los aceptas.`

**2. Qué es TapCar** (`#servicio`)
- `TapCar es una plataforma web para tener la documentación y las mantenciones de tus vehículos al día y mostrarlas con un toque a un chip NFC. Tiene dos planes —Uso particular y Flotas— y perfiles para automotoras, aseguradoras y gestorías. Lo que incluye cada plan está en <a href="/planes/">Planes</a>, y los perfiles para empresas del rubro, en <a href="/socios/">su propia página</a>.`
- `<strong>Qué no es:</strong> TapCar no emite, valida ni certifica ningún documento: guarda y muestra los que sube cada usuario. Tampoco es un servicio de rastreo: no registra la ubicación de los vehículos ni la de los conductores.`

**3. Este sitio y el servicio son cosas distintas** (`#alcance`)
- `Este documento cubre solo <strong>tapcar.cl</strong>, el sitio que estás leyendo. El servicio TapCar se usa en <strong>app.tapcar.cl</strong> y tiene sus propios términos y su propia política de privacidad, que aceptas al crear tu cuenta y que dependen del tipo de cuenta que abras.`
- `Lo que dice este sitio sobre el servicio es informativo. Si algo de acá no coincide con lo que aceptaste al crear tu cuenta, mandan los términos que aceptaste.`

**4. Precios publicados** (`#precios`)
- `Los precios de <a href="/planes/">Planes</a> son los vigentes. Los de Uso particular están en pesos chilenos con IVA incluido; los de Flotas, en UF más IVA. Las condiciones de cobro son las que aceptas al contratar.`
- `Los convenios con empresas del rubro no tienen precio publicado: se acuerdan caso a caso.`

**5. Uso del sitio** (`#uso`)
- `Puedes navegar este sitio y compartir sus enlaces libremente. Te pedimos no usar sus formularios para enviar publicidad, contenido ilícito o mensajes automatizados.`
- `La información de <a href="/legal/">¿Es legal?</a> es referencial y no constituye asesoría legal.`

**6. Qué datos tratamos en este sitio** (`#datos`)
- `Tratamos datos personales conforme a la Ley N° 19.628 sobre protección de la vida privada y a la normativa chilena que la complemente o reemplace. En este sitio son pocos:`
- lista:
  - `<strong>Lo que escribes en un formulario:</strong> nombre, empresa, correo, teléfono si lo das, la cantidad de vehículos o el tipo de empresa, y tu mensaje. Lo usamos solo para responderte. Nos llega por correo a contacto@tapcar.cl, a través de un proveedor de envío de correo.`
  - `<strong>Medición de visitas:</strong> contamos visitas y páginas vistas con Vercel Web Analytics, que entrega cifras agregadas, no usa cookies y no nos dice quién eres.`
  - `<strong>Registros técnicos:</strong> el servicio que aloja el sitio registra datos de cada visita, como la dirección IP y el navegador, para seguridad y para detectar fallas.`
  - `<strong>Tipografías:</strong> las fuentes del sitio se cargan desde Google Fonts, así que tu navegador se conecta a servidores de Google al abrir cada página.`
- `Algunos de estos proveedores almacenan información fuera de Chile. Guardamos las consultas que nos envías mientras nos sirvan para responderte y darles seguimiento, salvo que nos pidas borrarlas.`
- `<strong>No vendemos tus datos</strong> ni los usamos para publicidad de terceros.`

**7. Cookies** (`#cookies`)
- `Este sitio no instala cookies: ni propias, ni de publicidad, ni de seguimiento entre sitios. La app, en app.tapcar.cl, usa las suyas para mantener tu sesión; eso lo explican sus propios términos.`

**8. Tus derechos** (`#derechos`)
- `Puedes pedirnos en cualquier momento <strong>acceder</strong> a los datos que nos dejaste en este sitio, <strong>rectificarlos</strong>, <strong>eliminarlos</strong> o <strong>bloquear</strong> su tratamiento, en los casos que la ley permite. Escríbenos a <a href="mailto:contacto@tapcar.cl">contacto@tapcar.cl</a> y responderemos en el plazo que fije la normativa vigente.`
- `Los datos de tu cuenta de TapCar se rigen por la política de privacidad que aceptaste en app.tapcar.cl.`

**9. Límites** (`#limites`)
- `Ponemos nuestro mejor esfuerzo en que la información de este sitio sea correcta y esté al día, pero se entrega «tal como está» y puede cambiar sin aviso. No garantizamos que el sitio esté disponible sin interrupciones.`
- `Nada de lo anterior limita los derechos que la ley chilena te reconoce como consumidor.`

**10. Cambios a este documento** (`#cambios`)
- `Podemos actualizar este documento. La fecha de la última actualización siempre está al principio de esta página.`

**11. Contacto y ley aplicable** (`#contacto`) — los dos párrafos de hoy, sin cambios.

- [ ] **Step 6: Aviso final** (`.doc__aviso`): `<strong>Sobre este documento.</strong> Está escrito en lenguaje simple para que se entienda. Describe este sitio tal como funciona hoy y no sustituye una revisión legal.`

- [ ] **Step 7: El CTA** del final no cambia.

- [ ] **Step 8: Verificar**: 11 `.doc__sec` y 11 entradas en el índice, cada `href="#x"` del índice tiene su `id="x"`; `python tools/precios.py` sigue en `OK` (el documento ya no nombra tarifas: los tramos del despacho siguen en `/planes/`, `/como-funciona/` y `llms.txt`); chequeo de CRLF y mojibake.

- [ ] **Step 9: Commit**

```bash
git add terminos/index.html
git commit -m "Terminos: pasan a cubrir solo el sitio; el servicio tiene los suyos en la app"
```

---

### Task 9: Consistencia en todo el sitio

**Files:**
- Modify: `index.html`, `como-funciona/index.html`, `planes/index.html`, `legal/index.html`, `terminos/index.html` (footers)
- Modify: `sitemap.xml`, `tools/schema.py`, `tools/precios.py`, `llms.txt`, `README.md`
- Regenerated: el JSON-LD de las seis páginas

- [ ] **Step 1: Footers** de las cinco páginas viejas: en la columna "Empresa", agregar como primer enlace `<a href="/socios/" class="footer__link">Para empresas del rubro</a>`; y el texto del enlace `Términos y Condiciones` → `Términos y privacidad`. Comprobar que las seis páginas tienen los dos cambios.

- [ ] **Step 2: `sitemap.xml`.** `lastmod` de las cinco URLs existentes → `2026-09-24`. Agregar, después de `/planes/`:

```xml
  <url>
    <loc>https://tapcar.cl/socios/</loc>
    <lastmod>2026-09-24</lastmod>
    <priority>0.6</priority>
  </url>
```

- [ ] **Step 3: `tools/schema.py`.**
  - En `PAGINAS`, agregar `('socios/index.html', '/socios/', 'Empresas del rubro'),` después de Planes, y cambiar la etiqueta de términos a `'Términos de uso y privacidad'`.
  - `description` del producto →
    `'Plataforma chilena para tener la documentación y las mantenciones de tus vehículos al día y mostrarlas en una fiscalización con un toque a un chip NFC. Guarda el Permiso de Circulación, la Revisión Técnica, el SOAP, el Certificado de Homologación y el Padrón con su fecha de vencimiento y avisa por correo antes de que venzan. En el plan Flotas, además registra con un PIN quién usa cada vehículo y en qué estado lo entrega.'`
    (partida en varias líneas como la de hoy).
  - `featureList` →
    ```python
    'Carga inteligente: una IA arma los vehículos a partir de hasta 40 PDF o fotos de sus documentos',
    'Documentos del vehículo con fecha de vencimiento y estado: Vigente, Por vencer o Vencido',
    'Ficha pública de solo lectura que se abre con un chip NFC y se puede guardar sin conexión durante 7 días',
    'Recordatorios por correo antes de cada vencimiento',
    'Mantenciones con pauta, estado y avisos por correo',
    'Transferencia de un vehículo a otra cuenta con sus documentos y mantenciones',
    'Datos del vehículo: combustible, neumáticos, transmisión y aceite',
    'Plan Flotas: registro de uso por conductor con PIN de 4 dígitos, sin cuentas',
    'Plan Flotas: fotos de entrega con lectura automática de kilometraje, combustible y limpieza',
    'Plan Flotas: bitácora, alertas y reportes descargables en Excel y PDF',
    ```

- [ ] **Step 4: `tools/precios.py`.** Agregar `'socios/index.html',` a `REVISAR`, después de `legal/index.html`.

- [ ] **Step 5: `llms.txt`**, reemplazo completo por:

```markdown
# TapCar

> Plataforma chilena para tener la documentación y las mantenciones de tus vehículos al día y mostrarlas en una fiscalización con un toque a un chip NFC. Tiene dos planes, Uso particular y Flotas, y perfiles aparte para automotoras, aseguradoras y gestorías. El precio es por vehículo.

Operado por IMPULSE AI SpA (RUT 78.479.762-7), Chile. Contacto: contacto@tapcar.cl

## Qué resuelve (en los dos planes)

- **Documentación vehicular al día.** Cada vehículo guarda su Permiso de Circulación, Revisión Técnica, SOAP, Certificado de Homologación (C.H.I.-e) y Padrón, más cualquier otro documento con nombre libre. El Certificado de Gases no va aparte: viene dentro de la Revisión Técnica. Cada documento se sube como PDF o como fotos (hasta 10 hojas, con recorte, que se convierten en un PDF); al subirlo, una IA sugiere la fecha de vencimiento y el usuario la confirma. TapCar calcula el estado (Vigente, Por vencer, Vencido), avisa por correo antes de cada vencimiento y manda un recordatorio mensual si a un vehículo le falta un documento obligatorio.
- **Carga inteligente.** El usuario suelta hasta 40 PDF o fotos de documentos; la IA detecta el tipo, la patente, el vencimiento, la marca, el modelo, el año y el color, agrupa por patente y propone qué vehículos crear. El usuario revisa antes de importar.
- **Mantenciones.** Pauta por meses (y, solo en Flotas, también por kilómetros), con estado al día, próxima o vencida; registro con la foto de la constancia, de la que la IA lee la fecha y el km; avisos por correo.
- **Fiscalización en ruta.** Cada vehículo tiene una URL única que se abre acercando un teléfono a un chip NFC. La ficha pública es de solo lectura: muestra el vehículo, sus documentos con su estado, sus mantenciones y el aviso de daño si hay uno activo, sin login ni acceso a la cuenta del dueño. Se puede guardar en el teléfono para abrirla sin conexión durante 7 días. El chip se graba desde el propio celular en Android; en iPhone, con la app NFC Tools y una guía.
- **Transferir un vehículo** a otra cuenta, al venderlo o cederlo: se mueven los documentos y las mantenciones, y quien lo recibe acepta por correo aunque no tenga cuenta. Después hay que volver a grabar el chip, porque el enlace cambia.
- **Autogestión del plan.** Subir o bajar vehículos con prorrateo, pasar de mensual a anual, códigos promocionales, historial de pagos, y una baja que se agenda al cierre del ciclo y se puede deshacer.
- Categorías de vehículos, buscador y filtros en el panel.

## Qué suma el plan Flotas

- **Conductores con PIN.** Cada conductor toma y entrega el vehículo con un toque al chip y un PIN de 4 dígitos, sin crear cuenta ni instalar aplicaciones. Los conductores se importan pegando filas desde Excel; los vehículos no se importan desde Excel, se cargan con la Carga inteligente.
- **Tomar/Entregar con fotos.** Al entregar, el conductor sube las fotos que el dueño define y puede reportar daños. Una IA lee de las fotos el kilometraje, el combustible y la limpieza, que el dueño confirma o corrige. La IA no analiza daños: los reporta el conductor.
- **Control de la entrega.** Etiqueta "Revisar consumo" en usos con consumo anómalo (con el rendimiento y el estanque configurados), detección de la foto del odómetro antigua o reenviada, aviso de uso prolongado (12 horas por defecto, configurable) y cierre forzado de un uso que quedó abierto.
- **Panel, bitácora y alertas**, con avisos por correo de daños reportados y de incidencias al tomar el vehículo.
- **Reportes descargables:** Excel de 4 hojas (conductores, vehículos, uso por vehículo, vencimientos próximos), PDF de resumen ejecutivo y una matriz de evolución (km, usos u horas por vehículo o conductor, por día, semana o mes).
- **Equipo** de hasta 5 miembros, con rol de Administrador, Editor o Visor.
- **Cuentas de conductor fijo.** El titular de un vehículo entra con su propio usuario, ve solo su vehículo, sube documentos y mantenciones y recibe su propio resumen por correo. Se cobran aparte y no ocupan lugar en el equipo.

## Para empresas del rubro

Perfiles que no se contratan solos: se piden al crear la cuenta (razón social, RUT y teléfono) y TapCar los aprueba. Las condiciones se acuerdan caso a caso y no se publican.

- **Automotoras (Convenio).** Regalan TapCar a sus compradores con códigos de un solo uso y pagan por cada activación, el día 1 de cada mes. Desde el mesón transfieren el auto vendido con el código, y la cuenta del comprador queda armada: plan, vehículo y documentos. Tienen un portal con los códigos emitidos, los activados y lo del mes, con descargas en CSV, y los vehículos de su patio quedan cubiertos hasta un tope.
- **Aseguradoras (Convenio).** El mismo modelo, para regalarle TapCar a sus asegurados.
- **Gestorías (Envíos).** Mandan el documento nuevo (padrón, permiso, etc.) directo a la cuenta TapCar del cliente, que lo revisa con vista previa y lo acepta; queda en el vehículo que corresponde, reemplazando al anterior. La gestoría ve su historial de envíos, pero no la flota del cliente.

## Qué NO es

- **No es un rastreador GPS.** TapCar no registra la ubicación de los vehículos ni de los conductores.
- **No emite ni certifica documentos.** Solo almacena y muestra los archivos que el usuario sube.
- **No reemplaza los originales.** La ficha digital sirve como respaldo; la obligación de portar los originales, cuando la normativa la exija, se mantiene.
- **La IA no decide por el usuario.** Sus lecturas (vencimientos, km, combustible, limpieza) son sugerencias que el usuario confirma, y no analiza daños.

## Precios

- Uso particular (1 a 10 vehículos): **$2.500 CLP por vehículo al mes**, o **$22.000 CLP por vehículo al año** (equivale a $1.833 al mes, un 27% menos). IVA incluido.
- Flotas (desde 5 vehículos): vehículo **UF 0,057 al mes** o **UF 0,5 al año**; cuenta de conductor fijo **UF 0,12 al mes** o **UF 1,05 al año**. Las dos tarifas dan 27% de descuento en el plan anual. Valores más IVA. Entre 5 y 10 vehículos conviven los dos planes y el cliente elige: Flotas cuesta algo más y a cambio habilita conductores con PIN, Tomar/Entregar, bitácora, alertas, reportes, equipo y cuentas de conductor. Desde 11 es obligatorio Flotas. El plan Flotas no tiene tope de vehículos; lo que llega hasta 100 es contratarlo solo desde la web, y sobre eso se cotiza caso a caso.
- **Forma de pago:** tarjeta, a través de Flow, con cobro automático. Al crear la cuenta se cobra el primer período. **No hay período de prueba gratis.**
- Sin permanencia ni contratos mínimos; la baja se agenda al cierre del ciclo.
- Un chip NFC por cada vehículo registrado va incluido en el plan, sin costo. Solo se paga el despacho: **$2.000 hasta 2 chips, $5.000 de 3 a 50, $10.000 de 51 a 100**, con IVA incluido. Se cobra en cada envío, no una sola vez; sobre 100 vehículos se cotiza.

## Validez legal en Chile

Mostrar documentos vehiculares en formato digital es válido como respaldo, siempre que sean oficiales y legibles. Se apoya en la Ley N° 19.799 sobre documentos electrónicos y firma electrónica, y en el Oficio N° E71389/2021 de la Contraloría General de la República, que señala que los permisos de circulación y certificados electrónicos emitidos conforme a esa ley tienen la misma validez que los de papel y pueden exhibirse desde un dispositivo electrónico. No constituye asesoría legal.

## Páginas

- [Inicio](https://tapcar.cl/): qué es TapCar, los dos planes, los tres pasos y la ficha NFC.
- [Cómo funciona](https://tapcar.cl/como-funciona/): el paso a paso completo en dos fases (puesta en marcha y día a día) y 9 preguntas frecuentes.
- [Validez legal](https://tapcar.cl/legal/): en qué normativa se apoya mostrar los documentos en digital, con las referencias oficiales.
- [Planes y precios](https://tapcar.cl/planes/): calculadora por cantidad de vehículos, qué incluye cada plan y 9 preguntas frecuentes.
- [Para empresas del rubro](https://tapcar.cl/socios/): convenios para automotoras y aseguradoras, envíos para gestorías, y un formulario de contacto.
- [Términos de uso y privacidad](https://tapcar.cl/terminos/): reglas de este sitio y cómo trata los datos que se dejan en él. El servicio tiene sus propios términos, que se aceptan al crear la cuenta.

## Notas para citar

- El nombre correcto de la marca es **TapCar** (una palabra, T y C mayúsculas).
- El precio es **por vehículo**, no por cuenta ni por usuario.
- El país de operación es **Chile**. Uso particular se cobra en **pesos chilenos (CLP)** con IVA incluido; Flotas, en **UF** más IVA.
```

- [ ] **Step 6: `README.md`.**
  - Primer párrafo: `…registra quién lo usa con un PIN y abre su ficha pública…` → `…en el plan Flotas registra quién lo usa con un PIN, y abre su ficha pública…`. Segundo párrafo: `Sirve tanto para un auto particular como para una flota de empresa; el precio es por vehículo.` → `Tiene dos planes —Uso particular y Flotas— con precio por vehículo, y perfiles aparte para automotoras, aseguradoras y gestorías.`
  - Tabla de páginas: agregar la fila `| Empresas del rubro | [`socios/index.html`](socios/index.html) | Los tres perfiles (automotoras y aseguradoras con Convenio, gestorías con Envíos), cómo se empieza, FAQ de 5 preguntas y formulario de contacto. Enlazada desde la franja del home y el footer, no desde el nav |` después de Planes; la fila de Términos pasa a `| Términos de uso y privacidad | … | Términos del **sitio** y cómo trata los datos que se dejan en él. El servicio tiene sus propios términos, que la app pide aceptar al crear la cuenta según el tipo de cuenta. Enlazada solo desde el footer, no desde el nav |`. En la fila del home, agregar "franja de empresas del rubro" después de "¿Para quién es?".
  - Árbol de estructura: agregar `├── socios/index.html` después de `planes/index.html`, y en `api/contacto.js` cambiar el comentario a `# Función serverless: formularios de flota y de socios -> Resend`.
  - Comando de reincrustado: agregar `'socios/index.html'` a la lista.
  - "Rotor del hero": `la palabra de "Tu _flota_ a un Tap." rota entre flota/auto/moto/camioneta` → `la palabra de "Tu _vehículo_ a un Tap." rota entre vehículo/flota/auto/moto/camioneta`.
  - Después del ítem "Formulario de flota grande", agregar: `- **Formulario de empresas del rubro** (socios) — el mismo patrón que el de flota grande, con un campo \`tipo\` (automotora, aseguradora, gestoría u otra) y sin cantidad de vehículos.`
  - Sección Schema.org: `Planes suma \`FAQPage\` (6)` → `Planes suma \`FAQPage\` (9)`, y agregar `y Empresas del rubro un \`FAQPage\` de 5`.
  - Sección Backend: `Recibe el formulario del tramo "más de 100 vehículos" de \`/planes/\`` → `Recibe dos formularios: el del tramo "más de 100 vehículos" de \`/planes/\` y el de empresas del rubro de \`/socios/\`, que se distingue por el campo \`tipo\`. Los manda`.
  - "Datos de producto que la copy asume": el último ítem (el del hero) pasa a `El hero declara **+600 vehículos operando**, la última medición real al 2026-09-24. Es una cifra escrita a mano en \`index.html\`, no viene de la app: hay que actualizarla cuando cambie o queda desfasada sin que nada avise.` Y agregar al final:
    - `**Uso particular no tiene conductores, PIN, Tomar/Entregar, bitácora, alertas, reportes ni equipo**: todo eso es de Flotas, y el sitio lo marca con la etiqueta \`.plan-tag\`. Lo que la auditoría de la app (2026-09-24) no asigna a Flotas —Carga inteligente, IA de vencimiento, fotos a PDF, categorías, copia sin conexión, autogestión del plan— se presenta como de los dos planes.`
    - `**No prometer**: que la IA analiza daños (solo lee km, bencina y limpieza); la pauta de mantención por km en Particular (ahí el km no se actualiza); que los envíos de gestoría avisan el vencimiento (llegan sin fecha); las notificaciones de un convenio a sus clientes, salvo como servicio adicional a conversar; una prueba gratis (terminó el 2026-09-01); chips o facturación manual para socios.`
    - `El **cobro es automático con tarjeta vía Flow**; al crear la cuenta se cobra el primer período. La factura electrónica del SII todavía no está.`
    - `Los **perfiles del rubro** (automotoras, aseguradoras, gestorías) se piden al crear la cuenta con "Otra cosa" y los aprueba TapCar. Sus precios no se publican.`
  - Sección llms.txt: agregar al final `Hoy además declara lo que el sitio no promete —la prueba gratis, el análisis de daños—, para que un modelo no lo invente.`

- [ ] **Step 7: Regenerar el JSON-LD y correr todo**

```bash
python tools/schema.py
python tools/schema.py > /dev/null && git status --short
python tools/precios.py
node tools/test_contacto.js
```

Expected: `schema.py` lista seis páginas y `socios/index.html` sale con `Organization · WebSite · WebPage · BreadcrumbList · FAQPage(5)`; la segunda corrida no agrega archivos modificados nuevos; `precios.py` en `OK`; las pruebas en `0 fallo(s)`.

- [ ] **Step 8: Barrido final de texto visible** (sin JSON-LD ni `<style>`) en las seis páginas y en `llms.txt`:

```bash
python - <<'EOF'
import io, re
fs = ['index.html','como-funciona/index.html','planes/index.html','legal/index.html','terminos/index.html','socios/index.html','llms.txt']
malos = ['+500', 'Nunca más una multa', 'coordinamos el cobro', 'Importar desde Excel</span>\r\n                <span class="hw-chip">Datos', 'uso con PIN, panel de control', 'Hasta 5 miembros por cuenta', 'prueba gratis']
for f in fs:
    t = io.open(f, encoding='utf-8').read()
    t = re.sub(r'<script type="application/ld\+json".*?</script>|<style>.*?</style>', '', t, flags=re.S)
    for m in malos:
        if m in t: print('MAL', f, m)
    n = t.count('Certificado de Gases')
    if n: print('  %s: "Certificado de Gases" x%d' % (f, n))
print('fin')
EOF
```

Expected: ningún `MAL` salvo `prueba gratis` en `llms.txt` (ahí se niega a propósito); "Certificado de Gases" solo en `legal/index.html` (tabla), `como-funciona/index.html` (la FAQ que explica que no va aparte) y `llms.txt` (la misma aclaración).

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "Consistencia: socios en footer, sitemap, JSON-LD, llms.txt y README"
```

---

## Verificación final (la hace el controlador)

- [ ] `node tools/test_contacto.js`, `python tools/precios.py`, `python tools/schema.py` dos veces: todo en verde e idempotente.
- [ ] CRLF en los seis HTML, sin LF sueltos; sin mojibake.
- [ ] En el navegador, las seis páginas: consola sin errores, sin scroll lateral a 375 px.
- [ ] Capturas para el usuario: la franja del rubro y las etiquetas de plan del home, "Por qué TapCar", `/socios/` completo (escritorio y móvil), el "Todo incluido" de Planes con cada pill, y /terminos/.
- [ ] Nada se mergea ni se publica sin autorización.
