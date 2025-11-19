"use client";

import React, { useState } from "react";

export default function LoginLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
    
  return (
    <>
      <div className="min-h-dvh">
        <div className="mx-auto max-w-[768px]">
          {children}
        </div>
    </div>
    </>
  );
}
