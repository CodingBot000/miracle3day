'use client';

import { useEffect, useState } from 'react';
import Button from '@/components/admin/Button';

import { log } from "@/utils/logger";
import { useQuery } from '@tanstack/react-query';
import LoadingSpinner from '@/components/admin/LoadingSpinner';
import useModal from '@/hooks/useModal';
import { v4 as uuidv4 } from 'uuid';
import AddressSection from '@/components/admin/AddressSection';
import LocationSelect from '@/components/admin/LocationSelect';

// import { useTreatmentCategories } from '@/hooks/useTreatmentCategories';
import { DoctorInfo } from '@/components/admin/DoctorInfoForm';
import { HospitalAddress } from '@/models/admin/address';
import { Surgery } from '@/models/admin/surgery';

import { ExistingHospitalData } from '@/models/admin/hospital';
import { mapExistingDataToFormValues } from '@/lib/admin/hospitalDataMapper';

import BasicInfoSection from '@/components/admin/BasicInfoSection';
import Divider from '@/components/admin/Divider';
import { api, uploadAPI, formatApiError, isApiSuccess } from '@/lib/admin/api-client';
import { findRegionByKey, REGIONS } from "@/constants/location";
import { BasicInfo } from '@/models/admin/basicinfo';
import { isValidEmail } from '@/utils/validators';
import PageBottom from '@/components/admin/PageBottom';
import { useFormMode } from '@/contexts/admin/FormModeContext';


interface Step1BasicInfoProps {
  id_uuid_hospital: string;
  setIdUUIDHospital: (id_uuid_hospital: string) => void;
  id_admin: string;
  isEditMode?: boolean; // 편집 모드 여부
  onNext: () => void;
}

