import type { Route } from "./+types/admin.upload";
import { requireAdmin } from "~/lib/session.server";
import { supabaseAdmin } from "~/lib/supabase.server";
import { slugify } from "~/lib/slug";

const MAX_SIZE_BYTES = 8 * 1024 * 1024;
const ALLOWED_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/avif": "avif",
};
const BUCKET = "product-images";

export async function action({ request }: Route.ActionArgs) {
  await requireAdmin(request);

  if (request.method !== "POST") {
    return Response.json({ error: "Método no permitido" }, { status: 405 });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return Response.json({ error: "multipart/form-data inválido" }, { status: 400 });
  }

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return Response.json({ error: "Se requiere un archivo" }, { status: 400 });
  }
  if (file.size > MAX_SIZE_BYTES) {
    return Response.json({ error: "Archivo demasiado grande (máx 8 MB)" }, { status: 413 });
  }
  const ext = ALLOWED_TYPES[file.type];
  if (!ext) {
    return Response.json(
      { error: `Tipo de archivo no soportado. Permitidos: ${Object.keys(ALLOWED_TYPES).join(", ")}` },
      { status: 415 },
    );
  }

  const productId = String(formData.get("productId") || "");
  const kind = String(formData.get("kind") || ""); // "generic" | "color"
  const colorName = String(formData.get("colorName") || "");
  if (!/^[a-z0-9-]+$/.test(productId)) {
    return Response.json({ error: "productId inválido" }, { status: 400 });
  }

  const key =
    kind === "color" && colorName
      ? `${productId}/${slugify(colorName)}.${ext}`
      : `${productId}/generic-${Date.now()}.${ext}`;

  const buffer = new Uint8Array(await file.arrayBuffer());
  const { error: uploadError } = await supabaseAdmin.storage
    .from(BUCKET)
    .upload(key, buffer, { contentType: file.type, upsert: true });
  if (uploadError) {
    console.error("[admin.upload] Falló la subida:", uploadError);
    return Response.json({ error: "Falló la subida" }, { status: 500 });
  }

  const { data } = supabaseAdmin.storage.from(BUCKET).getPublicUrl(key);
  return Response.json({ url: data.publicUrl });
}
