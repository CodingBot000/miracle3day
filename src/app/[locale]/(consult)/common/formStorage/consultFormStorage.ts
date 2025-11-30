/**
 * Consultation Form Storage
 *
 * localStorage를 사용하여 설문 폼 데이터를 저장/복원하는 유틸리티
 * preConsult와 recommend_estimate 모두에서 사용 가능
 */

// 폼 타입 정의
export type ConsultFormType = 'preConsult' | 'recommendEstimate';

// localStorage 키
const STORAGE_KEYS: Record<ConsultFormType, string> = {
  preConsult: 'beauty_preConsult_formData',
  recommendEstimate: 'beauty_recommendEstimate_formData',
};

// 저장하지 않을 필드들 (사진 업로드 관련)
const EXCLUDED_FIELDS = ['uploadImage', 'uploadedImage', 'imageFile', 'imageFileName'];

/**
 * 특정 필드를 제외한 데이터 필터링
 */
const filterExcludedFields = (data: Record<string, any>): Record<string, any> => {
  const filtered: Record<string, any> = {};

  for (const [stepId, stepData] of Object.entries(data)) {
    if (typeof stepData === 'object' && stepData !== null) {
      const filteredStepData: Record<string, any> = {};

      for (const [key, value] of Object.entries(stepData)) {
        if (!EXCLUDED_FIELDS.includes(key)) {
          filteredStepData[key] = value;
        }
      }

      // 빈 객체가 아닌 경우에만 저장
      if (Object.keys(filteredStepData).length > 0) {
        filtered[stepId] = filteredStepData;
      }
    } else {
      filtered[stepId] = stepData;
    }
  }

  return filtered;
};

/**
 * 폼 데이터를 localStorage에 저장
 */
export const saveFormData = (
  formType: ConsultFormType,
  data: Record<string, any>
): void => {
  if (typeof window === 'undefined') return;

  try {
    const filteredData = filterExcludedFields(data);
    const storageKey = STORAGE_KEYS[formType];

    localStorage.setItem(storageKey, JSON.stringify({
      data: filteredData,
      savedAt: new Date().toISOString(),
    }));
  } catch (error) {
    console.error(`Failed to save ${formType} form data:`, error);
  }
};

/**
 * localStorage에서 폼 데이터 불러오기
 */
export const loadFormData = (
  formType: ConsultFormType
): Record<string, any> | null => {
  if (typeof window === 'undefined') return null;

  try {
    const storageKey = STORAGE_KEYS[formType];
    const stored = localStorage.getItem(storageKey);

    if (!stored) return null;

    const parsed = JSON.parse(stored);
    return parsed.data || null;
  } catch (error) {
    console.error(`Failed to load ${formType} form data:`, error);
    return null;
  }
};

/**
 * localStorage에서 폼 데이터 삭제
 */
export const clearFormData = (formType: ConsultFormType): void => {
  if (typeof window === 'undefined') return;

  try {
    const storageKey = STORAGE_KEYS[formType];
    localStorage.removeItem(storageKey);
  } catch (error) {
    console.error(`Failed to clear ${formType} form data:`, error);
  }
};

/**
 * 저장된 폼 데이터가 있는지 확인
 */
export const hasStoredFormData = (formType: ConsultFormType): boolean => {
  if (typeof window === 'undefined') return false;

  try {
    const storageKey = STORAGE_KEYS[formType];
    return localStorage.getItem(storageKey) !== null;
  } catch {
    return false;
  }
};

/**
 * 저장된 데이터의 타임스탬프 조회
 */
export const getFormDataTimestamp = (formType: ConsultFormType): Date | null => {
  if (typeof window === 'undefined') return null;

  try {
    const storageKey = STORAGE_KEYS[formType];
    const stored = localStorage.getItem(storageKey);

    if (!stored) return null;

    const parsed = JSON.parse(stored);
    return parsed.savedAt ? new Date(parsed.savedAt) : null;
  } catch {
    return null;
  }
};
