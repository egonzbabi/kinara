import { useState } from "react";
import { useFetcher } from "react-router";
import type { Route } from "./+types/admin.promotoras";
import { requireAdmin } from "~/lib/session.server";
import {
  createPromoter,
  listPromotersForAdmin,
  updatePromoter,
} from "~/lib/promoter-codes.server";
import {
  DEFAULT_PROMOTER_PERCENT,
  MAX_PROMOTER_PERCENT,
  MIN_PROMOTER_PERCENT,
  PROMOTER_CODES_START_LABEL,
} from "~/lib/discount-constants";
import { formatPrice } from "~/lib/formatPrice";
import { cn } from "~/lib/cn";

export function meta(_: Route.MetaArgs) {
  return [{ title: "Promotoras · Admin · KINARA" }];
}

export async function loader({ request }: Route.LoaderArgs) {
  await requireAdmin(request);
  const promoters = await listPromotersForAdmin();
  return { promoters };
}

type ActionResult = { ok: true } | { ok: false; error: string };

export async function action({ request }: Route.ActionArgs): Promise<ActionResult> {
  await requireAdmin(request);
  const form = await request.formData();
  const intent = String(form.get("intent") ?? "");

  if (intent === "create") {
    return createPromoter(
      String(form.get("identifier") ?? ""),
      String(form.get("name") ?? ""),
      String(form.get("percent") ?? ""),
    );
  }
  if (intent === "rename") {
    return updatePromoter(String(form.get("code") ?? ""), { name: String(form.get("name") ?? "") });
  }
  if (intent === "toggle") {
    return updatePromoter(String(form.get("code") ?? ""), {
      active: form.get("active") === "true",
    });
  }
  return { ok: false, error: "Acción no válida." };
}

const inputClass =
  "w-full rounded-lg border border-line bg-white px-3 py-2 text-sm text-espresso focus:border-clay focus:outline-none focus:ring-2 focus:ring-clay/30";

function CreateForm() {
  const fetcher = useFetcher<ActionResult>();
  const busy = fetcher.state !== "idle";
  const error = fetcher.data && !fetcher.data.ok ? fetcher.data.error : null;

  return (
    <fetcher.Form
      method="post"
      className="rounded-xl bg-bone p-5"
      key={fetcher.data?.ok ? "ok" : "idle"}
    >
      <input type="hidden" name="intent" value="create" />
      <h3 className="text-sm font-medium text-espresso">Nueva promotora</h3>
      <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="sm:w-44">
          <label htmlFor="promo-identifier" className="text-[13px] text-muted">
            Identificador
          </label>
          <input
            id="promo-identifier"
            name="identifier"
            required
            maxLength={20}
            placeholder="ej. ANA o P01"
            autoComplete="off"
            className={cn(inputClass, "font-mono uppercase")}
          />
        </div>
        <div className="sm:w-32">
          <label htmlFor="promo-percent" className="text-[13px] text-muted">
            Descuento (%)
          </label>
          <input
            id="promo-percent"
            name="percent"
            type="number"
            inputMode="numeric"
            required
            min={MIN_PROMOTER_PERCENT}
            max={MAX_PROMOTER_PERCENT}
            step={1}
            defaultValue={DEFAULT_PROMOTER_PERCENT}
            className={inputClass}
          />
        </div>
        <div className="sm:flex-1">
          <label htmlFor="promo-name" className="text-[13px] text-muted">
            Nombre (opcional, lo puedes llenar después)
          </label>
          <input
            id="promo-name"
            name="name"
            maxLength={80}
            autoComplete="off"
            className={inputClass}
          />
        </div>
        <button type="submit" disabled={busy} className="btn btn-clay sm:w-auto">
          {busy ? "Creando…" : "Crear código"}
        </button>
      </div>
      <p className="mt-2 text-[13px] text-muted">
        El código lleva el descuento y el identificador, por ejemplo{" "}
        <span className="font-mono">KINARA20-ANA</span> da 20%. El descuento queda fijo en ese
        código: para darle otro porcentaje a la misma promotora, crea un código nuevo y apaga el
        anterior.
      </p>
      {error && (
        <p className="mt-2 rounded-lg bg-clay/10 px-3 py-2 text-sm text-clay" role="alert">
          {error}
        </p>
      )}
    </fetcher.Form>
  );
}

