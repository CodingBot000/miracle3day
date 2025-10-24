import Image from "next/image";;

interface CategoryDepth1Props {
  title: string;
  categories: { key: string; label: string; icon: string }[]; 
  selected: string;
  onSelect: (key: string) => void;
}

export default function CategoryDepth1({ title, categories, selected, onSelect }: CategoryDepth1Props) {
  return (
    <div className="w-full">
      <h2 className="text-sm md:text-base font-bold mb-1 text-gray-700 pl-2">{title}</h2>
      <div className="grid gap-[2px] p-0 m-0 grid-cols-[repeat(auto-fit,minmax(64px,1fr))] justify-items-center">
        {categories.map((cat) => (
          <div
            key={cat.key}
            className={`flex flex-col items-center cursor-pointer transition
              ${selected === cat.key ? "border-b-4 border-orange-400 bg-orange-50" : "hover:bg-orange-100"}
              rounded-sm py-0 px-0 m-0 w-full`}
            onClick={() => onSelect(cat.key)}
          >
            <Image
              src={cat.icon}
              width={44}
              height={44}
              alt={cat.label}
              className="m-0 p-0"
            />
            <span
              className={`mt-0.5 text-xs font-semibold truncate ${selected === cat.key ? "text-orange-600" : ""}`}
              style={{ maxWidth: "90%" }}
            >
              {cat.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
