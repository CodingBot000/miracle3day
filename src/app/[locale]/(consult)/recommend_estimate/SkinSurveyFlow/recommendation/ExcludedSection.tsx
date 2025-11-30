import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { ExcludedItem } from '@/app/[locale]/(consult)/recommend_estimate/SkinSurveyFlow/questionnaire/questionScript/matching';
import { ChevronDown, AlertCircle, Lightbulb, XCircle } from 'lucide-react';

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
      category = 'Budget Constraints';
    } else if (reason.includes('area') || reason.includes('not relevant to selected')) {
      category = 'Treatment Area Mismatch';
    } else if (reason.includes('pain')) {
      category = 'Pain Sensitivity';
    } else if (reason.includes('downtime') || reason.includes('recovery')) {
      category = 'Downtime/Recovery Concerns';
    } else if (reason.includes('pregnancy') || reason.includes('blood clotting') || reason.includes('immunosuppression') || reason.includes('skin condition') || reason.includes('allergy') || reason.includes('keloid')) {
      category = 'Medical Restrictions';
    } else if (reason.includes('in the last') || reason.includes('recent')) {
      category = 'Recent Treatment Conflicts';
    } else if (reason.includes('duplication') || reason.includes('removed to avoid')) {
      category = 'Treatment Optimization';
    }

    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(item);
    return acc;
  }, {} as Record<string, ExcludedItem[]>);

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, string> = {
      'Budget Constraints': '💰',
      'Treatment Area Mismatch': '📍',
      'Pain Sensitivity': '😣',
      'Downtime/Recovery Concerns': '⏱️',
      'Medical Restrictions': '⚕️',
      'Recent Treatment Conflicts': '🕐',
      'Treatment Optimization': '🔄',
      'Other': '📋'
    };
    return icons[category] || '📋';
  };

  return (
    <div className="mt-10">
      {/* Toggle button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-6 py-4 bg-white rounded-2xl shadow-lg shadow-gray-200/50 border border-gray-100 hover:shadow-xl transition-all duration-300 group"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-100 rounded-xl group-hover:bg-amber-200 transition-colors">
            <AlertCircle className="w-5 h-5 text-amber-600" />
          </div>
          <div className="text-left">
            <span className="font-semibold text-gray-900">
              Excluded Treatments
            </span>
            <span className="ml-2 px-2.5 py-0.5 bg-gray-100 text-gray-600 text-sm font-medium rounded-full">
              {excluded.length}
            </span>
          </div>
        </div>
        <div className={`p-2 rounded-full bg-gray-100 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
          <ChevronDown className="w-4 h-4 text-gray-500" />
        </div>
      </button>

      {/* Expanded content */}
      {isExpanded && (
        <div className="mt-4 space-y-4">
          {/* Excluded treatments grouped by reason */}
          {Object.entries(groupedExcluded).map(([category, items]) => (
            <Card key={category} className="p-5 bg-white border-0 shadow-lg rounded-2xl overflow-hidden">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-xl">{getCategoryIcon(category)}</span>
                <h4 className="font-semibold text-gray-900">{category}</h4>
                <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-xs font-medium rounded-full">
                  {items.length}
                </span>
              </div>
              <div className="space-y-3">
                {items.map((item, index) => (
                  <div
                    key={`${item.key}-${index}`}
                    className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                  >
                    <XCircle className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900">{item.key}</p>
                      <p className="text-sm text-gray-500 mt-1 leading-relaxed">{item.reason}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          ))}

          {/* Upgrade suggestions */}
          {upgradeSuggestions.length > 0 && (
            <Card className="p-5 bg-gradient-to-r from-violet-50 to-purple-50 border-0 shadow-lg rounded-2xl">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl shadow-lg shadow-violet-500/25 flex-shrink-0">
                  <Lightbulb className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-gray-900 mb-3">
                    Upgrade Opportunities
                  </h4>
                  <div className="space-y-3">
                    {upgradeSuggestions.map((suggestion, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-3 p-4 bg-white/70 backdrop-blur-sm rounded-xl border border-violet-100"
                      >
                        <span className="w-6 h-6 bg-violet-100 text-violet-600 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0">
                          {index + 1}
                        </span>
                        <p className="text-sm text-gray-700 leading-relaxed">
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
