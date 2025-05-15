import { Skeleton } from "@/components/ui/skeleton";

const ForgetPasswordSkeleton = () => {
  return (
    <main className="h-[80vh] flex justify-center items-center">
      <div className="flex flex-col items-center gap-4 w-full max-w-md px-4">
        <Skeleton className="h-5 w-1/3" /> {/* Label */}
        <Skeleton className="h-10 w-full" /> {/* Input field */}
        <Skeleton className="h-10 w-40" /> {/* Button */}
      </div>
    </main>
  );
};

export default ForgetPasswordSkeleton;
