"use client"; // Error components must be Client Components

import { ROUTE } from "@/router";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import styles from './error.module.scss'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {

  const router = useRouter()

  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className={styles.error}>
      <h2>Error!</h2>
      <button
        onClick={
          // Attempt to recover by trying to re-render the segment
          () => router.replace(ROUTE.HOME)
        }
      >
        {/* Try again */}

        Back Home
      </button>
    </div>
  );
}
