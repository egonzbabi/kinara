# Checklist antes de pasar Kinara a producción

Esto no es una tarea de `tasks/NNN-*` — es una lista operativa de todo lo que hay que revisar/cambiar antes de dar el sitio por terminado y abrirlo a clientes reales. Se actualiza a medida que se resuelven o aparecen puntos nuevos.

## Stripe (pagos)

- [ ] Cambiar `STRIPE_SECRET_KEY` de test (`sk_test_...`) a live (`sk_live_...`) en `.env` y en Vercel (Production).
- [ ] Crear el webhook endpoint de producción en el Dashboard de Stripe (modo Live) apuntando a `https://<dominio-real>/api/stripe-webhook`, y actualizar `STRIPE_WEBHOOK_SECRET` con el signing secret nuevo (el de test no sirve en Live).
- [ ] Confirmar que el nombre de cuenta/negocio de Stripe sigue configurado en modo Live.
- [ ] Hacer una compra real de prueba (monto bajo) con una tarjeta real antes de anunciar el lanzamiento.

## Skydropx (envíos)

- [ ] Cambiar `SKYDROPX_BASE_URL` de `https://sb-pro.skydropx.com` (sandbox) a `https://pro.skydropx.com` (producción).
- [ ] Cambiar `SKYDROPX_CLIENT_ID`/`SKYDROPX_CLIENT_SECRET` de sandbox a las credenciales de producción.
- [ ] **Corregir `SKYDROPX_ORIGIN_STREET1`** — hoy es literalmente el placeholder `"Pendiente de confirmar"`, nunca se cargó la calle real. Confirmar también en el dashboard de `pro.skydropx.com` (Direcciones) que la dirección de origen ahí sea la real — se detectó (tarea 028) que la API puede estar usando una dirección default de cuenta en vez de la que se manda.
- [ ] Cargar los datos fiscales (RFC, razón social, uso de CFDI) en `pro.skydropx.com` si quieren facturas deducibles de las guías.
- [ ] Probar cotizaciones reales en producción para varias ciudades (no solo CDMX) — el sandbox demostró ser poco confiable (tarea 030), producción debería ser más estable pero hay que confirmarlo antes de lanzar.

## Resend (correo de contacto)

- [ ] Crear cuenta en resend.com y generar `RESEND_API_KEY`.
- [ ] Definir `CONTACT_EMAIL_TO` (a qué correo real deben llegar los mensajes de `/contacto`).
- [ ] Opcional: verificar un dominio propio en Resend (`kinara.mx` o el que se use) para mandar desde una dirección con marca en vez del remitente de pruebas `onboarding@resend.dev`.
- [ ] Cargar las 3 variables en `.env` local y en Vercel → Production.

## Dominio y Vercel

- [ ] Decidir y conectar el dominio real (ej. `kinara.mx`) al proyecto de Vercel — hoy el sitio solo vive en `kinara-ecommerce.vercel.app`.
- [ ] Una vez el dominio esté activo, actualizar los webhooks de Stripe (arriba) para que apunten al dominio real, no al `.vercel.app`.
- [ ] Actualizar todas las variables de entorno de arriba en Vercel → Production, y disparar un redeploy.
- [ ] Decidir si conectar el repo original del compañero (`maxruizg/Kinara-ecommerce`, remoto `origin`) a Vercel, o mantener el proyecto solo enlazado a `mio` (`egonzbabi/kinara`).

## Legal (recomendado, no implementado — confirmar con un contador/abogado)

- [ ] Aviso de privacidad — obligatorio en México (LFPDPPP) para cualquier sitio que recolecte datos personales (nombre, email, teléfono, dirección — se recolectan en `/checkout` y `/contacto`). No existe todavía ninguna página de este tipo en el sitio.
- [ ] Términos y condiciones / política de devoluciones publicada (el copy ya dice "No aceptamos devoluciones" en el sitio — confirmar que sea consistente con lo que se publique como política formal).

## Opcional pero recomendado antes o poco después de lanzar

- [ ] **Tarea 003** (SEO técnico) — pendiente.
- [ ] **Tarea 004** (Google Analytics 4) — pendiente, requiere que el usuario cree la property de GA4 y entregue el Measurement ID.
- [ ] **Tarea 005** (Auditoría UI/UX y accesibilidad WCAG AA) — pendiente.
- [ ] Re-medir Lighthouse (mobile) contra el dominio real ya en producción (las mediciones locales dieron buenos resultados pero sin la red/CDN real de producción).

## Notas

- El placeholder de envío de $150 MXN (`SHIPPING_FEE_MXN` en `app/lib/shipping.ts`) no es lo que se cobra por defecto — es solo un fallback si Skydropx no responde (tarea 017). No hace falta tocarlo al pasar a producción, salvo que se quiera ajustar el monto del fallback.
- Los mensajes de `/contacto` ya se pueden ver en `/admin/mensajes` aunque Resend no esté configurado — no se pierden, solo no se manda el correo automático hasta que se carguen las variables de Resend.
