import React from 'react';
import { RecommendedItem } from '@/app/[locale]/(consult)/recommend_estimate/SkinSurveyFlow/questionnaire/questionScript/matching';
import TimelineItem from './TimelineItem';
import JourneyPath from './JourneyPath';

export interface TimelineViewProps {
  recommendations: RecommendedItem[];
}

const TimelineView: React.FC<TimelineViewProps> = ({ recommendations }) => {
  // Calculate estimated duration based on treatment count
  // Assume average spacing of 2-4 weeks between treatments
  const estimateDuration = (count: number): string => {
    if (count === 1) return 'Single Session';
    if (count <= 3) return '1-2 Months';
    if (count <= 5) return '2-3 Months';
    return '3-4 Months';
  };

  const totalSessions = recommendations.length;
  const estimatedDuration = estimateDuration(totalSessions);

  // Sort treatments by importance (1 = highest priority)
  const sortedTreatments = [...recommendations].sort((a, b) => {
    const aImportance = (a as any).importance || 2;
    const bImportance = (b as any).importance || 2;
    return aImportance - bImportance;
  });

  return (
    <div className="max-w-4xl mx-auto">
      {/* Journey overview */}
      <JourneyPath
        totalSessions={totalSessions}
        estimatedDuration={estimatedDuration}
      />

      {/* Tier Legend */}
      <div className="mb-8 p-5 bg-white rounded-2xl shadow-lg shadow-gray-200/50 border border-gray-100">
        <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">
          Treatment Categories
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          {/* Tier 1 - Dermatology */}
          <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-xl">
            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
              {/* <span className="text-white font-bold text-xs">1</span> */}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-blue-900 text-sm">Dermatology</p>
              <p className="text-xs text-blue-700 mt-0.5 leading-relaxed">
                Skin health, acne, pigmentation & texture treatments
              </p>
            </div>
          </div>

          {/* Tier 2 - Anti-Aging */}
          <div className="flex items-start gap-3 p-3 bg-green-50 rounded-xl">
            <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
              {/* <span className="text-white font-bold text-xs">2</span> */}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-green-900 text-sm">Anti-Aging</p>
              <p className="text-xs text-green-700 mt-0.5 leading-relaxed">
                Wrinkle reduction, lifting & skin rejuvenation
              </p>
            </div>
          </div>

          {/* Tier 3 - Facial Contouring */}
          <div className="flex items-start gap-3 p-3 bg-pink-50 rounded-xl">
            <div className="w-8 h-8 rounded-full bg-pink-500 flex items-center justify-center flex-shrink-0">
              {/* <span className="text-white font-bold text-xs">3</span> */}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-pink-900 text-sm">Facial Contouring</p>
              <p className="text-xs text-pink-700 mt-0.5 leading-relaxed">
                V-line, jawline & facial reshaping procedures
              </p>
            </div>
          </div>

          {/* Other Treatments */}
          <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
            <div className="w-8 h-8 rounded-full bg-gray-500 flex items-center justify-center flex-shrink-0">
              {/* <span className="text-white font-bold text-xs">3</span> */}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900 text-sm">Specialty Care</p>
              <p className="text-xs text-gray-700 mt-0.5 leading-relaxed">
                Body treatments, hair care & specialized procedures
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Timeline items */}
      <div className="space-y-0">
        {sortedTreatments.map((treatment, index) => {
          // Try to infer tier from treatment metadata
          const tier = (treatment as any).tier as 1 | 2 | 3 | undefined;

          return (
            <TimelineItem
              key={`${treatment.key}-${index}`}
              treatment={treatment}
              sessionNumber={index + 1}
              isLast={index === sortedTreatments.length - 1}
              tier={tier}
            />
          );
        })}
      </div>

      {/* Completion message */}
      <div className="mt-8 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full mb-4">
          <svg
            className="w-8 h-8 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Your Journey to Beautiful Skin
        </h3>
        <p className="text-gray-600">
          Follow this personalized timeline to achieve your aesthetic goals
        </p>
      </div>
    </div>
  );
};

export default TimelineView;
