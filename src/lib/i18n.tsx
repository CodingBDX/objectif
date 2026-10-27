"use client";
import { useEffect, useState } from "react";
import { DICT } from "./dict";

export type Lang = "fr" | "en" | "es";
const KEY = "hp_lang";
let cur: Lang = "fr";
const subs = new Set<() => void>();
const stored = (): Lang => { try { const s = localStorage.getItem(KEY); if (s === "en" || s === "es" || s === "fr") return s; } catch {} return "fr"; };
export function setLang(l: Lang) { cur = l; try { localStorage.setItem(KEY, l); } catch {} try { document.documentElement.lang = l; } catch {} subs.forEach((f) => f()); }

/** Traduction : la clé est le texte français ; sans traduction connue, le français est affiché. {x} est remplacé par vars.x. */
export function useT() {
  const [lang, setL] = useState<Lang>("fr");
  useEffect(() => { const f = () => setL(cur); subs.add(f); cur = stored(); try { document.documentElement.lang = cur; } catch {} f(); return () => { subs.delete(f); }; }, []);
  const tr = (s: string, vars?: Record<string, string | number>) => {
    let o = lang === "fr" ? s : DICT[s]?.[lang === "en" ? 0 : 1] || s;
    if (vars) for (const k of Object.keys(vars)) o = o.split(`{${k}}`).join(String(vars[k]));
    return o;
  };
  return { tr, lang };
}

export function LangSwitch() {
  const { lang } = useT();
  return (
    <div className="langsw" role="group" aria-label="Langue / Language / Idioma">
      {(["fr", "en", "es"] as Lang[]).map((l) => <button key={l} type="button" className={lang === l ? "on" : ""} aria-pressed={lang === l} onClick={() => setLang(l)}>{l.toUpperCase()}</button>)}
    </div>
  );
}
