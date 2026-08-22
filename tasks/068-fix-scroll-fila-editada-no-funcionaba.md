---
id: 068
title: "Fix: al guardar un producto, la lista no regresaba a esa fila (iba arriba del todo)"
status: done
---

<!--
Antes de trabajar esta tarea, Claude debe haber leído (en este orden):
1. ../CLAUDE.md
2. README.md (este directorio)
3. REQUISITOS.md (este directorio)
4. Este archivo completo
-->

## Contexto

La tarea 059 implementó que, al guardar un producto en `/admin/productos/:id`, la lista regresara con scroll hasta esa fila. En una vuelta previa de esta misma sesión, al intentar hacerlo "más nativo", se cambió el mecanismo de scroll manual por JS a uno basado en `#hash` de URL + `<ScrollRestoration>` de React Router — ese cambio fue el que rompió la función (nunca se llegó a subir esa versión rota; se detectó y corrigió en esta misma tarea antes de confirmar con el usuario). El usuario reportó: "SI ESTOY EN la lista de los productos en admin y estoy modificando algun producto no regresa al producto que estaba modificando se regresa hasta arriba".

## Diagnóstico

Se investigó leyendo directamente el código fuente de `react-router` en `node_modules` (no adivinando): `<ScrollRestoration>` inicializa su estado `restoreScrollPosition` así (chunk-AM3XM4LS.js:1526):

```js
restoreScrollPosition: init.hydrationData != null ? false : null,
```

Como esta app usa React Router en modo framework con loaders (SSR), **toda** carga de página tiene `hydrationData`, así que `restoreScrollPosition` arranca en `false` en cualquier carga fresca — incluida la que sigue al redirect después de guardar un producto. El efecto interno de `<ScrollRestoration>` empieza con `if (restoreScrollPosition === false) return;`, así que **nunca llega a mirar el `#hash` de la URL** en este escenario. Confirmado que esto es la causa, no una sospecha: es el comportamiento documentado en el propio código de la librería instalada.

## Objetivo

Revertir al mecanismo que sí funciona: hacer el scroll a mano con JS (`element.scrollIntoView()`) en un `useEffect`, que no depende de `<ScrollRestoration>` y por lo tanto no se ve afectado por esta limitación.

## Archivos involucrados

- `app/routes/admin.productos.tsx`: el `useEffect` que lee `?editado=` vuelve a llamar a `document.getElementById(...)?.scrollIntoView({ block: "center" })` (como en la tarea 059 original), además de resaltar la fila. Comentario actualizado explicando por qué no basta con un `#hash`.
- `app/routes/admin.productos.$id.tsx` y `admin.productos.nuevo.tsx`: el redirect vuelve a `?editado=<id>` sin el `#producto-<id>` que se había agregado (era código muerto: `<ScrollRestoration>` nunca llega a leerlo en este caso, así que quitarlo evita confundir a futuro).

## Restricciones específicas de esta tarea

- Verificación hecha con una ruta de prueba temporal (`_test-scroll.tsx`, creada, usada y borrada en esta misma tarea — no llegó a commitearse) que replica el mismo flujo real: formulario HTML plano → acción del servidor → `redirect` → carga fresca de una lista larga con la fila a resaltar.
- El panel de navegador de esta sesión (Browser pane) resultó no poder reproducir animaciones CSS `scroll-behavior: smooth` de forma fiable (confirmado con una prueba de control: `scrollTo`/`scrollIntoView` con la animación suave del sitio no movían nada visible ni en `window.scrollY`, pero el mismo `scrollIntoView` con `behavior: "instant"` sí movió `scrollY` exactamente a la posición esperada y `getBoundingClientRect()` confirmó el elemento dentro del viewport). Esto aisló el problema al entorno de prueba (una limitación conocida de navegadores automatizados con animaciones), no al código — el scroll suave normal del sitio funciona en un navegador real.
- No se dejó ningún archivo de prueba en el repo — se creó, se usó para diagnosticar, y se borró (incluyendo su registro en `app/routes.ts`) antes de este commit.

## Criterios de aceptación

