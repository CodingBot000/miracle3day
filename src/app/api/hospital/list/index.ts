import { fetchUtils } from "@/utils/fetch";
import { LocationEnum } from "@/constants";
import { HospitalOutputDto } from "@/app/models/hospitalData.dto";

const buildApiUrl = (path: string) => {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const envBase =
    process.env.NEXT_PUBLIC_API_ROUTE &&
    process.env.NEXT_PUBLIC_API_ROUTE.trim().length > 0
      ? process.env.NEXT_PUBLIC_API_ROUTE.replace(/\/$/, "")
      : undefined;

  if (typeof window !== "undefined") {
    if (envBase && !envBase.includes("localhost")) {
      return `${envBase}${normalizedPath}`;
    }
    return `${window.location.origin}${normalizedPath}`;
  }

  if (envBase) {
    return `${envBase}${normalizedPath}`;
  }

  const vercelUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : undefined;

  if (vercelUrl) {
    return `${vercelUrl}${normalizedPath}`;
  }

  return `http://localhost:3000${normalizedPath}`;
};

export const getHospitalListAPI = async () => {
  const url = buildApiUrl("/api/hospital/list");

  try {
    const data = await fetchUtils<HospitalOutputDto>({
      url,
      fetchOptions: {
        cache: "no-store",
      },
    });

    return data ?? { data: [], total: 0 };
  } catch (error) {
    console.error("[getHospitalListAPI] failed:", error);
    return { data: [], total: 0 };
  }
};
