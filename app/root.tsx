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
import { CookieConsentBanner } from "~/components/CookieConsentBanner";
import { GA_MEASUREMENT_ID } from "~/lib/analytics";
import { getAllProducts } from "~/lib/catalog";
import { buildShopNavLinks } from "~/lib/nav-links";
import { activeLandings } from "~/lib/shop-landings";

// Los enlaces de tipo de ropa del menú/footer salen del catálogo real (tarea
// 127) — un tipo sin ningún producto (ej. "Legging" si se agota) desaparece
// solo, y uno nuevo (ej. "Vestido") aparece sin tocar código. Se salta la
// consulta en /admin: ese layout no renderiza SiteNav/SiteFooter (ver App()
// abajo), así que sería una consulta a Supabase desperdiciada en cada
// vista del admin.
export async function loader({ request }: Route.LoaderArgs) {
  if (new URL(request.url).pathname.startsWith("/admin")) {
    return { navLinks: [], typePages: [] };
  }
  const products = await getAllProducts();
  return {
    navLinks: buildShopNavLinks(products),
    // Páginas por tipo de prenda (tarea 136) para el pie de página — solo las
    // que tienen productos; "para mujer" se quita del texto del enlace.
    typePages: activeLandings(products).map((l) => ({
      to: `/tienda/${l.slug}`,
      label: l.h1.replace(/ para mujer$/, ""),
    })),
  };
}

export const links: Route.LinksFunction = () => [
  // Favicon con el logo (círculo con la K, tarea 138). Google pide el ícono en
  // múltiplos de 48 px; el .ico cubre navegadores viejos y /favicon.ico.
  { rel: "icon", href: "/favicon.ico", sizes: "any" },
  { rel: "icon", type: "image/png", sizes: "48x48", href: "/favicon-48x48.png" },
  { rel: "icon", type: "image/png", sizes: "96x96", href: "/favicon-96x96.png" },
  { rel: "icon", type: "image/png", sizes: "192x192", href: "/favicon-192x192.png" },
  { rel: "apple-touch-icon", sizes: "180x180", href: "/apple-touch-icon.png" },
  { rel: "preconnect", href: "https://images.unsplash.com" },
  {
    rel: "preconnect",
    href: new URL(import.meta.env.VITE_SUPABASE_URL).origin,
    crossOrigin: "anonymous",
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
        {/* Google Analytics 4 (tarea 004) con Consent Mode — solo se carga si
            hay Measurement ID configurado (VITE_GA_MEASUREMENT_ID), nunca
            hardcodeado. El script inline corre ANTES que gtag.js y fija
            `analytics_storage` en "denied" por defecto (o "granted" si el
            visitante ya había aceptado antes, leyendo el mismo localStorage
            que usa CookieConsentBanner/analytics.ts) — sin esto, gtag.js
            mandaría hits con el consentimiento todavía sin definir. `async`
            en el script real: no bloquea el render inicial (regla de
            CLAUDE.md sobre scripts de terceros). */}
        {GA_MEASUREMENT_ID && (
          <>
            <script
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  var kinaraConsent = null;
                  try { kinaraConsent = localStorage.getItem("kinara-cookie-consent"); } catch (e) {}
                  gtag("consent", "default", {
                    analytics_storage: kinaraConsent === "granted" ? "granted" : "denied"
                  });
                  gtag("js", new Date());
                  gtag("config", "${GA_MEASUREMENT_ID}");
                `,
              }}
            />
            <script
              async
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
            />
          </>
        )}
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App({ loaderData }: Route.ComponentProps) {
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
      <SiteNav links={loaderData.navLinks} />
      <main id="contenido">
        <Outlet />
      </main>
      <SiteFooter links={loaderData.navLinks} typePages={loaderData.typePages} />
      <CartDrawer />
      <CookieConsentBanner />
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
