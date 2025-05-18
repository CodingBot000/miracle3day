"use client";

import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";

export default function DiagnosticIntro() {
  return (
    <section className="w-full bg-[#f5f5f5] py-12 px-4 md:px-12 overflow-hidden">
      <div className="max-w-7xl mx-auto flex flex-row items-center justify-between gap-8 flex-nowrap">
        {/* 왼쪽 텍스트 블록 */}
        <div className="w-1/2 space-y-4 text-left">
          <h2 className="text-3xl font-bold tracking-tight">
            Diagnostic
          </h2>
          <p className="text-sm text-muted-foreground">
            Ready to get started? I can help you find the right treatment for your skin concerns.
          </p>
          <p className="text-sm text-gray-600">
            Discover the perfect treatment plan for your skin concerns. Our AI diagnostic tool uses advanced image recognition technology to analyze your skin and provide personalized recommendations.
          </p>

          <div className="mt-6">
            <Link href="https://treatment-estimate-landinng-tan.vercel.app/">
              <Button size="lg" className="px-8 py-6 text-base">
                Start Diagnosis
              </Button>
            </Link>
          </div>
        </div>

        {/* 오른쪽 이미지 */}
        <div className="w-1/2 flex justify-center">
          <Image
            src="/icons/diagnostic_icon.png"
            width={400}
            height={400}
            alt="AI Skin Diagnosis"
            className="w-full max-w-[320px] h-auto"
          />
        </div>
      </div>
    </section>
  );
}
