export default function UploadSkeleton() {
    return (
      <main className="p-4 animate-pulse space-y-4">
        <div className="h-8 w-1/3 bg-gray-300 rounded" />
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-6 w-full bg-gray-200 rounded" />
          ))}
        </div>
        <div className="h-48 bg-gray-100 rounded" />
      </main>
    );
  }
  