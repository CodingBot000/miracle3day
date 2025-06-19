import { fetchUtils } from "@/utils/fetch";

interface UpdateProfileParams {
  uuid: string;
  displayName: string;
  fullName: string;
  nation: string;
  birthYear: string;
  birthMonth: string;
  birthDay: string;
  gender: string;
  email: string;
}

interface UpdateProfileResponse {
  data?: any;
  error?: string;
}

export const updateProfileAPI = async (params: UpdateProfileParams): Promise<UpdateProfileResponse> => {
  const res = await fetchUtils<UpdateProfileResponse>({
    url: `${process.env.NEXT_PUBLIC_API_ROUTE}/api/auth/update-profile`,
    fetchOptions: {
      method: "PUT",
      body: JSON.stringify(params),
    },
  });

  return res;
}; 