---
id: 132
title: "Feed de productos para Google Merchant Center (/feed.xml)"
status: in-progress
---

## Contexto

Se creó la cuenta de Google Merchant Center "Kinara Fit" (5835428293) para que los productos aparezcan gratis en Google (fichas gratuitas / pestaña Shopping). Merchant Center necesita un archivo de productos que se actualice solo.

## Objetivo

Ruta `/feed.xml` que genera, desde el catálogo real de Supabase, un feed RSS 2.0 con el namespace `g:` de Google, un `<item>` por variante (color + talla), solo ropa (sin accesorios).

## Archivos involucrados

- `app/routes/feed.xml.tsx` (nuevo)
- `app/routes.ts`
- `app/routes/robots.txt` / `public/robots.txt` si hiciera falta (no se bloquea)

## Restricciones específicas de esta tarea

- Solo categorías `mujer` y `hombre` (el usuario pidió explícitamente "solo ropa, no accesorios").
- Sin cambios visuales en el sitio.
- Imágenes con la URL original de Supabase Storage, nunca la de transformación (cuota de Image Transformations).
- No subir a producción sin aprobación del usuario.

## Criterios de aceptación

- [x] `/feed.xml` devuelve XML válido con `Content-Type: application/xml`.
- [x] Un item por variante, con `item_group_id` por producto.
- [x] Accesorios excluidos; productos en borrador excluidos (ya lo hace `getAllProducts`).
- [x] Disponibilidad según stock real de cada variante.
- [x] `price` = precio original y `sale_price` = precio actual cuando hay `compare_at`.
- [x] Typecheck sin errores.

## Verificación de requisitos anteriores

- Revisado contra `REQUISITOS.md`: sí (solo se agrega una ruta nueva; no cambia nada visual ni de checkout)
- Regresiones encontradas: ninguna
- Requisitos nuevos agregados a `REQUISITOS.md`: el feed de Merchant Center solo incluye ropa, imágenes originales de Storage

## Pruebas manuales

- Abrir `http://localhost:5173/feed.xml` y revisar los items.

## Notas de progreso

- 2026-10-12: tarea creada; ruta `/feed.xml` implementada y probada en local: 579 items (un item por color+talla) de 43 productos de ropa, 0 ids duplicados, 83 con `sale_price`, 566 en stock / 13 agotados, 0 imágenes de transformación. Los 15 productos de accesorios quedan fuera (verificado contra Supabase: 43 mujer + 15 accesorios = 58). Typecheck OK.
- Falta: subir a producción (requiere aprobación del usuario), agregar `https://www.kinarafit.com.mx/feed.xml` como fuente de datos en Merchant Center (Configuración → Fuentes de datos → Añadir fuente → Obtención programada) y revisar los diagnósticos de Merchant Center tras la primera lectura. Cuando Merchant Center lo acepte, marcar la tarea `done` aquí y en `tasks/README.md`.
