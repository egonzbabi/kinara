---
id: 154
title: "Promoción Black Friday y Cyber Monday: 30% automático del 27 al 30 de noviembre de 2026"
status: in-progress
---

## Contexto

El Buen Fin terminó el 17 de nov. La usuaria (2026-11-24) pidió preparar el sitio igual que para el Buen Fin pero para Black Friday y Cyber Monday, con el mismo 30%, y que NO se vea igual: otros colores en los banners y un adorno alusivo a las fechas (autorización puntual de diseño solo para los banners de la promo).

Fechas: Black Friday = viernes 27 de nov de 2026 (el día después de Thanksgiving, jueves 26); Cyber Monday = lunes 30 de nov. La promoción abarca del viernes 27 00:00 al lunes 30 23:59 (hora de México, UTC-6). Aviso en el sitio desde el miércoles 25 de nov.

Reglas heredadas de la tarea 148 (sin cambios): 30% en todo el catálogo excepto productos con precio tachado (`compare_at`); solo en productos, nunca en el envío; no se suma al código de bienvenida del 10% ni a códigos de promotora (el servidor los rechaza mientras la promo está activa).

## Objetivo

Que `app/lib/promo.ts` pase a describir esta promoción (nombre, fechas, textos) y que la franja, la banda grande y la barra de anuncios tengan una identidad visual propia de Black Friday / Cyber Monday (champaña luminoso + texto espresso, destellos, haz de luz, etiquetas de los dos días).

## Archivos involucrados

- `app/lib/promo.ts` (nombre, fechas, textos, ventana del feed)
- `app/components/BuenFinBand.tsx` → `PromoBand.tsx` (nombre actualizado; colores y adornos nuevos), `app/components/AnnouncementBar.tsx`, `app/routes/_index.tsx`, `app/app.css` (tokens de color y animación de los destellos)

## Restricciones específicas de esta tarea

- El diseño de la tienda sigue intocable: solo cambian los banners de la promoción (franja, banda, barra de anuncios). Precios, tarjetas y checkout no cambian de aspecto.
- Todo el cálculo de precios sigue en `promo.ts` / servidor; nada se guarda en la base.
- Accesibilidad: contraste ≥ 4.5:1 con los colores nuevos; adornos decorativos con `aria-hidden`; animaciones apagadas con `prefers-reduced-motion`.
- Nunca subir con fechas simuladas (se adelantan solo temporalmente para revisar en local).

## Criterios de aceptación

- [ ] Antes del 25 de nov: el sitio se ve igual que siempre (sin banners de la promo).
- [ ] Desde el 25 de nov: franja, banda y barra de anuncios con el diseño nuevo y la cuenta regresiva al 27 de nov 00:00.
- [ ] Del 27 al 30 de nov: precios −30% en productos elegibles con el normal tachado; el checkout cobra el precio con promo (probado en modo test).
- [ ] El 1 de dic: todo vuelve solo a los precios normales.
- [ ] El feed de Merchant manda `sale_price_effective_date` con la ventana nueva.
- [ ] Contraste AA y 375 px revisados; sin textos de "Buen Fin" visibles.
- [ ] Typecheck y build sin errores.

## Verificación de requisitos anteriores

- Pendiente de revisar contra `REQUISITOS.md` al cerrar.

## Notas de progreso

