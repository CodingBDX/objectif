/** Squelettes « fantômes » : mêmes formes que les vraies cartes, avec un reflet qui passe, le temps que les profils arrivent. */
export function SkeletonCards({ n = 9 }: { n?: number }) {
  return (
    <div className="gut" role="status" aria-busy="true" aria-label="Chargement des profils">
      <div className="grid skg" aria-hidden="true">
        {Array.from({ length: n }, (_, i) => (
          <div className="card skc" key={i} style={{ animationDelay: `${(i % 6) * 90}ms` }}>
            <div className="cover sk" />
            <div className="skb"><div className="sk sk-t" /><div className="sk sk-l" style={{ width: "55%" }} /><div className="sk sk-l" style={{ width: "72%" }} />
              <div style={{ display: "flex", gap: 8 }}><span className="sk sk-p" /><span className="sk sk-p" /></div></div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function SkeletonProfile() {
  return (
    <div className="gut" role="status" aria-busy="true" aria-label="Chargement du profil">
      <div className="skpf" aria-hidden="true">
        <div className="sk skpf-img" />
        <div className="skpf-info">
          <div className="sk sk-h" style={{ width: "70%" }} />
          <div className="sk sk-l" style={{ width: "45%" }} />
          <div className="sk sk-btn" /><div className="sk sk-l" style={{ width: "92%" }} /><div className="sk sk-l" style={{ width: "84%" }} /><div className="sk sk-l" style={{ width: "60%" }} />
        </div>
      </div>
    </div>
  );
}
