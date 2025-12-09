import React from 'react';
import { Sparkles } from 'lucide-react';
import Image from 'next/image';
import { useLocale } from 'next-intl';
import ProgressIndicator from './PreConsultationSurveyFlow/ProgressIndicator';
import LanguageSwitcherNextIntl from '@/components/organism/layout/LanguageSwitcherNextIntl';
import { pageHeader } from './pre_consultation_intake/form-definition_pre_con_base';
import { getLocalizedText } from '@/utils/i18n';

interface PageHeaderProps {
  currentStep: number;
  totalSteps: number;
  onBack?: () => void;
}

const PageHeader: React.FC<PageHeaderProps> = ({ currentStep, totalSteps, onBack }) => {
  const locale = useLocale();
  return (
    <div className="bg-white sticky top-0 z-50 h-[60px]">
      <div className="max-w-4xl mx-auto px-4 py-3 h-full">
        <div className="flex items-center justify-between relative">
          <div className="flex items-center">
            {onBack && (
              <button
                onClick={onBack}
                className="w-6 h-6 flex items-center justify-center"
              >
                <Image
                  src="/icons/icon_arrow_back2.svg"
                  alt="Back"
                  width={24}
                  height={24}
                />
              </button>
            )}
          </div>
          <h1 className="absolute left-1/2 -translate-x-1/2 text-xl font-semibold text-gray-900">
            {getLocalizedText(pageHeader.ph1, locale)}
          </h1>
          <div className="flex items-center">
            <LanguageSwitcherNextIntl />
          </div>
        </div>
      </div>
      <ProgressIndicator 
        currentStep={currentStep} 
        totalSteps={totalSteps} 
      />
    </div>
  );
};

export default PageHeader;