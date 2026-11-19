import type { Route } from "./+types/admin.promotoras.qr";
import { requireAdmin } from "~/lib/session.server";
import { findPromoterCode, promoterQrPng } from "~/lib/promoter-codes.server";

// Descarga el QR de una promotora como PNG (1024 px). Solo con sesión de admin.
export async function loader({ request }: Route.LoaderArgs) {
  await requireAdmin(request);
  const code = new URL(request.url).searchParams.get("code") ?? "";
  const promoter = await findPromoterCode(code);
  if (!promoter) return new Response("Código no encontrado", { status: 404 });

  const png = await promoterQrPng(promoter.code);
  return new Response(new Uint8Array(png), {
    headers: {
      "Content-Type": "image/png",
      "Content-Disposition": `attachment; filename="qr-${promoter.code.toLowerCase()}.png"`,
      "Cache-Control": "private, no-store",
    },
  });
}
