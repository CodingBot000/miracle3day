'use client';


import { useEffect, useState } from 'react';
import Button from '@/components/admin/Button';
import LoadingSpinner from '@/components/admin/LoadingSpinner';
import useModal from '@/hooks/useModal';
import OpeningHoursForm, {
  OpeningHour,
} from '@/components/admin/OpeningHoursForm';
import ExtraOptions, {
  ExtraOptionState,
} from '@/components/admin/ExtraOptions';
import { Surgery } from '@/models/admin/surgery';
import { ExistingHospitalData } from '@/models/admin/hospital';
import { mapExistingDataToFormValues } from '@/lib/admin/hospitalDataMapper';
import { uploadAPI, formatApiError, isApiSuccess, api } from '@/lib/admin/api-client';
import Divider from '@/components/admin/Divider';
import PageBottom from '@/components/admin/PageBottom';
import { useFormMode } from '@/contexts/admin/FormModeContext';
import { log } from "@/utils/logger";

interface Step3BusinessHoursProps {
  id_uuid_hospital: string;
  id_admin: string;
  isEditMode?: boolean; // 편집 모드 여부
  onPrev: () => void;
  onNext: () => void;
}


const Step3BusinessHours = ({
  id_uuid_hospital,
  id_admin,
  isEditMode = false,
  onPrev,
  onNext,
}: Step3BusinessHoursProps) => {
    log.info('Step3BusinessHours id_uuid_hospital', id_uuid_hospital);
    const { isReadMode } = useFormMode();
  const [openingHours, setOpeningHours] = useState<
    OpeningHour[]
  >([]);
  const [optionState, setOptionState] =
    useState<ExtraOptionState>({
      has_private_recovery_room: false,
      has_parking: false,
      has_cctv: false,
      has_night_counseling: false,
      has_female_doctor: false,
      has_anesthesiologist: false,
      specialist_count: 1,
    });

  const [formState, setFormState] = useState<{
    message?: string;
    status?: string;
    errorType?: 'validation' | 'server' | 'success';
  } | null>(null);
  const [showFinalResult, setShowFinalResult] =
    useState(false);

  const [isLoadingExistingData, setIsLoadingExistingData] =
    useState(false);
  const [existingData, setExistingData] =
    useState<ExistingHospitalData | null>(null);
  const [initialBusinessHours, setInitialBusinessHours] =
    useState<OpeningHour[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);


  const { handleOpenModal, open } = useModal();

  useEffect(() => {
    if (formState?.message && showFinalResult) {
      handleOpenModal();
    }
  }, [formState, showFinalResult]);


//   // 편집 모드일 때 기존 데이터 로딩
  useEffect(() => {
    log.info(
      `isEditMode: ${isEditMode}, id_admin: ${id_admin}`,
    );
    if (isEditMode && id_admin && id_uuid_hospital) {
      loadExistingDataForEdit();
    }
  }, [isEditMode, id_admin, id_uuid_hospital]);

  useEffect(() => {
    log.info('Step2 - initialBusinessHours 변경됨:', initialBusinessHours);
    if (initialBusinessHours.length > 0) {
      setOpeningHours(initialBusinessHours);
      log.info('Step2 - openingHours 업데이트됨:', initialBusinessHours);
    }
  }, [initialBusinessHours]);

  useEffect(() => {
    log.info('Step2 - optionState 변경됨:', optionState);
  }, [optionState]);

  const loadExistingDataForEdit = async () => {
    try {
      setIsLoadingExistingData(true);
      log.info(' 편집 모드 - 기존 데이터 로딩 시작');

      // ✅ API를 사용하여 데이터 로드 (hospitalDataLoader 대신)
      const result = await api.hospital.getPreview(id_uuid_hospital);

      if (!result.success || !result.data) {
        log.info(' 편집 모드 - 기존 데이터가 없습니다');
        return;
      }

      const data = result.data.hospital;
      if (data) {
        log.info('steep2 BusinessHours data data.businessHours?.length: ', data.businessHours?.length);
        log.info('steep2 BusinessHours data data.hospital: ', data.hospital);
        setExistingData(data);
        populateFormWithExistingData(data);
        log.info(' 편집 모드 - 기존 데이터 로딩 완료');
      } else {
        log.info(' 편집 모드 - 기존 데이터가 없습니다');
      }
    } catch (error) {
      console.error(
        ' 편집 모드 - 데이터 로딩 실패:',
        error,
      );
      setFormState({
        message: '기존 데이터를 불러오는데 실패했습니다.',
        status: 'error',
        errorType: 'server',
      });
      setShowFinalResult(true);
    } finally {
      setIsLoadingExistingData(false);
    }
  };

  const populateFormWithExistingData = (
    existingData: ExistingHospitalData,
  ) => {
    
    try {
        log.info('폼에 기존 데이터 적용 시작');

        log.info('폼에 기존데이터  적용 전 기존데이터 화인 :', existingData);
      // 1. 데이터를 폼 형식으로 변환
      const formData = mapExistingDataToFormValues(existingData);
      log.info('변환된 폼 데이터 적용 종료 결과 formData:', formData);

      // 4. 영업시간 설정
      log.info('영업시간 설정 시작');
      log.info(
        '변환된 영업시간 데이터:',
        formData.businessHours,
      );
      setInitialBusinessHours(formData.businessHours);
      log.info(
        'initialBusinessHours 상태 업데이트 완료',
      );

      // 5. 편의시설 설정
      setOptionState({
        has_private_recovery_room:
          formData.facilities.has_private_recovery_room,
        has_parking: formData.facilities.has_parking,
        has_cctv: formData.facilities.has_cctv,
        has_night_counseling:
          formData.facilities.has_night_counseling,
        has_female_doctor:
          formData.facilities.has_female_doctor,
        has_anesthesiologist:
          formData.facilities.has_anesthesiologist,
        specialist_count:
          formData.facilities.specialist_count,
      });
      log.info('편의시설 설정 완료');

    } catch (error) {
      console.error('기존 데이터 적용 중 오류:', error);
    }
  };

  // 부가시설 옵션 변경 처리하는 함수
  const handleExtraOptionsChange = (
    data: ExtraOptionState,
  ) => {
    log.info(
      'UploadClient - 부가시설 옵션 업데이트:',
      data,
    );
    setOptionState(data);
  };

  if (
    // isPending ||
    // categoriesLoading ||
    isLoadingExistingData
  )
    return <LoadingSpinner backdrop />;

 
const handleNext = async () => {
    log.info('handleNext');
    if (isReadMode) {
      onNext();
      return;
    }
    setIsSubmitting(true);
    const result = await handleSave();
    setIsSubmitting(false);
    log.info('handleNext result', result);
    document.body.style.overflow = '';
    if (result?.status === 'success') {
        onNext();
    }
}

  const handleSave = async () => {
    log.info('Step2 handleSave 시작');
    
    try {
      // FormData 구성
      const formData = new FormData();
      formData.append('is_edit_mode', isEditMode ? 'true' : 'false');
      formData.append('current_user_uid', id_admin);
      formData.append('id_uuid_hospital', id_uuid_hospital);
      
      // 시설 정보
      formData.append('extra_options', JSON.stringify(optionState));
      // 영업 시간
      formData.append('opening_hours', JSON.stringify(openingHours));
      
      log.info('Step2 - 전송할 데이터:');
      log.info('openingHours:', openingHours);
      log.info('openingHours 길이:', openingHours.length);
      log.info('optionState:', optionState);
      log.info('optionState JSON:', JSON.stringify(optionState));

      log.info('Step2 API 호출 시작');
      
      // 새로운 API Route 호출
      const result = await uploadAPI.step3(formData);

      log.info('Step2 API 응답:', result);

      if (!isApiSuccess(result)) {
        // 에러 발생 시 처리
        const errorMessage = formatApiError(result.error);
        
        setFormState({
          message: errorMessage,
          status: 'error',
          errorType: 'server',
        });
        setShowFinalResult(true);
        
        return {
          status: 'error',
          message: errorMessage
        };
      } else {
        // 성공 시 처리
        log.info('Step2 데이터 저장 성공');
        setFormState({
          message: result.message || '성공적으로 저장되었습니다.',
          status: 'success',
          errorType: undefined,
        });
        
        return {
          status: 'success',
          message: result.message
        };
      }
      
    } catch (error) {
      console.error('Step2 API 호출 에러:', error);

      const errorMessage = formatApiError(error);

      setFormState({
        message: errorMessage,
        status: 'error',
        errorType: 'server',
      });
      setShowFinalResult(true);
      
      return {
        status: 'error',
        message: errorMessage
      };
    }
  };

  return (
    <main className="min-h-screen flex flex-col">
      
      <div
        className='my-8 mx-auto px-6 pb-24'
        style={{ width: '100vw', maxWidth: '1024px' }}
      >
        <div className='space-y-4 w-full'>
        <div className='w-full mt-4'>
          <ExtraOptions
            onSelectOptionState={handleExtraOptionsChange}
            initialOptions={optionState}
          />
        </div>

        <Divider />
        <OpeningHoursForm
          onSelectOpeningHours={setOpeningHours}
          initialHours={initialBusinessHours}
        />


      </div>

      </div>

      <PageBottom step={3} isSubmitting={isSubmitting}  onNext={handleNext} onPrev={onPrev} />
      {/* 기본 모달 */}
      {formState?.message && showFinalResult && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50" data-enforcer-skip>
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
            <h3 className="text-lg font-semibold mb-2">{formState.status === 'success' ? '성공' : '오류'}</h3>
            <p className="text-sm text-gray-800 mb-4 whitespace-pre-line">{formState.message}</p>
            <div className="flex justify-end gap-2">
              <Button onClick={() => {
                setShowFinalResult(false);
                document.body.style.overflow = '';
              }}>확인</Button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default Step3BusinessHours;
