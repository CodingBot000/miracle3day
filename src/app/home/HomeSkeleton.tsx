export default function HomeSkeleton() {
    return (
      <main className="animate-pulse space-y-12 px-4 py-8">
        {/* HeroVideo + Hero */}
        <div className="h-64 bg-gray-200 rounded-md" />
  
        {/* Banner */}
        <div className="h-32 bg-gray-200 rounded-md" />
  
        {/* Beauty Section */}
        <section>
          <div className="h-8 w-48 bg-gray-300 mb-4 rounded" />
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-40 bg-gray-200 rounded-md" />
            ))}
          </div>
        </section>
  
        {/* Hospitals Section */}
        <section>
          <div className="h-8 w-48 bg-gray-300 mb-4 rounded" />
          <div className="flex flex-wrap gap-2 mb-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-8 w-24 bg-gray-200 rounded-full" />
            ))}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-40 bg-gray-200 rounded-md" />
            ))}
          </div>
        </section>
      </main>
    );
  }
  