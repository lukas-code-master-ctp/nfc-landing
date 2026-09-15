# /planes — Uso particular y Flotas: plan de implementación

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Partir el precio de `/planes` en dos sistemas seleccionables con pills — Uso particular (1–10 vehículos, en pesos) y Flotas (desde 10, en UF más IVA, con cobro por cuenta de conductor fijo).

**Architecture:** Sitio estático sin build ni bundler. La página `planes/index.html` se edita directo; el CSS vive en `styles.css` y se re-incrusta en las cinco páginas con un one-liner de Python; el JSON-LD lo regenera `tools/schema.py`. La calculadora pasa de una tarjeta a dos tarjetas `.calc` hermanas que se alternan con `hidden`, cada una con su función de render.

**Tech Stack:** HTML estático, CSS a mano con custom properties, JavaScript ES5 incrustado (sin dependencias), Python 3 + BeautifulSoup solo para regenerar el JSON-LD.

**Spec:** [`docs/superpowers/specs/2026-09-15-planes-particular-flotas-design.md`](../specs/2026-09-15-planes-particular-flotas-design.md)

## Global Constraints

- **Tarifas, exactas.** Particular: `$2.500`/mes, `$22.000`/año. Flota vehículo: `UF 0,057`/mes, `UF 0,5`/año. Flota cuenta de conductor: `UF 0,12`/mes, `UF 1,05`/año. Las tres dan **−27%** al redondear.
- **Nunca calcular desde el equivalente mensual redondeado.** 12 × $1.833 da $21.996, no $22.000. Todo el dinero sale de las cifras `mes` y `anio`.
- **IVA.** Particular en pesos, IVA incluido, sin nota. Flotas en UF, con la frase literal `Valores en UF, no incluyen IVA.` en la letra chica.
- **Rangos.** Particular 1–10. Flotas 10–100 más el centinela del tramo "Más de 100". Cuentas de conductor: 0 al número de vehículos.
- **JavaScript ES5.** Nada de `const`, `let`, arrow functions ni template literals: el resto de los scripts del sitio son ES5 y no hay transpilación.
- **Idioma.** Todo el copy en español neutro, con "tú". Los números en formato chileno (`$22.000`, `UF 0,5`).
- **`styles.css` es la fuente editable.** Los cinco HTML llevan una copia literal dentro de su `<style>`; hay que re-incrustarla tras cada cambio.
- **El JSON-LD no se edita a mano.** Sale de `python tools/schema.py`.

## File Structure

| Archivo | Responsabilidad | Tarea |
|---|---|---|
| `styles.css` | Fuente del design system. Se le suman las clases del selector de plan y de las piezas nuevas de la calculadora. | 1 |
| `index.html`, `planes/index.html`, `como-funciona/index.html`, `legal/index.html`, `terminos/index.html` | Cada uno embebe una copia literal de `styles.css` en su `<style>`. Se regeneran con el one-liner. | 1 |
| `planes/index.html` § `.pricing` | Markup del selector de plan, las dos tarjetas `.calc` y la columna de incluidos. | 1 |
| `planes/index.html` § script de la calculadora | Tarifas, render por plan y listeners. | 2 |
| `planes/index.html` § `<head>`, `.pl-hero`, `.faq`, `.cta` | Copy visible y metadatos. | 3 |
| `tools/schema.py` § `offers` | Las ofertas de precio del `SoftwareApplication`. | 4 |
| `llms.txt`, `README.md` | Notas de precio para agentes y para quien mantiene el repo. | 5 |

## Servidor para verificar

Varias tareas piden mirar la página. Se levanta una sola vez, con la configuración que ya existe en `.claude/launch.json`:

```bash
python -m http.server 4310
```

La página queda en `http://localhost:4310/planes/`. Sírvela, no la abras con doble clic: los enlaces entre páginas son absolutos.

---

### Task 1: Estructura estática — CSS y markup de los dos planes

Deja la página renderizando las dos tarjetas con números escritos a mano en el HTML. Todavía no calcula nada: eso es la Tarea 2. El entregable es que Particular se vea igual que hoy y que Flotas, al quitarle el `hidden` a mano en el inspector, se vea bien alineada.

**Files:**
- Modify: `styles.css` (agregar bloques al final de las secciones de Planes y al media query de 560px)

> Los números de línea de esta tarea son los del archivo **antes** de tocarlo. Cada inserción corre las siguientes, así que ancla en el nombre de la regla, no en el número.
- Modify: `planes/index.html:1383-1487` (la `<section class="pricing">` entera)
- Modify: `index.html`, `planes/index.html`, `como-funciona/index.html`, `legal/index.html`, `terminos/index.html` (bloque `<style>` regenerado)

**Interfaces:**
- Consumes: nada.
- Produces: el contrato de atributos `data-*` que consume la Tarea 2.
  - Tarjetas: `[data-calc="particular"]`, `[data-calc="flota"]`.
  - Dentro de **cada** tarjeta, los mismos nombres (las consultas van acotadas a la tarjeta): `[data-bubble]`, `[data-slider]`, `[data-total]`, `[data-save]`, `[data-save-amount]`, `[data-save-note]`, `[data-fineprint]`, `[data-nudge]`, `[data-nudge-total]`, `[data-nudge-amount]`, `[data-nudge-btn]`.
  - Solo en Particular: `[data-count]`, `[data-rate]`, `[data-cafe]`, `[data-cafe-wrap]`, `[data-bridge]`, `[data-bridge-btn]`.
  - Solo en Flotas: `[data-slider="veh"]`, `[data-slider="cuentas"]`, `[data-bubble="veh"]`, `[data-bubble="cuentas"]`, `[data-control-cuentas]`, `[data-scale-max]`, `[data-precio]`, `[data-contacto]`, `[data-total-period]`, `[data-linea-veh]`, `[data-linea-cuentas]`, y dentro de cada línea `[data-linea-label]` y `[data-linea-monto]`.
  - Pills: `.plan-pills__opt[data-plan="particular"|"flota"]`.

- [ ] **Step 1: Agregar el CSS del selector de plan**

En `styles.css`, justo **antes** del comentario `/* Planes — Toggle de facturación (mensual / anual) */` (hoy en la línea 490), insertar:

```css
/* Planes — Selector de plan (uso particular / flotas).
   Mismo lenguaje visual que el toggle de facturación de abajo: los dos son
   controles del mismo precio y tienen que leerse como una familia. */
.plan-pills-wrap { display: flex; justify-content: center; margin-bottom: 14px; }
.plan-pills {
  display: inline-flex; align-items: center; gap: 4px; padding: 5px;
  background: var(--superficie); border: 1px solid var(--linea);
  border-radius: var(--radius-pill); box-shadow: var(--shadow-sm);
}
.plan-pills__opt {
  display: inline-flex; align-items: center; gap: 8px; border: 0; background: transparent;
  cursor: pointer; font-family: var(--font-sans); font-size: 14px; font-weight: 600;
  color: var(--acero); padding: 9px 20px; border-radius: var(--radius-pill);
  transition: background-color var(--duration-base) var(--ease-standard),
              color var(--duration-base) var(--ease-standard);
}
.plan-pills__opt:hover { color: var(--tinta); }
.plan-pills__opt.is-active { background: var(--azul); color: #fff; }
.plan-pills__hint {
  font-size: 11px; font-weight: 700; letter-spacing: 0.02em; padding: 2px 7px;
  border-radius: var(--radius-pill); background: var(--azul-soft); color: var(--azul);
}
.plan-pills__opt.is-active .plan-pills__hint { background: rgba(255, 255, 255, 0.22); color: #fff; }
```

