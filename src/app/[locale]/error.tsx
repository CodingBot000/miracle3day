"use client"; // Error components must be Client Components

import { ROUTE } from "@/router";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="h-screen my-[15%] mx-auto">
      <h2 className="text-center text-xl font-semibold mb-4">Error!</h2>
      <button
        onClick={() => router.replace(ROUTE.HOME)}
        className="mx-auto flex bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
      >
        Back Home
      </button>
    </div>
  );
}
