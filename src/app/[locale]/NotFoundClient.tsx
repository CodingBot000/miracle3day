"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { ROUTE } from "@/router";

export default function NotFoundClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const message = searchParams.get("message") || "Page can't be found";

  return (
    <div className="h-screen my-[15%] mx-auto">
      <h2 className="text-center text-xl font-semibold mb-4">{message}</h2>
      <button
        onClick={() => router.replace(ROUTE.HOME)}
        className="mx-auto flex bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
      >
        Back to Home
      </button>
    </div>
  );
}
