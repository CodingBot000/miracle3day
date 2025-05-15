export default function EventSkeleton() {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="h-48 w-full bg-gray-200 rounded-md animate-pulse"
          />
        ))}
      </div>
    );
  }
  