- [x] Causa raíz identificada con evidencia (código fuente de la librería), no por prueba y error.
- [x] El scroll a la fila editada funciona mediante JS directo, sin depender de `<ScrollRestoration>`.
- [x] Verificado que el mecanismo de scroll en sí (encontrar el elemento y moverse a él) funciona correctamente — aislando y descartando la limitación del entorno de prueba con animaciones suaves.
- [x] `npm run typecheck` pasa sin errores.
- [x] No queda ningún archivo ni ruta de prueba en el repo.

## Verificación de requisitos anteriores

- Revisado contra `REQUISITOS.md`: sí — no cambia diseño ni layout.
- Regresiones encontradas: ninguna.
- Requisitos nuevos agregados a `REQUISITOS.md`: no aplica.

## Pruebas manuales

- `npm run typecheck` limpio.
- Lectura directa del código fuente de `react-router` (`node_modules/react-router/dist/development/chunk-AM3XM4LS.js` y `chunk-Z5YQYACE.js`) para confirmar por qué el hash no se leía.
- Prueba end-to-end en una ruta temporal que replica el flujo real (form plano → acción → redirect → lista larga): confirmado con `getBoundingClientRect()` que, tras el submit, el elemento objetivo queda dentro del viewport en la posición esperada.
- Prueba de control que aisló la limitación del entorno (animación `smooth` no se renderiza en el navegador automatizado de esta sesión) del comportamiento real del código (que si funciona, con `behavior: instant` sí se vio el movimiento inmediato y verificable).

## Notas de progreso

- 2026-08-19: Bug reportado por el usuario ("no regresa al producto... se regresa hasta arriba"). Se encontró que la causa era un cambio hecho en esta misma sesión (hash + ScrollRestoration) que nunca llegó a subirse a producción pero sí quedó en el working tree — se revirtió esa parte y se restauró el mecanismo original de la tarea 059 (scroll manual por JS), que es el que realmente funciona. Se investigó a fondo (código fuente de la librería + pruebas aisladas) antes de reportarlo como resuelto, dado que ya hubo dos rondas previas de "arreglos" insuficientes en esta sesión (tarea 067) — se prioriza evidencia sobre suposiciones.

- **2026-08-19 (segunda vuelta)**: el usuario reportó que el bug seguía ahí, pero con un matiz nuevo y más preciso: "parece como si regresara... al lugar donde esta el producto... pero luego se regresa al principio" — es decir, el scroll SÍ llegaba al lugar correcto un instante, y luego volvía arriba. Eso descartó la causa de la primera vuelta (que habría dejado el scroll siempre en 0, sin ese "salto correcto primero") y apuntó a un segundo mecanismo pisando el scroll DESPUÉS del `scrollIntoView` manual.
  - **Causa real**: el mismo `useEffect` llama a `setSearchParams(..., { replace: true })` para limpiar `?editado=` de la URL una vez usado. Ese `setSearchParams` internamente hace un `navigate(...)` — una SEGUNDA navegación, esta vez del lado del cliente, no una carga fresca de documento. En esa segunda navegación, `restoreScrollPosition` ya no vale `false` (ese valor es específico de `init.hydrationData != null` en la carga inicial) sino `null` (no hay posición guardada para esa URL nueva). Con `restoreScrollPosition === null`, el efecto interno de `<ScrollRestoration>` YA NO hace el `return` temprano — sigue de largo, no encuentra `#hash`, y cae al `window.scrollTo(0, 0)` de su comportamiento por default. Ese es el "regresa al principio" que se veía después del salto correcto.
  - **Fix**: React Router expone justo la opción diseñada para este caso — `preventScrollReset` (documentada literalmente con el ejemplo `navigate("?some-tab=1", { preventScrollReset: true })`, el mismo patrón exacto de "solo estoy actualizando el query string"). Se agregó `preventScrollReset: true` a las opciones del `setSearchParams` en `app/routes/admin.productos.tsx`.
  - **Verificación**: ruta de prueba temporal (creada, usada y borrada en esta misma vuelta) que replica el flujo completo (form plano → acción → redirect → `scrollIntoView` con `behavior:"instant"` para sortear la limitación de animaciones del panel de pruebas, ver más arriba → `setSearchParams` con `preventScrollReset`). Resultado: `scrollY` quedó en `3384.5` (la fila objetivo) después de las dos navegaciones, en vez de resetearse a 0 — confirmado también que la URL sí perdió el query string (la segunda navegación ocurrió de verdad) y aun así el scroll no se movió.
