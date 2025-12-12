"use client";

import React from 'react';
import textsData from './consultation-guide-texts.json';

interface StepData {
  number: string;
  title: string;
  description: string;
  icon: string;
  note?: string;
  highlight?: string;
  suffix?: string;
}

interface ConsultationGuidePageProps {
  locale?: string;
  onStart: () => void;
}

type LocaleKey = keyof typeof textsData;

const ConsultationGuidePage: React.FC<ConsultationGuidePageProps> = ({ locale = 'en', onStart }) => {
  // Get texts based on locale, fallback to English
  const texts = textsData[locale as LocaleKey] || textsData.en;

  const steps: StepData[] = [
    {
      ...texts.step1,
      icon: '📝',
    },
    {
      ...texts.step2,
      icon: '📅',
    },
    {
      ...texts.step3,
      icon: '✓',
    },
    {
      ...texts.step4,
      icon: '💬',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-rose-50/30">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap');

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-6px);
          }
        }

        .animate-fadeInUp {
          animation: fadeInUp 0.8s ease-out forwards;
        }

        .animate-scaleIn {
          animation: scaleIn 0.6s ease-out forwards;
        }

        .step-card {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .step-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 24px rgba(255, 107, 157, 0.12);
        }

        .step-number {
          background: linear-gradient(135deg, #FF6B9D 0%, #C94277 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .cta-button {
          background: linear-gradient(135deg, #FF6B9D 0%, #C94277 100%);
          transition: all 0.3s ease;
          box-shadow: 0 8px 24px rgba(255, 107, 157, 0.3);
        }

        .cta-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 32px rgba(255, 107, 157, 0.4);
        }

        .cta-button:active {
          transform: translateY(0);
        }

        .highlight-text {
          background: linear-gradient(135deg, #FF6B9D 0%, #C94277 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          font-weight: 700;
        }

        .icon-wrapper {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>

      {/* Mobile-first container: max-width for desktop, centered */}
      <div className="w-full max-w-md mx-auto px-5 py-8 sm:py-12">
        {/* Header */}
        <div className="text-center mb-10 sm:mb-14 animate-fadeInUp">
          <h2 className="text-xl sm:text-2xl font-light text-gray-600 mb-1">
            {texts.title}
          </h2>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight">
            {texts.subtitle}
          </h1>
        </div>

        {/* Steps */}
        <div className="space-y-5 sm:space-y-6 mb-10 sm:mb-12">
          {steps.map((step, index) => (
            <div
              key={index}
              className="step-card bg-white rounded-2xl p-5 sm:p-6 border border-gray-100 shadow-sm animate-fadeInUp"
              style={{
                animationDelay: `${index * 0.1}s`,
                opacity: 0,
              }}
            >
              {/* Step Number & Icon */}
              <div className="flex items-start gap-3 sm:gap-4 mb-3">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br from-pink-50 to-rose-50 flex items-center justify-center icon-wrapper">
                    <span className="text-xl sm:text-2xl">{step.icon}</span>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="step-number text-xs sm:text-sm font-semibold mb-0.5 tracking-wider">
                    {step.number}
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 leading-snug">
                    {step.title}
                  </h3>
                </div>
              </div>

              {/* Description */}
              <div className="pl-[60px] sm:pl-[72px]">
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed mb-1.5">
                  {step.description}
                </p>

                {/* Highlight for Step 4 */}
                {step.highlight && (
                  <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                    <span className="highlight-text text-base sm:text-lg">
                      {step.highlight}
                    </span>
                    {step.suffix && (
                      <span className="text-gray-600"> {step.suffix}</span>
                    )}
                  </p>
                )}

                {/* Note */}
                {step.note && (
                  <p className="text-xs sm:text-sm text-gray-400 italic mt-2">
                    {step.note}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* CTA Button - Fixed at bottom on mobile */}
        <div className="animate-scaleIn" style={{ opacity: 0, animationDelay: '0.5s' }}>
          <button
            className="cta-button w-full py-4 sm:py-5 rounded-2xl text-white font-semibold text-base sm:text-lg"
            onClick={onStart}
          >
            {texts.cta}
          </button>
        </div>

        {/* Bottom spacing for safe area */}
        <div className="h-6 sm:h-8" />
      </div>
    </div>
  );
};

export default ConsultationGuidePage;
