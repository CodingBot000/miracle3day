import React, { useState } from 'react';
import { RecommendationOutput } from '@/app/(site)/recommend_estimate/SkinSurveyFlow/questionnaire/questionScript/matching';
import RecommendationHeader from './RecommendationHeader';
import ViewToggle from './common/ViewToggle';
import CardView from './card/CardView';
import TimelineView from './timeline/TimelineView';
import ExcludedSection from './ExcludedSection';
import ActionButtons from './ActionButtons';
import ShareModal from './ShareModal';
import { Card } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';

export interface RecommendationResultProps {
  output: RecommendationOutput;
  formData?: Record<string, any>;
  onFindClinics?: () => void;
  onConsult?: () => void;
}

const RecommendationResult: React.FC<RecommendationResultProps> = ({
  output,
  formData,
  onFindClinics,
  onConsult,
}) => {
  const [viewMode, setViewMode] = useState<'card' | 'timeline'>('card');
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8">
      {/* Header with summary */}
      <RecommendationHeader
        totalPriceKRW={output.totalPriceKRW}
        totalPriceUSD={output.totalPriceUSD}
        treatmentCount={output.recommendations.length}
        notes={output.notes}
        budgetRangeId={output.budgetRangeId}
        budgetUpperLimit={output.budgetUpperLimit}
      />

      {/* No recommendations message */}
      {output.recommendations.length === 0 ? (
        <Card className="mt-6 p-8 bg-gray-50 border-gray-200">
          <div className="flex flex-col items-center justify-center text-center space-y-4">
            <div className="p-4 bg-gray-200 rounded-full">
              <AlertCircle className="w-12 h-12 text-gray-600" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No Treatments Available
              </h3>
              <p className="text-gray-600 max-w-2xl">
                Based on your selections and current conditions, we couldn&apos;t find suitable treatments at this time.
                Please review the details below for more information.
              </p>
            </div>
          </div>
        </Card>
      ) : (
        <>
          {/* View toggle */}
          <ViewToggle
            currentView={viewMode}
            onViewChange={setViewMode}
          />

          {/* Main content area */}
          <div className="mt-6">
            {viewMode === 'card' ? (
              <CardView
                recommendations={output.recommendations}
                totalPriceKRW={output.totalPriceKRW}
                totalPriceUSD={output.totalPriceUSD}
              />
            ) : (
              <TimelineView
                recommendations={output.recommendations}
              />
            )}
          </div>
        </>
      )}

      {/* Excluded treatments section */}
      {output.excluded.length > 0 && (
        <ExcludedSection
          excluded={output.excluded}
          upgradeSuggestions={output.upgradeSuggestions}
        />
      )}

      {/* Action buttons */}
      <ActionButtons
        onFindClinics={onFindClinics}
        onShare={() => setIsShareModalOpen(true)}
        onConsult={onConsult}
      />

      {/* Share modal */}
      <ShareModal
        open={isShareModalOpen}
        onOpenChange={setIsShareModalOpen}
        output={output}
      />
    </div>
  );
};

export default RecommendationResult;
