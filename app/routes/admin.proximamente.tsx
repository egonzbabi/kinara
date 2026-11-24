import { useRef, useState } from "react";
import { Link, useFetcher } from "react-router";
import type { Route } from "./+types/admin.proximamente";
import { requireAdmin } from "~/lib/session.server";
import {
  createComingSoon,
  deleteComingSoon,
  listComingSoonForAdmin,
  moveComingSoon,
  updateComingSoon,
  type AdminComingSoonItem,
} from "~/lib/coming-soon-admin.server";
import { uploadImage } from "~/components/admin/ProductForm";
import { cn } from "~/lib/cn";

export function meta(_: Route.MetaArgs) {
  return [{ title: "Próximamente · Admin · KINARA" }];
}

export async function loader({ request }: Route.LoaderArgs) {
  await requireAdmin(request);
  try {
    return { items: await listComingSoonForAdmin(), loadError: null as string | null };
  } catch (err) {
    // Lo más probable: todavía no se aplicó la migración de la tabla.
    console.error("[admin.proximamente]", err);
    return {
      items: [] as AdminComingSoonItem[],
      loadError:
        "No se pudo cargar Próximamente. Si es la primera vez, falta aplicar la migración coming_soon_items en Supabase.",
    };
  }
}

type ActionResult = { ok: true } | { ok: false; error: string };

export async function action({ request }: Route.ActionArgs): Promise<ActionResult> {
  await requireAdmin(request);
  const form = await request.formData();
  const intent = String(form.get("intent") ?? "");
  const id = String(form.get("id") ?? "");

  switch (intent) {
    case "create":
      return createComingSoon(String(form.get("name") ?? ""), String(form.get("imageUrl") ?? ""));
    case "rename":
      return updateComingSoon(id, { name: String(form.get("name") ?? "") });
    case "toggle":
      return updateComingSoon(id, { active: form.get("active") === "true" });
    case "photo":
      return updateComingSoon(id, { imageUrl: String(form.get("imageUrl") ?? "") });
    case "move":
      return moveComingSoon(id, form.get("direction") === "up" ? "up" : "down");
    case "delete":
      return deleteComingSoon(id);
    default:
      return { ok: false, error: "Acción no válida." };
  }
}

const inputClass =
  "w-full rounded-lg border border-line bg-white px-3 py-2 text-sm text-espresso focus:border-clay focus:outline-none focus:ring-2 focus:ring-clay/30";

/** Sube la foto al Storage (misma ruta que los productos) y devuelve su URL. */
async function uploadComingSoonPhoto(file: File): Promise<string> {
  return uploadImage(file, "proximamente", "generic");
}

