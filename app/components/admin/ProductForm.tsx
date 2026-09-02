import { useEffect, useState } from "react";
import { Link, useNavigation } from "react-router";
import { slugify, modeloColorCode } from "~/lib/slug";
import { SIZE_ORDER, ACCESSORY_SIZE } from "~/lib/catalog-constants";
import { cn } from "~/lib/cn";
import type { AdminProductInput, AdminColorInput, SizeStock } from "~/lib/admin-catalog.server";

/**
 * Deriva el código base de modelo a partir del primer "modelo" ya guardado.
 * El formato siempre termina en "-COLOR-TALLA" (ambos sin guiones, ver
 * modeloColorCode), así que el base es todo menos los últimos dos segmentos
 * — el propio código base puede tener guiones (ej. "JV-FELPADA002-GRIS-M" ->
 * "JV-FELPADA002", no "JV").
 */
function guessModeloBase(colors: AdminColorInput[]): string {
  for (const c of colors) {
    for (const s of c.sizes) {
      if (s.modelo) return s.modelo.split("-").slice(0, -2).join("-");
    }
  }
  return "";
}

type Props = {
  product: AdminProductInput | null;
  productId?: string;
  error?: string;
};

/** Tallas que se muestran para un color: las 4 de ropa, o solo "Única" para
 * accesorios (tarea 081) — un producto de "accesorios" no maneja S/M/L/XL. */
function sizeTemplate(singleSize: boolean): readonly SizeStock["size"][] {
  return singleSize ? [ACCESSORY_SIZE] : SIZE_ORDER;
}

function emptyColor(singleSize: boolean): AdminColorInput {
  return {
    name: "",
    hex: "#CCCCCC",
    sizes: sizeTemplate(singleSize).map((size) => ({ size, stock: 0, modelo: null })),
    imageUrls: [],
  };
}

function sizesFor(sizes: SizeStock[], singleSize: boolean): SizeStock[] {
  return sizeTemplate(singleSize).map(
    (size) => sizes.find((s) => s.size === size) ?? { size, stock: 0, modelo: null },
  );
}

async function uploadImage(
  file: File,
  productId: string,
  kind: "generic" | "color",
  colorName?: string,
): Promise<string> {
  const form = new FormData();
  form.set("file", file);
  form.set("productId", productId);
  form.set("kind", kind);
  if (colorName) form.set("colorName", colorName);
  const res = await fetch("/admin/upload", { method: "POST", body: form });
  const data = (await res.json()) as { url?: string; error?: string };
  if (!res.ok || !data.url) throw new Error(data.error || "Falló la subida");
  return data.url;
}

