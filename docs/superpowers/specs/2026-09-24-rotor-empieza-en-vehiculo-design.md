# El rotor del hero empieza en "vehículo"

Fecha: 2026-09-24
Estado: aprobado para plan de implementación

## Problema

El titular de la home es "Tu _flota_ a un Tap.", donde la palabra en cursiva
rota entre flota, auto, moto y camioneta. La primera que se pinta —y la única
que ve quien no espera 2,6 segundos— es **flota**.

Eso angosta la oferta justo en el instante en que alguien llega. La propia
página dice otra cosa dos líneas más abajo: el eyebrow promete "PARA AUTOS,
MOTOS Y FLOTAS" y la lista de confianza remata con "Desde un auto hasta una
flota completa". Arrancar en "flota" contradice a las dos.

## Qué cambia

**"vehículo" pasa a ser la primera palabra del rotor.** Se pinta de entrada y
después el rotor sigue girando por las cuatro de siempre, hasta volver a ella.

Se elige "vehículo" y no "auto" porque es la palabra que cubre a todas las
demás: quien tenga una moto o una camioneta se ve incluido igual, y quien tenga
flota también. "Auto" excluiría a la mitad del eyebrow.

## Dónde vive

En `index.html`, en dos lugares que **tienen que quedar sincronizados**:

1. El texto estático de `.rotor__word`, que es lo que se pinta antes de que
   corra el JS —y lo único que ve quien tenga `prefers-reduced-motion`, porque
   el rotor se desactiva entero en ese caso—.
2. El arreglo `PALABRAS` del script del rotor.

La sincronía no es cosmética: el intervalo hace `i = (i + 1) % PALABRAS.length`
**antes** de pintar, así que la primera transición salta a `PALABRAS[1]`. Si el
texto estático no fuera `PALABRAS[0]`, la primera vuelta se saltaría una palabra
o repetiría la que ya estaba.

## Lo que NO cambia

- **El `aria-label` del `h1`** ya dice "Tus vehículos a un Tap.", así que un
  lector de pantalla no nota diferencia. El cambio solo lo acerca a lo que la
  pantalla muestra.
- **El ancho del titular.** "vehículo" tiene 8 caracteres contra los 9 de
  "camioneta", que es la palabra que manda. El `<br class="lp-hero__nl">` que
  solo existe bajo 560px sigue calculado sobre "camioneta", así que la regla del
  README —ninguna palabra nueva debe ser más larga que la más larga— se respeta.
- **El `<title>` y la meta description** hablan de "Documentos del auto y
  control de flota"; no salen del `h1` y no se tocan.

## Efecto secundario que hay que atender

`tools/schema.py` arma el `name` del `WebPage` leyendo el `h1` de la página. Hoy
ese campo dice "Tu flota a un Tap ." y va a pasar a decir "Tu vehículo a un Tap .".

**No es opcional regenerarlo:** si se cambia el markup y no se corre el script,
el JSON-LD queda prometiendo un titular que la página ya no muestra, que es
justo lo que ese generador existe para evitar.

## Observación fuera de alcance

Ese `name` se genera con un espacio de más antes del punto —"Tu flota a un
Tap ."— porque `limpio()` une los nodos de texto del `h1` y el `<span>Tap</span>`
seguido de "." deja un espacio en medio. Es anterior a este cambio y afecta a
las cinco páginas por igual, no solo a la home.

Se deja anotado y no se toca acá: arreglarlo es tocar `limpio()` en
`tools/schema.py`, que reescribe el JSON-LD de todo el sitio, y eso merece su
propio cambio. Una alternativa mejor que limpiar espacios sería que el `name`
salga del `aria-label` cuando exista, que es la frase completa y sin el ruido
del rotor.

## Verificación

1. `python tools/schema.py` corre sin error y el `name` del `WebPage` de la home
   pasa a "Tu vehículo a un Tap .".
2. `python tools/precios.py` sigue en verde (este cambio no toca cifras, pero el
   revisor es el chequeo estándar del repo).
3. En el navegador: la home pinta "Tu vehículo a un Tap." de entrada, el rotor
   avanza a flota → auto → moto → camioneta y vuelve a vehículo, sin saltarse
   ninguna ni repetir la primera.
4. A 375 px el titular no desborda ni saca scroll horizontal con ninguna de las
   cinco palabras.
5. La consola no tiene errores.
