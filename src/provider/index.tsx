"use client";

import { getQueryClient } from "@/utils/rq/react-query";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { LanguageProvider } from "@/contexts/LanguageContext";

import type * as React from "react";

export default function Providers({ children }: { children: React.ReactNode })
{
  const queryClient = getQueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        {children}
        <ReactQueryDevtools initialIsOpen />
      </LanguageProvider>
    </QueryClientProvider>
  );
}
