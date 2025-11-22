import React, { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { questions } from '@/content/estimate/form-definition';
import { FaInstagram, FaReddit, FaTiktok, FaYoutube, FaGoogle, FaComments } from 'react-icons/fa';
import { ChoiceCard } from '@/components/molecules/card/ChoiceCard';
import { log } from '@/utils/logger';
import { useCookieLanguage } from '@/hooks/useCookieLanguage';
import { getLocalizedText } from '@/utils/i18n';
// import { SiLemon8 } from 'react-icons/si';

interface VisitPathStepProps {
  data: any;
  onDataChange: (data: any) => void;
}

const VisitPathStep: React.FC<VisitPathStepProps> = ({ data, onDataChange }) => {
  const { language } = useCookieLanguage();
  const visitPath = data.visitPath || { visitPath: '', otherPath: '' };
  const [hasOtherPath, setHasOtherPath] = useState(visitPath.visitPath === 'other');
  const [tempOtherPath, setTempOtherPath] = useState(visitPath.otherPath || '');

  useEffect(() => {
    setHasOtherPath(visitPath.visitPath === 'other');
  }, [visitPath.visitPath]);

  const handleVisitPathChange = (selectedPath: string) => {
    const shouldRemoveOtherPath = visitPath.visitPath === 'other' && selectedPath !== 'other';
    
    log.debug('VisitPathStep - handleVisitPathChange - before update:', { selectedPath, data, tempOtherPath });
    
    // other를 선택할 때 이전에 저장된 tempOtherPath를 복원
    if (selectedPath === 'other') {
      onDataChange({
        ...data,
        visitPath: {
          visitPath: selectedPath,
          otherPath: tempOtherPath
        }
      });
    } else {
      onDataChange({
        ...data,
        visitPath: {
          visitPath: selectedPath,
          ...(shouldRemoveOtherPath ? {} : { otherPath: visitPath.otherPath })
        }
      });
    }
  };

  const handleOtherPathChange = (text: string) => {
    // 임시 상태 업데이트
    setTempOtherPath(text);
    
    log.debug('VisitPathStep - handleOtherPathChange - before update:', { text, hasOtherPath, data });
    
    // other가 선택되어 있을 때 실제 데이터에 바로 반영
    if (hasOtherPath) {
      onDataChange({
        ...data,
        visitPath: {
          visitPath: 'other',
          otherPath: text
        }
      });
    }
  };

  // 아이콘 매핑
  const iconMap = {
    instagram: FaInstagram,
    // lemon8: SiLemon8,
    lemon8: FaComments,
    reddit: FaReddit,
    tiktok: FaTiktok,
    youtube: FaYoutube,
    google_search: FaGoogle,
    Chat_Ai: FaComments,
    other: FaComments
  };

  return (
    <div className="space-y-8">
      {/* Budget Range */}
      <div>
        {/* <Label className="text-lg font-medium text-gray-800 mb-4 block">
           How did you hear about us? 
        </Label> */}
        {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {questions.visitPaths.map((path) => {
            const IconComponent = iconMap[path.id as keyof typeof iconMap];
            
            return (
              <Card
                key={path.id}
                className={`p-4 cursor-pointer transition-all duration-200 hover:shadow-md ${
                  visitPath.visitPath === path.id
                    ? 'border-rose-400 bg-rose-50 shadow-md'
                    : 'border-gray-200 hover:border-rose-300'
                }`}
                onClick={() => handleVisitPathChange(path.id)}
              >
                <div className="flex items-center space-x-3">
                  {IconComponent && (
                    <div className="flex-shrink-0">
                      <IconComponent className="w-6 h-6 text-gray-600" />
                    </div>
                  )}
                  <div>
                    <h3 className="font-medium text-gray-900 mb-1">{path.label}</h3>
                    {path.id === 'Chat_Ai' && (
                      <p className="text-sm text-gray-600">{path.description}</p>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div> */}

        <div role="radiogroup" aria-label="VisitPathStep" className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {questions.visitPaths.map((path) => {
            const IconComponent = iconMap[path.id as keyof typeof iconMap];
            
            const isSelected = visitPath.visitPath === path.id;
  
            return (
              <ChoiceCard
                key={path.id}
                mode="single"
                title={getLocalizedText(path.label, language)}
                subtitle={(path.id === 'chat_ai' ||
                  path.id === 'web_search')  ? getLocalizedText(path.description, language) : undefined}
                selected={isSelected}
                onSelect={() => handleVisitPathChange(path.id)}
                showIndicator={false} // 싱글은 점 숨김 (디자인 가이드)
           
              />
            );
          })}
        </div>
        
        {/* Other Visit Path */}
        <div 
          className={`mt-6 transition-all duration-300 ${
            hasOtherPath ? 'opacity-100 max-h-96' : 'opacity-0 max-h-0 overflow-hidden'
          }`}
        >
          <Label className="text-lg font-medium text-gray-800 mb-4 block">
            Please tell us how you found us:
          </Label>
          <Textarea
            value={tempOtherPath}
            onChange={(e) => handleOtherPathChange(e.target.value)}
            placeholder="Please describe how you heard about us..."
            className="border-rose-200 focus:border-rose-400 focus:ring-rose-400/20 min-h-[120px]"
            disabled={!hasOtherPath}
          />
        </div>
      </div>

    </div>
  );
};

export default VisitPathStep;
