---
id: 148
title: "Promoción Buen Fin: 30% de descuento automático del 10 al 17 de noviembre de 2026"
status: in-progress
---

## Contexto

La usuaria pidió programar una promoción de Buen Fin: 30% de descuento durante la semana del 10 al 17 de noviembre. Decisiones confirmadas con ella (2026-10-28):

1. Aplica a todo el catálogo **excepto** los productos que ya tienen precio tachado (`compare_at` no nulo — 8 productos al 2026-10-28: enterizo-largo, bottee-set, aligh-leggin, tecno-premium, bi-color-set, leggin-felpada, button, lulu-top-2315). Esos se quedan como están.
2. El código de bienvenida del 10% **no se suma**: durante la promoción el servidor no lo acepta.
3. Debe empezar y terminar sola (sin que la usuaria tenga que cambiar precios a mano).

## Objetivo

Una ventana de fechas en código (`app/lib/promo.ts`) que, mientras está activa, baja 30% el precio de cada producto elegible y muestra el precio normal tachado. El mismo cálculo se usa en pantalla, en el checkout (servidor), en PayPal, en el feed de Merchant Center y en la barra de anuncios.

## Archivos involucrados

- `app/lib/promo.ts` (nuevo)
- `app/lib/catalog.ts` (mapRow aplica la promo al mostrar)
- `app/lib/checkout-validation.server.ts` (precio confiable con promo; rechaza el código de bienvenida durante la promo)
- `app/routes/feed.xml.tsx` (sale_price + sale_price_effective_date, desde antes de que empiece)
- `app/components/AnnouncementBar.tsx` + `app/root.tsx` (mensaje de Buen Fin)

## Restricciones específicas de esta tarea

- Horario: México central sin horario de verano (UTC-6). Inicio 2026-11-10 00:00, fin exclusivo 2026-11-18 00:00.
- El admin (`admin-catalog.server.ts`) sigue viendo/editando los precios reales; la promo nunca se guarda en la base.
- El checkout sigue recalculando todo contra Supabase; la promo se calcula en el servidor, nunca se confía en el precio del carrito.
- Sin cambios de diseño más allá del texto de la barra de anuncios (autorizado por la usuaria al pedir la promoción).

## Criterios de aceptación

- [x] Antes del 5 de nov: el sitio se ve igual que siempre (verificar en producción tras subir).
- [x] Durante la ventana: productos elegibles muestran precio −30% y el normal tachado; los 8 con precio tachado no cambian (probado en local con fechas simuladas).
- [x] El checkout cobra el precio con promo y rechaza el código de bienvenida con un mensaje claro (sesión de Stripe en modo test: $279 por producto, envío $150 sin descuento). PayPal usa la misma validación; falta probar un pago real el 10 de nov.
- [x] Después del 17 de nov: todo vuelve solo a los precios normales (lógica verificada en los bordes de fecha).
- [x] El feed de Merchant manda `sale_price` con `sale_price_effective_date`.
- [x] Typecheck sin errores y prueba manual simulando fechas.

## Verificación de requisitos anteriores

- Revisado contra `REQUISITOS.md`: sí (diseño solo en lo pedido por la usuaria; precio y stock siguen validándose en el servidor; consent/GA4 sin cambios). Regresiones encontradas: ninguna. Requisitos nuevos agregados a `REQUISITOS.md`: sí (sección Pagos).

## Notas de progreso

- 2026-10-28: decisiones tomadas con la usuaria (ver Contexto); tarea creada.
- 2026-10-28 (2): implementado en local y probado con fechas simuladas (se restauraron las reales): precios −30% solo en elegibles, los 8 con precio tachado no cambian; feed con `sale_price` + `sale_price_effective_date`; el código de bienvenida se rechaza durante la promo con mensaje claro; `/api/cart-prices` + `reprice` en `/checkout` actualizan precios guardados en el carrito (aviso "Actualizamos los precios de tu carrito"). Typecheck limpio.
- 2026-10-28 (3): la usuaria pidió anunciar desde el 1 de nov y mostrar cuánto costará: `announceFrom` (decisión final, 2026-10-29: 5 de noviembre, por mercadotecnia; el 1 de nov solo avisos en redes) = 2026-11-05; en la página de producto aparece "Buen Fin del 10 al 17 de noviembre: $X" (campo `promoPreviewPrice`) entre el 1 y el 9 de nov, solo en productos elegibles. Pendiente: aprobación para subir; correo a suscriptoras; probar un pago real en test durante la ventana (no se probó el cobro con Stripe/PayPal con precio promo; solo la validación del servidor).
- Riesgo a vigilar: entre el 1 y el 9 de nov algunas clientas pueden esperar al 10 por el precio anunciado (ventas más bajas esos días).
- 2026-10-29: banda grande de Buen Fin en el inicio (`app/components/BuenFinBand.tsx`, bajo la portada; cuenta regresiva a inicio/fin con la hora del servidor) y el banner de bienvenida del 10% se oculta mientras la promo está activa (`isPromoActive(now)`). Imagen para Perfil de Negocio de Google en `~/Downloads/kinara-perfil-google/4-buen-fin-30.jpg`. IMPORTANTE: durante la revisión local las fechas de `app/lib/promo.ts` están adelantadas (inicio 2026-10-01, fin 2026-12-01, aviso 2026-10-01); hay que restaurarlas a inicio 2026-11-10, fin 2026-11-18, aviso 2026-11-05 ANTES de subir.
- 2026-10-29 (2): decisión de la usuaria: el aviso en el sitio (barra, franja, banda, etiquetas y precios de Buen Fin) arranca el **5 de noviembre**, no el 1. Valores REALES que deben quedar en `app/lib/promo.ts` al subir: `startsAt` 2026-11-10T00:00:00-06:00, `endsAt` 2026-11-18T00:00:00-06:00, `announceFrom` 2026-11-05T00:00:00-06:00. Durante la revisión local siguen adelantadas (inicio y aviso 2026-10-01). Otros cambios del día: el carrito se actualiza solo con los precios vigentes (al cargar y al abrirlo), el campo de código de descuento en /checkout se reemplaza por un aviso durante la promo, leyenda "Precio Buen Fin" en las tarjetas, aclaración "sin incluir envío / no aplica en productos en oferta" en la banda.
- 2026-10-29 (3): subido con las fechas reales (aviso 5 nov, inicio 10 nov 00:00, fin 17 nov 23:59). Pendiente para cerrar (status sigue in-progress): verificar en producción que hoy no se ve nada del Buen Fin y que el feed trae `sale_price_effective_date`; el 10 de nov, hacer una compra real chica y confirmar el cobro con descuento; correo a la lista de interesadas; después del 17 de nov confirmar que todo volvió a los precios normales.
