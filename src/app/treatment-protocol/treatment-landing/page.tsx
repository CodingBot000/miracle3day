"use client";

import * as React from "react";
import dynamic from "next/dynamic";

// Fix hydration issue by using dynamic import with ssr: false
const TreatmentDemoContent = dynamic(() => import('./TreatmentDemoContent'), {
  ssr: false,
  loading: () => (
    <div className="container mx-auto px-4 py-6 space-y-5">
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
        <div className="space-y-4">
          <div className="h-12 bg-gray-200 rounded"></div>
          <div className="h-48 bg-gray-200 rounded"></div>
          <div className="h-48 bg-gray-200 rounded"></div>
        </div>
      </div>
    </div>
  )
});

export default function Page() {
  return <TreatmentDemoContent />;
}