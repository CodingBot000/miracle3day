import { Concern } from '@/constants/treatment/antiaging-agebased';
import Image from 'next/image';

interface ConcernsSectionProps {
  title: string;
  concerns: Concern[];
}

const concernIcons = {
  0: '/icons/treatment/icon_uneven_skin_tone.svg',
  1: '/icons/treatment/icon_pigmentation_uv_memory.svg',
  2: '/icons/treatment/icon_uv_protection_shield.svg',
  3: '/icons/treatment/icon_pores_acne_marks.svg',
};

export function ConcernsSection({ title, concerns }: ConcernsSectionProps) {
  return (
    <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 md:p-8 shadow-sm border border-white/30">
      <h3 className="text-2xl md:text-3xl font-bold mb-6 text-gray-800">
        {title}
      </h3>
      <div className="grid gap-6 md:grid-cols-2">
        {concerns.map((concern, index) => {
          const iconPath = concernIcons[index as keyof typeof concernIcons] || concernIcons[0];

          return (
            <div key={index} className="flex gap-4 p-4 bg-white/50 rounded-lg border border-gray-200/50">
              <div className="flex-shrink-0">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                  <Image
                    src={iconPath}
                    alt={concern.name}
                    width={48}
                    height={48}
                    className="w-12 h-12"
                  />
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">
                  {concern.name}
                </h4>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {concern.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}