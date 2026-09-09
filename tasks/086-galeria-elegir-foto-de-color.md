---
id: 086
title: "Galería genérica: elegir una foto ya subida a un color, sin volver a subirla"
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

En `/admin/productos`, la sección "Galería (fotos genéricas)" solo permitía subir un archivo nuevo desde la computadora. Si el admin quería usar ahí una foto que ya había subido a algún color (sección de arriba en el mismo formulario), tenía que descargarla y volver a subirla — el usuario pidió poder elegirla directo de las fotos que ya están arriba, por color.

## Objetivo

En la sección de Galería, además de subir un archivo nuevo, se puede elegir una foto ya subida a cualquier color del mismo producto — se agrega la misma URL a la galería, sin volver a subir el archivo.

## Archivos involucrados

- `app/components/admin/ProductForm.tsx`:
  - Nueva función `addGalleryFromColor(url)` — agrega la URL a `gallery` si no está ya (evita duplicados).
  - Nueva sección dentro de "Galería (fotos genéricas)": miniaturas de todas las fotos ya subidas, agrupadas por color (solo se muestran los colores que ya tienen alguna foto). Clic en una la agrega a la galería; una que ya está agregada se ve atenuada y deshabilitada, para no duplicarla dos veces.

## Restricciones específicas de esta tarea

- No sube ningún archivo nuevo ni duplica el archivo en Storage — reutiliza exactamente la misma URL que ya usa la foto del color, así que un cambio futuro a esa foto (si se reemplaza) también se reflejaría en la galería (comparten el mismo archivo).
- No se tocó la opción de subir un archivo nuevo — sigue funcionando igual, esto es una opción adicional ("O elige una foto ya subida arriba, por color"), no un reemplazo.
- Mismo estilo visual ya usado en el resto del formulario (miniaturas `h-16 w-14`, borde `border-clay` al usar hover, texto `text-muted`) — sin paleta ni tipografía nueva.

## Criterios de aceptación

- [x] Si el producto tiene fotos de color cargadas, aparece la sección para elegir una de esas fotos para la galería.
- [x] Al hacer clic en una foto de color, se agrega a la galería sin subir nada nuevo.
- [x] Una foto ya agregada a la galería no se puede volver a agregar (aparece deshabilitada).
- [x] Si ningún color tiene fotos todavía, la sección no aparece (nada que elegir).
- [x] `npm run typecheck` pasa sin errores.

## Verificación de requisitos anteriores

- Revisado contra `REQUISITOS.md`: sí — reutiliza estilos y patrones ya aprobados del mismo formulario, sin paleta ni layout nuevos.
- Regresiones encontradas: ninguna — la subida de archivo nuevo para la galería sigue intacta; se confirmó que `/admin/productos/nuevo` carga sin errores de servidor.
- Requisitos nuevos agregados a `REQUISITOS.md`: no aplica.

## Pruebas manuales

- `npm run typecheck` limpio.
- En el navegador: `/admin/productos/nuevo` (sin sesión) carga sin errores de servidor ni de consola. No se pudo probar el clic en vivo por falta de credenciales de admin en esta sesión (mismo caso ya documentado en varias tareas anteriores de este panel) — la lógica (`addGalleryFromColor`, deduplicación con `gallery.includes(url)`) se revisó a mano y es directa (sin llamadas a red ni estado asíncrono).

## Notas de progreso

- 2026-09-09: Implementado en la misma sesión a pedido del usuario.
