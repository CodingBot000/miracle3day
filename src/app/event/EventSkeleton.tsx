export default function EventSkeleton() {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-52 bg-gray-200 rounded animate-pulse" />
        ))}
      </div>
    );
  }
  