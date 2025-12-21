import { InfinityScrollOutputDto } from "@/types/infinite";
import { useInfiniteQuery } from "@tanstack/react-query";
import { RefObject, useEffect, useCallback } from "react";

interface useInfinityProps<T> {
  queryKey: [string, string];
  fetchFn: (pageParams: number) => Promise<T>;
  observerElem: RefObject<HTMLElement>;
}

export const useInfinity = <T extends InfinityScrollOutputDto>({
  queryKey,
  fetchFn,
  observerElem,
}: useInfinityProps<T>) => {
  const {
    data,
    error,
    isFetching,
    isFetchingNextPage,
    status,
    fetchNextPage,
    hasNextPage,
  } = useInfiniteQuery({
    queryKey,
    initialPageParam: 0,
    queryFn: ({ pageParam = 0 }) => fetchFn(pageParam),
    getNextPageParam: (lastPage, allPages) =>
      lastPage.nextCursor ? allPages.length : undefined,
    retry: 1,
    staleTime: 5 * 60 * 1000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    networkMode: "online",
  });

  const observerCallback = useCallback(
    ([entries]: IntersectionObserverEntry[]) => {
      if (entries.isIntersecting && hasNextPage) {
        fetchNextPage();
      }
    },
    [hasNextPage, fetchNextPage]
  );

  useEffect(() => {
    if (!observerElem.current) return;

    const options: IntersectionObserverInit = {
      root: null,
      threshold: 1.0,
      rootMargin: "20px",
    };

    const observer = new IntersectionObserver(observerCallback, options);

    observer.observe(observerElem.current);

    return () => {
      observer.disconnect();
    };
  }, [observerCallback]);

  return {
    data,
    error,
    isFetching,
    isFetchingNextPage,
    status,
  };
};
