import { Skeleton } from "@/components/ui/skeleton";

const EmailVerificationSkeleton = () => {
  return (
    <main className="px-4 py-10 max-w-md mx-auto space-y-6">
      <Skeleton className="h-8 w-1/3 mx-auto" /> {/* Title */}

      <div className="space-y-2">
        <Skeleton className="h-5 w-16" /> {/* Label */}
        <div className="flex items-center justify-between space-x-4">
          <Skeleton className="h-10 flex-1" /> {/* Input */}
          <Skeleton className="h-5 w-20" /> {/* Timer */}
        </div>
      </div>

      <Skeleton className="h-10 w-full" /> {/* Verify Button */}

      {/* Modal Skeletons */}
      <div className="space-y-2">
        <Skeleton className="h-4 w-3/4 mx-auto" />
        <Skeleton className="h-10 w-1/2 mx-auto" />
      </div>
    </main>
  );
};

export default EmailVerificationSkeleton;
