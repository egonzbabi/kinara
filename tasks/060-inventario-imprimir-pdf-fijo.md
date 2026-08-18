---
id: 060
title: "Inventario: el botón Imprimir genera un PDF real, fijo, en vez de imprimir la página web"
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

El botón "Imprimir" de `/admin/inventario` llamaba a `window.print()` sobre la página web (matriz color × talla en pantalla). El usuario reportó que al imprimir "se mueven todos los campos" — el resultado depende del navegador, su motor de impresión, fuentes disponibles y configuración de la caja de diálogo de impresión, así que el mismo archivo puede verse distinto cada vez. Pidió en su lugar un PDF real, fijo, que nunca cambie al volver a abrirlo, en horizontal (landscape), con líneas tenues en todas las celdas, el font más grande posible sin que se salga de la hoja, y que el salto de página nunca corte una foto de producto a la mitad.

## Objetivo

El botón "Imprimir" ahora abre un PDF generado en el servidor con `pdfkit` — layout 100% fijo en puntos (no depende de CSS de impresión ni del navegador), landscape carta, con la misma matriz producto → color × talla que se ve en pantalla, gridlines en toda celda, el font más grande de una lista de candidatos que sigue cabiendo en cada columna, y salto de página que nunca divide el bloque de un producto (incluida su foto).

## Archivos involucrados

- `app/lib/admin-inventory-groups.ts` (nuevo): se extrajo `SIZE_ORDER`, `ProductGroup` y `groupByProduct` que antes vivían solo dentro de `admin.inventario.tsx`, para que la vista en pantalla y el generador de PDF agrupen los datos exactamente igual (una sola fuente de verdad).
- `app/lib/fetch-image.server.ts` (nuevo): se extrajo la función `fetchImage` que antes vivía solo en `admin-inventory-excel.server.ts`, parametrizada por los tipos de imagen soportados — la reutilizan tanto el Excel (jpeg/png/gif) como el PDF nuevo (jpeg/png, que es lo único que soporta `pdfkit` nativamente).
- `app/lib/admin-inventory-pdf.server.ts` (nuevo): `buildInventoryPdf(rows)` — genera el PDF completo con `pdfkit`:
  - Página carta horizontal (792×612pt), márgenes fijos.
  - Un bloque por producto: foto (tamaño fijo, sin deformarse), nombre/tipo/SKU original, y las 3 cajas Stock total/Precio/Valor — debajo, la matriz Color × S/M/L/XL con el mismo criterio de color que la pantalla (fondo clay claro para 0/no disponible, sage claro para con stock; ver tarea 048 de unificación).
  - `pickMetrics()`: prueba una lista de tamaños de font candidatos (13 a 6pt) y elige el más grande que deja el nombre de producto más largo y el nombre de color más largo dentro de sus columnas — el alto de fila y de encabezado se recalculan en función del font elegido, para que un font más grande no quede apretado.
  - Antes de dibujar cada bloque de producto, si no cabe completo en lo que queda de la página actual, se llama a `doc.addPage()` primero — así ningún producto (ni su foto) se corta entre dos páginas.
  - Líneas tenues (`#d9d9d9`, 0.5pt) alrededor de cada celda de la matriz, igual en espíritu a las de la tarea 054 del Excel.
- `app/routes/admin.inventario.pdf.tsx` (nueva ruta): loader que aplica los mismos filtros `search`/`kind` que ya usa la descarga de Excel, llama a `buildInventoryPdf`, y devuelve el PDF con `Content-Type: application/pdf` y `Content-Disposition: inline` (se abre directo en el visor de PDF del navegador, listo para `Ctrl+P` sobre un archivo ya fijo — no para forzar una descarga).
- `app/routes.ts`: registra `admin/inventario/pdf`.
- `app/routes/admin.inventario.tsx`: el botón "Imprimir" pasa de `<button onClick={() => window.print()}>` a un link `<a href="/admin/inventario/pdf?..." target="_blank">` con los mismos filtros activos que "Descargar Excel". También se actualizó el import para usar `groupByProduct`/`SIZE_ORDER` desde el nuevo archivo compartido en vez de la copia local (se eliminó la duplicación).
- `app/lib/admin-inventory-excel.server.ts`: usa el nuevo `fetchImage` compartido en vez de su copia local (mismo comportamiento, sin duplicar código).
- `package.json`: se agregó `pdfkit` (+ `@types/pdfkit` como dev dependency) — librería pura JS sin binarios nativos, generación determinista sin depender de un navegador headless.

