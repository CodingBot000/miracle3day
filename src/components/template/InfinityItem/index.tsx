import React, { Fragment, useRef } from "react";

import { useInfinity } from "@/hooks/useInfinity";
import LoadingSpinner from "@/components/atoms/loading/spinner";

import { InfinityScrollOutputDto } from "@/types/infinite";

import { useParams } from "next/navigation";

import styles from "./infinity-item.module.scss";
import { clsx } from "clsx";
import { NoData } from "../noData";

interface InfinityItemListProps<T> {
  queryKey: string;
  fetchFn: ({ pageParam, id }: { pageParam: number; id: string }) => Promise<T>;
  children: (data: T) => React.ReactNode;

  grid?: "2" | "4";
  className?: string;
}

export const InfinityItemList = <T extends InfinityScrollOutputDto>({
  children,
  queryKey,
  fetchFn,
  grid,
  className,
}: InfinityItemListProps<T>) => {
  const { id }: { id: string } = useParams();

  const observerElem = useRef<HTMLDivElement>(null);

  const { data, error, isFetching, isFetchingNextPage, status } = useInfinity({
    observerElem,
    queryKey: [queryKey, id ?? 0],
    fetchFn: (pageParam) => fetchFn({ pageParam, id }),
  });

  if (!data || status === "pending") return <LoadingSpinner pageLoading />;
  if (error && status === "error") return <div>Error: {error.message}</div>;

  return (
    <>
      {data.pages.map((item, i) => (
        <Fragment key={i}>
          {item.nextCursor === 0 ? (
            <NoData />
          ) : (
            <div
              className={clsx(className, {
                [styles["grid-4"]]: grid === "4",
                [styles["grid-2"]]: grid === "2",
              })}
            >
              {children(item)}
            </div>
          )}
        </Fragment>
      ))}

      {isFetching && isFetchingNextPage ? (
        <LoadingSpinner />
      ) : (
        <div ref={observerElem}></div>
      )}
    </>
  );
};
