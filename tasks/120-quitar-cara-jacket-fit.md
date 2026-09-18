---
id: 120
title: "JACKET FIT: quitar la cara de las fotos (modelo de stock, no es de la marca)"
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

El usuario pidió quitar la cara de las fotos del producto **JACKET FIT** (`x17aegeg`, slug `chaqueta-fit`) porque son fotos de stock del proveedor con una modelo genérica — no son fotos del shooting propio de Kinara, y no se quiere mezclar esa cara con las de las modelos reales de la marca.

## Objetivo

Las 6 fotos de color de JACKET FIT (+ la genérica) ya no muestran la cara de la modelo, sin recurrir a difuminar (que se ve como "parche"), sino con un recorte limpio por debajo del cuello — tratamiento estándar en fotografía de producto de ropa.

## Archivos involucrados

- Ningún archivo de código — edición de imagen (Python/PIL) + Supabase Storage + tabla `product_images`.

## Restricciones específicas de esta tarea

- **No sobrescribir el mismo path en Storage.** El primer intento sobrescribió los archivos existentes (mismo nombre) y el sitio siguió mostrando la foto vieja con cara — el endpoint de transformación de imágenes de Supabase (`/render/image/public/...`) cachea las versiones redimensionadas por `cache-control: max-age=3600` sin importar que el archivo original cambie. Por eso el patrón ya establecido en el proyecto (`admin.upload.tsx`) siempre sube con un nombre nuevo con timestamp — se corrigió subiendo cada foto recortada a un path nuevo (`nocara-<color>-<timestamp>`) y actualizando `product_images.url` en la base de datos para apuntar ahí, en vez de reusar el nombre viejo.
- Los archivos viejos (con la cara) se borraron de Storage después de confirmar que el sitio ya servía las versiones nuevas — no tenía sentido dejarlos accesibles por su URL pública.

## Cómo se hizo

1. Se identificó el producto y sus 6 fotos de color (`Azul Gris`, `Lila`, `Negro`, `Café`, `Marino`, `Palo De Rosa`) + la genérica (idéntica a `Café`) vía Supabase.
2. Se descargaron localmente y se recortaron con Python/PIL, quitando la franja superior (cabeza + cuello) de cada una — el punto de corte se ajustó por foto según dónde terminaba el cuello en cada pose (no es un porcentaje fijo, varía porque el encuadre original no es idéntico entre fotos).
3. Se revisó cada recorte visualmente antes de subir, confirmando que no quedara ningún rastro de cara/mentón.
4. Se subieron a Supabase Storage con nombres nuevos (`x17aegeg/nocara-<color>-<timestamp>.<ext>`) y se actualizó el campo `url` de cada fila correspondiente en `product_images`.
5. Se borraron los 7 archivos viejos de Storage.

## Criterios de aceptación

- [x] Las 6 fotos de color + la genérica ya no muestran cara — verificado visualmente en cada una antes de subir.
- [x] El sitio en producción muestra las fotos nuevas (no las viejas cacheadas) — verificado en `/producto/chaqueta-fit` cambiando entre los 6 colores, y en la tarjeta de `/tienda?tipo=Chaqueta`.
- [x] El recorte automático a proporción 4:5 que hace `productImage()` (usado en toda foto de producto del sitio) sigue centrando bien el torso/chaqueta en las 6 fotos, sin cortar el cierre ni verse forzado — verificado visualmente en el detalle de producto.
- [x] Los archivos viejos (con la cara) ya no existen en Storage.

## Verificación de requisitos anteriores

- Revisado contra `REQUISITOS.md`: sí — no se agrega ningún requisito nuevo (es una corrección puntual de contenido, no un patrón de código), pero se confirma en la práctica el patrón ya documentado de "nunca reusar el mismo nombre de archivo al reemplazar una foto en Storage" (ya evidente en el naming con timestamp de `admin.upload.tsx`, ahora también verificado como necesario para evitar la caché del endpoint de transformación de imágenes).
- Regresiones encontradas: ninguna — el resto del catálogo no se tocó.
- Requisitos nuevos agregados a `REQUISITOS.md`: se documenta explícitamente la caché del endpoint `/render/image/public/` de Supabase como la razón de fondo para nunca sobrescribir un path existente al reemplazar una foto.

## Pruebas manuales

- Verificado en el navegador, en producción, cambiando entre los 6 colores de `/producto/chaqueta-fit`: ninguno muestra cara, todos muestran la chaqueta bien encuadrada.
- Verificado en `/tienda?tipo=Chaqueta` que la tarjeta de JACKET FIT (color Café) se ve consistente con el resto del catálogo.
- Confirmado por `content-length`/tamaño de archivo que las URLs nuevas en la base de datos sirven los archivos recortados, no los originales.

## Notas de progreso

- 2026-09-18: Implementado y verificado en una sola sesión, a partir del pedido explícito del usuario. El primer intento (sobrescribir el mismo path) no funcionó por la caché del endpoint de transformación de imágenes — corregido subiendo con nombre nuevo y actualizando la referencia en la base de datos.
