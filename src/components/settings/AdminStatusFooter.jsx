export default function AdminStatusFooter() {
  return (
    <footer className="fixed bottom-0 z-30  flex w-[calc(100%-15rem)] items-center justify-between border-t border-outline-variant/10 bg-inverse-surface px-margin-page py-2 font-spec-label text-[10px] uppercase tracking-widest text-surface-variant">
      <div className="flex gap-6">
        <span className="flex items-center gap-2">
          <span className="h-2 w-2 animate-pulse rounded-full bg-primary" />
          DB_CONNECTED: OK
        </span>
        <span className="flex items-center gap-2 text-on-surface-variant/60">
          <span className="h-2 w-2 rounded-full bg-secondary" />
          API_LATENCY: 42ms
        </span>
      </div>

      <div className="flex gap-4">
        <span className="text-primary-fixed-dim">Uptime: 99.98%</span>
        <span>Version: stable-2026.07.15</span>
      </div>
    </footer>
  );
}
