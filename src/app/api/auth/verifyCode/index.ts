import { fetchUtils } from "@/utils/fetch";

export const verifyCodeAPI = async ({
  email,
  token,
}: {
  email: string;
  token: string;
}) => {
  const body = JSON.stringify({
    email,
    token,
  });

  const res = await fetchUtils<Response>({
    url: `${process.env.NEXT_PUBLIC_API_ROUTE}/api/auth/verifyCode`,
    fetchOptions: {
      method: "POST",
      body,
    },
  });

  return res;
};
