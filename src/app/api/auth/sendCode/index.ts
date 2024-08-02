import { fetchUtils } from "@/utils/fetch";

export const sendCodeAPI = async ({
  email,
}: {
  email: string;
}): Promise<any> => {
  const res = await fetchUtils<Response>({
    url: `${process.env.NEXT_PUBLIC_API_ROUTE}/api/auth/sendCode?email=${email}`,
  });

  return res;
};
