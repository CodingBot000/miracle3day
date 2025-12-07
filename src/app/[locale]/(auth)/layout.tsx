"use client";

import LayoutHeaderBase from "@/components/organism/layout/LayoutHeaderBase";
import { HEADER_HEIGHT } from "@/constants/common";
import React from "react";

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <>
      <LayoutHeaderBase />
      <div className="min-h-dvh" style={{ paddingTop: HEADER_HEIGHT }}>
        <div className="mx-auto max-w-[768px]">
          {children}
        </div>
    </div>
    </>
  );
}
