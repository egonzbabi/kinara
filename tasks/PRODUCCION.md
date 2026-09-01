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

## Resend (correo de contacto, confirmación de pedido, código de bienvenida)

- [x] Cuenta en resend.com creada, `RESEND_API_KEY` generada y cargada en `.env` local — verificada con un envío real de prueba (2026-08-26).
- [x] Dominio propio `kinarafit.com.mx` verificado en Resend (DKIM + SPF vía subdominio `send.`, sin conflicto con el correo existente del dominio en GoDaddy) — ya no se manda desde `onboarding@resend.dev`.
- [x] `CONTACT_EMAIL_FROM=KINARA <contacto@kinarafit.com.mx>` cargado en `.env` local.
- [ ] Definir `CONTACT_EMAIL_TO` (a qué correo real deben llegar los mensajes de `/contacto` — sigue sin definirse).
- [ ] Cargar `RESEND_API_KEY` y `CONTACT_EMAIL_FROM` (y `CONTACT_EMAIL_TO` cuando se defina) en Vercel → Production — hoy solo están en `.env` local, así que en el sitio real (`.vercel.app`) estos 3 correos (contacto, confirmación de pedido, código de bienvenida) todavía no se mandan.

## Dominio y Vercel

- [ ] Decidir y conectar el dominio real (`kinarafit.com.mx`) al proyecto de Vercel — hoy el sitio solo vive en `kinara-ecommerce.vercel.app`.
- [ ] Una vez el dominio esté activo, actualizar los webhooks de Stripe (arriba) para que apunten al dominio real, no al `.vercel.app`.
- [ ] **Actualizar los 2 enlaces fijos en `app/lib/resend.server.ts`** ("Ver tienda" del correo de confirmación de pedido) — hoy apuntan a `https://kinara-ecommerce.vercel.app/tienda`, hay que cambiarlos al dominio real cuando esté conectado (si no, el botón del correo siempre manda al sitio de Vercel, aunque el cliente ya esté comprando desde el dominio real).
- [ ] Actualizar todas las variables de entorno de arriba en Vercel → Production, y disparar un redeploy.
- [ ] Decidir si conectar el repo original del compañero (`maxruizg/Kinara-ecommerce`, remoto `origin`) a Vercel, o mantener el proyecto solo enlazado a `mio` (`egonzbabi/kinara`).

## Catálogo (fotos y precios)

- [ ] **2 productos sin precio** (borrador, no aparecen en `/tienda`): NEWYORK TOP, NEWYORKLEGGIN. Publicarlos desde `/admin/productos` en cuanto se defina el precio real.
- [ ] **7 colores sin foto propia** (usan la foto genérica del producto, que puede no ser ese color exacto):
  - NEWYORK TOP (borrador): Ivory, Verde, Azul Gris — los 3 colores del producto, ninguno tiene foto.
  - NEWYORKLEGGIN (borrador): Cocoa, Gris, Marino — los 3 colores del producto, ninguno tiene foto.
  - SET ESSENTIAL (publicado): Ivory — 1 de 7 colores sin foto (los otros 6 sí tienen).
  - Todos los demás productos ya tienen foto genérica de respaldo (no hay ninguno mostrando el placeholder gris).
- [ ] **Foto de proveedor duplicada entre dos productos distintos**: SOFT FLARE PANTS y ALLURE LEG PANTS usan cada uno su propia foto (archivos distintos en Storage), pero al compararlas visualmente son la misma foto de stock del proveedor (mismo modelo/pose/encuadre) — se ve como si fuera el mismo producto repetido dos veces. Conviene subir una foto propia real para al menos uno de los dos antes de lanzar, para que no parezcan el mismo artículo.

## Legal (recomendado, no implementado — confirmar con un contador/abogado)

