import { Tr } from "@/lib/i18n";

export const FAQ: [string, string][] = [
  ["Qui peut s’inscrire sur Sex-Escorte ?", "Toute personne majeure qui détient les droits de ses images et vidéos. Le site est strictement réservé aux adultes."],
  ["L’inscription est-elle gratuite ?", "Oui. Créer un profil est gratuit. L’option VIP (mise en avant, plusieurs tarifs, profil vérifié) est payante."],
  ["Comment vérifier un client avant un rendez-vous ?", "Les profils peuvent saisir un numéro de téléphone dans « Vérifier un client » pour savoir s’il a déjà été signalé par d’autres profils."],
  ["Comment le site protège-t-il les escortes ?", "Les profils signalés peuvent être masqués, les arnaqueurs sont bannis, et le site refuse tout réseau de proxénétisme ainsi que toute exploitation de mineurs."],
  ["Puis-je mettre mon profil en pause ?", "Oui, en un clic depuis ton espace. Tes photos restent à toi et tu peux les retirer quand tu veux."],
];

/** FAQ visible + données structurées FAQPage (schema.org). */
export default function Faq() {
  const ld = { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: FAQ.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })) };
  return (
    <section className="panel" aria-labelledby="faqh" style={{ display: "grid", gap: 8 }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld).replace(/</g, "\\u003c") }} />
      <h2 id="faqh" style={{ font: "700 clamp(22px,4vw,28px) var(--fd)", margin: 0 }}><Tr k="Questions fréquentes" /></h2>
      {FAQ.map(([q, a]) => <details key={q} className="faqd"><summary><Tr k={q} /></summary><p className="note" style={{ margin: "6px 0 0" }}><Tr k={a} /></p></details>)}
    </section>
  );
}