const Step1BasicInfo = ({
  id_uuid_hospital,
  setIdUUIDHospital,
  onNext,
  id_admin,
  isEditMode = false,
}: Step1BasicInfoProps) => {
  
  // const {
  //   data: categories,
  //   isLoading: categoriesLoading,
  //   error: categoriesError,
  // } = useTreatmentCategories();

  const { isReadMode } = useFormMode();
  const [address, setAddress] = useState('');
  const [addressForSendForm, setAddressForSendForm] =
    useState<HospitalAddress | null>(null);
    const [selectedLocation, setSelectedLocation] = useState<{
    key: number;
    label: {
      ko: string;
      en: string;
    };
    name: string;
  } | null>(null);
  

  const [formState, setFormState] = useState<{
    message?: string;
    status?: string;
    errorType?: 'validation' | 'server' | 'success';
  } | null>(null);
  const [showFinalResult, setShowFinalResult] =
    useState(false);
  const [doctors, setDoctors] = useState<DoctorInfo[]>([]);
  const [isLoadingExistingData, setIsLoadingExistingData] =
    useState(false);
  const [existingData, setExistingData] =
    useState<ExistingHospitalData | null>(null);

  // 편집 모드를 위한 폼 초기값 상태들
  const [hospitalName, setHospitalName] =
    useState<string>('');
    const [hospitalNameEn, setHospitalNameEn] =
    useState<string>('');
  const [hospitalDirections, setHospitalDirections] =
    useState<string>('');
  const [hospitalLocation, setHospitalLocation] =
    useState<string>('');

  // 확인 모달 상태 추가
  const [showConfirmModal, setShowConfirmModal] =
    useState(false);
  const [preparedFormData, setPreparedFormData] =
    useState<FormData | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [basicInfo, setBasicInfo] = useState<BasicInfo>({
    name: '',
    name_en: '',
    email: '',
    tel: '',
    introduction: '',
    introduction_en: '',
    kakao_talk: '',
    line: '',
    we_chat: '',
    whats_app: '',
    telegram: '',
    facebook_messenger: '',
    instagram: '',
    tiktok: '',
    youtube: '',
    other_channel: '',
    sns_content_agreement: null,
  });

  const [feedback, setFeedback] = useState<string>('');
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);

  const { data: surgeryList = [], isPending } = useQuery<
    Surgery[]
  >({
    queryKey: ['surgery_info'],
    queryFn: async () => {
      const queryStartTime = Date.now();

      // Use API endpoint instead of direct Supabase access
      const result = await api.surgery.getAll();

      const queryEndTime = Date.now();
      const queryTime = queryEndTime - queryStartTime;

      if (!result.success || !result.data) {
        throw new Error(result.error || 'surgery_info error');
      }

      return result.data.surgeryInfo || [];
    },
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
      `Step1 - isEditMode: ${isEditMode}, id_admin: ${id_admin}  id_uuid_hospital: ${id_uuid_hospital}`,
    );

    // id_uuid_hospital이 설정될 때까지 대기
    if (isEditMode && id_admin && id_uuid_hospital) {
      log.info('Step1 - 모든 조건 충족, 데이터 로딩 시작');
      loadExistingDataForEdit();
    } else if (isEditMode && id_admin && !id_uuid_hospital) {
      log.warn('Step1 - id_uuid_hospital을 기다리는 중...');
    }
  }, [isEditMode, id_admin, id_uuid_hospital]);

  // hospitalName 상태를 basicInfo.name과 동기화
  useEffect(() => {
    setHospitalName(basicInfo.name);
  }, [basicInfo.name]);

  const loadExistingDataForEdit = async () => {
    try {
      setIsLoadingExistingData(true);
      log.info('Step1 - 편집 모드 - 기존 데이터 로딩 시작');
      log.info(
        `Step1 - loadExistingDataForEdit :id_uuid_hospital : ${id_uuid_hospital}}`,
      );
      // Validate hospital ID before loading
      if (!id_uuid_hospital || id_uuid_hospital.trim() === '' || id_uuid_hospital === 'undefined') {
        log.warn('Step1 - 편집 모드 - Hospital ID가 유효하지 않습니다:', id_uuid_hospital);
        setIsLoadingExistingData(false);
        return;
      }

      // API를 통해 기존 데이터 로드
      const previewResult = await api.hospital.getPreview(id_uuid_hospital);
      
      if (!previewResult.success || !previewResult.data) {
        log.info('Step1 - 편집 모드 - 기존 데이터가 없습니다');
        return;
      } else {
        log.info('Step1 - 편집 모드 - 데이터확인 for debugging:', previewResult.data);
      }
      
      const data = previewResult.data.hospital;
      if (data) {
        setExistingData(data);
        populateFormWithExistingData(data);
        log.info('Step1 - 편집 모드 - 기존 데이터 로딩 완료');
      } else {
        log.info('Step1 - 편집 모드 - 기존 데이터가 없습니다');
      }
    } catch (error) {
      console.error(
        'Step1 - 편집 모드 - 데이터 로딩 실패:',
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
    log.info('Step1 - 폼에 기존 데이터 적용 시작 existingData:', existingData);

    try {
      // 1. 데이터를 폼 형식으로 변환
      const formData = mapExistingDataToFormValues(existingData);
      log.info('Step1 - 변환된 폼 데이터:', formData);

      // 2. 병원 기본 정보 설정
      setHospitalName(formData.hospital.name);
      setHospitalNameEn(formData.hospital.name_en)
      setHospitalDirections(formData.hospital.directions);
      setHospitalLocation(formData.hospital.location);
      
      // SNS 채널 정보와 기본 정보 설정
      // ✅ existingData는 nested 구조 - hospitalDetail에서 접근
      const hospitalDetail = existingData.hospitalDetail;
      setBasicInfo({
        name: formData.hospital.name || '',
        name_en: formData.hospital.name_en || '',
        email: hospitalDetail?.email || '',
        tel: hospitalDetail?.tel || '',
        introduction: hospitalDetail?.introduction || '',
        introduction_en: hospitalDetail?.introduction_en || '',
        kakao_talk: hospitalDetail?.kakao_talk || '',
        line: hospitalDetail?.line || '',
        we_chat: hospitalDetail?.we_chat || '',
        whats_app: hospitalDetail?.whats_app || '',
        telegram: hospitalDetail?.telegram || '',
        facebook_messenger: hospitalDetail?.facebook_messenger || '',
        instagram: hospitalDetail?.instagram || '',
        tiktok: hospitalDetail?.tiktok || '',
        youtube: hospitalDetail?.youtube || '',
        other_channel: hospitalDetail?.other_channel || '',
        sns_content_agreement: hospitalDetail?.sns_content_agreement === null ? null : (hospitalDetail?.sns_content_agreement as 1 | 0),
      });
      log.info('Step1 - 기본 정보 및 SNS 채널 정보 설정 완료');

      log.info(
        'Step1 - 병원 기본 정보 설정 완료:',
        formData.hospital.name,
      );

      // 3. 의사 정보 설정
      setDoctors(formData.doctors);
      log.info(
        'Step1 - 의사 정보 설정 완료:',
        formData.doctors.length,
        '명',
      );

      // 피드백 정보 설정
      if (existingData.feedback) {
        setFeedback(existingData.feedback);
        log.info('Step1 - 피드백 정보 설정 완료:', existingData.feedback);
      }

      // 3. 주소 정보 설정
      const hospitalInfo = existingData.hospital;
      if (hospitalInfo?.address_full_road) {
        setAddress(hospitalInfo.address_full_road);
        setAddressForSendForm({
          address_full_road: hospitalInfo.address_full_road,
          address_full_road_en: hospitalInfo.address_full_road_en || '',
          address_full_jibun: hospitalInfo.address_full_jibun,
          address_full_jibun_en: hospitalInfo.address_full_jibun_en || '',
          zipcode: hospitalInfo.zipcode,
          address_si: hospitalInfo.address_si,
          address_si_en: hospitalInfo.address_si_en || '',
          address_gu: hospitalInfo.address_gu,
          address_gu_en: hospitalInfo.address_gu_en || '',
          address_dong: hospitalInfo.address_dong,
          address_dong_en: hospitalInfo.address_dong_en || '',
          bname: hospitalInfo.bname,
          bname_en: hospitalInfo.bname_en || '',
          building_name: hospitalInfo.building_name,
          building_name_en: hospitalInfo.building_name_en || '',
          address_detail: hospitalInfo.address_detail,
          address_detail_en: hospitalInfo.address_detail_en,
          directions_to_clinic: hospitalInfo.directions_to_clinic,
          directions_to_clinic_en: hospitalInfo.directions_to_clinic_en,
          latitude: hospitalInfo.latitude,
          longitude: hospitalInfo.longitude,
        });

        log.info('Step1 - 주소 정보 설정 완료');
      }

      // 6. 위치 정보 설정
      if (hospitalInfo?.location) {
        try {
            const locKey = hospitalInfo.location;
            log.info('Step1 - 위치 정보 조회 시작 key :', locKey);
            // if (locKey) {
              // key는 string -> number 변환
              const locationKey = parseInt(locKey, 10);
              const region = findRegionByKey(REGIONS, locationKey);

              if (region) {
                setSelectedLocation(region);
                log.info('Step1 - 위치 정보 설정 완료:', region);
              } else {
                console.warn('Step1 - 위치 정보 해당 key에 맞는 REGION을 찾지 못했습니다.', locationKey);
              }
            // }
          } catch (error) {
            console.error('Step1 - 위치 정보 파싱 실패:', hospitalInfo.location, error);
          }
      }

      log.info('Step1 - 기존 데이터 적용 완료!');
      log.info('Step1 - 적용된 데이터:', {
        병원명: formData.hospital.name,
        의사수: formData.doctors.length,
        영업시간: Object.keys(formData.businessHours)
          .length,
        시술정보: Object.keys(formData.treatments).length,
      });
    } catch (error) {
      console.error('Step1 - 기존 데이터 적용 중 오류:', error);
    }
  };


  // 폼 검증 함수
  const validateForm = (): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    // 1. 병원명 검증
    if (!basicInfo.name?.trim() || !basicInfo.name_en?.trim()) {
      errors.push('병원명을 입력해주세요. 영문이름도 같이 입력해주세요.');
    }

    // 2. 이메일 검증
    if (!basicInfo.email?.trim() ) {
      errors.push('이메일을 입력해주세요.');
    } else if (!isValidEmail(basicInfo.email)) {
        errors.push('이메일 항목에 입력된 이메일이 올바른 이메일 형식이 아닙니다.');
    }

    // 3. 병원소개(국문) 검증
    if (!basicInfo.introduction?.trim()) {
      errors.push('병원소개(국문)를 입력해주세요.');
    }

    // 4. 대표전화번호 검증
    if (!basicInfo.tel?.trim()) {
      errors.push('대표전화번호를 입력해주세요.');
    }

    if (basicInfo.sns_content_agreement === null || basicInfo.sns_content_agreement === undefined) {
      errors.push('SNS 이용 동의에 대해 동의  혹은 미동의를 선택해 주세요.');
    }

    // 5. 기본 주소 검증 (상세주소, 찾아오는 방법 상세안내 제외)
    // 서울 동작구 남부순환로 2005 의 경우 도로명 선택시 지번을 DaumPost api에서 빈값으로 준다. 
    // 그래서 &&조건으로 변경한다
    if (!addressForSendForm || (!addressForSendForm.address_full_jibun?.trim() && !addressForSendForm.address_full_road?.trim())) {
      errors.push('기본 주소를 입력해주세요.');
    }

    // 6. 지역 검증
    if (!selectedLocation) {
      errors.push('지역을 선택해주세요.');
    }


    return {
      isValid: errors.length === 0,
      errors
    };
  };

  // 렌더링 시점 디버깅
  log.info('Step1 - UploadClient 렌더링:', {
    isEditMode,
    hospitalName,
    address,
    addressForSendForm,
    selectedLocation,
    doctorsCount: doctors.length,
    hasExistingData: !!existingData,
    isLoadingExistingData,
    전달할주소props: {
      initialAddress: address,
      initialAddressDetail:
        addressForSendForm?.address_detail,
      initialAddressDetailEn:
        addressForSendForm?.address_detail_en,
      initialDirections:
        addressForSendForm?.directions_to_clinic,
      initialDirectionsEn:
        addressForSendForm?.directions_to_clinic_en,
    },
  });

  useEffect(() => {
    if (isLoadingExistingData || isPending) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isLoadingExistingData, isPending]);

  if (
    isPending ||
    // categoriesLoading ||
    isLoadingExistingData
  )
    return <LoadingSpinner backdrop />;

    const handleNext = async () => {
      if (isReadMode) {
        onNext();
        return;
      }
        log.info('Step1 - handleNext 시작');
        setIsSubmitting(true);

        const result = await handleSave();
        setIsSubmitting(false);
        console.debug('Step1 - handleNext result:', result);
        document.body.style.overflow = '';
        if (result?.status === 'success') {
            
            onNext();
        }
    }
    
 
  const handleSave = async () => {
    log.info('Step1 - handleSave 시작');
    log.info('Step1 - 현재 상태:', {
      basicInfo,
      selectedLocation,
      addressForSendForm,
      // contactsInfo,
      id_admin,
      id_uuid_hospital,
      isEditMode
    });
    setIsSubmitting(true);
    
    try {
      // 클라이언트 측 검증
      log.info('Step1 - 검증 시작');
      const validation = validateForm();
      
      if (!validation.isValid) {
        log.info('Step1 - 검증 실패:', validation.errors);
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
      
      log.info('Step1 - 검증 통과');

      // FormData 구성
      log.info('Step1 - FormData 구성 시작');
      const formData = new FormData();
      formData.append('current_user_uid', id_admin);
      formData.append('is_edit_mode', isEditMode ? 'true' : 'false');
      
      // 기본 정보
      formData.append('id_uuid', id_uuid_hospital);
      formData.append('name', basicInfo.name);
      formData.append('name_en', basicInfo.name_en);
      formData.append('email', basicInfo.email);
      formData.append('tel', basicInfo.tel);
      formData.append('introduction', basicInfo.introduction);
      formData.append('introduction_en', basicInfo.introduction_en);
      formData.append(
        'sns_content_agreement',
        basicInfo.sns_content_agreement !== null ? String(basicInfo.sns_content_agreement) : ''
      );
      
      log.info('Step1 - 기본 정보 FormData 추가 완료');

      const snsData = {
        kakao_talk: basicInfo.kakao_talk,
        line: basicInfo.line,
        we_chat: basicInfo.we_chat,
        whats_app: basicInfo.whats_app,
        telegram: basicInfo.telegram,
        facebook_messenger: basicInfo.facebook_messenger,
        instagram: basicInfo.instagram,
        tiktok: basicInfo.tiktok,
        youtube: basicInfo.youtube,
        other_channel: basicInfo.other_channel,
      };

      // SNS 정보
      Object.entries(snsData).forEach(([key, value]) => {
        if (value) {
          formData.append(key, value);
        }
      });

      // 주소 정보
      if (addressForSendForm) {
        formData.append('address', JSON.stringify(addressForSendForm));
      }

      // 위치 정보
      if (selectedLocation) {
        formData.append('location', selectedLocation.key.toString() || '');
      }

      // 연락처 정보 추가
      // formData.append('contacts_info', JSON.stringify(contactsInfo));

      log.info('Step1 - FormData 구성 완료');
      log.info('Step1 - API 호출 시작');
      
      // 새로운 API Route 호출
      const result = await uploadAPI.step1(formData);

      log.info('Step1 - API 응답:', result);
      
      if (!isApiSuccess(result)) {
        // 에러 발생 시 처리
        log.info('Step1 - API 응답이 성공이 아님:', result);
        const errorMessage = formatApiError(result.error);
        log.info('Step1 - 포맷된 에러 메시지:', errorMessage);
        
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
        log.info('Step1 - 데이터 저장 성공');
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
      console.error('Step1 - API 호출 에러:', error);
      console.error('Step1 - 에러 타입:', typeof error);
      console.error('Step1 - 에러 메시지:', (error as any)?.message);
      console.error('Step1 - 에러 스택:', (error as any)?.stack);

      const errorMessage = formatApiError(error);
      log.info('Step1 - 포맷된 에러 메시지:', errorMessage);

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
      log.info('Step1 - handleSave 완료');
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
          <BasicInfoSection
            onInfoChange={setBasicInfo}
            initialInfo={basicInfo}
          />
 
          <Divider />
          <div className='w-full'>
            <AddressSection
              onSelectAddress={setAddressForSendForm}
              // onSelectCoordinates={setCoordinates}
              initialAddress={address}
              initialAddressForSendForm={
                addressForSendForm ?? undefined
              }
              // initialCoordinates={coordinates ?? undefined}
              initialAddressDetail={
                addressForSendForm?.address_detail
              }
              initialAddressDetailEn={
                addressForSendForm?.address_detail_en
              }
              initialDirections={
                addressForSendForm?.directions_to_clinic
              }
              initialDirectionsEn={
                addressForSendForm?.directions_to_clinic_en
              }
            />
          </div>
          <LocationSelect
            onSelect={setSelectedLocation}
            selectedLocation={selectedLocation}
          />

          
        {/* <Divider />
     
          <ContactsInfoSection
            onContactsChange={setContactsInfo}
            initialContacts={contactsInfo}
          /> */}
      
        </div>
      </div>
  
      <PageBottom step={1} isSubmitting={isSubmitting} onNext={handleNext} />

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

export default Step1BasicInfo;
