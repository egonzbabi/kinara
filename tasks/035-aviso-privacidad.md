---
id: 035
title: "Página /aviso-de-privacidad (borrador — pendiente de revisión legal)"
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

`tasks/PRODUCCION.md` ya tenía anotado como pendiente legal el Aviso de Privacidad (obligatorio en México, LFPDPPP, para cualquier sitio que recolecte datos personales — `/checkout` y `/contacto` ya lo hacen). El usuario pidió avanzarlo ya, en vez de esperar a Google Analytics/cookies de rastreo.

**Importante — esto NO es asesoría legal.** Claude no es abogado. Este es un borrador con estructura estándar de LFPDPPP (identidad del responsable, datos recabados, finalidades, transferencias a terceros, derechos ARCO, cookies, cambios al aviso), usando el nombre comercial "KINARA" y sin inventar razón social/RFC/domicilio fiscal que Claude no tiene. **El usuario debe hacerlo revisar por un abogado o contador antes de considerarlo definitivo/vinculante.**

## Objetivo

Existe una página `/aviso-de-privacidad` publicada en el sitio, enlazada desde el pie de página (el link "Privacidad" ya existía como placeholder `href="#"`), con un borrador completo y honesto sobre el estado real de datos/cookies del sitio hoy.

## Archivos involucrados

- `app/routes/aviso-de-privacidad.tsx` (nuevo)
- `app/routes.ts` — registrar la ruta.
- `app/components/SiteFooter.tsx` — conectar el link "Privacidad" a la página real.

## Restricciones específicas de esta tarea

- No inventar razón social, RFC ni domicilio fiscal — se usa el nombre comercial "KINARA" y el correo de contacto ya existente (`hola@kinara.mx`), sin dirección física completa (práctica común y aceptable para un negocio que opera desde domicilio, hasta que el usuario decida publicar más detalle formal).
- La sección de cookies describe el estado **real y actual** del sitio (solo la cookie técnica de sesión del admin) — no mencionar Google Analytics como si ya estuviera activo, porque no lo está (tarea 004 sigue pendiente). Hay que actualizar esta sección el día que se active GA4/el banner de cookies.
- No presentar el borrador como asesoría legal validada — dejar constancia clara en las notas de esta tarea y en el mensaje al usuario de qué falta confirmar con un profesional.

## Pasos sugeridos

1. Redactar el contenido siguiendo la estructura estándar LFPDPPP (ver notas de progreso para el detalle exacto de cada sección).
2. Crear la página `/aviso-de-privacidad` con el mismo estilo visual que el resto del sitio (bone/sand, tipografía Fraunces para títulos).
3. Registrar la ruta y conectar el link del footer.
4. Verificar en el navegador (desktop y mobile), `npm run typecheck`.

## Criterios de aceptación

- [x] `/aviso-de-privacidad` existe, es visible y sigue el estilo visual del sitio.
- [x] El link "Privacidad" del footer apunta a la página real (ya no `href="#"`).
- [x] El contenido cubre: identidad del responsable, datos recabados, finalidades, transferencias a terceros (Stripe/Skydropx/hosting/correo), derechos ARCO, cookies (estado real actual), cambios al aviso.
- [x] `npm run typecheck` pasa sin errores; verificado en el navegador (desktop y mobile) sin errores de consola.

## Verificación de requisitos anteriores

- Revisado contra `REQUISITOS.md`: sí — no aplica ningún requisito de datos/pagos existente, es una página de contenido estático nueva.
- Regresiones encontradas: pendiente de confirmar tras implementar.
- Requisitos nuevos agregados a `REQUISITOS.md`: no aplica (contenido legal, no un patrón de código).

## Pruebas manuales

- [x] Cargada `/aviso-de-privacidad` en desktop (1280px) y mobile (375px) — contenido completo, tipografía y colores consistentes con el resto del sitio, sin errores de consola.
- [x] Confirmado por JS (`document.querySelectorAll('a')`) que el link "Privacidad" del footer apunta a `href="/aviso-de-privacidad"` (antes `#`). "Términos" y "Cookies" quedan igual (`#`) — no se pidieron en esta tarea.

## Notas de progreso

- 2026-07-30: Tarea creada a pedido del usuario. Se aclaró explícitamente que este es un borrador de partida, no asesoría legal — pendiente de revisión por abogado/contador antes de considerarse definitivo, especialmente en cuanto a: (1) si el negocio debe publicarse como persona física o moral (razón social) y su RFC, (2) el domicilio fiscal completo, (3) si aplican finalidades secundarias de marketing que requieran opt-in explícito adicional. La sección de cookies deberá actualizarse el día que se implemente Google Analytics (tarea 004) — hoy solo se declara la cookie técnica de sesión del admin, que es lo único que existe realmente.
- 2026-08-05: Implementado y verificado. Creado `app/routes/aviso-de-privacidad.tsx` (7 secciones: identidad, datos recabados, finalidades, terceros, ARCO, cookies, cambios), registrado en `app/routes.ts`, y conectado el link "Privacidad" de `SiteFooter.tsx` (antes `<a href="#">`, ahora `<Link to="/aviso-de-privacidad">`). No se inventó razón social/RFC/domicilio fiscal — se usa el nombre comercial "KINARA" y `hola@kinara.mx` como contacto. `npm run typecheck` limpio; verificado en navegador desktop y mobile sin errores de consola. Pendiente de decisión del usuario: pasar a git/subir a `mio main`.
