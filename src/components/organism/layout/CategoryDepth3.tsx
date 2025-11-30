import { CategoryNode } from "@/app/[locale]/(site)/(pages)/contents/category/categoryNode";

interface CategoryDepth3Props {
  items: CategoryNode[];
  selected?: string;
  onSelect?: (key: string, index: number) => void; 
}

export default function CategoryDepth3({ items, selected, onSelect }: CategoryDepth3Props) {
  return (
    <div
      className="flex flex-row flex-wrap justify-center gap-1 py-2"
      style={{
        rowGap: 2,
        columnGap: 2,
      }}
    >
      {items.map((item, idx) => (
        <button
          key={item.key}
          className={`px-2 py-1 rounded border text-xs font-medium transition
            ${selected === item.key
              ? "bg-blue-600 text-white border-blue-600"
              : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-orange-50"}
          `}
          style={{
            minWidth: "auto",
            minHeight: "auto",
            lineHeight: 1.2,
            padding: "2px 8px",
            margin: 0,
          }}
          onClick={() => onSelect?.(item.key, idx)}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
