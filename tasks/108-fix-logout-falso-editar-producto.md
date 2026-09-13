---
id: 108
title: "Fix: cerraba la sesión de admin ante un error transitorio de red/DB, no solo cuando el acceso era revocado de verdad"
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

El usuario reportó: "cuando estoy editando un producto y me tardo un poco me saca a la página donde está el login".

`requireAdmin()` (`app/lib/session.server.ts`), que corre en el loader del layout de `/admin/*` (`admin.layout.tsx`) en **cada** navegación/revalidación dentro del panel, verifica que el `adminId` de la cookie siga existiendo en la tabla `admins` — para detectar un acceso revocado (fila borrada) aunque la cookie firmada siga siendo válida. El bug: trataba **cualquier error de esa consulta** (network hiccup, función serverless recién despertada tras estar inactiva, timeout puntual de Supabase) exactamente igual que "el admin no existe" — destruía la sesión y mandaba al login.

Esto explica el patrón reportado: cuanto más tiempo pasa editando sin que salga un request nuevo hacia el servidor, más probable que la función serverless esté "fría" cuando por fin llega la siguiente (ej. al guardar o subir una foto) — y una conexión fría a Supabase tiene más chance de fallar en su primera consulta, disparando el logout de mentira.

## Objetivo

Un error transitorio al verificar el admin no cierra la sesión — solo se cierra cuando la consulta sí respondió y confirmó que el admin ya no existe.

## Archivos involucrados

- `app/lib/session.server.ts` — `requireAdmin()`.

## Restricciones específicas de esta tarea

- No se relajó la seguridad real: si la consulta responde y el admin de verdad no está en la tabla, se sigue cerrando la sesión y mandando al login exactamente igual que antes. Solo cambia el caso de "la consulta falló" (antes indistinguible de "no existe").
- No se tocó `maxAge` de la cookie (7 días) ni ningún otro mecanismo de sesión.

## Criterios de aceptación

- [x] `requireAdmin()` distingue explícitamente `error` (consulta falló) de `!admin` (consulta respondió, no hay fila) — solo el segundo caso cierra la sesión.
- [x] En el caso de `error`, se deja un `console.error` server-side para que quede rastro de que la verificación falló esa vez (sin exponer nada al usuario ni bloquear su trabajo).
- [x] `npm run typecheck` limpio.
- [x] Revisado que todas las rutas de `/admin/*` usan esta misma función compartida (no hay una copia separada de esta lógica en otro archivo) — un solo punto de corrección arregla el bug en todo el panel.

## Verificación de requisitos anteriores

- Revisado contra `REQUISITOS.md`: no hay un punto específico sobre sesiones de admin todavía — no aplica, no se agrega uno nuevo (es un fix puntual, no un estándar de datos/código nuevo).
- Regresiones encontradas: ninguna — el camino "admin válido" y el camino "admin realmente revocado" no cambiaron de comportamiento, solo el camino "la consulta falló".

## Pruebas manuales

- `npm run typecheck` limpio.
- Revisión de código: no fue posible reproducir en local un error transitorio real de Supabase a demanda (requeriría forzar un fallo de red), pero el cambio es acotado y de bajo riesgo — solo agrega una rama `if (error)` antes de la lógica existente de `!admin`, sin tocar el camino feliz.

## Notas de progreso

- 2026-09-13: Reportado por el usuario, diagnosticado revisando `admin.layout.tsx` (loader que corre `requireAdmin` en cada navegación de `/admin/*`) y `session.server.ts`. Corregido y verificado con typecheck en la misma sesión.
