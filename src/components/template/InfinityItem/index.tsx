"use client";

import React, { Fragment, useRef } from "react";
import { useInfinity } from "@/hooks/useInfinity";
import LoadingSpinner from "@/components/atoms/loading/spinner";
import { InfinityScrollOutputDto } from "@/types/infinite";
// import { useParams } from "next/navigation";
import { clsx } from "clsx";
import { NoData } from "../noData";

interface InfinityItemListProps<T> {
  queryKey: string;
  fetchFn: ({ pageParam, id }: { pageParam: number; id: string }) => Promise<T>;
  children: (data: T) => React.ReactNode;
  id?: string;

  grid?: "2" | "4";
  className?: string;

  loadingFallback?: React.ReactNode; 
}

export const InfinityItemList = <T extends InfinityScrollOutputDto>({
  children,
  queryKey,
  fetchFn,
  grid,
  className,
  loadingFallback,
  id,
}: InfinityItemListProps<T>) => {
  // const { id }: { id: string } = useParams();
  const observerElem = useRef<HTMLDivElement>(null);

  const { data, error, isFetching, isFetchingNextPage, status } = useInfinity({
    observerElem,
    queryKey: [queryKey, id ?? "0"],
    fetchFn: (pageParam) => fetchFn({ pageParam, id: id ?? "0" }),
  });

  //  로딩 중일 때 fallback이 있으면 사용
  if (!data || status === "pending") {
    return loadingFallback ? <>{loadingFallback}</> : <LoadingSpinner pageLoading />;
  }

  if (error && status === "error") {
    return <div>Error: {error.message}</div>;
  }

  return (
    <>
      {data.pages.map((item, i) => (
        <Fragment key={i}>
          {item.nextCursor === 0 ? (
            <NoData />
          ) : (
            <div
              className={clsx(className, {
                "grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4": grid === "4",
                "grid grid-cols-1 sm:grid-cols-2 gap-4": grid === "2",
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


// "use client";

// import React, { Fragment, useRef } from "react";
// import { useInfinity } from "@/hooks/useInfinity";
// import LoadingSpinner from "@/components/atoms/loading/spinner";
// import { InfinityScrollOutputDto } from "@/types/infinite";
// import { useParams } from "next/navigation";
// import { clsx } from "clsx";
// import { NoData } from "../noData";

// interface InfinityItemListProps<T> {
//   queryKey: string;
//   fetchFn: ({ pageParam, id }: { pageParam: number; id: string }) => Promise<T>;
//   children: (data: T) => React.ReactNode;

//   grid?: "2" | "4";
//   className?: string;

//   loadingFallback?: React.ReactNode; 
// }

// export const InfinityItemList = <T extends InfinityScrollOutputDto>({
//   children,
//   queryKey,
//   fetchFn,
//   grid,
//   className,
//   loadingFallback,
// }: InfinityItemListProps<T>) => {
//   const { id }: { id: string } = useParams();
//   const observerElem = useRef<HTMLDivElement>(null);

//   const { data, error, isFetching, isFetchingNextPage, status } = useInfinity({
//     observerElem,
//     queryKey: [queryKey, id ?? 0],
//     fetchFn: (pageParam) => fetchFn({ pageParam, id }),
//   });

//   //  로딩 중일 때 fallback이 있으면 사용
//   if (!data || status === "pending") {
//     return loadingFallback ? <>{loadingFallback}</> : <LoadingSpinner pageLoading />;
//   }

//   if (error && status === "error") {
//     return <div>Error: {error.message}</div>;
//   }

//   return (
//     <>
//       {data.pages.map((item, i) => (
//         <Fragment key={i}>
//           {item.nextCursor === 0 ? (
//             <NoData />
//           ) : (
//             <div
//               className={clsx(className, {
//                 "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4": grid === "4",
//                 "grid grid-cols-1 sm:grid-cols-2 gap-4": grid === "2",
//               })}
//             >
//               {children(item)}
//             </div>
//           )}
//         </Fragment>
//       ))}

//       {isFetching && isFetchingNextPage ? (
//         <LoadingSpinner />
//       ) : (
//         <div ref={observerElem}></div>
//       )}
//     </>
//   );
// };
