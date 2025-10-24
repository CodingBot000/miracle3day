import { fetchUtils } from "@/utils/fetch";
import {
  DeleteFavoriteInputDto,
  GetFavoriteInputDto,
  GetFavoriteOutputDto,
  PostFavoriteInputDto,
} from "./favorite.dto";

import { InfinityScrollInputDto } from "@/types/infinite";

export const getAllFavoriteAPI = async ({
  pageParam = 0,
}: InfinityScrollInputDto) => {
  const res = await fetchUtils<GetFavoriteOutputDto>({
    url: `${process.env.NEXT_PUBLIC_API_ROUTE}/api/auth/favorite?&pageParam=${pageParam}`,
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
    url: `${
      process.env.NEXT_PUBLIC_API_ROUTE
    }/api/auth/favorite?${queryParams.toString()}`,
  });

  return res;
};

const API_BASE =
  process.env.NEXT_PUBLIC_API_ROUTE ||
  process.env.INTERNAL_API_BASE_URL ||
  'http://localhost:3000';

export const postFavoriteAPI = async ({
  id_hospital,
}: PostFavoriteInputDto) => {
  const body = JSON.stringify({ id_hospital });

  const res = await fetchUtils<{ redirect: string }>({
    url: `${API_BASE}/api/auth/favorite`,
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
    url: `${API_BASE}/api/auth/favorite`,
    fetchOptions: {
      credentials: 'include',
      method: "DELETE",
      body,
    },
  });

  return res;
};
