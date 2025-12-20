'use client';

import { useEffect, useRef, useState } from 'react';
import { useLocale } from 'next-intl';

// 다국어 번역 데이터
const translations = {
  en: {
    title: {
      line1: "Trusted K-Beauty,",
      line2: "Proven by Numbers"
    },
    stats: [
      {
        number: "1.17M",
        label: "International patients visited Korea in 2024",
        sublabel: "Record high"
      },
      {
        number: "56.6%",
        label: "Visited dermatology clinics",
        sublabel: "Overwhelming #1"
      },
      {
        number: "500+",
        label: "Dermatology & plastic surgery clinics in Gangnam",
        sublabel: "World's highest density"
      }
    ],
    source: "Ministry of Health & Welfare, 2024"
  },
  ko: {
    title: {
      line1: "믿을 수 있는 K-뷰티,",
      line2: "숫자로 확인하세요"
    },
    stats: [
      {
        number: "117만 명",
        label: "2024년 한국을 찾은 외국인 환자",
        sublabel: "역대 최대 기록"
      },
      {
        number: "56.6%",
        label: "피부과 방문 비율",
        sublabel: "압도적 1위"
      },
      {
        number: "500+",
        label: "강남 피부과·성형외과",
        sublabel: "세계 최고 밀집도"
      }
    ],
    source: "보건복지부, 2024"
  },
  ja: {
    title: {
      line1: "信頼できるKビューティー、",
      line2: "数字で証明します"
    },
    stats: [
      {
        number: "117万人",
        label: "2024年に韓国を訪れた外国人患者",
        sublabel: "過去最高記録"
      },
      {
        number: "56.6%",
        label: "皮膚科訪問率",
        sublabel: "圧倒的1位"
      },
      {
        number: "500+",
        label: "江南の皮膚科・美容外科",
        sublabel: "世界最高密度"
      }
    ],
    source: "保健福祉部、2024"
  },
  'zh-CN': {
    title: {
      line1: "值得信赖的韩国医美，",
      line2: "数据见证实力"
    },
    stats: [
      {
        number: "117万人",
        label: "2024年访问韩国的外国患者",
        sublabel: "历史最高纪录"
      },
      {
        number: "56.6%",
        label: "皮肤科就诊比例",
        sublabel: "压倒性第一"
      },
      {
        number: "500+",
        label: "江南皮肤科·整形外科",
        sublabel: "全球最高密度"
      }
    ],
    source: "保健福祉部，2024"
  },
  'zh-TW': {
    title: {
      line1: "值得信賴的韓國醫美，",
      line2: "數據見證實力"
    },
    stats: [
      {
        number: "117萬人",
        label: "2024年訪問韓國的外國患者",
        sublabel: "歷史最高紀錄"
      },
      {
        number: "56.6%",
        label: "皮膚科就診比例",
        sublabel: "壓倒性第一"
      },
      {
        number: "500+",
        label: "江南皮膚科·整形外科",
        sublabel: "全球最高密度"
      }
    ],
    source: "保健福祉部，2024"
  }
};

interface StatCardProps {
  number: string;
  label: string;
  sublabel?: string;
  delay?: number;
}

