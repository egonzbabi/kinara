---
id: 118
title: "Home: nuevo video del hero armado con 14 fotos reales del shooting"
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

El usuario compartió ~20 fotos nuevas del shooting (pegadas en el chat, recuperadas de `~/Downloads` — nombres tipo "Group Photo (N).jpg", "Group Image (N).jpg", "Campaign Image (N).jpg") y pidió armar con ellas un video nuevo para el hero del home, en el formato que el hero necesita, seleccionando las mejores.

## Objetivo

El hero muestra un video nuevo (no las fotos sueltas) compuesto por 14 fotos seleccionadas, cada una con acercamiento suave (Ken Burns) y transición de crossfade entre una y otra — mismo componente `Hero.tsx` sin cambios de código (la URL del video/poster en Supabase Storage no cambia).

## Selección (14 de ~20 fotos recibidas)

Se descartaron duplicados casi idénticos (mismo grupo, mismo ángulo) y las 3 fotos en horizontal (recortarían gente al integrarlas a un video vertical) — todas las 14 elegidas son verticales 4912×7360 (mismo encuadre, sin recortar a nadie):

1. Campaign Image (1) — dos chicas jóvenes, candid
2. Campaign Image (2) — mismas dos, de espaldas
3. Campaign Image (3) — dúo con banda de resistencia (estiramiento)
4. Campaign Image (4) — dúo vino/azul, espalda con espalda
5. Campaign Image (5) — mismo dúo, de frente
6. Campaign Image (6) — mismo dúo con brazos en alto (celebración)
7. Campaign Photo — dos chicas jóvenes, otra pose candid
8. Group Image (8) — grupo de 4 (posado)
9. Group Image (9) — mismo grupo de 4, más candid/sonriendo
10. Group Image (10) — grupo de 6 diverso en edades
11. Group Photo (16) — otro grupo de 6 diverso en edades
12. Group Photo (18) — grupo de 5, riendo/señalando
13. Group Photo (19) — grupo de 5, brazos en alto celebrando (clímax de energía)
14. Group Photo (21) — grupo de 4 (otro elenco)

## Archivos involucrados

- Ningún archivo de código — el video se generó con `ffmpeg` (instalado on-demand vía el paquete npm `ffmpeg-static`, no vino preinstalado) a partir de las fotos, y se subió directo a Supabase Storage reemplazando `product-images/site/hero-video.mp4` y `product-images/site/hero-poster.jpg` — mismas URLs que ya usa `app/components/Hero.tsx` (`HERO_COLLAGE.main.url`/`.poster`), así que no hizo falta tocar ningún archivo del repo.

## Restricciones específicas de esta tarea

- Ninguna foto se recorta de forma que pierda gente — se armó el video en formato vertical 1080×1620 (2:3), el mismo formato nativo de las 14 fotos elegidas, así que ninguna necesitó recorte ni relleno.
- El componente `Hero.tsx` ya usa `object-contain` + zoom calculado en vivo (tarea 117) — compatible con cualquier proporción de video, no hizo falta ajustar el componente para el nuevo formato vertical (antes era cuadrado).

## Cómo se armó (para referencia futura)

1. Por cada foto: `ffmpeg -loop 1 -t 2.2 -i foto.jpg -vf "scale=2160:3240,zoompan=z='min(zoom+0.0012121,1.08)':d=1:...:s=1080x1620:fps=30" -frames:v 66 clipN.mp4` (2.2s por foto, acercamiento de escala 1.0 a 1.08).
2. Se encadenaron los 14 clips con el filtro `xfade` (transición `fade`, 0.6s de traslape cada una) — offsets calculados como `k×(2.2-0.6)` para que cada transición empiece en el punto correcto sin saltos.
3. Salida final: `final.mp4`, H.264, CRF 20, 1080×1620, ~22.6s, ~2.9MB.
4. Poster: primer frame del video final, extraído con `ffmpeg -ss 0.1 -frames:v 1`.
5. Ambos archivos subidos a Supabase Storage con `supabase.storage.update()` (upsert), mismo path que ya usaba el sitio.

## Criterios de aceptación

