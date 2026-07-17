import { redirect } from "react-router";
import type { Route } from "./+types/admin.productos.$id";
import { requireAdmin } from "~/lib/session.server";
import { getAdminProductById, updateProduct, type AdminProductInput } from "~/lib/admin-catalog.server";
import { ProductForm } from "~/components/admin/ProductForm";

export function meta(_: Route.MetaArgs) {
  return [{ title: "Editar producto · Admin · KINARA" }];
}

export async function loader({ request, params }: Route.LoaderArgs) {
  await requireAdmin(request);
  const product = await getAdminProductById(params.id);
  if (!product) {
    throw new Response("No encontrado", { status: 404 });
  }
  return { product };
}

export async function action({ request, params }: Route.ActionArgs) {
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
    await updateProduct(params.id, input);
  } catch (err) {
    return { error: err instanceof Error ? err.message : "No se pudo actualizar el producto." };
  }

  throw redirect("/admin/productos");
}

export default function AdminProductEdit({ loaderData, actionData, params }: Route.ComponentProps) {
  return <ProductForm product={loaderData.product} productId={params.id} error={actionData?.error} />;
}
