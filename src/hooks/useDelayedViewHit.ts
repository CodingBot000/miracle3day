// useDelayedViewHit.ts
import { useEffect } from "react";

/**
 * 게시물 조회수 증가 훅
 * @param postId 게시물 ID
 * @param delayMs 딜레이 시간 (기본 2초)
 */
export function useDelayedViewHit(postId: number, delayMs = 2000) {
  useEffect(() => {
    if (typeof window === "undefined") return;

    const key = `view-hit:${postId}`;
    if (sessionStorage.getItem(key)) return; // 중복 방지

    let start = 0;
    let acc = 0;
    let timer: number | null = null;

    const remain = () => Math.max(0, delayMs - acc);

    const resume = () => {
      if (document.visibilityState !== "visible" || timer !== null) return;
      start = performance.now();
      timer = window.setTimeout(send, remain());
    };

    const pause = () => {
      if (timer !== null) {
        clearTimeout(timer);
        timer = null;
      }
      if (start) {
        acc += performance.now() - start;
        start = 0;
      }
    };

    const send = () => {
      sessionStorage.setItem(key, String(Date.now()));
      // 전송 (언로드에도 비교적 안전)
      const body = JSON.stringify({ postId });
      const url = "/api/view";
      if (navigator.sendBeacon) {
        navigator.sendBeacon(url, new Blob([body], { type: "application/json" }));
      } else {
        fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body, keepalive: true })
          .catch(() => {});
      }
      cleanup();
    };

    const onVis = () =>
      document.visibilityState === "visible" ? resume() : pause();

    const cleanup = () => {
      pause();
      document.removeEventListener("visibilitychange", onVis);
    };

    document.addEventListener("visibilitychange", onVis);
    // 시작
    resume();

    return cleanup;
  }, [postId, delayMs]);
}
