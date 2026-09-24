# Socios en el nav y en Planes — plan de implementación

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** "Socios" en el nav de las seis páginas y una franja en `/planes/` que explique los perfiles del rubro y lleve a `/socios/`.

**Architecture:** Un enlace más en el nav (escritorio y panel móvil) de las seis páginas, una regla de CSS nueva para la lista de la franja (y, si hace falta, otra para el ancho del nav), y un bloque de HTML nuevo en `planes/index.html`.

**Spec:** [`docs/superpowers/specs/2026-09-24-socios-en-nav-y-planes-design.md`](../specs/2026-09-24-socios-en-nav-y-planes-design.md)

## Global Constraints

- Textos finales, tal cual. Español neutro con "tú".
- Los `.html` están en CRLF en la copia de trabajo (`core.autocrlf=true`). Editar con `newline=''` y afirmar cada reemplazo con su conteo esperado.
- **El Bash de este entorno se come las barras invertidas dobles dentro de heredocs**: los scripts de Python van en archivos del scratchpad escritos con la herramienta Write.
- `styles.css` es la fuente; se reincrusta en las seis páginas con el comando del README y después se vuelven a CRLF.
- El JSON-LD no se edita a mano.

---

### Task 1: Socios en el nav y franja en Planes

**Files:** `styles.css`, las seis páginas (`index.html`, `como-funciona/index.html`, `legal/index.html`, `planes/index.html`, `socios/index.html`, `terminos/index.html`), `README.md`.

- [ ] **Step 1: Nav de escritorio.** En las seis páginas, después de `<a href="/planes/" class="nav__link…">Planes</a>`, agregar `<a href="/socios/" class="nav__link">Socios</a>` con la misma indentación. En `socios/index.html` ese enlace lleva `class="nav__link is-active"`.

- [ ] **Step 2: Panel móvil.** En las seis páginas, después de `<a href="/planes/" class="nav__panel-link" data-nav="/planes/">Planes</a>`, agregar `<a href="/socios/" class="nav__panel-link" data-nav="/socios/">Socios</a>`.

- [ ] **Step 3: CSS de la lista de la franja.** En `styles.css`, después de `.rubro__tipos`:

```css
/* Planes — la franja del rubro explica cada perfil en una línea. */
.rubro-banda { max-width: 1140px; margin: 24px auto 0; padding: 0 24px; }
.rubro-banda .rubro { margin-top: 0; }
.rubro__lista {
  margin: 0; padding: 0; list-style: none;
  display: flex; flex-direction: column; gap: 10px;
}
.rubro__lista li { font-size: 14px; line-height: 1.5; color: var(--acero); }
.rubro__lista strong { color: var(--tinta); font-weight: 600; }
```

- [ ] **Step 4: Franja en Planes.** En `planes/index.html`, entre el `</section>` de `<section class="pricing">` y el comentario `<!-- ============ FAQ ============ -->`:

```html
  <!-- ============ EMPRESAS DEL RUBRO ============ -->
  <section class="rubro-banda">
    <div class="card card--p28 rubro">
      <div>
        <span class="rubro__eyebrow">Empresas del rubro</span>
        <h2 class="rubro__title">¿Eres automotora, aseguradora o gestoría?</h2>
        <p class="rubro__text">Lo tuyo no se calcula en esta página. Son convenios y envíos que se piden al crear la cuenta, que aprobamos nosotros y cuyas condiciones se acuerdan caso a caso.</p>
      </div>
      <div class="rubro__lado">
        <ul class="rubro__lista">
          <li><strong>Automotoras</strong> — le regalas TapCar a quien te compra un auto con un código de un solo uso, y pagas por cada código activado.</li>
          <li><strong>Aseguradoras</strong> — el mismo convenio, para tus asegurados.</li>
          <li><strong>Gestorías</strong> — mandas el documento que tramitaste directo a la cuenta TapCar de tu cliente.</li>
        </ul>
        <a href="/socios/" class="aud-card__link">Ver cómo funcionan
          <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
        </a>
      </div>
    </div>
  </section>
```

(el `h2` usa `.rubro__title`, que ya existe; en esta página es `h2` porque la franja es una sección propia).

- [ ] **Step 5: Reincrustar el CSS** en las seis páginas (comando del README) y volver a CRLF.

- [ ] **Step 6: Medir el nav.** Con la herramienta de preview (`preview_start` con `name: "static"`), fijar el ancho con `resize_window` en 861, 900, 1000 y 1280 px sobre `/socios/` (la página con "Socios" activo, que es el texto más ancho en negrita) y medir: `.nav__inner` no puede tener `scrollWidth > clientWidth`, y todos los `.nav__link` tienen que tener el mismo `top`. Si en algún ancho no cabe, agregar en `styles.css`, antes de `@media (max-width: 860px)`:

```css
/* Con cinco enlaces, el nav de escritorio no cabe con el gap completo justo
   antes de pasar al menú móvil. */
@media (max-width: 1000px) {
  .nav__links { gap: 20px; }
}
```

reincrustar, y volver a medir. Si con 20 px tampoco cabe, reportarlo sin inventar otra solución. Al terminar, `resize_window` con `preset: desktop`.

- [ ] **Step 7: README.** En la fila de "Empresas del rubro" de la tabla de páginas, `Enlazada desde la franja del home y el footer, no desde el nav` → `Enlazada desde el nav ("Socios"), la franja del home, la franja de Planes y el footer`. En la fila de Planes, agregar `franja de empresas del rubro` antes de `FAQ`. En "Menú móvil", nada.

- [ ] **Step 8: Verificar.**
  - `python tools/precios.py` → OK; `python tools/schema.py` dos veces sin cambios en la segunda; `node tools/test_contacto.js` → 0 fallos.
  - Las seis páginas tienen exactamente un `href="/socios/" class="nav__link` y un `data-nav="/socios/"`; solo `socios/index.html` tiene `is-active` en él.
  - En el navegador: `/planes/` muestra la franja entre la calculadora y el FAQ; sin scroll lateral a 375 px; en `/socios/` a 375 px, el panel móvil abierto marca "Socios" como activo. Consola sin errores (el 404 de `/_vercel/insights/script.js` es normal).
  - CRLF sin LF sueltos, sin mojibake.

- [ ] **Step 9: Commit**

```
Nav y Planes: Socios en la barra y una franja que explica los perfiles del rubro

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
```
