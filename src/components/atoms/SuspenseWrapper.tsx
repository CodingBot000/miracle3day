"use client";

import { ReactNode, Suspense } from "react";

interface SuspenseWrapperProps {
  children: ReactNode;
  fallback?: ReactNode;
}

const SkeletonFallback = () => {
  return (
    <div className="w-full min-h-[200px] p-4 space-y-4 animate-pulse">
      <div className="h-6 bg-gray-300 rounded w-1/2" />
      <div className="h-4 bg-gray-200 rounded w-full" />
      <div className="h-4 bg-gray-200 rounded w-5/6" />
      <div className="h-4 bg-gray-200 rounded w-3/4" />
    </div>
  );
};

const CardSkeletonFallback = () => (
    <div className="animate-pulse rounded-xl border p-4 shadow-sm space-y-4">
      <div className="h-40 bg-gray-300 rounded" />
      <div className="h-5 bg-gray-200 rounded w-3/4" />
      <div className="h-4 bg-gray-200 rounded w-1/2" />
    </div>
  );
  
export default function SuspenseWrapper({
  children,
  fallback = <CardSkeletonFallback />,
}: SuspenseWrapperProps) {
  return <Suspense fallback={fallback}>{children}</Suspense>;
}
