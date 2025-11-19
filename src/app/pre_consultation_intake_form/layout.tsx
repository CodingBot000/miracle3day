"use client";


import { FormProvider } from "@/contexts/FormContext";
import React, { useState } from "react";

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
      <div className="min-h-dvh">
        <div className="mx-auto max-w-[768px]">
          {children}
        </div>
    </div>
    </FormProvider>
  );
}
