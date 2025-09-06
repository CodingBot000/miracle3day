"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import React, { useMemo } from "react";

type Card = {
  title: string;
  caption: string;
  bg: string;          // tailwind bg class
  img: { src: string; w: number; h: number; alt?: string };
};

const cards: Card[] = [
  {
    title: "Ulthera",
    caption: "Powerful lifting deep into the skin ✨",
    bg: "bg-rose-100",
    img: { src: "/treatment-media/ulthera.png", w: 920, h: 920, alt: "Ulthera" }
  },
  {
    title: "Thermage",
    caption: "Tighter skin with collagen regeneration",
    bg: "bg-orange-100",
    img: { src: "/treatment-media/thermage.png", w: 1446, h: 902, alt: "Thermage" }
  },
  {
    title: "InMode",
    caption: "Fat reduction + skin tightening for a sharp V-line",
    bg: "bg-amber-100",
    img: { src: "/treatment-media/inmode.png", w: 1296, h: 1296, alt: "InMode" }
  },
  {
    title: "Shurink",
    caption: "Comfortable HIFU lifting",
    bg: "bg-orange-200",
    img: { src: "/treatment-media/Shurink.png", w: 600, h: 1140, alt: "Shurink" }
  },
  {
    title: "ONDA",
    caption: "Body fat destruction & firming",
    bg: "bg-sky-100",
    img: { src: "/treatment-media/ONDA.png", w: 1446, h: 902, alt: "ONDA" }
  },
  {
    title: "Potenza",
    caption: "Improves pores, scars & skin texture",
    bg: "bg-yellow-100",
    img: { src: "/treatment-media/Potenza.png", w: 379, h: 800, alt: "Potenza" }
  },
  {
    title: "Rejuran",
    caption: "Skin-repair injection for fine lines & elasticity",
    bg: "bg-lime-100",
    img: { src: "/treatment-media/Rejuran.png", w: 2048, h: 1592, alt: "Rejuran" }
  },
  {
    title: "Stem Cell (Blood-derived)",
    caption: "Anti-aging from the root with cell regeneration",
    bg: "bg-violet-100",
    img: { src: "/treatment-media/Stemcell.png", w: 1024, h: 1536, alt: "Stem Cell" }
  }
];

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
            className="w-full h-12 px-6 flex items-center justify-center rounded-full bg-pink-400 text-white font-medium hover:bg-pink-500 transition-colors duration-200 shadow-sm"
          >
            Get My Recommendation
          </Link>
          <Link
            href="/faq"
            className="w-full h-12 px-6 flex items-center justify-center rounded-full border-2 border-pink-400 bg-white text-pink-400 font-medium hover:bg-pink-50 transition-colors duration-200"
          >
            Go to Korean Clinic
          </Link>
        </div>
        
      </motion.div>

      {/* Horizontal ticker (marquee) */}
      <div className="w-full max-w-[768px]">
        <MotionMarquee speed={75} gap={10}>
          {cards.map((card, idx) => (
            <motion.div
              key={idx}
              whileHover={{ scale: 1.02 }}
              className={`flex h-80 w-[270px] flex-col gap-3 overflow-hidden rounded-2xl p-6 ${card.bg} flex-shrink-0`}
            >
              <h3 className="text-2xl font-medium tracking-tight">{card.title}</h3>
              <p className="text-[15px] leading-snug text-neutral-700">{card.caption}</p>
              <div className="relative mt-auto">
                <Image
                  src={card.img.src}
                  alt={card.img.alt ?? card.title}
                  width={card.img.w}
                  height={card.img.h}
                  className="object-contain w-full h-auto"
                  priority={idx < 2}
                />
              </div>
            </motion.div>
          ))}
        </MotionMarquee>
      </div>

    </section>
  );
}

/** framer-motion을 사용한 무한 스크롤 마키 컴포넌트 */
function MotionMarquee({
  children,
  speed = 60,
  gap = 10,
}: {
  children: React.ReactNode;
  speed?: number;
  gap?: number;
}) {
  // 카드 개수에 따른 총 너비 계산 (카드 너비 270px + gap)
  const cardWidth = 270;
  const totalWidth = React.Children.count(children) * (cardWidth + gap);
  
  // 속도에 따른 애니메이션 지속 시간 계산
  const duration = totalWidth / speed;

  return (
    <div className="relative overflow-hidden">
      {/* 페이드 마스크 효과 */}
      <div 
        className="absolute inset-0 z-10 pointer-events-none"
        style={{
          background: "linear-gradient(to right, white 0%, transparent 10%, transparent 90%, white 100%)"
        }}
      />
      
      {/* 무한 스크롤 컨테이너 */}
      <div className="flex">
        <motion.div
          className="flex"
          style={{ gap }}
          animate={{
            x: [-totalWidth, 0]
          }}
          transition={{
            x: {
              repeat: Infinity,
              repeatType: "loop",
              duration: duration,
              ease: "linear"
            }
          }}
        >
          {children}
          {/* 무한 루프를 위한 복사본 */}
          {React.Children.map(children, (child, idx) => 
            React.cloneElement(child as React.ReactElement, {
              key: `duplicate-${idx}`,
              "aria-hidden": true
            })
          )}
        </motion.div>
      </div>
    </div>
  );
}
