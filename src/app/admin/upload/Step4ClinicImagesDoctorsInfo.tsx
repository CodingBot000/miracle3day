'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid';
import { useAuth } from '@/hooks/useAuth';
// import { uploadHospitalImages, uploadDoctorImages } from '@/lib/clinicUploadApi';
import { prepareFormData } from '@/lib/admin/formDataHelper';
import { uploadAPI, formatApiError, isApiSuccess, api } from '@/lib/admin/api-client';
import { DoctorInfo } from '@/components/admin/DoctorInfoForm';
import Button from '@/components/admin/Button';
import PageHeader from '@/components/admin/PageHeader';
import ClinicImageUploadSection from '@/components/admin/ClinicImageUploadSection';
import DoctorInfoSection from '@/components/admin/DoctorInfoSection';
import LoadingSpinner from '@/components/admin/LoadingSpinner';
import useModal from '@/hooks/useModal';
import { Surgery } from '@/models/admin/surgery';
import Divider from '@/components/admin/Divider';

import { mapExistingDataToFormValues } from '@/lib/admin/hospitalDataMapper';
import { STORAGE_IMAGES } from '@/constants/tables';

import { ExistingHospitalData } from '@/models/admin/hospital';
import ClinicImageThumbnailUploadSection from '@/components/admin/ClinicImageThumbnailUploadSection';
import PageBottom from '@/components/admin/PageBottom';
import { toast } from 'sonner';
import { useFormMode } from '@/contexts/admin/FormModeContext';
import { log } from "@/utils/logger";

const doctorImageUploadLength = 3;
const clinicImageUploadLength = 7;

// Dirty Flag 시스템 - 사용자 행동 기반 변경 감지
function useTouchedFlags() {
  const [touched, setTouched] = React.useState({
    thumbnail: false,             // 썸네일 교체/삭제
    galleryAddOrReplace: false,   // 갤러리 파일 추가/교체
    galleryRemove: false,         // 갤러리 삭제
    galleryReorder: false,        // 갤러리 순서변경
    doctorsText: false,           // 의사 이름/약력 수정
    doctorsPhoto: false,          // 의사 사진 교체/기본이미지 변경
    doctorsReorder: false,        // 의사 순서변경
    doctorsDeleteOrAdd: false,    // 의사 추가/삭제
  });

  const mark = React.useCallback(<K extends keyof typeof touched>(k: K) => {
    setTouched(prev => (prev[k] ? prev : { ...prev, [k]: true }));
  }, []);

  const reset = React.useCallback(() => {
    setTouched({
      thumbnail: false,
      galleryAddOrReplace: false,
      galleryRemove: false,
      galleryReorder: false,
      doctorsText: false,
      doctorsPhoto: false,
      doctorsReorder: false,
      doctorsDeleteOrAdd: false,
    });
  }, []);

  return { touched, mark, reset };
}

interface Step4ClinicImagesDoctorsInfoProps {
  id_uuid_hospital: string;
  id_admin: string;
  isEditMode?: boolean; // 편집 모드 여부
  onPrev: () => void;
  onNext: () => void;
}

