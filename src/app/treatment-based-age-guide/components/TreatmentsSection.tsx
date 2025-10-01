import { Clock, DollarSign, Calendar, Timer } from 'lucide-react';
import Image from 'next/image';
import { Treatment } from '@/constants/treatment/antiaging-agebased';

interface TreatmentsSectionProps {
  title: string;
  treatments: Treatment[];
}

export function TreatmentsSection({ title, treatments }: TreatmentsSectionProps) {
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
                  <Calendar className="w-4 h-4" />
                  <span>{treatment.cycle}</span>
                </div>
              )}
              
              {treatment.interval && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span>{treatment.interval}</span>
                </div>
              )}
              
              {treatment.duration && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock className="w-4 h-4" />
                  <span>{treatment.duration}</span>
                </div>
              )}
              
              {treatment.time && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Timer className="w-4 h-4" />
                  <span>{treatment.time}</span>
                </div>
              )}
              
              {treatment.cost && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <DollarSign className="w-4 h-4" />
                  <span>{treatment.cost}</span>
                </div>
              )}
              
              {treatment.onset && (
                <div className="text-xs text-purple-600 bg-purple-50 px-2 py-1 rounded">
                  {treatment.onset}
                </div>
              )}
              
              {treatment.downtime && (
                <div className="text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded">
                  다운타임: {treatment.downtime}
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