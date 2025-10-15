"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import React from "react";
import { cards } from "@/content/deviceContents";


export default function ScrollDevicesIntroduce() {
  return (
    <div className="w-full max-w-[768px]">
      <MotionMarquee speed={75} gap={10}>
        {cards.map((card, idx) => (
          <Link
            key={idx}
            href={`/treatments_info?treatment=${card.key}`}
            className="block"
          >
            <motion.div
              whileHover={{ scale: 1.02 }}
              className={`flex h-80 w-[270px] flex-col gap-3 overflow-hidden rounded-2xl p-6 ${card.bg} flex-shrink-0 cursor-pointer transition-transform duration-200 hover:shadow-lg`}
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
          </Link>
        ))}
      </MotionMarquee>
    </div>
  );
}

function MotionMarquee({
  children,
  speed = 60,
  gap = 10,
}: {
  children: React.ReactNode;
  speed?: number;
  gap?: number;
}) {
  const cardWidth = 270;
  const totalWidth = React.Children.count(children) * (cardWidth + gap);
  const duration = totalWidth / speed;

  return (
    <div className="relative overflow-hidden">
      <div
        className="absolute inset-0 z-10 pointer-events-none"
        style={{
          background: "linear-gradient(to right, white 0%, transparent 10%, transparent 90%, white 100%)"
        }}
      />
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
