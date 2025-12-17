
interface SkinConcerns {
  concerns: string[];
  moreConcerns?: string;
}

interface TreatmentAreas {
  treatmentAreas: string[];
  otherAreas?: string;
}

interface PriorityOrder {
  priorityOrder: string[];
  isPriorityConfirmed?: boolean;
}

interface PastTreatments {
  pastTreatments: string[];
  sideEffects?: string;
  additionalNotes?: string;
}

interface VisitPath {
  visitPath: string;
  otherPath?: string;
}

interface UploadImage {
  uploadedImage?: string;
  imageFile?: File;
  imageFileName?: string;
}

interface HealthConditions {
  healthConditions: string[];
  otherConditions?: string;
}

interface UserInfo {
  firstName: string;
  lastName: string;
  ageRange: string;
  gender: string;
  email: string;
  phoneNumber: string | null;
  country: string;
  messengers: any[];
}

interface DemographicsBasic {
  age_group?: string;
  gender?: string;
  ethnic_background?: string;
  country_of_residence?: string;
}

interface VideoConsultTimeSlot {
  rank: number;
  date: string;
  startTime: string;
  endTime: string;
}

export interface StepData {
  ageRange?: string;
  skinType?: string;
  skinConcerns?: SkinConcerns;
  userInfo?: UserInfo;

  treatmentAreas?: TreatmentAreas;
  priorityOrder?: PriorityOrder;
  pastTreatments?: PastTreatments;
  budget?: string;
  goals?: string[];

  visitPath?: VisitPath;
  uploadImage?: UploadImage;
  healthConditions?: HealthConditions;
  demographicsBasic?: DemographicsBasic;
  videoConsultSlots?: VideoConsultTimeSlot[];
  videoConsultTimezone?: string;

  timeframe?: string;
}