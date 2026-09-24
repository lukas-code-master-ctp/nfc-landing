# El rotor del hero empieza en "vehículo" — plan de implementación

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Que la home pinte "Tu vehículo a un Tap." de entrada y siga rotando por flota, auto, moto y camioneta.

**Architecture:** Dos ediciones en `index.html` —el texto estático del rotor y el arreglo `PALABRAS` del script— más regenerar el JSON-LD, que deriva el `name` del `WebPage` del `h1`.

**Tech Stack:** HTML estático con JavaScript ES5 incrustado; `tools/schema.py` (Python + BeautifulSoup) para el JSON-LD.

**Spec:** [`docs/superpowers/specs/2026-09-24-rotor-empieza-en-vehiculo-design.md`](../specs/2026-09-24-rotor-empieza-en-vehiculo-design.md)

## Global Constraints

- **El texto estático de `.rotor__word` y `PALABRAS[0]` tienen que ser la misma palabra.** El intervalo hace `i = (i + 1) % PALABRAS.length` antes de pintar, así que si no coinciden la primera vuelta se salta una palabra o repite la que ya estaba.
- **La palabra nueva es `vehículo`**, con tilde en la í, en los dos lugares.
- **Ninguna palabra del rotor puede ser más larga que `camioneta`**, que es la que dimensiona el titular bajo 560px. `vehículo` tiene 8 caracteres contra 9: cumple.
- **El JavaScript del navegador va en ES5.** Nada de `const`, `let`, arrow functions ni template literals.
- **No se toca el `aria-label` del `h1`**, que ya dice "Tus vehículos a un Tap.".
- **No se toca `<title>`, `og:title` ni la meta description.**
- **No se edita el bloque JSON-LD a mano**: sale de `python tools/schema.py`.
- **Archivos en UTF-8.** La tilde de `vehículo` tiene que sobrevivir la edición.

## File Structure

| Archivo | Responsabilidad | Tarea |
|---|---|---|
| `index.html` § `h1.lp-hero__title` | El texto que se pinta antes de que corra el JS. | 1 |
| `index.html` § script del rotor | El arreglo `PALABRAS`. | 1 |
| `index.html` § `script[data-schema]` | Generado. Se regenera con `tools/schema.py`. | 1 |

## Comandos de verificación

- `python tools/schema.py` — regenera el JSON-LD de las cinco páginas.
- `python tools/precios.py` — el revisor estándar del repo.
- `python -m http.server 4310` → `http://localhost:4310/` para mirar la home.

---

### Task 1: La palabra nueva y el JSON-LD

**Files:**
- Modify: `index.html` (el `h1`, el arreglo `PALABRAS` y, vía script, el bloque JSON-LD)

**Interfaces:**
- Consumes: nada.
- Produces: nada.

- [ ] **Step 1: Cambiar la palabra que se pinta de entrada**

En `index.html`, dentro del `h1`, reemplazar

```html
<span class="rotor__word">flota</span>
```

por

```html
<span class="rotor__word">vehículo</span>
```

El resto del `h1` —incluido `aria-label="Tus vehículos a un Tap."` y el `<br class="lp-hero__nl">`— se queda exactamente igual.

- [ ] **Step 2: Poner la palabra al frente del arreglo**

En el script del rotor, reemplazar

```js
      var PALABRAS = ['flota', 'auto', 'moto', 'camioneta'];
```

por

```js
      // El primer elemento tiene que ser la misma palabra que el HTML pinta:
      // el intervalo avanza el índice ANTES de pintar, así que arranca en el
      // segundo. Si se desincronizan, la primera vuelta salta una palabra.
      var PALABRAS = ['vehículo', 'flota', 'auto', 'moto', 'camioneta'];
```

Y actualizar el comentario de encabezado del IIFE, que hoy dice:

```js
    // ── Rotor del hero: "Tu flota/auto/moto a un Tap" ──────────────
```

por:

```js
    // ── Rotor del hero: "Tu vehículo/flota/auto... a un Tap" ───────
```

- [ ] **Step 3: Comprobar que las dos quedaron sincronizadas**

```bash
python -c "
import io, re, sys
h = io.open('index.html', encoding='utf-8').read()
estatico = re.search(r'<span class=\"rotor__word\">([^<]+)</span>', h).group(1)
arreglo = re.search(r'var PALABRAS = \[(.*?)\];', h).group(1)
primera = [p.strip().strip(chr(39)) for p in arreglo.split(',')][0]
print('  estatico en el h1 :', estatico)
print('  PALABRAS[0]       :', primera)
print('  lista completa    :', arreglo)
ok = estatico == primera == 'vehículo'
print('  ' + ('OK   sincronizados' if ok else 'MAL  no coinciden'))
sys.exit(0 if ok else 1)
"
```

Expected: las dos líneas dicen `vehículo`, la lista trae las cinco palabras en orden, y la última línea es `OK sincronizados`.

- [ ] **Step 4: Comprobar que la tilde sobrevivió y que sigue siendo ES5**

```bash
python -c "
import io, sys
b = io.open('index.html', 'rb').read()
t = b.decode('utf-8', 'replace')
mal = [m for m in ['Ã','â€','ï¿½',chr(65533)] if m in t]
print('  mojibake:', mal or 'ninguno')
print('  la palabra con tilde esta:', 'vehículo' in t)
sys.exit(1 if mal or 'vehículo' not in t else 0)
"
grep -nE '(^|[^a-zA-Z])(const|let) |=>' index.html | grep -v '^\s*[0-9]*:\s*//' | head -3
```

Expected: `mojibake: ninguno`, `la palabra con tilde esta: True`, y el `grep` sin resultados.

- [ ] **Step 5: Regenerar el JSON-LD**

El `name` del `WebPage` sale del `h1`, así que cambió. Si no se regenera, el marcado promete un titular que la página ya no muestra.

```bash
python tools/schema.py
```

Expected: termina sin error.

- [ ] **Step 6: Comprobar el JSON-LD y su idempotencia**

```bash
python -c "
import io, json, re
for f in ['index.html','planes/index.html','como-funciona/index.html','legal/index.html','terminos/index.html']:
    g = json.loads(re.search(r'data-schema>(.*?)</script>', io.open(f,encoding='utf-8').read(), re.S).group(1))
    w = [n for n in g['@graph'] if n.get('@type') == 'WebPage'][0]
    print('  %-26s %s' % (f, w['name']))
"
python tools/schema.py > /dev/null && git status --short -- '*.html'
```

Expected: las cinco páginas parsean; la home dice `Tu vehículo a un Tap .` (el espacio antes del punto es anterior a este cambio y está documentado en el spec como fuera de alcance). La segunda corrida no agrega ningún archivo modificado más allá de los que ya lo estaban: el script es idempotente.

- [ ] **Step 7: Correr el revisor estándar del repo**

```bash
python tools/precios.py
```

Expected: `OK: el sitio calza con precios.json`. Este cambio no toca cifras; se corre porque es el chequeo estándar y confirma que no se rompió nada de paso.

- [ ] **Step 8: Commit**

```bash
git add index.html
git commit -m "Home: el rotor del hero arranca en vehiculo, no en flota"
```

---

## Verificación final

La hace el controlador en el navegador, sobre `http://localhost:4310/`:

- [ ] La home pinta **"Tu vehículo a un Tap."** de entrada.
- [ ] El rotor avanza `vehículo → flota → auto → moto → camioneta → vehículo`, sin saltarse ninguna ni repetir la primera.
- [ ] A 375 px el titular no desborda ni saca scroll horizontal con ninguna de las cinco palabras.
- [ ] La consola no tiene errores.
