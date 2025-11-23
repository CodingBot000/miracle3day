import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { RecommendationOutput } from '@/app/(consult)/recommend_estimate/SkinSurveyFlow/questionnaire/questionScript/matching';
import RecommendationHeader from './RecommendationHeader';
import ViewToggle from './common/ViewToggle';
import CardView from './card/CardView';
import TimelineView from './timeline/TimelineView';
import ExcludedSection from './ExcludedSection';
import ActionButtons from './ActionButtons';
import ShareModal from './ShareModal';
import { Card } from '@/components/ui/card';
import { AlertCircle, Sparkles } from 'lucide-react';

export interface RecommendationResultProps {
  output: RecommendationOutput;
  formData?: Record<string, any>;
  onFindClinics?: () => void;
  onConsult?: () => void;
}

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const RecommendationResult: React.FC<RecommendationResultProps> = ({
  output,
  formData,
  onFindClinics,
  onConsult,
}) => {
  const [viewMode, setViewMode] = useState<'card' | 'timeline'>('card');
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50/50 via-white to-purple-50/30 relative">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-pink-200/30 to-purple-200/30 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -left-20 w-60 h-60 bg-gradient-to-br from-blue-200/20 to-cyan-200/20 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-gradient-to-br from-amber-200/20 to-orange-200/20 rounded-full blur-2xl" />
      </div>

      <motion.div
        className="relative w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12"
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
      >
        {/* Success indicator */}
        <motion.div
          className="flex justify-center mb-6"
          variants={fadeInUp}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-full shadow-lg shadow-emerald-500/25">
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-medium">Analysis Complete</span>
          </div>
        </motion.div>

        {/* Header with summary */}
        <motion.div variants={fadeInUp}>
          <RecommendationHeader
            totalPriceKRW={output.totalPriceKRW}
            totalPriceUSD={output.totalPriceUSD}
            treatmentCount={output.recommendations.length}
            notes={output.notes}
            ethnicityNote={output.ethnicityNote}
            budgetRangeId={output.budgetRangeId}
            budgetUpperLimit={output.budgetUpperLimit}
          />
        </motion.div>

        {/* No recommendations message */}
        {output.recommendations.length === 0 ? (
          <motion.div variants={fadeInUp}>
            <Card className="mt-8 p-8 sm:p-12 bg-white/80 backdrop-blur-sm border-0 shadow-xl shadow-gray-200/50 rounded-3xl">
              <div className="flex flex-col items-center justify-center text-center space-y-6">
                <div className="p-5 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl">
                  <AlertCircle className="w-12 h-12 text-gray-500" />
                </div>
                <div className="space-y-3">
                  <h3 className="text-2xl font-semibold text-gray-900">
                    No Treatments Available
                  </h3>
                  <p className="text-gray-600 max-w-md leading-relaxed">
                    Based on your selections and current conditions, we couldn&apos;t find suitable treatments at this time.
                    Please review the details below for more information.
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>
        ) : (
          <>
            {/* View toggle */}
            <motion.div variants={fadeInUp}>
              <ViewToggle
                currentView={viewMode}
                onViewChange={setViewMode}
              />
            </motion.div>

            {/* Main content area */}
            <motion.div
              className="mt-8"
              variants={fadeInUp}
            >
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
            </motion.div>
          </>
        )}

        {/* Excluded treatments section */}
        {output.excluded.length > 0 && (
          <motion.div variants={fadeInUp}>
            <ExcludedSection
              excluded={output.excluded}
              upgradeSuggestions={output.upgradeSuggestions}
            />
          </motion.div>
        )}

        {/* Action buttons */}
        <motion.div variants={fadeInUp}>
          <ActionButtons
            onFindClinics={onFindClinics}
            onShare={() => setIsShareModalOpen(true)}
            onConsult={onConsult}
          />
        </motion.div>

        {/* Share modal */}
        <ShareModal
          open={isShareModalOpen}
          onOpenChange={setIsShareModalOpen}
          output={output}
        />
      </motion.div>
    </div>
  );
};

export default RecommendationResult;
