
const FavoriteSkeleton = () => {
  return (
    <div className="max-w-[768px] mx-auto mt-8 px-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="h-48 bg-gray-200 animate-pulse rounded-xl shadow-sm"
        />
      ))}
    </div>
  );
};

export default FavoriteSkeleton;