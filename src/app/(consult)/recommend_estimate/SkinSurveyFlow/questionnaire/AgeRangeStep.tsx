// import React, { useState, useEffect } from 'react';
// import { Label } from '@/components/ui/label';
// import { Card } from '@/components/ui/card';
// import { questions } from '@/content/estimate/form-definition';
// import { Textarea } from '@/components/ui/textarea';
// import { ChoiceCard } from '@/components/molecules/card/ChoiceCard';
// import { useCookieLanguage } from '@/hooks/useCookieLanguage';
// import { getLocalizedText } from '@/utils/i18n';

// interface AgeRangeStepProps {
//   data: any;
//   onDataChange: (data: any) => void;
// }

// const AgeRangeStep: React.FC<AgeRangeStepProps> = ({ data, onDataChange }) => {
//   const { language } = useCookieLanguage();
 
//   const handleAgeRangeChange = (ageRangeId: string) => {
//     onDataChange({
//       ...data,
//       ageRange: ageRangeId
//     });
//   };


//   return (
//     <div className="space-y-8">
//       {/* Skin Type Selection */}
//      <div>
//       {/* <Label className="text-lg font-medium text-gray-800 mb-4 block">
//         What's your skin type?
//       </Label> */}

//       <div role="radiogroup" aria-label="Skin type" className="grid grid-cols-1 gap-3">
//         {questions.ageRanges.map((ageRange) => {
//           const isSelected = data.ageRange === ageRange.id;

//           return (
//             <ChoiceCard
//               key={ageRange.id}
//               mode="single"
//               title={getLocalizedText(ageRange.label, language)}
//               subtitle={getLocalizedText(ageRange.description, language)}
//               selected={isSelected}
//               onSelect={() => handleAgeRangeChange(ageRange.id)}
//               showIndicator={false} // 싱글은 점 숨김 (디자인 가이드)
//             />
//           );
//         })}
//       </div>
//     </div>
//     </div>
//   );
// };

// export default AgeRangeStep;
