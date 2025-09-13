import { languages } from "@/constants/languages";

interface HospitalLanguageSupportProps {
  available_language: string[];
}

const HospitalLanguageSupport = ({ available_language }: HospitalLanguageSupportProps) => {
  console.log('available_language:',available_language);
  return (
    <div className="px-4 py-8 border-b-8 border-gray-50">
      <h2 className="text-lg font-semibold text-black mb-4 leading-[26.6px]">
        Languages Supported
      </h2>
      
      <div className="flex flex-wrap gap-3">
        {available_language && available_language.map((languageCode, index) => {
          const language = languages.find(lang => lang.code === languageCode);
          return language ? (
            <span
              key={index}
              className="inline-block px-3 py-1 bg-blue-600 text-white text-sm rounded-full"
            >
              {language.label}
            </span>
          ) : null;
        })}
      </div>
    </div>
  );
};

export default HospitalLanguageSupport;
