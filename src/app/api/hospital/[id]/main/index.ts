import { fetchUtils } from '@/utils/fetch';
import {
  HospitalDetailMainInputDto,
  HospitalDetailMainOutput,
} from './main.dto';

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

  const vercelUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : undefined;

  if (vercelUrl) {
    return `${vercelUrl}${normalizedPath}`;
  }

  return `http://localhost:3000${normalizedPath}`;
};

export const getHospitalMainAPI = async ({
  id,
}: HospitalDetailMainInputDto): Promise<HospitalDetailMainOutput> => {
  const url = buildApiUrl(`/api/hospital/${id}/main`);

  const data = await fetchUtils<HospitalDetailMainOutput>({
    url,
    fetchOptions: {
      cache: 'no-cache',
    },
  });

  return data;
};
