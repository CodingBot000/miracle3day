"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import React, { useMemo } from "react";
import { ROUTE } from "@/router";
import { Button } from "@/components/ui/button";
import ScrollDevicesIntroduce from "./ScrollDevicesIntroduce";

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
};

export default function Hero() {
  // 두 줄로 쪼갠 히어로 타이포 (원본 문구를 Tailwind로 표현)
  const heading = useMemo(() => ([
    "Find your perfect",
    "Korean beauty treatment",
    "in 1 minute."
  ]), []);

  return (
    <section className="w-full flex flex-col items-center gap-10 px-4 py-12">
      {/* Heading */}
      <motion.div
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.6 }}
        className="w-full max-w-screen-xl flex flex-col items-center gap-3"
      >
        {heading.map((line, i) => (
          <motion.p
            key={i}
            variants={fadeUp}
            className="text-center text-2xl md:text-4xl font-bold tracking-tight"
          >
            {line}
          </motion.p>
        ))}

        <motion.p
          variants={fadeUp}
          className="text-center text-sm md:text-base text-gray-500 mt-2"
        >
          Tap into the expertise of Seoul&apos;s top doctors. Take our simple quiz to build your perfect treatment
        </motion.p>

        {/* CTA buttons */}
        <div className="mt-6 flex flex-col gap-3 w-full max-w-xs mx-auto">
          <Link
            href="https://treatment-estimate-landinng-tan.vercel.app/"
            className="w-full h-12 px-6 flex items-center justify-center rounded-[14px] bg-pink-400 text-white font-medium hover:bg-pink-500 transition-colors duration-200 shadow-sm"
          >
            Get My Recommendation
          </Link>
          {/* <Link
                href="/hospital"

            className="inline-flex items-center justify-center
                      h-12 px-8 rounded-[14px]
                      border border-solid border-[#ff6c86]
                      bg-white text-[#ff6c86] text-lg font-medium
                      transition-colors
                      hover:bg-[#ff6c86]/5
                      focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff6c86]/40"
          >
            Go to Korean Clinic
          </Link> */}

          <Link 
          href={ROUTE.AI_ANALYSIS_CAMERA_PAGE}
            className="w-full h-12 px-6 flex items-center justify-center rounded-[14px] bg-orange-400 text-white font-medium hover:bg-orange-500 transition-colors duration-200 shadow-sm"
          >
              
                AI Skin Analysis(Camera)
              
            </Link>
        </div>
        
      </motion.div>

  
    </section>
  );
}
