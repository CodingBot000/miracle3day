import React, { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { questions } from '@/content/estimate/form-definition';
import { ChoiceCard } from '@/components/molecules/card/ChoiceCard';

interface PreferencesStepProps {
  data: any;
  onDataChange: (data: any) => void;
}

const PreferencesStep: React.FC<PreferencesStepProps> = ({ data, onDataChange }) => {
  const treatmentAreas = data.treatmentAreas || { treatmentAreas: [] };

  const [hasOtherArea, setHasOtherArea] = useState(
    Array.isArray(treatmentAreas.treatmentAreas) && treatmentAreas.treatmentAreas.includes('other')
  );
  const [tempOtherAreas, setTempOtherAreas] = useState(treatmentAreas.otherAreas || '');

  useEffect(() => {
    setHasOtherArea(Array.isArray(treatmentAreas.treatmentAreas) && treatmentAreas.treatmentAreas.includes('other'));
  }, [treatmentAreas.treatmentAreas]);

  const handleAreaToggle = (areaId: string) => {
    const currentAreas = treatmentAreas.treatmentAreas || [];
    const updatedAreas = currentAreas.includes(areaId)
      ? currentAreas.filter((id: string) => id !== areaId)
      : [...currentAreas, areaId];
    
    // other가 해제되면 otherAreas는 임시저장소에 보관하고 데이터에서만 제거
    const shouldRemoveOtherAreas = areaId === 'other' && 
      currentAreas.includes('other') && 
      !updatedAreas.includes('other');

    onDataChange({
      ...data,
      treatmentAreas: {
        ...treatmentAreas,
        treatmentAreas: updatedAreas,
        ...(shouldRemoveOtherAreas ? {} : { otherAreas: treatmentAreas.otherAreas })
      }
    });
  };

  const handleOtherAreasChange = (text: string) => {
    // 임시 상태 업데이트
    setTempOtherAreas(text);
    
    // other가 선택되어 있을 때만 실제 데이터에 반영
    if (hasOtherArea) {
      onDataChange({
        ...data,
        treatmentAreas: {
          ...treatmentAreas,
          otherAreas: text
        }
      });
    }
  };


  return (
    <div className="space-y-8">


      {/* Treatment Areas */}
      <div>
        {/* <Label className="text-lg font-medium text-gray-800 mb-4 block">
          Which areas would you like to focus on? (Select all that apply)
        </Label> */}
  
        <div role="group" aria-label="PreferencesStep" className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {questions.treatmentAreas.map((area) => {
            const isSelected = (treatmentAreas.treatmentAreas ?? []).includes(area.id);
            return (
              <ChoiceCard
                key={area.id}
                mode="multi"
                title={area.label}
                selected={isSelected}
                onSelect={() => handleAreaToggle(area.id)}
             
              />
            );
          })}
        </div>
      </div>


      {/* Treatment Areas Others */}
      {hasOtherArea && (
        <div className="animate-fadeIn">
          <Label className="text-lg font-medium text-gray-800 mb-4 block">
            If you have other areas not listed above, please specify them below.
          </Label>
          <Textarea
            value={tempOtherAreas}
            onChange={(e) => handleOtherAreasChange(e.target.value)}
            placeholder="Please describe other treatment areas you're interested in..."
            className="border-rose-200 focus:border-rose-400 focus:ring-rose-400/20 min-h-[120px]"
          />
        </div>
      )}
  </div>

  );
};

export default PreferencesStep;
