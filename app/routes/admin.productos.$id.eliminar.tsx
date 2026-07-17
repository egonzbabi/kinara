import { redirect } from "react-router";
import type { Route } from "./+types/admin.productos.$id.eliminar";
import { requireAdmin } from "~/lib/session.server";
import { deleteProduct } from "~/lib/admin-catalog.server";

export async function action({ request, params }: Route.ActionArgs) {
  await requireAdmin(request);
  await deleteProduct(params.id);
  throw redirect("/admin/productos");
}
