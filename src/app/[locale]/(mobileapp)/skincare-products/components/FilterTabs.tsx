'use client';

export type FilterTabType = 'category' | 'skin_concern' | 'age';

interface FilterTabsProps {
  activeTab: FilterTabType;
  onTabChange: (tab: FilterTabType) => void;
  locale: string;
}

const tabLabels = {
  ko: {
    category: '카테고리',
    skin_concern: '피부고민',
    age: '연령대',
  },
  en: {
    category: 'Category',
    skin_concern: 'Skin Concern',
    age: 'Age Group',
  },
};

export default function FilterTabs({ activeTab, onTabChange, locale }: FilterTabsProps) {
  const labels = tabLabels[locale as keyof typeof tabLabels] || tabLabels.en;

  const tabs: { key: FilterTabType; label: string }[] = [
    { key: 'category', label: labels.category },
    { key: 'skin_concern', label: labels.skin_concern },
    { key: 'age', label: labels.age },
  ];

  return (
    <div className="flex bg-gray-100 rounded-lg p-1">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => onTabChange(tab.key)}
          className={`flex-1 py-2 px-3 text-sm font-medium rounded-md transition-all ${
            activeTab === tab.key
              ? 'bg-white text-pink-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
