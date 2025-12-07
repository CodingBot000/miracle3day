'use client';

import PageHeader from '@/components/admin/PageHeader';
import InputField, { TextArea } from '@/components/admin/InputField';
import { useEffect, useState } from 'react';
import Button from '@/components/admin/Button';

import LoadingSpinner from '@/components/admin/LoadingSpinner';
import useModal from '@/hooks/useModal';

import { useRouter } from 'next/navigation';

import { ExistingHospitalData } from '@/models/admin/hospital';
import { mapExistingDataToFormValues } from '@/lib/admin/hospitalDataMapper';

import Divider from '@/components/admin/Divider';

import ContactsInfoSection from '../../../components/admin/ContactsInfoSection';
import { log } from "@/utils/logger";
import { uploadAPI, formatApiError, isApiSuccess, api } from '@/lib/admin/api-client';

import { ContactsInfo } from '@/models/admin/basicinfo';
import { isValidEmail } from '@/utils/validators';
import PageBottom from '@/components/admin/PageBottom';
import { useFormMode } from '@/contexts/admin/FormModeContext';


interface Step2BasicContactInfoProps {
  id_uuid_hospital: string;
  setIdUUIDHospital: (id_uuid_hospital: string) => void;
  id_admin: string;
  isEditMode?: boolean; // 편집 모드 여부
  onPrev: () => void;
  onNext: () => void;
}

