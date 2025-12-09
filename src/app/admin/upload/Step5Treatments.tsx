'use client';

import { useEffect, useState } from 'react';
import Button from '@/components/admin/Button';
import LoadingSpinner from '@/components/admin/LoadingSpinner';
import useModal from '@/hooks/useModal';

import { TreatmentSelectBox } from '@/components/admin/TreatmentSelectBox';
import { useTreatmentCategories } from '@/hooks/useTreatmentCategories';
import { ExistingHospitalData } from '@/models/admin/hospital';
import { mapExistingDataToFormValues } from '@/lib/admin/hospitalDataMapper';

import { uploadAPI, formatApiError, isApiSuccess, api } from '@/lib/admin/api-client';


import { TreatmentSelectedOptionInfo } from '@/components/admin/TreatmentSelectedOptionInfo';
import PageBottom from '@/components/admin/PageBottom';
import { toast } from "sonner";
import FileUploadSection from '@/components/admin/FileUploadSection';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { STORAGE_IMAGES } from '@/constants/tables';
import { Divide } from 'lucide-react';
import Divider from '@/components/admin/Divider';
import { getTreatmentsFilePath } from '@/constants/paths';
import { useFormMode } from '@/contexts/admin/FormModeContext';
import { log } from "@/utils/logger";

// import { Label } from '@radix-ui/react-dropdown-menu';
const EXCEL_MAX_FILES = 1;

interface Step5TreatmentsProps {
  id_uuid_hospital: string;
  id_admin: string;
  isEditMode?: boolean; // 편집 모드 여부
  onPrev: () => void;
  onNext: () => void;
}

