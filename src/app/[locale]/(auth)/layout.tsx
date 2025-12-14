"use client";

import LayoutHeaderAuth from "@/components/organism/layout/header/LayoutHeaderAuth";
import { HEADER_HEIGHT } from "@/constants/common";
import React from "react";

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <>
      <LayoutHeaderAuth />
      <div className="min-h-dvh" style={{ paddingTop: HEADER_HEIGHT }}>
        <div className="mx-auto max-w-[768px]">
          {children}
        </div>
    </div>
    </>
  );
}
