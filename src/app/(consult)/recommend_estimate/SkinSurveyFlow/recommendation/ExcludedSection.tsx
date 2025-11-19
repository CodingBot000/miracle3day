import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ExcludedItem } from '@/app/(consult)/recommend_estimate/SkinSurveyFlow/questionnaire/questionScript/matching';
import { ChevronDown, ChevronUp, AlertCircle, Lightbulb } from 'lucide-react';

export interface ExcludedSectionProps {
  excluded: ExcludedItem[];
  upgradeSuggestions: string[];
}

const ExcludedSection: React.FC<ExcludedSectionProps> = ({
  excluded,
  upgradeSuggestions,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (excluded.length === 0 && upgradeSuggestions.length === 0) {
    return null;
  }

  // Group excluded treatments by reason category
  const groupedExcluded = excluded.reduce((acc, item) => {
    let category = 'Other';
    const reason = item.reason.toLowerCase();

    if (reason.includes('budget') || reason.includes('price') || reason.includes('cost')) {
      category = '💰 Budget Constraints';
    } else if (reason.includes('area') || reason.includes('not relevant to selected')) {
      category = '📍 Treatment Area Mismatch';
    } else if (reason.includes('pain')) {
      category = '😣 Pain Sensitivity';
    } else if (reason.includes('downtime') || reason.includes('recovery')) {
      category = '⏱️ Downtime/Recovery Concerns';
    } else if (reason.includes('pregnancy') || reason.includes('blood clotting') || reason.includes('immunosuppression') || reason.includes('skin condition') || reason.includes('allergy') || reason.includes('keloid')) {
      category = '⚕️ Medical Restrictions';
    } else if (reason.includes('in the last') || reason.includes('recent')) {
      category = '🕐 Recent Treatment Conflicts';
    } else if (reason.includes('duplication') || reason.includes('removed to avoid')) {
      category = '🔄 Treatment Optimization';
    }

    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(item);
    return acc;
  }, {} as Record<string, ExcludedItem[]>);

  return (
    <div className="mt-8 space-y-4">
      {/* Toggle button */}
      <Button
        variant="outline"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between"
      >
        <div className="flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 text-amber-600" />
          <span className="font-medium">
            Excluded Treatments ({excluded.length})
          </span>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-4 h-4" />
        ) : (
          <ChevronDown className="w-4 h-4" />
        )}
      </Button>

      {/* Expanded content */}
      {isExpanded && (
        <div className="space-y-4">
          {/* Excluded treatments grouped by reason */}
          {Object.entries(groupedExcluded).map(([category, items]) => (
            <Card key={category} className="p-4 bg-gray-50 border-gray-200">
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center space-x-2">
                <Badge variant="outline" className="bg-white">
                  {category}
                </Badge>
                <span className="text-sm text-gray-600">({items.length})</span>
              </h4>
              <div className="space-y-2">
                {items.map((item, index) => (
                  <div
                    key={`${item.key}-${index}`}
                    className="flex items-start space-x-3 p-3 bg-white rounded-lg border border-gray-200"
                  >
                    <div className="flex-shrink-0 w-2 h-2 bg-amber-500 rounded-full mt-1.5" />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{item.key}</p>
                      <p className="text-sm text-gray-600 mt-1">{item.reason}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          ))}

          {/* Upgrade suggestions */}
          {upgradeSuggestions.length > 0 && (
            <Card className="p-4 bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 p-2 bg-blue-500 rounded-lg">
                  <Lightbulb className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-blue-900 mb-3">
                    Upgrade Opportunities
                  </h4>
                  <div className="space-y-2">
                    {upgradeSuggestions.map((suggestion, index) => (
                      <div
                        key={index}
                        className="flex items-start space-x-2 p-3 bg-white rounded-lg border border-blue-200"
                      >
                        <div className="flex-shrink-0 w-1.5 h-1.5 bg-blue-500 rounded-full mt-2" />
                        <p className="text-sm text-gray-700">
                          {suggestion}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};

export default ExcludedSection;