function CreateForm() {
  const fetcher = useFetcher<ActionResult>();
  const [name, setName] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const busy = fetcher.state !== "idle";
  const serverError = fetcher.data && !fetcher.data.ok ? fetcher.data.error : null;
  const justSaved = fetcher.state === "idle" && fetcher.data?.ok === true;

  // Al guardar bien, el formulario queda limpio para la siguiente prenda.
  const [lastSaved, setLastSaved] = useState<unknown>(null);
  if (justSaved && lastSaved !== fetcher.data) {
    setLastSaved(fetcher.data);
    setName("");
    setPhotoUrl("");
    if (fileRef.current) fileRef.current.value = "";
  }

  async function onFile(file: File | undefined) {
    if (!file) return;
    setUploading(true);
    setUploadError(null);
    try {
      setPhotoUrl(await uploadComingSoonPhoto(file));
    } catch (err) {
      setPhotoUrl("");
      setUploadError(err instanceof Error ? err.message : "No se pudo subir la foto.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <fetcher.Form method="post" className="rounded-xl bg-bone p-5">
      <input type="hidden" name="intent" value="create" />
      <input type="hidden" name="imageUrl" value={photoUrl} />
      <h3 className="text-sm font-medium text-espresso">Nueva prenda</h3>
      <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-end">
        <div className="sm:flex-1">
          <label htmlFor="cs-name" className="text-[13px] text-muted">
            Nombre
          </label>
          <input
            id="cs-name"
            name="name"
            required
            maxLength={80}
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="off"
            placeholder="ej. Aura Flow Pants"
            className={inputClass}
          />
        </div>
        <div className="sm:flex-1">
          <label htmlFor="cs-photo" className="text-[13px] text-muted">
            Foto
          </label>
          <input
            id="cs-photo"
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif"
            onChange={(e) => onFile(e.target.files?.[0])}
            className="block w-full text-sm text-espresso file:mr-3 file:rounded-lg file:border-0 file:bg-sand file:px-3 file:py-2 file:text-sm file:font-medium file:text-espresso"
          />
        </div>
        <button
          type="submit"
          disabled={busy || uploading || !photoUrl || !name.trim()}
          className="btn btn-clay sm:w-auto"
        >
          {busy ? "Guardando…" : "Agregar a Próximamente"}
        </button>
      </div>

      {(uploading || photoUrl) && (
        <div className="mt-3 flex items-center gap-3">
          {photoUrl ? (
            <img src={photoUrl} alt="Vista previa" className="h-24 w-[76px] rounded-lg object-cover object-top" />
          ) : null}
          <p className="text-[13px] text-muted">{uploading ? "Subiendo foto…" : "Foto lista."}</p>
        </div>
      )}
      <p className="mt-2 text-[13px] text-muted">
        La foto se recorta en vertical (4:5) en la tarjeta; al abrirla en grande se ve completa.
      </p>
      {(uploadError || serverError) && (
        <p className="mt-2 rounded-lg bg-clay/10 px-3 py-2 text-sm text-clay" role="alert">
          {uploadError || serverError}
        </p>
      )}
    </fetcher.Form>
  );
}

function ItemRow({
  item,
  index,
  total,
}: {
  item: AdminComingSoonItem;
  index: number;
  total: number;
}) {
  const rename = useFetcher<ActionResult>();
  const toggle = useFetcher<ActionResult>();
  const move = useFetcher<ActionResult>();
  const photo = useFetcher<ActionResult>();
  const remove = useFetcher<ActionResult>();
  const [photoBusy, setPhotoBusy] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const photoRef = useRef<HTMLInputElement>(null);

  const active = toggle.formData ? toggle.formData.get("active") === "true" : item.active;
  const error = [rename, toggle, move, photo, remove]
    .map((f) => (f.data && !f.data.ok ? f.data.error : null))
    .find(Boolean);

  async function onPhoto(file: File | undefined) {
    if (!file) return;
    setPhotoBusy(true);
    setPhotoError(null);
    try {
      const url = await uploadComingSoonPhoto(file);
      photo.submit({ intent: "photo", id: item.id, imageUrl: url }, { method: "post" });
    } catch (err) {
      setPhotoError(err instanceof Error ? err.message : "No se pudo subir la foto.");
    } finally {
      setPhotoBusy(false);
      if (photoRef.current) photoRef.current.value = "";
    }
  }

  return (
    <li className={cn("rounded-xl bg-bone p-5", !active && "opacity-80")}>
      <div className="flex flex-wrap gap-5">
        <img
          src={item.src}
          srcSet={item.srcSet}
          sizes="120px"
          alt={item.name}
          className={cn("h-36 w-28 shrink-0 rounded-lg object-cover object-top", !active && "grayscale")}
        />

        <div className="min-w-0 flex-1">
          <rename.Form method="post" className="flex max-w-md gap-2">
            <input type="hidden" name="intent" value="rename" />
            <input type="hidden" name="id" value={item.id} />
            <label htmlFor={`cs-name-${item.id}`} className="sr-only">
              Nombre de la prenda
            </label>
            <input
              id={`cs-name-${item.id}`}
              name="name"
              defaultValue={item.name}
              required
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

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <toggle.Form method="post">
              <input type="hidden" name="intent" value="toggle" />
              <input type="hidden" name="id" value={item.id} />
              <input type="hidden" name="active" value={String(!active)} />
              <button
                type="submit"
                className={cn(
                  "inline-flex rounded-full px-3 py-1.5 text-[12px] font-semibold",
                  active ? "bg-sage/10 text-espresso" : "bg-clay/10 text-clay",
                )}
                title={active ? "Toca para ocultarla del sitio" : "Toca para mostrarla otra vez"}
              >
                {active ? "Visible en el sitio" : "Oculta"}
              </button>
            </toggle.Form>

            <move.Form method="post" className="flex gap-1">
              <input type="hidden" name="intent" value="move" />
              <input type="hidden" name="id" value={item.id} />
              <button
                type="submit"
                name="direction"
                value="up"
                disabled={index === 0 || move.state !== "idle"}
                aria-label={`Mover ${item.name} antes`}
                className="btn btn-outline px-3 disabled:opacity-40"
              >
                ←
              </button>
              <button
                type="submit"
                name="direction"
                value="down"
                disabled={index === total - 1 || move.state !== "idle"}
                aria-label={`Mover ${item.name} después`}
                className="btn btn-outline px-3 disabled:opacity-40"
              >
                →
              </button>
            </move.Form>

            <input
              ref={photoRef}
              id={`cs-photo-${item.id}`}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/avif"
              className="sr-only"
              onChange={(e) => onPhoto(e.target.files?.[0])}
            />
            <label
              htmlFor={`cs-photo-${item.id}`}
              className="btn btn-outline cursor-pointer whitespace-nowrap"
            >
              {photoBusy || photo.state !== "idle" ? "Subiendo…" : "Cambiar foto"}
            </label>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <Link
              to={`/admin/productos/nuevo?proximamente=${item.id}`}
              className="btn btn-clay whitespace-nowrap"
            >
              Dar de alta como producto
            </Link>
            <remove.Form
              method="post"
              onSubmit={(e) => {
                if (!window.confirm(`¿Borrar "${item.name}" de Próximamente? No se puede deshacer.`)) {
                  e.preventDefault();
                }
              }}
            >
              <input type="hidden" name="intent" value="delete" />
              <input type="hidden" name="id" value={item.id} />
              <button type="submit" className="btn btn-outline whitespace-nowrap text-clay">
                Borrar
              </button>
            </remove.Form>
          </div>

          {(error || photoError) && (
            <p className="mt-3 rounded-lg bg-clay/10 px-3 py-2 text-sm text-clay" role="alert">
              {photoError || error}
            </p>
          )}
        </div>
      </div>
    </li>
  );
}

export default function AdminProximamente({ loaderData }: Route.ComponentProps) {
  const { items, loadError } = loaderData;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="font-display text-2xl text-espresso">Próximamente</h2>
        <p className="mt-1 max-w-2xl text-sm text-muted">
          Las prendas de esta lista salen en la sección "Próximamente" del inicio, en este orden. Al
          hacer clic en una, se ve en grande. Cuando una esté lista para vender, usa{" "}
          <strong>Dar de alta como producto</strong>: se abre el formulario con su nombre y foto, y al
          guardarla pasa a "Lo nuevo" y sale de aquí. Los cambios pueden tardar unos minutos en verse
          en el sitio.
        </p>
      </div>

      {loadError && (
        <p className="rounded-xl bg-clay/10 p-4 text-sm text-clay" role="alert">
          {loadError}
        </p>
      )}

      <CreateForm />

      {items.length === 0 ? (
        !loadError && (
          <p className="rounded-xl bg-bone p-8 text-center text-sm text-muted">
            No hay prendas en Próximamente. Agrega la primera arriba.
          </p>
        )
      ) : (
        <ul className="flex flex-col gap-4">
          {items.map((item, i) => (
            <ItemRow key={item.id} item={item} index={i} total={items.length} />
          ))}
        </ul>
      )}
    </div>
  );
}