## Restricciones específicas de esta tarea

- El PDF muestra la matriz Color × Talla (igual que la vista en pantalla), no la tabla plana por SKU del Excel — son dos formatos con propósitos distintos: el Excel es para trabajar los datos (una fila por SKU, con fórmulas/orden), el PDF es para imprimir y leer de un vistazo, igual que ya se veía en pantalla.
- Cada producto usa una sola foto (la principal), no una por color — igual que el Excel (tarea 043), para no disparar decenas de descargas de imagen adicionales en cada impresión.
- `pdfkit` solo soporta jpeg/png de forma nativa (no gif, a diferencia de exceljs) — si la foto de un producto es de otro formato, se omite igual que ya pasaba en el Excel, sin romper el PDF.
- El font más grande se busca entre candidatos de 13 a 6pt — no es una búsqueda sin techo: 13pt es ya notablemente más grande y legible que lo que se veía impreso desde el navegador, y evita un font desproporcionado para una tabla de datos densa.
- El botón sigue llamándose "Imprimir" (no "Descargar PDF") porque la intención declarada del usuario es imprimir, no archivar — el PDF se abre `inline` en una pestaña nueva, listo para `Ctrl+P`, no se descarga automáticamente.
- Las clases `print:*` de Tailwind que ya existían en `admin.inventario.tsx` se dejaron intactas — siguen sirviendo como respaldo si alguien imprime la página directamente con `Ctrl+P` en vez de usar el botón, sin costo de mantenerlas.

## Criterios de aceptación

- [x] El botón "Imprimir" abre un PDF real (no dispara `window.print()`).
- [x] El PDF es landscape (792×612pt, carta horizontal).
- [x] Cada celda de la matriz tiene un borde tenue visible.
- [x] El font es el más grande posible sin que ningún nombre de producto o de color se salga de su columna (verificado: 13pt cabe en todos los casos del catálogo real).
- [x] Ningún salto de página corte un producto (ni su foto) a la mitad — verificado en varias páginas con productos de distinto número de colores.
- [x] `npm run typecheck` pasa sin errores.

## Verificación de requisitos anteriores

- Revisado contra `REQUISITOS.md`: sí — no cambia paleta ni tipografía de marca (el PDF usa Helvetica, una fuente neutra estándar para documentos impresos, no la tipografía de marca del sitio — un documento operativo de inventario no lleva la identidad visual del sitio). No cambia la vista en pantalla salvo el destino del botón "Imprimir".
- Regresiones encontradas: ninguna — se verificó que el Excel (`admin-inventory-excel.server.ts`) sigue generando fotos e imágenes igual tras extraer `fetchImage` a un archivo compartido (mismo comportamiento, misma firma de tipos soportados).
- Requisitos nuevos agregados a `REQUISITOS.md`: no aplica (es una función operativa del admin, no un estándar transversal de performance/SEO/accesibilidad del sitio público).

## Pruebas manuales

- `npm run typecheck` limpio.
- Se generó el PDF real con los 481 SKUs / 38 productos del catálogo (vía script desechable) y se inspeccionó renderizando páginas a imagen con PyMuPDF (no se cuenta con credenciales de admin para probarlo desde el navegador — mismo caso que tareas 058/059):
  - 18 páginas, todas landscape 792×612pt.
  - Página 1: NOVA TOP (4 colores) y FIT SHORT (5 colores), font 13pt legible, gridlines visibles, colores clay/sage consistentes con la vista en pantalla.
  - Página con CROP TOP (7 colores, el producto con más colores del catálogo): el bloque completo cupo en una sola página sin dividirse.
  - Última página (18): termina limpiamente con el último producto (BUTTON), sin cortes.
  - Se confirmó por separado (script que prueba cada tamaño de font candidato) que el nombre de producto y de color más largos del catálogo real caben cómodos incluso en el candidato más grande (13pt).
- Tiempo de generación con el catálogo completo: ~5.5s (aceptable para una descarga manual desde el admin, mismo orden de magnitud que el Excel).

## Notas de progreso

- 2026-08-17: Tarea creada e implementada en la misma sesión, a pedido explícito del usuario. Iteración interna: la primera versión usaba font fijo en 10pt con alto de fila fijo; se amplió el rango de candidatos y se hizo que el alto de fila/encabezado escale con el font elegido, para no dejar el texto más chico de lo que el espacio disponible permite.
