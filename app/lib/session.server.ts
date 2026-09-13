import "dotenv/config";
import { createCookieSessionStorage, redirect } from "react-router";
import type { SessionStorage } from "react-router";
import { supabaseAdmin } from "./supabase.server";

let _sessionStorage: SessionStorage | null = null;

function getSessionStorage(): SessionStorage {
  if (_sessionStorage) return _sessionStorage;

  const sessionSecret = process.env.SESSION_SECRET;
  if (!sessionSecret && process.env.NODE_ENV === "production") {
    // Un secreto predecible haría las cookies de sesión de admin falsificables.
    throw new Error(
      "SESSION_SECRET debe estar definido en producción — las sesiones de admin están deshabilitadas hasta entonces.",
    );
  }

  _sessionStorage = createCookieSessionStorage({
    cookie: {
      name: "__kinara_admin",
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 7, // 7 días
      path: "/",
      sameSite: "lax",
      secrets: [sessionSecret || "dev-secret-change-in-production"],
      secure: process.env.NODE_ENV === "production",
    },
  });
  return _sessionStorage;
}

export async function createAdminSession(adminId: string, adminName: string) {
  const session = await getSessionStorage().getSession();
  session.set("adminId", adminId);
  session.set("adminName", adminName);
  return redirect("/admin/productos", {
    headers: { "Set-Cookie": await getSessionStorage().commitSession(session) },
  });
}

export async function getAdminSession(request: Request) {
  const session = await getSessionStorage().getSession(request.headers.get("Cookie"));
  return {
    adminId: session.get("adminId") as string | undefined,
    adminName: session.get("adminName") as string | undefined,
  };
}

export async function requireAdmin(request: Request) {
  const { adminId, adminName } = await getAdminSession(request);
  if (!adminId) throw redirect("/admin");

  // Verificar que el admin todavía existe — una cookie firmada no basta si se
  // revocó el acceso (fila borrada de la tabla admins).
  const { data: admin, error } = await supabaseAdmin
    .from("admins")
    .select("id")
    .eq("id", adminId)
    .maybeSingle();

  // Un error de la consulta (hiccup de red, función serverless recién
  // despertada, timeout puntual de Supabase) NO significa que el acceso fue
  // revocado — antes se trataba igual que "admin no encontrado" y se cerraba
  // la sesión, lo que sacaba al admin al login en medio de una edición larga
  // (tarea 108: cuanto más tiempo pasa entre requests, más probable que la
  // siguiente encuentre la función fría y esta consulta falle). La cookie
  // firmada ya es prueba suficiente para dejarlo continuar esta vez; si el
  // acceso sí fue revocado de verdad, la próxima consulta que sí funcione lo
  // va a atrapar.
  if (error) {
    console.error("requireAdmin: no se pudo verificar el admin, se permite continuar:", error);
    return { adminId, adminName: adminName || "Admin" };
  }

  if (!admin) {
    const session = await getSessionStorage().getSession(request.headers.get("Cookie"));
    throw redirect("/admin", {
      headers: { "Set-Cookie": await getSessionStorage().destroySession(session) },
    });
  }

  return { adminId, adminName: adminName || "Admin" };
}

export async function destroyAdminSession(request: Request) {
  const session = await getSessionStorage().getSession(request.headers.get("Cookie"));
  return redirect("/admin", {
    headers: { "Set-Cookie": await getSessionStorage().destroySession(session) },
  });
}
