'use client';

import { PropsWithChildren, useState, useEffect } from "react";
import { Home, Eye, Edit3 } from "lucide-react";
import { useNavigation } from "@/hooks/useNavigation";
import { useFormMode } from "@/contexts/admin/FormModeContext";
import Divider from "./Divider";
import { log } from '@/utils/logger';

interface PageHeaderProps {
  name: string;
  onPreview: () => void;
  onSave: () => void;
  currentStep: number; // 1 ~ 6
  onStepChange?: (step: number) => void; // 스텝 변경 콜백 추가
  id_uuid_hospital?: string; // 병원 ID 추가
}

const PageHeader = ({
  name,
  currentStep,
  children,
  onPreview,
  onSave,
  onStepChange,
  id_uuid_hospital,
}: PropsWithChildren<PageHeaderProps>) => {
  const { navigate } = useNavigation();
  const { toggleMode, isReadMode } = useFormMode();
  const [stepValidation, setStepValidation] = useState<{
    hospital_exists: boolean;
    hospital_detail_exists: boolean;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleHomeClick = () => {
    navigate("/admin");
  };

  const handlePreview = () => {
    onPreview();
  };

  const handleSave = () => {
    onSave();
  };

  // 병원 데이터 유효성 검사
  const validateHospitalData = async () => {
    if (!id_uuid_hospital) return;
    
    try {
      setIsLoading(true);
      log.info('PageHeader 유효성 검사 시작:', id_uuid_hospital);
      
      const response = await fetch(`/api/validate?id_uuid=${id_uuid_hospital}`);
      const result = await response.json();
      
      log.info('PageHeader 유효성 검사 결과:', result);
      
      if (result.status === 'success') {
        setStepValidation(result.data);
      }
    } catch (error) {
      console.error('PageHeader 유효성 검사 실패:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    validateHospitalData();
  }, [id_uuid_hospital]);

  // 스텝 클릭 가능 여부 확인
  const isStepClickable = (step: number) => {
    // console.log(`isStepClickable step: ${step}  currentStep:${currentStep}`);
    // console.log(`isStepClickable stepValidation:`, stepValidation);
    
    // 현재 단계는 클릭 불가
    if (step === currentStep) return false;
    
    // Step 1은 항상 가능
    if (step <= 1) return true;
    
    // stepValidation이 없으면 불가능
    if (!stepValidation) return false;
    
    // Step 2 이후는 병원 데이터가 있어야 가능
    if (step >= 2 && !stepValidation.hospital_exists) {
      console.log(`Step ${step} 불가: hospital_exists = false`);
      return false;
    }
    
    // Step 4 이후는 병원 상세 데이터도 있어야 가능
    if (step >= 4 && !stepValidation.hospital_detail_exists) {
      console.log(`Step ${step} 불가: hospital_detail_exists = false`);
      return false;
    }
    
    // console.log(`Step ${step} 가능`);
    return true;
  };

  const handleStepClick = (step: number) => {
    console.log(`handleStepClick step: ${step}  onStepChange:${onStepChange} isStepClickable(step):${isStepClickable(step)}`);
    if (isStepClickable(step) && onStepChange) {
      onStepChange(step);
    }
  };
  return (
    <>
      {/* 상단 회색 헤더 */}
      <div className="sticky top-0 z-50 text-[#464344]">
        <div className="relative flex justify-center items-center bg-gray-200 px-6 py-3">
          {/* 왼쪽 홈 아이콘 */}
          <Home
            className="absolute left-4 top-1/2 -translate-y-1/2 cursor-pointer"
            size={24}
            onClick={handleHomeClick}
          />

          {/* 중앙 텍스트 */}
          <h1 className="font-bold text-[25px]">{name}</h1>

          {/* 오른쪽 모드 토글 버튼 */}
          <div className="absolute right-4 flex gap-4">
            <button
              onClick={toggleMode}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                isReadMode
                  ? 'bg-blue-500 hover:bg-blue-600 text-white'
                  : 'bg-orange-500 hover:bg-orange-600 text-white'
              }`}
              title={isReadMode ? 'Switch to Edit Mode' : 'Switch to Read Mode'}
              data-enforcer-skip
            >
              {isReadMode ? (
                <>
                  <Eye size={18} />
                  <span>ReadOnly Mode 수정하려면 클릭</span>
                </>
              ) : (
                <>
                  <Edit3 size={18} />
                  <span>현재 수정가능합니다</span>
                </>
              )}
            </button>
          </div>
        </div>

      
      <div className="flex justify-center py-2 bg-gray-100">
        <div className="flex gap-4 items-center">
          {[1, 2, 3, 4, 5, 6, 7].map((step) => (
            <div key={step} className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-200 ${
                  step === currentStep
                    ? "bg-orange-500 border-orange-500 text-white cursor-default"
                    : isStepClickable(step)
                    ? "bg-blue-500 border-blue-500 text-white cursor-pointer hover:bg-blue-600 hover:border-blue-600"
                    : "bg-white border-gray-400 text-gray-400 cursor-not-allowed"
                }`}
                onClick={() => {
                  console.log(`onClick step: ${step}, isClickable: ${isStepClickable(step)}`);
                  if (isStepClickable(step)) {
                    handleStepClick(step);
                  }
                }}
                title={
                  step === currentStep
                    ? "현재 단계"
                    : isStepClickable(step)
                    ? `Step ${step}로 이동`
                    : step < currentStep
                    ? "데이터가 없어 이동할 수 없습니다"
                    : "아직 진행되지 않은 단계"
                }
              >
                {step}
              </div>
              {/* 선 사이에 간격 조정 */}
              {step !== 7 && (
                <div className="ml-3 w-8 h-1 bg-gray-400"></div>
              )}
            </div>
          ))}
        </div>
      </div>
      <div className="w-full h-[1px] bg-gray-300" />
      </div>

    </>
  );

};

export default PageHeader;
