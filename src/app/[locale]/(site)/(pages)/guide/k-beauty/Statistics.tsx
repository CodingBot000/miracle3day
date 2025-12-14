import Image from "next/image";


interface StatItem {
  value: string;
  label: string;
}

interface Props {
  title: string;
data: Record<string, StatItem>;
  image?: string;
}

export default function Statistics({ title, data, image }: Props) {
  return (
    <section className="my-20 py-16 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 rounded-3xl shadow-xl">
      <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-900" style={{ fontFamily: "'Inter', 'Pretendard', sans-serif" }}>
        {title}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 px-8 lg:px-12">
        {Object.entries(data).map(([key, stat]) => (
          <div key={key} className="text-center bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition-shadow">
            <div className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-3" style={{ fontFamily: "'Inter', 'Pretendard', sans-serif" }}>
              {stat.value}
            </div>
            <div className="text-sm md:text-base text-gray-700 leading-snug" style={{ fontFamily: "'Crimson Pro', 'Noto Serif KR', serif" }}>
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      {image && (
        <div className="mt-12 px-8 lg:px-12">
          <div className="relative w-full aspect-video rounded-2xl overflow-hidden shadow-lg">
            <Image
              src={image}
              alt="Statistics visualization"
              fill
              className="object-contain"
            />
          </div>
        </div>
      )}
    </section>
  );
}
