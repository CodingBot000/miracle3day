"use client";

import { motion, Variants } from "framer-motion";
import Link from "next/link";
import React from "react";
import { ROUTE } from "@/router";
import { useTranslations } from "next-intl";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 12 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } }
};

export default function HeadSection() {
  const t = useTranslations("Home");

  const heading = [t("headingLine1"), t("headingLine2")];

  return (
    <section className="w-full flex flex-col items-center gap-10 px-4 py-12">
      {/* Heading */}
      <motion.div
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.6 }}
        className="w-full max-w-screen-xl flex flex-col items-center"
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
          {t("headingSubtitle")}
        </motion.p>

        {/* CTA buttons */}
        <div className="mt-6 flex flex-row gap-3 w-full max-w-2xl mx-auto justify-center">
          <Link
            href={ROUTE.RECOMMEND_ESTIMATE}
            className="flex-1 basis-0 min-w-0 min-h-[50px] h-[70px] px-3 sm:px-6 flex items-center justify-center rounded-[14px] bg-pink-400 text-white text-sm sm:text-base font-medium hover:bg-pink-500 transition-colors duration-200 shadow-sm text-center leading-tight"
          >
            {t("ctaAiMatch")}
          </Link>

          <Link
            href={ROUTE.TREATMENT_PROTOCOL}
            className="flex-1 basis-0 min-w-0 min-h-[50px] h-[70px] px-3 sm:px-6 flex items-center justify-center rounded-[14px] bg-orange-400 text-white text-sm sm:text-base font-medium hover:bg-orange-500 transition-colors duration-200 shadow-sm text-center leading-tight"
          >
            {t("ctaTreatments")}
          </Link>
        </div>

      </motion.div>
      {/* <Link
          href={ROUTE.AI_ANALYSIS_CAMERA_PAGE}
            className="flex-1 min-h-[50px], h-[70px] px-6 flex items-center justify-center rounded-[14px] bg-orange-400 text-white font-medium hover:bg-orange-500 transition-colors duration-200 shadow-sm"
          >
            {t("ctaAiAnalysis")}
          </Link> */}
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

  
    </section>
  );
}
