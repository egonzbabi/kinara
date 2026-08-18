---
id: 062
title: "Aviso de Privacidad: reemplazo por el texto real del usuario (razón social, domicilio, marketing)"
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

El usuario compartió `~/Downloads/POLÍTICAS KINARA.pages` (documento de Apple Pages) pidiendo reemplazar el Aviso de Privacidad publicado (tarea 035) por ese texto, aclarando primero que lo revisara "para ver como lo ves si esta bien" antes de implementar. El documento en realidad contiene 3 políticas (Aviso de Privacidad, Política de Envíos, Términos y Condiciones) — solo se pidió el Aviso, las otras dos quedan disponibles para una tarea futura si el usuario las pide.

## Objetivo

`/aviso-de-privacidad` refleja el texto real que dio el usuario, con 4 decisiones de negocio confirmadas explícitamente antes de implementar (ver "Notas de progreso").

## Archivos involucrados

- `app/routes/aviso-de-privacidad.tsx`: reemplazo completo del contenido (mismo componente/estructura, mismo patrón visual `sectionClass`/`h2Class`/`pClass`/`ulClass` de siempre). Cambios de fondo respecto al aviso anterior:
  - Ahora incluye identidad legal real: razón social "Administradora Karay S.A. de C.V." y domicilio "Nunkini 234, Col. Jardines del Ajusco, Tlalpan, CDMX, México" — el aviso anterior no tenía esto por no contar con el dato (ver nota en `tasks/PRODUCCION.md`).
  - Nueva sección de Finalidad admite marketing por correo por default (opt-out), reemplazando la versión anterior que requería autorización expresa previa (opt-in).
  - La sección "Con quién compartimos tus datos" deja de nombrar a Stripe/Skydropx explícitamente — queda genérica, como pidió el usuario.
  - Correo de contacto: `contacto@kinarafit.com.mx` en vez de `hola@kinara.mx` (mismo correo ya usado en la Política de Cambios y Devoluciones, tarea 061 — consistente en todo el sitio).
  - Dominio referenciado en "Cambios al aviso": `www.kinarafit.com.mx` (el usuario corrigió esto en el chat después de responder inicialmente "kinarafit.shop" en el formulario de preguntas — la corrección explícita posterior es la que se usó).
- `tasks/PRODUCCION.md`: se actualizó la nota de la sección Legal — ya no dice que el aviso "no tiene razón social/RFC/domicilio fiscal (no se inventaron)", ahora refleja que sí se cargaron esos datos reales provistos por el usuario.

## Restricciones específicas de esta tarea

- No se implementó nada hasta tener las 4 decisiones explícitas del usuario (correo, política de marketing, dominio, nivel de detalle de proveedores) — se le presentó cada una como pregunta puntual antes de tocar código, porque son decisiones de negocio/legales, no de diseño o código.
- El resto del texto (secciones de Datos que recopilamos, Derechos ARCO, Cookies) se transcribió fiel al documento del usuario, sin agregar de vuelta contenido del aviso anterior que el usuario no pidió mantener (ej. el plazo específico de "20 días hábiles" de la versión vieja no está en el documento nuevo del usuario, así que no se reintrodujo).
- El archivo `.pages` (formato propietario de Apple, ZIP con datos binarios IWA) se leyó convirtiéndolo a PDF con LibreOffice (`soffice --headless --convert-to pdf`, ya usado en esta sesión para la skill de xlsx) — no hay forma directa de leer `.pages` sin una herramienta de conversión.

## Criterios de aceptación

- [x] `/aviso-de-privacidad` muestra el texto del documento del usuario, con las 4 decisiones aplicadas.
- [x] El correo de contacto es `contacto@kinarafit.com.mx` en las 2 menciones (responsable y ARCO).
- [x] La sección de Finalidad refleja marketing por default con opción de baja.
- [x] La sección de Transferencia de datos es genérica (sin nombrar Stripe/Skydropx).
- [x] El dominio referenciado es `www.kinarafit.com.mx`.
- [x] `npm run typecheck` pasa sin errores.

## Verificación de requisitos anteriores

- Revisado contra `REQUISITOS.md`: sí — mismo patrón visual ya aprobado (reutiliza las clases del Aviso anterior y de la Política de Cambios y Devoluciones), no se tocó diseño/layout.
- Regresiones encontradas: ninguna — se verificó que el resto del sitio (footer, que enlaza a esta página) sigue apuntando correctamente.
- Requisitos nuevos agregados a `REQUISITOS.md`: no aplica (contenido/copy legal puntual).

## Pruebas manuales

- `npm run typecheck` limpio.
- Se abrió `/aviso-de-privacidad` en el navegador y se confirmó el texto completo con las 4 decisiones aplicadas (razón social/domicilio reales, correo `contacto@kinarafit.com.mx` ×2, marketing opt-out, transferencia de datos genérica, dominio `kinarafit.com.mx`).
- Sin errores de consola.

## Notas de progreso

- 2026-08-18: Tarea creada e implementada en la misma sesión. El usuario pidió explícitamente revisión antes de implementar ("revisalo antes... si esta bien") — se presentaron 4 preguntas puntuales vía formulario (correo, marketing por default vs. opt-in, dominio, nivel de detalle de proveedores) antes de escribir código. En el dominio, el usuario primero contestó "kinarafit.shop" en el formulario y de inmediato lo corrigió a "kinarafit.com.mx" en el chat — se usó la corrección final.
- El documento `.pages` también contiene una Política de Envíos y unos Términos y Condiciones completos, no solicitados en este turno — quedan disponibles para una tarea futura si el usuario decide publicarlos (el link "Términos" del pie de página sigue siendo placeholder `href="#"`, y hoy no existe una página dedicada de política de envíos).
