import { languages } from "@/constants/languages";

interface HospitalLanguageSupportProps {
  available_languages: string[];
}

const HospitalLanguageSupport = ({ available_languages }: HospitalLanguageSupportProps) => {

  return (
    <div className="px-4 py-8 border-b-8 border-gray-50">
      <h2 className="text-lg font-semibold text-black mb-4 leading-[26.6px]">
        Languages Supported
      </h2>
      
      <div className="flex flex-wrap gap-3">
        {available_languages && available_languages.map((languageCode, index) => {
          const language = languages.find(lang => lang.code === languageCode);
          return language ? (
            <span
              key={index}
              className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
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
