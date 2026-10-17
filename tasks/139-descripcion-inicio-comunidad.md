---
id: 139
title: "Descripción del inicio en Google: ropa deportiva + comunidad"
status: in-progress
---

## Contexto

El fragmento que Google muestra bajo el título del resultado de kinarafit.com.mx sale de la meta description del inicio (`app/routes/_index.tsx`): "Athleisure técnico en tonos cálidos… Nueva colección SS26." Pierde vigencia con la temporada y no menciona ropa para mujer ni la comunidad. La usuaria eligió la opción A.

## Objetivo

Cambiar la meta description del inicio (y con ella og:description y twitter:description, que salen del mismo `seoMeta`) a: "Más que ropa deportiva: una comunidad de mujeres que se mueven y se sienten fuertes. Leggings, tops y conjuntos. Compra en línea con envíos a todo México." (154 caracteres, versión acortada a pedido de la usuaria para que Google no la corte)

## Archivos involucrados

- `app/routes/_index.tsx`

## Restricciones específicas de esta tarea

- Solo cambia el texto de `<meta>` (no se ve en la página). Texto aprobado por la usuaria.
- El título (`KINARA · Ropa deportiva con alma`) no se toca.
- La descripción del JSON-LD Organization y la de `root.tsx` quedan igual (otra superficie).

## Criterios de aceptación

- [x] El `<meta name="description">` del inicio y los og/twitter muestran el texto nuevo.
- [x] Typecheck sin errores (exit 0).

## Verificación de requisitos anteriores

- Revisado contra `REQUISITOS.md`: sí (solo cambia texto de `<meta>`)
- Regresiones encontradas: ninguna
- Requisitos nuevos agregados a `REQUISITOS.md`: ninguno

## Pruebas manuales

- Ver el `<head>` del inicio en local y en producción.

## Notas de progreso

- 2026-10-16: texto cambiado en `_index.tsx`; falta verificar, subir (aprobación pendiente) y esperar a que Google actualice el fragmento (días).
- 2026-10-16 (2): verificado en local (description, og y twitter con el texto nuevo, 214 caracteres). Falta subir (aprobación pendiente).
- 2026-10-16 (3): acortada a 154 caracteres a pedido de la usuaria (la versión A completa medía 210 y Google suele cortar a ~155). Verificado en local, typecheck OK. Falta subir (aprobación pendiente).
