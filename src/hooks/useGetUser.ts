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
    // 인증 상태는 페이지 이동 시 항상 최신 상태를 확인해야 함
    // 로그인/로그아웃 후 다른 페이지로 이동했을 때 올바른 상태를 표시하기 위해 필요
    refetchOnMount: 'always',
  });

  return getUser;
};
