import { useEffect, useState } from "react";
import { hexToRgbTriplet } from "~/lib/hexToRgbTriplet";

const SOLAR_OPTIONS = ["#FF5B1F", "#FFC233", "#FF2E63", "#3DD68C", "#5C7AFF"];
const THEME_OPTIONS: Array<{ value: "light" | "dark"; label: string }> = [
  { value: "light", label: "Claro" },
  { value: "dark", label: "Oscuro" },
];
const ON_OFF: Array<{ value: "on" | "off"; label: string }> = [
  { value: "on", label: "On" },
  { value: "off", label: "Off" },
];

type TweakState = {
  solar: string;
  theme: "light" | "dark";
  cursor: "on" | "off";
  grain: "on" | "off";
};

const DEFAULTS: TweakState = {
  solar: "#FF5B1F",
  theme: "light",
  cursor: "on",
  grain: "on",
};

function applyTweak<K extends keyof TweakState>(k: K, v: TweakState[K]) {
  if (k === "solar") {
    document.documentElement.style.setProperty("--color-solar", v as string);
    document.documentElement.style.setProperty(
      "--solar-glow",
      hexToRgbTriplet(v as string),
    );
  }
  if (k === "theme") {
    document.body.classList.toggle("theme-dark", v === "dark");
  }
  if (k === "cursor") {
    const w = window as unknown as { __setCursor?: (on: boolean) => void };
    w.__setCursor?.(v === "on");
  }
  if (k === "grain") {
    const grain = document.querySelector<HTMLElement>(".grain");
    if (grain) grain.style.display = v === "on" ? "" : "none";
  }
}

function isEnabled(): boolean {
  if (import.meta.env.DEV) return true;
  if (typeof window === "undefined") return false;
  return new URLSearchParams(window.location.search).has("tweaks");
}

export function TweaksPanel() {
  const [enabled, setEnabled] = useState(false);
  const [shown, setShown] = useState(true);
  const [state, setState] = useState<TweakState>(DEFAULTS);

  useEffect(() => {
    setEnabled(isEnabled());
  }, []);

  useEffect(() => {
    if (!enabled) return;
    const onMessage = (e: MessageEvent) => {
      const t = (e.data as { type?: string } | null)?.type;
      if (t === "__activate_edit_mode") setShown(true);
      if (t === "__deactivate_edit_mode") setShown(false);
    };
    window.addEventListener("message", onMessage);
    try {
      window.parent.postMessage({ type: "__edit_mode_available" }, "*");
    } catch {
      /* standalone — ignore */
    }
    return () => window.removeEventListener("message", onMessage);
  }, [enabled]);

  // re-apply on every state change so initial defaults take effect too
  useEffect(() => {
    if (!enabled) return;
    (Object.keys(state) as Array<keyof TweakState>).forEach((k) =>
      applyTweak(k, state[k]),
    );
  }, [enabled, state]);

  if (!enabled) return null;

  const persist = (edits: Partial<TweakState>) => {
    try {
      window.parent.postMessage({ type: "__edit_mode_set_keys", edits }, "*");
    } catch {
      /* standalone */
    }
  };

  const update = <K extends keyof TweakState>(k: K, v: TweakState[K]) => {
    setState((s) => ({ ...s, [k]: v }));
    persist({ [k]: v } as Partial<TweakState>);
  };

  const close = () => {
    setShown(false);
    try {
      window.parent.postMessage({ type: "__edit_mode_dismissed" }, "*");
    } catch {
      /* standalone */
    }
  };

  if (!shown) return null;

  return (
    <aside
      className="tweaks fixed bottom-[18px] right-[18px] z-[100] w-[296px] rounded-[14px] border border-ink bg-bone p-4 font-mono text-[12px] text-ink shadow-[0_24px_60px_rgb(0_0_0_/_0.18)]"
    >
      <div className="flex items-center justify-between">
        <b className="text-[11px] font-semibold uppercase tracking-[.18em]">
          Tweaks
        </b>
        <span
          className="tweaks-close inline-flex size-[22px] cursor-pointer items-center justify-center rounded-full border border-ink"
          onClick={close}
          title="Cerrar"
        >
          ×
        </span>
      </div>

      <h5 className="mb-2 mt-3.5 text-[11px] font-semibold uppercase tracking-[.2em] opacity-70">
        Color solar
      </h5>
      <div className="flex flex-wrap gap-2">
        {SOLAR_OPTIONS.map((c) => (
          <button
            key={c}
            aria-checked={state.solar === c}
            onClick={() => update("solar", c)}
            className={`size-7 rounded-full border border-line ${
              state.solar === c ? "outline outline-2 outline-offset-[3px] outline-ink" : ""
            }`}
            style={{ background: c }}
          />
        ))}
      </div>

      <h5 className="mb-2 mt-3.5 text-[11px] font-semibold uppercase tracking-[.2em] opacity-70">
        Tema
      </h5>
      <div className="flex flex-wrap gap-2">
        {THEME_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            aria-checked={state.theme === opt.value}
            onClick={() => update("theme", opt.value)}
            className={`twbtn flex-1 rounded-md border border-ink px-2.5 py-2 text-[10px] uppercase tracking-[.16em] ${
              state.theme === opt.value ? "bg-ink text-bone" : "bg-transparent"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <h5 className="mb-2 mt-3.5 text-[11px] font-semibold uppercase tracking-[.2em] opacity-70">
        Cursor solar
      </h5>
      <div className="flex flex-wrap gap-2">
        {ON_OFF.map((opt) => (
          <button
            key={`cu-${opt.value}`}
            aria-checked={state.cursor === opt.value}
            onClick={() => update("cursor", opt.value)}
            className={`twbtn flex-1 rounded-md border border-ink px-2.5 py-2 text-[10px] uppercase tracking-[.16em] ${
              state.cursor === opt.value ? "bg-ink text-bone" : "bg-transparent"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <h5 className="mb-2 mt-3.5 text-[11px] font-semibold uppercase tracking-[.2em] opacity-70">
        Grano
      </h5>
      <div className="flex flex-wrap gap-2">
        {ON_OFF.map((opt) => (
          <button
            key={`g-${opt.value}`}
            aria-checked={state.grain === opt.value}
            onClick={() => update("grain", opt.value)}
            className={`twbtn flex-1 rounded-md border border-ink px-2.5 py-2 text-[10px] uppercase tracking-[.16em] ${
              state.grain === opt.value ? "bg-ink text-bone" : "bg-transparent"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </aside>
  );
}
