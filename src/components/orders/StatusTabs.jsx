const tabs = [
  { key: 'pending', label: 'PENDING', countKey: 'pending', color: '#D97706' },
  { key: 'in-progress', label: 'PRINTING', countKey: 'inProgress' },
  { key: 'packaging', label: 'PACKAGING', countKey: 'packaging' },
  { key: 'shipped', label: 'SHIPPED', countKey: 'shipped' },
  { key: 'rejected', label: 'REJECTED', countKey: 'rejected' },
];

export default function StatusTabs({ activeTab, onTabChange, counts = {} }) {
  return (
    <div className="technical-border mb-stack-lg flex w-full border-b border-outline-variant bg-white p-1 font-spec-label text-sm overflow-x-auto">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.key;
        const count = counts[tab.countKey] ?? 0;

        return (
          <button
            key={tab.key}
            type="button"
            onClick={() => onTabChange(tab.key)}
            className={
              isActive
                ? 'min-w-[140px] flex-1 border border-warning/50 bg-warning/10 py-3 text-center font-bold text-warning whitespace-nowrap'
                : 'min-w-[140px] flex-1 py-3 text-center text-secondary transition-none hover:bg-surface-variant whitespace-nowrap'
            }
          >
            {tab.label} ({count})
          </button>
        );
      })}
    </div>
  );
}
