---
id: 005
title: "Auditoría y mejora de UI/UX y accesibilidad"
status: pending
---

<!--
Antes de trabajar esta tarea, Claude debe haber leído (en este orden):
1. ../CLAUDE.md
2. README.md (este directorio)
3. REQUISITOS.md (este directorio)
4. Este archivo completo
-->

## Contexto

La mejor experiencia de usuario impacta conversión, SEO (señales de UX) y accesibilidad legal. Hoy no se ha auditado el sitio contra WCAG ni contra heurísticas de UX de e-commerce.

## Objetivo

Que el sitio pase una auditoría de accesibilidad (Lighthouse Accessibility ≥ 95, sin errores críticos de axe) y aplique las mejores prácticas de UX para e-commerce definidas en la skill `ui-ux-pro-max`.

## Archivos involucrados

- `app/components/*` (todos, especialmente `SiteNav.tsx`, `CartDrawer.tsx`, `ProductCard.tsx`, `Accordion.tsx`, `Newsletter.tsx`)
- `app/app.css`

## Restricciones específicas de esta tarea

- No rediseñar la identidad visual/marca sin confirmarlo antes — esta tarea es de accesibilidad y usabilidad, no de rebranding.
- Usar la skill `ui-ux-pro-max` para decisiones de contraste, espaciado y patrones de interacción.

## Pasos sugeridos

1. Correr Lighthouse Accessibility y axe DevTools en `/`, `/tienda`, `/producto/:slug`.
2. Corregir contraste de color insuficiente, agregar `aria-label` a botones de solo ícono (carrito, cerrar drawer, flechas de galería).
3. Verificar orden de tabulación y que el `CartDrawer`/modales atrapen el foco (focus trap) y se puedan cerrar con `Esc`.
4. Verificar que todo formulario (`Newsletter.tsx`) tenga `label` asociado y mensajes de error accesibles.
5. Revisar la skill `ui-ux-pro-max` para heurísticas de conversión en tarjetas de producto, CTAs y checkout.

## Criterios de aceptación

- [ ] Lighthouse Accessibility ≥ 95 en las tres rutas auditadas.
- [ ] Sin errores críticos/serios en axe DevTools.
- [ ] Navegación completa por teclado (tab, enter, esc) funcional en nav, drawer del carrito y galería de producto.
- [ ] Todo botón de solo ícono tiene `aria-label`.

## Verificación de requisitos anteriores

- Revisado contra `REQUISITOS.md`: sí (en particular, no bajar el Performance logrado en la tarea 002 al tocar componentes).
- Regresiones encontradas: -
- Requisitos nuevos agregados a `REQUISITOS.md`: estándar de accesibilidad (WCAG AA) que debe mantenerse en todo componente nuevo.

## Pruebas manuales

- Navegar todo el sitio solo con teclado (sin mouse).
- Correr axe DevTools y Lighthouse Accessibility en las tres rutas.
- Probar con zoom de navegador al 200%.

## Notas de progreso

- (vacío — se llena a medida que se trabaja)
