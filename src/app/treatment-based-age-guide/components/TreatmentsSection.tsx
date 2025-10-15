import { Clock, DollarSign, Calendar, Timer } from 'lucide-react';
import Image from 'next/image';
import { Treatment } from '@/constants/treatment/antiaging-agebased';
import { useLanguage } from '@/contexts/LanguageContext';

interface TreatmentsSectionProps {
  title: string;
  treatments: Treatment[];
}

const labels = {
  ko: {
    cycle: '주기',
    interval: '간격',
    duration: '지속기간',
    time: '소요시간',
    cost: '비용',
    onset: '효과발현',
    downtime: '회복시간'
  },
  en: {
    cycle: 'Cycle',
    interval: 'Interval',
    duration: 'Duration',
    time: 'Time',
    cost: 'Cost',
    onset: 'Onset',
    downtime: 'Downtime'
  }
};

export function TreatmentsSection({ title, treatments }: TreatmentsSectionProps) {
  const { language } = useLanguage();
  return (
    <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 md:p-8 shadow-sm border border-white/30">
      <h3 className="text-2xl md:text-3xl font-bold mb-6 text-gray-800">
        {title}
      </h3>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {treatments.map((treatment, index) => (
          <div key={treatment.id} className="bg-white/70 rounded-xl overflow-hidden border border-gray-200/50 shadow-sm hover:shadow-md transition-shadow">
            {treatment.imageUrl && (
              <div className="relative h-48 w-full">
                <Image
                  src={treatment.imageUrl}
                  alt={treatment.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              </div>
            )}
            <div className="p-6">
              <h4 className="font-bold text-lg text-gray-800 mb-3">
                {treatment.name}
              </h4>
              <p className="text-gray-700 text-sm mb-4 leading-relaxed">
                {treatment.effect}
              </p>
              
              <div className="space-y-2">
              {treatment.cycle && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="w-4 h-4 flex-shrink-0" />
                  <span className="font-medium">{labels[language].cycle}:</span>
                  <span>{treatment.cycle}</span>
                </div>
              )}

              {treatment.interval && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="w-4 h-4 flex-shrink-0" />
                  <span className="font-medium">{labels[language].interval}:</span>
                  <span>{treatment.interval}</span>
                </div>
              )}

              {treatment.duration && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock className="w-4 h-4 flex-shrink-0" />
                  <span className="font-medium">{labels[language].duration}:</span>
                  <span>{treatment.duration}</span>
                </div>
              )}

              {treatment.time && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Timer className="w-4 h-4 flex-shrink-0" />
                  <span className="font-medium">{labels[language].time}:</span>
                  <span>{treatment.time}</span>
                </div>
              )}

              {treatment.cost && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <DollarSign className="w-4 h-4 flex-shrink-0" />
                  <span className="font-medium">{labels[language].cost}:</span>
                  <span>{treatment.cost}</span>
                </div>
              )}

              {treatment.onset && (
                <div className="flex items-center gap-2 text-xs text-purple-600 bg-purple-50 px-2 py-1 rounded">
                  <span className="font-medium">{labels[language].onset}:</span>
                  <span>{treatment.onset}</span>
                </div>
              )}

              {treatment.downtime && (
                <div className="flex items-center gap-2 text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded">
                  <span className="font-medium">{labels[language].downtime}:</span>
                  <span>{treatment.downtime}</span>
                </div>
              )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}