export function ProductForm({ product, productId, error }: Props) {
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";
  // Un producto ya existente no puede cambiar sus existencias desde aquí — solo
  // por /admin/inventario/movimientos (tarea 078), para evitar errores al editar
  // otra cosa (precio, fotos, etc.) y tocar el número de stock sin querer. Al
  // crear un producto nuevo sí se captura el stock inicial aquí normalmente.
  const isExistingProduct = Boolean(productId);

  const [name, setName] = useState(product?.name ?? "");
  const [slug, setSlug] = useState(product?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(product));
  const [category, setCategory] = useState(product?.category ?? "mujer");
  // "Talla única" es una elección aparte de la categoría (tarea 082) — no todo
  // accesorio es de talla única (ej. unos guantes sí traen S/M/L), así que no
  // se deriva de "category === accesorios", el admin lo marca a propósito.
  // Al editar, se detecta solo si el producto ya venía guardado así.
  const [singleSize, setSingleSize] = useState(
    () => product?.colors.some((c) => c.sizes.some((s) => s.size === ACCESSORY_SIZE)) ?? false,
  );
  const [kind, setKind] = useState(product?.kind ?? "");
  const [price, setPrice] = useState(product?.price?.toString() ?? "");
  const [compareAt, setCompareAt] = useState(product?.compareAt?.toString() ?? "");
  const [description, setDescription] = useState(product?.description ?? "");
  const [materials, setMaterials] = useState(product?.materials ?? "");
  const [isNew, setIsNew] = useState(product?.isNew ?? false);
  const [isBestseller, setIsBestseller] = useState(product?.isBestseller ?? false);
  const [isOnSale, setIsOnSale] = useState(product?.isOnSale ?? false);
  // Prendida por default en todos los productos (nuevos y ya existentes) — se
  // apaga caso por caso desde aquí.
  const [showReducedSizesNotice, setShowReducedSizesNotice] = useState(
    product?.showReducedSizesNotice ?? true,
  );
  // La casilla marcada ES la etiqueta que se ve sobre la foto — un solo dato, no tres
  // campos separados. Si se marca más de una, gana en este orden: Nuevo, Best-seller, Oferta.
  const badge = isNew ? "Nuevo" : isBestseller ? "Best-seller" : isOnSale ? "Oferta" : "";
  const [colors, setColors] = useState<AdminColorInput[]>(
    product?.colors.map((c) => ({ ...c, sizes: sizesFor(c.sizes, singleSize) })) ?? [
      emptyColor(singleSize),
    ],
  );
  // Si se marca/desmarca "Talla única", re-arma las tallas de cada color al
  // molde correspondiente (4 tallas <-> solo "Única") — sin esto, cambiar el
  // toggle dejaría el formulario con tallas que ya no aplican, o sin la única
  // que sí aplica.
  useEffect(() => {
    setColors((prev) => prev.map((c) => ({ ...c, sizes: sizesFor(c.sizes, singleSize) })));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [singleSize]);

  const [gallery, setGallery] = useState<string[]>(product?.gallery ?? []);
  const [uploadError, setUploadError] = useState<string | null>(null);
  // Cuenta subidas de foto en curso — sin esto, "Guardar" podía enviar el
  // formulario antes de que terminara una subida y la foto se perdía en silencio.
  const [pendingUploads, setPendingUploads] = useState(0);
  const [modeloBase, setModeloBase] = useState(() => guessModeloBase(product?.colors ?? []));
  // Tallas cuyo SKU el admin ya editó a mano — el auto-llenado de abajo nunca
  // las vuelve a tocar, ni siquiera si el campo queda vacío momentáneamente
  // mientras se borra para escribir uno nuevo (si no, el auto-llenado lo
  // rellenaba de vuelta con el valor viejo antes de que el admin terminara).
  const [touchedModelos, setTouchedModelos] = useState<Set<string>>(() => new Set());
  // Tallas en 0 existencias que el admin marcó a propósito como "sí existen"
  // (tarea 076/077) — solo importa cuando el stock está en 0: con stock > 0 la
  // talla ya se guarda igual, sin necesidad de esto. Se precarga con las que
  // ya vinieran guardadas en 0 con SKU (guardadas antes bajo esta misma regla),
  // para no perderlas sin querer al reabrir el formulario.
  const [includedZeroStock, setIncludedZeroStock] = useState<Set<string>>(() => {
    const initial = new Set<string>();
    product?.colors.forEach((c, ci) => {
      c.sizes.forEach((s) => {
        if (s.stock === 0 && s.modelo) initial.add(`${ci}:${s.size}`);
      });
    });
    return initial;
  });

  // productId de referencia para subir fotos: el producto ya guardado, o un slug
  // provisional derivado del nombre mientras se crea uno nuevo.
  const uploadProductId = productId || slugify(name) || "borrador";

  // Mantiene el modelo (código-color-talla) de cualquier talla con stock —o
  // marcada a propósito como "existe sin stock" (includedZeroStock, tarea
  // 077)— al día con el código base de arriba: completa una talla nueva sin
  // SKU y regenera el de una existente si el admin cambia el código base.
  // Nunca pisa una talla que el admin ya editó a mano (touchedModelos). El SKU
  // es justo lo que hace que una talla en 0 se guarde (ver insertVariantsAndImages,
  // tarea 076) — por eso al marcar el checkbox de "existe sin stock" alcanza
  // con esto para que se guarde, sin que el admin tenga que escribir el SKU él mismo.
  useEffect(() => {
    if (!modeloBase) return;
    setColors((prev) => {
      let changed = false;
      const next = prev.map((c, ci) => {
        const colorCode = modeloColorCode(c.name || "");
        const sizes = c.sizes.map((s) => {
          const key = `${ci}:${s.size}`;
          const shouldHaveSku = (s.stock > 0 || includedZeroStock.has(key)) && !touchedModelos.has(key);
          if (shouldHaveSku && colorCode) {
            const generated = `${modeloBase}-${colorCode}-${s.size}`;
            if (s.modelo !== generated) {
              changed = true;
              return { ...s, modelo: generated };
            }
          }
          return s;
        });
        return { ...c, sizes };
      });
      return changed ? next : prev;
    });
  }, [modeloBase, colors, touchedModelos, includedZeroStock]);

  const updateColor = (index: number, patch: Partial<AdminColorInput>) => {
    setColors((prev) => prev.map((c, i) => (i === index ? { ...c, ...patch } : c)));
  };

  const updateStock = (colorIndex: number, size: SizeStock["size"], stock: number) => {
    setColors((prev) =>
      prev.map((c, i) =>
        i === colorIndex
          ? { ...c, sizes: c.sizes.map((s) => (s.size === size ? { ...s, stock } : s)) }
          : c,
      ),
    );
  };

  // "Existe sin stock" (tarea 077): decide si una talla en 0 se guarda o no —
  // sin esto marcado (y sin SKU manual), la talla se descarta al guardar (ver
  // insertVariantsAndImages). Al desmarcar, si el admin nunca tocó el SKU a
  // mano, se lo borra de vuelta — si no, quedaría un SKU generado "fantasma"
  // que igual la mantendría guardada aunque el admin ya no la quiera.
  //
  // `wasIncluded` es el valor que se ve ahora mismo en el checkbox (viene del
  // render, ver más abajo: Set o ya trae SKU) — no basta con mirar el Set solo,
  // porque una talla que ya traía SKU de antes (ej. tenía stock y se bajó a 0)
  // se muestra marcada sin haber pasado nunca por este Set.
  const toggleIncludedZeroStock = (
    colorIndex: number,
    size: SizeStock["size"],
    wasIncluded: boolean,
  ) => {
    const key = `${colorIndex}:${size}`;
    setIncludedZeroStock((prev) => {
      const next = new Set(prev);
      if (wasIncluded) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
    if (wasIncluded && !touchedModelos.has(key)) {
      setColors((prevColors) =>
        prevColors.map((c, i) =>
          i === colorIndex
            ? { ...c, sizes: c.sizes.map((s) => (s.size === size ? { ...s, modelo: null } : s)) }
            : c,
        ),
      );
    }
  };

  const updateModelo = (colorIndex: number, size: SizeStock["size"], modelo: string) => {
    setTouchedModelos((prev) => {
      const next = new Set(prev);
      next.add(`${colorIndex}:${size}`);
      return next;
    });
    setColors((prev) =>
      prev.map((c, i) =>
        i === colorIndex
          ? { ...c, sizes: c.sizes.map((s) => (s.size === size ? { ...s, modelo: modelo || null } : s)) }
          : c,
      ),
    );
  };

  const handleColorImage = async (index: number, file: File) => {
    setPendingUploads((n) => n + 1);
    try {
      const url = await uploadImage(file, uploadProductId, "color", colors[index].name || `color-${index}`);
      setColors((prev) =>
        prev.map((c, i) => (i === index ? { ...c, imageUrls: [...c.imageUrls, url] } : c)),
      );
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Falló la subida");
    } finally {
      setPendingUploads((n) => n - 1);
    }
  };

  const removeColorImage = (colorIndex: number, photoIndex: number) => {
    setColors((prev) =>
      prev.map((c, i) =>
        i === colorIndex
          ? { ...c, imageUrls: c.imageUrls.filter((_, pi) => pi !== photoIndex) }
          : c,
      ),
    );
  };

  const moveColorImage = (colorIndex: number, photoIndex: number, dir: -1 | 1) => {
    setColors((prev) =>
      prev.map((c, i) => {
        if (i !== colorIndex) return c;
        const target = photoIndex + dir;
        if (target < 0 || target >= c.imageUrls.length) return c;
        const imageUrls = [...c.imageUrls];
        [imageUrls[photoIndex], imageUrls[target]] = [imageUrls[target], imageUrls[photoIndex]];
        return { ...c, imageUrls };
      }),
    );
  };

  const handleGalleryImage = async (file: File) => {
    setPendingUploads((n) => n + 1);
    try {
      const url = await uploadImage(file, uploadProductId, "generic");
      setGallery((prev) => [...prev, url]);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Falló la subida");
    } finally {
      setPendingUploads((n) => n - 1);
    }
  };

  const moveGalleryImage = (index: number, dir: -1 | 1) => {
    setGallery((prev) => {
      const next = [...prev];
      const target = index + dir;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  };

  const inputClass =
    "mt-1.5 w-full rounded-lg border border-line bg-bone px-3 py-2.5 text-sm text-espresso focus:border-clay focus:outline-none";
  const labelClass = "text-sm font-medium text-espresso";

  return (
    <form method="post" className="flex flex-col gap-8">
      <input type="hidden" name="colors_json" value={JSON.stringify(colors)} />
      <input type="hidden" name="gallery_json" value={JSON.stringify(gallery)} />

      {(error || uploadError) && (
        <p className="rounded-lg bg-clay/10 px-4 py-3 text-sm text-clay" role="alert">
          {error || uploadError}
        </p>
      )}

      {/* SKU (código base) */}
      <section className="rounded-xl bg-bone p-5">
        <h2 className="font-display text-lg text-espresso">SKU</h2>
        <p className="mt-1 text-[13px] text-muted">
          Código base (ej. el número del Excel/proveedor). El SKU de cada talla con stock se
          arma solo como <span className="font-medium">CÓDIGO-COLOR-TALLA</span> — si cambias
          el código base aquí, se actualiza en todas las tallas, excepto las que hayas editado
          tú a mano directamente (esas ya no se tocan automáticamente).
        </p>
        <input
          value={modeloBase}
          onChange={(e) => setModeloBase(e.target.value)}
          placeholder="ej. 2522"
          className={cn(inputClass, "sm:max-w-xs")}
        />
      </section>

      {/* Datos del producto */}
      <section className="rounded-xl bg-bone p-5">
        <h2 className="font-display text-lg text-espresso">Datos del producto</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass}>Nombre</label>
            <input
              name="name"
              required
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (!slugTouched) setSlug(slugify(e.target.value));
              }}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Slug (URL)</label>
            <input
              name="slug"
              required
              value={slug}
              onChange={(e) => {
                setSlug(e.target.value);
                setSlugTouched(true);
              }}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Categoría</label>
            <select
              name="category"
              value={category}
              onChange={(e) => setCategory(e.target.value as typeof category)}
              className={inputClass}
            >
              <option value="mujer">Mujer</option>
              <option value="hombre">Hombre</option>
              <option value="accesorios">Accesorios</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Tipo (ej. "Legging", "Top")</label>
            <input name="kind" required value={kind} onChange={(e) => setKind(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Precio (MXN)</label>
            <input
              name="price"
              type="number"
              min="0"
              step="0.01"
              required
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Precio anterior (opcional)</label>
            <input
              name="compareAt"
              type="number"
              min="0"
              step="0.01"
              value={compareAt}
              onChange={(e) => setCompareAt(e.target.value)}
              className={inputClass}
            />
          </div>
          <div className="sm:col-span-2">
            <input type="hidden" name="badge" value={badge} />
            <p className={labelClass}>Destacar producto</p>
            <p className="text-xs text-muted">
              La casilla marcada es también la etiqueta que se muestra sobre la foto del
              producto en la tienda.
            </p>
            <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:gap-6">
              <div>
                <label className="flex items-center gap-2 text-sm text-espresso">
                  <input
                    type="checkbox"
                    name="isNew"
                    checked={isNew}
                    onChange={(e) => setIsNew(e.target.checked)}
                  />
                  Nuevo
                </label>
                <p className="ml-6 text-xs text-muted">
                  Aparece en: etiqueta "Nuevo" sobre la foto, sección "Novedades" de la
                  página principal, y primero al ordenar la tienda.
                </p>
              </div>
              <div>
                <label className="flex items-center gap-2 text-sm text-espresso">
                  <input
                    type="checkbox"
                    name="isBestseller"
                    checked={isBestseller}
                    onChange={(e) => setIsBestseller(e.target.checked)}
                  />
                  Best-seller
                </label>
                <p className="ml-6 text-xs text-muted">
                  Aparece en: etiqueta "Best-seller" sobre la foto, y el carrusel de más
                  vendidos de la página principal.
                </p>
              </div>
              <div>
                <label className="flex items-center gap-2 text-sm text-espresso">
                  <input
                    type="checkbox"
                    name="isOnSale"
                    checked={isOnSale}
                    onChange={(e) => setIsOnSale(e.target.checked)}
                  />
                  Oferta
                </label>
                <p className="ml-6 text-xs text-muted">
                  Aparece en: etiqueta "Oferta" sobre la foto del producto en la tienda.
                </p>
              </div>
            </div>
          </div>
          <div className="sm:col-span-2">
            <label className="flex items-center gap-2 text-sm text-espresso">
              <input
                type="checkbox"
                name="showReducedSizesNotice"
                checked={showReducedSizesNotice}
                onChange={(e) => setShowReducedSizesNotice(e.target.checked)}
              />
              Mostrar leyenda "Tallas reducidas"
            </label>
            <p className="ml-6 text-xs text-muted">
              Prendida por default en todos los productos. Aparece junto a "Talla" en el
              detalle del producto — apágala aquí para los productos que no la necesiten.
            </p>
          </div>
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass}>Descripción</label>
            <textarea
              name="description"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Especificaciones / materiales</label>
            <textarea
              name="materials"
              rows={3}
              value={materials}
              onChange={(e) => setMaterials(e.target.value)}
              className={inputClass}
            />
          </div>
        </div>
      </section>

      {/* Colores */}
      <section className="rounded-xl bg-bone p-5">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg text-espresso">Colores</h2>
          <button
            type="button"
            onClick={() => setColors((prev) => [...prev, emptyColor(singleSize)])}
            className="btn btn-outline px-4 py-2 text-[13px]"
          >
            + Agregar color
          </button>
        </div>

        <div className="mt-4">
          <label className="flex items-center gap-2 text-sm text-espresso">
            <input
              type="checkbox"
              name="singleSize"
              checked={singleSize}
              onChange={(e) => setSingleSize(e.target.checked)}
            />
            Talla única (sin S/M/L/XL)
          </label>
          <p className="ml-6 text-xs text-muted">
            Para productos que no manejan tallas de ropa, como bolsas o gorras. No todos los
            accesorios aplican — unos guantes o una gorra ajustable, por ejemplo, sí pueden tener
            S/M/L/XL, así que esto se marca aparte de la categoría.
          </p>
        </div>

        <div className="mt-4 flex flex-col gap-4">
          {colors.map((color, i) => (
            <div key={i} className="rounded-lg border border-line p-4">
              <div className="flex flex-wrap items-end gap-4">
                <div>
                  <label className={labelClass}>Nombre del color</label>
                  <input
                    value={color.name}
                    onChange={(e) => updateColor(i, { name: e.target.value })}
                    className={cn(inputClass, "w-40")}
                  />
                </div>
                <div>
                  <label className={labelClass}>Hex</label>
                  <div className="mt-1.5 flex items-center gap-2">
                    <input
                      type="color"
                      value={color.hex ?? "#cccccc"}
                      onChange={(e) => updateColor(i, { hex: e.target.value })}
                      className="h-10 w-10 rounded border border-line"
                    />
                    <input
                      value={color.hex ?? ""}
                      onChange={(e) => updateColor(i, { hex: e.target.value })}
                      className={cn(inputClass, "mt-0 w-28")}
                    />
                  </div>
                </div>

                <div className="flex gap-3">
                  {color.sizes.map((s) => {
                    const key = `${i}:${s.size}`;
                    // Ya cargada aunque nunca se haya marcado el checkbox (ej. una talla
                    // que tenía stock y ya SKU, y el admin la bajó a 0 ahora) cuenta como
                    // incluida igual — si no, el checkbox se vería sin marcar aunque esa
                    // talla sí se vaya a guardar (por el SKU que ya trae).
                    const included = includedZeroStock.has(key) || Boolean(s.modelo);
                    return (
                      <div key={s.size}>
                        <label className="text-xs text-muted">{s.size}</label>
                        <input
                          type="number"
                          min="0"
                          value={s.stock}
                          onChange={(e) => updateStock(i, s.size, Number(e.target.value))}
                          disabled={isExistingProduct}
                          title={
                            isExistingProduct
                              ? "Las existencias de un producto ya creado solo se cambian desde Movimientos"
                              : undefined
                          }
                          className={cn(
                            inputClass,
                            "mt-1 w-16",
                            isExistingProduct && "cursor-not-allowed bg-sand text-muted",
                          )}
                        />
                        <input
                          type="text"
                          placeholder="SKU"
                          title="Código de SKU (código-color-talla)"
                          value={s.modelo ?? ""}
                          onChange={(e) => updateModelo(i, s.size, e.target.value)}
                          className={cn(inputClass, "mt-1 w-24 text-xs")}
                        />
                        {s.stock === 0 && (
                          <label className="mt-1 flex items-center gap-1 text-[11px] text-muted">
                            <input
                              type="checkbox"
                              checked={included}
                              onChange={() => toggleIncludedZeroStock(i, s.size, included)}
                            />
                            Existe sin stock
                          </label>
                        )}
                      </div>
                    );
                  })}
                </div>
                <p className="mt-1.5 text-[11px] text-muted">
                  Una talla en 0 sin marcar "Existe sin stock" no se guarda (se asume que no
                  aplica) — márcala para dar de alta un color/talla que existe pero todavía no
                  tiene existencias; el SKU se completa solo.
                  {isExistingProduct && (
                    <>
                      {" "}
                      El número de existencias ya no se edita aquí — usa{" "}
                      <Link to="/admin/inventario/movimientos" className="underline hover:text-clay">
                        Movimientos
                      </Link>{" "}
                      para registrar entradas/salidas, así queda con fecha y motivo.
                    </>
                  )}
                </p>

                <div>
                  <label className={labelClass}>
                    Fotos {color.imageUrls.length > 0 && `(${color.imageUrls.length})`}
                  </label>
                  <p className="text-xs text-muted">La primera es la foto principal.</p>
                  {color.imageUrls.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {color.imageUrls.map((url, pi) => (
                        <div key={url} className="relative">
                          <img
                            src={url}
                            alt={`${color.name} ${pi + 1}`}
                            className={cn(
                              "h-16 w-16 rounded-lg object-cover",
                              pi === 0 && "ring-2 ring-clay ring-offset-1",
                            )}
                          />
                          <div className="mt-1 flex justify-center gap-1">
                            <button
                              type="button"
                              disabled={pi === 0}
                              onClick={() => moveColorImage(i, pi, -1)}
                              className="text-xs text-muted hover:text-espresso disabled:opacity-30"
                            >
                              ↑
                            </button>
                            <button
                              type="button"
                              disabled={pi === color.imageUrls.length - 1}
                              onClick={() => moveColorImage(i, pi, 1)}
                              className="text-xs text-muted hover:text-espresso disabled:opacity-30"
                            >
                              ↓
                            </button>
                            <button
                              type="button"
                              onClick={() => removeColorImage(i, pi)}
                              className="text-xs text-clay hover:underline"
                            >
                              ✕
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleColorImage(i, file);
                      e.target.value = "";
                    }}
                    className="mt-2 text-sm"
                  />
                </div>

                {colors.length > 1 && (
                  <button
                    type="button"
                    onClick={() => setColors((prev) => prev.filter((_, idx) => idx !== i))}
                    className="ml-auto text-sm text-clay hover:underline"
                  >
                    Quitar
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Galería genérica */}
      <section className="rounded-xl bg-bone p-5">
        <h2 className="font-display text-lg text-espresso">Galería (fotos genéricas)</h2>
        <p className="mt-1 text-[13px] text-muted">
          Se muestran cuando no hay un color seleccionado o el color no tiene foto propia.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          {gallery.map((url, i) => (
            <div key={url} className="relative">
              <img src={url} alt="" className="h-24 w-20 rounded-lg object-cover" />
              <div className="mt-1 flex justify-center gap-1">
                <button
                  type="button"
                  disabled={i === 0}
                  onClick={() => moveGalleryImage(i, -1)}
                  className="text-xs text-muted hover:text-espresso disabled:opacity-30"
                >
                  ↑
                </button>
                <button
                  type="button"
                  disabled={i === gallery.length - 1}
                  onClick={() => moveGalleryImage(i, 1)}
                  className="text-xs text-muted hover:text-espresso disabled:opacity-30"
                >
                  ↓
                </button>
                <button
                  type="button"
                  onClick={() => setGallery((prev) => prev.filter((_, idx) => idx !== i))}
                  className="text-xs text-clay hover:underline"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleGalleryImage(file);
          }}
          className="mt-4 text-sm"
        />
      </section>

      <button
        type="submit"
        disabled={isSubmitting || pendingUploads > 0}
        className="btn btn-clay w-full sm:w-auto"
      >
        {isSubmitting
          ? "Guardando…"
          : pendingUploads > 0
            ? "Subiendo foto…"
            : "Guardar producto"}
      </button>
    </form>
  );
}
