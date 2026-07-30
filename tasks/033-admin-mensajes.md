---
id: 033
title: "Admin: pantalla /admin/mensajes para ver los mensajes de contacto"
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

Seguimiento directo de la tarea 032. Los mensajes de `/contacto` se guardaban en `contact_messages` pero no había ninguna forma de verlos salvo consultando la base directo — el usuario probó el formulario y no encontró sus mensajes en `/admin`.

## Objetivo

`/admin/mensajes` (nuevo item en el sidebar del admin) lista todos los mensajes de contacto, más recientes primero, con nombre, email (con link `mailto:` para responder directo), mensaje completo, fecha, y si el correo se logró enviar o no.

## Archivos involucrados

- `app/lib/admin-messages.server.ts` (nuevo)
- `app/routes/admin.mensajes.tsx` (nuevo)
- `app/routes.ts` — registrar la ruta dentro del layout de admin.
- `app/routes/admin.layout.tsx` — título de la página.
- `app/components/admin/AdminSidebar.tsx` — link "Mensajes".

## Restricciones específicas de esta tarea

- Mismo patrón de auth que el resto del admin (`requireAdmin` en el loader).
- No se agregó estado de leído/no leído ni acciones de responder/eliminar — no se pidió, solo visibilidad. Se puede agregar después si se necesita.

## Pasos sugeridos

1. `admin-messages.server.ts`: `listContactMessages()` sobre `contact_messages`, más reciente primero.
2. `admin.mensajes.tsx`: loader con `requireAdmin` + `listContactMessages()`, lista de tarjetas (nombre/email/mensaje/fecha/estado del correo).
3. Registrar ruta + sidebar + título.
4. Verificar en el navegador con una cuenta de admin temporal.

## Criterios de aceptación

- [x] `/admin/mensajes` muestra todos los mensajes guardados, más recientes primero.
- [x] Cada mensaje muestra nombre, email (mailto: para responder), mensaje completo, fecha, y si el correo se envió o no.
- [x] Link "Mensajes" visible y funcional en el sidebar del admin.
- [x] `npm run typecheck` pasa sin errores; verificado en el navegador sin errores de consola.

## Verificación de requisitos anteriores

- Revisado contra `REQUISITOS.md`: sí — mismo patrón de `requireAdmin`/`service_role` que el resto de `/admin`.
- Regresiones encontradas: ninguna.
- Requisitos nuevos agregados a `REQUISITOS.md`: no aplica.

## Pruebas manuales

- Con una cuenta de admin temporal (creada y eliminada al terminar): confirmado que `/admin/mensajes` muestra correctamente el mensaje de prueba real que el usuario ya había mandado desde `/contacto` (visible por primera vez), más un mensaje de prueba propio (creado y borrado al terminar, sin tocar el mensaje real del usuario).

## Notas de progreso

- 2026-07-30: Tarea creada e implementada en la misma sesión, a partir de que el usuario reportó "no veo los mensajes en el admin". Al verificar, se encontró que el usuario ya había mandado un mensaje de prueba real por `/contacto` que hasta ahora era invisible — quedó confirmado visible en `/admin/mensajes` sin tocarlo. `npm run typecheck` sin errores, sin errores de consola.
