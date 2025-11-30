import { fetchUtils } from "@/utils/fetch";
import {
  DeleteFavoriteInputDto,
  GetFavoriteInputDto,
  GetFavoriteOutputDto,
  PostFavoriteInputDto,
} from "./favorite.dto";

import { InfinityScrollInputDto } from "@/types/infinite";

const buildApiUrl = (path: string) => {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const envBase =
    process.env.NEXT_PUBLIC_API_ROUTE &&
    process.env.NEXT_PUBLIC_API_ROUTE.trim().length > 0
      ? process.env.NEXT_PUBLIC_API_ROUTE.replace(/\/$/, '')
      : undefined;

  if (typeof window !== 'undefined') {
    if (envBase && !envBase.includes('localhost')) {
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

export const getAllFavoriteAPI = async ({
  pageParam = 0,
}: InfinityScrollInputDto) => {
  const res = await fetchUtils<GetFavoriteOutputDto>({
    url: buildApiUrl(`/api/auth/favorite?&pageParam=${pageParam}`),
    fetchOptions: {
      cache: "no-cache",
    },
  });

  return res;
};

export const getFavoriteAPI = async ({
  id_hospital,
}: GetFavoriteInputDto): Promise<GetFavoriteOutputDto[]> => {
  const queryParams = new URLSearchParams({});

  if (id_hospital) {
    queryParams.append("id_hospital", id_hospital);
  }

  const res = await fetchUtils<GetFavoriteOutputDto[]>({
    url: buildApiUrl(`/api/auth/favorite?${queryParams.toString()}`),
  });

  return res;
};

export const postFavoriteAPI = async ({
  id_hospital,
}: PostFavoriteInputDto) => {
  const body = JSON.stringify({ id_hospital });

  const res = await fetchUtils<{ redirect: string }>({
    url: buildApiUrl('/api/auth/favorite'),
    fetchOptions: {
      credentials: 'include',
      method: "POST",
      body,
    },
  });

  return res;
};

export const deleteFavoriteAPI = async ({
  id_hospital,
}: DeleteFavoriteInputDto) => {
  const body = JSON.stringify({ id_hospital });

  const res = await fetchUtils({
    url: buildApiUrl('/api/auth/favorite'),
    fetchOptions: {
      credentials: 'include',
      method: "DELETE",
      body,
    },
  });

  return res;
};
