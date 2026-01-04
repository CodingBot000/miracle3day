'use client';

interface ChipOption {
  value: string;
  label_ko: string;
  count?: number;
}

interface ChipFilterProps {
  options: ChipOption[];
  selectedValue: string | null;
  onSelect: (value: string | null) => void;
  allLabel: string;
  locale: string;
}

export default function ChipFilter({
  options,
  selectedValue,
  onSelect,
  allLabel,
  locale,
}: ChipFilterProps) {
  const getLabel = (option: ChipOption) => {
    return locale === 'ko' ? option.label_ko : option.value;
  };

  return (
    <div className="flex flex-wrap gap-2">
      {/* 전체 버튼 */}
      <button
        onClick={() => onSelect(null)}
        className={`px-3 py-1.5 text-sm rounded-full transition-all ${
          selectedValue === null
            ? 'bg-pink-500 text-white'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }`}
      >
        {allLabel}
      </button>

      {/* 옵션 버튼들 */}
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => onSelect(option.value)}
          className={`px-3 py-1.5 text-sm rounded-full transition-all ${
            selectedValue === option.value
              ? 'bg-pink-500 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {getLabel(option)}
          {option.count !== undefined && (
            <span className="ml-1 opacity-70">({option.count})</span>
          )}
        </button>
      ))}
    </div>
  );
}
