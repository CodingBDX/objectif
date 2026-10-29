/** IndexNow : prévient Bing, Yandex, Naver et Seznam qu'une page est nouvelle ou modifiée (Google ne participe pas). Sans la variable INDEXNOW_KEY, ne fait rien. */
import { siteUrl } from "./site";

export async function pingIndexNow(urls: string[]): Promise<boolean> {
  const key = process.env.INDEXNOW_KEY;
  if (!key || !urls.length) return false;
  const base = siteUrl();
  try {
    const r = await fetch("https://api.indexnow.org/indexnow", {
      method: "POST", headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({ host: new URL(base).host, key, keyLocation: `${base}/${key}.txt`, urlList: urls.slice(0, 10000) }),
      signal: AbortSignal.timeout(3000)
    });
    return r.ok || r.status === 202;
  } catch { return false; }
}
