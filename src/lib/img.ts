/** Les photos et vidéos des profils sont servies par le site lui-même (/media/…, derrière Cloudflare)
 *  au lieu de l'adresse Supabase : les règles anti-robots de Cloudflare et le robots.txt s'appliquent aussi aux médias. */
const PUB = "/storage/v1/object/public/media/";
export const mediaUrl = (u: string) => {
  if (!u) return u;
  const i = u.indexOf(PUB);
  return i >= 0 && /^https?:\/\//.test(u) ? "/media/" + u.slice(i + PUB.length) : u;
};
/** Passe toutes les adresses de médias d'un profil par le site. */
export const proxyMedia = (p: { photos: string[]; video: string | null }): void => {
  if (Array.isArray(p.photos)) p.photos = p.photos.map(mediaUrl);
  if (p.video) p.video = mediaUrl(p.video);
};

/** Adresse de la miniature (640 px) d'une photo envoyée sur le site ; sinon l'image elle-même. */
export const thumbUrl = (u: string) => {
  const m = mediaUrl(u);
  return (m.startsWith("/media/") || m.includes(PUB)) && m.endsWith(".webp") && !m.endsWith("-t.webp") ? m.replace(/\.webp$/, "-t.webp") : m;
};
