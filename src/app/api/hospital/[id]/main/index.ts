import { fetchUtils } from '@/utils/fetch';
import {
  HospitalDetailMainInputDto,
  HospitalDetailMainOutput,
} from './main.dto';

const API_BASE =
  process.env.NEXT_PUBLIC_API_ROUTE ||
  process.env.INTERNAL_API_BASE_URL ||
  '';

export const getHospitalMainAPI = async ({
  id,
}: HospitalDetailMainInputDto): Promise<HospitalDetailMainOutput> => {
  const url = `${API_BASE}/api/hospital/${id}/main`;

  const data = await fetchUtils<HospitalDetailMainOutput>({
    url,
    fetchOptions: {
      cache: 'no-cache',
      credentials: 'include',
    },
  });

  return data;
};
