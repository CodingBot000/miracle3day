/* eslint-disable react/prop-types */
import { Label } from '@/components/ui/label';
import { questions } from '@/app/(consult)/pre_consultation_intake_form/pre_consultation_intake/form-definition_pre_con_questions';
import { ChoiceCard } from '@/components/molecules/card/ChoiceCard';
import { useCookieLanguage } from '@/hooks/useCookieLanguage';
import { getLocalizedText } from '@/utils/i18n';

interface BudgetStepProps {
  data: any;
  onDataChange: (data: any) => void;
}

const BudgetStep: React.FC<BudgetStepProps> = ({ data, onDataChange }) => {
  const { language } = useCookieLanguage();

  const handleBudgetChange = (budgetId: string) => {
      onDataChange({
      ...data,
      budget: budgetId
    });
  };

  return (
    <div className="space-y-8">
      {/* Budget Range */}
      <div>
        {/* <Label className="text-lg font-medium text-gray-800 mb-4 block">
          What's your budget range for treatment?
        </Label> */}
        <div role="radiogroup" aria-label="BudgetStep" className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {questions.budgetRanges.map((type) => {
            const isSelected = data.budget === type.id;

            return (
              <ChoiceCard
                key={type.id}
                mode="single"
                title={getLocalizedText(type.label, language)}
                subtitle={getLocalizedText(type.description, language)}
                selected={isSelected}
                onSelect={() => handleBudgetChange(type.id)}
                showIndicator={false} // 싱글은 점 숨김 (디자인 가이드)
               
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default BudgetStep;
