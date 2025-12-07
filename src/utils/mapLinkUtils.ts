import { HospitalInfo } from "@/models/hospitalData.dto";

export type MapPlatform = "google" | "naver" | "kakao";

export interface MapLinks {
  scheme: string;
  fallback: string;
}

const pickDisplayName = (h: HospitalInfo) => {
  const name = h.name_en?.trim() || h.name.trim();
  return name.replace(/\s+/g, ''); // 모든 공백 스페이스 줄바꿈 전부 제거 
};

const pickDisplayAddress = (h: HospitalInfo) =>
  h.address_full_road_en?.trim() ||
  h.address_full_road?.trim() ||
  h.address_full_jibun_en?.trim() ||
  h.address_full_jibun?.trim() ||
  "";

const enc = (s: string) => encodeURIComponent(s);

const clampCoord = (n: number) => Number.isFinite(n) ? Number(n.toFixed(7)) : 0;

export const isIOS = () => typeof navigator !== 'undefined' && /iP(hone|ad|od)/i.test(navigator.userAgent);
export const isAndroid = () => typeof navigator !== 'undefined' && /Android/i.test(navigator.userAgent);

export const buildMapLinks = (
  platform: MapPlatform,
  h: HospitalInfo,
  appId: string = "com.example.web"
): MapLinks => {
  const name = pickDisplayName(h);
  const lat = clampCoord(h.latitude);
  const lng = clampCoord(h.longitude);

  if (!name) throw new Error("Display name is required (either name_en or name)");

  switch (platform) {
    case "google": {
      const iosScheme = `comgooglemaps://?q=${enc(name)}&center=${lat},${lng}&zoom=17`;
      const androidScheme = `geo:${lat},${lng}?q=${lat},${lng}(${enc(name)})`;
      const web = `https://www.google.com/maps/search/?api=1&query=${enc(`${name}, ${lat}, ${lng}`)}`;
      return {
        scheme: isIOS() ? iosScheme : isAndroid() ? androidScheme : web,
        fallback: web,
      };
    }
    case "naver": {
      const scheme = `nmap://place?lat=${lat}&lng=${lng}&name=${enc(name)}&appname=${enc(appId)}`;
      const web = `https://map.naver.com/v5/search/${enc(name)}`;
      return { scheme, fallback: web };
    }
    case "kakao": {
      const scheme = `kakaomap://look?p=${lat},${lng}&q=${enc(name)}`;
      const web = `https://map.kakao.com/link/map/${enc(name)},${lat},${lng}`;
      return { scheme, fallback: web };
    }
    default:
      throw new Error(`Unsupported platform: ${platform}`);
  }
};

export const openMapWithFallback = (schemeUrl: string, fallbackUrl: string) => {
  const start = Date.now();

  // iOS: 스킴 시도 후 짧은 대기 → 폴백
  if (isIOS()) {
    window.location.href = schemeUrl;
    setTimeout(() => {
      if (Date.now() - start < 1500) {
        window.location.href = fallbackUrl;
      }
    }, 1200);
    return;
  }

  // Android: 스킴 직접 시도 → 폴백
  if (isAndroid()) {
    window.location.href = schemeUrl;
    setTimeout(() => {
      window.location.href = fallbackUrl;
    }, 1200);
    return;
  }

  // Desktop 등: 바로 웹
  window.open(fallbackUrl, "_blank");
};
