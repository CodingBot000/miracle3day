'use client';

import { useState, useRef } from 'react';
import RoutineDetailCard from './RoutineDetailCard';
import { RoutineData } from '../page';

interface RoutineCarouselProps {
  routines: {
    basic: RoutineData | null;
    intermediate: RoutineData | null;
    advanced: RoutineData | null;
  };
  selectedRoutine: 'basic' | 'intermediate' | 'advanced';
  onSelectRoutine: (type: 'basic' | 'intermediate' | 'advanced') => void;
  isLoading: boolean;
}

export default function RoutineCarousel({
  routines,
  selectedRoutine,
  onSelectRoutine,
  isLoading
}: RoutineCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(1); // 0: Basic, 1: Intermediate, 2: Advanced
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const routineTypes: Array<'basic' | 'intermediate' | 'advanced'> = [
    'basic',
    'intermediate',
    'advanced'
  ];

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const scrollLeft = container.scrollLeft;
      const cardWidth = container.offsetWidth * 0.85;
      const newIndex = Math.round(scrollLeft / cardWidth);
      setCurrentIndex(Math.min(Math.max(newIndex, 0), routineTypes.length - 1));
    }
  };

  const scrollToIndex = (index: number) => {
    if (scrollContainerRef.current) {
      const cardWidth = scrollContainerRef.current.offsetWidth * 0.85;
      scrollContainerRef.current.scrollTo({
        left: index * cardWidth,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* 인디케이터 */}
      <div className="flex justify-center items-center gap-3 py-4 bg-white border-b border-gray-100">
        {routineTypes.map((type, index) => (
          <button
            key={type}
            onClick={() => scrollToIndex(index)}
            className={`
              px-4 py-2 rounded-full text-sm font-medium transition-all
              ${index === currentIndex
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }
            `}
          >
            {type === 'basic' && 'Basic'}
            {type === 'intermediate' && 'Intermediate'}
            {type === 'advanced' && 'Advanced'}
          </button>
        ))}
      </div>

      {/* 페이지 도트 */}
      <div className="flex justify-center gap-2 py-2 bg-white">
        {routineTypes.map((type, index) => (
          <button
            key={type}
            onClick={() => scrollToIndex(index)}
            className={`
              h-2 rounded-full transition-all
              ${index === currentIndex ? 'w-6 bg-blue-600' : 'w-2 bg-gray-300'}
            `}
            aria-label={`Go to ${type} routine`}
          />
        ))}
      </div>

      {/* 카드 영역 (좌우 스와이핑) */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 flex overflow-x-auto snap-x snap-mandatory scrollbar-hide gap-4 px-4 py-4 pb-28"
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          WebkitOverflowScrolling: 'touch'
        }}
      >
        {routineTypes.map((type, index) => (
          <div
            key={type}
            className="flex-shrink-0 snap-center"
            style={{ width: '85%' }}
          >
            <RoutineDetailCard
              routine={routines[type]}
              type={type}
              isSelected={selectedRoutine === type}
              onSelect={() => onSelectRoutine(type)}
              isLoading={isLoading}
              isRecommended={type === 'intermediate'}
            />
          </div>
        ))}
      </div>

      {/* 스와이프 힌트 */}
      <div className="text-center text-xs text-gray-400 pb-2 bg-gray-50">
        ← Swipe to compare →
      </div>

      {/* 스크롤바 숨기기 CSS */}
      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}
