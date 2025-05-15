import { Skeleton } from "@/components/ui/skeleton";

const AboutUsSkeleton = () => {
  return (
    <div className="mx-5 space-y-6">
      <Skeleton className="h-10 w-1/3" /> {/* Title */}
      <div className="space-y-3">
        {[...Array(6)].map((_, idx) => (
          <div key={idx}>
            <Skeleton className="h-4 w-1/4 mb-1" /> {/* Subtitle */}
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-5/6" />
            <Skeleton className="h-3 w-2/3" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default AboutUsSkeleton;
