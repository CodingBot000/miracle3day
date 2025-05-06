"use client";

import { ROUTE } from "@/router";
import { useRouter, useSearchParams } from "next/navigation";
import styles from "./error.module.scss";

export default function NotFound() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const message = searchParams.get("message") || "Page can't be found";

  return (
    <div className={styles.error}>
      <h2>{message}</h2>
      <button onClick={() => router.replace(ROUTE.HOME)}>
        홈으로 돌아가기
      </button>
    </div>
  );
} 