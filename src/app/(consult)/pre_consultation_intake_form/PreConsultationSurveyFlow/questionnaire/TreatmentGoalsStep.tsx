import React, { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { questions } from '@/app/(consult)/pre_consultation_intake_form/pre_consultation_intake/form-definition_pre_con_questions';
import { ChoiceCard } from '@/components/molecules/card/ChoiceCard';
import { useCookieLanguage } from '@/hooks/useCookieLanguage';
import { getLocalizedText } from '@/utils/i18n';

interface TreatmentGoalsStepProps {
  data: any;
  onDataChange: (data: any) => void;
}

const TreatmentGoalsStep: React.FC<TreatmentGoalsStepProps> = ({ data, onDataChange }) => {
  const { language } = useCookieLanguage();
  

  const handleGoalToggle = (goalId: string) => {
    const currentGoals = data.goals || [];
    const updatedGoals = currentGoals.includes(goalId)
      ? currentGoals.filter((id: string) => id !== goalId)
      : [...currentGoals, goalId];
    
    onDataChange({
      ...data,
      goals: updatedGoals
    });
  };

  return (
    <div className="space-y-8">
      {/* Treatment Goals */}
      <div>
        {/* <Label className="text-lg font-medium text-gray-800 mb-4 block">
          What are your treatment goals? (Select all that apply)
        </Label> */}
     

        <div role="group" aria-label="TreatmentGoalsStep" className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {questions.treatmentGoals.map((goal) => {
            const isSelected = (data.goals ?? []).includes(goal.id);
            return (
              <ChoiceCard
                key={goal.id}
                mode="multi"
                title={getLocalizedText(goal.label, language)}
                subtitle={getLocalizedText(goal.description, language)}
                selected={isSelected}
                onSelect={() => handleGoalToggle(goal.id)}
         
              />
            );
          })}
        </div>
      </div>

      {/* Timeframe */}
      {/* <div>
        <Label className="text-lg font-medium text-gray-800 mb-4 block">
          When would you like to start treatment?
        </Label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {questions.timeframes.map((timeframe) => (
            <Card
              key={timeframe.id}
              className={`p-4 cursor-pointer transition-all duration-200 hover:shadow-md text-center ${
                data.timeframe === timeframe.id
                  ? 'border-rose-400 bg-rose-50 shadow-md'
                  : 'border-gray-200 hover:border-rose-300'
              }`}
              onClick={() => handleTimeframeChange(timeframe.id)}
            >
              <span className="font-medium text-gray-900">{timeframe.label}</span>
            </Card>
          ))}
        </div>
      </div> */}
</div>
  );
};

export default TreatmentGoalsStep;
