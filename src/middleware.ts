import { NextRequest, NextResponse } from "next/server";
import { AI_BOTS } from "@/lib/aiBots";

/** Bloque (403) les robots de copie qui s'identifient (Firecrawl, GPTBot…). Les moteurs de recherche (Google, Bing…) ne sont pas touchés.
 *  Un robot qui ment sur son identité n'est pas arrêté ici : c'est le rôle de Cloudflare / Turnstile. */
const RE = new RegExp(AI_BOTS.filter((b) => !/^(Google-Extended|Applebot-Extended|GoogleOther)$/.test(b)).map((b) => b.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|"), "i");
export function middleware(req: NextRequest) {
  if (RE.test(req.headers.get("user-agent") || "")) return new NextResponse("Accès refusé aux robots de copie.", { status: 403, headers: { "content-type": "text/plain; charset=utf-8" } });
  return NextResponse.next();
}
export const config = { matcher: ["/((?!_next/static|_next/image|favicon.ico|icon|apple-icon|robots.txt|sitemap.xml).*)"] };
