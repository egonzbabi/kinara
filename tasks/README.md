# Flujo de tareas

Cada modificación al sitio se define como un archivo `NNN-nombre-corto.md` en esta carpeta (ej. `002-rediseno-hero.md`). Esto le da a cada tarea su propio contexto aislado, en vez de pedir cambios sueltos por chat.

## Orden de lectura obligatorio antes de ejecutar una tarea

1. [`../CLAUDE.md`](../CLAUDE.md) — reglas generales del proyecto (siempre aplican).
2. Este archivo — el formato y las convenciones de tareas.
3. [`REQUISITOS.md`](REQUISITOS.md) — checklist acumulado de todo lo que ya exigieron tareas anteriores.
4. El archivo de la tarea específica (`NNN-nombre.md`) — contexto, alcance y criterios de aceptación de ESA tarea.

Si una tarea entra en conflicto con `CLAUDE.md`, ganan las reglas de `CLAUDE.md` salvo que la tarea diga explícitamente que las reemplaza para ese caso puntual.

## Verificación contra requisitos anteriores (obligatorio)

Ninguna tarea se marca `done` solo por cumplir sus propios criterios de aceptación. Antes de cerrarla:

1. Revisar cada punto ya marcado en [`REQUISITOS.md`](REQUISITOS.md) y confirmar que el cambio no lo rompe (ej. si una tarea anterior exigió "LCP < 2.5s" o "todas las imágenes con alt", la tarea actual no puede regresar eso).
2. Si algo se rompió, arreglarlo antes de cerrar la tarea — no se abre una tarea nueva para arreglar una regresión introducida en la misma sesión.
3. Si esta tarea introduce un requisito nuevo que debe sobrevivir a futuro (un estándar, no un detalle puntual), agregarlo a `REQUISITOS.md` en la categoría correspondiente con `(origen: tarea NNN)`.
4. Dejar constancia en la tarea (sección "Verificación de requisitos anteriores") de qué se revisó y el resultado.

## Crear una tarea nueva

1. Copia [`_TEMPLATE.md`](_TEMPLATE.md) a `NNN-nombre-corto.md` (siguiente número disponible).
2. Rellena todas las secciones. Sé específico en "Criterios de aceptación" — son lo que determina si la tarea está terminada.
3. Marca `status: pending`.

## Estados

- `pending` — definida, no iniciada.
- `in-progress` — se está trabajando.
- `done` — cumple todos los criterios de aceptación y fue probada.

## Archivos de este sistema

- [`REQUISITOS.md`](REQUISITOS.md) — checklist acumulado, vivo, de todo lo que ya se exigió y no se puede romper.
- `_TEMPLATE.md` — plantilla para tareas nuevas.

## Índice de tareas

