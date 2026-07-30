import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import type { Route } from "./+types/checkout";
import { useCart } from "~/context/CartContext";
import { formatPrice } from "~/lib/formatPrice";
import { cn } from "~/lib/cn";

export function meta(_: Route.MetaArgs) {
  return [{ title: "Finalizar compra · KINARA" }];
}

type Address = {
  name: string;
  email: string;
  phone: string;
  street1: string;
  postalCode: string;
  areaLevel1: string;
  areaLevel2: string;
  areaLevel3: string;
};

const EMPTY_ADDRESS: Address = {
  name: "",
  email: "",
  phone: "",
  street1: "",
  postalCode: "",
  areaLevel1: "",
  areaLevel2: "",
  areaLevel3: "",
};

type Rate = {
  providerName: string;
  providerDisplayName: string;
  serviceName: string;
  serviceCode: string;
  total: number;
  currency: string;
  days: number | null;
};

type PostalCodeLookup =
  | { found: true; estado: string; municipio: string; colonias: string[] }
  | { found: false };

const inputClass =
  "mt-1.5 w-full rounded-lg border border-line bg-bone px-3 py-2.5 text-sm text-espresso focus:border-clay focus:outline-none";
const labelClass = "text-sm font-medium text-espresso";

export default function Checkout() {
  const { items, subtotal, hydrated } = useCart();
  const navigate = useNavigate();

  const [address, setAddress] = useState<Address>(EMPTY_ADDRESS);
  const [attempted, setAttempted] = useState(false);

  const [cpLookup, setCpLookup] = useState<PostalCodeLookup | null>(null);
  const [cpLoading, setCpLoading] = useState(false);

  const [rates, setRates] = useState<Rate[] | null>(null);
  const [selectedCode, setSelectedCode] = useState<string | null>(null);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [quoteError, setQuoteError] = useState<string | null>(null);

  const [payLoading, setPayLoading] = useState(false);
  const [payError, setPayError] = useState<string | null>(null);

  useEffect(() => {
    if (hydrated && items.length === 0) navigate("/tienda");
  }, [hydrated, items.length, navigate]);

  // Autocompleta Estado/Municipio y convierte Colonia en lista desplegable en
  // cuanto el CP resuelve contra el catálogo de SEPOMEX (tarea 029) — evita
  // que se mande a Skydropx una combinación colonia/municipio/estado que no
  // corresponde al CP real.
  useEffect(() => {
    const cp = address.postalCode;
    if (!/^\d{5}$/.test(cp)) {
      setCpLookup(null);
      return;
    }
    let cancelled = false;
    setCpLoading(true);
    fetch(`/api/postal-code?cp=${cp}`)
      .then((res) => res.json())
      .then((data: PostalCodeLookup) => {
        if (cancelled) return;
        setCpLookup(data);
        if (data.found) {
          setAddress((prev) => {
            if (prev.postalCode !== cp) return prev;
            const colonia = data.colonias.includes(prev.areaLevel3)
              ? prev.areaLevel3
              : data.colonias[0];
            return { ...prev, areaLevel1: data.estado, areaLevel2: data.municipio, areaLevel3: colonia };
          });
        }
      })
      .catch(() => {
        if (!cancelled) setCpLookup(null);
      })
      .finally(() => {
        if (!cancelled) setCpLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [address.postalCode]);

  const updateField = (field: keyof Address, value: string) => {
    setAddress((prev) => ({ ...prev, [field]: value }));
    setRates(null);
    setSelectedCode(null);
  };
  const setField =
    (field: keyof Address) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      updateField(field, e.target.value);

  const missingFields = (Object.keys(EMPTY_ADDRESS) as (keyof Address)[]).filter(
    (field) => !address[field].trim(),
  );

  const onQuote = async () => {
    if (missingFields.length > 0) {
      setAttempted(true);
      return;
    }
    setQuoteLoading(true);
    setQuoteError(null);
    try {
      const res = await fetch("/api/shipping-quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items, address }),
      });
      const data = await res.json();
      if (data.rates) {
        setRates(data.rates);
        setSelectedCode(data.rates[0]?.serviceCode ?? null);
      } else {
        setQuoteError(data.error || "No se pudo cotizar el envío. Intenta de nuevo.");
      }
    } catch {
      setQuoteError("Error de conexión. Intenta de nuevo.");
    } finally {
      setQuoteLoading(false);
    }
  };

  const selectedRate = rates?.find((r) => r.serviceCode === selectedCode) ?? null;

  const onPay = async () => {
    if (!selectedRate) return;
    setPayLoading(true);
    setPayError(null);
    try {
      const res = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items,
          address,
          shipping: {
            providerName: selectedRate.providerName,
            serviceCode: selectedRate.serviceCode,
            total: selectedRate.total,
          },
        }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
        return;
      }
      setPayError(data.error || "No se pudo iniciar el pago. Intenta de nuevo.");
    } catch {
      setPayError("Error de conexión. Intenta de nuevo.");
    } finally {
      setPayLoading(false);
    }
  };

  return (
    <div className="pad flex flex-col gap-8 py-12 sm:py-16">
      <div>
        <h1 className="font-display text-[clamp(30px,4vw,44px)]">Finalizar compra</h1>
        <p className="mt-1 text-muted">
          {items.length} {items.length === 1 ? "artículo" : "artículos"} · Subtotal{" "}
          {formatPrice(subtotal)}
        </p>
      </div>

      <section className="rounded-xl bg-bone p-5">
        <h2 className="font-display text-lg text-espresso">Dirección de envío</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass}>Nombre completo</label>
            <input
              value={address.name}
              onChange={setField("name")}
              className={cn(inputClass, attempted && !address.name.trim() && "outline outline-2 outline-offset-2 outline-clay")}
            />
          </div>
          <div>
            <label className={labelClass}>Email</label>
            <input
              type="email"
              value={address.email}
              onChange={setField("email")}
              className={cn(inputClass, attempted && !address.email.trim() && "outline outline-2 outline-offset-2 outline-clay")}
            />
          </div>
          <div>
            <label className={labelClass}>Teléfono</label>
            <input
              value={address.phone}
              onChange={setField("phone")}
              className={cn(inputClass, attempted && !address.phone.trim() && "outline outline-2 outline-offset-2 outline-clay")}
            />
          </div>
          <div>
            <label className={labelClass}>Código postal</label>
            <input
              value={address.postalCode}
              onChange={setField("postalCode")}
              inputMode="numeric"
              maxLength={5}
              className={cn(inputClass, attempted && !address.postalCode.trim() && "outline outline-2 outline-offset-2 outline-clay")}
            />
            {cpLoading && <p className="mt-1 text-[12px] text-muted">Buscando código postal…</p>}
            {cpLookup?.found === false && address.postalCode.length === 5 && (
              <p className="mt-1 text-[12px] text-clay">
                No encontramos ese código postal — verifica Colonia/Municipio/Estado manualmente.
              </p>
            )}
          </div>
          <div className="sm:col-span-2">
            <label className={labelClass}>Calle y número</label>
            <input
              value={address.street1}
              onChange={setField("street1")}
              className={cn(inputClass, attempted && !address.street1.trim() && "outline outline-2 outline-offset-2 outline-clay")}
            />
          </div>
          <div>
            <label className={labelClass}>Colonia</label>
            {cpLookup?.found ? (
              <select
                value={address.areaLevel3}
                onChange={(e) => updateField("areaLevel3", e.target.value)}
                className={cn(inputClass, attempted && !address.areaLevel3.trim() && "outline outline-2 outline-offset-2 outline-clay")}
              >
                {cpLookup.colonias.map((colonia) => (
                  <option key={colonia} value={colonia}>
                    {colonia}
                  </option>
                ))}
              </select>
            ) : (
              <input
                value={address.areaLevel3}
                onChange={setField("areaLevel3")}
                className={cn(inputClass, attempted && !address.areaLevel3.trim() && "outline outline-2 outline-offset-2 outline-clay")}
              />
            )}
          </div>
          <div>
            <label className={labelClass}>Alcaldía / Municipio</label>
            <input
              value={address.areaLevel2}
              onChange={setField("areaLevel2")}
              readOnly={cpLookup?.found === true}
              className={cn(
                inputClass,
                cpLookup?.found === true && "cursor-not-allowed bg-line/40 text-muted",
                attempted && !address.areaLevel2.trim() && "outline outline-2 outline-offset-2 outline-clay",
              )}
            />
          </div>
          <div>
            <label className={labelClass}>Estado</label>
            <input
              value={address.areaLevel1}
              onChange={setField("areaLevel1")}
              readOnly={cpLookup?.found === true}
              className={cn(
                inputClass,
                cpLookup?.found === true && "cursor-not-allowed bg-line/40 text-muted",
                attempted && !address.areaLevel1.trim() && "outline outline-2 outline-offset-2 outline-clay",
              )}
            />
          </div>
        </div>

        <button
          onClick={onQuote}
          disabled={quoteLoading}
          className="btn btn-ink mt-5"
        >
          {quoteLoading ? "Cotizando…" : "Ver opciones de envío"}
        </button>
        {quoteError && (
          <p className="mt-2 rounded-lg bg-clay/10 px-4 py-3 text-sm text-clay" role="alert">
            {quoteError}
          </p>
        )}
      </section>

      {rates && rates.length > 0 && (
        <section className="rounded-xl bg-bone p-5">
          <h2 className="font-display text-lg text-espresso">Método de envío</h2>
          <div className="mt-4 flex flex-col gap-2">
            {rates.map((rate) => (
              <label
                key={rate.serviceCode}
                className={cn(
                  "flex cursor-pointer items-center justify-between gap-3 rounded-lg border px-4 py-3",
                  selectedCode === rate.serviceCode
                    ? "border-espresso bg-espresso/5"
                    : "border-line hover:border-espresso",
                )}
              >
                <span className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="shipping-rate"
                    checked={selectedCode === rate.serviceCode}
                    onChange={() => setSelectedCode(rate.serviceCode)}
                  />
                  <span>
                    <span className="block text-sm font-medium text-espresso">
                      {rate.providerDisplayName} · {rate.serviceName}
                    </span>
                    {rate.days != null && (
                      <span className="block text-[13px] text-muted">
                        Entrega estimada: {rate.days} {rate.days === 1 ? "día" : "días"}
                      </span>
                    )}
                  </span>
                </span>
                <span className="whitespace-nowrap font-medium">{formatPrice(rate.total)}</span>
              </label>
            ))}
          </div>

          <button
            onClick={onPay}
            disabled={!selectedRate || payLoading}
            className="btn btn-clay mt-5 w-full sm:w-auto"
          >
            {payLoading ? "Redirigiendo…" : "Pagar"}
          </button>
          {payError && (
            <p className="mt-2 rounded-lg bg-clay/10 px-4 py-3 text-sm text-clay" role="alert">
              {payError}
            </p>
          )}
        </section>
      )}
    </div>
  );
}
