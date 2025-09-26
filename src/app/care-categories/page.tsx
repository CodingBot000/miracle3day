// File: src/app/care-categories/page.tsx
import Link from "next/link";
import { CATEGORIES } from "./_components/categories";
import { CategoryCard } from "./_components/CategoryCard";

export const metadata = {
  title: "프리미엄 뷰티 케어 | 카테고리",
  description: "밝고 긍정적인 무드의 1뎁스 카테고리 카드 그리드",
};

export default function Page() {
  return (
    <main className="min-h-screen bg-white">
      {/* Hero */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-10 pb-6">
        <div className="text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900">
            프리미엄 뷰티 케어
          </h1>
          <p className="mt-3 text-base sm:text-lg text-gray-600">
            나에게 맞춘 긍정적인 변화, 지금 바로 만나보세요.
          </p>
        </div>
      </section>

      {/* Grid */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {CATEGORIES.map((item) => (
            <CategoryCard key={item.slug} item={item} />
          ))}
        </div>

        {/* Optional: See all link */}
        <div className="mt-10 flex justify-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            홈으로 돌아가기
          </Link>
        </div>
      </section>
    </main>
  );
}