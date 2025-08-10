"use client";

import { Button } from "@/components/ui/button";
import { ROUTE } from "@/router";
import Image from "next/image";
import Link from "next/link";

export default function DiagnosticIntro() {
  return (
    <section className="w-full bg-gradient-diagnostic mt-5 py-5 px-4 md:px-12 overflow-hidden items-center justify-between">
      <div className="max-w-7xl mx-auto flex flex-row items-center justify-between gap-8 flex-nowrap">
        {/* 왼쪽 텍스트 블록 */}
        <div className="w-1/2 space-y-4 text-left">
          <h2 className="text-2xl font-bold tracking-tight">
            Diagnostic
          </h2>
          <p className="text-sm text-muted-foreground">
            Ready to get started? I can help you find the right treatment for your skin concerns.
          </p>
          {/* <p className="text-sm text-gray-600">
            Discover the perfect treatment plan for your skin concerns. Our AI diagnostic tool uses advanced image recognition technology to analyze your skin and provide personalized recommendations.
          </p> */}

          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
            <Link href={ROUTE.DIAGNOTSTIC}>
              <Button
                size="sm"
                className="px-3 py-2 sm:px-4 sm:py-3 text-sm sm:text-base bg-blue-500 w-full sm:w-auto"
              >
                Overall AI Treatment Flow
              </Button>
            </Link>
            <Link href={ROUTE.ONLINE_CONSULTING}>
              <Button
                size="sm"
                className="px-3 py-2 sm:px-4 sm:py-3 text-sm sm:text-base bg-orange-400 w-full sm:w-auto"
              >
                Online Consultation
              </Button>
            </Link>
            <Link href={ROUTE.AI_ANALYSIS_PAGE}>
              <Button
                size="sm"
                className="px-3 py-2 sm:px-4 sm:py-3 text-sm sm:text-base bg-orange-400 w-full sm:w-auto"
              >
                AI Skin Analysis(S2S)
              </Button>
            </Link>
            <Link href={ROUTE.AI_ANALYSIS_CAMERA_PAGE}>
              <Button
                size="sm"
                className="px-3 py-2 sm:px-4 sm:py-3 text-sm sm:text-base bg-orange-400 w-full sm:w-auto"
              >
                AI Skin Analysis(Camera)
              </Button>
            </Link>
          </div>
        </div>

        {/* 오른쪽 이미지 */}
        <div className="w-1/2 flex justify-center">
          <Image
            src="/icons/diagnostic_icon.png"
            width={200}
            height={200}
            alt="AI Skin Diagnosis"
            className="max-w-[200px] h-auto"
          />
        </div>
      </div>
    </section>
  );
}
