import {
  type RouteConfig,
  index,
  route,
} from "@react-router/dev/routes";

export default [
  index("routes/_index.tsx"),
  route("tienda", "routes/tienda.tsx"),
  route("producto/:slug", "routes/producto.$slug.tsx"),
] satisfies RouteConfig;
