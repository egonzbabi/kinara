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
- 2026-10-12 (tarde): `/feed.xml` en producción (commit 4bb051f), verificado: 579 items / 43 productos. Cuenta de Merchant Center "Kinara Fit" (5835428293) corregida por el usuario: URL → `https://www.kinarafit.com.mx` (verificada y reclamada vía Search Console/GA), política de devoluciones (sin devoluciones, enlaza a `/politica-de-cambios-y-devoluciones`) y se quitó un administrador (kinaramarketplace@gmail.com). Fuente de datos "obtención programada" diaria creada; leyó los 579 productos; fichas gratuitas "Activado".
- Diagnóstico inicial: todos "no aprobados" porque estaban configurados para 37 países sin envío. Decisión del usuario: dejar **solo México** (el checkout/Skydropx solo envía a México; vender fuera es un proyecto aparte). Pendiente: esperar 24-72 h y revisar Diagnóstico; la "revisión inicial" de Google puede tardar días. Las 1,014 imágenes del feed responden 200 (el aviso "URL de imagen rota" debe re-evaluarse tras la nueva lectura). Tarea queda `in-progress` hasta que Merchant Center apruebe los productos.
- 2026-10-12 (noche): revisión de descripciones por SEO/Merchant (sin subir código, solo datos en Supabase, aprobado por el usuario). Corregidas ortografía/espacios en 9 productos (AURA SKIRT, AURA LEGGIN, FIT SHORT, GLOW LEGGIN, Nova Wrap Top, CORE SET, SCULPT SET, ZIPPER SKIRT, CROP TOP) y reescritas las 14 descripciones cortas (ALLURE LEG PANTS → "corte ancho", FLOW PANTS, MOVE SHORT, NOVA BRA, Fely Nova Pants, Motion top, GLOW JUMPSUIT, DUO MOTION/SPRINT SET, SCULPT RIB SET, SMOOTH SET, SCULPT FLARE LEGGING, SOFT FLARE PANTS, NEWYORK SET). Copias de los textos originales en el scratchpad de la sesión (`descripciones-originales-2026-10-12.json`, `descripciones-cortas-originales-2026-10-12.json`). Pendiente: ZIPPER SKIRT dice "No transpira" (¿"No transparenta"?); ALLURE LEG PANTS aún dice "Corte recto" en su campo de características (el usuario dice que es ancho); en el feed, `g:material` toma el campo "materiales" que en muchos productos trae frases de características en vez de la composición — mandar solo si trae porcentajes.
- 2026-10-12 (noche, 2): ZIPPER SKIRT ya sin "No transpira" (lo corrigió el usuario). ALLURE LEG PANTS: campo de características "Corte recto" → "Corte ancho" (dato en Supabase). Feed: `g:material` ahora solo se manda cuando el campo "materiales" trae porcentajes (composición real) y los conjuntos se formatean "Top: …; Pantalón: …" (`materialFor` en `feed.xml.tsx`). Probado en local: 579 items, 378 con composición y 201 sin `material`; typecheck OK. Falta: subir a producción (pendiente de aprobación del usuario).
- 2026-10-12 (noche, 3): Merchant Center reportó "Tipo de imagen no admitido [image_link]" aunque las 1,014 imágenes son JPEG/PNG válidas; al pedirlas en ráfaga Supabase Storage responde 429 (JSON), que Google probablemente lee como tipo no admitido. Mitigación aprobada por el usuario: máx. 2 imágenes por variante (principal + 1 adicional) en `feed.xml.tsx` para reducir la ráfaga. Falta: subir (pendiente de aprobación) y revisar si el aviso baja tras la siguiente lectura; si persiste, proponer servir las fotos del feed desde el dominio propio o con caché.
