// app/admin/upload/layout.tsx
export default function AdminLayout({
    children,
  }: {
    children: React.ReactNode;
  }) {
    return (
        <div className="p-6">
        {/* Header 없이 시작하거나 다른 헤더 삽입 가능 */}
        <h1 className="text-xl font-bold">Upload Test Page</h1>
        {children}
      </div>
    );
  }
  