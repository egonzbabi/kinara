# Requisitos acumulados

Este archivo es un checklist vivo. Cada vez que una tarea introduce un requisito que debe seguir cumpliéndose para siempre (no solo para esa tarea), se agrega aquí. **Toda tarea nueva debe verificar, antes de marcarse como `done`, que no rompe ninguno de los puntos ya listados abajo**, además de cumplir sus propios criterios de aceptación.

Formato de cada entrada: `- [ ] Requisito — (origen: tarea NNN)`

## Performance

- [x] Toda imagen nueva que venga de Supabase Storage debe pasar por `productImage()`/`productSrcSet()` (`app/lib/productImage.ts`) con un `width`/`height` explícito acorde al tamaño real de render — nunca `<img src={url}>` directo con la URL cruda de Storage. Sin esto se sirven PNG/JPEG sin comprimir de 300-400KB+ en vez de WebP de ~10-20KB. — (origen: tarea 002)
- [x] Las fuentes (Fraunces, Hanken Grotesk) se auto-hospedan vía `@fontsource-variable/*` importado en `app.css` — nunca volver a un `<link rel="stylesheet">` a Google Fonts (bloqueante, dos orígenes externos extra). Si se agrega una fuente nueva, preferir el mismo patrón. — (origen: tarea 002)
- [x] La imagen candidata a LCP de una ruta nueva (la primera foto grande que se ve al cargar) debe tener `fetchPriority="high"` y, si es viable, un preload (`links()` si es estática o `preload()` de `react-dom` si depende de `loaderData` — `links()` de React Router 7 no recibe `loaderData` en esta versión). — (origen: tarea 002)

## SEO

-

## Accesibilidad / UI-UX

- [x] Nunca publicar una foto de producto con texto/badges de marketing de un proveedor superpuestos (inglés/chino, watermarks, capturas de UI) — recortar/limpiar antes de subir a Storage. — (origen: tarea 009)

## Analytics

-

## Datos (Supabase)

- [x] El catálogo (productos, variantes color/talla/stock, imágenes) vive 100% en Supabase (tablas `products`, `product_variants`, `product_images` + bucket `product-images`). Ninguna tarea futura vuelve a hardcodear productos en `app/data/*.ts` — ese archivo solo contiene tipos. — (origen: tarea 006)
- [x] RLS activo con solo policy de lectura pública en las 3 tablas y en el bucket de Storage; cualquier escritura nueva (ej. gestión de inventario) debe pasar por `service_role` server-side, nunca por la anon key del cliente. — (origen: tarea 006)
- [x] Todo dato de producto que sea copy generado por Claude (no del cliente/Excel original) debe quedar marcado como tal en el origen de datos (ver `copySource` en `scripts/seed-data.ts` y notas de tarea 006) — no presentar borradores como si fueran contenido original sin que quede rastro de que fueron aprobados. — (origen: tarea 006)
- [x] El swatch de un producto siempre muestra todos los colores con stock, tengan o no foto propia verificada; el color sin foto cae a la foto genérica del producto al seleccionarlo (nunca a la foto de otro color). Antes (tarea 009) se ocultaban los colores sin foto en cuanto el producto tenía al menos una — se cambió en la tarea 018 porque ocultar colores con stock real confundía al usuario ("¿por qué no aparece este color?"). — (origen: tarea 009, actualizado en tarea 018)
- [x] No asignar una foto de color a un producto sin verificarla 1:1 contra la foto de referencia ya usada en el sitio — dos SKUs pueden compartir el mismo molde de prenda del proveedor; mejor dejar un color sin foto (oculto) que mostrar la prenda equivocada. — (origen: tarea 009)
- [x] Al verificar qué color corresponde a qué candidata, preferir el muestreo de color (RGB de la imagen) contra el hex exacto guardado en `product_variants.color_hex` por sobre confiar ciegamente en descripciones de texto de terceros (agentes, catálogos de proveedor) — esas descripciones pueden tener errores. — (origen: tarea 010)
- [x] Las claves de Supabase Storage deben ser ASCII-safe: normalizar/quitar tildes al generar el `storagePath` a partir de un nombre de color (ej. "Café" → "cafe"), nunca subir con el nombre literal acentuado. — (origen: tarea 010)
- [x] Antes de subir una foto de color nueva, comparar su resolución (área en píxeles) contra la foto original de ese producto en `public/productos/producto_N.png` — si queda por debajo de ~50% del área original, buscar una alternativa mejor en el catálogo antes de conformarse; si no hay mejor opción, dejarlo documentado explícitamente como la excepción (no asumir que "está bien" sin comparar contra el baseline real). — (origen: tarea 010)
- [x] Antes de cerrar cualquier tarea de fotos por color, verificar que TODOS los productos que necesitaban ese trabajo quedaron cubiertos (revisar la lista completa de productos, no solo los que parecían pendientes) — se detectó que AIRLIFT SHORT (0605) quedó fuera de las tareas 009 y 010 por un descuido de alcance. — (origen: tarea 010)
- [x] `product_variants.color_hex` (el color del círculo del swatch) debe reflejar el color real muestreado de la foto verificada en `product_images`, no un hex genérico aproximado del nombre del color — evita que el círculo prometa un tono distinto al que se ve al hacer click. Al recalcular, muestrear siempre desde una región de la foto que sea 100% tela (nunca fondo/piel/sombra) antes de tomar el color representativo. — (origen: tarea 012)
- [x] La escritura del catálogo (crear/editar/eliminar producto, variantes, imágenes) ahora también puede venir del panel `/admin` (además de los scripts de migración), pero siempre vía el cliente `service_role` server-side (`app/lib/supabase.server.ts`) — nunca desde el navegador con la anon key. Toda tabla nueva relacionada con el admin (ej. `admins`) debe tener RLS activo sin policies públicas. — (origen: tarea 015)
- [x] Al borrar un producto, además de la fila en `products` (que cascada limpia `product_variants`/`product_images` vía FK), hay que borrar explícitamente sus archivos en el bucket `product-images` de Storage — la cascada de FK no cubre Storage, y dejar archivos huérfanos ahí es un descuido fácil de cometer. — (origen: tarea 015)
- [x] `products.id` es un identificador interno generado por el sistema (código corto aleatorio) sin significado de negocio — no representa un SKU ni se edita manualmente. El código de negocio/logística (formato `CÓDIGO-COLOR-TALLA`) vive en `product_variants.modelo`, editable desde el admin. Cualquier integración externa futura (proveedor, logística) debe usar `modelo`, nunca `id`. — (origen: tarea 016)
- [x] Las FK de `product_variants`/`product_images` hacia `products.id` tienen `on update cascade` (además de `on delete cascade`) — necesario para poder renombrar `products.id` de forma segura. Cualquier migración futura que toque `products.id` debe recordar que también hay que mover los archivos correspondientes en Storage (tanto los de la carpeta `{id}/` como el archivo genérico suelto `{id}.png` en la raíz del bucket — este último es fácil de pasar por alto). — (origen: tarea 016)
- [x] `products.price` puede ser `null` **solo** si `products.is_draft = true` (constraint `products_price_required_unless_draft` en la DB) — un producto sin precio real se carga como borrador (`is_draft: true`) y nunca aparece en `/tienda` ni `/producto/:slug` (`getAllProducts()`/`getProductBySlug()` en `app/lib/catalog.ts` filtran `is_draft = false`). Se publica poniéndole precio real y guardando desde `/admin/productos` (que ya fuerza `is_draft: false` al crear/editar). — (origen: tarea 018)