function PromoterRow({ p }: { p: Route.ComponentProps["loaderData"]["promoters"][number] }) {
  const rename = useFetcher<ActionResult>();
  const toggle = useFetcher<ActionResult>();
  const [copied, setCopied] = useState(false);
  const [showQr, setShowQr] = useState(false);

  const active = toggle.formData ? toggle.formData.get("active") === "true" : p.active;

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(p.link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt("Copia el enlace:", p.link);
    }
  }

  return (
    <li className="rounded-xl bg-bone p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p className="flex flex-wrap items-center gap-2 text-sm text-espresso">
            <span className="font-mono">{p.code}</span>
            <span className="rounded-full bg-espresso/5 px-2.5 py-0.5 text-[12px] font-semibold">
              {p.percent}% de descuento
            </span>
          </p>
          <rename.Form method="post" className="mt-2 flex max-w-md gap-2">
            <input type="hidden" name="intent" value="rename" />
            <input type="hidden" name="code" value={p.code} />
            <label htmlFor={`name-${p.code}`} className="sr-only">
              Nombre de la promotora {p.code}
            </label>
            <input
              id={`name-${p.code}`}
              name="name"
              defaultValue={p.name}
              placeholder="Nombre de la promotora"
              maxLength={80}
              className={inputClass}
            />
            <button
              type="submit"
              disabled={rename.state !== "idle"}
              className="btn btn-outline whitespace-nowrap"
            >
              {rename.state !== "idle" ? "Guardando…" : "Guardar"}
            </button>
          </rename.Form>
          {rename.data && !rename.data.ok && (
            <p className="mt-1 text-[13px] text-clay" role="alert">
              {rename.data.error}
            </p>
          )}
        </div>

        <div className="text-right">
          <p className="text-sm text-espresso">
            {p.orders} {p.orders === 1 ? "pedido" : "pedidos"}
          </p>
          <p className="text-[13px] text-muted">{formatPrice(p.salesTotal)} vendidos</p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <button type="button" onClick={copyLink} className="btn btn-outline">
          {copied ? "Enlace copiado" : "Copiar enlace"}
        </button>
        <button
          type="button"
          onClick={() => setShowQr((v) => !v)}
          aria-expanded={showQr}
          className="btn btn-outline"
        >
          {showQr ? "Ocultar QR" : "Ver QR"}
        </button>
        <a
          href={`/admin/promotoras/qr?code=${encodeURIComponent(p.code)}`}
          download
          className="btn btn-outline"
        >
          Descargar QR
        </a>
        <toggle.Form method="post" className="ml-auto">
          <input type="hidden" name="intent" value="toggle" />
          <input type="hidden" name="code" value={p.code} />
          <input type="hidden" name="active" value={String(!active)} />
          <button
            type="submit"
            className={cn(
              "inline-flex rounded-full px-3 py-1.5 text-[12px] font-semibold",
              active ? "bg-sage/10 text-espresso" : "bg-clay/10 text-clay",
            )}
            title={active ? "Toca para apagar este código" : "Toca para volver a encenderlo"}
          >
            {active ? "Activo" : "Apagado"}
          </button>
        </toggle.Form>
      </div>

      {showQr && (
        <div className="mt-4 flex flex-wrap items-center gap-4">
          <div
            className="h-44 w-44 rounded-lg bg-white p-2 [&>svg]:h-full [&>svg]:w-full"
            role="img"
            aria-label={`Código QR de ${p.code}`}
            // SVG generado por nosotros en el servidor a partir de un enlace propio.
            dangerouslySetInnerHTML={{ __html: p.qrSvg }}
          />
          <p className="max-w-md break-all text-[12px] text-muted">{p.link}</p>
        </div>
      )}
    </li>
  );
}

export default function AdminPromotoras({ loaderData }: Route.ComponentProps) {
  const { promoters } = loaderData;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="font-display text-2xl text-espresso">Promotoras</h2>
        <p className="mt-1 max-w-2xl text-sm text-muted">
          Cada promotora tiene su código, con el descuento que tú elijas, en productos sin precio
          tachado, desde el {PROMOTER_CODES_START_LABEL}, una vez por correo. El QR y el enlace
          llevan a la tienda con el código ya cargado, y aquí ves cuánto vendió cada una.
        </p>
      </div>

      <CreateForm />

      {promoters.length === 0 ? (
        <p className="rounded-xl bg-bone p-8 text-center text-sm text-muted">
          Todavía no hay promotoras. Crea la primera arriba.
        </p>
      ) : (
        <ul className="flex flex-col gap-4">
          {promoters.map((p) => (
            <PromoterRow key={p.code} p={p} />
          ))}
        </ul>
      )}
    </div>
  );
}