- [ ] **Step 2: Agregar el CSS de las piezas nuevas de la calculadora**

En `styles.css`, justo **después** de la regla `.calc__fineprint` (hoy en la línea 677, al final del bloque `/* Planes — Analogía de precio */`), insertar:

```css
/* Planes — Piezas de la calculadora de dos planes.
   .calc es display:flex, que le gana al [hidden] de la hoja del navegador;
   por eso hay que apagarlo a mano. Los divs que siguen son block y no lo
   necesitarían, pero se declaran igual para que nadie los "arregle" después
   poniéndoles un display y los rompa en silencio. */
.calc[hidden], .calc__control[hidden], .calc__precio[hidden],
.calc__contacto[hidden], .calc__bridge[hidden], .included__group[hidden] { display: none; }

/* Flotas apila dos sliders: vehículos y cuentas de conductor. */
.calc__control + .calc__control { margin-top: 30px; }

/* Flotas desglosa el precio en líneas con subtotal a la derecha. */
.calc__lineas { display: flex; flex-direction: column; gap: 8px; }
.calc__linea {
  display: flex; align-items: baseline; justify-content: space-between; gap: 16px;
  font-size: 14px; color: var(--acero);
}
.calc__linea[hidden] { display: none; }
.calc__linea__monto {
  font-family: var(--font-mono); font-size: 13px; color: var(--tinta); white-space: nowrap;
}

/* Particular — puente hacia Flotas cuando el slider llega al tope. */
.calc__bridge {
  display: flex; align-items: flex-start; gap: 11px; margin: 16px 0 0;
  padding: 14px 16px; border-radius: var(--radius-md); background: var(--azul-soft);
}
.calc__bridge__icon { flex: 0 0 auto; margin-top: 2px; color: var(--azul); }
.calc__bridge__text { font-size: 14px; line-height: 1.5; color: var(--acero); }
.calc__bridge__text strong { color: var(--tinta); font-weight: 600; }
.calc__bridge__btn {
  display: inline-flex; align-items: center; gap: 5px; margin-top: 5px; padding: 0;
  border: 0; background: transparent; cursor: pointer; font-family: var(--font-sans);
  font-size: 14px; font-weight: 600; color: var(--azul);
}
.calc__bridge__btn:hover { text-decoration: underline; }

/* Flotas — tramo "Más de 100": reemplaza el precio por un llamado a contacto. */
.calc__contacto {
  margin: 8px 0 0; padding: 20px 22px; border-radius: var(--radius-md); background: var(--azul-soft);
}
.calc__contacto__title { margin: 0; font-size: 20px; font-weight: 700; letter-spacing: -0.02em; }
.calc__contacto__text { margin: 8px 0 0; font-size: 14px; line-height: 1.55; color: var(--acero); }
.calc__contacto__mail {
  display: inline-block; margin-top: 12px; font-size: 15px; font-weight: 600; color: var(--azul);
}
```

- [ ] **Step 3: Agregar el CSS móvil de las pills**

En `styles.css`, dentro del `@media (max-width: 560px)` que empieza en la línea 1005, justo **después** de la línea `.billing-note__text { font-size: 19px; }` (hoy 1054), insertar:

```css
  /* Bajo 560px las pills ocupan el ancho y el hint "desde 10" estorba. */
  .plan-pills { width: 100%; }
  .plan-pills__opt { flex: 1; justify-content: center; padding: 9px 12px; }
  .plan-pills__hint { display: none; }
  .calc__control + .calc__control { margin-top: 26px; }
  .calc__linea { font-size: 13px; }
```

- [ ] **Step 4: Reemplazar el markup de la sección de precios**

En `planes/index.html`, reemplazar la `<section class="pricing">` completa (desde `<section class="pricing">` hasta su `</section>`, hoy líneas 1384–1487) por:

