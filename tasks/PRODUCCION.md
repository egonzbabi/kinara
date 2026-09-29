# Checklist antes de pasar Kinara a producción

Esto no es una tarea de `tasks/NNN-*` — es una lista operativa de todo lo que hay que revisar/cambiar antes de dar el sitio por terminado y abrirlo a clientes reales. Se actualiza a medida que se resuelven o aparecen puntos nuevos.

## Stripe (pagos)

- **Decisión del usuario (2026-09-25): pasar Stripe a modo Live.** El webhook apunta por ahora a `https://kinara-ecommerce.vercel.app/api/stripe-webhook` (no hay dominio real conectado todavía) — se actualiza cuando se conecte el dominio (ver sección "Dominio y Vercel" abajo).
- **Incidente de seguridad (2026-09-25):** el usuario pegó una `sk_live_...` directo en el chat — se le indicó rotarla en el Dashboard de Stripe antes de usarla (una clave pegada en un chat se considera expuesta). Claude nunca debe recibir, escribir ni cargar la clave secreta él mismo (política de credenciales financieras) — el usuario la agrega directo en `.env` y en Vercel.
- [x] Clave secreta rotada y cargada en Vercel (2026-09-28) — primer intento quedó con el valor de la publicable por error (`pk_live_...` en vez de `sk_live_...`, causaba `secret_key_required` en Stripe), corregido rotándola de nuevo y confirmando que el checkout ya no da ese error.
- [x] Clave publicable Live confirmada (`pk_live_51U0Oyu...`) — no se usa en el código actual (el checkout redirige a Stripe Checkout, sin Stripe.js en el cliente).
- [x] Webhook Live creado (`Kinara Producción`) apuntando a `https://kinara-ecommerce.vercel.app/api/stripe-webhook`, con los 4 eventos (`checkout.session.completed`, `checkout.session.async_payment_succeeded`, `checkout.session.async_payment_failed`, `charge.refunded`) y `STRIPE_WEBHOOK_SECRET` cargado en Vercel.
- [x] Verificado end-to-end (2026-09-28, sin completar ningún pago real): carrito → checkout → `/api/create-checkout-session` → redirect exitoso a la página hospedada de Stripe (`checkout.stripe.com`, nombre de negocio "Kinara Fit" correcto, métodos de pago Card/OXXO visibles) — confirma que la clave secreta Live y el flujo de creación de sesión funcionan.
- **Bloqueado (2026-09-28): el usuario no tiene acceso al correo con el que está registrada la cuenta de Stripe** (la usa con otro correo que no puede ver) — intentó agregarse como miembro del equipo con su propio correo, pero Stripe manda la verificación de identidad al correo original registrado, no al nuevo. Esto requiere Soporte de Stripe directamente (recuperación de cuenta) — Claude no puede resolverlo. El usuario abrió un caso con Soporte; pendiente de respuesta. No bloquea el resto del checklist.
- [ ] Confirmar que el nombre de cuenta/negocio de Stripe sigue configurado en modo Live (verificación de identidad/negocio completa para aceptar cargos reales, no solo crear sesiones).
- [ ] Hacer una compra real de prueba (monto bajo) con una tarjeta real antes de anunciar el lanzamiento.

## Skydropx (envíos)

- [x] `SKYDROPX_BASE_URL` cambiado a `https://pro.skydropx.com` (producción), en Vercel y en `.env` local (2026-09-28).
- [x] `SKYDROPX_CLIENT_ID`/`SKYDROPX_CLIENT_SECRET` de producción cargados en Vercel.
- [x] **Dirección de origen corregida** (2026-09-28) — además de la calle (placeholder), el teléfono (`5500000000`, también placeholder) y el correo (`hola@kinara.mx`, dominio distinto al verificado) tampoco eran reales. Dirección real confirmada por el usuario: Nunkini 234, Col. Jardines del Ajusco, C.P. 14200, Tlalpan, CDMX; tel. 5512735325; correo `contacto@kinarafit.com.mx` (mismo dominio ya verificado en Resend). **Importante**: el CP/alcaldía anteriores (10910, La Magdalena Contreras) no correspondían a la alcaldía real (Tlalpan) — no era solo la calle la que faltaba, la combinación completa estaba mal.
- [x] Probado en producción (2026-09-28, sin completar ninguna compra): cotizaciones reales obtenidas para **CDMX** (13 tarifas), **Guadalajara** (15 tarifas), **Mérida** (14 tarifas) y **Puebla** (13 tarifas) — ninguna cayó al fallback de $150. Confirma que el problema de ciudades sin tarifa (tarea 030) era del sandbox, no del código.
- [ ] Cargar los datos fiscales (RFC, razón social, uso de CFDI) en `pro.skydropx.com` si quieren facturas deducibles de las guías — sigue pendiente, no bloquea el envío en sí.
- [ ] Confirmar en el dashboard de `pro.skydropx.com` (Direcciones) que la dirección de origen ahí también sea la real — se detectó (tarea 028) que la API puede estar usando una dirección default de cuenta en vez de la que se manda por request; con la dirección ya corregida en el código, vale la pena revisar si esto seguía siendo un problema.

## Resend (correo de contacto, confirmación de pedido, código de bienvenida)

- [x] Cuenta en resend.com creada, `RESEND_API_KEY` generada y cargada en `.env` local — verificada con un envío real de prueba (2026-08-26).
- [x] Dominio propio `kinarafit.com.mx` verificado en Resend (DKIM + SPF vía subdominio `send.`, sin conflicto con el correo existente del dominio en GoDaddy) — ya no se manda desde `onboarding@resend.dev`.
- [x] `CONTACT_EMAIL_FROM=KINARA <contacto@kinarafit.com.mx>` cargado en `.env` local.
- [x] `CONTACT_EMAIL_TO=contacto@kinarafit.com.mx` confirmado (2026-09-28).
- [x] Las 3 variables (`RESEND_API_KEY`, `CONTACT_EMAIL_TO`, `CONTACT_EMAIL_FROM`) cargadas en Vercel → Production y verificadas con un envío real en producción (2026-09-28): mensaje de prueba enviado desde `/contacto`, confirmado que llegó a la bandeja de `contacto@kinarafit.com.mx`. Los 3 flujos (contacto, confirmación de pedido, código de bienvenida) ya deberían mandar correo en el sitio real.

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