- 2026-11-24: tarea creada; fechas decididas (27–30 nov, aviso desde el 25). Falta todo lo demás.
- 2026-11-24 (2): implementado en local, sin subir. `promo.ts` ahora es Black Friday y Cyber Monday (inicio 2026-11-27 00:00, fin exclusivo 2026-12-01 00:00, aviso 2026-11-25, `feedWindow` actualizado, `fullName` y `days`). `BuenFinBand.tsx` renombrado a `PromoBand.tsx` (`PromoStrip`, `PromoBand`) con diseño propio: fondo noche (`--color-night` #15110d) + dorado (`--color-gold` #dcb870) agregados en `app.css`, destellos que parpadean suave (`animate-twinkle`, apagado con reduced-motion), ícono de etiqueta, y en la banda dos fichas "Vie 27 Black Friday" / "Lun 30 Cyber Monday". Barra de anuncios en noche/dorado (separador ✦) mientras la promo está anunciada. Textos de checkout y error de códigos usan el nombre completo. Revisado en local con fechas simuladas (que se restauraron; verificado con grep): aviso previo ("Empieza en") y fase activa ("Termina en", precios −30% con el normal tachado, badge "Black Friday −30%", mensaje de bienvenida oculto) en escritorio y a 375 px. No se re-probó un pago de Stripe/PayPal con la promo (el cálculo de precios es el mismo código de la 148). Falta: aprobación para subir, verificar en producción (hoy no debe verse nada hasta el 25), compra real chica el 27, y confirmar el 1 de dic que todo volvió a la normalidad.
- 2026-11-24 (3): la usuaria pidió que se vea MUY distinto al Buen Fin (más luminoso, fondo claro y letras del color oscuro). Rediseño: fondo degradado crema → champaña (`--color-champagne-light`, `--color-champagne`) con brillos blancos, haz de luz que cruza (`animate-shine`), texto espresso, rótulos en tinta dorada oscura (`--color-gold-ink` #7a5314, ~5.4:1), botón espresso (inverso al terracota del Buen Fin), fichas translúcidas blancas, destellos en tinta dorada; la barra de anuncios también es champaña con texto espresso. Se retiraron los tokens `night`/`gold` oscuros. Revisado en local a 800 px y 375 px. Pruebas del servidor (mismo día): producto elegible $899 → $629 (envío $150 sin descuento, total $779), producto con precio tachado sin cambio ($849), código de bienvenida y de promotora rechazados con mensaje claro, `/api/validate-code` responde no válido. Pendiente: restaurar `announceFrom` a 2026-11-25 (hoy está adelantado a 2026-11-01 con marca `/*SIM*/` solo para revisar en local) antes de subir.
- 2026-11-24 (4): la usuaria aprobó el destello y pidió que sea más frecuente: haz de luz cada 3.4 s (antes 6.5 s, con menos pausa) y destellos cada 2.2 s (antes 3.4 s). Sigue pendiente restaurar `announceFrom` (marca `/*SIM*/` en `promo.ts`) antes de subir.
- 2026-11-24 (5): el haz de luz ahora va y regresa sin pausa (`animation-direction: alternate`, 2.8 s por tramo) y recorre todo el ancho del banner (antes llegaba al ~86%). Verificado midiendo su posición en el navegador. Sigue pendiente restaurar `announceFrom` (marca `/*SIM*/` en `promo.ts`) antes de subir.
- 2026-11-24 (6): la usuaria pidió esperar a que su clienta lo vea mañana (25 nov) antes de subir. `announceFrom` ya se restauró a 2026-11-25 (sin marcas `/*SIM*/`); con las fechas reales, el aviso se verá solo en local a partir del 25 de nov 00:00 (hora de México). Todo está sin commit ni push. IMPORTANTE: la promo debe estar subida antes del viernes 27 de nov 00:00 para que cobre el 30% y para que el aviso salga en producción; esperar solo el visto bueno de la clienta y el "sí súbelo" de la usuaria.
- 2026-11-25 (7): la usuaria dio el visto bueno de su clienta y pidió subir. Verificado: sin marcas `/*SIM*/`, fechas reales en `promo.ts` (aviso 25 nov, inicio 27 nov 00:00, fin exclusivo 1 dic 00:00), typecheck limpio. Subido en un commit propio (sin `logo-kinara-fit-cuadrado.png` ni .pyc). Falta: verificar en producción tras el deploy, compra real chica el 27 nov (incl. PayPal, no probado en vivo) y confirmar el 1 dic que volvió a precios normales; con eso se tildan los criterios y se cierra la tarea.
