'use client';

import { SkinTypes } from '@/constants/treatment/antiaging-agebased';
import Image from 'next/image';
import { useState } from 'react';

interface SkinTypesSectionProps {
  title: string;
  skinTypes: SkinTypes;
}

const skinTypeIcons = {
  dry: '/icons/treatment/icon_skin_dry.svg',
  oily: '/icons/treatment/icon_skin_oily.svg',
  sensitive: '/icons/treatment/icon_skin_sensitive.svg',
  combination: '/icons/treatment/icon_skin_combination.svg',
};

const skinTypeLabels = {
  dry: 'Dry',
  oily: 'Oily',
  sensitive: 'Sensitive',
  combination: 'Combination',
};

const skinTypeColors = {
  dry: 'text-blue-500',
  oily: 'text-yellow-500',
  sensitive: 'text-green-500',
  combination: 'text-purple-500',
};

export function SkinTypesSection({ title, skinTypes }: SkinTypesSectionProps) {
  const skinTypeEntries = Object.entries(skinTypes).filter(([_, value]) => value);
  const [selectedType, setSelectedType] = useState<string>(skinTypeEntries[0]?.[0] || 'dry');

  const selectedDescription = skinTypes[selectedType as keyof typeof skinTypes];

  return (
    <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 md:p-8 shadow-sm border border-white/30">
      <h3 className="text-2xl md:text-3xl font-bold mb-6 text-gray-800">
        {title}
      </h3>

      {/* Tab Buttons */}
      <div className="flex gap-3 mb-6 bg-gray-100 rounded-full p-2">
        {skinTypeEntries.map(([type]) => {
          const iconPath = skinTypeIcons[type as keyof typeof skinTypeIcons];
          const label = skinTypeLabels[type as keyof typeof skinTypeLabels];
          const colorClass = skinTypeColors[type as keyof typeof skinTypeColors];
          const isSelected = selectedType === type;

          return (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`flex-1 flex flex-col md:flex-row items-center justify-center gap-1 md:gap-2 py-2 md:py-3 px-2 md:px-4 rounded-full transition-all ${
                isSelected
                  ? 'bg-white shadow-md'
                  : 'bg-transparent hover:bg-white/50'
              }`}
            >
              <Image
                src={iconPath}
                alt={label}
                width={32}
                height={32}
                className={`w-8 h-8 ${isSelected ? colorClass : 'opacity-50'}`}
              />
              <span className={`text-xs md:text-base font-semibold ${isSelected ? 'text-gray-900' : 'text-gray-500'}`}>
                {label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="bg-white/70 rounded-xl p-6 border border-gray-200/50">
        <p className="text-gray-700 text-sm md:text-base leading-relaxed whitespace-pre-line">
          {selectedDescription}
        </p>
      </div>
    </div>
  );
}