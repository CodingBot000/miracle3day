export const dynamic = "force-dynamic";

import NotFoundClient from "./NotFoundClient";
import SuspenseWrapper from "@/components/atoms/SuspenseWrapper";

export default function NotFoundPage() {
  return (
    <SuspenseWrapper fallback={<div>404 Page Loading...</div>}>
      <NotFoundClient />
    </SuspenseWrapper>
  );
}

// "use client";

// import { ROUTE } from "@/router";
// import { useRouter, useSearchParams } from "next/navigation";
// import styles from "./error.module.scss";

// export default function NotFound() {
//   const router = useRouter();
//   const searchParams = useSearchParams();
//   const message = searchParams.get("message") || "Page can't be found";

//   return (
//     <div className={styles.error}>
//       <h2>{message}</h2>
//       <button onClick={() => router.replace(ROUTE.HOME)}>
//         홈으로 돌아가기
//       </button>
//     </div>
//   );
// } 