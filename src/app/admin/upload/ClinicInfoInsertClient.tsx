"use client";

import { useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { v4 as uuidv4 } from 'uuid';

import Step1BasicInfo from "./Step1BasicInfo";
import Step2BasicContactInfo from "./Step2BasicContactInfo";
import Step3BusinessHours from "./Step3BusinessHours";
import Step4ClinicImagesDoctorsInfo from "./Step4ClinicImagesDoctorsInfo";
import Step5Treatments from "./Step5Treatments";
import Step6SupportTreatments from "./Step6SupportTreatments";
import StepLastLanguagesFeedback from "./StepLastLanguagesFeedback";
import PageHeader from "@/components/admin/PageHeader";
import { api } from "@/lib/admin/api-client";
import { useHospitalStore } from "@/stores/useHospitalUUIDStore";
import { log } from "@/utils/logger";


export default function ClinicInfoInsertClient(
  { id_admin, isEditMode }: { id_admin: string, isEditMode: boolean }
) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // ✅ 쿼리에서 step 파라미터 가져오기
  const stepParam = searchParams.get("step");
  const step = stepParam ? parseInt(stepParam, 10) : 1;

  // Zustand 전역 스토어 사용
  const {
    id_uuid_hospital,
    hospitalName,
    setHospitalUuid,
    setHospitalName,
    setid_admin,
    setHospitalData,
  } = useHospitalStore();

  // 로컬 state는 제거하고 Zustand만 사용
  const setIdUuidHospital = setHospitalUuid;

  const goNext = () => {
    const params = new URLSearchParams(searchParams);
    params.set("step", String(step + 1));
    router.replace(`?${params.toString()}`);
  };

  const goBack = () => {
    const params = new URLSearchParams(searchParams);
    params.set("step", String(step - 1));
    router.replace(`?${params.toString()}`);
  };

  const goToStep = (targetStep: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("step", String(targetStep));
    router.replace(`?${params.toString()}`);
  };

  // useEffect(() => {
  //   document.body.style.overflow = '';
  //   return () => {
  //     document.body.style.overflow = '';
  //   };
  // }, []);

  /**
   * 병원 UUID 초기화 - Zustand 전역 상태 관리
   *
   * 우선순위:
   * 1. DB에서 조회한 id_uuid_hospital (authResult.data.admin.id_uuid_hospital)
   * 2. Zustand에 저장된 id_uuid_hospital (이미 생성했거나 저장된 값)
   * 3. 새로 생성한 UUID (신규 입력 시)
   *
   * 케이스:
   * - case 1: admin.id_uuid_hospital = NULL, hospital 테이블 없음 → 신규 UUID 생성
   * - case 2: admin.id_uuid_hospital = 값 있음, hospital 테이블 없음 → DB 값 사용
   * - case 3: admin.id_uuid_hospital = 값 있음, hospital 테이블 있음 → DB 값 사용 (편집모드)
   */
  useEffect(() => {
    log.info('=== ClinicInfoInsertClient 초기화 시작 ===');
    log.info('isEditMode:', isEditMode);
    log.info('id_admin:', id_admin);

    const initializeHospitalUuid = async () => {
      // 1. 현재 사용자 ID를 Zustand에 저장
      setid_admin(id_admin);

      // 2. API를 통해 DB에서 최신 데이터 조회
      log.info('[1단계] DB에서 admin 정보 조회 중...');
      const authResult = await api.admin.verifyAuth(id_admin);
      log.info('[1단계] authResult:', authResult);

      // 3. DB에서 조회한 hospitalUuid (가장 우선순위 높음)
      const hospitalUuidFromDB = authResult.success && authResult.data?.admin?.id_uuid_hospital
        ? authResult.data.admin.id_uuid_hospital
        : null;

      log.info('[2단계] DB에서 조회한 hospitalUuid:', hospitalUuidFromDB);
      log.info('[2단계] Zustand에 캐시된 hospitalUuid:', id_uuid_hospital);

      if (!isEditMode) {
        // 신규 입력 모드
        log.info('[3단계] 신규 입력 모드 (!isEditMode)');

        if (hospitalUuidFromDB) {
          // case 2: DB에 id_uuid_hospital 값이 있음 → DB 값을 Zustand에 저장
          log.info('[최종] DB 값 사용 (case 2):', hospitalUuidFromDB);
          setHospitalUuid(hospitalUuidFromDB);
        } else {
          // case 1: DB에 id_uuid_hospital 값이 없음 → 새로 생성 또는 Zustand 캐시 사용
          const finalUuid = id_uuid_hospital || uuidv4();
          log.info('[최종] 신규 UUID 생성 또는 캐시 재사용 (case 1):', finalUuid);
          setHospitalUuid(finalUuid);
        }

      } else {
        // 편집 모드
        log.info('[3단계] 편집 모드 (isEditMode)');

        if (hospitalUuidFromDB) {
          // case 3: DB에 값이 있음 → DB 값을 Zustand에 저장
          log.info('[최종] DB 값 사용 (case 3):', hospitalUuidFromDB);
          setHospitalUuid(hospitalUuidFromDB);

          // 병원 이름도 조회
          log.info('[4단계] 병원 이름 조회 중...');
          const nameResult = await api.hospital.getName(hospitalUuidFromDB);
          if (nameResult.success && nameResult.data?.name) {
            const name = nameResult.data.name;
            setHospitalName(name);
            log.info('[4단계] 병원 이름 저장:', name);
          }
        } else {
          // DB에 값이 없음 (비정상 케이스)
          log.warn('[최종] ❌ 편집모드인데 DB에 hospitalUuid 없음!');
          setHospitalUuid('');
        }
      }

      log.info('=== ClinicInfoInsertClient 초기화 완료 ===');
      log.info('✅ Zustand에 저장된 최종 id_uuid_hospital:', id_uuid_hospital);
    };

    initializeHospitalUuid();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id_admin, isEditMode]);

  
  const handlePreview = () => {
    log.info('handlePreview');
  };

  const handleSave = () => {
    log.info('handleSave');
  };

  return (
    <main>
      <PageHeader
        name={hospitalName ? `${hospitalName}님 환영합니다.` : `병원 정보를 입력하세요`}
        currentStep={step}
        onPreview={handlePreview}
        onSave={handleSave}
        onStepChange={goToStep}
        id_uuid_hospital={id_uuid_hospital || ''}
      />

      {step === 1 && (
      //   <Step5Treatments
      //   id_uuid_hospital={id_uuid_hospital || ''}
      //   isEditMode={isEditMode}
      //   onNext={goNext}
      //   onPrev={goBack}
      //   id_admin={id_admin}
      // />
        <Step1BasicInfo
          id_uuid_hospital={id_uuid_hospital || ''}
          setIdUUIDHospital={setIdUuidHospital}
          isEditMode={isEditMode}
          onNext={goNext}
          id_admin={id_admin}
        />
      )}
      {step === 2 && (
        <Step2BasicContactInfo
          id_uuid_hospital={id_uuid_hospital || ''}
          setIdUUIDHospital={setIdUuidHospital}
          isEditMode={isEditMode}
          onNext={goNext}
          onPrev={goBack}
          id_admin={id_admin}
        />
      )}
      {step === 3 && (
        <Step3BusinessHours
          id_uuid_hospital={id_uuid_hospital || ''}
          isEditMode={isEditMode}
          onNext={goNext}
          onPrev={goBack}
          id_admin={id_admin}
        />
      )}
      {step === 4 && (
        <Step4ClinicImagesDoctorsInfo
          id_uuid_hospital={id_uuid_hospital || ''}
          isEditMode={isEditMode}
          onNext={goNext}
          onPrev={goBack}
          id_admin={id_admin}
        />
      )}
      {step === 5 && (
        <Step5Treatments
          id_uuid_hospital={id_uuid_hospital || ''}
          isEditMode={isEditMode}
          onNext={goNext}
          onPrev={goBack}
          id_admin={id_admin}
        />
      )}
      {step === 6 && (
        <Step6SupportTreatments
          id_uuid_hospital={id_uuid_hospital || ''}
          isEditMode={isEditMode}
          onNext={goNext}
          onPrev={goBack}
          id_admin={id_admin}
        />
      )}
      {step === 7 && (
        <StepLastLanguagesFeedback
          id_uuid_hospital={id_uuid_hospital || ''}
          isEditMode={isEditMode}
          onComplete={() => {
            router.replace('/admin');
            router.refresh();
          }}
          onPrev={goBack}
          onStepChange={goToStep}
          id_admin={id_admin}
        />
      )}
    </main>
  );
}
