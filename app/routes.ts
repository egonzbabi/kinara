import {
  type RouteConfig,
  index,
  route,
  layout,
} from "@react-router/dev/routes";

export default [
  index("routes/_index.tsx"),
  route("tienda", "routes/tienda.tsx"),
  route("producto/:slug", "routes/producto.$slug.tsx"),

  route("admin", "routes/admin.login.tsx"),
  route("admin/logout", "routes/admin.logout.tsx"),
  route("admin/upload", "routes/admin.upload.tsx"),
  layout("routes/admin.layout.tsx", [
    route("admin/productos", "routes/admin.productos.tsx"),
    route("admin/productos/nuevo", "routes/admin.productos.nuevo.tsx"),
    route("admin/productos/:id", "routes/admin.productos.$id.tsx"),
    route("admin/productos/:id/eliminar", "routes/admin.productos.$id.eliminar.tsx"),
    route("admin/pedidos", "routes/admin.pedidos.tsx"),
  ]),

  route("api/create-checkout-session", "routes/api.create-checkout-session.tsx"),
  route("api/shipping-quote", "routes/api.shipping-quote.tsx"),
  route("api/stripe-webhook", "routes/api.stripe-webhook.tsx"),
  route("checkout", "routes/checkout.tsx"),
  route("checkout/success", "routes/checkout.success.tsx"),
  route("checkout/cancelado", "routes/checkout.cancelado.tsx"),
] satisfies RouteConfig;
