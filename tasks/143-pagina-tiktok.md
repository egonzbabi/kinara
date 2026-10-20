---
id: 143
title: "Página /tiktok (enlace en la bio) con las prendas de los videos"
status: in-progress
---

## Contexto

TikTok no permite enlaces pulsables dentro de un video hacia una tienda propia (solo con TikTok Shop o anuncios). Lo estándar es un único enlace en la biografía. La usuaria quiere que quien vea un video llegue directo a la prenda.

## Objetivo

Página `kinarafit.com.mx/tiktok`: mensaje de marca, botones a la tienda y al 10 % de bienvenida, y una cuadrícula con las prendas de los videos, cada una enlazada a su producto con etiquetas UTM (`utm_source=tiktok&utm_medium=social&utm_campaign=link_en_bio`) para medir en GA4 cuántas ventas vienen de TikTok.

## Archivos involucrados

- `app/routes/tiktok.tsx` (nueva)
- `app/lib/tiktok-links.ts` (lista de prendas `TIKTOK_FEATURED_SLUGS` y UTM)
- `app/routes.ts`

## Restricciones específicas de esta tarea

- `noindex, follow` y fuera del sitemap (contenido repetido de la tienda; solo para tráfico de redes).
- Las prendas se eligen por `slug` en `tiktok-links.ts`; si la lista está vacía se arma sola con los más vendidos y los más nuevos (ropa con stock, máx. 8).
- Mismo estilo del sitio (tipografías, colores, `LinkButton`); sin cambios en las demás páginas.

## Criterios de aceptación

- [x] `/tiktok` responde 200, un solo h1, `noindex, follow`, y no está en el sitemap.
- [x] Cada prenda enlaza a `/producto/<slug>` con las UTM.
- [x] Los botones "Ver toda la colección" y "10 % de bienvenida" llevan UTM.
- [x] Se ve bien en 375 px; las fotos cargan.
- [x] Typecheck sin errores.

## Verificación de requisitos anteriores

- Revisado contra `REQUISITOS.md`: sí (página nueva; sin tocar el resto; un solo h1; fotos con alt, width y height)
- Regresiones encontradas: ninguna
- Requisitos nuevos agregados a `REQUISITOS.md`: ninguno

## Pruebas manuales

- Abrir `/tiktok` en local y en producción, tocar una prenda y comprobar que la URL conserva las UTM; en GA4 (Tiempo real) debe aparecer origen `tiktok`.

## Notas de progreso

- 2026-10-19: implementada y verificada en local (8 prendas automáticas). Falta subir (aprobación pendiente) y que la usuaria elija las prendas definitivas de sus videos (slugs).