```html
  <section class="pricing">
    <div class="plan-pills-wrap">
      <div class="plan-pills" role="group" aria-label="Tipo de plan">
        <button type="button" class="plan-pills__opt is-active" data-plan="particular" aria-pressed="true">Uso particular</button>
        <button type="button" class="plan-pills__opt" data-plan="flota" aria-pressed="false">Flotas <span class="plan-pills__hint">desde 10</span></button>
      </div>
    </div>
    <div class="billing-toggle-wrap">
      <div class="billing-toggle" role="group" aria-label="Periodo de facturación">
        <button type="button" class="billing-toggle__opt is-active" data-period="mensual" aria-pressed="true">Mensual</button>
        <button type="button" class="billing-toggle__opt" data-period="anual" aria-pressed="false">Anual <span class="billing-toggle__save">−27%</span></button>
      </div>
      <span class="billing-note">
        <svg class="billing-note__arrow" viewBox="0 0 64 44" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M61 11C51 2 26 1 10 33"/>
          <path d="M10 33 13 19"/>
          <path d="M10 33 25 30"/>
        </svg>
        <span class="billing-note__text">Aprovecha la promoción anual</span>
      </span>
    </div>
    <div class="pricing__grid">

      <!-- CALCULADORA — USO PARTICULAR -->
      <div class="calc" data-calc="particular">
        <span class="calc__eyebrow">Calcula tu plan</span>

        <div class="calc__control">
          <div class="calc__row">
            <span class="calc__row-label">Vehículos a registrar</span>
          </div>
          <div class="calc__slider-wrap">
            <span class="calc__bubble" data-bubble>3 vehículos</span>
            <input type="range" min="1" max="10" value="3" step="1" class="calc__slider" data-slider
                   aria-label="Cantidad de vehículos a registrar">
          </div>
          <div class="calc__scale"><span>1</span><span>10</span></div>
        </div>

        <div class="calc__divider"></div>

        <span class="calc__formula"><span data-count>3 vehículos</span> × $<span data-rate>2.500</span></span>
        <div class="calc__total-row">
          <span class="calc__total" data-total>$7.500</span>
          <span class="calc__total-period">/mes</span>
        </div>
        <span class="calc__cafe" data-cafe-wrap>
          <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10 2v2M14 2v2M16 8a1 1 0 0 1 1 1v8a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V9a1 1 0 0 1 1-1Z"/><path d="M16 11h2a2 2 0 0 1 0 4h-2"/></svg>
          <span data-cafe>$2.500 por vehículo — menos que un café al mes.</span>
        </span>
        <div class="calc__save" data-save hidden>
          <svg class="calc__save__icon" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20.6 12.3 12.3 20.6a1.6 1.6 0 0 1-2.3 0l-7.2-7.2a1.6 1.6 0 0 1-.5-1.1V4.2c0-.9.7-1.6 1.6-1.6h8.1c.4 0 .8.2 1.1.5l7.5 7.5a1.6 1.6 0 0 1 0 2.2Z"/><path d="M7 7h.01"/></svg>
          <span>
            <span class="calc__save__amount" data-save-amount>Ahorras $24.000 al año</span>
            <span class="calc__save__note" data-save-note>$1.833 por vehículo al mes — 27% menos que pagando mes a mes.</span>
          </span>
        </div>
        <p class="calc__fineprint" data-fineprint>Un chip NFC por vehículo, incluido — solo pagas el envío. Sin costos ocultos.</p>

        <div class="calc__nudge" data-nudge>
          <svg class="calc__nudge__icon" viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20.6 12.3 12.3 20.6a1.6 1.6 0 0 1-2.3 0l-7.2-7.2a1.6 1.6 0 0 1-.5-1.1V4.2c0-.9.7-1.6 1.6-1.6h8.1c.4 0 .8.2 1.1.5l7.5 7.5a1.6 1.6 0 0 1 0 2.2Z"/><path d="M7 7h.01"/></svg>
          <span>
            <span class="calc__nudge__text">Con el plan anual este mismo plan te queda en <strong data-nudge-total>$5.500</strong> al mes.</span>
            <button type="button" class="calc__nudge__btn" data-nudge-btn>
              Cambiar a anual y ahorrar <span data-nudge-amount>$24.000</span> al año
              <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </button>
          </span>
        </div>

        <div class="calc__bridge" data-bridge hidden>
          <svg class="calc__bridge__icon" viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 17h2l1-4h12l1 4h2"/><path d="M6 13 7.5 8h9L18 13"/><circle cx="7" cy="17.5" r="1.6"/><circle cx="17" cy="17.5" r="1.6"/></svg>
          <span>
            <span class="calc__bridge__text">¿Más de 10 vehículos? Tu plan es <strong>Flotas</strong>, con tarifa por vehículo y cuentas para tus conductores.</span>
            <button type="button" class="calc__bridge__btn" data-bridge-btn>
              Ver el plan Flotas
              <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </button>
          </span>
        </div>

        <div class="calc__spacer"></div>
        <ul class="calc__trust">
          <li><svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="var(--vigente)" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>Sin permanencia</li>
          <li><svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="var(--vigente)" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>Sin costos ocultos</li>
          <li><svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="var(--vigente)" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>Cambias de plan cuando quieras</li>
        </ul>
        <div class="calc__actions">
          <a href="https://app.tapcar.cl" class="btn btn--primary btn--lg">Crear cuenta</a>
          <a href="mailto:contacto@tapcar.cl" class="btn btn--secondary btn--lg">contacto@tapcar.cl</a>
        </div>
      </div>

      <!-- CALCULADORA — FLOTAS -->
      <div class="calc" data-calc="flota" hidden>
        <span class="calc__eyebrow">Calcula tu flota</span>

        <div class="calc__control">
          <div class="calc__row">
            <span class="calc__row-label">Vehículos de la flota</span>
          </div>
          <div class="calc__slider-wrap">
            <span class="calc__bubble" data-bubble="veh">25 vehículos</span>
            <input type="range" min="10" max="101" value="25" step="1" class="calc__slider" data-slider="veh"
                   aria-label="Cantidad de vehículos de la flota">
          </div>
          <div class="calc__scale"><span>10</span><span>100+</span></div>
        </div>

        <div class="calc__control" data-control-cuentas>
          <div class="calc__row">
            <span class="calc__row-label">Cuentas de conductor</span>
          </div>
          <div class="calc__slider-wrap">
            <span class="calc__bubble" data-bubble="cuentas">10 cuentas</span>
            <input type="range" min="0" max="25" value="10" step="1" class="calc__slider" data-slider="cuentas"
                   aria-label="Cantidad de cuentas de conductor">
          </div>
          <div class="calc__scale"><span>0</span><span data-scale-max>25</span></div>
        </div>

        <div class="calc__divider"></div>

        <div data-precio>
          <div class="calc__lineas">
            <div class="calc__linea" data-linea-veh>
              <span data-linea-label>25 vehículos × UF 0,057</span>
              <span class="calc__linea__monto" data-linea-monto>UF 1,425</span>
            </div>
            <div class="calc__linea" data-linea-cuentas>
              <span data-linea-label>10 cuentas de conductor × UF 0,12</span>
              <span class="calc__linea__monto" data-linea-monto>UF 1,2</span>
            </div>
          </div>
          <div class="calc__total-row">
            <span class="calc__total" data-total>UF 2,625</span>
            <span class="calc__total-period" data-total-period>/mes</span>
          </div>
          <div class="calc__save" data-save hidden>
            <svg class="calc__save__icon" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20.6 12.3 12.3 20.6a1.6 1.6 0 0 1-2.3 0l-7.2-7.2a1.6 1.6 0 0 1-.5-1.1V4.2c0-.9.7-1.6 1.6-1.6h8.1c.4 0 .8.2 1.1.5l7.5 7.5a1.6 1.6 0 0 1 0 2.2Z"/><path d="M7 7h.01"/></svg>
            <span>
              <span class="calc__save__amount" data-save-amount>Ahorras UF 8,5 al año</span>
              <span class="calc__save__note" data-save-note>27% menos que pagando mes a mes. Equivale a UF 1,917 al mes.</span>
            </span>
          </div>
          <p class="calc__fineprint" data-fineprint>Valores en UF, no incluyen IVA. Un chip NFC por vehículo, incluido — solo pagas el envío. Sin costos ocultos.</p>

          <div class="calc__nudge" data-nudge>
            <svg class="calc__nudge__icon" viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20.6 12.3 12.3 20.6a1.6 1.6 0 0 1-2.3 0l-7.2-7.2a1.6 1.6 0 0 1-.5-1.1V4.2c0-.9.7-1.6 1.6-1.6h8.1c.4 0 .8.2 1.1.5l7.5 7.5a1.6 1.6 0 0 1 0 2.2Z"/><path d="M7 7h.01"/></svg>
            <span>
              <span class="calc__nudge__text">Con el plan anual esta misma flota te queda en <strong data-nudge-total>UF 23</strong> al año.</span>
              <button type="button" class="calc__nudge__btn" data-nudge-btn>
                Cambiar a anual y ahorrar <span data-nudge-amount>UF 8,5</span> al año
                <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </button>
            </span>
          </div>
        </div>

        <div class="calc__contacto" data-contacto hidden>
          <p class="calc__contacto__title">Más de 100 vehículos</p>
          <p class="calc__contacto__text">Contáctanos para revisar tu solicitud y armarte una propuesta a la medida de tu operación.</p>
          <a href="mailto:contacto@tapcar.cl" class="calc__contacto__mail">contacto@tapcar.cl</a>
        </div>

        <div class="calc__spacer"></div>
        <ul class="calc__trust">
          <li><svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="var(--vigente)" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>Sin permanencia</li>
          <li><svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="var(--vigente)" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>La asignación de conductor va incluida</li>
          <li><svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="var(--vigente)" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>Sumas y quitas vehículos cuando quieras</li>
        </ul>
        <div class="calc__actions">
          <a href="mailto:contacto@tapcar.cl" class="btn btn--primary btn--lg">Hablemos de tu flota</a>
          <a href="https://app.tapcar.cl" class="btn btn--secondary btn--lg">Crear cuenta</a>
        </div>
      </div>

      <!-- INCLUIDO -->
      <div class="included included--con-llavero">
        <img src="/assets/chip-llavero.webp" class="llavero llavero--included" alt="Llavero con el chip NFC de TapCar" loading="lazy" width="345" height="400">
        <span class="included__eyebrow">Todo incluido</span>
        <p class="included__lead" data-included-lead>Una sola suscripción por vehículo, con toda la plataforma. Sin extras ni letra chica.</p>

        <div class="included__group">
          <p class="included__group-title">Para cualquier vehículo</p>
          <ul class="included__list">
            <li class="included__item"><svg class="included__check" viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="var(--azul)" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>Un chip NFC por vehículo, incluido — solo pagas el envío</li>
            <li class="included__item"><svg class="included__check" viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="var(--azul)" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>Tus documentos listos para mostrar en fiscalización — solo lectura</li>
            <li class="included__item"><svg class="included__check" viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="var(--azul)" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>Aviso por correo antes de que venza cada documento</li>
            <li class="included__item"><svg class="included__check" viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="var(--azul)" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>Datos del vehículo a mano: combustible, neumáticos, transmisión y más</li>
            <li class="included__item"><svg class="included__check" viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="var(--azul)" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>Sin permanencia — cancela cuando quieras</li>
          </ul>
        </div>

        <div class="included__group">
          <p class="included__group-title">Si tienes conductores o equipo</p>
          <ul class="included__list">
            <li class="included__item"><svg class="included__check" viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="var(--azul)" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>Registro de quién usa cada vehículo, con PIN por conductor</li>
            <li class="included__item"><svg class="included__check" viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="var(--azul)" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>Al entregar el vehículo, 2 fotos y la IA anota kilometraje, bencina y limpieza</li>
            <li class="included__item"><svg class="included__check" viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="var(--azul)" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>Panel con el estado de tu flota: qué vehículo está disponible y quién lo tiene</li>
            <li class="included__item"><svg class="included__check" viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="var(--azul)" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>Invita a tu equipo (hasta 5 personas) como Administrador, Editor o Visor</li>
          </ul>
        </div>

        <div class="included__group" data-grupo="flota" hidden>
          <p class="included__group-title">Conductor fijo</p>
          <ul class="included__list">
            <li class="included__item"><svg class="included__check" viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="var(--azul)" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg><span><strong>La asignación va incluida.</strong> El vehículo tiene un conductor titular: al abrir la ficha desde el chip aparece él prellenado en vez de la lista completa y, si lo configuras así, sin pedir PIN. "Soy otro conductor" sigue estando — es un atajo, no un candado.</span></li>
            <li class="included__item"><svg class="included__check" viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="var(--azul)" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg><span><strong>La cuenta cuesta UF 0,12 al mes.</strong> Ese conductor entra con su propio usuario y ve solo su vehículo: sube documentos y mantenciones y recibe los avisos de vencimiento. No ve la flota ni a sus compañeros, y no ocupa lugar en el tope de 5 personas del equipo.</span></li>
            <li class="included__item"><svg class="included__check" viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="var(--azul)" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>Se cobra la cuenta, no la asignación</li>
          </ul>
        </div>
      </div>

    </div>
  </section>
```

