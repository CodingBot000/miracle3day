"use client";
import { useEffect, useState } from "react";

/**
 * Custom hook to dynamically load external scripts
 * @param src - The URL of the script to load
 * @returns boolean - true when the script is loaded, false otherwise
 */
export function useScript(src: string) {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    log.debug("[useScript] start load:", src);

    const existing = document.querySelector(`script[src="${src}"]`) as HTMLScriptElement | null;

    if (existing) {
      log.debug("[useScript] existing script found:", src, existing);
      if (existing.getAttribute("data-loaded") === "true") {
        log.debug("[useScript] existing already loaded:", src);
        setLoaded(true);
      } else {
        const onLoad = () => {
          log.debug("[useScript] existing script loaded:", src);
          setLoaded(true);
          existing.setAttribute("data-loaded", "true");
        };
        existing.addEventListener("load", onLoad, { once: true });
      }
      return;
    }

    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.defer = true;

    const onLoad = () => {
      log.debug("[useScript] new script loaded:", src);
      script.setAttribute("data-loaded", "true");
      setLoaded(true);
    };

    const onError = (error: Event) => {
      console.error("[useScript] script load error:", src, error);
    };

    script.addEventListener("load", onLoad, { once: true });
    script.addEventListener("error", onError, { once: true });
    document.body.appendChild(script);

    return () => {
      log.debug("[useScript] cleanup script:", src);
      script.removeEventListener("load", onLoad);
      script.removeEventListener("error", onError);
      // Keep script in DOM for reuse, don't remove
    };
  }, [src]);

  return loaded;
}