function StatCard({ number, label, sublabel, delay = 0 }: StatCardProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [count, setCount] = useState(0);
  const cardRef = useRef<HTMLDivElement>(null);

  const numericValue = parseInt(number.replace(/[^0-9]/g, ''));
  const suffix = number.replace(/[0-9]/g, '');

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.3 }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    const duration = 1000;
    const steps = 60;
    const increment = numericValue / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= numericValue) {
        setCount(numericValue);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [isVisible, numericValue]);

  return (
    <div
      ref={cardRef}
      className="group relative md:flex-1 md:min-w-0 w-[280px] snap-center flex-shrink-0 md:flex-shrink"
      style={{
        opacity: isVisible ? 1 : 0,
        transition: `opacity 0.8s ease-in-out`
      }}
    >
      <div className="absolute -inset-0.5 bg-gradient-to-r from-rose-100 via-amber-50 to-rose-100 rounded-2xl opacity-0 group-hover:opacity-100 blur transition-all duration-500" />

      <div className="relative flex flex-col bg-white rounded-2xl p-4 md:p-6 shadow-lg hover:shadow-2xl transition-all duration-500 border border-stone-100 overflow-hidden">

        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-rose-50/50 to-transparent rounded-bl-full" />

        <div className="relative mb-3">
          <div className="text-2xl md:text-4xl font-serif font-bold bg-gradient-to-br from-stone-800 via-stone-700 to-stone-600 bg-clip-text text-transparent">
            {isVisible ? count.toLocaleString() : '0'}{suffix}
          </div>

          <div
            className="h-1 bg-gradient-to-r from-rose-400 to-amber-400 mt-2 rounded-full"
            style={{
              width: isVisible ? '100%' : '0%',
              transition: `width 1.2s cubic-bezier(0.4, 0, 0.2, 1) ${delay + 400}ms`
            }}
          />
        </div>

        <div className="relative">
          <div className="text-sm md:text-base font-medium text-stone-700 leading-relaxed break-words">
            {label}
          </div>
          {sublabel && (
            <div className="text-xs md:text-sm text-stone-500 mt-1">
              {sublabel}
            </div>
          )}
        </div>

        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        </div>
      </div>
    </div>
  );
}

export default function TrustStatistics() {
  const locale = useLocale();
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // 현재 언어에 맞는 번역 가져오기 (fallback to English)
  const t = translations[locale as keyof typeof translations] || translations.en;

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const scrollLeft = container.scrollLeft;
      const containerWidth = container.offsetWidth;
      const scrollWidth = container.scrollWidth;

      const maxScroll = scrollWidth - containerWidth;
      const scrollPercentage = maxScroll > 0 ? scrollLeft / maxScroll : 0;
      const index = Math.round(scrollPercentage * (t.stats.length - 1));

      setActiveIndex(Math.min(Math.max(index, 0), t.stats.length - 1));
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [t.stats.length]);

  return (
    <div className="py-6 pb-25">
      <div className="max-w-7xl mx-auto px-4">
        
        {/* Section Header */}
        <div className="text-center mb-4 md:mb-6">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-stone-900 mb-6 leading-tight">
            {t.title.line1}
            <br />
            <span className="bg-gradient-to-r from-rose-600 via-rose-500 to-amber-500 bg-clip-text text-transparent">
              {t.title.line2}
            </span>
          </h2>
        </div>

        {/* Desktop: Grid Layout */}
        <div className="hidden md:grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6 max-w-6xl mx-auto mb-4">
          {t.stats.map((stat, index) => (
            <StatCard
              key={index}
              number={stat.number}
              label={stat.label}
              sublabel={stat.sublabel}
              delay={index * 150}
            />
          ))}
        </div>

        {/* Mobile: Horizontal Scroll */}
        <div className="md:hidden">
          <div
            ref={scrollContainerRef}
            className="flex gap-3 overflow-x-auto overflow-y-hidden snap-x snap-mandatory px-4 pb-2 scrollbar-hide"
            style={{
              WebkitOverflowScrolling: 'touch'
            }}
          >
            {t.stats.map((stat, index) => (
              <StatCard
                key={index}
                number={stat.number}
                label={stat.label}
                sublabel={stat.sublabel}
                delay={0}
              />
            ))}
          </div>

          {/* Scroll Indicators */}
          <div className="flex justify-center gap-2 mt-4">
            {t.stats.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  const container = scrollContainerRef.current;
                  if (container) {
                    container.scrollTo({
                      left: index * container.offsetWidth,
                      behavior: 'smooth'
                    });
                  }
                }}
                className={`h-2 rounded-full transition-all duration-300 ${
                  activeIndex === index 
                    ? 'w-8 bg-gradient-to-r from-rose-400 to-amber-400' 
                    : 'w-2 bg-stone-300'
                }`}
                aria-label={`Go to stat ${index + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Bottom Accent */}
        <div className="mt-1 text-right">
          <div className="inline-flex items-center gap-2 text-sm text-stone-500">
            <div className="w-12 h-[1px] bg-gradient-to-r from-transparent to-stone-300" />
            <span>{t.source}</span>
            <div className="w-12 h-[1px] bg-gradient-to-l from-transparent to-stone-300" />
          </div>
        </div>
      </div>

    </div>
  );
}