const Step5Treatments = ({
  id_uuid_hospital,
  id_admin,
  isEditMode = false,
  onPrev,
  onNext,
}: Step5TreatmentsProps) => {
    // log.info('Step5Treatments id_uuid_hospital', id_uuid_hospital);
    const { isReadMode } = useFormMode();
  const {
    data: categories,
    isLoading: categoriesLoading,
    error: categoriesError,
  } = useTreatmentCategories();


  // 1. 상태 선언부
  const [selectedTreatments, setSelectedTreatments] = useState<string[]>([]);
  const [treatmentOptions, setTreatmentOptions] = useState<
    any[]
  >([]);
  const [priceExpose, setPriceExpose] =
    useState<boolean>(true);
  const [treatmentEtc, setTreatmentEtc] =
    useState<string>('');
  // 2. initialTreatmentData 등도 string[]으로 맞추기
  const [initialTreatmentData, setInitialTreatmentData] =
    useState<{
      selectedKeys: string[];
      productOptions: any[];
      priceExpose: boolean;
      etc: string;
    } | null>(null);

      const [uploadMethod, setUploadMethod] = useState('excel');
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [existingFileNames, setExistingFileNames] = useState<string[]>([]);
  const [existingFileKeys, setExistingFileKeys] = useState<string[]>([]); // S3 파일 키 저장

  const [formState, setFormState] = useState<{
    message?: string;
    status?: string;
    errorType?: 'validation' | 'server' | 'success';
  } | null>(null);
  const [showFinalResult, setShowFinalResult] =
    useState(false);
//   const [doctors, setDoctors] = useState<DoctorInfo[]>([]);
  const [isLoadingExistingData, setIsLoadingExistingData] =
    useState(false);
  const [existingData, setExistingData] =
    useState<ExistingHospitalData | null>(null);


  const [isSubmitting, setIsSubmitting] = useState(false);

  const { handleOpenModal, open } = useModal();

  useEffect(() => {
    if (formState?.message && showFinalResult) {
      handleOpenModal();
    }
  }, [formState, showFinalResult]);

  // 기존 엑셀 파일 확인 (AWS S3 Lightsail)
  const checkExistingExcelFiles = async () => {
    try {
      const filePath = getTreatmentsFilePath(id_uuid_hospital);
      log.info('기존 엑셀 파일 확인 시작:', filePath);

      const response = await fetch('/api/admin/storage/list', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prefix: filePath }),
      });

      if (!response.ok) {
        console.error('기존 파일 확인 실패:', response.statusText);
        setUploadMethod('manual');
        setExistingFileNames([]);
        return;
      }

      const result = await response.json();

      if (result.success && result.files && result.files.length > 0) {
        log.info('기존 엑셀 파일 발견:', result.files.length, '개');
        setUploadMethod('excel');
        setExistingFileNames(result.files.map((item: any) => item.name));
        setExistingFileKeys(result.files.map((item: any) => item.key)); // S3 키 저장
      } else {
        log.info('기존 엑셀 파일 없음');
        setUploadMethod('manual');
        setExistingFileNames([]);
        setExistingFileKeys([]);
      }
    } catch (error) {
      console.error('기존 파일 확인 중 오류:', error);
      setUploadMethod('manual');
      setExistingFileNames([]);
      setExistingFileKeys([]);
    }
  };

  // 컴포넌트 마운트 시 기존 파일 확인
  useEffect(() => {
    checkExistingExcelFiles();
  }, [id_uuid_hospital]);

  // 편집 모드일 때 기존 데이터 로딩
  useEffect(() => {
    log.info(
      `isEditMode: ${isEditMode}, id_admin: ${id_admin}`,
    );
    if (isEditMode && id_admin && id_uuid_hospital) {
      loadExistingDataForEdit();
    }
  }, [isEditMode, id_admin, id_uuid_hospital]);

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
    log.info('폼에 기존 데이터 적용 시작');

    try {
      // 1. 데이터를 폼 형식으로 변환
      const formData = mapExistingDataToFormValues(existingData);
      log.info('변환된 폼 데이터:', formData);

      // 6. 시술 정보 설정
      log.info('시술 정보 설정 시작');
      log.info(
        '변환된 시술 데이터:',
        formData.treatments,
      );
      setInitialTreatmentData(formData.treatments);
      log.info(
        'initialTreatmentData 상태 업데이트 완료',
      );

      log.info('기존 데이터 적용 완료!');
      log.info('적용된 데이터:', {
        // 병원명: formData.hospital.name,
        // 의사수: formData.doctors.length,
        // 영업시간: Object.keys(formData.businessHours)
        //   .length,
        시술정보: Object.keys(formData.treatments).length,
      });
    } catch (error) {
      console.error('기존 데이터 적용 중 오류:', error);
    }
  };

  const handleModal = () => {
    setShowFinalResult(false); // 결과 모달을 닫을 때 showFinalResult 초기화
    document.body.style.overflow = '';
    handleOpenModal();
  };



  // 3. handleTreatmentSelectionChange 등에서 string[]로만 처리
  const handleTreatmentSelectionChange = (data: {
    selectedKeys: string[];
    productOptions: any[];
    priceExpose: boolean;
    etc: string;
    selectedDepartment?: 'skin' | 'surgery';
  }) => {
    log.info('Step5Treatments - 시술 데이터 업데이트:', {
      selectedKeys: data.selectedKeys,
      productOptions: data.productOptions,
      priceExpose: data.priceExpose,
      etc: data.etc,
      selectedDepartment: data.selectedDepartment
    });
    
    setSelectedTreatments(data.selectedKeys);
    setTreatmentOptions(data.productOptions);
    setPriceExpose(data.priceExpose);
    setTreatmentEtc(data.etc);

    log.info('Step5Treatments - 상태 업데이트 완료:', {
      selectedTreatments: data.selectedKeys,
      treatmentOptions: data.productOptions,
      priceExpose: data.priceExpose,
      treatmentEtc: data.etc,
    });
  };

  if (
    // isPending ||
    categoriesLoading ||
    isLoadingExistingData
  )
    return <LoadingSpinner backdrop />;

    const handleFileChange = (files: File[]) => {
      log.info('handleFileChange', files);
      setUploadedFiles(files);
  }

  // 기존 파일 전체 삭제 (AWS S3 Lightsail)
  const handleClearAllFiles = async () => {
    try {
      const filePath = getTreatmentsFilePath(id_uuid_hospital);
      log.info('기존 파일 전체 삭제 시작:', filePath);

      // 파일 목록 조회
      const listResponse = await fetch('/api/admin/storage/list', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prefix: filePath }),
      });

      if (!listResponse.ok) {
        console.error('기존 파일 목록 조회 실패:', listResponse.statusText);
        throw new Error('파일 목록 조회 실패');
      }

      const listResult = await listResponse.json();

      if (listResult.success && listResult.files && listResult.files.length > 0) {
        const filesToDelete = listResult.files.map((item: any) => item.key);

        log.info('삭제할 파일들:', filesToDelete);

        // 파일들 삭제
        const deleteResponse = await fetch('/api/admin/storage/delete', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ keys: filesToDelete }),
        });

        if (!deleteResponse.ok) {
          console.error('파일 삭제 실패:', deleteResponse.statusText);
          throw new Error('파일 삭제 실패');
        }

        const deleteResult = await deleteResponse.json();

        if (deleteResult.success) {
          log.info('기존 파일 전체 삭제 완료:', listResult.files.length, '개');
          setExistingFileNames([]);
          setUploadMethod('manual');
          toast.success('기존 파일이 모두 삭제되었습니다.');
        } else {
          throw new Error(deleteResult.error || '파일 삭제 실패');
        }
      } else {
        log.info('삭제할 파일이 없습니다.');
        toast.info('삭제할 파일이 없습니다.');
      }
    } catch (error) {
      console.error('전체 파일 삭제 중 오류:', error);
      toast.error('파일 삭제 중 오류가 발생했습니다.');
      throw error;
    }
  };

  const handleNext = async () => {
    log.info('handleNext');
    if (isReadMode) {
      onNext();
      return;
    }
    setIsSubmitting(true);
    const result = await handleSave();
    setIsSubmitting(false);
    document.body.style.overflow = '';
    if (result?.status === 'success') {
        log.info('handleNext Step4 handlSave success');
        onNext();
    } else {
        log.info('handleNext Step4 handlSave what? :', result);
    }
  };

 
  const handleSave = async () => {
    log.info('Step5 handleSave 시작');
    
    try {
      // FormData 구성
      const formData = new FormData();
      formData.append('is_edit_mode', isEditMode ? 'true' : 'false');
      formData.append('current_user_uid', id_admin);
      formData.append('id_uuid_hospital', id_uuid_hospital);
      
      // uploadMethod에 따른 처리
      if (uploadMethod === 'excel') {
        // 엑셀 파일 업로드 처리
        // if (uploadedFiles.length === 0 && existingFileNames.length === 0) {
        //   setFormState({
        //     message: '엑셀 파일을 업로드해주세요.',
        //     status: 'error',
        //     errorType: 'validation',
        //   });
        //   setShowFinalResult(true);
        //   document.body.style.overflow = '';
        //   return {
        //     status: 'error',
        //     message: '엑셀 파일을 업로드해주세요.'
        //   };
        // }

        log.info('엑셀 파일 업로드 시작:', uploadedFiles.length, '개');
        
        // 엑셀 파일들을 Supabase Storage에 업로드
        const uploadedFileUrls: string[] = [];
        
        for (const file of uploadedFiles) {
          try {
            // 고유한 파일명 생성 (원본네이밍 + timestamp + 확장자)
            const timestamp = Date.now();
            // const originalName = file.name.replace(/\.[^/.]+$/, ''); // 확장자 제거
            //  확장자 제거 + 공백 제거
            const originalName = file.name
            .replace(/\.[^/.]+$/, '')    // 확장자 제거
            .replace(/\s+/g, '');        // 공백 제거

            const extension = file.name.split('.').pop() || 'xlsx';
            const fileName = `${originalName}_${timestamp}.${extension}`;
            
            const containsKorean = /[ㄱ-ㅎㅏ-ㅣ가-힣]/.test(file.name);
            const containsSpace = /\s/.test(file.name);
            
            if (containsKorean || containsSpace) {
              setFormState({
                message: '파일명에 한글 혹은 공백이 포함된것으로 확인됩니다. 한글 혹은 공백을 모두 제거하고 올려주세요.',
                status: 'error',
                errorType: 'validation',
              });
              setShowFinalResult(true);
              document.body.style.overflow = '';
              return {
                status: 'error',
                message: '파일명에 한글 혹은 공백이 있으면 모두 제거하고 올려주세요.'
              };
            }
            // AWS S3 Lightsail 업로드
            const filePath = getTreatmentsFilePath(id_uuid_hospital, fileName);

            const uploadFormData = new FormData();
            uploadFormData.append('file', file);
            uploadFormData.append('key', filePath);
            uploadFormData.append('contentType', file.type);

            const uploadResponse = await fetch('/api/admin/storage/upload', {
              method: 'POST',
              body: uploadFormData,
            });

            if (!uploadResponse.ok) {
              throw new Error('파일 업로드 실패');
            }

            const uploadResult = await uploadResponse.json();

            if (uploadResult.success) {
              uploadedFileUrls.push(uploadResult.url);
              log.info('엑셀 파일 업로드 성공:', fileName, uploadResult.url);
            } else {
              throw new Error(uploadResult.error || '파일 업로드 실패');
            }
          } catch (error) {
            console.error('엑셀 파일 업로드 실패:', error);
            throw error;
          }
        }

        // 업로드된 파일 URL들을 FormData에 추가
        formData.append('excel_file_urls', JSON.stringify(uploadedFileUrls));
        formData.append('upload_method', 'excel');
        
        // 직접 입력 데이터는 빈 값으로 설정
        formData.append('treatment_options', JSON.stringify([]));
        formData.append('price_expose', 'true');
        formData.append('etc', '');
        formData.append('selected_treatments', '');
        
      } else {
        // 직접 입력 처리
        formData.append('upload_method', 'manual');
        formData.append('excel_file_urls', JSON.stringify([]));
        
        // 치료 옵션과 가격 정보
        formData.append('treatment_options', JSON.stringify(treatmentOptions));
        formData.append('price_expose', priceExpose.toString());
        formData.append('etc', treatmentEtc);
        
        // 선택된 치료 항목들
        formData.append('selected_treatments', selectedTreatments.join(','));
      }

      let apiPass = false;
      if (uploadMethod === 'excel') {
        if (uploadedFiles.length === 0 && existingFileNames.length === 0) {
          apiPass = true;
        }
      } else {
        if (treatmentOptions.length === 0) {
          apiPass = true;
        }
      }

      // 아무것도 입력되지 않았으면 API 호출 없이 성공 처리
      if (apiPass) {
        log.info('Step5 - 입력 데이터 없음, API 호출 스킵하고 다음 단계로 진행');
        return {
          status: 'success',
          message: '다음 단계로 진행합니다.'
        };
      }

      log.info('Step5 API 호출 시작');
      
      // 새로운 API Route 호출
      const result = await uploadAPI.step5(formData);
      log.info('Step5 API 응답:', result);

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
        log.info('Step5 데이터 저장 성공');
        setFormState({
          message: result.message || '성공적으로 저장되었습니다.',
          status: 'success',
          errorType: undefined,
        });
        toast.success(result.message);
        return {
          status: 'success',
          message: result.message
        };
      }
      
    } catch (error) {
      console.error('Step5 API 호출 에러:', error);

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
  const notionUrl = "https://www.notion.so/Treatments-update-guide-line-2495ffceb78c80158a4dd66aba457812";

  return (
    <main className="min-h-screen flex flex-col">
      {/* 컨텐츠 영역 */}
      <div className="flex-1 my-8 mx-auto px-6 pb-24" 
      style={{ width: '100vw', maxWidth: '1024px' }}>
        <div className='w-full'>
          <div className='flex flex-col gap-4'>
            <h1>시술 업데이트 방법 선택하기</h1>
            
            <RadioGroup value={uploadMethod} onValueChange={setUploadMethod}>
              <div className="flex items-center gap-3">
                <RadioGroupItem value="excel" id="excel" />
                <Label htmlFor="excel">엑셀파일업로드</Label>
              </div>
              <div className="flex items-center gap-3">
                <RadioGroupItem value="manual" id="manual" />
                <Label htmlFor="manual">직접입력하기</Label>
              </div>
            </RadioGroup>
            </div>
            <Divider />
            <div style={{ display: uploadMethod === 'excel' ? 'block' : 'none' }}>

              <div className='flex items-center justify-between mb-2'>
                <h2 className='font-semibold text-lg'>시술 정보 엑셀파일</h2>
                <button
                  type="button"
                  onClick={() => window.open(notionUrl, "_blank")}
                  data-allow-interact
                  className="text-sm px-3 py-1 rounded border border-blue-500 text-blue-600 hover:bg-blue-50"
                >
                  엑셀 작성 가이드보기
                </button>
              </div>
              <FileUploadSection
                  onFileChange={handleFileChange}
                  name="treatment_file"
                  title=""
                  description={`시술 정보를 엑셀파일로 로드합니다. (가능 확장자 : .xlsx, .xls, .csv)\n 파일명에 한글 혹은 공백이 있으면 모두 제거하고 올려주세요.`}
                  fileType="excel"
                  maxFiles={EXCEL_MAX_FILES}
                  existingFileNames={existingFileNames}
                  existingFileKeys={existingFileKeys}
                  onClearAllFiles={handleClearAllFiles}
              />
            </div>
        </div>
        {uploadMethod === 'manual' && (
          <>
            <div className='w-full py-6'>
              
              {/* 가능시술 선택하기  선택 모달 */}
              {categories && (
                <TreatmentSelectBox
                  onSelectionChange={
                    handleTreatmentSelectionChange
                  }
                  initialSelectedKeys={
                    initialTreatmentData?.selectedKeys ||
                    selectedTreatments
                  }
                  initialProductOptions={
                    initialTreatmentData?.productOptions ||
                    treatmentOptions
                  }
                  initialPriceExpose={
                    initialTreatmentData?.priceExpose ??
                    priceExpose
                  }
                  initialEtc={
                    initialTreatmentData?.etc || treatmentEtc
                  }
                  categories={categories}
                />
              )}
            </div>

            {/* 선택된 시술 정보 표시 */}
            <TreatmentSelectedOptionInfo
              selectedKeys={selectedTreatments}
              productOptions={treatmentOptions}
              etc={treatmentEtc}
              categories={categories || []}
              showTitle={false}
              className="mt-4"
            />
          </>
        )}
        

      <PageBottom 
        step={5} 
        isSubmitting={isSubmitting} 
        isDraftSaveDisabled={uploadMethod === 'excel'}
        onNext={handleNext} 
        onPrev={onPrev} 
        onDraftSave={handleSave}
      >
        <div className="text-xs text-gray-500 whitespace-pre-line">
          <p>
            <span className="text-red-500 font-semibold">
              *주의* 특히 직접 시술 입력시 저장 버튼을 눌러야만 정보가 데이터베이스에 저장되는데 더욱 유념해주시기 바랍니다..
            </span>
            {'\n'}
            나중에 다시 수정하더라도 꼭 저장 버튼을 눌러주세요.
            {'\n'}
            <span className="text-red-500 font-semibold">
              저장버튼을 누르지 않고 새로고침하거나 뒤로가거나 창을 나가면 입력/편집한 정보가 소실됩니다.
            </span>
          </p>
        </div>
      </PageBottom>
      </div>

      {/* 기본 모달 */}
      {formState?.message && showFinalResult && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50" data-enforcer-skip>
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
            <h3 className="text-lg font-semibold mb-2">{formState.status === 'success' ? '성공' : '오류'}</h3>
            <p className="text-sm text-gray-800 mb-4 whitespace-pre-line">{formState.message}</p>
            <div className="flex justify-end gap-2">
              <Button onClick={handleModal}>확인</Button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default Step5Treatments;