- [x] Aviso de privacidad — obligatorio en México (LFPDPPP). Página real en `/aviso-de-privacidad`, enlazada desde el pie de página. Actualizada (tarea 062) con la razón social real (Administradora Karay S.A. de C.V.) y domicilio fiscal (Nunkini 234, Col. Jardines del Ajusco, Tlalpan, CDMX), provistos por el usuario — ya no es un borrador sin identidad legal. **Sigue sin ser asesoría legal**: confirmar con abogado/contador si el nivel de detalle es suficiente, y la sección de cookies deberá actualizarse el día que se active Google Analytics (tarea 004) o cualquier herramienta de analítica/publicidad real (hoy el aviso ya anticipa su uso genéricamente, pero ninguna está activa todavía).
- [x] Política de cambios y devoluciones — publicada en `/politica-de-cambios-y-devoluciones` (tarea 061). Todos los mensajes del sitio que antes decían "No aceptamos devoluciones" / "NO HAY DEVOLUCIONES" ahora enlazan a esta página.
- [ ] Términos y condiciones (documento más amplio: uso del sitio, propiedad intelectual, etc.) — sigue sin publicarse; el link "Términos" del pie de página sigue siendo un placeholder (`href="#"`).

## Opcional pero recomendado antes o poco después de lanzar

- [ ] **Tarea 003** (SEO técnico) — pendiente.
- [ ] **Tarea 004** (Google Analytics 4) — pendiente, requiere que el usuario cree la property de GA4 y entregue el Measurement ID.
- [ ] **Tarea 005** (Auditoría UI/UX y accesibilidad WCAG AA) — pendiente.
- [ ] Re-medir Lighthouse (mobile) contra el dominio real ya en producción (las mediciones locales dieron buenos resultados pero sin la red/CDN real de producción).

## Fase futura: vender también en Amazon, Mercado Libre y Liverpool

No es parte del lanzamiento — el usuario confirmó que por ahora solo importa que el inventario de la página quede bien estructurado; los 3 canales se agregan después, uno a la vez. Se deja anotado aquí el plan para no perderlo:

- **Arquitectura decidida**: Kinara (Supabase) es la única fuente de verdad del stock — es el "hub", los marketplaces son "satélites" que se sincronizan contra ella, nunca llevan su propio conteo independiente. Coincide con la práctica estándar de la industria para multi-canal.
- El sistema de inventario ya construido (tareas 064/075/076/077/078: movimientos atómicos, conteo físico, bloqueo de edición directa) es compatible con esto sin rediseño — cuando se agregue un canal, sus pedidos bajarán stock por el mismo RPC atómico que ya usa el checkout (`decrement_variant_stock`), y cada cambio de stock se podrá empujar hacia los demás canales igual.
- Falta por construir cuando se retome (no antes): una tabla de mapeo `producto+color+talla` ↔ SKU/ID de cada marketplace, sincronización de salida (stock → marketplace) y de entrada (pedido del marketplace → stock local).
- Orden sugerido: probar el patrón completo con un solo canal primero, no los 3 a la vez. Cada uno requiere que el usuario tenga cuenta de vendedor aprobada + acceso de API/developer en esa plataforma (Claude no puede crear esas cuentas) — confirmar eso antes de empezar cada integración.
- Liverpool tiene API para vendedores vía su Portal de Proveedores, pero la documentación detallada solo es visible una vez aprobado como vendedor ahí — es el canal con más incertidumbre técnica de los 3 hasta no tener acceso real.

## Notas

- El placeholder de envío de $150 MXN (`SHIPPING_FEE_MXN` en `app/lib/shipping.ts`) no es lo que se cobra por defecto — es solo un fallback si Skydropx no responde (tarea 017). No hace falta tocarlo al pasar a producción, salvo que se quiera ajustar el monto del fallback.
- Los mensajes de `/contacto` ya se pueden ver en `/admin/mensajes` aunque Resend no esté configurado — no se pierden, solo no se manda el correo automático hasta que se carguen las variables de Resend.
