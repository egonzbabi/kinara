import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLocation,
} from "react-router";

import type { Route } from "./+types/root";
import "./app.css";
import { CartProvider } from "~/context/CartContext";
import { AnnouncementBar } from "~/components/AnnouncementBar";
import { SiteNav } from "~/components/SiteNav";
import { SiteFooter } from "~/components/SiteFooter";
import { CartDrawer } from "~/components/CartDrawer";

export const links: Route.LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  { rel: "preconnect", href: "https://images.unsplash.com" },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;0,9..144,600;1,9..144,400&family=Hanken+Grotesk:wght@400;500;600;700&display=swap",
  },
];

export const meta: Route.MetaFunction = () => [
  { title: "KINARA · Ropa deportiva con alma" },
  {
    name: "description",
    content:
      "Athleisure técnico hecho para moverse y para vivir. Tejidos suaves, siluetas favorecedoras, color cálido. Nueva colección SS26.",
  },
];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#e9e1d4" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith("/admin");

  if (isAdmin) {
    return (
      <CartProvider>
        <Outlet />
      </CartProvider>
    );
  }

  return (
    <CartProvider>
      <AnnouncementBar />
      <SiteNav />
      <main id="contenido">
        <Outlet />
      </main>
      <SiteFooter />
      <CartDrawer />
    </CartProvider>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Algo salió mal";
  let details = "Ha ocurrido un error inesperado.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details =
      error.status === 404
        ? "No encontramos la página que buscas."
        : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main className="pad flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
      <h1 className="font-display text-[clamp(48px,10vw,120px)] leading-none">
        {message}
      </h1>
      <p className="text-muted">{details}</p>
      <a href="/" className="btn btn-clay mt-2">
        Volver al inicio
      </a>
      {stack && (
        <pre className="mt-6 w-full max-w-3xl overflow-x-auto rounded-xl bg-bone p-4 text-left text-xs">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
}