- [ ] **Step 5: Re-incrustar el CSS en las cinco páginas**

Es el one-liner que documenta el README. Copia `styles.css` dentro del `<style>` de cada HTML:

```bash
python -c "import io; css=io.open('styles.css',encoding='utf-8').read().rstrip(); [io.open(f,'w',encoding='utf-8',newline='').write(h[:h.index('<style>')+7]+'\n'+css+'\n'+h[h.index('  </style>'):]) for f in ['index.html','planes/index.html','legal/index.html','como-funciona/index.html','terminos/index.html'] for h in [io.open(f,encoding='utf-8').read()]]"
```

- [ ] **Step 6: Verificar que los cinco bloques `<style>` quedaron idénticos a `styles.css`**

```bash
python -c "
import io
css = io.open('styles.css', encoding='utf-8').read().strip()
for f in ['index.html','planes/index.html','legal/index.html','como-funciona/index.html','terminos/index.html']:
    h = io.open(f, encoding='utf-8').read()
    emb = h[h.index('<style>')+7:h.index('  </style>')].strip()
    print(('OK  ' if emb == css else 'MAL '), f)
"
```

Expected: cinco líneas, todas `OK`.

- [ ] **Step 7: Mirar la página en el navegador**

Levanta `python -m http.server 4310` y abre `http://localhost:4310/planes/`.

Expected:
- Las pills "Uso particular" / "Flotas" salen sobre el toggle, centradas, con la primera activa y "desde 10" en azul claro dentro de la de Flotas.
- La tarjeta de Particular se ve igual que antes, con el slider en 3 de 10 y "$7.500 /mes".
- El toggle anual dice "−27%".
- La tarjeta de Flotas no se ve (tiene `hidden`).
- Consola sin errores. El script viejo de la calculadora va a tirar error porque el markup cambió: es esperado y lo arregla la Tarea 2.

- [ ] **Step 8: Mirar la tarjeta de Flotas**

En la consola del navegador:

```js
document.querySelector('[data-calc="particular"]').hidden = true;
document.querySelector('[data-calc="flota"]').hidden = false;
document.querySelector('[data-grupo="flota"]').hidden = false;
```

Expected: los dos sliders apilados con su rótulo y su escala, el desglose en dos líneas con el subtotal alineado a la derecha, "UF 2,625 /mes", y el tercer grupo de la columna de incluidos con el texto de conductor fijo. Las burbujas de los sliders van a estar mal ubicadas: las posiciona el JS de la Tarea 2.

- [ ] **Step 9: Commit**

```bash
git add styles.css index.html planes/index.html como-funciona/index.html legal/index.html terminos/index.html
git commit -m "Planes: markup y estilos de los dos sistemas de precio"
```

---

### Task 2: La calculadora de dos planes

Reemplaza el script de la calculadora por uno que maneje los dos planes y los dos periodos. Al terminar, la página calcula de verdad.

**Files:**
- Modify: `planes/index.html`, el primer `<script>` después del footer (hoy líneas 1589–1676, el IIFE que empieza con el comentario `// ── Calculadora de precio ──`)

**Interfaces:**
- Consumes: todos los atributos `data-*` que produjo la Tarea 1.
- Produces: nada que consuman las tareas siguientes.

- [ ] **Step 1: Reemplazar el script de la calculadora**

En `planes/index.html`, reemplazar el `<script>` completo de la calculadora (el que empieza con `// ── Calculadora de precio ──` y termina con `})();` antes de `</script>`) por:

