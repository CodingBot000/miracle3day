/* eslint-disable react/prop-types */
import { Label } from '@/components/ui/label';
import { questions } from '@/content/pre_consultation_intake/form-definition_pre_consultation';
import { ChoiceCard } from '@/components/molecules/card/ChoiceCard';

interface BudgetStepProps {
  data: any;
  onDataChange: (data: any) => void;
}

const BudgetStep: React.FC<BudgetStepProps> = ({ data, onDataChange }) => {

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
                title={type.label}
                subtitle={type.description}
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
