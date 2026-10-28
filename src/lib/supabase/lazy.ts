/** Le client Supabase (auth, realtime, edge functions…) pèse lourd : on ne le charge qu'à la demande, jamais pour un simple visiteur. */
export const sbLazy = async () => (await import("./client")).supabaseBrowser();

/** Vrai si une session Supabase existe dans les cookies (les visiteurs anonymes n'ont pas besoin du client). */
export const hasAuthCookie = () => typeof document !== "undefined" && /(?:^|;\s*)sb-[^=;]*-auth-token/.test(document.cookie);
