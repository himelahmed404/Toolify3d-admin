const printers = [
  {
    name: 'Bambu Lab X1-01',
    id: 'PR-0092-BAMBU',
    status: '[PRINTING]',
    statusClass: 'bg-primary-container text-on-primary-container',
    progress: 68,
    progressClass: 'bg-primary w-2/3',
    left: 'Progress: 68%',
    right: 'ETR: 02:14:00',
    error: false,
  },
  {
    name: 'Prusa MK4-01',
    id: 'PR-0044-PRUSA',
    status: '[ONLINE]',
    statusClass: 'bg-surface-variant text-on-surface-variant',
    progress: 0,
    progressClass: 'bg-transparent w-0',
    left: 'Idle',
    right: 'Ready',
    error: false,
  },
  {
    name: 'Bambu Lab X1-02',
    id: 'PR-0093-BAMBU',
    status: '[PRINTING]',
    statusClass: 'bg-primary-container text-on-primary-container',
    progress: 18,
    progressClass: 'bg-primary w-1/5',
    left: 'Progress: 18%',
    right: 'ETR: 14:45:12',
    error: false,
  },
  {
    name: 'Ender 3 S1-05',
    id: 'PR-0112-ENDER',
    status: '[OFFLINE]',
    statusClass: 'bg-error text-white',
    progress: 100,
    progressClass: 'bg-error w-full',
    left: 'Thermal Runaway',
    right: 'Check Sensor',
    error: true,
  },
];

export default function PrinterFarmGrid() {
  return (
    <section className="admin-reveal space-y-6">
      <span className="system-label">// FARM_STATUS_REALTIME</span>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {printers.map((printer) => (
          <div
            key={printer.id}
            className={`technical-border space-y-4 bg-white p-6 transition-all ${
              printer.error
                ? 'border-error/30'
                : 'group hover:border-primary'
            }`}
          >
            <div className="flex items-start justify-between">
              <div
                className={`flex h-12 w-12 items-center justify-center ${
                  printer.error
                    ? 'bg-error/10 text-error'
                    : 'bg-surface-container transition-colors group-hover:bg-primary group-hover:text-white'
                }`}
              >
                <span className="material-symbols-outlined">
                  {printer.error ? 'warning' : 'print'}
                </span>
              </div>
              <span className={`px-2 py-1 text-[10px] font-bold ${printer.statusClass}`}>
                {printer.status}
              </span>
            </div>

            <div>
              <h3 className="font-headline-sm text-lg uppercase">{printer.name}</h3>
              <p className="font-spec-label text-[10px] text-on-surface-variant/60">ID: {printer.id}</p>
            </div>

            <div className={`h-1 overflow-hidden ${printer.error ? 'bg-error/10' : 'bg-surface-container'}`}>
              <div className={`h-full ${printer.progressClass}`} />
            </div>

            <div
              className={`flex justify-between font-spec-label text-[10px] uppercase ${
                printer.error ? 'text-error' : ''
              }`}
            >
              <span>{printer.left}</span>
              <span>{printer.right}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
