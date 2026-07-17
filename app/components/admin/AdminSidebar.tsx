import { NavLink, Link } from "react-router";
import { cn } from "~/lib/cn";

export function AdminSidebar() {
  return (
    <aside className="w-full shrink-0 border-b border-line bg-bone lg:w-56 lg:border-b-0 lg:border-r">
      <div className="flex h-full flex-col lg:min-h-screen">
        <div className="px-5 py-5">
          <span className="font-display text-lg text-espresso">KINARA</span>
          <span className="ml-2 text-xs tracking-wide text-muted">ADMIN</span>
        </div>

        <nav className="flex-1 px-3">
          <NavLink
            to="/admin/productos"
            className={({ isActive }) =>
              cn(
                "block rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive ? "bg-clay/10 text-clay" : "text-espresso hover:bg-sand",
              )
            }
          >
            Productos
          </NavLink>
          <NavLink
            to="/admin/pedidos"
            className={({ isActive }) =>
              cn(
                "block rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive ? "bg-clay/10 text-clay" : "text-espresso hover:bg-sand",
              )
            }
          >
            Pedidos
          </NavLink>
        </nav>

        <div className="border-t border-line px-3 py-4">
          <Link
            to="/"
            className="block rounded-lg px-3 py-2.5 text-sm text-muted transition-colors hover:bg-sand hover:text-espresso"
          >
            ← Volver a la tienda
          </Link>
        </div>
      </div>
    </aside>
  );
}
