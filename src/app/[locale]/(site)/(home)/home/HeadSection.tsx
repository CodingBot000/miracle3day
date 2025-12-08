"use client";

import { motion, Variants } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ROUTE } from "@/router";
import { useTranslations } from "next-intl";
import DiagnosticIntro from "./components/DiagnosticIntro";
import LoginRequiredModal from "@/components/template/modal/LoginRequiredModal";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 12 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } }
};

export default function HeadSection() {
  const t = useTranslations("Home");
  const router = useRouter();
  const [showLoginModal, setShowLoginModal] = useState(false);

  const heading = [t("headingLine1"), t("headingLine2")];

  const handleVideoConsultationClick = async (e: React.MouseEvent) => {
    e.preventDefault();

    // Check if user is logged in
    try {
      const res = await fetch('/api/auth/session');
      if (res.ok) {
        const data = await res.json();
        if (data.auth && data.auth.status === 'active') {
          router.push('/pre_consultation_intake_form');
          return;
        }
      }
    } catch (error) {
      console.error('Error checking auth:', error);
    }

    // Not logged in, show modal
    setShowLoginModal(true);
  };

  const handleLoginConfirm = () => {
    setShowLoginModal(false);
    router.push(`/login?redirect=${encodeURIComponent('/pre_consultation_intake_form')}`);
  };

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
<div className="mt-6 w-full max-w-2xl mx-auto flex flex-col gap-3">
<div className="flex flex-col sm:flex-row gap-3">
    {/* AI Beauty Match - 메인 CTA */}
    <Link
      href={ROUTE.RECOMMEND_ESTIMATE}
      className="flex-1 relative min-h-[64px] sm:min-h-[70px] px-4 sm:px-6 py-3 sm:py-4 flex flex-col items-center justify-center rounded-[14px] bg-gradient-to-br from-pink-400 to-pink-500 text-white font-medium hover:from-pink-500 hover:to-pink-600 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 group overflow-hidden"
    >
      {/* AI 뱃지 */}
      <div className="absolute top-2 right-2 bg-white/20 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-0.5 rounded-full border border-white/30">
        AI
      </div>
      
      <div className="flex items-center gap-2">
        <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
        <span className="text-base sm:text-xl leading-tight text-center">
          {t("ctaAiMatch")}
        </span>
      </div>
    </Link>

    {/* Find Treatments - 보조 CTA */}
    <Link
      href={ROUTE.TREATMENT_PROTOCOL}
      className="flex-1 relative min-h-[64px] sm:min-h-[70px] px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-center rounded-[14px] bg-gradient-to-br from-orange-400 to-orange-500 text-white font-medium hover:from-orange-500 hover:to-orange-600 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
    >
      <div className="flex items-center gap-2">
        <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <span className="text-base sm:text-xl leading-tight text-center">
          {t("ctaTreatments")}
        </span>
      </div>
    </Link>
  </div>

  <Link
    href="/pre_consultation_intake_form"
    onClick={handleVideoConsultationClick}
    className="w-full px-4 sm:px-6 py-4 sm:py-6 flex items-center justify-between rounded-[14px] bg-gradient-to-br from-green-50 to-teal-50 border-2 border-green-400 hover:border-green-500 hover:shadow-md transition-all duration-200 relative overflow-hidden group"
  >
    {/* FREE 뱃지 */}
    <div className="absolute top-2 right-2 sm:top-3 sm:right-3 bg-green-500 text-white text-[10px] sm:text-xs font-bold px-2 sm:px-3 py-1 rounded-full shadow-sm">
      FREE
    </div>

    <div className="flex flex-col gap-1 sm:gap-2 text-left flex-1 pr-2">
      <div className="text-gray-900 text-xl sm:text-2xl md:text-3xl  font-extrabold">
        {t("ctaVideoConsultant")}
      </div>
      <div className="text-gray-700 text-xs sm:text-sm font-normal leading-snug">
        {t("videoConsultantDesc")}
      </div>
    </div>

    <div className="flex-shrink-0 ml-2 sm:ml-4">
      <Image
        src="/doctors/illust_video_consult.png"
        alt="Video Consultation"
        width={120}
        height={120}
        className="object-contain w-[80px] h-[80px] sm:w-[120px] sm:h-[120px] group-hover:scale-105 transition-transform duration-200"
      />
    </div>
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

      {/* Login Required Modal */}
      <LoginRequiredModal
        open={showLoginModal}
        onConfirm={handleLoginConfirm}
        onCancel={() => setShowLoginModal(false)}
      />

    </section>
  );
}
