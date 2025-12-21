import { useQuery } from "@tanstack/react-query";

export const useGetUser = () => {
  const getUser = useQuery({
    queryKey: ["getUser"],
    queryFn: async () => {
      const res = await fetch("/api/auth/getUser");
      if (!res.ok) {
        return null;
      }

      const data = await res.json();
      return data?.userInfo ?? null;
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  return getUser;
};
