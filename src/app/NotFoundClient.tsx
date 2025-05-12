"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { ROUTE } from "@/router";
import styles from "./error.module.scss";

export default function NotFoundClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const message = searchParams.get("message") || "Page can't be found";

  return (
    <div className={styles.error}>
      <h2>{message}</h2>
      <button onClick={() => router.replace(ROUTE.HOME)}>
        Back to Home
      </button>
    </div>
  );
}
