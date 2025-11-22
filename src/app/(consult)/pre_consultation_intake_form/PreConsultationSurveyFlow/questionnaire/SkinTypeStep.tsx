/* eslint-disable react/prop-types */
import { questions } from '@/content/pre_consultation_intake/form-definition_pre_consultation';

import { ChoiceCard } from '@/components/molecules/card/ChoiceCard';
import { useCookieLanguage } from '@/hooks/useCookieLanguage';
import { getLocalizedText } from '@/utils/i18n';

interface SkinTypeStepProps {
  data: any;
  onDataChange: (data: any) => void;
}

const SkinTypeStep: React.FC<SkinTypeStepProps> = ({ data, onDataChange }) => {
  const { language } = useCookieLanguage();
 
  const handleSkinTypeChange = (typeId: string) => {
    onDataChange({
      ...data,
      skinType: typeId
    });
  };


  return (
    <div className="space-y-8">
      {/* Skin Type Selection */}
     <div>
      {/* <Label className="text-lg font-medium text-gray-800 mb-4 block">
        What's your skin type?
      </Label> */}

      <div role="radiogroup" aria-label="Skin type" className="grid grid-cols-1 gap-3">
        {questions.skinTypes.map((type) => {
          const isSelected = data.skinType === type.id;

          return (
            <ChoiceCard
              key={type.id}
              mode="single"
              title={getLocalizedText(type.label, language)}
              subtitle={getLocalizedText(type.description, language)}
              selected={isSelected}
              onSelect={() => handleSkinTypeChange(type.id)}
              showIndicator={false} // 싱글은 점 숨김 (디자인 가이드)
            />
          );
        })}
      </div>
    </div>
    </div>
  );
};

export default SkinTypeStep;
