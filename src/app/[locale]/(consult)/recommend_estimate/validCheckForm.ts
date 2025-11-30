import { 
  USER_INFO,
  BUDGET,
  HEALTH_CONDITIONS,
  PREFERENCES,
  PRIORITYFACTORS,
  SKIN_CONCERNS,
  SKIN_TYPE,
  TREATMENT_EXPERIENCE_BEFORE,
  TREATMENT_GOALS,
  UPLOAD_PHOTO,
  VISIT_PATHS,
  AGE_RANGE,
  DEMOGRAPHICS_BASIC
} from '@/constants/estimate_steps';
import { log } from '@/utils/logger';
import { StepData } from '../models/recommend_estimate.dto';

// 각 스텝별 필수 선택 항목 검증 함수
export const validateStepData = (stepId: string, data: StepData): boolean => {
  log.debug('validateStepData validateStepData stepId:', stepId);
  switch (stepId) {
    case AGE_RANGE:
      return !!(
        data.ageRange
      );
    case SKIN_TYPE:
      return !!(
        data.skinType
      );
    case SKIN_CONCERNS:
      // 피부 타입과 피부 고민 모두 필수 선택
      const skinConcerns = data.skinConcerns;
      return !!(
        // data.skinType && // 피부 타입 선택 필수
        skinConcerns?.concerns && 
        skinConcerns.concerns.length > 0 // 피부 고민 1개 이상 선택 필수
      );
    
    case BUDGET:
      return !!(
        data.budget  // 예산 범위 선택 필수
      );
    case PREFERENCES:
      const treatmentAreas = data.treatmentAreas;
      return !!(
        treatmentAreas?.treatmentAreas && 
        treatmentAreas.treatmentAreas.length > 0  // 관리 부위 1개 이상 선택 필수
      );
    
      case PRIORITYFACTORS:
      
      const priorityOrder = data.priorityOrder;
      return !!(
        priorityOrder?.priorityOrder &&
        priorityOrder.priorityOrder.length > 0 && // 우선순위 확정 필수
        priorityOrder?.isPriorityConfirmed // 우선순위 확정 필수
      );
    

    case TREATMENT_GOALS:
      
      // log.debug(`treatment-goals  data.goals:${data.goals}  data.goals.length:${data.goals?.length} data.timeframe:${data.timeframe} pastTreatments:${pastTreatments?.pastTreatments}`);
      return !!(
        data.goals && 
        data.goals.length > 0
      );
    case TREATMENT_EXPERIENCE_BEFORE:
      const pastTreatments = data.pastTreatments;
      // log.debug(`treatment-goals  data.goals:${data.goals}  data.goals.length:${data.goals?.length} data.timeframe:${data.timeframe} pastTreatments:${pastTreatments?.pastTreatments}`);
      return !!(
        pastTreatments?.pastTreatments // 이전 치료 경험 선택 필수 (없는 경우도 빈 배열로 저장)
      );
    
    case HEALTH_CONDITIONS:
      return !!(data.healthConditions?.healthConditions && data.healthConditions.healthConditions.length > 0); // 건강 상태 선택 필수
    
    case VISIT_PATHS:
      return !!data.visitPath?.visitPath; // 방문 경로 선택 필수
    
    case USER_INFO:
      
      const userInfo = data.userInfo;
      if (!userInfo) return false;
      
      // Check if there's at least one messenger with a non-empty value
      return !!(userInfo.ageRange &&
      userInfo.gender &&
      userInfo.email);


      // const hasValidMessenger = userInfo.messengers && 
      //   userInfo.messengers.length > 0 && 
      //   userInfo.messengers.some((messenger: any) => messenger && messenger.value && messenger.value.trim() !== '');
      
      // return !!(
      //   userInfo.firstName && 
      //   userInfo.lastName &&
      //   userInfo.ageRange &&
      //   userInfo.gender &&
      //   userInfo.email &&
      //   isValidEmail(userInfo.email) && 
      //   hasValidMessenger
      // );
    case UPLOAD_PHOTO:
      // 파일이 업로드되었는지 확인
      return !!(
        data.uploadImage?.uploadedImage || data.uploadImage?.imageFile
      );
    case DEMOGRAPHICS_BASIC:
      const demographicsBasic = data.demographicsBasic;
      if (!demographicsBasic) return false;
      // 모든 필드가 필수: age_group, gender, ethnic_background, country_of_residence
      return !!(
        demographicsBasic.age_group &&
        demographicsBasic.gender &&
        demographicsBasic.ethnic_background &&
        demographicsBasic.country_of_residence
      );
    default:
      return true;
  }
};

// 각 스텝별 필수 선택 항목 메시지
export const getValidationMessage = (stepId: string): string => {
  switch (stepId) {
    case AGE_RANGE:
      return 'Please select your age range.';
    case SKIN_TYPE:
      return 'Please select your skin type.';
    case SKIN_CONCERNS:
      return 'Please select concerns.';
    case BUDGET:
      return 'Please choose your budget range.';
    case PREFERENCES:
      return 'Please choose your treatment areas.';
    case PRIORITYFACTORS:
      return 'Please set your priorities.';
    case TREATMENT_GOALS:
      return 'Please select your treatment goals.';
    case TREATMENT_EXPERIENCE_BEFORE:
      return 'Please indicate any previous treatment history.';
    case HEALTH_CONDITIONS:
      return 'Please select your current health conditions.';
    case VISIT_PATHS:
      return 'Please select how you found us.';
    case USER_INFO:
      // return 'Please fill in your name, age, gender, email address, and at least one messenger contact.';
      return 'Please fill in your age, gender, nationality.';
    case UPLOAD_PHOTO:
      return 'Please post a picture to diagnose your skin.';
    case DEMOGRAPHICS_BASIC:
      return 'Please complete the basic information.';
    default:
      return 'Please complete all required fields.';
  }
};

