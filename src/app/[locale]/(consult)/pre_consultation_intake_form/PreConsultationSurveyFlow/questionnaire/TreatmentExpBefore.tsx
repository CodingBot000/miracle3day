import React, { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { questions } from '@/app/[locale]/(consult)/pre_consultation_intake_form/pre_consultation_intake/form-definition_pre_con_questions';
import { ChoiceCard } from '@/components/molecules/card/ChoiceCard';
import { useLocale } from 'next-intl';
import { getLocalizedText } from '@/utils/i18n';

interface TreatmentExpBeforeStepProps {
  data: any;
  onDataChange: (data: any) => void;
}

const TreatmentExpBeforeStep: React.FC<TreatmentExpBeforeStepProps> = ({ data, onDataChange }) => {
  const locale = useLocale();
  const pastTreatments = data.pastTreatments || { pastTreatments: [] };
  // 임시로 부작용 텍스트를 저장하는 상태
  const [tempSideEffects, setTempSideEffects] = useState(pastTreatments.sideEffects || '');
  const [hasPastTreatments, setHasPastTreatments] = useState(
    Array.isArray(pastTreatments.pastTreatments) && 
    pastTreatments.pastTreatments.length > 0 && 
    !pastTreatments.pastTreatments.includes('none')
  );

  useEffect(() => {
    setHasPastTreatments(
      Array.isArray(pastTreatments.pastTreatments) && 
      pastTreatments.pastTreatments.length > 0 && 
      !pastTreatments.pastTreatments.includes('none')
    );
  }, [pastTreatments.pastTreatments]);


  const handlePastTreatmentToggle = (treatmentId: string) => {
    const currentTreatments = pastTreatments.pastTreatments || [];
    let updatedTreatments;
    
    if (treatmentId === 'none') {
      // "none"을 선택한 경우
      if (currentTreatments.includes('none')) {
        // 이미 "none"이 선택되어 있다면 해제
        updatedTreatments = currentTreatments.filter((id: string) => id !== 'none');
      } else {
        // "none"을 새로 선택하면 기존 모든 선택을 초기화하고 "none"만 선택
        updatedTreatments = ['none'];
      }
    } else {
      // "none" 외의 다른 항목을 선택한 경우
      if (currentTreatments.includes(treatmentId)) {
        // 이미 선택된 항목을 해제
        updatedTreatments = currentTreatments.filter((id: string) => id !== treatmentId);
      } else {
        // 새로운 항목을 추가하되, "none"이 있다면 제거
        updatedTreatments = currentTreatments
          .filter((id: string) => id !== 'none')
          .concat(treatmentId);
      }
    }
    
    // 시술 선택이 변경될 때마다 데이터 업데이트
    const hasSelectedTreatments = updatedTreatments.length > 0 && !updatedTreatments.includes('none');
    
    onDataChange({
      ...data,
      pastTreatments: {
        ...pastTreatments,
        pastTreatments: updatedTreatments,
        // 시술이 선택되어 있고 임시 텍스트가 있을 때만 sideEffects 포함 ("none"은 제외)
        sideEffects: hasSelectedTreatments ? tempSideEffects : undefined
      }
    });
  };

  const handleSideEffectsChange = (text: string) => {
    // 임시 상태 업데이트
    setTempSideEffects(text);
    
    // 시술이 선택되어 있을 때만 실제 데이터에 반영
    if (hasPastTreatments) {
      onDataChange({
        ...data,
        pastTreatments: {
          ...pastTreatments,
          sideEffects: text
        }
      });
    }
  };

  const handleNotesChange = (notes: string) => {
    onDataChange({
      ...data,
      pastTreatments: {
        ...pastTreatments,
        additionalNotes: notes
      }
    });
  };

  return (
    <div className="space-y-8">
  
      {/* Past Treatments */}
      <div>
        {/* <Label className="text-lg font-medium text-gray-800 mb-4 block">
          Have you had any of these treatments before? (Select all that apply)
        </Label> */}

        {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {questions.pastTreatments.map((treatment) => (
            <Card
              key={treatment.id}
              className={`p-4 cursor-pointer transition-all duration-200 hover:shadow-md ${
                (pastTreatments.pastTreatments || []).includes(treatment.id)
                  ? 'border-rose-400 bg-rose-50 shadow-md'
                  : 'border-gray-200 hover:border-rose-300'
              }`}
              onClick={() => handlePastTreatmentToggle(treatment.id)}
            >
              <div className="text-center">
                <span className="font-medium text-gray-900">{treatment.label}</span>
                {treatment.description && (
                  <p className="text-sm text-gray-600 mt-1">{treatment.description}</p>
                )}
              </div>
            </Card>
          ))}
        </div> */}

        <div role="group" aria-label="TreatmentExpBeforeStep" className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {questions.pastTreatments.map((treatment) => {
            const isSelected = (pastTreatments.pastTreatments ?? []).includes(treatment.id);
            return (
              <ChoiceCard
                key={treatment.id}
                mode="multi"
                title={getLocalizedText(treatment.label, locale)}
                subtitle={getLocalizedText(treatment.description, locale)}
                selected={isSelected}
                onSelect={() => handlePastTreatmentToggle(treatment.id)}
           
              />
            );
          })}
        </div>
      </div>

      {/* Side Effects Description */}
      <div>
        <Label className="text-lg font-medium text-gray-800 mb-4 block">
        {locale === 'ko' ? "선택한 시술 후 부작용이 있었다면 아래에 설명해주세요. (선택 사항)" : "If you have experienced any side effects after the selected procedure(s), please describe them below. (Optional)"}
        </Label>
        <Textarea
          value={tempSideEffects}
          onChange={(e) => handleSideEffectsChange(e.target.value)}
          placeholder="Share any specific concerns, expectations, or questions you have about treatment..."
          className={`border-rose-200 focus:border-rose-400 focus:ring-rose-400/20 min-h-[120px] ${
            !hasPastTreatments ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          disabled={!hasPastTreatments}
        />
      </div>

      {/* Additional Notes */}
      <div>
        <Label className="text-lg font-medium text-gray-800 mb-4 block">
          {locale === 'ko' ? "다른 사항이 있으신가요? (선택 사항)" : "Anything else you&apos;d like us to know? (Optional)"}
        </Label>
        <Textarea
          value={pastTreatments.additionalNotes || ''}
          onChange={(e) => handleNotesChange(e.target.value)}
          placeholder=
          {locale === 'ko' ? "시술에 대한 그외 걱정, 기대하는바 혹은 질문이 있으신가요? 아래에 설명해주세요." : "Share any specific concerns, expectations, or questions you have about treatment..."}
          className="border-rose-200 focus:border-rose-400 focus:ring-rose-400/20 min-h-[120px]"
        />
      </div>
    </div>
  );
};

export default TreatmentExpBeforeStep;
