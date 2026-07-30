import type { Route } from "./+types/api.postal-code";
import { supabaseAdmin } from "~/lib/supabase.server";

export type PostalCodeLookup =
  | { found: true; estado: string; municipio: string; colonias: string[] }
  | { found: false };

export async function loader({ request }: Route.LoaderArgs): Promise<Response> {
  const cp = new URL(request.url).searchParams.get("cp")?.trim() ?? "";
  if (!/^\d{5}$/.test(cp)) {
    return Response.json({ found: false } satisfies PostalCodeLookup, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from("postal_codes")
    .select("colonia, municipio, estado")
    .eq("postal_code", cp)
    .order("colonia", { ascending: true });

  if (error || !data || data.length === 0) {
    return Response.json({ found: false } satisfies PostalCodeLookup);
  }

  const result: PostalCodeLookup = {
    found: true,
    estado: data[0].estado,
    municipio: data[0].municipio,
    colonias: data.map((r) => r.colonia),
  };
  return Response.json(result);
}