## Pagos (Stripe)

- [x] El checkout usa Stripe Checkout Sessions **hospedado** (no Elements embebido, no PaymentIntents manuales) — el comprador es redirigido a la página de Stripe y nunca llena datos de tarjeta en nuestro sitio. — (origen: tarea 007)
- [x] El precio y el stock de cada línea del carrito se recalculan/validan server-side contra `products`/`product_variants` antes de crear la Checkout Session — nunca se confía en el precio ni la cantidad que manda el cliente. — (origen: tarea 007)
- [x] Toda orden nueva debe pasar por el patrón de deduplicación de `ensureOrderFromCheckoutSession` (`app/lib/orders.server.ts`): índice único en `orders.stripe_session_id` + check-antes-de-insertar + catch de la violación de unicidad (`23505`). El webhook y el loader de `/checkout/success` pueden llamar a esta función casi al mismo tiempo — solo quien "gana" el insert decrementa stock. Cualquier cambio futuro al flujo de pago debe preservar este patrón para no decrementar stock dos veces. — (origen: tarea 007)
- [x] El decremento de stock al confirmarse un pago usa el RPC atómico `decrement_variant_stock` (un solo `UPDATE`), nunca un read-modify-write desde la app — evita perder decrementos con pedidos concurrentes sobre la misma variante. — (origen: tarea 007)
- [x] El envío se cotiza en tiempo real con Skydropx (`app/lib/skydropx.server.ts`) según la dirección real del comprador, recolectada en `/checkout` **antes** de crear la Checkout Session de Stripe (no en la propia página de Stripe). El precio de envío nunca se confía del cliente: `api.create-checkout-session.tsx` vuelve a cotizar server-side y empareja la tarifa elegida por `provider_name` + `service_code` (el `id` de cotización de Skydropx es efímero) antes de cobrar. $150 MXN (`SHIPPING_FEE_MXN` en `app/lib/shipping.ts`) es solo el fallback si Skydropx no responde — nunca el precio por defecto. — (origen: tarea 017)

## Código / convenciones

-

---

_Vacío por ahora — se va llenando a medida que se completan tareas y se definen estándares concretos._
