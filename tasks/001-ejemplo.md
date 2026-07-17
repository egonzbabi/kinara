---
id: 001
title: "Ejemplo — ajustar el espaciado del Hero en mobile"
status: ejemplo
---

<!--
Antes de trabajar esta tarea, Claude debe haber leído (en este orden):
1. ../CLAUDE.md
2. README.md (este directorio)
3. REQUISITOS.md (este directorio)
4. Este archivo completo
-->

## Contexto

En mobile (<640px), el componente `Hero` tiene demasiado espacio vertical entre el título y el botón CTA, lo que empuja el contenido importante fuera del viewport inicial.

## Objetivo

Reducir el espaciado vertical del Hero en mobile sin afectar el layout en desktop/tablet.

## Archivos involucrados

- `app/components/Hero.tsx`

## Restricciones específicas de esta tarea

- No cambiar el copy ni las imágenes, solo espaciado/layout.
- No tocar el breakpoint desktop (>=1024px).

## Pasos sugeridos

1. Abrir `app/components/Hero.tsx` e identificar las clases de spacing (padding/margin/gap) actuales.
2. Ajustar solo las variantes responsive (prefijos `sm:`/sin prefijo en Tailwind) para mobile.
3. Probar en el navegador a 375px de ancho.

## Criterios de aceptación

- [ ] En mobile, el CTA es visible sin hacer scroll en una pantalla de 375x667.
- [ ] El layout desktop/tablet no cambia visualmente.
- [ ] `npm run typecheck` pasa sin errores.

## Verificación de requisitos anteriores

- Revisado contra `REQUISITOS.md`: sí (vacío en este ejemplo, no había nada que verificar todavía).
- Regresiones encontradas: ninguna.
- Requisitos nuevos agregados a `REQUISITOS.md`: ninguno (es una tarea de ejemplo, no real).

## Pruebas manuales

- Cargar `/` en el navegador con el viewport en modo mobile (375px) y confirmar que se ve el botón CTA sin scroll.
- Revisar en 1280px que nada se movió.

## Notas de progreso

- Tarea de ejemplo, no se ejecuta de verdad — no aplica.
