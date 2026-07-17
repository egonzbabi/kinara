import { Form, redirect } from "react-router";
import type { Route } from "./+types/admin.login";
import { getAdminSession, createAdminSession } from "~/lib/session.server";
import { verifyPassword } from "~/lib/auth.server";
import { supabaseAdmin } from "~/lib/supabase.server";

export function meta(_: Route.MetaArgs) {
  return [{ title: "Admin · KINARA" }];
}

export async function loader({ request }: Route.LoaderArgs) {
  const { adminId } = await getAdminSession(request);
  if (adminId) throw redirect("/admin/productos");
  return null;
}

export async function action({ request }: Route.ActionArgs) {
  const form = await request.formData();
  const email = String(form.get("email") || "")
    .trim()
    .toLowerCase();
  const password = String(form.get("password") || "");

  if (!email || !password) {
    return { error: "Ingresa tu correo y contraseña." };
  }

  const { data: admin, error } = await supabaseAdmin
    .from("admins")
    .select("id, name, password_hash")
    .eq("email", email)
    .maybeSingle();

  if (error || !admin || !verifyPassword(password, admin.password_hash)) {
    return { error: "Correo o contraseña incorrectos." };
  }

  return createAdminSession(admin.id, admin.name);
}

export default function AdminLogin({ actionData }: Route.ComponentProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-sand px-4">
      <div className="w-full max-w-sm rounded-2xl bg-bone p-8 shadow-sm">
        <h1 className="font-display text-2xl text-espresso">KINARA Admin</h1>
        <p className="mt-1 text-sm text-muted">Inicia sesión para gestionar el catálogo.</p>

        <Form method="post" className="mt-6 flex flex-col gap-4">
          <div>
            <label htmlFor="email" className="text-sm font-medium text-espresso">
              Correo
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              className="mt-1.5 w-full rounded-lg border border-line bg-sand px-3 py-2.5 text-sm text-espresso focus:border-clay focus:outline-none"
            />
          </div>
          <div>
            <label htmlFor="password" className="text-sm font-medium text-espresso">
              Contraseña
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className="mt-1.5 w-full rounded-lg border border-line bg-sand px-3 py-2.5 text-sm text-espresso focus:border-clay focus:outline-none"
            />
          </div>

          {actionData?.error && (
            <p className="text-[13px] text-clay" role="alert">
              {actionData.error}
            </p>
          )}

          <button type="submit" className="btn btn-clay mt-2 w-full">
            Entrar
          </button>
        </Form>
      </div>
    </div>
  );
}
