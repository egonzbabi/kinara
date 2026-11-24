import { redirect } from "react-router";
import type { Route } from "./+types/admin.productos.nuevo";
import { requireAdmin } from "~/lib/session.server";
import { createProduct, type AdminProductInput } from "~/lib/admin-catalog.server";
import { ProductForm } from "~/components/admin/ProductForm";
import {
  getComingSoonForAdmin,
  productDraftFromComingSoon,
  removeAfterProductCreated,
} from "~/lib/coming-soon-admin.server";

export function meta(_: Route.MetaArgs) {
  return [{ title: "Nuevo producto · Admin · KINARA" }];
}

// Si viene de "Próximamente" (?proximamente=<id>), el formulario arranca con el
// nombre, el slug y la foto de esa prenda (tarea 152).
export async function loader({ request }: Route.LoaderArgs) {
  await requireAdmin(request);
  const comingSoonId = new URL(request.url).searchParams.get("proximamente");
  const item = comingSoonId ? await getComingSoonForAdmin(comingSoonId) : null;
  if (!item) return { comingSoonId: null, draft: null };
  const { name, slug, photo } = productDraftFromComingSoon(item);
  const draft: AdminProductInput = {
    name,
    slug,
    category: "mujer",
    kind: "",
    price: 0,
    compareAt: null,
    description: null,
    materials: null,
    badge: null,
    isNew: true,
    isBestseller: false,
    isOnSale: false,
    showReducedSizesNotice: true,
    colors: [],
    gallery: [photo],
  };
  return { comingSoonId: item.id, draft };
}

export async function action({ request }: Route.ActionArgs) {
  const { adminId, adminName } = await requireAdmin(request);
  const form = await request.formData();

  const compareAtRaw = String(form.get("compareAt") || "");
  const input: AdminProductInput = {
    name: String(form.get("name") || ""),
    slug: String(form.get("slug") || ""),
    category: String(form.get("category") || "mujer") as AdminProductInput["category"],
    kind: String(form.get("kind") || ""),
    price: Number(form.get("price") || 0),
    compareAt: compareAtRaw ? Number(compareAtRaw) : null,
    description: String(form.get("description") || "") || null,
    materials: String(form.get("materials") || "") || null,
    badge: String(form.get("badge") || "") || null,
    isNew: form.get("isNew") === "on",
    isBestseller: form.get("isBestseller") === "on",
    isOnSale: form.get("isOnSale") === "on",
    showReducedSizesNotice: form.get("showReducedSizesNotice") === "on",
    colors: JSON.parse(String(form.get("colors_json") || "[]")),
    gallery: JSON.parse(String(form.get("gallery_json") || "[]")),
  };

  if (!input.name || !input.slug || !input.kind || !input.price) {
    return { error: "Completa nombre, slug, tipo y precio." };
  }

  let id: string;
  try {
    id = await createProduct(input, { adminId, adminName });
  } catch (err) {
    return { error: err instanceof Error ? err.message : "No se pudo crear el producto." };
  }

  // Si venía de "Próximamente", la prenda ya es producto: se quita de esa sección,
  // pero solo tras comprobar que el producto quedó de verdad en el catálogo. Un
  // fallo aquí no tumba el alta (el producto ya existe); la prenda se queda en
  // Próximamente y se borra a mano.
  const comingSoonId = String(form.get("comingSoonId") || "");
  if (comingSoonId) {
    const removed = await removeAfterProductCreated(comingSoonId, id);
    if (!removed.ok) console.error("[proximamente] no se quitó tras el alta:", removed.error);
  }

  // ?editado= le indica a la lista (admin.productos.tsx) a qué fila hacer scroll
  // y resaltar — el scroll se hace ahí con JS, no con un #hash (ScrollRestoration
  // de React Router no llega a mirar el hash en una carga con datos de SSR).
  throw redirect(`/admin/productos?editado=${id}`);
}

export default function AdminProductNew({ loaderData, actionData }: Route.ComponentProps) {
  return (
    <ProductForm
      product={loaderData.draft}
      comingSoonId={loaderData.comingSoonId ?? undefined}
      error={actionData?.error}
    />
  );
}
