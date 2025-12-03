import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocale } from 'next-intl';
import { RecommendationOutput } from '@/app/[locale]/(consult)/recommend_estimate/SkinSurveyFlow/questionnaire/questionScript/matching';
import RecommendationHeader from './RecommendationHeader';
import ViewToggle from './common/ViewToggle';
import TimelineInfoModal from './common/TimelineInfoModal';
import CardView from './card/CardView';
import TimelineView from './timeline/TimelineView';
import ExcludedSection from './ExcludedSection';
import ActionButtons from './ActionButtons';
import ShareModal from './ShareModal';
import { Card } from '@/components/ui/card';
import { AlertCircle, Sparkles, Info, RotateCcw, Home } from 'lucide-react';

export interface RecommendationResultProps {
  output: RecommendationOutput;
  formData?: Record<string, any>;
  submissionId?: string;
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
  submissionId,
  onFindClinics,
  onConsult,
}) => {
  const router = useRouter();
  const locale = useLocale();
  const [viewMode, setViewMode] = useState<'card' | 'timeline'>('card');
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isTimelineInfoOpen, setIsTimelineInfoOpen] = useState(false);

  // 저장 중복 방지를 위한 ref
  const hasSavedRef = useRef(false);

  // 결과를 DB에 저장 (컴포넌트 마운트 시 1회)
  useEffect(() => {
    const saveRecommendationResult = async () => {
      // 이미 저장했거나, submissionId가 없으면 스킵
      if (hasSavedRef.current || !submissionId) {
        return;
      }

      hasSavedRef.current = true;

      try {
        // 세션 ID 생성 또는 가져오기
        let sessionId = sessionStorage.getItem('recommendation_session_id');
        if (!sessionId) {
          sessionId = crypto.randomUUID();
          sessionStorage.setItem('recommendation_session_id', sessionId);
        }

        const response = await fetch('/api/consultation/recommendation-result', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            idUuidConsultSubmissions: submissionId,
            recommendationOutput: output,
            formData: formData,
            sessionId: sessionId,
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          console.error('Failed to save recommendation result:', error);
        } else {
          const result = await response.json();
          console.log('Recommendation result saved successfully:', result.id);
        }
      } catch (error) {
        // Silent fail - 저장 실패해도 사용자에게 알림 없음
        console.error('Error saving recommendation result:', error);
      }
    };

    saveRecommendationResult();
  }, [submissionId, output, formData]);

  const handleRetry = () => {
    router.replace('/recommend_estimate');
  };

  const handleGoHome = () => {
    router.replace('/');
  };

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
            {/* View toggle with Timeline info button */}
            <motion.div variants={fadeInUp}>
              <div className="relative">
                {/* ViewToggle - always centered */}
                <div className="flex justify-center">
                  <ViewToggle
                    currentView={viewMode}
                    onViewChange={setViewMode}
                  />
                </div>

                {/* Timeline info button - positioned to the right */}
                <AnimatePresence>
                  {viewMode === 'timeline' && (
                    <motion.button
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.2 }}
                      onClick={() => setIsTimelineInfoOpen(true)}
                      className="sm:absolute sm:right-0 sm:top-1/2 sm:-translate-y-1/2 flex items-center gap-2 px-4 py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl transition-colors duration-200 border border-blue-200 hover:border-blue-300 mt-3 sm:mt-0 mx-auto sm:mx-0"
                    >
                      <Info className="w-4 h-4" />
                      <span className="text-sm font-medium">What is Timeline?</span>
                    </motion.button>
                  )}
                </AnimatePresence>
              </div>
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

        {/* Timeline info modal */}
        <TimelineInfoModal
          isOpen={isTimelineInfoOpen}
          onClose={() => setIsTimelineInfoOpen(false)}
        />

        {/* Navigation buttons */}
        <motion.div
          className="mt-8 flex gap-4"
          variants={fadeInUp}
        >
          <button
            onClick={handleRetry}
            className="flex-1 flex items-center justify-center gap-2 py-4 px-6 bg-white border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700 font-medium rounded-2xl transition-all duration-200 shadow-sm hover:shadow-md"
          >
            <RotateCcw className="w-5 h-5" />
            <span>{locale === 'ko' ? '다시하기' : 'Try Again'}</span>
          </button>
          <button
            onClick={handleGoHome}
            className="flex-1 flex items-center justify-center gap-2 py-4 px-6 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-medium rounded-2xl transition-all duration-200 shadow-lg shadow-rose-500/25 hover:shadow-xl hover:shadow-rose-500/30"
          >
            <Home className="w-5 h-5" />
            <span>{locale === 'ko' ? '홈으로 가기' : 'Go to Home'}</span>
          </button>
        </motion.div>

      </motion.div>
    </div>
  );
};

export default RecommendationResult;
