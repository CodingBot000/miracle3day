/* eslint-disable react/prop-types */
import { languagesClinicAvailable } from '@/constants/languagesClinicAvailable';
import { useState, useEffect } from 'react';
import { log } from "@/utils/logger";

interface AvailableLanguageSectionProps {
  onLanguagesChange: (selectedLanguages: string[]) => void;
  initialLanguages?: string[];
}

const AvailableLanguageSection: React.FC<AvailableLanguageSectionProps> = ({
  onLanguagesChange,
  initialLanguages = [],
}) => {
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(initialLanguages);

  // initialLanguages가 변경될 때 내부 상태 업데이트
  useEffect(() => {
    log.info('AvailableLanguageSection - initialLanguages 변경:', initialLanguages);
    setSelectedLanguages(initialLanguages);
  }, [initialLanguages]);

  const handleLanguageToggle = (languageCode: string) => {
    const updatedLanguages = selectedLanguages.includes(languageCode)
      ? selectedLanguages.filter(code => code !== languageCode)
      : [...selectedLanguages, languageCode];
    
    setSelectedLanguages(updatedLanguages);
    onLanguagesChange(updatedLanguages);
  };

  log.info('AvailableLanguageSection - 현재 선택된 언어:', selectedLanguages);

  return (
    <div className="w-full">
      <h3 className="font-semibold mb-2">가능 언어</h3>
      <p className="text-sm text-gray-600 mb-2">
        병원에서 대응 가능한 언어를 선택해주세요. (중복 선택 가능)
      </p>
      <div className="grid grid-cols-3 gap-4">
        {languagesClinicAvailable.map((language) => (
          <div key={language.code} className="flex items-center space-x-2">
            <input
              type="checkbox"
              id={language.code}
              checked={selectedLanguages.includes(language.code)}
              onChange={() => handleLanguageToggle(language.code)}
              className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
            />
            <label
              htmlFor={language.code}
              className="text-sm font-medium text-gray-700 cursor-pointer"
            >
              {language.label}
            </label>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AvailableLanguageSection;
