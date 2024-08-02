import { createClient } from "@/utils/supabase/client";

import { useQuery } from "@tanstack/react-query";

export const useGetUser = () => {
  const supabase = createClient();

  const getUser = useQuery({
    queryKey: ["getUser"],
    queryFn: async () => {
      const { data, error } = await supabase.auth.getUser();

      if (error) {
        return null;
      }

      return data;
    },
  });

  return getUser;
};
