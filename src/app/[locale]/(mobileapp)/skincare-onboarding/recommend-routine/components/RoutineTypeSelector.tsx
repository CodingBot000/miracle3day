'use client';

import { useState, useRef } from 'react';
import RoutineTypeCard from './RoutineTypeCard';

interface RoutineTypeSelectorProps {
  onSelect: (routineType: 'basic' | 'intermediate' | 'advanced') => void;
  isLoading?: boolean;
}

export default function RoutineTypeSelector({ onSelect, isLoading }: RoutineTypeSelectorProps) {
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [activeIndex, setActiveIndex] = useState(1); // Start with recommended (intermediate)
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const routineTypes = [
    {
      type: 'basic',
      icon: '🌱',
      title: 'Basic',
      description: 'Perfect for beginners or busy lifestyles',
      steps: { morning: 3, midday: 1, evening: 3 },
      totalSteps: 7,
      timeEstimate: '< 7 minutes',
      features: [
        'Essential skincare only',
        'Sunscreen reapplication at midday',
        'Quick and simple'
      ],
      recommended: false
    },
    {
      type: 'intermediate',
      icon: '✨',
      title: 'Intermediate',
      description: 'Balanced routine with targeted treatments',
      steps: { morning: 5, midday: 2, evening: 5 },
      totalSteps: 12,
      timeEstimate: '8-12 minutes',
      features: [
        'All basics covered',
        'Serums & treatments',
        'Midday oil control & hydration',
        'Climate-optimized'
      ],
      recommended: true
    },
    {
      type: 'advanced',
      icon: '🚀',
      title: 'Advanced',
      description: 'Comprehensive multi-step routine',
      steps: { morning: 7, midday: 3, evening: 9 },
      totalSteps: 19,
      timeEstimate: '15-20 minutes',
      features: [
        'Full skincare ritual',
        'Multiple treatment layers',
        'Comprehensive midday care',
        'Eye & neck care',
        'Weekly masks & exfoliants'
      ],
      recommended: false
    }
  ];

  const handleSelect = (type: string) => {
    setSelectedType(type);
    onSelect(type as 'basic' | 'intermediate' | 'advanced');
  };

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const scrollLeft = container.scrollLeft;
      const cardWidth = container.offsetWidth * 0.85; // 85% width per card
      const newIndex = Math.round(scrollLeft / cardWidth);
      setActiveIndex(Math.min(Math.max(newIndex, 0), routineTypes.length - 1));
    }
  };

  return (
    <div className="w-full">
      {/* Mobile: Horizontal scroll with peek */}
      <div className="md:hidden">
        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide gap-4 pb-4 -mx-4 px-4"
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            WebkitOverflowScrolling: 'touch'
          }}
        >
          {routineTypes.map((routine, index) => (
            <div
              key={routine.type}
              className="flex-shrink-0 snap-center"
              style={{ width: '85%' }}
            >
              <RoutineTypeCard
                {...routine}
                selected={selectedType === routine.type}
                onSelect={() => handleSelect(routine.type)}
                disabled={isLoading}
              />
            </div>
          ))}
        </div>

        {/* Pagination dots */}
        <div className="flex justify-center gap-2 mt-4">
          {routineTypes.map((routine, index) => (
            <button
              key={routine.type}
              onClick={() => {
                if (scrollContainerRef.current) {
                  const cardWidth = scrollContainerRef.current.offsetWidth * 0.85;
                  scrollContainerRef.current.scrollTo({
                    left: index * cardWidth,
                    behavior: 'smooth'
                  });
                }
              }}
              className={`
                w-2.5 h-2.5 rounded-full transition-all duration-300
                ${index === activeIndex
                  ? 'bg-blue-600 w-6'
                  : 'bg-gray-300 hover:bg-gray-400'
                }
              `}
              aria-label={`Go to ${routine.title}`}
            />
          ))}
        </div>

        {/* Swipe hint */}
        <p className="text-center text-sm text-gray-500 mt-3">
          ← Swipe to see more options →
        </p>
      </div>

      {/* Desktop: Grid layout */}
      <div className="hidden md:grid md:grid-cols-3 gap-6">
        {routineTypes.map((routine) => (
          <RoutineTypeCard
            key={routine.type}
            {...routine}
            selected={selectedType === routine.type}
            onSelect={() => handleSelect(routine.type)}
            disabled={isLoading}
          />
        ))}
      </div>

      {/* Hide scrollbar CSS */}
      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}
