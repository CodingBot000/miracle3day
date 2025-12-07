import { v4 as uuidv4 } from 'uuid';

// 파일명을 안전하게 변환하는 함수
export const sanitizeFileName = (originalName: string, uuid: string): string => {
  // 확장자 추출
  const lastDotIndex = originalName.lastIndexOf('.');
  const extension = lastDotIndex !== -1 ? originalName.substring(lastDotIndex) : '';
  const nameWithoutExt = lastDotIndex !== -1 ? originalName.substring(0, lastDotIndex) : originalName;

  // 파일명에서 한글, 공백, 특수문자 제거/치환
  const sanitizedName = nameWithoutExt
    .replace(/[^\w\-_.]/g, '_') // 영문, 숫자, _, -, . 외의 모든 문자를 _로 치환
    .replace(/_{2,}/g, '_') // 연속된 언더스코어를 하나로 통합
    .replace(/^_+|_+$/g, '') // 앞뒤 언더스코어 제거
    .substring(0, 20); // 길이 제한 (20자)

  // 타임스탬프 + UUID 부분 + 정제된 이름 + 확장자
  const timestamp = Date.now();
  const uuidShort = uuid.split('-')[0]; // UUID의 첫 번째 부분만 사용

  // 정제된 이름이 비어있으면 기본명 사용
  const finalName = sanitizedName || 'image';

  return `${timestamp}_${uuidShort}_${finalName}${extension}`;
};

interface PrepareFormDataParams {
  id_uuid: string;
  clinicName: string;
  email: string;
  introduction: string;
  tel: string;
  addressForSendForm: any;
  selectedLocation: string;
  selectedTreatments: any[];
  treatmentOptions: any[];
  priceExpose: boolean;
  treatmentEtc: string;
  openingHours: any[];
  optionState: any;
  clinicImageUrls: string[];
  doctorImageUrls: string[];
  doctors: any[];
  feedback: string;
  selectedLanguages: string[];
  snsData: {
    kakao_talk?: string;
    line?: string;
    we_chat?: string;
    whats_app?: string;
    telegram?: string;
    facebook_messenger?: string;
    instagram?: string;
    tiktok?: string;
    youtube?: string;
    other_channel?: string;
  };
}

export const prepareFormData = ({
  id_uuid,
  clinicName,
  email,
  introduction,
  tel,
  addressForSendForm,
  selectedLocation,
  selectedTreatments,
  treatmentOptions,
  priceExpose,
  treatmentEtc,
  openingHours,
  optionState,
  clinicImageUrls,
  doctorImageUrls,
  doctors,
  feedback,
  selectedLanguages,
  snsData
}: PrepareFormDataParams): FormData => {
  const formData = new FormData();
  // const id_uuid = uuidv4();

  // 기본 정보
  formData.append('id_uuid', id_uuid);
  formData.append('name', clinicName);
  formData.append('email', email);
  formData.append('tel', tel);
  formData.append('introduction', introduction);

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
    formData.append('location', selectedLocation);
  }

  // 시술 정보
  if (selectedTreatments.length > 0) {
    formData.append('treatments', JSON.stringify(selectedTreatments));
  }

  // 시술 옵션
  if (treatmentOptions.length > 0) {
    formData.append('treatment_options', JSON.stringify(treatmentOptions));
  }

  // 가격 노출 설정
  formData.append('price_expose', priceExpose ? '1' : '0');

  // 시설 정보
  formData.append('extra_options', JSON.stringify(optionState));

  // 영업 시간
  formData.append('opening_hours', JSON.stringify(openingHours));

  // 기타 시술 정보
  formData.append('etc', treatmentEtc);

  // 의사 정보
  if (doctors.length > 0) {
    const doctorsData = doctors.map((doctor, index) => ({
      name: doctor.name,
      bio: doctor.bio || '',
      imageUrl: doctorImageUrls[index] || '',
      chief: doctor.isChief ? 1 : 0,
      useDefaultImage: doctor.useDefaultImage,
      defaultImageType: doctor.defaultImageType,
    }));

    formData.append('doctors', JSON.stringify(doctorsData));
  }

  // 피드백
  if (feedback.trim()) {
    formData.append('feedback', feedback.trim());
  }

  // 가능 언어
  formData.append('available_languages', JSON.stringify(selectedLanguages));

  // 이미지 URL 정보
  formData.append('clinic_image_urls', JSON.stringify(clinicImageUrls));
  formData.append('doctor_image_urls', JSON.stringify(doctorImageUrls));

  return formData;
}; 