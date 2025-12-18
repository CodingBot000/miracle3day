"use client";


import { FormProvider } from "@/contexts/FormContext";
import React from "react";
import { Outfit } from 'next/font/google';

const outfit = Outfit({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-outfit',
});

export default function EstimateLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <FormProvider>
      {/* <div className="flex w-full h-full">
        <div className="flex-1 overflow-y-auto bg-white">
          {children}
        </div>
      </div> */}
      <div className={`min-h-dvh ${outfit.variable}`} style={{ fontFamily: 'var(--font-outfit)' }}>
        <div className="mx-auto max-w-[768px]">
          {children}
        </div>
    </div>
    </FormProvider>
  );
}
