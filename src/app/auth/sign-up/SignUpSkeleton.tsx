export default function SignUpSkeleton() {
    return (
      <main className="p-6 animate-pulse">
        <div className="h-8 w-40 bg-gray-300 rounded mb-6" />
        <div className="space-y-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-10 bg-gray-200 rounded" />
          ))}
        </div>
        <div className="mt-6 h-10 bg-gray-300 rounded" />
      </main>
    );
  }
  