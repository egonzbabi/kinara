# Checklist antes de pasar Kinara a producción

Esto no es una tarea de `tasks/NNN-*` — es una lista operativa de todo lo que hay que revisar/cambiar antes de dar el sitio por terminado y abrirlo a clientes reales. Se actualiza a medida que se resuelven o aparecen puntos nuevos.

## Stripe

- [ ] Cambiar `STRIPE_SECRET_KEY` de test (`sk_test_...`) a live (`sk_live_...`) en `.env` y en Vercel (Production).
- [ ] Crear el webhook endpoint de producción en el Dashboard de Stripe (modo Live) apuntando a `https://<dominio-real>/api/stripe-webhook`, y actualizar `STRIPE_WEBHOOK_SECRET` con el signing secret nuevo (el de test no sirve en Live).
- [ ] Confirmar que el nombre de cuenta/negocio de Stripe sigue configurado en modo Live (el bloqueo de "debes establecer un nombre de cuenta" que se resolvió en test puede repetirse en Live si no se ha configurado ahí también).
- [ ] Hacer una compra real de prueba (monto bajo) con una tarjeta real antes de anunciar el lanzamiento.

## Skydropx

- [ ] Cambiar `SKYDROPX_BASE_URL` de `https://sb-pro.skydropx.com` (sandbox) a `https://pro.skydropx.com` (producción).
- [ ] Cambiar `SKYDROPX_CLIENT_ID`/`SKYDROPX_CLIENT_SECRET` de sandbox a las credenciales de producción (el usuario compartió un par de producción antes: `client_id: nQT3xR73eJjT_QH_O438QkWsyyMNZoCaoStgqFU8Bcw` — confirmar que siguen vigentes al momento del cambio; puede requerir regenerarlas si expiraron).
- [ ] Confirmar/completar `SKYDROPX_ORIGIN_STREET1`, `SKYDROPX_ORIGIN_PHONE`, `SKYDROPX_ORIGIN_EMAIL` con los datos reales de la tienda (hoy son placeholders — CP/alcaldía/colonia de origen ya están confirmados: 10910, La Magdalena Contreras, CDMX).
- [ ] Probar una cotización real en producción (no solo sandbox) antes del lanzamiento — los proveedores/tarifas disponibles pueden diferir entre ambos entornos.

## Vercel

- [ ] Actualizar todas las variables de entorno de arriba en Vercel → Production, y disparar un redeploy.
- [ ] Decidir si conectar el repo original del compañero (`maxruizg/Kinara-ecommerce`, remoto `origin`) a Vercel, o mantener el proyecto solo enlazado a `mio` (`egonzbabi/kinara`).

## Pendientes de otras tareas

- [ ] **Tarea 008** — el copy de envíos/devoluciones sigue en euros y menciona España ("Envío gratis desde 60 €", "entrega en península"), inconsistente desde que los precios pasaron a MXN. Recordatorio explícito del usuario: no cerrar el proyecto sin resolver esto.
- [ ] **Tarea 002** (Performance / Core Web Vitals) — pendiente.
- [ ] **Tarea 003** (SEO técnico) — pendiente.
- [ ] **Tarea 004** (Google Analytics 4) — pendiente, requiere que el usuario cree la property de GA4 y entregue el Measurement ID.
- [ ] **Tarea 005** (Auditoría UI/UX y accesibilidad WCAG AA) — pendiente.

## Notas

- El placeholder de envío de $150 MXN (`SHIPPING_FEE_MXN` en `app/lib/shipping.ts`) ya no es lo que se cobra por defecto — ahora es solo un fallback si Skydropx no responde (tarea 017). No hace falta tocarlo al pasar a producción, salvo que se quiera ajustar el monto del fallback.
