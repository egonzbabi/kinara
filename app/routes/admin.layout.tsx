import { Outlet, useLocation } from "react-router";
import type { Route } from "./+types/admin.layout";
import { requireAdmin } from "~/lib/session.server";
import { AdminSidebar } from "~/components/admin/AdminSidebar";
import { AdminTopbar } from "~/components/admin/AdminTopbar";

const TITLES: Record<string, string> = {
  "/admin/productos": "Productos",
  "/admin/productos/nuevo": "Nuevo producto",
  "/admin/pedidos": "Pedidos",
};

export async function loader({ request }: Route.LoaderArgs) {
  const { adminName } = await requireAdmin(request);
  return { adminName };
}

export default function AdminLayout({ loaderData }: Route.ComponentProps) {
  const location = useLocation();
  const title =
    TITLES[location.pathname] ??
    (location.pathname.startsWith("/admin/productos/") ? "Editar producto" : "Admin");

  return (
    <div className="min-h-screen bg-sand lg:flex">
      <AdminSidebar />
      <div className="flex-1">
        <AdminTopbar title={title} adminName={loaderData.adminName} />
        <main className="p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
