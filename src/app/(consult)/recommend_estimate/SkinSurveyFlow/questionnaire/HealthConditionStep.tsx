import React, { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { questions } from '@/content/estimate/form-definition';
import { ChoiceCard } from '@/components/molecules/card/ChoiceCard';

interface HealthConditionStepProps {
  data: any;
  onDataChange: (data: any) => void;
}

const HealthConditionStep: React.FC<HealthConditionStepProps> = ({ data, onDataChange }) => {
  const healthConditions = data.healthConditions || { healthConditions: [] };
  const [hasOtherCondition, setHasOtherCondition] = useState(
    Array.isArray(healthConditions.healthConditions) && healthConditions.healthConditions.includes('other')
  );
  const [tempOtherConditions, setTempOtherConditions] = useState(healthConditions.otherConditions || '');

  useEffect(() => {
    setHasOtherCondition(Array.isArray(healthConditions.healthConditions) && healthConditions.healthConditions.includes('other'));
  }, [healthConditions.healthConditions]);

  const handleHealthConditionToggle = (conditionId: string) => {
    const currentConditions = healthConditions.healthConditions || [];
    
    if (conditionId === 'none') {
      // '없음' 선택 시 다른 모든 선택 해제
      onDataChange({
        ...data,
        healthConditions: {
          healthConditions: ['none']
        }
      });
      return;
    }

    // '없음'이 선택되어 있었다면 제거
    const filteredConditions = currentConditions.filter((id: string) => id !== 'none');
    
    // 선택/해제 토글
    const updatedConditions = filteredConditions.includes(conditionId)
      ? filteredConditions.filter((id: string) => id !== conditionId)
      : [...filteredConditions, conditionId];

    // other가 해제되면 otherConditions는 임시저장소에 보관하고 데이터에서만 제거
    const shouldRemoveOtherConditions = conditionId === 'other' && 
      currentConditions.includes('other') && 
      !updatedConditions.includes('other');
    
    onDataChange({
      ...data,
      healthConditions: {
        ...healthConditions,
        healthConditions: updatedConditions,
        ...(shouldRemoveOtherConditions ? {} : { otherConditions: healthConditions.otherConditions })
      }
    });
  };

  const handleOtherConditionsChange = (text: string) => {
    // 임시 상태 업데이트
    setTempOtherConditions(text);
    
    // other가 선택되어 있을 때만 실제 데이터에 반영
    if (hasOtherCondition) {
      onDataChange({
        ...data,
        healthConditions: {
          ...healthConditions,
          otherConditions: text
        }
      });
    }
  };

  return (
    <div className="space-y-8">
      <div>
        {/* <Label className="text-lg font-medium text-gray-800 mb-4 block">
          Do you have any of the following medical conditions that we should consider before treatment? (Select all that apply)
        </Label>
 */}

        <div role="group" aria-label="HealthConditionStep" className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {questions.medicalConditions.map((condition) => {
              const isSelected = (healthConditions.healthConditions ?? []).includes(condition.id);
              return (
                <ChoiceCard
                  key={condition.id}
                  mode="multi"
                  title={condition.label}
                  subtitle={condition.description}
                  selected={isSelected}
                  onSelect={() => handleHealthConditionToggle(condition.id)}
           
                />
              );
            })}
         
        </div>
        {/* Other Health Conditions */}
        {hasOtherCondition && (
          <div className="mt-6 animate-fadeIn">
            <Label className="text-lg font-medium text-gray-800 mb-4 block">
              Please describe any other health conditions we should be aware of:
            </Label>
            <Textarea
              value={tempOtherConditions}
              onChange={(e) => handleOtherConditionsChange(e.target.value)}
              placeholder="Please describe your other health conditions in detail..."
              className="border-rose-200 focus:border-rose-400 focus:ring-rose-400/20 min-h-[120px]"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default HealthConditionStep;