```html
  <script>
    // ── Calculadora de precio ──────────────────────────────────────
    (function () {
      // Las cifras ancla son la mensual y la anual, y todo el dinero sale de
      // ahí. El equivalente mensual del plan anual se muestra pero nunca se usa
      // para calcular: 12 × $1.833 da $21.996, no los $22.000 reales.
      //
      // Particular va en pesos con IVA incluido; Flotas en UF más IVA. Los
      // precios mensuales de Flotas son la tarifa lista y los anuales son el
      // precio ya con el descuento aplicado.
      var PLANES = {
        particular: { veh: { mes: 2500, anio: 22000 }, min: 1, max: 10 },
        flota: {
          veh: { mes: 0.057, anio: 0.5 },
          cuenta: { mes: 0.12, anio: 1.05 },
          min: 10, max: 100
        }
      };
      // El descuento se calcula, no se escribe a mano. Las tres tarifas dan 27.
      function descuento(t) { return Math.round((1 - t.anio / (t.mes * 12)) * 100); }
      var DESCUENTO = descuento(PLANES.particular.veh);

      var CHIP = 'Un chip NFC por vehículo, incluido — solo pagas el envío.';
      var IVA = 'Valores en UF, no incluyen IVA.';

      function clp(n) { return '$' + Math.round(n).toLocaleString('es-CL'); }
      // Las tarifas en UF tienen hasta tres decimales (UF 0,057) y los totales
      // arrastran ruido del punto flotante: 10 × 1,05 da 10.500000000000002.
      // El formateador redondea, así que no hace falta limpiarlo antes.
      function uf(n) {
        return 'UF ' + n.toLocaleString('es-CL', { minimumFractionDigits: 0, maximumFractionDigits: 3 });
      }
      function veh(n) { return n === 1 ? '1 vehículo' : n + ' vehículos'; }
      function ctas(n) { return n === 1 ? '1 cuenta de conductor' : n + ' cuentas de conductor'; }

      var plan = 'particular';
      var period = 'mensual';

      var cardP = document.querySelector('[data-calc="particular"]');
      var cardF = document.querySelector('[data-calc="flota"]');
      var grupoFlota = document.querySelector('[data-grupo="flota"]');
      var leadIncluido = document.querySelector('[data-included-lead]');
      var LEAD = {
        particular: 'Una sola suscripción por vehículo, con toda la plataforma. Sin extras ni letra chica.',
        flota: 'Tarifa por vehículo con toda la plataforma incluida. Lo único aparte son las cuentas de conductor, y solo si las quieres.'
      };
      function P(sel) { return cardP.querySelector(sel); }
      function F(sel) { return cardF.querySelector(sel); }

      // Pinta el relleno del riel y deja la burbuja sobre el pulgar. La burbuja
      // se topa contra los bordes del riel; la flecha sigue apuntando al pulgar.
      // Recibe el slider porque Flotas tiene dos.
      function placeBubble(slider, bubble) {
        var min = parseInt(slider.min, 10), max = parseInt(slider.max, 10);
        var p = max === min ? 0 : (parseInt(slider.value, 10) - min) / (max - min);
        slider.style.setProperty('--pct', (p * 100) + '%');
        var track = slider.getBoundingClientRect().width;
        var thumb = 22;
        if (!track) return;
        var x = thumb / 2 + p * (track - thumb);
        var half = bubble.offsetWidth / 2;
        var left = Math.min(Math.max(x, half), track - half);
        bubble.style.left = left + 'px';
        bubble.style.setProperty('--arrow', (x - left + half) + 'px');
      }

      function renderParticular() {
        var cfg = PLANES.particular, t = cfg.veh;
        var s = P('[data-slider]');
        var n = parseInt(s.value, 10) || cfg.min;
        var anual = period === 'anual';
        var tarifa = anual ? Math.round(t.anio / 12) : t.mes;
        var porMes = anual ? Math.round(n * t.anio / 12) : n * t.mes;
        var ahorro = n * (t.mes * 12 - t.anio);

        P('[data-bubble]').textContent = veh(n);
        placeBubble(s, P('[data-bubble]'));
        P('[data-count]').textContent = veh(n);
        P('[data-rate]').textContent = tarifa.toLocaleString('es-CL');
        P('[data-total]').textContent = clp(porMes);

        P('[data-cafe-wrap]').hidden = anual;
        P('[data-save]').hidden = !anual;
        P('[data-nudge]').hidden = anual;
        // El puente a Flotas aparece recién en el tope del slider.
        P('[data-bridge]').hidden = n < cfg.max;

        if (anual) {
          P('[data-save-amount]').textContent = 'Ahorras ' + clp(ahorro) + ' al año';
          P('[data-save-note]').textContent = clp(tarifa) + ' por vehículo al mes — ' + DESCUENTO + '% menos que pagando mes a mes.';
          P('[data-fineprint]').textContent = 'Facturado una vez al año (' + clp(n * t.anio) + '). ' + CHIP;
        } else {
          P('[data-cafe]').textContent = clp(tarifa) + ' por vehículo — menos que un café al mes.';
          P('[data-fineprint]').textContent = CHIP + ' Sin costos ocultos.';
          P('[data-nudge-total]').textContent = clp(Math.round(n * t.anio / 12));
          P('[data-nudge-amount]').textContent = clp(ahorro);
        }
      }

      function renderFlota() {
        var cfg = PLANES.flota;
        var sv = F('[data-slider="veh"]');
        var sc = F('[data-slider="cuentas"]');
        // El slider llega a max+1: esa posición extra es el centinela del tramo
        // "Más de 100", no 101 vehículos.
        var raw = parseInt(sv.value, 10) || cfg.min;
        var sobre = raw > cfg.max;
        var n = sobre ? cfg.max : raw;
        var anual = period === 'anual';

        F('[data-bubble="veh"]').textContent = sobre ? 'Más de 100 vehículos' : veh(n);
        placeBubble(sv, F('[data-bubble="veh"]'));

        F('[data-contacto]').hidden = !sobre;
        F('[data-precio]').hidden = sobre;
        F('[data-control-cuentas]').hidden = sobre;
        if (sobre) return;

        // Un conductor fijo es el titular de un vehículo, así que no puede
        // haber más cuentas que vehículos: al bajar la flota, las cuentas
        // sobrantes se recortan solas.
        sc.max = n;
        if (parseInt(sc.value, 10) > n) sc.value = n;
        var c = parseInt(sc.value, 10) || 0;
        F('[data-bubble="cuentas"]').textContent = c === 1 ? '1 cuenta' : c + ' cuentas';
        placeBubble(sc, F('[data-bubble="cuentas"]'));
        F('[data-scale-max]').textContent = n;

        var tv = anual ? cfg.veh.anio : cfg.veh.mes;
        var tc = anual ? cfg.cuenta.anio : cfg.cuenta.mes;
        var total = n * tv + c * tc;
        var lista = (n * cfg.veh.mes + c * cfg.cuenta.mes) * 12;
        var ahorro = lista - (n * cfg.veh.anio + c * cfg.cuenta.anio);

        var lv = F('[data-linea-veh]');
        lv.querySelector('[data-linea-label]').textContent = veh(n) + ' × ' + uf(tv);
        lv.querySelector('[data-linea-monto]').textContent = uf(n * tv);
        var lc = F('[data-linea-cuentas]');
        lc.hidden = c === 0;
        lc.querySelector('[data-linea-label]').textContent = ctas(c) + ' × ' + uf(tc);
        lc.querySelector('[data-linea-monto]').textContent = uf(c * tc);

        F('[data-total]').textContent = uf(total);
        // A diferencia de Particular, el número grande de Flotas sigue el
        // periodo de facturación: es un contrato en UF, no un cargo mensual.
        F('[data-total-period]').textContent = anual ? '/año' : '/mes';

        F('[data-save]').hidden = !anual;
        F('[data-nudge]').hidden = anual;

        if (anual) {
          F('[data-save-amount]').textContent = 'Ahorras ' + uf(ahorro) + ' al año';
          F('[data-save-note]').textContent = DESCUENTO + '% menos que pagando mes a mes. Equivale a ' + uf(total / 12) + ' al mes.';
          F('[data-fineprint]').textContent = 'Facturado una vez al año. ' + IVA + ' ' + CHIP;
        } else {
          F('[data-fineprint]').textContent = IVA + ' ' + CHIP + ' Sin costos ocultos.';
          F('[data-nudge-total]').textContent = uf(n * cfg.veh.anio + c * cfg.cuenta.anio);
          F('[data-nudge-amount]').textContent = uf(ahorro);
        }
      }

      function render() {
        // Mostrar la tarjeta antes de medir: placeBubble usa el ancho del riel,
        // y un elemento con hidden mide 0.
        cardP.hidden = plan !== 'particular';
        cardF.hidden = plan !== 'flota';
        grupoFlota.hidden = plan !== 'flota';
        leadIncluido.textContent = LEAD[plan];
        if (plan === 'particular') renderParticular(); else renderFlota();
      }

      function grupo(sel, attr, set) {
        var btns = document.querySelectorAll(sel);
        btns.forEach(function (btn) {
          btn.addEventListener('click', function () {
            set(btn.getAttribute(attr));
            btns.forEach(function (b) {
              b.classList.toggle('is-active', b === btn);
              b.setAttribute('aria-pressed', b === btn ? 'true' : 'false');
            });
            render();
          });
        });
      }
      // Plan y periodo son independientes: cambiar de pill conserva el periodo.
      grupo('.plan-pills__opt', 'data-plan', function (v) { plan = v; });
      grupo('.billing-toggle__opt', 'data-period', function (v) { period = v; });

      [].forEach.call(document.querySelectorAll('.calc__slider'), function (s) {
        s.addEventListener('input', render);
        s.addEventListener('change', render);
      });
      P('[data-bridge-btn]').addEventListener('click', function () {
        document.querySelector('.plan-pills__opt[data-plan="flota"]').click();
      });
      [].forEach.call(document.querySelectorAll('[data-nudge-btn]'), function (b) {
        b.addEventListener('click', function () {
          document.querySelector('.billing-toggle__opt[data-period="anual"]').click();
        });
      });

      window.addEventListener('resize', render);
      render();
    })();
  </script>
```

