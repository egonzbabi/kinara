import { redirect } from "react-router";
import type { Route } from "./+types/admin.productos.nuevo";
import { requireAdmin } from "~/lib/session.server";
import { createProduct, type AdminProductInput } from "~/lib/admin-catalog.server";
import { ProductForm } from "~/components/admin/ProductForm";

export function meta(_: Route.MetaArgs) {
  return [{ title: "Nuevo producto · Admin · KINARA" }];
}

export async function loader({ request }: Route.LoaderArgs) {
  await requireAdmin(request);
  return null;
}

export async function action({ request }: Route.ActionArgs) {
  await requireAdmin(request);
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
    colors: JSON.parse(String(form.get("colors_json") || "[]")),
    gallery: JSON.parse(String(form.get("gallery_json") || "[]")),
  };

  if (!input.name || !input.slug || !input.kind || !input.price) {
    return { error: "Completa nombre, slug, tipo y precio." };
  }

  try {
    await createProduct(input);
  } catch (err) {
    return { error: err instanceof Error ? err.message : "No se pudo crear el producto." };
  }

  throw redirect("/admin/productos");
}

export default function AdminProductNew({ actionData }: Route.ComponentProps) {
  return <ProductForm product={null} error={actionData?.error} />;
}
