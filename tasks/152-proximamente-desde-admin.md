---
id: 152
title: "Próximamente administrable desde el admin, con vista ampliada y paso a producto"
status: done
---

## Contexto

La sección "Próximamente" del home (tarea 122) sale de una lista fija en el código (`app/data/comingSoon.ts`) con fotos en `public/proximamente/`. Para agregar o quitar una prenda hay que pedir un cambio de código. La usuaria (2026-11-23) quiere:

1. Administrar "Próximamente" desde el admin: subir la foto y el nombre, y que aparezca en la sección.
2. Poder pasar una prenda de "Próximamente" a "Lo nuevo" fácilmente, dándola de alta como producto real (inventario, colores, SKU, precio…).
3. Que al hacer clic en una prenda de "Próximamente" se vea en grande.

## Objetivo

Un apartado "Próximamente" en `/admin` (alta con foto + nombre, orden, mostrar/ocultar, borrar) que alimenta la sección del home; un botón "Dar de alta como producto" que abre el formulario de producto ya con el nombre y la foto, y al guardar quita la prenda de "Próximamente"; y una vista ampliada accesible al hacer clic en el home.

## Decisiones de diseño (propuestas, 2026-11-23)

- Tabla propia `coming_soon_items` (no se reutiliza `products`): una prenda sin precio, colores ni stock no debe poder colarse en el catálogo, el feed de Merchant Center, el sitemap, el inventario ni el carrito.
- Las 7 prendas actuales se migran a la tabla (con su foto estática de `public/proximamente/`) para que aparezcan ya en el admin; no se pierde ninguna.
- Una foto por prenda. Se sube con la misma ruta de subida del admin y se sirve con `productImage()` (WebP, anchos responsive).
- "Dar de alta como producto" = abrir `/admin/productos/nuevo` con nombre y foto precargados; al crear el producto se borra la prenda de "Próximamente".

## Archivos involucrados

- `supabase/migrations/<fecha>_coming_soon_items.sql` (la aplica la usuaria en el SQL Editor ANTES de subir)
- `app/lib/supabase.types.ts`, `app/lib/catalog.ts` (lectura pública), `app/lib/admin-catalog.server.ts` (alta/edición/orden/borrado)
- `app/routes/_index.tsx`, `app/components/ComingSoonRail.tsx`, componente nuevo de vista ampliada
- `app/routes/admin.proximamente.tsx` (nuevo), `app/components/admin/AdminSidebar.tsx`, `app/routes/admin.layout.tsx`, `app/routes.ts`
- `app/routes/admin.productos.nuevo.tsx`, `app/components/admin/ProductForm.tsx` (precarga)
- `app/data/comingSoon.ts` (se retira al migrar)

## Restricciones específicas de esta tarea

- El home debe verse igual que hoy (misma tarjeta, etiqueta y carrusel); lo único nuevo visible es la vista ampliada, pedida por la usuaria.
- Vista ampliada accesible: `role="dialog"`, `aria-modal`, foco atrapado, Escape y botón para cerrar, flechas para pasar de una a otra; el arrastre del carrusel no debe abrirla por error.
- Imágenes con `width`/`height` y `loading="lazy"` fuera de la vista inicial (sin CLS).
- Antes de subir: la usuaria aplica la migración. Si la tabla no existe, el home no debe romperse.

## Criterios de aceptación

- [x] Migración aplicada por la usuaria y las 7 prendas actuales visibles en el admin y en el home, igual que antes.
- [x] Desde el admin: agregar (nombre + foto), reordenar, ocultar/mostrar y borrar una prenda; el home lo refleja.
- [x] "Dar de alta como producto" abre el formulario con nombre y foto; al guardar, el producto aparece en el catálogo y la prenda sale de "Próximamente".
- [x] Clic (o Enter) en una prenda del home abre la vista ampliada; Escape/cerrar funciona; flechas navegan; se ve bien a 375 px.
- [x] Arrastrar el carrusel no abre la vista ampliada.
- [x] Sin tabla o sin prendas, el home no se rompe (la sección se oculta).
- [x] Typecheck y build sin errores.

## Verificación de requisitos anteriores