const Step2BasicContactInfo = ({
  id_uuid_hospital,
  setIdUUIDHospital,
  onPrev,
  onNext,
  id_admin,
  isEditMode = false,
}: Step2BasicContactInfoProps) => {
  

  const router = useRouter();
  const { isReadMode } = useFormMode();
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
  

  // 편집 모드를 위한 폼 초기값 상태들
  const [hospitalName, setHospitalName] =
    useState<string>('');
 
  // 확인 모달 상태 추가
  const [showConfirmModal, setShowConfirmModal] =
    useState(false);
  const [preparedFormData, setPreparedFormData] =
    useState<FormData | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // const [basicInfo, setBasicInfo] = useState<BasicInfo>({
  //   name: '',
  //   email: '',
  //   tel: '',
  //   introduction: '',
  //   introduction_en: '',
  //   kakao_talk: '',
  //   line: '',
  //   we_chat: '',
  //   whats_app: '',
  //   telegram: '',
  //   facebook_messenger: '',
  //   instagram: '',
  //   tiktok: '',
  //   youtube: '',
  //   other_channel: '',
  //   sns_content_agreement: null,
  // });

  // 연락처 정보 상태 추가
  const [contactsInfo, setContactsInfo] = useState<ContactsInfo>({
    consultationPhone: '',
    consultationManagerPhones: ['', '', ''],
    smsPhone: '',
    eventManagerPhone: '',
    marketingEmails: ['', '', '']
  });

 

  const { handleOpenModal, open } = useModal();

  useEffect(() => {
    if (formState?.message && showFinalResult) {
      handleOpenModal();
    }
  }, [formState, showFinalResult]);

  // 편집 모드일 때 기존 데이터 로딩
  useEffect(() => {
    log.info(
      `Step2 - isEditMode: ${isEditMode}, id_admin: ${id_admin}, id_uuid_hospital: ${id_uuid_hospital}`,
    );
    if (isEditMode && id_admin && id_uuid_hospital) {
      log.info('Step2 - 모든 조건 충족, 데이터 로딩 시작');
      loadExistingDataForEdit();
    } else if (isEditMode && id_admin && !id_uuid_hospital) {
      log.warn('Step2 - id_uuid_hospital을 기다리는 중...');
    }
  }, [isEditMode, id_admin, id_uuid_hospital]);

  // hospitalName 상태를 basicInfo.name과 동기화
  // useEffect(() => {
  //   setHospitalName(basicInfo.name);
  // }, [basicInfo.name]);

  const loadExistingDataForEdit = async () => {
    try {
      setIsLoadingExistingData(true);
      log.info('Step2 - 편집 모드 - 기존 데이터 로딩 시작');

      // ✅ API를 사용하여 데이터 로드 (hospitalDataLoader 대신)
      const result = await api.hospital.getPreview(id_uuid_hospital);

      if (!result.success || !result.data) {
        log.info('Step2 - 편집 모드 - 기존 데이터가 없습니다');
        return;
      }

      const data = result.data.hospital;
      if (data) {
        setExistingData(data);
        populateFormWithExistingData(data);
        log.info('Step2 - 편집 모드 - 기존 데이터 로딩 완료');
      } else {
        log.info('Step2 - 편집 모드 - 기존 데이터가 없습니다');
      }
    } catch (error) {
      console.error(
        'Step2 - 편집 모드 - 데이터 로딩 실패:',
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
    log.info('Step2 - 폼에 기존 데이터 적용 시작');

    try {
      // 1. 데이터를 폼 형식으로 변환
      const formData = mapExistingDataToFormValues(existingData);
      log.info('Step2 - 변환된 폼 데이터:', formData);

      // 2. 병원 기본 정보 설정
      setHospitalName(formData.hospital.name);

      if (existingData.contacts && existingData.contacts.length > 0) {
        log.info('Step2 - 연락처 정보 설정 시작:', existingData.contacts);
        
        // 연락처 데이터를 ContactsInfo 형태로 변환
        const contactsData: ContactsInfo = {
          consultationPhone: '',
          consultationManagerPhones: ['', '', ''],
          smsPhone: '',
          eventManagerPhone: '',
          marketingEmails: ['', '', '']
        };

        existingData.contacts.forEach((contact: any) => {
          switch (contact.type) {
            case 'consultation_phone':
              contactsData.consultationPhone = contact.value;
              break;
            case 'consult_manager_phone':
              if (contact.sequence >= 0 && contact.sequence < 3) {
                contactsData.consultationManagerPhones[contact.sequence] = contact.value;
              }
              break;
            case 'sms_phone':
              contactsData.smsPhone = contact.value;
              break;
            case 'event_manager_phone':
              contactsData.eventManagerPhone = contact.value;
              break;
            case 'marketing_email':
              if (contact.sequence >= 0 && contact.sequence < 3) {
                contactsData.marketingEmails[contact.sequence] = contact.value;
              }
              break;
          }
        });

        setContactsInfo(contactsData);
        log.info('Step2 - 연락처 정보 설정 완료:', contactsData);
      }

      log.info('Step2 - 기존 데이터 적용 완료!');
      log.info('Step2 - 적용된 데이터:', {
        병원명: formData.hospital.name,
        의사수: formData.doctors.length,
        영업시간: Object.keys(formData.businessHours)
          .length,
        시술정보: Object.keys(formData.treatments).length,
      });
    } catch (error) {
      console.error('Step2 - 기존 데이터 적용 중 오류:', error);
    }
  };

  // 폼 검증 함수
  const validateForm = (): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    // 7. 연락처 정보 검증
    // consultationPhone 검증
    if (!contactsInfo.consultationPhone?.trim()) {
      errors.push('상담전화번호를 입력해주세요.');
    }

    // consultationManagerPhones 배열 검증 (1개 이상)
    const hasConsultationManager = contactsInfo.consultationManagerPhones.some(phone => phone?.trim());
    if (!hasConsultationManager) {
      errors.push('상담관리자 전화번호를 1개 이상 입력해주세요.');
    }

    // smsPhone 검증
    if (!contactsInfo.smsPhone?.trim()) {
      errors.push('SMS 전화번호를 입력해주세요.');
    }

    // eventManagerPhone 검증
    if (!contactsInfo.eventManagerPhone?.trim()) {
      errors.push('이벤트관리자 전화번호를 입력해주세요.');
    }

    // marketingEmails 배열 검증 (1개 이상)
    const hasMarketingEmail = contactsInfo.marketingEmails.some(email => email?.trim());
    if (!hasMarketingEmail) {
      errors.push('마케팅 이메일을 1개 이상 입력해주세요.');
    } else {
      // 마케팅 이메일 형식 검증 - 한 개라도 잘못된 형식이 있으면 에러 메시지 하나만 추가
      const hasInvalidEmail = contactsInfo.marketingEmails.some(email => email?.trim() && !isValidEmail(email));
      if (hasInvalidEmail) {
        errors.push('마케팅 이메일 중 올바른 이메일 형식이 아닌 이메일이 있습니다.');
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  };


  if (
    // isPending ||
    // categoriesLoading ||
    isLoadingExistingData
  )
    return <LoadingSpinner backdrop />;

    const handleNext = async () => {
        log.info('Step2 - handleNext 시작');
        if (isReadMode) {
          onNext();
          return;
        }
        setIsSubmitting(true);

        const result = await handleSave();
        setIsSubmitting(false);
        console.debug('Step2 - handleNext result:', result);
        if (result?.status === 'success') {
          document.body.style.overflow = '';
            onNext();
        }
    }
    
 
  const handleSave = async () => {
    log.info('Step2 - handleSave 시작');
    log.info('Step2 - 현재 상태:', {
      // basicInfo,
      // selectedLocation,
      // addressForSendForm,
      contactsInfo,
      id_admin,
      id_uuid_hospital,
      isEditMode
    });
    setIsSubmitting(true);
    
    try {
      // 클라이언트 측 검증
      log.info('Step2 - 검증 시작');
      const validation = validateForm();
      
      if (!validation.isValid) {
        log.info('Step2 - 검증 실패:', validation.errors);
        const formattedErrors = validation.errors.map((error, index) => `${index + 1}. ${error}`).join('\n');
        setFormState({
          message: formattedErrors,
          status: 'error',
          errorType: 'validation',
        });
        setShowFinalResult(true);
        document.body.style.overflow = '';
        return { status: 'error' };
      }
      
      log.info('Step2 - 검증 통과');

      // FormData 구성
      log.info('Step2 - FormData 구성 시작');
      const formData = new FormData();
      formData.append('current_user_uid', id_admin);
      formData.append('is_edit_mode', isEditMode ? 'true' : 'false');
      
      // 기본 정보
      formData.append('id_uuid', id_uuid_hospital);
      
      log.info('Step2 - 기본 정보 FormData 추가 완료');

      // 연락처 정보 추가
      formData.append('contacts_info', JSON.stringify(contactsInfo));

      log.info('Step2 - FormData 구성 완료');
      log.info('Step2 - API 호출 시작');
      
      // 새로운 API Route 호출
      const result = await uploadAPI.step2(formData);

      log.info('Step2 - API 응답:', result);
      
      if (!isApiSuccess(result)) {
        // 에러 발생 시 처리
        log.info('Step2 - API 응답이 성공이 아님:', result);
        const errorMessage = formatApiError(result.error);
        log.info('Step2 - 포맷된 에러 메시지:', errorMessage);
        
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
        log.info('Step2 - 데이터 저장 성공');
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
      console.error('Step2 - API 호출 에러:', error);
      console.error('Step2 - 에러 타입:', typeof error);
      console.error('Step2 - 에러 메시지:', (error as any)?.message);
      console.error('Step2 - 에러 스택:', (error as any)?.stack);

      const errorMessage = formatApiError(error);
      log.info('Step2 - 포맷된 에러 메시지:', errorMessage);

      setFormState({
        message: errorMessage,
        status: 'error',
        errorType: 'server',
      });
      setShowFinalResult(true);
      setShowConfirmModal(false);
      setPreparedFormData(null);
      
      return {
        status: 'error',
        message: errorMessage
      };
    } finally {
      log.info('Step2 - handleSave 완료');
      setIsSubmitting(false);
    }
  };

  return (
    <main>
      <div
        className='my-8 mx-auto px-6 pb-24'
        style={{ width: '100vw', maxWidth: '1024px' }}
      >
        <div className='space-y-4 w-full'>
          
          <ContactsInfoSection
            onContactsChange={setContactsInfo}
            initialContacts={contactsInfo}
          />
      
        </div>
      </div>
      
   
      <PageBottom step={2} isSubmitting={isSubmitting} onPrev={onPrev} onNext={handleNext} />

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

export default Step2BasicContactInfo;
