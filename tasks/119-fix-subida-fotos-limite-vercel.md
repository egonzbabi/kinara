---
id: 119
title: "Fix: subir una foto de producto tronaba con \"Unexpected token 'R'... is not valid JSON\""
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

El usuario reportó que al subir una foto de producto en `/admin`, el navegador mostraba `Unexpected token 'R', "Request En"... is not valid JSON`.

## Diagnóstico

`app/routes/admin.upload.tsx` permite archivos hasta 8MB (`MAX_SIZE_BYTES`) y siempre responde JSON, incluso en sus propios errores. Pero Vercel tiene un límite duro de **4.5MB** para el cuerpo de cualquier función serverless (Node.js) — no configurable, es de la plataforma, no de nuestro código. Cualquier foto entre 4.5MB y 8MB nunca llega a `admin.upload.tsx`: Vercel la rechaza antes con una respuesta de **texto plano** ("Request Entity Too Large..."), no JSON. `uploadImage()` en `ProductForm.tsx` intentaba `res.json()` sobre esa respuesta y tronaba con el error exacto que reportó el usuario. Fotos de celulares modernos fácilmente pesan más de 4.5MB, así que esto podía pasar con cualquier foto "normal", no solo casos extremos.

## Objetivo

Subir una foto de producto funciona sin importar qué tan pesada sea la foto original del celular/cámara, y si algo de todos modos falla, el error que se ve es claro (no un mensaje críptico de JSON).

## Archivos involucrados

- `app/components/admin/ProductForm.tsx` — `uploadImage()` y nueva función `compressImageIfNeeded()`.

## Restricciones específicas de esta tarea

- El límite de 4.5MB de Vercel no se puede subir ni configurar — la única solución real es que el archivo nunca llegue a pesar eso al momento de subirlo.
- No se puede probar el flujo completo end-to-end en `/admin` (requiere iniciar sesión con contraseña real, prohibido por política de seguridad de Claude) — se verificó el mecanismo de compresión (`createImageBitmap` + `canvas` + `toBlob`) de forma aislada en el navegador contra una foto real ya alojada en el sitio, confirmando que decodifica, redimensiona y re-comprime a JPEG sin errores.

## Solución

1. Nueva función `compressImageIfNeeded(file)`: si el archivo ya pesa ≤3.5MB (margen de seguridad bajo el límite de 4.5MB de Vercel) o es un GIF (perdería su animación al pasar por `<canvas>`), se sube tal cual. Si no, se decodifica con `createImageBitmap`, se redimensiona a un máximo de 2400px en el lado más largo, y se re-comprime a JPEG bajando la calidad (0.9 → 0.75 → ... hasta 5 intentos) hasta quedar bajo el límite objetivo.
2. `uploadImage()` ahora pasa el archivo por `compressImageIfNeeded()` antes de armar el `FormData`.
3. Si aun así la respuesta del servidor no es JSON válido (ej. algún otro límite de plataforma), se captura el error de `res.json()` y se muestra un mensaje claro ("Error del servidor (…) al subir la foto — intenta con otra imagen.") en vez de dejar que el error críptico de parseo llegue al usuario.

## Criterios de aceptación

- [x] Una foto de más de 4.5MB (ej. una foto de celular moderno) se comprime en el navegador antes de subirse, quedando bajo el límite de Vercel.
- [x] El sitio ya redimensiona/optimiza toda imagen de producto al mostrarla (`productImage()`, tarea 002) — comprimir el original a un máximo razonable (2400px) no afecta la calidad visual real en ningún lugar del sitio.
- [x] Si el servidor de todos modos responde algo que no es JSON, el error mostrado es legible, no el mensaje críptico original.
- [x] `npm run typecheck` limpio.
- [x] Verificado en el navegador que el mecanismo de compresión (decodificar + redimensionar + re-comprimir) funciona sin errores contra una imagen real.

## Verificación de requisitos anteriores

- Revisado contra `REQUISITOS.md`: sí — no cambia el límite de 8MB del servidor (`admin.upload.tsx`, sigue siendo una red de seguridad válida para el caso normal), solo agrega un paso previo del lado del cliente.
- Regresiones encontradas: ninguna — los archivos ya livianos (la mayoría de fotos ya optimizadas) se suben sin pasar por el paso de compresión.
- Requisitos nuevos agregados a `REQUISITOS.md`: ninguno nuevo — es un fix puntual, no un patrón que otras tareas deban repetir.

## Pruebas manuales

- Verificado en el navegador (`createImageBitmap` + `canvas` + `toBlob`) contra una foto real del sitio: decodifica, redimensiona y re-comprime a JPEG válido sin errores.
- `npm run typecheck` limpio, sin errores de consola en `/admin/productos` (verificado hasta donde es posible sin iniciar sesión con contraseña real).

## Notas de progreso

- 2026-09-18: Implementado y verificado en una sola sesión, a partir del error reportado por el usuario al subir una foto real.