- [x] Video nuevo con las 14 fotos, en orden narrativo (parejas íntimas → grupos pequeños → grupo grande celebrando).
- [x] Cada foto se ve completa (sin recortar), con acercamiento suave — verificado con capturas en varios puntos del video (0.2s, 2.5s, 8.2s con transición en curso, 22.5s).
- [x] Transiciones sin saltos ni cortes bruscos (crossfade de 0.6s entre cada par).
- [x] Video subido a Storage, verificado que la URL pública ya sirve el archivo nuevo (`content-length` coincide con el archivo local).
- [x] Verificado en el navegador (desktop y mobile): el video carga, reproduce, y el zoom/franjas laterales funcionan igual que antes (tarea 117), sin errores de consola.
- [x] Sin cambios de código — mismo componente, misma URL.

## Verificación de requisitos anteriores

- Revisado contra `REQUISITOS.md`: sí — no se tocó el mecanismo de `object-contain` + zoom dinámico de la tarea 117, que ya es agnóstico a la proporción del video.
- Regresiones encontradas: ninguna.
- Requisitos nuevos agregados a `REQUISITOS.md`: ninguno (el video en sí no es código, no aplica un patrón reutilizable nuevo).

## Pruebas manuales

- Verificado con `ffprobe`/capturas que el video final mide 1080×1620, dura ~22.6s, y cada una de las 14 fotos aparece completa en algún punto del clip.
- Verificado en el navegador que la URL pública de Storage ya sirve el archivo nuevo (tamaño en bytes coincide).
- Verificado en `localhost:5173` (desktop y mobile) que el hero reproduce el video nuevo sin errores de consola.

## Notas de progreso

- 2026-09-17: Implementado en la misma sesión que las tareas 115-117. Las fotos originales no llegaban como archivos accesibles (se pegaron directo en el chat) — se ubicaron en `~/Downloads` (ahí las guarda el cliente de escritorio al pegarlas) mediante una búsqueda en el sistema de archivos por fecha de modificación reciente.
- 2026-09-17 (ajuste, ahora 15 fotos): El usuario pidió tres cambios sobre la primera versión (14 fotos): (1) quitar "Campaign Image (5)" — la del medio de un trío de 3 fotos seguidas casi idénticas (mismo dúo vino/azul, back-to-back → frente → brazos en alto); se dejaron las otras dos del trío. (2) Agregar "Edit Todas.png" (9097×5117, la única foto horizontal, con las ~10 personas del shooting juntas) como cierre del video — al ser horizontal y el video vertical, se le agregaron franjas del color de marca (`#2b2118`, espresso) arriba/abajo en vez de recortarla, para no cortar a nadie de los extremos. (3) Agregar una foto nueva pegada directo en el chat (señora canosa + mujer de leggings azules) que esta vez **no** se guardó automáticamente en Descargas — el usuario la guardó a mano como "Campaign Image (8).jpg" cuando se le pidió. Total final: 15 fotos, video de 24.2s (mismo esquema: 2.2s por foto, transición de 0.6s, zoom de escala 1.0 a 1.08).
- 2026-09-18 (foto de grupo se veía chica → efecto de "reveal" panorámico): El usuario reportó que la foto de todo el grupo (con franjas arriba/abajo) se veía muy chica dentro del cuadro vertical. Primer intento (acercar el zoom hasta llenar el cuadro, recortando los extremos) tuvo un bug real: la expresión de `zoompan` con auto-incremento (`z='min(zoom+X,cap)'`) no avanzaba el zoom en absoluto para valores de incremento/tope grandes — se diagnosticó extrayendo la secuencia completa de frames a PNG (en vez de confiar en `-ss`/`select`, que en clips cortos de un solo GOP hacían *seek* siempre al primer keyframe y ocultaban el problema). El usuario pidió entonces no forzar el recorte sino aprovechar el formato horizontal como contraste editorial: esa foto ahora arranca **recortada/cerrada** (zoom 1.8, mismo peso visual que las demás fotos verticales) y hace **zoom-out hasta 1.0** a lo largo de 3.6s, revelando el grupo completo en panorámico como cierre — un "reveal" cinematográfico en vez de una limitación. Se reescribió la expresión de zoom en términos del número de frame absoluto (`z='1.8-0.8*min(on/107,1)'`) en vez de auto-incremento, y se agregó `-framerate 30` explícito al input (antes usaba el default de 25fps de una imagen estática, causando que el último clip de la cadena se truncara ~0.37s). Video final: 15 fotos, 26.0s (14 fotos a 2.2s + el reveal final a 3.6s, transición de 0.6s).