- [ ] **Step 2: Verificar Particular en las dos facturaciones**

Recarga `http://localhost:4310/planes/` y comprueba en pantalla:

| Estado | Esperado |
|---|---|
| 3 vehículos, mensual | `3 vehículos × $2.500`, total **$7.500 /mes**, badge "$2.500 por vehículo — menos que un café al mes." |
| 3 vehículos, anual | `3 vehículos × $1.833`, total **$5.500 /mes**, "Ahorras $24.000 al año", letra chica "Facturado una vez al año ($66.000)." |
| 10 vehículos, mensual | total **$25.000 /mes**, empujón "te queda en $18.333 al mes", puente a Flotas visible |
| 10 vehículos, anual | total **$18.333 /mes**, "Ahorras $80.000 al año", "Facturado una vez al año ($220.000)." |
| 1 vehículo | la burbuja dice "1 vehículo", en singular |

- [ ] **Step 3: Verificar Flotas en las dos facturaciones**

Haz clic en la pill "Flotas". Con 25 vehículos y 10 cuentas:

| Estado | Esperado |
|---|---|
| mensual | `25 vehículos × UF 0,057` → **UF 1,425**; `10 cuentas de conductor × UF 0,12` → **UF 1,2**; total **UF 2,625 /mes** |
| anual | `25 vehículos × UF 0,5` → **UF 12,5**; `10 cuentas de conductor × UF 1,05` → **UF 10,5**; total **UF 23 /año** |
| anual | "Ahorras UF 8,5 al año" y "27% menos que pagando mes a mes. Equivale a UF 1,917 al mes." |
| mensual | el empujón dice "te queda en UF 23 al año" y "ahorrar UF 8,5 al año" |
| cuentas en 0 | la segunda línea del desglose desaparece |

- [ ] **Step 4: Verificar el recorte de cuentas y el tramo "Más de 100"**

En la consola del navegador:

```js
var f = document.querySelector('[data-calc="flota"]');
var sv = f.querySelector('[data-slider="veh"]'), sc = f.querySelector('[data-slider="cuentas"]');
function set(el, v) { el.value = v; el.dispatchEvent(new Event('input')); }

set(sv, 25); set(sc, 20); set(sv, 12);
console.log('cuentas recortadas a', sc.value, '· max', sc.max);

set(sv, 101);
console.log('contacto visible:', !f.querySelector('[data-contacto]').hidden,
            '· precio oculto:', f.querySelector('[data-precio]').hidden,
            '· slider de cuentas oculto:', f.querySelector('[data-control-cuentas]').hidden,
            '·', f.querySelector('[data-bubble="veh"]').textContent);
```

Expected:
```
cuentas recortadas a 12 · max 12
contacto visible: true · precio oculto: true · slider de cuentas oculto: true · Más de 100 vehículos
```

- [ ] **Step 5: Verificar que el plan y el periodo son independientes**

En la consola:

```js
document.querySelector('.billing-toggle__opt[data-period="anual"]').click();
document.querySelector('.plan-pills__opt[data-plan="flota"]').click();
console.log(document.querySelector('.billing-toggle__opt[data-period="anual"]').classList.contains('is-active'));
```

Expected: `true` — cambiar de pill no resetea la facturación a mensual.

- [ ] **Step 6: Verificar el puente y el empujón**

Vuelve a Particular en mensual, lleva el slider a 10 y haz clic en "Ver el plan Flotas".

Expected: la pill activa pasa a Flotas y la tarjeta cambia. Volviendo a Particular, "Cambiar a anual y ahorrar" activa el toggle anual.

- [ ] **Step 7: Verificar la consola y el móvil**

Expected: sin errores ni advertencias en la consola. A 400 px de ancho, las pills ocupan el ancho completo sin el hint, no hay scroll horizontal y las burbujas de los sliders quedan dentro del riel en los dos planes.

- [ ] **Step 8: Commit**

```bash
git add planes/index.html
git commit -m "Planes: la calculadora calcula los dos sistemas de precio"
```

---

### Task 3: Copy y metadatos

Actualiza todo el texto visible que todavía dice $20.000 o 33%, y suma las preguntas nuevas del FAQ. El JSON-LD se regenera en la Tarea 4 y lee de acá, así que este paso va antes.

**Files:**
- Modify: `planes/index.html:6-24` (`<title>` y los bloques de meta)
- Modify: `planes/index.html`, `.pl-hero__lead`
- Modify: `planes/index.html`, `.faq__list`
- Modify: `planes/index.html`, `.cta__lead`

**Interfaces:**
- Consumes: nada.
- Produces: la `meta description` y los `.faq__item` que `tools/schema.py` lee para armar el `WebPage` y el `FAQPage` en la Tarea 4.

- [ ] **Step 1: Actualizar las descripciones**

El `<title>`, el `og:title` y el `twitter:title` **se quedan como están** — los $2.500 mensuales siguen siendo el gancho y el precio de entrada, y no mencionan ninguna cifra vieja.

Lo que sí cambia son las tres descripciones (`meta name="description"`, `og:description`, `twitter:description`), que hoy dicen $20.000 y 33%. Las tres pasan a decir exactamente:

```
$2.500 por vehículo al mes o $22.000 al año con 27% de descuento, hasta 10 vehículos. Desde 10, plan Flotas a UF 0,5 por vehículo al año más IVA. Sin permanencia.
```

- [ ] **Step 2: Actualizar la bajada del hero**

Reemplazar el contenido de `.pl-hero__lead` por:

