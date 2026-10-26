// Illustrations des profils d'exemple (aucune vraie personne) : /api/demo/12-0.svg
const PAL = [["#ffb3d1","#ff7eb6","#ffe0ec"],["#d9b8ff","#ff9ccf","#ffe4f1"],["#ffc4a8","#ff8fa8","#ffe9d6"],["#a8d8ff","#e3a8ff","#ffe0f3"],["#ffd1e8","#c58bff","#fff0f7"],["#ffcf9e","#ff8fb8","#ffeadb"]];
const rnd = (s: number) => () => { s |= 0; s = (s + 0x6d2b79f5) | 0; let t = Math.imul(s ^ (s >>> 15), 1 | s); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
export async function GET(_: Request, { params }: { params: { k: string } }) {
  const [a, b] = params.k.replace(/\.svg$/, "").split("-").map((x) => parseInt(x) || 0);
  const seed = a * 10 + b, r = rnd(seed * 7 + 3), p = PAL[Math.abs(seed) % PAL.length];
  let s = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 500"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${p[0]}"/><stop offset="1" stop-color="${p[1]}"/></linearGradient></defs><rect width="400" height="500" fill="url(#g)"/>`;
  for (let i = 0; i < 7; i++) s += `<circle cx="${r() * 400}" cy="${r() * 500}" r="${30 + r() * 100}" fill="${p[2]}" opacity="${0.15 + r() * 0.35}"/>`;
  s += `<path d="M0 ${330 + r() * 60} Q 120 ${260 + r() * 70} 220 ${340 + r() * 50} T 400 ${320 + r() * 60} V500 H0Z" fill="#fff" opacity=".3"/></svg>`;
  return new Response(s, { headers: { "Content-Type": "image/svg+xml", "Cache-Control": "public, max-age=31536000, immutable" } });
}
