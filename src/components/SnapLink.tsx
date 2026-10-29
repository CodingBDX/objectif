"use client";
import { useState } from "react";
import { TrackLink } from "./Track";
import { useT } from "@/lib/i18n";
import { MSG_KEY } from "@/lib/contactMsg";

/** Snapchat ne permet pas de pré-écrire un message : on copie le message prêt à envoyer, puis on ouvre le profil Snapchat. */
export default function SnapLink({ id, skip, href, name, path, children }: { id: string; skip?: boolean; href: string; name: string; path: string; children: React.ReactNode }) {
  const { tr } = useT(); const [done, setDone] = useState(false);
  function copy() {
    try {
      const o = location.origin;
      const msg = tr(MSG_KEY, { n: name, h: o, u: o + path });
      navigator.clipboard.writeText(msg).then(() => { setDone(true); setTimeout(() => setDone(false), 5000); }).catch(() => {});
    } catch {}
  }
  return <>
    <TrackLink id={id} kind="social" skip={skip} className="soc" href={href} target="_blank" rel="noopener noreferrer" aria-label={`Snapchat de ${name}`} title="Snapchat" onClick={copy}>{children}</TrackLink>
    {done && <span className="snaptoast" role="status">{tr("Message copié : colle-le dans la conversation Snapchat")}</span>}
  </>;
}
