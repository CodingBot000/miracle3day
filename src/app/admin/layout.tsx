"use client";

import OverflowFixer from "@/components/utils/OverflowFixer";
import { useReservationRealtime } from "@/hooks/useReservationRealtime";
import Providers from "@/provider/QueryProvider";
import { useAlarmStore } from "@/stores/useHospitalUUIDStore";
import React from "react";
import { Toaster } from "sonner";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";

const geistSans = GeistSans;
const geistMono = GeistMono;


export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { info } = useAlarmStore(); // 1. 로그인 전에는 null
  const hospitalId = info?.id_uuid_hospital;

  useReservationRealtime(hospitalId || '');

  return (
    <html lang="en">
      <body
      className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          <OverflowFixer />
          {children}
          <Toaster richColors position="top-center" duration={1500}/>
        </Providers>
      </body>
    </html>
  );
}