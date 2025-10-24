import { useQuery } from "@tanstack/react-query";

export const useGetUser = () => {
  const getUser = useQuery({
    queryKey: ["getUser"],
    queryFn: async () => {
      const res = await fetch("/api/auth/getUser", { cache: "no-store" });
      if (!res.ok) {
        return null;
      }

      const data = await res.json();
      return data?.userInfo ?? null;
    },
  });

  return getUser;
};