const Step4ClinicImagesDoctorsInfo = ({
  id_uuid_hospital,
  id_admin,
  isEditMode = false,
  onPrev,
  onNext,
}: Step4ClinicImagesDoctorsInfoProps) => {
    log.info('qqqqqqqqq Step4ClinicImagesDoctorsInfo oooㄹㄹ id_uuid_hospital', id_uuid_hospital);

  // Dirty Flag 훅 사용
  const { touched, mark, reset } = useTouchedFlags();
  const { isReadMode } = useFormMode();
  const router = useRouter();
  const [clinicThumbnail, setClinicThumbnail] = useState<File | string | null>(null);
  const [clinicImages, setClinicImages] = useState<File[]>(
    [],
  );
  
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
  // 원본 썸네일 URL 보관 (삭제 비교용)
  const [originalThumbnailUrl, setOriginalThumbnailUrl] = useState<string | null>(null);
  // 삭제된 이미지 URL 추적
  const [deletedImageUrls, setDeletedImageUrls] = useState<string[]>([]);
  // 현재 표시되고 있는 이미지 URL들 추적
  const [currentDisplayedUrls, setCurrentDisplayedUrls] = useState<string[]>([]);

  const [previewValidationMessages, setPreviewValidationMessages] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);


  const { handleOpenModal, open } = useModal();

  useEffect(() => {
    if (formState?.message && showFinalResult) {
      handleOpenModal();
    }
  }, [formState, showFinalResult]);

  useEffect(() => {
    log.info(
      `isEditMode: ${isEditMode}, id_admin: ${id_admin}`,
    );
    if (isEditMode && id_admin && id_uuid_hospital) {
      log.info('Step4 편집 모드 - 기존 데이터 로드');
      loadExistingDataForEdit();
    }
  }, [isEditMode, id_admin, id_uuid_hospital]);

  useEffect(() => {
    log.info('Step4 - existingData 변경됨:', existingData);
    // ⚠️ existingData는 flat 구조이므로 직접 접근
    log.info('Step4 - imageurls:', (existingData as any)?.imageurls);
    log.info('Step4 - thumbnail_url:', (existingData as any)?.thumbnail_url);
    log.info('Step4 - doctors:', (existingData as any)?.doctors);
  }, [existingData]);

  useEffect(() => {
    log.info('Step4 - doctors 상태 변경됨:', doctors);
  }, [doctors]);

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
        log.info('Step4 - 로드된 데이터:', data);
        // ✅ data는 nested 구조 - hospital, hospitalDetail 등으로 구성됨
        log.info('Step4 - 병원 이름:', data.hospital?.name);
        log.info('Step4 - doctors 데이터:', data.doctors);
        log.info('Step4 - thumbnail_url:', data.hospital?.thumbnail_url);

        setExistingData(data);

        // 썸네일 이미지 상태 초기화
        // ✅ data는 nested 구조이므로 data.hospital.thumbnail_url 사용
        if (data.hospital?.thumbnail_url) {
          log.info('기존 썸네일 이미지 발견:', data.hospital.thumbnail_url);
          setClinicThumbnail(data.hospital.thumbnail_url);
          setOriginalThumbnailUrl(data.hospital.thumbnail_url);
        } else {
          log.info('썸네일 이미지가 없습니다');
          setClinicThumbnail(null);
          setOriginalThumbnailUrl(null);
        }

        // 의사 데이터 설정
        if (data.doctors && data.doctors.length > 0) {
          const existingDoctors = data.doctors.map((doctor: any) => ({
            id: doctor.id_uuid || uuidv4(),
            name: doctor.name,
            name_en: doctor.name_en,
            bio: doctor.bio || '',
            bio_en: doctor.bio_en || '',
            isChief: doctor.chief === 1,
            useDefaultImage: doctor.image_url?.includes('/default/') || false,
            defaultImageType: (doctor.image_url?.includes('woman') ? 'woman' : 'man') as 'man' | 'woman',
            imageFile: undefined,
            imagePreview: doctor.image_url,
            isExistingImage: true,
            originalImageUrl: doctor.image_url,
          }));
          
          setDoctors(existingDoctors);
          log.info('기존 의사 데이터 로드 완료:', existingDoctors);
        }
        
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
    log.info('폼에 기존 데이터 적용 시작');

    try {
      const formData = mapExistingDataToFormValues(existingData);
      log.info('변환된 폼 데이터:', formData);

      setDoctors(formData.doctors);
      log.info(
        '의사 정보 설정 완료:',
        formData.doctors.length,
        '명',
      );
    } catch (error) {
      console.error('기존 데이터 적용 중 오류:', error);
    }
  };

  const handleModal = () => {
    setShowFinalResult(false);
    handleOpenModal();
  };

  const validateFormDataAndUpdateUI = (returnMessage = false) => {
    const clinicNameInput = document.querySelector(
      'input[name="name"]',
    ) as HTMLInputElement;
    const clinicName = clinicNameInput?.value || '';

    return { isValid: true, messages: [] };
  };

  const [showConfirmModal, setShowConfirmModal] =
    useState(false);
  const [preparedFormData, setPreparedFormData] =
    useState<FormData | null>(null);
  

  if (isLoadingExistingData || isSubmitting) {
    return <LoadingSpinner backdrop />;
  }

  const handleNext = async () => {
    log.info('handleNext Step4');
    if (isReadMode) {
      onNext();
      return;
    }
    setIsSubmitting(true);
    // 임시로 그냥넘긴다
    //TODO: 나중에 별도로 이작업을 지시해야한다 docs/imageupload_migration/imageupload_dirty_flag.md
    // onNext();

    const result = await handleSave();
    log.info('handleNext Step4 handlSave after result', result);
    document.body.style.overflow = '';
    setIsSubmitting(false);
    if (result?.status === 'success') {
        log.info('handleNext Step4 handlSave success');
        
        onNext();
    } else {
        log.info('handleNext Step4 handlSave what? :', result);
    }
  };
 
  const generateFileName = (originalName: string, prefix: string = '') => {
    const timestamp = Date.now();
    const uuid = crypto.randomUUID().split('-')[0];
    const extension = originalName.split('.').pop() || 'jpg';
    const sanitizedName = originalName.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 20);
    
    return `${prefix}${sanitizedName}_${uuid}_${timestamp}.${extension}`;
  };

  const generateHospitalImageFileName = (originalName: string) => {
    return generateFileName(originalName, 'hospital_');
  };

  const generateDoctorImageFileName = (originalName: string, doctorName: string) => {
    const nameSlug = doctorName.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
    return generateFileName(originalName, `doctor_${nameSlug}_`);
  };

  // 이미지 업로드는 API 라우트에서 처리하므로 제거

  const handleSave = async () => {
    log.info('handleSave Step4 - Dirty Flags:', touched);

    // Dirty Flag 체크: 변경사항이 없으면 스킵
    const hasChanges = Object.values(touched).some(flag => flag);
    if (!hasChanges) {
      log.info('변경사항 없음 - 저장 스킵');
      toast.info('변경사항이 없습니다.');
      return { status: 'success' as const };
    }

    try {
      // 기존 병원 썸네일 이미지 (원본 데이터에서 가져옴)
      const existingClinicThumbnailUrl = originalThumbnailUrl;
      log.info('기존 병원 썸네일 이미지 (원본):', existingClinicThumbnailUrl);

      // 새로 업로드된 썸네일 이미지 URL
      let newThumbnailImageUrl: string | null = null;

      // 1. 썸네일 이미지 업로드 (touched.thumbnail이 true일 때만)
      if (touched.thumbnail && clinicThumbnail && clinicThumbnail instanceof File) {
        log.info('썸네일 이미지 업로드 시작:', clinicThumbnail.name);
        
        try {
          // 고유한 파일명 생성
          const timestamp = Date.now();
          const uuid = crypto.randomUUID().split('-')[0];
          const extension = clinicThumbnail.name.split('.').pop() || 'jpg';
          const fileName = `thumbnail_${id_uuid_hospital}_${uuid}_${timestamp}.${extension}`;
          
          const filePath = `images/hospitalimg/${id_uuid_hospital}/thumbnail/${fileName}`;
          
          // 이미지 업로드는 API 라우트에서 처리
          newThumbnailImageUrl = 'temp_url_' + fileName;
          log.info('썸네일 이미지 업로드 성공:', fileName);
          toast.success('image 현재 상태 업데이트 성공');
        } catch (error) {
          console.error('썸네일 이미지 업로드 실패:', error);
          throw error;
        }
      }

      // 2. 썸네일 이미지 상태 결정
      // exist: 로딩된 기존 이미지 (existingClinicThumbnailUrl)
      // cur: 현재 설정된 이미지 (finalThumbnailImageUrl)
      const existThumbnail = existingClinicThumbnailUrl;
      const curThumbnail = newThumbnailImageUrl || 
        (clinicThumbnail && typeof clinicThumbnail === 'string' ? clinicThumbnail : null);
      
      log.info('썸네일 이미지 상태 비교:');
      log.info('- exist (기존):', existThumbnail);
      log.info('- cur (현재):', curThumbnail);
      log.info('- 변경사항 있음:', existThumbnail !== curThumbnail);
      
      // 3. 변경사항이 있으면 기존 이미지 삭제 예약
      let shouldDeleteExistingThumbnail = false;
      if (existThumbnail && existThumbnail !== curThumbnail && !existThumbnail.includes('/default/')) {
        shouldDeleteExistingThumbnail = true;
        log.info('기존 썸네일 이미지 삭제 예약:', existThumbnail);
      }
      
      // 4. 최종 썸네일 URL 결정
      const finalThumbnailImageUrl = curThumbnail;

      // 갤러리 이미지 처리 (touched.galleryAddOrReplace, touched.galleryRemove, touched.galleryReorder가 true일 때만)
      let finalClinicImageUrls: string[] = [];
      const existingClinicUrls = existingData?.hospital?.imageurls || [];
      const newClinicImageUrls: string[] = [];

      if (touched.galleryAddOrReplace || touched.galleryRemove || touched.galleryReorder) {
        log.info('기존 이미지 URLs:', existingClinicUrls);

        // 새로 업로드할 이미지들 (File 객체만 필터링)
        const newClinicImages = clinicImages.filter(img => img instanceof File);
        log.info('새로 업로드할 이미지 개수:', newClinicImages.length);

        // 4. 새 이미지 업로드 (touched.galleryAddOrReplace가 true일 때만)
        if (touched.galleryAddOrReplace && newClinicImages.length > 0) {
        log.info('병원 이미지 업로드 시작:', newClinicImages.length, '개');
        // 병렬 업로드로 개선
        const uploadResults = await Promise.all(
          newClinicImages.map(async (file) => {
            // 고유한 파일명 생성 (타임스탬프 + UUID + 원본 확장자)
            const timestamp = Date.now();
            const uuid = crypto.randomUUID().split('-')[0];
            const extension = file.name.split('.').pop() || 'jpg';
            const sanitizedName = file.name.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 20);
            const fileName = `hospital_${sanitizedName}_${uuid}_${timestamp}.${extension}`;
            const filePath = `images/hospitalimg/${id_uuid_hospital}/hospitals/${fileName}`;
            // 이미지 업로드는 API 라우트에서 처리
            log.info('병원 이미지 업로드 예약:', fileName);
            return 'temp_url_' + fileName;
          })
        );
        newClinicImageUrls.push(...uploadResults);
        }

        // 5. 기존 이미지와 새 이미지 비교하여 삭제할 이미지 찾기
        // ClinicImageUploadSection에서 현재 표시되고 있는 이미지들의 URL을 가져와야 함
        // 최종 이미지 URL 배열 (기존 URL + 새로 업로드된 URL)
        finalClinicImageUrls = [...currentDisplayedUrls, ...newClinicImageUrls];

        log.info('현재 표시된 이미지 URLs:', currentDisplayedUrls);
        log.info('새로 업로드된 이미지 URLs:', newClinicImageUrls);
        log.info('최종 이미지 URLs:', finalClinicImageUrls);

        const toDelete = existingClinicUrls.filter((url: string) => !finalClinicImageUrls.includes(url));

        log.info('삭제할 이미지 URLs:', toDelete);

        // 6. 스토리지에서 삭제할 이미지들 제거 (touched.galleryRemove가 true일 때만)
        if (touched.galleryRemove && toDelete.length > 0) {
          log.info('스토리지에서 이미지 삭제 시작:', toDelete.length, '개');

          for (const url of toDelete) {
            try {
              // URL에서 파일 경로 추출
              const urlParts = url.split('/');
              const fileName = urlParts[urlParts.length - 1];
              const filePath = `images/hospitalimg/${id_uuid_hospital}/hospitals/${fileName}`;

              // 이미지 삭제는 API 라우트에서 처리
              log.info('스토리지 이미지 삭제 예약:', fileName);
            } catch (error) {
              console.error('스토리지 이미지 삭제 중 오류:', error);
            }
          }
        }
      } else {
        // 갤러리 변경사항 없음 - 기존 URL 유지
        finalClinicImageUrls = existingData?.hospital?.imageurls || [];
      }

      // 7. 의사 이미지 업로드 (touched.doctorsPhoto가 true일 때만)
      const doctorImageUrls: string[] = [];
      const doctorsWithImages = doctors.filter(doctor =>
        doctor.imageFile && doctor.imageFile instanceof File
      );

      if (touched.doctorsPhoto && doctorsWithImages.length > 0) {
        log.info('의사 이미지 업로드 시작:', doctorsWithImages.length, '개');
        // 병렬 업로드로 개선
        const doctorUploadResults = await Promise.all(
          doctorsWithImages.map(async (doctor) => {
            // 고유한 파일명 생성
            const timestamp = Date.now();
            const uuid = crypto.randomUUID().split('-')[0];
            const extension = doctor.imageFile!.name.split('.').pop() || 'jpg';
            const sanitizedDoctorName = doctor.name.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 20);
            const fileName = `doctor_${sanitizedDoctorName}_${uuid}_${timestamp}.${extension}`;
            // 의사 이미지 업로드는 API 라우트에서 처리
            log.info('의사 이미지 업로드 예약:', fileName);
            return 'temp_url_' + fileName;
          })
        );
        doctorImageUrls.push(...doctorUploadResults);
      }

      // 8. FormData 준비
      const formData = new FormData();
      formData.append('id_uuid_hospital', id_uuid_hospital);
      formData.append('current_user_uid', id_admin);
      formData.append('is_edit_mode', isEditMode ? 'true' : 'false');

      if (existingData) {
        formData.append('existing_data', JSON.stringify(existingData));
      }

      // 썸네일 이미지 관련 데이터
      formData.append('existing_thumbnail_url', existingClinicThumbnailUrl || '');
      formData.append('new_thumbnail_url', newThumbnailImageUrl || '');
      formData.append('final_thumbnail_url', finalThumbnailImageUrl || '');
      
      // 삭제된 썸네일 이미지 URL 전달
      // if (deletedImageUrlThumbnail) { // 이 부분은 사용하지 않음
      //   formData.append('deleted_thumbnail_url', deletedImageUrlThumbnail);
      //   log.info('삭제된 썸네일 이미지 URL 전달:', deletedImageUrlThumbnail);
      // }

      // ✅ 실제 썸네일 파일 추가
      if (touched.thumbnail && clinicThumbnail && clinicThumbnail instanceof File) {
        formData.append('thumbnail_file', clinicThumbnail);
        log.info('썸네일 파일 FormData에 추가:', clinicThumbnail.name);
      }

      // ✅ 실제 클리닉 이미지 파일들 추가
      const newClinicImages = clinicImages.filter(img => img instanceof File);
      if (touched.galleryAddOrReplace && newClinicImages.length > 0) {
        newClinicImages.forEach((file, index) => {
          formData.append('clinic_images', file);
          log.info(`클리닉 이미지 파일 ${index + 1} FormData에 추가:`, file.name);
        });
      }

      // ✅ 실제 의사 이미지 파일들 추가
      if (touched.doctorsPhoto && doctorsWithImages.length > 0) {
        doctorsWithImages.forEach((doctor, index) => {
          if (doctor.imageFile && doctor.imageFile instanceof File) {
            formData.append('doctor_images', doctor.imageFile);
            formData.append(`doctor_image_name_${index}`, doctor.name);
            log.info(`의사 이미지 파일 ${index + 1} FormData에 추가:`, doctor.imageFile.name);
          }
        });
      }

      // 기존 이미지 URL과 새 이미지 URL 모두 전달
      formData.append('existing_clinic_urls', JSON.stringify(existingClinicUrls));
      formData.append('new_clinic_image_urls', JSON.stringify(newClinicImageUrls));
      formData.append('final_clinic_image_urls', JSON.stringify(finalClinicImageUrls));

      // 삭제된 이미지 URL 전달
      if (deletedImageUrls.length > 0) {
        formData.append('deleted_clinic_urls', JSON.stringify(deletedImageUrls));
        log.info('삭제된 이미지 URLs 전달:', deletedImageUrls);
      }

      // 9. 의사 데이터 처리 (기존 로직 유지)
      if (doctors.length > 0) {
        log.info('=== 의사 데이터 준비 시작 ===');
        log.info('doctors 배열:', doctors);
        log.info('doctors 배열 길이:', doctors.length);
        
        const doctorsData = doctors.map((doctor, index) => {
          log.info(`의사 ${index + 1} 처리:`, doctor);
          
          let imageUrl = '';
          
          if (doctor.useDefaultImage) {
            imageUrl = doctor.defaultImageType === 'woman' 
              ? '/admin/default/doctor_default_woman.png'
              : '/admin/default/doctor_default_man.png';
          } else if (doctor.imageFile && doctor.imageFile instanceof File) {
            const uploadedIndex = doctorsWithImages.findIndex(d => d === doctor);
            imageUrl = uploadedIndex >= 0 ? doctorImageUrls[uploadedIndex] : '';
          } else if (doctor.originalImageUrl) {
            imageUrl = doctor.originalImageUrl;
          }

          const doctorData = {
            id_uuid: doctor.id || null,
            name: doctor.name,
            name_en: doctor.name_en,
            bio: doctor.bio || '',
            bio_en: doctor.bio_en || '',
            image_url: imageUrl,
            chief: doctor.isChief ? 1 : 0,
            useDefaultImage: doctor.useDefaultImage,
            defaultImageType: doctor.defaultImageType,
          };
          
          log.info(`의사 ${index + 1} 최종 데이터:`, doctorData);
          return doctorData;
        });

        log.info('=== 최종 의사 데이터 ===');
        log.info('doctorsData:', doctorsData);
        log.info('doctorsData JSON:', JSON.stringify(doctorsData));
        
        formData.append('doctors', JSON.stringify(doctorsData));
        log.info('FormData에 의사 데이터 추가 완료');
      } else {
        log.info('의사 데이터가 없습니다.');
      }

      log.info('Step4 uploadActionStep4 before formData:', formData);
      
      log.info('Step4 API 호출 시작');
      
      // 새로운 API Route 호출
      const result = await uploadAPI.step4(formData);
      log.info('Step4 API 응답:', result);
      
      if (!isApiSuccess(result)) {
        // 에러 발생 시 처리
        let errorMessage = formatApiError(result.error);
        // 504 에러 메시지 커스텀 (null/undefined, string, object 모두 대응)
        if (
          (result.error && typeof result.error === 'object' && 'status' in result.error && (result.error as any).status === 504)
          || (result.error && typeof result.error === 'object' && 'message' in result.error && typeof (result.error as any).message === 'string' && (result.error as any).message.includes('504'))
          || (typeof result.error === 'string' && result.error.includes('504'))
        ) {
          errorMessage = '서버가 응답하지 않거나 일시적인 장애가 발생했습니다. 다시 시도해주세요. 504';
        }
        setFormState({
          message: errorMessage,
          status: 'error',
          errorType: 'server',
        });
        setShowFinalResult(true);
        return { status: 'error' };
      }

      log.info('Step4 데이터 저장 성공');
      toast.success('image, 의사정보 모두 현재 상태 업데이트 성공');

      // Dirty Flags 초기화
      reset();
      log.info('Dirty Flags 초기화 완료');

      return { status: 'success' };
      
    } catch (error) {
      console.error('Step4 API 호출 에러:', error);
      let errorMessage = formatApiError(error);
      // 504 에러 메시지 커스텀
      if ((error as any)?.status === 504 || (error as any)?.message?.includes('504')) {
        errorMessage = '서버가 응답하지 않거나 일시적인 장애가 발생했습니다. 다시 시도해주세요. 504';
      }
      setFormState({
        message: errorMessage,
        status: 'error',
        errorType: 'server',
      });
      setShowFinalResult(true);
      return { status: 'error' };
    }
  };



  return (
    <main>
      <div
        className='my-8 mx-auto px-6'
        style={{ width: '100vw', maxWidth: '1024px' }}
      >
        
          <ClinicImageThumbnailUploadSection
            title='병원 썸네일 이미지'
            description={`-   병원들 리스트에서 다른 병원들과 함께 리스트로 나올 '썸네일' 이미지 입니다.
              검색화면, 지역별 병원 등 다양한 곳에서 다른병원들과 함께 나옵니다.
              1개만 등록해주세요.
              * 450 * 300 px  권장입니다.
             * 1.5:1 비율로 권장합니다. 비율이 다를 경우 중앙기준으로 알아서 외곽은 잘립니다.
              * File 한개 500KB 이하(권장)로 업로드 해주세요.  `}
            onFileChange={setClinicThumbnail}
            name='clinic_images'
            initialImage={clinicThumbnail && typeof clinicThumbnail === 'string' ? clinicThumbnail : null}
            onCurrentImageChange={(currentUrl) => {
              log.info('현재 썸네일 이미지:', currentUrl);
            }}
            onUserChanged={(kind) => {
              if (kind === 'thumbnail:replace' || kind === 'thumbnail:delete') {
                mark('thumbnail');
              }
            }}
          />
        
        <Divider />
        <ClinicImageUploadSection
          maxImages={clinicImageUploadLength}
          title='병원 상세페이지 슬라이드형 소개 이미지'
          description={`- 병원 메인 이미지는 가로로 긴 직사각형(권장 비율: 16:9 또는 3:1)으로 업로드해 주세요.
   · 예시: 권장: 해상도 640 x 240 px 이상 (8:3) 2MB이하 권장
  · 알림: 주어진 사진을 중앙을 기준으로 8:3  비율로 넘치는 부분이 자동으로 잘라집니다.
      사진이 비율보다 작으면 가로기준으로 비율을 맞춰서 자동으로 확대해서 화면에 맞춰줍니다.
      * File 한개당 2MB 이하(권장)로 업로드 해주세요.
      * 최소(3개이상) - 최대(권장) 7개까지 업로드 가능합니다. 추가 업로드 원하시면 문의 부탁드립니다.
      * (대표이미지) 추가 된 순서대로 보여지며 첫번째 이미지가 대표 이미지가 됩니다.`}
          onFilesChange={setClinicImages}
          name='clinic_images'
          type='Banner'
          initialImages={existingData?.hospital?.imageurls || []}
          onExistingDataChange={setExistingData}
          onDeletedImagesChange={setDeletedImageUrls}
          onCurrentImagesChange={setCurrentDisplayedUrls}
          onUserChanged={(kind) => {
            if (kind === 'gallery:add' || kind === 'gallery:replace') mark('galleryAddOrReplace');
            if (kind === 'gallery:remove') mark('galleryRemove');
            if (kind === 'gallery:reorder') mark('galleryReorder');
          }}
        />
        <Divider />
        
        <h1 className='text-red-500'>만에 하나 발생할 네트워크 오류를 대비해 하단의 임시저장을 누른후 의사정보 등록을 진행하세요.
          입력하실 의사선생님이 많을 경우 자주 임시저장을 해주세요.
        </h1>
        <DoctorInfoSection
          title='의사 정보 등록'
          description={`- 의사 프로필 정보를 입력하고 이미지를 등록하세요.
- 이미지는 정사각형(1:1) 비율로 자동 조정됩니다.
- 기본 이미지를 사용하거나 직접 업로드할 수 있습니다.`}
          onDoctorsChange={setDoctors}
          initialDoctors={doctors}
          id_uuid_hospital={id_uuid_hospital}
          onUserChanged={(kind) => {
            if (kind === 'doctors:addOrDelete') mark('doctorsDeleteOrAdd');
            if (kind === 'doctors:reorder') mark('doctorsReorder');
            if (kind === 'doctors:text') mark('doctorsText');
            if (kind === 'doctors:photo') mark('doctorsPhoto');
          }}
        />
        <Divider />
       </div>

      <PageBottom step={4} isSubmitting={isSubmitting} onNext={handleNext} onDraftSave={handleSave} onPrev={onPrev} />
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
}

export default Step4ClinicImagesDoctorsInfo;
