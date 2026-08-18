---
id: 061
title: "Página de Política de Cambios y Devoluciones + enlazar todos los mensajes de 'no hay devoluciones'"
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

El sitio decía "No aceptamos devoluciones" / "NO HAY DEVOLUCIONES" en varios lugares (barra de anuncios, franja de confianza del home, detalle de producto), como una regla absoluta sin excepciones ni forma de saber más. El usuario entregó el texto completo de una Política de Cambios y Devoluciones real (sí hay cambios, pero solo por defecto de fábrica comprobable, con plazo de 5 días y condiciones específicas) y pidió publicarla, y que todos esos mensajes de "no hay devoluciones" dejen de ser una afirmación aislada y en su lugar manden a esta política.

## Objetivo

1. Nueva página `/politica-de-cambios-y-devoluciones` con el texto completo de la política.
2. Todo mensaje del sitio que antes decía "No aceptamos devoluciones" ahora es (o incluye) un link a esa página, en vez de una afirmación sin matices ni salida.

## Archivos involucrados

- `app/routes/politica-de-cambios-y-devoluciones.tsx` (nueva): página con el mismo patrón visual que `aviso-de-privacidad.tsx` (mismas clases `sectionClass`/`h2Class`/`pClass`/`ulClass`, mismo layout de columna centrada). Contiene las 6 secciones del texto entregado por el usuario tal cual, con una sola corrección: el correo de contacto es `contacto@kinarafit.com.mx` (el usuario corrigió en el mismo mensaje el `kinaramarketplace@gmail.com` que había puesto originalmente en el texto pegado).
- `app/routes.ts`: registra la ruta `politica-de-cambios-y-devoluciones`.
- `app/components/AnnouncementBar.tsx`: el mensaje del marquee "No aceptamos devoluciones" cambia a "Política de cambios y devoluciones", ahora un `<Link>` (antes todos los mensajes eran texto plano `<span>`, sin destino).
- `app/components/TrustStrip.tsx`: la tarjeta "Sin devoluciones" / "No aceptamos devoluciones" del home cambia a "Cambios y devoluciones" / "Ver política", y toda la tarjeta (ícono + texto) es ahora un `<Link>` a la política — las demás tarjetas (Envío, Tejidos, Pago) se quedan como texto plano igual que antes, solo esta se volvió clicable.
- `app/routes/producto.$slug.tsx`: dos lugares —
  - La línea `· NO HAY DEVOLUCIONES` junto a "Envío calculado al finalizar la compra" ahora es `· Política de cambios y devoluciones` (link).
  - El acordeón "Envíos y devoluciones" ya no dice "NO HAY DEVOLUCIONES" en mayúsculas como regla absoluta — dice "Cambios solo por defecto de fábrica — consulta nuestra política de cambios y devoluciones" (link), reflejando la política real en vez de una negación total.
- `app/components/SiteFooter.tsx`: el link "Devoluciones" de la columna "Ayuda" (antes apuntaba a `/tienda` como placeholder, nunca se había conectado) ahora se llama "Cambios y devoluciones" y apunta a la nueva página.
- `tasks/PRODUCCION.md`: se marcó como resuelto el punto pendiente "Términos y condiciones / política de devoluciones publicada" en la parte de devoluciones (ahora publicada), separándolo del punto de Términos y condiciones general (documento más amplio, ese sigue sin publicarse — el link "Términos" del pie de página sigue siendo placeholder `href="#"`, fuera del alcance de esta tarea).

## Restricciones específicas de esta tarea

- No se tradujo el texto de la política de forma libre — se transcribió tal cual lo entregó el usuario (con la única corrección de correo que el propio usuario pidió en su segundo mensaje), respetando la numeración y el contenido legal/operativo exacto.
- El diseño visual de la nueva página reutiliza exactamente el patrón ya aprobado de `aviso-de-privacidad.tsx` (misma tipografía, mismo espaciado, mismo estilo de enlaces `text-clay underline`) — no se inventó un estilo nuevo.
- Solo se tocaron los mensajes que hablaban específicamente de devoluciones — el link "Términos" del pie de página (un documento distinto y más amplio: términos de uso del sitio) se dejó intacto como placeholder, no es parte de este pedido.
- El copy del acordeón y de la lista junto al selector de talla se reescribió mínimamente (de "NO HAY DEVOLUCIONES" a una frase que resume la política real y enlaza a ella) porque el mensaje anterior ya no es cierto — la política real sí contempla cambios por defecto de fábrica, así que dejar la negación absoluta sería información incorrecta, no solo un tema de estilo.

## Criterios de aceptación

- [x] Existe `/politica-de-cambios-y-devoluciones` con el texto completo de la política y el correo correcto.
- [x] El marquee del header enlaza a la política (verificado: 4 ocurrencias en el DOM, una por cada repetición del track).
- [x] La franja de confianza del home enlaza a la política.
- [x] El detalle de producto (lista corta + acordeón "Envíos y devoluciones") enlaza a la política en ambos lugares.
- [x] El pie de página enlaza a la política desde "Cambios y devoluciones".
- [x] `npm run typecheck` pasa sin errores.

## Verificación de requisitos anteriores

- Revisado contra `REQUISITOS.md`: sí — el diseño visual aprobado no cambia (mismo patrón de página legal ya usado en Aviso de Privacidad); el copy de "no hay devoluciones" se actualiza con permiso explícito del usuario en esta misma conversación, no por iniciativa propia.
- Regresiones encontradas: ninguna — se verificó en el navegador que las demás tarjetas de `TrustStrip` (Envío, Tejidos, Pago) siguen sin ser clicables y sin cambios, y que el resto del acordeón de producto (Descripción, Especificaciones) no se tocó.
- Requisitos nuevos agregados a `REQUISITOS.md`: no aplica (contenido/copy puntual, no un estándar transversal nuevo).

## Pruebas manuales

- `npm run typecheck` limpio.
- En el navegador (servidor de desarrollo local):
  - `/politica-de-cambios-y-devoluciones` carga con las 6 secciones completas y el correo `contacto@kinarafit.com.mx`.
  - En el home: 6 enlaces reales (`<a href="/politica-de-cambios-y-devoluciones">`) confirmados por JS — 4 del marquee, 1 de TrustStrip ("Cambios y devoluciones" / "Ver política"), 1 del footer.
  - En `/producto/daily-top` (NOVA TOP): 7 enlaces confirmados — los mismos del layout compartido (marquee, footer) más los 2 propios del detalle de producto (bullet junto a Talla, y el texto del acordeón "Envíos y devoluciones").
  - Sin errores de consola.

## Notas de progreso

- 2026-08-17: Tarea creada e implementada en la misma sesión. El usuario interrumpió su propio mensaje inicial para corregir el correo de contacto de `kinaramarketplace@gmail.com` a `contacto@kinarafit.com.mx` antes de que se empezara a implementar — se usó directamente el correo corregido, sin necesidad de un cambio posterior.
