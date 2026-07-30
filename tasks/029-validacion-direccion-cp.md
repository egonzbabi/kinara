---
id: 029
title: "Checkout: validar/autocompletar colonia-municipio-estado contra el código postal"
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

El usuario pidió que se valide que la colonia/alcaldía-municipio/estado que se captura en `/checkout` corresponda realmente al código postal ingresado — hoy son 3 campos de texto libre sin ninguna relación entre sí, así que un cliente puede escribir un CP real con una colonia que no existe ahí (o de otro estado), y ese dato incorrecto es justo el que se manda a Skydropx para cotizar/generar la guía.

Se le preguntó al usuario cómo prefería obtener los datos de colonias/CP de México y eligió tener un catálogo propio en Supabase (en vez de depender de una API externa de pago/límite de uso como Copomex).

## Objetivo

`/checkout` usa un catálogo propio (importado de SEPOMEX, dataset público/oficial de Correos de México) para: al ingresar un CP de 5 dígitos, autocompletar y bloquear Estado y Alcaldía/Municipio (siempre son 1:1 por CP — confirmado sobre el dataset completo, 0 códigos postales con más de una combinación estado+municipio), y convertir "Colonia" en una lista desplegable con las colonias reales de ese CP (en vez de texto libre). Si el CP no se encuentra en el catálogo, los 3 campos vuelven a ser de texto libre (no bloquear el checkout).

## Archivos involucrados

- `supabase/migrations/20260729020000_postal_codes.sql` (nuevo) — tabla `postal_codes`.
- `scripts/import-postal-codes.ts` (nuevo) — importa el CSV de SEPOMEX a la tabla (~154k filas, ~31,878 CP distintos). Corre una sola vez (o cuando se quiera refrescar el catálogo).
- `app/routes/api.postal-code.tsx` (nuevo) — resource route, `GET ?cp=XXXXX` → `{ found, estado, municipio, colonias: string[] }`.
- `app/routes/checkout.tsx` — Estado/Municipio pasan a auto-rellenados (solo lectura) cuando el CP se resuelve; Colonia pasa de `<input>` a `<select>`.

## Restricciones específicas de esta tarea

- Dataset: `https://raw.githubusercontent.com/IcaliaLabs/sepomex/master/lib/sepomex_db.csv` (dataset público derivado del catálogo oficial de Correos de México/SEPOMEX, ~154k asentamientos). Columnas confirmadas por orden: `d_codigo|d_asenta|d_tipo_asenta|d_mnpio|d_estado|...` (el resto de columnas no se usan).
- No bloquear el checkout si el CP no está en el catálogo (edge case) — degradar a los 3 campos de texto libre como estaban antes.
- La tabla es un catálogo público de referencia (sin datos sensibles) pero se consulta server-side (resource route con `supabaseAdmin`), no se expone RLS pública — mismo patrón que `admins`/`orders`.
- No es necesario mantener el catálogo actualizado automáticamente — es una importación de una sola vez; si SEPOMEX agrega colonias nuevas en el futuro, hay que volver a correr el script de importación manualmente (documentado aquí para quien lo retome).

## Pasos sugeridos

1. Migración: tabla `postal_codes` (postal_code, colonia, tipo_asentamiento, municipio, estado), índice en `postal_code`.
2. Descargar el CSV y correr el script de importación (batches, dataset grande).
3. Resource route `api.postal-code.tsx`.
4. Actualizar `checkout.tsx`: fetch al llegar a 5 dígitos en CP; Estado/Municipio de solo lectura cuando se resuelve; Colonia como `<select>`; fallback a campos libres si no se encuentra.
5. Verificar en el navegador con un CP real (ej. 10710) y con uno inventado (ej. 00000) para confirmar el fallback.

## Criterios de aceptación

- [x] Tabla `postal_codes` importada con ~154k filas / ~31,878 CP distintos (158,864 filas exactas).
- [x] En `/checkout`, al escribir un CP válido de 5 dígitos, Estado y Alcaldía/Municipio se autocompletan y quedan de solo lectura, y Colonia se convierte en una lista desplegable con las colonias reales de ese CP.
- [x] Con un CP que no existe en el catálogo, los 3 campos siguen siendo editables como texto libre (no se bloquea el checkout).
- [x] Cambiar el CP después de haber resuelto uno anterior refresca correctamente Estado/Municipio/lista de colonias (no deja datos del CP anterior).
- [x] `npm run typecheck` pasa sin errores; verificado en el navegador sin errores de consola.

## Verificación de requisitos anteriores

- Revisado contra `REQUISITOS.md`: sí — no aplica ningún requisito de Supabase/Pagos existente de forma directa (es una tabla de referencia nueva, sin relación con `orders`/`products`), pero sigue el patrón general de RLS restrictivo + acceso server-side ya establecido.
- Regresiones encontradas: ninguna. Los 2 errores de consola vistos durante la prueba eran de un `<img src="">` del item de carrito de prueba inyectado manualmente por `localStorage` para probar sin pasar por el flujo de "añadir al carrito" — no relacionados con este cambio.
- Requisitos nuevos agregados a `REQUISITOS.md`: sí — la existencia del catálogo `postal_codes` y el patrón de uso, para que futuras tareas no dupliquen el dato ni lo traten como opcional.

## Pruebas manuales

- `/checkout` con CP real `10710`: Colonia mostró "Santa Teresa" (única colonia real de ese CP), Alcaldía/Municipio = "La Magdalena Contreras" y Estado = "Ciudad de México", ambos de solo lectura. **Hallazgo colateral**: el único pedido real existente (`ORD-MS558QLA`) tenía guardada la colonia "la magdalena", que **no corresponde** al CP 10710 según el catálogo oficial — confirma exactamente el problema que esta tarea buscaba prevenir.
- `/checkout` con CP inexistente `00000`: apareció el aviso "No encontramos ese código postal — verifica Colonia/Municipio/Estado manualmente." y los 3 campos volvieron a ser editables, sin bloquear el checkout.
- `/checkout` cambiando de `10710` a `64000` (Monterrey, 2 colonias reales): Colonia/Municipio/Estado se actualizaron correctamente a "La Finca"/"Monterrey"/"Nuevo León", sin quedar pegados con los datos del CP anterior.
- Sin errores de consola relacionados con el cambio (los 2 errores de `<img src="">` eran del dato de prueba inyectado, no del feature).

## Notas de progreso

- 2026-07-29: Tarea creada e implementada en la misma sesión. Usuario eligió catálogo propio en Supabase (vs. API externa tipo Copomex) tras preguntársele. Dataset descargado de `github.com/IcaliaLabs/sepomex` (derivado del catálogo oficial de Correos de México/SEPOMEX) y verificado (158,864 filas, 31,878 CP distintos, 0 con más de una combinación estado+municipio — confirma que el diseño 1 CP → 1 estado+municipio, N colonias es seguro). Se creó la tabla `postal_codes` (migración), se importó con `scripts/import-postal-codes.ts` (batches de 1000, ~160 requests), se agregó el resource route `api.postal-code.tsx` (`GET ?cp=`), y se actualizó `checkout.tsx`: un `useEffect` sobre `address.postalCode` dispara el fetch al llegar a 5 dígitos, con manejo de carrera (ignora la respuesta si el CP ya cambió antes de que llegue). Verificado extremo a extremo en el navegador con CP real, CP inexistente, y cambio entre dos CP reales distintos — todos los casos se comportan como se esperaba, incluyendo el hallazgo de que el pedido real existente tenía una colonia incorrecta para su CP.
