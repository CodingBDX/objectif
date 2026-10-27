/** Adresse de la miniature (640 px) d'une photo envoyée sur le site ; sinon l'image elle-même. */
export const thumbUrl = (u: string) =>
  u.includes("/storage/v1/object/public/media/") && u.endsWith(".webp") && !u.endsWith("-t.webp") ? u.replace(/\.webp$/, "-t.webp") : u;