```html
      <p class="pl-hero__lead">$2.500 por vehículo al mes para uso particular, y tarifa por flota desde 10 vehículos. Documentos, uso con PIN, panel de control y fiscalización incluidos. Sin permanencia — cambia o cancela cuando quieras.</p>
```

- [ ] **Step 3: Reemplazar el FAQ**

Reemplazar el contenido completo de `<div class="faq__list">` por:

```html
      <div class="faq__list">
        <div class="faq__item">
          <h3 class="faq__q">¿Cuánto cuesta?</h3>
          <p class="faq__a">Hasta 10 vehículos, $2.500 por vehículo al mes — menos que un café. Con el plan anual son $22.000 por vehículo al año, un 27% menos. Desde 10 vehículos pasas al plan Flotas: UF 0,5 por vehículo al año más IVA.</p>
        </div>
        <div class="faq__item">
          <h3 class="faq__q">¿Cuándo paso a Flotas?</h3>
          <p class="faq__a">Desde 10 vehículos. Flotas cambia la tarifa a UF por vehículo y suma la opción de darle cuenta propia a cada conductor. Sobre 100 vehículos lo conversamos: escríbenos a contacto@tapcar.cl y armamos una propuesta a la medida.</p>
        </div>
        <div class="faq__item">
          <h3 class="faq__q">¿Qué es un conductor fijo y qué se cobra?</h3>
          <p class="faq__a">Son dos cosas distintas. La asignación —que el vehículo tenga un conductor titular, que aparezca prellenado al abrir la ficha y que puedas saltarte el PIN— va incluida. La cuenta es que ese conductor entre con su propio usuario y mantenga solo su vehículo: sube documentos y mantenciones y recibe los avisos de vencimiento, sin ver la flota ni a sus compañeros. Eso cuesta UF 0,12 al mes y no ocupa lugar en el tope de 5 personas del equipo. Se cobra la cuenta, no la asignación.</p>
        </div>
        <div class="faq__item">
          <h3 class="faq__q">¿Los precios incluyen IVA?</h3>
          <p class="faq__a">Los precios en pesos del plan particular sí: $2.500 y $22.000 son lo que pagas. Los valores en UF del plan Flotas van más IVA, como es habitual entre empresas.</p>
        </div>
        <div class="faq__item">
          <h3 class="faq__q">¿El chip NFC está incluido?</h3>
          <p class="faq__a">Sí. Va un chip por cada vehículo que registres, incluido en tu plan — solo pagas el envío. Da lo mismo si tienes uno o cincuenta.</p>
        </div>
        <div class="faq__item">
          <h3 class="faq__q">¿Cómo se paga?</h3>
          <p class="faq__a">Por ahora coordinamos el cobro contigo de forma directa. La factura electrónica del SII llega en una próxima etapa.</p>
        </div>
        <div class="faq__item">
          <h3 class="faq__q">¿Necesito instalar una app?</h3>
          <p class="faq__a">No. Ni tú, ni tus conductores, ni quien fiscaliza. Todo se abre con un toque al chip NFC o desde el panel web.</p>
        </div>
        <div class="faq__item">
          <h3 class="faq__q">¿Y si sumo más vehículos?</h3>
          <p class="faq__a">Agregas vehículos cuando quieras y se suman a tu suscripción. Si pasas de 10, tu cuenta se cotiza como Flotas. Te enviamos los chips de los vehículos nuevos.</p>
        </div>
        <div class="faq__item">
          <h3 class="faq__q">¿Puedo cancelar?</h3>
          <p class="faq__a">Sí, cuando quieras. No hay contratos de permanencia ni penalizaciones.</p>
        </div>
      </div>
```

- [ ] **Step 4: Actualizar la bajada del CTA**

Reemplazar el contenido de `.cta__lead` por:

```html
      <p class="cta__lead">$2.500 por vehículo al mes, o tarifa de flota desde 10 vehículos. Registra tus vehículos y empieza a operar con un Tap.</p>
```

- [ ] **Step 5: Verificar que no quedó ningún precio viejo en la página**

Comillas simples, no dobles: entre comillas dobles bash se come el `\` de `\$` y grep termina leyendo un ancla de fin de línea en medio del patrón, que no matchea nunca.

```bash
grep -n '20\.000\|33%\|1\.667' planes/index.html
```

Expected: solo líneas dentro del bloque `<script type="application/ld+json" data-schema>`, que se regenera en la Tarea 4. Si aparece alguna fuera de ese bloque, falta actualizarla.

- [ ] **Step 6: Verificar en el navegador**

Recarga `http://localhost:4310/planes/`.

Expected: el hero nombra los dos planes, el FAQ tiene nueve preguntas, y la primera responde con $22.000 y 27%.

- [ ] **Step 7: Commit**

```bash
git add planes/index.html
git commit -m "Planes: el copy y los metadatos cuentan los dos planes"
```

---

### Task 4: Ofertas del JSON-LD

`tools/schema.py` tiene las ofertas escritas en el script y lee el resto del HTML. Hay que actualizar las ofertas y volver a correrlo.

**Files:**
- Modify: `tools/schema.py:105-153` (el bloque `'offers'`)
- Modify (generado): el `script[data-schema]` de las cinco páginas

**Interfaces:**
- Consumes: la `meta description` y los `.faq__item` de la Tarea 3.
- Produces: nada.

- [ ] **Step 1: Reemplazar el bloque de ofertas**

En `tools/schema.py`, reemplazar el valor de la clave `'offers'` (desde `'offers': {` hasta la coma que cierra el diccionario, hoy líneas 105–153) por:

```python
        # El AggregateOffer admite una sola priceCurrency, y acá conviven pesos
        # (Particular) y UF (Flotas). Se deja en CLP con el rango de Particular
        # en lowPrice/highPrice, y cada oferta de Flotas declara su propia
        # priceCurrency CLF, que es el codigo ISO 4217 de la Unidad de Fomento.
        # Es lo mas cerca de la verdad que permite el vocabulario.
        'offers': {
            '@type': 'AggregateOffer',
            'priceCurrency': 'CLP',
            'lowPrice': '22000',
            'highPrice': '30000',
            'offerCount': 4,
            'offers': [
                {
                    '@type': 'Offer',
                    'name': 'Uso particular — plan mensual',
                    'description': '$2.500 por vehículo al mes, hasta 10 vehículos, sin permanencia.',
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
                    'name': 'Uso particular — plan anual',
                    'description': '$22.000 por vehículo al año, un 27% menos que pagando mes a mes.',
                    'price': '22000',
                    'priceCurrency': 'CLP',
                    'availability': 'https://schema.org/InStock',
                    'url': SITIO + '/planes/',
                    'priceSpecification': {
                        '@type': 'UnitPriceSpecification',
                        'price': '22000',
                        'priceCurrency': 'CLP',
                        'unitText': 'vehículo',
                        'billingIncrement': 1,
                        'billingDuration': 1,
                        'referenceQuantity': {
                            '@type': 'QuantitativeValue', 'value': 1, 'unitCode': 'ANN'
                        },
                    },
                },
                {
                    '@type': 'Offer',
                    'name': 'Flotas — vehículo',
                    'description': 'UF 0,5 por vehículo al año más IVA, desde 10 vehículos.',
                    'price': '0.5',
                    'priceCurrency': 'CLF',
                    'availability': 'https://schema.org/InStock',
                    'url': SITIO + '/planes/',
                    'eligibleQuantity': {
                        '@type': 'QuantitativeValue', 'minValue': 10, 'unitText': 'vehículo'
                    },
                    'priceSpecification': {
                        '@type': 'UnitPriceSpecification',
                        'price': '0.5',
                        'priceCurrency': 'CLF',
                        'valueAddedTaxIncluded': False,
                        'unitText': 'vehículo',
                        'billingIncrement': 1,
                        'billingDuration': 1,
                        'referenceQuantity': {
                            '@type': 'QuantitativeValue', 'value': 1, 'unitCode': 'ANN'
                        },
                    },
                },
                {
                    '@type': 'Offer',
                    'name': 'Flotas — cuenta de conductor fijo',
                    'description': 'UF 0,12 al mes más IVA por cada conductor con cuenta propia. La asignación de conductor va incluida.',
                    'price': '0.12',
                    'priceCurrency': 'CLF',
                    'availability': 'https://schema.org/InStock',
                    'url': SITIO + '/planes/',
                    'priceSpecification': {
                        '@type': 'UnitPriceSpecification',
                        'price': '0.12',
                        'priceCurrency': 'CLF',
                        'valueAddedTaxIncluded': False,
                        'unitText': 'conductor',
                        'billingIncrement': 1,
                        'billingDuration': 1,
                        'referenceQuantity': {
                            '@type': 'QuantitativeValue', 'value': 1, 'unitCode': 'MON'
                        },
                    },
                },
            ],
        },
```

