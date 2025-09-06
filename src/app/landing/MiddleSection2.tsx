"use client";

import React from "react";
import Image from "next/image";

type ProcessStep = {
  number: number;
  title: string;
  description: string;
};

const steps: ProcessStep[] = [
  {
    number: 1,
    title: "Upload a photo",
    description: "Share a photo of the area you're concerned about for accurate analysis."
  },
  {
    number: 2,
    title: "Answer quick questions", 
    description: "Tell us about your current skin condition and concerns."
  },
  {
    number: 3,
    title: "Get expert recommendation",
    description: "Based on your photo and answers, certified Korean doctors recommend the most effective treatments."
  },
  {
    number: 4,
    title: "Book a consultation",
    description: "Connect directly with a trusted clinic to schedule your treatment."
  }
];

export default function MiddleSection2() {
  return (
    <section className="w-full py-16 px-4 bg-white">
      <div className="max-w-4xl mx-auto text-center">
        {/* How It Works */}
        <p className="text-pink-400 text-sm font-medium mb-4 uppercase tracking-wide">
          How It Works
        </p>

        {/* Main Title */}
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-12">
          How to get treatment
          <br />
          recommendations
        </h2>

        {/* Face Icon */}
        <div className="mb-16 flex justify-center">
          <div className="relative">
            <Image
              src="/icons/face_icon.png"
              alt="Face Analysis Icon"
              width={200}
              height={200}
              className="mx-auto"
            />
          </div>
        </div>

        {/* Process Steps */}
        <div className="max-w-2xl mx-auto">
          {steps.map((step, index) => (
            <div key={step.number} className="flex items-start gap-4 mb-8 last:mb-0">
              {/* Number Circle */}
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-pink-400 text-white rounded-full flex items-center justify-center font-semibold text-lg">
                  {step.number}
                </div>
                {/* Connection Line */}
                {index < steps.length - 1 && (
                  <div className="w-0.5 h-12 bg-pink-200 mx-auto mt-2"></div>
                )}
              </div>

              {/* Text Content */}
              <div className="text-left pt-1">
                <h3 className="font-semibold text-gray-900 text-lg mb-2">
                  {step.title}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}