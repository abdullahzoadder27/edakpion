const TABS = ['NEW ARRIVAL', 'BEST SELLER', 'TRENDING', 'PREMIUM', 'DISCOUNTED'];

interface CategoryTabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export function CategoryTabs({ activeTab, setActiveTab }: CategoryTabsProps) {
  return (
    <div className="max-w-7xl mx-auto px-6 mb-8 overflow-x-auto">
      <div className="flex gap-4 min-w-max pb-2">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-2.5 rounded text-xs font-bold tracking-widest transition-colors border ${
              activeTab === tab
                ? 'bg-[var(--color-brand-dark)] text-white border-[var(--color-brand-dark)]'
                : 'bg-transparent text-gray-600 border-[#e8e4d9] hover:border-gray-400'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>
    </div>
  );
}
