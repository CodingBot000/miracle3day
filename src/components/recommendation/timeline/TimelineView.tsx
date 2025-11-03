import React from 'react';
import { RecommendedItem } from '@/app/recommend_estimate/SkinSurveyFlow/questionnaire/questionScript/matching';
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
