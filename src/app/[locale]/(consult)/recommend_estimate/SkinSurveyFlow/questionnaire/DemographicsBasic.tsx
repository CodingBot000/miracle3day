import React, { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CountryCode } from '@/models/country-code.dto';
import { NationModal } from '@/components/template/modal/nations';
import { questions } from '@/app/[locale]/(consult)/recommend_estimate/estimate/form-definition_questions';
import { useLocale } from 'next-intl';
import { getLocalizedText } from '@/utils/i18n';

interface DemographicsBasicStepProps {
  data: any;
  onDataChange: (data: any) => void;
}

const DemographicsBasic: React.FC<DemographicsBasicStepProps> = ({ data, onDataChange }) => {
  const locale = useLocale();
  const demographicsData = data.demographicsBasic || {};
  const [nation, setNation] = useState<CountryCode | null>(null);

  // Initialize nation state from data
  useEffect(() => {
    if (demographicsData.country_of_residence && !nation) {
      // If country is already selected, set nation state
      // Note: country_of_residence is stored as country name string
      setNation({ country_name: demographicsData.country_of_residence } as CountryCode);
    }
  }, [demographicsData.country_of_residence]);

  const handleChange = (fieldId: string, value: string) => {
    onDataChange({
      ...data,
      demographicsBasic: {
        ...demographicsData,
        [fieldId]: value
      }
    });
  };

  const handleCountryChange = (value: CountryCode) => {
    setNation(value);
    handleChange('country_of_residence', value.country_name);
  };

  return (
    <div className="space-y-6">
      {questions.demographicsBasic.map((question) => {
        if (question.type === 'single_select') {
          return (
            <div key={question.id} className="space-y-2">
              <Label className="text-gray-700 font-medium">
                {getLocalizedText(question.title, locale)}
              </Label>
              {question.helperText && (
                <p className="text-sm text-gray-500">
                  {getLocalizedText(question.helperText, locale)}
                </p>
              )}
              <Select
                value={demographicsData[question.id] || ''}
                onValueChange={(value) => handleChange(question.id, value)}
              >
                <SelectTrigger className="border-rose-200 focus:border-rose-400" translate="no">
                  <SelectValue placeholder={getLocalizedText(question.helperText, locale) || ''} />
                </SelectTrigger>
                <SelectContent translate="no">
                  {question.options?.map((option) => (
                    <SelectItem key={option.value} value={option.value} translate="no">
                      <span translate="yes">{getLocalizedText(option.label, locale)}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          );
        }

        if (question.type === 'country_select') {
          return (
            <div key={question.id} className="space-y-2">
              <Label className="text-gray-700 font-medium">
                {getLocalizedText(question.title, locale)}
              </Label>
              {question.helperText && (
                <p className="text-sm text-gray-500">
                  {getLocalizedText(question.helperText, locale)}
                </p>
              )}
              <div>
                <Label htmlFor="nationality">Nationality</Label>
                <NationModal
                  nation={nation?.country_name || demographicsData[question.id] || ""}
                  onSelect={handleCountryChange}
                />
              </div>
            </div>
          );
        }

        return null;
      })}
    </div>
  );
};

export default DemographicsBasic;
