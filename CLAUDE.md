# Kinara — instrucciones del proyecto

Este archivo se carga automáticamente al inicio de cada sesión de Claude Code en este repo. Contiene el contexto del proyecto y las reglas que debe seguir cualquier modificación.

## ⚠️ Pendiente antes de dar el sitio por terminado

- [`tasks/008-copy-envios-pesos.md`](tasks/008-copy-envios-pesos.md) — el copy de envíos/devoluciones sigue en euros y menciona España ("Envío gratis desde 60 €", "entrega en península"), inconsistente desde que los precios pasaron a MXN. El usuario pidió dejarlo pendiente por ahora pero que se le recuerde antes de cerrar el proyecto.

## Stack

- React Router 7 (framework mode, SSR) + TypeScript + Tailwind CSS v4
- Dev: `npm run dev` (http://localhost:5173) · Build: `npm run build` · Typecheck: `npm run typecheck`

## Estructura

```
app/
  routes/        páginas (_index, tienda, producto.$slug)
  components/    componentes de UI (Hero, ProductCard, CartDrawer, SiteNav, ...)
  context/       CartContext (estado del carrito)
  data/          datos estáticos (products, categories, looks, images)
  hooks/         useDragScroll, useScrollReveal
  lib/           utilidades (cn, formatPrice)
```

## Skills instaladas

- `.claude/skills/ui-ux-pro-max` — guía de diseño (estilos, paletas, tipografía, accesibilidad). Se activa sola cuando la tarea es de UI/UX.

## Flujo de trabajo por tarea

Antes de tocar código para cualquier tarea de este proyecto:

1. Leer este archivo completo (reglas de abajo).
2. Leer [`tasks/README.md`](tasks/README.md) para el formato de tareas y su índice — ahí se ve qué está `done`, `in-progress` o `pending` sin necesidad de que el usuario lo repita.
3. Leer [`tasks/REQUISITOS.md`](tasks/REQUISITOS.md) — checklist acumulado de todo lo exigido por tareas anteriores.
4. Leer el archivo específico de la tarea en `tasks/NNN-nombre.md` (contexto, alcance, criterios de aceptación, y su sección "Notas de progreso" si venía interrumpida).
5. Implementar solo lo que esa tarea pide. No mezclar cambios de otras tareas.
6. Antes de cerrar la tarea: confirmar que no se rompió ningún punto de `tasks/REQUISITOS.md`, agregar ahí los requisitos nuevos que esta tarea introduzca, y verificar con `npm run typecheck` + prueba manual en el navegador.

## Persistencia del avance (para poder hacer `clear` sin perder contexto)

El estado real del proyecto vive en los archivos de `tasks/`, no en el historial de la conversación. Esto es obligatorio, no opcional:

- Al empezar a trabajar una tarea: cambiar su `status` a `in-progress` en el frontmatter y en la tabla de `tasks/README.md`, de inmediato (no al final).
- Mientras se trabaja: si la tarea se interrumpe o queda a medias, dejar constancia en su sección "Notas de progreso" (qué se hizo, qué falta, cualquier decisión tomada) antes de terminar la sesión.
- Al terminar una tarea: marcar `status: done`, tildar su checklist de criterios de aceptación, completar "Verificación de requisitos anteriores", actualizar `REQUISITOS.md`, y actualizar la fila correspondiente en la tabla de `tasks/README.md`.
- Nunca asumir que algo "quedó pendiente de la conversación anterior" si no está reflejado en estos archivos — el archivo manda, no la memoria del chat.

## Reglas de modificación

Objetivo del proyecto: el mejor rendimiento, la mejor experiencia UI/UX, cumplir los requisitos de Google para posicionamiento en buscadores, medición completa con Google Analytics, catálogo de productos en Supabase, y cobros con Stripe. Estas reglas son el estándar mínimo para cualquier tarea; cada tarea puede añadir criterios propios pero nunca bajar este piso.

### Performance

- Objetivo Core Web Vitals (mobile, Lighthouse): LCP < 2.5s, INP < 200ms, CLS < 0.1, Lighthouse Performance ≥ 90.
- Imágenes: formatos modernos (WebP/AVIF), `srcset`/tamaños responsive, `loading="lazy"` fuera del viewport inicial, siempre con `width`/`height` explícitos para evitar CLS.
- Code-splitting por ruta (ya soportado por React Router); no importar librerías pesadas de forma global si solo se usan en una ruta.
- Nada de scripts de terceros bloqueando el render inicial (analytics, fonts, etc. con `defer`/`async` o cargados tras interacción).

### SEO

- Cada ruta (`_index`, `tienda`, `producto.$slug`) define `title` y `meta description` únicos vía la función `meta` de React Router.
- Datos estructurados JSON-LD: `Product`/`Offer` en páginas de producto, `Organization` en el layout raíz.
- Open Graph + Twitter Card en todas las páginas públicas.
- `sitemap.xml` (generado a partir del catálogo real) y `robots.txt` en `public/`.
- URLs canónicas, slugs limpios (ya se usa `producto.$slug`), un solo `<h1>` por página.
- Alt text descriptivo en toda imagen de producto (no decorativo genérico).

### Analytics

- Google Analytics 4 vía `gtag`, cargado con Consent Mode (por defecto denegado hasta que el usuario acepte cookies).
- Trackear el set estándar de e-commerce de GA4: `view_item`, `add_to_cart`, `begin_checkout`, `purchase`.
- Requiere que el usuario cree la property de GA4 y entregue el Measurement ID (Claude no puede crear cuentas de Google).

### UI/UX y accesibilidad

- **El diseño visual ya está aprobado por el cliente y es intocable por defecto.** Ninguna tarea cambia paleta de colores, tipografías, layout, identidad de marca, tono visual o el contenido/copy existente sin permiso explícito y puntual del usuario para esa tarea. Por defecto, todo el trabajo (performance, SEO, analytics, accesibilidad, datos, pagos) debe ser invisible a nivel visual: el sitio debe verse exactamente igual salvo que se pida lo contrario.
- El resultado final debe verse **profesional**: consistencia visual en todos los estados (hover, focus, loading, error, vacío), sin elementos desalineados, espaciados irregulares o inconsistencias entre componentes. Si una tarea encuentra una inconsistencia visual, la reporta antes de "corregirla" por su cuenta — no se asume que se puede ajustar el diseño aprobado para "mejorarlo".
- WCAG 2.1 AA: contraste ≥ 4.5:1, focus visible en todo elemento interactivo, `aria-label` en botones de solo ícono, orden de tabulación lógico, `label` asociado a cada input. Si corregir un problema de accesibilidad (ej. contraste) requeriría cambiar un color de marca ya aprobado, se marca como conflicto y se pregunta antes de tocarlo.
- Mobile-first; probar siempre en ~375px además de desktop.
- Estados de carga y error visibles (skeletons, mensajes), nunca pantallas en blanco.
- Para decisiones de estilo/paleta/tipografía, usar la skill `ui-ux-pro-max` ya instalada — pero siempre dentro del diseño aprobado, no para reemplazarlo.

### Datos (Supabase)

- El catálogo (productos, categorías, precios, variantes, stock) vive en Supabase, no hardcodeado en `app/data/*.ts`.
- Imágenes de producto en Supabase Storage.
- Row Level Security activo: lectura pública del catálogo, escritura restringida.
- La `anon key` puede ir en el cliente; la `service_role key` nunca se expone al cliente ni se commitea — solo variables de entorno de servidor (`.env`, ya está en `.gitignore`).
- Requiere que el usuario cree el proyecto en Supabase (Claude no puede crear cuentas); Claude diseña el esquema y la migración.

### Pagos (Stripe)

- Integración vía Stripe Checkout / Payment Intents — nunca manejar número de tarjeta directamente.
- Modo test/sandbox únicamente hasta que el usuario pida explícitamente pasar a producción.
- Webhook con verificación de firma para confirmar pagos y actualizar el estado de la orden.
- Claves secretas solo en variables de entorno de servidor; la publishable key es la única que puede ir al cliente.
- Requiere que el usuario cree la cuenta de Stripe (Claude no puede crear cuentas ni ingresar datos de pago).

### Código y alcance

- TypeScript estricto, evitar `any`.
- Seguir la estructura ya existente (`app/routes`, `app/components`, `app/data`, `app/lib`, `app/hooks`, `app/context`).
- `app/data/products.ts` contiene datos reales — no se pierde información al migrar a Supabase.
- No mezclar cambios de distintas tareas en el mismo commit/PR.
