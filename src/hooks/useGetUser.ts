import { createClient } from "@/utils/session/client";

import { useQuery } from "@tanstack/react-query";

export const useGetUser = () => {
  const backendClient = createClient();

  const getUser = useQuery({
    queryKey: ["getUser"],
    queryFn: async () => {
      const { data, error } = await backendClient.auth.getUser();

      if (error) {
        return null;
      }

      return data;
    },
  });

  return getUser;
};
