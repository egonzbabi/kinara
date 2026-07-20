# Flujo de tareas

Cada modificación al sitio se define como un archivo `NNN-nombre-corto.md` en esta carpeta (ej. `002-rediseno-hero.md`). Esto le da a cada tarea su propio contexto aislado, en vez de pedir cambios sueltos por chat.

## Orden de lectura obligatorio antes de ejecutar una tarea

1. [`../CLAUDE.md`](../CLAUDE.md) — reglas generales del proyecto (siempre aplican).
2. Este archivo — el formato y las convenciones de tareas.
3. [`REQUISITOS.md`](REQUISITOS.md) — checklist acumulado de todo lo que ya exigieron tareas anteriores.
4. El archivo de la tarea específica (`NNN-nombre.md`) — contexto, alcance y criterios de aceptación de ESA tarea.

Si una tarea entra en conflicto con `CLAUDE.md`, ganan las reglas de `CLAUDE.md` salvo que la tarea diga explícitamente que las reemplaza para ese caso puntual.

## Verificación contra requisitos anteriores (obligatorio)

Ninguna tarea se marca `done` solo por cumplir sus propios criterios de aceptación. Antes de cerrarla:

1. Revisar cada punto ya marcado en [`REQUISITOS.md`](REQUISITOS.md) y confirmar que el cambio no lo rompe (ej. si una tarea anterior exigió "LCP < 2.5s" o "todas las imágenes con alt", la tarea actual no puede regresar eso).
2. Si algo se rompió, arreglarlo antes de cerrar la tarea — no se abre una tarea nueva para arreglar una regresión introducida en la misma sesión.
3. Si esta tarea introduce un requisito nuevo que debe sobrevivir a futuro (un estándar, no un detalle puntual), agregarlo a `REQUISITOS.md` en la categoría correspondiente con `(origen: tarea NNN)`.
4. Dejar constancia en la tarea (sección "Verificación de requisitos anteriores") de qué se revisó y el resultado.

## Crear una tarea nueva

1. Copia [`_TEMPLATE.md`](_TEMPLATE.md) a `NNN-nombre-corto.md` (siguiente número disponible).
2. Rellena todas las secciones. Sé específico en "Criterios de aceptación" — son lo que determina si la tarea está terminada.
3. Marca `status: pending`.

## Estados

- `pending` — definida, no iniciada.
- `in-progress` — se está trabajando.
- `done` — cumple todos los criterios de aceptación y fue probada.

## Archivos de este sistema

- [`REQUISITOS.md`](REQUISITOS.md) — checklist acumulado, vivo, de todo lo que ya se exigió y no se puede romper.
- `_TEMPLATE.md` — plantilla para tareas nuevas.

## Índice de tareas

| # | Archivo | Estado | Descripción |
|---|---------|--------|-------------|
| 001 | [001-ejemplo.md](001-ejemplo.md) | ejemplo | Tarea de muestra — bórrala cuando ya no la necesites de referencia |
| 002 | [002-performance-core-web-vitals.md](002-performance-core-web-vitals.md) | pending | Performance y Core Web Vitals |
| 003 | [003-seo-tecnico.md](003-seo-tecnico.md) | pending | SEO técnico (metadatos, JSON-LD, sitemap, robots.txt) |
| 004 | [004-google-analytics.md](004-google-analytics.md) | pending | Google Analytics 4 con eventos de e-commerce (requiere Measurement ID del usuario) |
| 005 | [005-ui-ux-accesibilidad.md](005-ui-ux-accesibilidad.md) | pending | Auditoría de UI/UX y accesibilidad (WCAG AA) |
| 006 | [006-supabase-productos.md](006-supabase-productos.md) | done | Migrar catálogo e imágenes a Supabase |
| 007 | [007-stripe-checkout.md](007-stripe-checkout.md) | done | Cobros con Stripe Checkout Sessions hospedado, modo test |
| 008 | [008-copy-envios-pesos.md](008-copy-envios-pesos.md) | pending | Actualizar copy de envíos/devoluciones a pesos mexicanos (⚠️ recordar antes de dar el sitio por terminado) |
| 009 | [009-fotos-por-color.md](009-fotos-por-color.md) | done | Fotos reales por color de producto desde el catálogo del proveedor (5 productos) |
| 010 | [010-fotos-por-color-restante.md](010-fotos-por-color-restante.md) | done | Fotos por color restantes — 8 productos más con foto real por color |
| 011 | [011-fotos-lulu-top.md](011-fotos-lulu-top.md) | done | Fotos por color de LULU TOP (080924 y 2315), omitido de tareas 009/010 |
| 012 | [012-ajustar-color-hex-swatch.md](012-ajustar-color-hex-swatch.md) | done | Ajustar `color_hex` de 62 colores para que el swatch coincida con la foto real |
| 013 | [013-galeria-miniaturas-por-color.md](013-galeria-miniaturas-por-color.md) | done | Miniaturas de la galería del detalle de producto muestran la foto de cada color |
| 014 | [014-boton-volver-detalle.md](014-boton-volver-detalle.md) | done | Botón "Volver" en el detalle de producto regresa a la tienda con filtros y scroll intactos |
| 015 | [015-panel-admin-productos.md](015-panel-admin-productos.md) | done | Panel de administración de productos (login + CRUD) |
| 016 | [016-modelo-id-regenerado.md](016-modelo-id-regenerado.md) | done | Campo `modelo` por color/talla + regenerar `products.id` |

Sin orden fijo — se ejecutan según se indique. La tarea 004 tiene un prerrequisito a cargo del usuario (crear la property de GA4) antes de poder implementarse.
