"use client";
import { useEffect, useState } from "react";
import { DICT } from "./dict";
import { DICT2 } from "./dict2";
import { DICT3 } from "./dict3";
import { DICT4 } from "./dict4";
import { PT } from "./dict_pt";

export type Lang = "fr" | "en" | "es" | "pt";
const IDX = { en: 0, es: 1, pt: 2 } as const;
export const LOCALE: Record<Lang, string> = { fr: "fr-FR", en: "en-GB", es: "es-ES", pt: "pt-PT" };
const KEY = "hp_lang";
let cur: Lang = "fr";
const subs = new Set<() => void>();
const stored = (): Lang => { try { const s = localStorage.getItem(KEY); if (s === "en" || s === "es" || s === "fr" || s === "pt") return s; } catch {} return "fr"; };
export function setLang(l: Lang) { cur = l; try { localStorage.setItem(KEY, l); } catch {} try { document.documentElement.lang = l; } catch {} subs.forEach((f) => f()); }

/** Traduction : la clé est le texte français ; sans traduction connue, le français est affiché. {x} est remplacé par vars.x. */
export function useT() {
  const [lang, setL] = useState<Lang>("fr");
  useEffect(() => { const f = () => setL(cur); subs.add(f); cur = stored(); try { document.documentElement.lang = cur; } catch {} f(); return () => { subs.delete(f); }; }, []);
  const tr = (s: string, vars?: Record<string, string | number>) => {
    let o = s;
    if (lang !== "fr") { const k = IDX[lang]; o = DICT2[s]?.[k] || DICT3[s]?.[k] || DICT4[s]?.[k] || (lang === "pt" ? PT[s] : DICT[s]?.[k as 0 | 1]) || s; }
    if (vars) for (const k of Object.keys(vars)) o = o.split(`{${k}}`).join(String(vars[k]));
    return o;
  };
  return { tr, lang, locale: LOCALE[lang] };
}

/** Pour les composants serveur : affiche un texte français traduit selon la langue choisie. */
export function Tr({ k, vars }: { k: string; vars?: Record<string, string | number> }) { const { tr } = useT(); return <>{tr(k, vars)}</>; }

export function TDate({ iso }: { iso: string }) { const { locale } = useT(); return <>{new Date(iso).toLocaleDateString(locale, { day: "numeric", month: "long", year: "numeric", timeZone: "Europe/Paris" })}</>; }

export function LangSwitch() {
  const { lang } = useT();
  return (
    <div className="langsw" role="group" aria-label="Langue / Language / Idioma">
      {(["fr", "en", "es", "pt"] as Lang[]).map((l) => <button key={l} type="button" className={lang === l ? "on" : ""} aria-pressed={lang === l} onClick={() => setLang(l)}>{l.toUpperCase()}</button>)}
    </div>
  );
}
