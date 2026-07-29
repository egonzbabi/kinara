---
id: 026
title: "Hero: corregir encuadre para que se vea la ropa deportiva, no solo el torso"
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

Tras la tarea 025 (carrusel), el usuario reportó que las fotos se veían "cortadas... que es donde se ve que están en ropa deportiva haciendo ejercicio" — es decir, el encuadre (`object-[center_20%]`, heredado de la tarea 024) mostraba solo cara/torso y dejaba fuera los leggings/ropa deportiva, que es justo lo que se quiere mostrar en un hero de e-commerce de ropa.

Causa raíz: en desktop el contenedor del hero es mucho más ancho que alto respecto al aspect ratio 2:3 (vertical) de las 4 fotos — con `object-cover` solo es visible ~36% del alto real de cada foto. Con el encuadre al 20% desde arriba, esa ventana visible caía sobre cara/hombros, no sobre las piernas.

## Objetivo

En desktop, el encuadre del hero muestra torso + parte de las piernas (donde se ve la prenda deportiva: top/bra + inicio de legging), no solo la cara. En mobile no cambia nada (ahí ya se ve el cuerpo completo, porque el contenedor es más angosto que las fotos y el recorte es lateral, no vertical).

## Archivos involucrados

- `app/components/Hero.tsx`

## Restricciones específicas de esta tarea

- Cambio mínimo y quirúrgico: solo el valor de `object-position` vertical, nada de la estructura del carrusel ni el resto del layout/copy (ya aprobado en tareas 024/025).

## Pasos sugeridos

1. Calcular qué fracción del alto de la foto es visible en desktop dado el contenedor actual, y qué posición vertical deja la zona de ropa (torso-piernas) dentro de esa ventana en las 4 fotos.
2. Ajustar `object-[center_20%]` a un valor que baje el encuadre.
3. Verificar visualmente las 4 fotos del carrusel en desktop y confirmar que mobile no se rompe.

## Criterios de aceptación

- [x] En desktop, las 3 fotos de pie (main + 2 de las 3 de apoyo) muestran claramente el top/bra deportivo y al menos el inicio del legging, no solo cara/hombros.
- [x] La foto sentada (hoodie) mejora respecto al encuadre anterior (se ve más cuerpo/pierna), aunque por la pose es la que menos "ropa deportiva en acción" muestra de las 4.
- [x] Mobile sigue mostrando el cuerpo completo, sin regresión.
- [x] `npm run typecheck` pasa sin errores; sin errores de consola.

## Verificación de requisitos anteriores

- Revisado contra `REQUISITOS.md`: sí, no aplica ningún requisito nuevo — es un ajuste de `object-position`, no de datos/Supabase.
- Regresiones encontradas: ninguna.
- Requisitos nuevos agregados a `REQUISITOS.md`: ninguno.

## Pruebas manuales

- Ciclado por las 4 fotos del carrusel en desktop (1280px) esperando el autoplay, confirmando en cada una que se ve la prenda deportiva.
- Mobile (375px): confirmado cuerpo completo visible, sin cambios respecto a antes.

## Notas de progreso

- 2026-07-29: Reportado por el usuario e implementado en la misma sesión. Cambiado `object-[center_20%]` a `object-[center_62%]` en el `<img>` del carrusel (`app/components/Hero.tsx`). Verificado ciclando las 4 fotos en desktop (1280px) — las 3 fotos de pie ahora muestran top/bra + leggings claramente; la foto sentada (hoodie) muestra más pierna que antes aunque sigue siendo la menos "activewear" de las 4 por la pose. Mobile (375px) confirmado sin cambios (ya mostraba cuerpo completo por recorte lateral, no vertical). `npm run typecheck` sin errores, sin errores de consola. Tarea cerrada.