| # | Archivo | Estado | Descripción |
|---|---------|--------|-------------|
| 001 | [001-ejemplo.md](001-ejemplo.md) | ejemplo | Tarea de muestra — bórrala cuando ya no la necesites de referencia |
| 002 | [002-performance-core-web-vitals.md](002-performance-core-web-vitals.md) | done | Performance y Core Web Vitals |
| 003 | [003-seo-tecnico.md](003-seo-tecnico.md) | pending | SEO técnico (metadatos, JSON-LD, sitemap, robots.txt) |
| 004 | [004-google-analytics.md](004-google-analytics.md) | pending | Google Analytics 4 con eventos de e-commerce (requiere Measurement ID del usuario) |
| 005 | [005-ui-ux-accesibilidad.md](005-ui-ux-accesibilidad.md) | pending | Auditoría de UI/UX y accesibilidad (WCAG AA) |
| 006 | [006-supabase-productos.md](006-supabase-productos.md) | done | Migrar catálogo e imágenes a Supabase |
| 007 | [007-stripe-checkout.md](007-stripe-checkout.md) | done | Cobros con Stripe Checkout Sessions hospedado, modo test |
| 008 | [008-copy-envios-pesos.md](008-copy-envios-pesos.md) | done | Actualizar copy de envíos/devoluciones a pesos mexicanos |
| 009 | [009-fotos-por-color.md](009-fotos-por-color.md) | done | Fotos reales por color de producto desde el catálogo del proveedor (5 productos) |
| 010 | [010-fotos-por-color-restante.md](010-fotos-por-color-restante.md) | done | Fotos por color restantes — 8 productos más con foto real por color |
| 011 | [011-fotos-lulu-top.md](011-fotos-lulu-top.md) | done | Fotos por color de LULU TOP (080924 y 2315), omitido de tareas 009/010 |
| 012 | [012-ajustar-color-hex-swatch.md](012-ajustar-color-hex-swatch.md) | done | Ajustar `color_hex` de 62 colores para que el swatch coincida con la foto real |
| 013 | [013-galeria-miniaturas-por-color.md](013-galeria-miniaturas-por-color.md) | done | Miniaturas de la galería del detalle de producto muestran la foto de cada color |
| 014 | [014-boton-volver-detalle.md](014-boton-volver-detalle.md) | done | Botón "Volver" en el detalle de producto regresa a la tienda con filtros y scroll intactos |
| 015 | [015-panel-admin-productos.md](015-panel-admin-productos.md) | done | Panel de administración de productos (login + CRUD) |
| 016 | [016-modelo-id-regenerado.md](016-modelo-id-regenerado.md) | done | Campo `modelo` por color/talla + regenerar `products.id` |
| 017 | [017-skydropx-envios.md](017-skydropx-envios.md) | done | Integración de Skydropx para cotización real de envíos |
| 018 | [018-catalogo-parte-2.md](018-catalogo-parte-2.md) | in-progress | Catálogo parte 2 — 21 productos nuevos + completar YUCA BRA |
| 019 | [019-fotos-multiples-color.md](019-fotos-multiples-color.md) | done | Múltiples fotos por color + carrusel en la página de producto |
| 020 | [020-badge-oferta.md](020-badge-oferta.md) | done | Agregar "Oferta" como opción de destacar producto |
| 021 | [021-menu-tipos-producto.md](021-menu-tipos-producto.md) | done | Menú principal: quitar Hombre, reemplazar Mujer por tipos de producto |
| 022 | [022-tienda-colores-home.md](022-tienda-colores-home.md) | done | Limpieza de /tienda, colores exactos, quitar Hombre, rediseño de home |
| 023 | [023-header-logo-menu-banner.md](023-header-logo-menu-banner.md) | done | Header: menú principal debajo del logo KINARA, logo más grande, banner más lento |
| 024 | [024-hero-collage-copy.md](024-hero-collage-copy.md) | done | Hero de home: collage de 4 fotos + nuevo copy del título |
| 025 | [025-hero-carrusel.md](025-hero-carrusel.md) | done | Hero de home: collage → carrusel automático + "universo" a "mundo" |
| 026 | [026-hero-crop-ropa.md](026-hero-crop-ropa.md) | done | Hero: corregir encuadre para que se vea la ropa deportiva, no solo el torso |
| 027 | [027-admin-pedidos-detalle.md](027-admin-pedidos-detalle.md) | done | Admin/Pedidos: mostrar toda la info de la tienda + de Skydropx por pedido |
| 028 | [028-modelo-y-guia-skydropx.md](028-modelo-y-guia-skydropx.md) | done | Admin/Pedidos: modelo en productos + compra real de guía con Skydropx (número de rastreo) |
| 029 | [029-validacion-direccion-cp.md](029-validacion-direccion-cp.md) | done | Checkout: validar/autocompletar colonia-municipio-estado contra el código postal |
| 030 | [030-vercel-skydropx-env-vars.md](030-vercel-skydropx-env-vars.md) | done | Fix: faltaban las 11 variables de entorno de Skydropx en Vercel (producción) |
| 031 | [031-seccion-ofertas-home.md](031-seccion-ofertas-home.md) | done | Home: sección de Ofertas antes de Lo nuevo |
| 032 | [032-pagina-contacto.md](032-pagina-contacto.md) | done | Página de Contacto (formulario por email) + link en el menú |
| 033 | [033-admin-mensajes.md](033-admin-mensajes.md) | done | Admin: pantalla /admin/mensajes para ver los mensajes de contacto |
| 034 | [034-familias-de-color.md](034-familias-de-color.md) | done | Filtro de color en /tienda: agrupar por familia + reflejar el color en la foto |
| 035 | [035-aviso-privacidad.md](035-aviso-privacidad.md) | done | Página /aviso-de-privacidad (borrador — pendiente de revisión legal) |
| 036 | [036-hero-transicion-pagina.md](036-hero-transicion-pagina.md) | done | Hero de home: transición de foto tipo "página" + zoom lento (Ken Burns) |
| 037 | [037-correo-confirmacion-pedido.md](037-correo-confirmacion-pedido.md) | done | Correo de confirmación de pedido al cliente (Resend) |
| 038 | [038-slogan-footer.md](038-slogan-footer.md) | done | Slogan de marca siempre visible (header fijo) |
| 039 | [039-modelo-a-sku.md](039-modelo-a-sku.md) | done | Cambiar la etiqueta "Modelo" por "SKU" en el admin |
| 040 | [040-sku-detalle-producto.md](040-sku-detalle-producto.md) | done | Mostrar el SKU en el detalle de producto |
| 041 | [041-footer-tienda-sincronizado.md](041-footer-tienda-sincronizado.md) | done | Footer: columna Tienda con las mismas opciones que el menú |
| 042 | [042-admin-inventario.md](042-admin-inventario.md) | done | Admin: sección de Inventario (tabla con fotos, imprimible y descargable) |
| 043 | [043-inventario-excel-fotos.md](043-inventario-excel-fotos.md) | done | Inventario: descarga en Excel real con fotos y celdas combinadas |
| 044 | [044-inventario-rediseno.md](044-inventario-rediseno.md) | done | Rediseño de /admin/inventario: tarjetas de resumen + agrupado por producto |
| 045 | [045-inventario-valuado-sku.md](045-inventario-valuado-sku.md) | done | Inventario: valuación de stock + SKU original visible y buscable |
| 046 | [046-excel-inventario-merge-filas.md](046-excel-inventario-merge-filas.md) | done | Excel de inventario: reduce alto de fila y combina todas las columnas repetidas |
| 047 | [047-excel-inventario-foto-nombre-original.md](047-excel-inventario-foto-nombre-original.md) | done | Excel de inventario: columna de foto más ancha + columna Nombre original |
| 048 | [048-inventario-quita-tarjeta-sin-stock.md](048-inventario-quita-tarjeta-sin-stock.md) | done | Inventario: quitar la tarjeta "Sin stock" y unificar el color de celdas sin talla |
| 049 | [049-excel-inventario-precio-color-merge.md](049-excel-inventario-precio-color-merge.md) | done | Excel de inventario: mueve Precio junto a Color y combina filas por color |
| 050 | [050-excel-inventario-foto-tamano-fijo.md](050-excel-inventario-foto-tamano-fijo.md) | done | Excel de inventario: fotos de tamaño fijo (ya no se estiran a la celda) |
| 051 | [051-excel-inventario-foto-margen-superior.md](051-excel-inventario-foto-margen-superior.md) | done | Excel de inventario: margen superior en la foto para que no se encime con el producto de arriba |
| 052 | [052-excel-inventario-alinear-titulos-arriba.md](052-excel-inventario-alinear-titulos-arriba.md) | done | Excel de inventario: alinear los títulos arriba, con la foto |
| 053 | [053-excel-inventario-impresion-titulo-anchos.md](053-excel-inventario-impresion-titulo-anchos.md) | done | Excel de inventario: título con fecha/hora, columnas auto-ajustadas, impresión en una página |
| 054 | [054-excel-inventario-rayas-numero-pagina.md](054-excel-inventario-rayas-numero-pagina.md) | done | Excel de inventario: rayas tenues en todos los renglones + número de página en el pie de impresión |
| 055 | [055-excel-inventario-formato-moneda.md](055-excel-inventario-formato-moneda.md) | done | Excel de inventario: Precio y Valor con formato de moneda (2 decimales) |
| 056 | [056-excel-inventario-pagina-sin-total.md](056-excel-inventario-pagina-sin-total.md) | done | Excel de inventario: pie de página solo con "Página X" (sin total, por limitación de Google Sheets) |
| 057 | [057-excel-inventario-fecha-zona-horaria-mexico.md](057-excel-inventario-fecha-zona-horaria-mexico.md) | done | Excel de inventario: fecha usa hora de México, no UTC del servidor (bug de nombre de archivo adelantado un día) |
| 058 | [058-tallas-reducidas-por-producto.md](058-tallas-reducidas-por-producto.md) | done | Leyenda "Tallas reducidas" pasa a ser opción por producto en el admin (default prendida) |
| 059 | [059-admin-productos-volver-a-fila-editada.md](059-admin-productos-volver-a-fila-editada.md) | done | Admin/Productos: al guardar, la lista regresa con scroll y resaltado a la fila del producto editado |
| 060 | [060-inventario-imprimir-pdf-fijo.md](060-inventario-imprimir-pdf-fijo.md) | done | Inventario: "Imprimir" genera un PDF real y fijo (landscape, rayas, font grande, sin cortar fotos entre páginas) |
| 061 | [061-politica-cambios-y-devoluciones.md](061-politica-cambios-y-devoluciones.md) | done | Página de Política de Cambios y Devoluciones + enlazar todos los mensajes de "no hay devoluciones" |
| 062 | [062-aviso-de-privacidad-actualizado.md](062-aviso-de-privacidad-actualizado.md) | done | Aviso de Privacidad: reemplazo por el texto real del usuario (razón social, domicilio, marketing) |
| 063 | [063-politica-de-envios.md](063-politica-de-envios.md) | done | Página de Política de Envíos + conectar el link "Envíos y entregas" del footer |
| 064 | [064-movimientos-de-inventario.md](064-movimientos-de-inventario.md) | done | Entradas y salidas de inventario (registro con fecha/concepto que ajusta el stock) |
| 065 | [065-admin-productos-columna-sku.md](065-admin-productos-columna-sku.md) | done | Admin/Productos: agregar columna SKU a la lista + buscar por SKU |
| 066 | [066-movimientos-sku-usuario-fecha-real.md](066-movimientos-sku-usuario-fecha-real.md) | done | Movimientos de inventario: selección por SKU (con nombre original/actual), fecha real de registro y usuario |
| 067 | [067-fix-sku-no-se-guarda-al-cambiarlo.md](067-fix-sku-no-se-guarda-al-cambiarlo.md) | done | Fix: al cambiar un SKU existente en el admin, el auto-llenado lo revertía |
| 068 | [068-fix-scroll-fila-editada-no-funcionaba.md](068-fix-scroll-fila-editada-no-funcionaba.md) | done | Fix: al guardar un producto, la lista no regresaba a esa fila (2 causas: #hash ignorado por ScrollRestoration, y el setSearchParams posterior sin preventScrollReset) |
| 069 | [069-ofertas-completas-y-etiqueta-correcta.md](069-ofertas-completas-y-etiqueta-correcta.md) | done | Home/Ofertas: mostrar todos los productos en oferta, siempre con la etiqueta "Oferta" |
| 070 | [070-descuento-de-bienvenida-registro.md](070-descuento-de-bienvenida-registro.md) | done | 10% de descuento en la primera compra al dejar el correo (mínimo $799) |
| 071 | [071-admin-productos-nombre-original.md](071-admin-productos-nombre-original.md) | done | Admin/Productos: mostrar el nombre original (slug/URL) debajo del nombre actual |
| 072 | [072-fix-formatprice-sin-decimales.md](072-fix-formatprice-sin-decimales.md) | done | Fix: formatPrice no mostraba siempre 2 decimales (854.1 en vez de 854.10) |
| 073 | [073-reintento-correos-resend.md](073-reintento-correos-resend.md) | done | Reintento automático (1 vez) al enviar correos con Resend, para no perder el correo si falla la primera vez |
| 074 | [074-fix-carrusel-fotos-extra-color.md](074-fix-carrusel-fotos-extra-color.md) | done | Fix: el carrusel de fotos extra del color no aparecía hasta hacer clic explícito en el color |

Sin orden fijo — se ejecutan según se indique. La tarea 004 tiene un prerrequisito a cargo del usuario (crear la property de GA4) antes de poder implementarse.
