export default function StatCard({ value, label, subtext, color, icon, statId }) {
  return (
    <div className="group relative overflow-hidden rounded border border-border bg-white p-6">
      <div className="absolute right-0 top-0 p-2 opacity-10">
        <span className="material-symbols-outlined text-6xl">{icon}</span>
      </div>
      <div className="font-display-lg text-display-lg mb-4 leading-none" style={{ color }}>
        {value}
      </div>
      <div className="font-spec-label text-spec-label mb-1 block uppercase text-on-surface">{label}</div>
      <div className="font-body-md text-sm text-secondary">{subtext}</div>
      <div className="font-price-display absolute bottom-2 right-2 text-xs text-border transition-colors group-hover:text-primary">
        {statId}
      </div>
    </div>
  );
}
