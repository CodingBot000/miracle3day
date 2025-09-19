import type { Metadata } from 'next'
export const metadata: Metadata = {
  title: 'Beauty Community',
  description: 'A community for sharing beauty information',
}

export default function CommunityLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-full bg-gray-50 py-8 sm:py-10">
      <div className="bg-white shadow-sm rounded-xl border border-gray-100">
        <header className="border-b border-gray-100 px-6 py-4">
          <h1 className="text-xl font-semibold text-gray-900">Beauty Community</h1>
        </header>
        <div className="px-6 py-6">
          {children}
        </div>
      </div>
    </div>
  )
}
