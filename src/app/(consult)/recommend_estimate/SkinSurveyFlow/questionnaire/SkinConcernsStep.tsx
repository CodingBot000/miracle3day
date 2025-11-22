import React, { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { questions } from '@/content/estimate/form-definition';
import { Textarea } from '@/components/ui/textarea';
import { ChoiceCard } from '@/components/molecules/card/ChoiceCard';
import { useCookieLanguage } from '@/hooks/useCookieLanguage';
import { getLocalizedText } from '@/utils/i18n';

interface SkinConcernsStepProps {
  data: any;
  onDataChange: (data: any) => void;
}

// Tier 타이틀 매핑
const TIER_TITLES: { [key: number]: string } = {
  1: 'Dermatology',
  2: 'Anti-Aging',
  3: 'Facial Contouring',
  4: 'Other'
};

const SkinConcernsStep: React.FC<SkinConcernsStepProps> = ({ data, onDataChange }) => {
  const { language } = useCookieLanguage();
  const skinConcerns = data.skinConcerns || { concerns: [] };
  const [hasOtherConcern, setHasOtherConcern] = useState(
    Array.isArray(skinConcerns.concerns) && skinConcerns.concerns.includes('other')
  );
  // 임시로 other 텍스트를 저장하는 상태
  const [tempMoreConcerns, setTempMoreConcerns] = useState(skinConcerns.moreConcerns || '');

  // skinConcerns를 tier별로 그룹화
  const groupedConcerns = questions.skinConcerns.reduce((acc, concern) => {
    const tier = concern.tier || 4;
    if (!acc[tier]) {
      acc[tier] = [];
    }
    acc[tier].push(concern);
    return acc;
  }, {} as { [key: number]: typeof questions.skinConcerns });

  useEffect(() => {
    setHasOtherConcern(Array.isArray(skinConcerns.concerns) && skinConcerns.concerns.includes('other'));
  }, [skinConcerns.concerns]);



  const handleConcernToggle = (concernId: string) => {
    const currentConcerns = skinConcerns.concerns || [];
    const updatedConcerns = currentConcerns.includes(concernId)
      ? currentConcerns.filter((id: string) => id !== concernId)
      : [...currentConcerns, concernId];
    
    // other가 해제되면 moreConcerns는 임시저장소에 보관하고 데이터에서만 제거
    const shouldRemoveMoreConcerns = concernId === 'other' && 
      currentConcerns.includes('other') && 
      !updatedConcerns.includes('other');

    onDataChange({
      ...data,
      skinConcerns: {
        ...skinConcerns,
        concerns: updatedConcerns,
        ...(shouldRemoveMoreConcerns ? {} : { moreConcerns: skinConcerns.moreConcerns })
      }
    });
  };

  const handleMoreConcernsChange = (text: string) => {
    // 임시 상태 업데이트
    setTempMoreConcerns(text);
    
    // other가 선택되어 있을 때만 실제 데이터에 반영
    if (hasOtherConcern) {
      onDataChange({
        ...data,
        skinConcerns: {
          ...skinConcerns,
          moreConcerns: text
        }
      });
    }
  };


  return (
    <div className="space-y-8">
      {/* Tier별로 그룹화된 Skin Concerns */}
      {[1, 2, 3, 4].map((tier) => {
        const concerns = groupedConcerns[tier];
        if (!concerns || concerns.length === 0) return null;

        return (
          <div key={tier}>
            {/* Tier 타이틀 */}
            <Label className="text-lg font-medium text-gray-800 mb-4 block">
              {TIER_TITLES[tier]}
            </Label>

            {/* 그리드로 표시 */}
            <div role="group" aria-label={`Tier ${tier} concerns`} className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {concerns.map((concern) => {
                const isSelected = (skinConcerns.concerns ?? []).includes(concern.id);
                return (
                  <ChoiceCard
                    key={concern.id}
                    mode="multi"
                    title={getLocalizedText(concern.label, language)}
                    subtitle={getLocalizedText(concern.description, language)}
                    selected={isSelected}
                    onSelect={() => handleConcernToggle(concern.id)}
                  />
                );
              })}
            </div>
          </div>
        );
      })}

      {/* Skin Concerns Others */}
      {hasOtherConcern && (
        <div className="animate-fadeIn">
          <Label className="text-lg font-medium text-gray-800 mb-4 block">
            If you have any other concerns not included in the options, please write them freely below.
          </Label>
          <Textarea
            value={tempMoreConcerns}
            onChange={(e) => handleMoreConcernsChange(e.target.value)}
            placeholder="Describe any other concerns here..."
            className="border-rose-200 focus:border-rose-400 focus:ring-rose-400/20 min-h-[120px]"
          />
        </div>
      )}
    </div>
  );
};

export default SkinConcernsStep;
