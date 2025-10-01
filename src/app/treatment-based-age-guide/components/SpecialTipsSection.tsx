import { Lightbulb, CheckCircle } from 'lucide-react';
import { SpecialTips } from '@/constants/treatment/antiaging-agebased';

interface SpecialTipsSectionProps {
  title: string;
  specialTips: SpecialTips;
}

export function SpecialTipsSection({ title, specialTips }: SpecialTipsSectionProps) {
  return (
    <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 md:p-8 shadow-sm border border-white/30">
      <h3 className="text-2xl md:text-3xl font-bold mb-6 text-gray-800 flex items-center gap-3">
        <Lightbulb className="w-8 h-8 text-yellow-500" />
        {title}
      </h3>
      
      <div className="space-y-8">
        {specialTips.subsections.map((subsection, index) => (
          <div key={index} className="bg-white/70 rounded-xl p-6 border border-gray-200/50">
            <h4 className="font-bold text-lg text-gray-800 mb-4">
              {subsection.title}
            </h4>
            <ul className="space-y-3">
              {subsection.tips.map((tip, tipIndex) => (
                <li key={tipIndex} className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700 text-sm leading-relaxed">
                    {tip}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}