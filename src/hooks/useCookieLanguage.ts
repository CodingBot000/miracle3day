"use client";

import { useCallback, useEffect, useMemo, useRef, useSyncExternalStore } from "react";
import { translateLanguage } from "@/constants/languages";
import { setLangAction } from "@/i18n/actions/setLang";

type Language = "ko" | "en";

const fallbackLanguages: Language[] = (() => {
  const collected = new Set<Language>();
  translateLanguage.forEach((option) => {
    const base = option.code.split("-")[0]?.toLowerCase();
    if (base === "ko" || base === "en") {
      collected.add(base as Language);
    }
  });

  if (!collected.has("en")) {
    collected.add("en");
  }

  return Array.from(collected);
})();

const supportedLanguages = new Set<Language>(fallbackLanguages);

const listeners = new Set<() => void>();

const readFromEnvironment = (): Language => {
  if (typeof document !== "undefined") {
    const match = document.cookie.match(/(?:^|;\s*)lang=([^;]+)/);
    if (match) {
      const lang = mapCodeToLanguage(decodeURIComponent(match[1]));
      if (lang) return lang;
    }
  }

  if (typeof navigator !== "undefined") {
    const preferred = mapCodeToLanguage(navigator.language);
    if (preferred) return preferred;

    const navLanguages = (navigator as Navigator & { languages?: string[] }).languages;
    if (Array.isArray(navLanguages)) {
      for (const code of navLanguages) {
        const lang = mapCodeToLanguage(code);
        if (lang) return lang;
      }
    }
  }

  return fallbackLanguages[0] ?? "en";
};

let currentLanguage: Language = typeof window === "undefined" ? "en" : readFromEnvironment();

function mapCodeToLanguage(code?: string | null): Language | null {
  if (!code) return null;
  const normalized = code.trim().toLowerCase();

  const exact = translateLanguage.find((option) => option.code.toLowerCase() === normalized);
  if (exact) {
    const base = exact.code.split("-")[0]?.toLowerCase();
    if (base && supportedLanguages.has(base as Language)) {
      return base as Language;
    }
  }

  const base = normalized.split("-")[0];
  if (base && supportedLanguages.has(base as Language)) {
    return base as Language;
  }

  return null;
}

function publish(nextLang: Language) {
  currentLanguage = nextLang;
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return currentLanguage;
}

function getServerSnapshot() {
  return fallbackLanguages[0] ?? "en";
}

export function useCookieLanguage() {
  const lang = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const pendingRef = useRef<Promise<void> | null>(null);

  const setLanguage = useCallback((next: Language) => {
    const sanitized = mapCodeToLanguage(next) ?? (fallbackLanguages[0] ?? "en");
    if (sanitized === currentLanguage) return;

    if (typeof document !== "undefined") {
      document.cookie = `lang=${sanitized}; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax`;
    }

    publish(sanitized);

    const promise = setLangAction(sanitized)
      .catch((error) => {
        console.error("Failed to persist language", error);
      })
      .finally(() => {
        pendingRef.current = null;
      });
    pendingRef.current = promise;
  }, []);

  useEffect(() => {
    if (typeof document === "undefined") return;

    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        const latest = readFromEnvironment();
        if (latest !== currentLanguage) {
          publish(latest);
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, []);

  return useMemo(
    () => ({
      language: lang,
      setLanguage,
      isUpdating: !!pendingRef.current,
    }),
    [lang, setLanguage]
  );
}
