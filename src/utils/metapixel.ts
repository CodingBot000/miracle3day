// utils/metaPixel.ts
export function fbqTrack(event: string, params?: Record<string, any>) {
  if (typeof window === "undefined") return;
  const w = window as any;
  if (!w.fbq) return;
  params ? w.fbq("track", event, params) : w.fbq("track", event);
}

export function fbqTrackCustom(event: string, params?: Record<string, any>) {
  if (typeof window === "undefined") return;
  const w = window as any;
  if (!w.fbq) return;
  params ? w.fbq("trackCustom", event, params) : w.fbq("trackCustom", event);
}