- [ ] **Step 2: Regenerar el JSON-LD de las cinco páginas**

```bash
python tools/schema.py
```

Expected: termina sin traza de error.

- [ ] **Step 3: Verificar que el JSON-LD parsea y quedó al día**

```bash
python -c "
import io, json, re
for f in ['index.html','planes/index.html','como-funciona/index.html','legal/index.html','terminos/index.html']:
    h = io.open(f, encoding='utf-8').read()
    g = json.loads(re.search(r'data-schema>(.*?)</script>', h, re.S).group(1))
    tipos = [n.get('@type') for n in g['@graph']]
    print(f, '->', tipos)
"
```

Expected: cinco líneas, ninguna excepción. `index.html` y `planes/index.html` incluyen `SoftwareApplication`.

- [ ] **Step 4: Verificar las cuatro ofertas y el FAQ derivado**

```bash
python -c "
import io, json, re
h = io.open('planes/index.html', encoding='utf-8').read()
g = json.loads(re.search(r'data-schema>(.*?)</script>', h, re.S).group(1))['@graph']
app = [n for n in g if n.get('@type') == 'SoftwareApplication'][0]
for o in app['offers']['offers']:
    print(o['priceCurrency'], o['price'], '-', o['name'])
faq = [n for n in g if n.get('@type') == 'FAQPage'][0]
print('preguntas del FAQ:', len(faq['mainEntity']))
print('primera:', faq['mainEntity'][0]['acceptedAnswer']['text'][:60])
"
```

Expected:
```
CLP 2500 - Uso particular — plan mensual
CLP 22000 - Uso particular — plan anual
CLF 0.5 - Flotas — vehículo
CLF 0.12 - Flotas — cuenta de conductor fijo
preguntas del FAQ: 9
primera: Hasta 10 vehículos, $2.500 por vehículo al mes — menos que
```

- [ ] **Step 5: Verificar que no quedan precios viejos en ninguna página**

```bash
grep -rn '20000\|20\.000\|33%\|1\.667' index.html planes/index.html tools/schema.py
```

Expected: sin resultados.

- [ ] **Step 6: Commit**

```bash
git add tools/schema.py index.html planes/index.html como-funciona/index.html legal/index.html terminos/index.html
git commit -m "Planes: el JSON-LD declara los cuatro precios, en pesos y en UF"
```

---

### Task 5: Notas de precio fuera de la página

`llms.txt` y el README repiten las tarifas. Si quedan viejas, el próximo agente que lea el repo va a escribir el precio equivocado.

**Files:**
- Modify: `llms.txt:21-22`
- Modify: `README.md:134`

**Interfaces:**
- Consumes: nada.
- Produces: nada.

- [ ] **Step 1: Actualizar `llms.txt`**

Reemplazar las dos líneas de precio por:

```markdown
- Uso particular (1 a 10 vehículos): **$2.500 CLP por vehículo al mes**, o **$22.000 CLP por vehículo al año** (equivale a $1.833 al mes, un 27% menos). IVA incluido.
- Flotas (desde 10 vehículos): **UF 0,5 por vehículo al año**, más **UF 0,12 al mes por cada conductor con cuenta propia**. Valores más IVA. Sobre 100 vehículos, se cotiza caso a caso.
```

- [ ] **Step 2: Actualizar la nota del README**

Reemplazar la línea 134 por:

```markdown
- Hay dos sistemas de precio, seleccionables con pills. **Uso particular** (1 a 10 vehículos) son **$2.500 por vehículo al mes** o **$22.000 al año**; **Flotas** (desde 10) son **UF 0,5 por vehículo al año** más **UF 0,12 al mes por cada cuenta de conductor**, todo más IVA. Las tres tarifas dan **−27%** en anual. La calculadora saca todo el dinero de las cifras mensual y anual, nunca del equivalente mensual redondeado: 12 × $1.833 da $21.996, no $22.000. Sobre 100 vehículos la página deja de cotizar y manda a contacto.
```

- [ ] **Step 3: Actualizar la línea de la calculadora en el README**

En la sección "Comportamientos con JS", reemplazar la viñeta de la calculadora por:

```markdown
- **Calculadora** (planes) — dos sistemas de precio en pills (Uso particular y Flotas), toggle mensual/anual, slider de vehículos por plan, slider de cuentas de conductor en Flotas acotado al número de vehículos, ahorro anual, burbuja del slider y empujón al plan anual. Sobre 100 vehículos reemplaza el precio por un llamado a contacto.
```

- [ ] **Step 4: Verificar que no queda ningún precio viejo en el repo**

```bash
grep -rn '20\.000\|33%\|1\.667' --include='*.html' --include='*.txt' --include='*.md' --include='*.py' . | grep -v '^./_design_src' | grep -v '^./docs/'
```

Expected: sin resultados.

- [ ] **Step 5: Commit**

```bash
git add llms.txt README.md
git commit -m "Planes: llms.txt y README quedan con las tarifas nuevas"
```

---

## Verificación final

Con todas las tareas listas, sobre `http://localhost:4310/planes/`:

- [ ] Las cuatro combinaciones de plan × periodo muestran la tarifa correcta (tablas de las Tareas 2 y 3).
- [ ] Particular: tope de 10, el puente a Flotas aparece en 10 y cambia de pill.
- [ ] Flotas: las cuentas se recortan al bajar los vehículos; el tramo "Más de 100" oculta el precio y muestra el contacto.
- [ ] 25 vehículos + 10 cuentas en anual dan **UF 23**; en mensual, **UF 2,625**.
- [ ] La consola no tiene errores.
- [ ] A 400 px no hay scroll horizontal y las pills no se desbordan.
- [ ] Los cinco bloques `<style>` siguen idénticos a `styles.css` (script de la Tarea 1, paso 6).
- [ ] `python tools/schema.py` es idempotente: correrlo de nuevo no deja diff (`git diff --stat` vacío).
