import { useEffect, useState } from "react";
import { useNavigation } from "react-router";
import { slugify, modeloColorCode } from "~/lib/slug";
import { SIZE_ORDER } from "~/lib/catalog-constants";
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

function emptyColor(): AdminColorInput {
  return {
    name: "",
    hex: "#CCCCCC",
    sizes: SIZE_ORDER.map((size) => ({ size, stock: 0, modelo: null })),
    imageUrl: null,
  };
}

function sizesFor(sizes: SizeStock[]): SizeStock[] {
  return SIZE_ORDER.map(
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

  const [name, setName] = useState(product?.name ?? "");
  const [slug, setSlug] = useState(product?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(product));
  const [category, setCategory] = useState(product?.category ?? "mujer");
  const [kind, setKind] = useState(product?.kind ?? "");
  const [price, setPrice] = useState(product?.price?.toString() ?? "");
  const [compareAt, setCompareAt] = useState(product?.compareAt?.toString() ?? "");
  const [description, setDescription] = useState(product?.description ?? "");
  const [materials, setMaterials] = useState(product?.materials ?? "");
  const [isNew, setIsNew] = useState(product?.isNew ?? false);
  const [isBestseller, setIsBestseller] = useState(product?.isBestseller ?? false);
  // La casilla marcada ES la etiqueta que se ve sobre la foto — un solo dato, no dos
  // campos separados. Si se marcan ambas, "Nuevo" gana (es la más relevante de mostrar).
  const badge = isNew ? "Nuevo" : isBestseller ? "Best-seller" : "";
  const [colors, setColors] = useState<AdminColorInput[]>(
    product?.colors.map((c) => ({ ...c, sizes: sizesFor(c.sizes) })) ?? [emptyColor()],
  );
  const [gallery, setGallery] = useState<string[]>(product?.gallery ?? []);
  const [uploadError, setUploadError] = useState<string | null>(null);
  // Cuenta subidas de foto en curso — sin esto, "Guardar" podía enviar el
  // formulario antes de que terminara una subida y la foto se perdía en silencio.
  const [pendingUploads, setPendingUploads] = useState(0);
  const [modeloBase, setModeloBase] = useState(() => guessModeloBase(product?.colors ?? []));

  // productId de referencia para subir fotos: el producto ya guardado, o un slug
  // provisional derivado del nombre mientras se crea uno nuevo.
  const uploadProductId = productId || slugify(name) || "borrador";

  // Completa automáticamente el modelo (código-color-talla) de cualquier talla dada de
  // alta (con stock) que todavía no tenga uno, usando el código base de arriba. Nunca
  // pisa un modelo que el admin ya escribió a mano.
  useEffect(() => {
    if (!modeloBase) return;
    setColors((prev) => {
      let changed = false;
      const next = prev.map((c) => {
        const colorCode = modeloColorCode(c.name || "");
        const sizes = c.sizes.map((s) => {
          if (s.stock > 0 && !s.modelo && colorCode) {
            changed = true;
            return { ...s, modelo: `${modeloBase}-${colorCode}-${s.size}` };
          }
          return s;
        });
        return { ...c, sizes };
      });
      return changed ? next : prev;
    });
  }, [modeloBase, colors]);

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

  const updateModelo = (colorIndex: number, size: SizeStock["size"], modelo: string) => {
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
      updateColor(index, { imageUrl: url });
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Falló la subida");
    } finally {
      setPendingUploads((n) => n - 1);
    }
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

      {/* Modelo (código base) */}
      <section className="rounded-xl bg-bone p-5">
        <h2 className="font-display text-lg text-espresso">Modelo</h2>
        <p className="mt-1 text-[13px] text-muted">
          Código base (ej. el número del Excel/proveedor). Al dar de alta un color y su
          stock por talla, se completa solo el modelo de esa talla como{" "}
          <span className="font-medium">CÓDIGO-COLOR-TALLA</span> — puedes editarlo
          manualmente en cualquier talla si necesitas otro valor.
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
            </div>
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
            onClick={() => setColors((prev) => [...prev, emptyColor()])}
            className="btn btn-outline px-4 py-2 text-[13px]"
          >
            + Agregar color
          </button>
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
                  {color.sizes.map((s) => (
                    <div key={s.size}>
                      <label className="text-xs text-muted">{s.size}</label>
                      <input
                        type="number"
                        min="0"
                        value={s.stock}
                        onChange={(e) => updateStock(i, s.size, Number(e.target.value))}
                        className={cn(inputClass, "mt-1 w-16")}
                      />
                      <input
                        type="text"
                        placeholder="modelo"
                        title="Código de modelo (código-color-talla)"
                        value={s.modelo ?? ""}
                        onChange={(e) => updateModelo(i, s.size, e.target.value)}
                        className={cn(inputClass, "mt-1 w-24 text-xs")}
                      />
                    </div>
                  ))}
                </div>

                <div>
                  <label className={labelClass}>Foto</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleColorImage(i, file);
                    }}
                    className="mt-1.5 text-sm"
                  />
                  {color.imageUrl && (
                    <img
                      src={color.imageUrl}
                      alt={color.name}
                      className="mt-2 h-16 w-16 rounded-lg object-cover"
                    />
                  )}
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