- Revisado al cerrar (2026-11-24): el home se ve igual que antes (misma tarjeta, etiqueta y carrusel; solo se suma la vista ampliada pedida); imágenes con lazy y sin CLS; la tabla `coming_soon_items` tiene RLS de lectura pública solo de prendas activas; el catálogo, feed, sitemap, inventario y carrito no cambian (Próximamente no usa `products`); sin tabla o sin prendas el home oculta la sección. Typecheck y build limpios.

## Notas de progreso

- 2026-11-23: tarea creada; explorado el código actual (lista fija en `comingSoon.ts`, fotos estáticas en `public/proximamente/`, subida del admin en `admin.upload.tsx` con `productId` tipo slug, helper `productImage()`). Falta todo lo demás.
- 2026-11-23 (2): implementado en local, sin subir. Hecho: migración `supabase/migrations/20261123000000_coming_soon_items.sql` (tabla + RLS + las 7 prendas actuales con su foto estática; la usuaria debe aplicarla ANTES de subir), tipos, lectura pública `app/lib/coming-soon.ts` (si falla/no existe la tabla devuelve [] y la sección se oculta; verificado en local), funciones del admin `app/lib/coming-soon-admin.server.ts`, home leyendo de la tabla, `ComingSoonRail` con cada foto como botón (el arrastre del carrusel no abre la vista), `ComingSoonViewer` (vista ampliada: Esc, X, fondo, flechas, deslizar), pantalla `/admin/proximamente` (alta con nombre + foto, renombrar, orden ← →, ocultar/mostrar, cambiar foto, borrar, "Dar de alta como producto"), `/admin/productos/nuevo?proximamente=<id>` con nombre, slug, foto y "Nuevo" precargados y, al guardar el producto, la prenda se quita de Próximamente. Se retiró `app/data/comingSoon.ts`. Typecheck y build limpios. Falta: que la usuaria aplique la migración, probar con datos reales (home, vista ampliada a 375 px, arrastre vs clic, admin con su login, alta como producto) y subir con "sí súbelo". Nota: el HTML del inicio se guarda en caché de borde (s-maxage=60 + stale-while-revalidate=300), así que un cambio del admin puede tardar unos minutos en verse.
- 2026-11-23 (3): la usuaria aplicó la migración (tabla con las 7 prendas, lectura pública verificada). Probado en local con datos reales: el home muestra las 7 tarjetas con sus fotos; clic real abre la vista ampliada (foto completa, etiqueta, nombre, X, flechas); flecha del teclado pasa a la siguiente; Esc y X cierran, el scroll de la página se libera y el foco vuelve a la foto que la abrió; arrastrar el carrusel (scrollLeft 51→554) NO abre la vista. En el emulador móvil la vista abre y funciona, pero el emulador reporta un ancho de ventana de 833 px (artefacto del emulador/pane), así que el centrado a 375 px no se pudo medir ahí. Typecheck y build limpios. Falta: que la usuaria pruebe `/admin/proximamente` con su sesión (alta con foto, renombrar, mover, ocultar, cambiar foto, borrar, dar de alta como producto → el formulario trae nombre/slug/foto/Nuevo y al guardar la prenda sale de Próximamente) y subir con "sí súbelo".
- 2026-11-23 (4): la usuaria probó `/admin/proximamente` con su sesión (alta, mover, ocultar, cambiar foto, borrar, dar de alta como producto) y autorizó subir. Se agregó una comprobación extra: `removeAfterProductCreated` solo quita la prenda de Próximamente si el producto existe, está publicado y tiene variantes (verificado en solo lectura: producto real sí, id inexistente no); `createProduct` ya borraba lo creado si fallaba algún paso. Subiendo a producción (migración ya aplicada). Falta: verificar en producción y que la usuaria vea la vista ampliada en su teléfono; después cerrar la tarea.
- 2026-11-24: en producción se ven las 6 tarjetas activas con su botón "Ver … en grande"; la usuaria confirmó la vista ampliada en su teléfono. Flexi Listón T-Shirt (dada de alta como producto real durante la prueba) se queda en el catálogo; le falta cargar el campo de materiales. Tarea cerrada.
