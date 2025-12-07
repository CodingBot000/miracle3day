import { ExistingHospitalData } from '@/models/admin/hospital';
import {
  TABLE_HOSPITAL_PREPARE,
  TABLE_DOCTOR_PREPARE,
  TABLE_HOSPITAL_DETAIL_PREPARE,
  TABLE_HOSPITAL_TREATMENT_PREPARE,
  TABLE_HOSPITAL_BUSINESS_HOUR_PREPARE,
  TABLE_TREATMENT_INFO,
  TABLE_FEEDBACKS,
  TABLE_CONTACTS_PREPARE
} from '@/constants/tables';
import { log } from "@/utils/logger";
import { pool } from '@/lib/admin/db';
/**
 * 현재 사용자의 병원 UUID를 가져옵니다
 */
export async function getUserHospitalUuid(adminId: string): Promise<string | null> {
  log.info(' 사용자 병원 UUID 조회 시작 adminId:', adminId);
  
  const { rows } = await pool.query(
    `SELECT id_uuid FROM ${TABLE_HOSPITAL_PREPARE} WHERE id_uuid_admin = $1 LIMIT 1`,
    [adminId]
  );

  if (rows.length === 0 || !rows[0].id_uuid) {
    log.info(' 연결된 병원이 없습니다');
    return null;
  }

  log.info(' 병원 UUID 찾음:', rows[0].id_uuid);
  return rows[0].id_uuid;
}

/**
 * 병원 기본 정보를 가져옵니다
 */
export async function loadHospitalData(hospitalUuid: string) {
  log.info(' 병원 기본 정보 로딩 hospitalUuid:', hospitalUuid);
  
  const { rows } = await pool.query(
    `SELECT * FROM ${TABLE_HOSPITAL_PREPARE} WHERE id_uuid = $1`,
    [hospitalUuid]
  );

  if (rows.length === 0) {
    throw new Error('병원 정보를 찾을 수 없습니다');
  }

  log.info(' 병원 정보 로딩 완료');
  return rows[0];
}

/**
 * 병원 상세 정보를 가져옵니다
 */
async function loadHospitalDetailData(hospitalUuid: string) {
  log.info(' 병원 상세 정보 로딩:', hospitalUuid);
  
  const { rows } = await pool.query(
    `SELECT * FROM ${TABLE_HOSPITAL_DETAIL_PREPARE} WHERE id_uuid_hospital = $1`,
    [hospitalUuid]
  );

  const data = rows[0] || null;
  log.info(' 병원 상세 정보 로딩 완료:', data);
  log.info(' available_languages 필드:', data?.available_languages);
  log.info(' available_languages 타입:', typeof data?.available_languages);
  
  return data;
}

/**
 * 영업시간 정보를 가져옵니다
 */
async function loadBusinessHours(hospitalUuid: string) {
  log.info(' 영업시간 정보 로딩:', hospitalUuid);
  
  const { rows } = await pool.query(
    `SELECT * FROM ${TABLE_HOSPITAL_BUSINESS_HOUR_PREPARE} WHERE id_uuid_hospital = $1 ORDER BY day_of_week`,
    [hospitalUuid]
  );

  log.info(' 영업시간 정보 로딩 완료:', rows.length, '건');
  return rows;
}

/**
 * 의사 정보를 가져옵니다
 */
async function loadDoctors(hospitalUuid: string) {
  log.info(' 의사 정보 로딩:', hospitalUuid);

  const { rows } = await pool.query(
    `SELECT * FROM ${TABLE_DOCTOR_PREPARE} WHERE id_uuid_hospital = $1 ORDER BY display_order ASC, id_uuid ASC`,
    [hospitalUuid]
  );

  log.info(' 의사 정보 로딩 완료:', rows.length, '명');
  return rows;
}

/**
 * 시술 정보를 가져옵니다 - hospital_treatment 먼저 가져오고 별도로 treatment 정보 매칭
 */
async function loadTreatments(hospitalUuid: string) {
  log.info(' 시술 정보 로딩:', hospitalUuid);
  
  // 1. hospital_treatment 데이터 먼저 가져오기
  const { rows: hospitalTreatments } = await pool.query(
    `SELECT * FROM ${TABLE_HOSPITAL_TREATMENT_PREPARE} WHERE id_uuid_hospital = $1`,
    [hospitalUuid]
  );

  if (hospitalTreatments.length === 0) {
    log.info(' 시술 정보가 없습니다');
    return [];
  }

  log.info(' 병원 시술 정보 로딩 완료:', hospitalTreatments.length, '건');

  // 2. NULL이 아닌 id_uuid_treatment들만 추출
  const treatmentUuids = hospitalTreatments
    .filter((ht: any) => ht.id_uuid_treatment !== null)
    .map((ht: any) => ht.id_uuid_treatment);

  log.info(' 매칭할 시술 UUID들:', treatmentUuids);

  // 3. treatment 정보 가져오기 (UUID가 있는 경우만)
  let treatments: any[] = [];
  if (treatmentUuids.length > 0) {
    const placeholders = treatmentUuids.map((_, i) => `$${i + 1}`).join(',');
    const { rows: treatmentData } = await pool.query(
      `SELECT id_uuid, code, name FROM ${TABLE_TREATMENT_INFO} WHERE id_uuid IN (${placeholders})`,
      treatmentUuids
    );

    treatments = treatmentData;
  }

  log.info(' 시술 마스터 정보 로딩 완료:', treatments.length, '건');

  // 4. hospital_treatment와 treatment 매칭
  const result = hospitalTreatments.map((hospitalTreatment: any) => {
    if (hospitalTreatment.id_uuid_treatment === null) {
      // 기타 항목인 경우
      return {
        ...hospitalTreatment,
        treatment: null // 기타 항목이므로 treatment 정보 없음
      };
    } else {
      // 일반 시술인 경우 treatment 정보 매칭
      const matchedTreatment = treatments.find((t: any) => t.id_uuid === hospitalTreatment.id_uuid_treatment);
      return {
        ...hospitalTreatment,
        treatment: matchedTreatment || null
      };
    }
  });

  log.info(' 시술 정보 매칭 완료:', result.length, '건');
  log.info(' 시술 정보 상세:', result);
  return result;
}

async function loadFeedback(hospitalUuid: string) {
  log.info(' 피드백 정보 로딩:', hospitalUuid);
  
  const { rows } = await pool.query(
    `SELECT feedback_content FROM ${TABLE_FEEDBACKS} WHERE id_uuid_hospital = $1 ORDER BY created_at DESC LIMIT 1`,
    [hospitalUuid]
  );

  log.info(' 피드백 정보 로딩 완료');
  return rows[0]?.feedback_content || '';
}

/**
 * 연락처 정보를 가져옵니다
 */
async function loadContacts(hospitalUuid: string) {
  log.info(' 연락처 정보 로딩:', hospitalUuid);
  
  const { rows } = await pool.query(
    `SELECT * FROM ${TABLE_CONTACTS_PREPARE} WHERE id_uuid_hospital = $1 ORDER BY type, sequence`,
    [hospitalUuid]
  );

  log.info(' 연락처 정보 로딩 완료:', rows.length, '개');
  return rows;
}

/**
 * 모든 병원 관련 데이터를 통합해서 가져옵니다
 */
export async function loadExistingHospitalData(
  userUid: string,
  id_uuid_hospital: string,
  step: number,
  prev: ExistingHospitalData | null = null // ✅ 이전 데이터 받기
): Promise<ExistingHospitalData | null> {
  try {
    log.info('=== [loadExistingHospitalData] 시작 ===');

    let hospitalUuid = id_uuid_hospital;
    if (!hospitalUuid) {
      const userHospitalUuid = await getUserHospitalUuid(userUid);
      if (!userHospitalUuid) {
        log.info('⛔️ 병원 UUID 없음 — 로딩 중단');
        return null;
      }
      hospitalUuid = userHospitalUuid;
    }
    log.info(`✅ 병원 UUID: ${hospitalUuid} | step: ${step}`);

    // ✅ 이전 데이터 있으면 사용, 없으면 EMPTY로
    const base = prev ?? {
      hospital: null,
      hospitalDetail: null,
      businessHours: [],
      doctors: [],
      treatments: [],
      feedback: '',
      contacts: []
    };

    let result: ExistingHospitalData = { ...base };

    switch (step) {
      case 1: {
        const [hospital, hospitalDetail] = await Promise.all([
          loadHospitalData(hospitalUuid),
          loadHospitalDetailData(hospitalUuid)
        ]);
        result = {
          ...base,
          hospital: hospital ?? base.hospital,
          hospitalDetail: hospitalDetail ?? base.hospitalDetail
        };
        break;
      }

      case 2: {
        const [hospitalDetail, businessHours] = await Promise.all([
          loadHospitalDetailData(hospitalUuid),
          loadBusinessHours(hospitalUuid)
        ]);
        result = {
          ...base,
          hospitalDetail: hospitalDetail ?? base.hospitalDetail,
          businessHours: businessHours ?? base.businessHours
        };
        break;
      }

      case 3: {
        const [hospital, doctors] = await Promise.all([
          loadHospitalData(hospitalUuid),
          loadDoctors(hospitalUuid)
        ]);
        result = {
          ...base,
          hospital: hospital ?? base.hospital,
          doctors: doctors ?? base.doctors
        };
        break;
      }

      case 4: {
        const [treatments] = await Promise.all([
          loadTreatments(hospitalUuid)
        ]);
        result = {
          ...base,
          treatments: treatments ?? base.treatments
        };
        break;
      }

      case 5: {
        const [hospital, feedback] = await Promise.all([
          loadHospitalData(hospitalUuid),
          loadFeedback(hospitalUuid)
        ]);
        result = {
          ...base,
          hospital: hospital ?? base.hospital,
          feedback: feedback ?? base.feedback
        };
        break;
      }

      case 6: {
        const [contacts] = await Promise.all([
          loadContacts(hospitalUuid)
        ]);
        result = {
          ...base,
          contacts: contacts ?? base.contacts
        };
        break;
      }

      case 100: {
        const [hospital, hospitalDetail, businessHours, doctors, treatments, feedback, contacts] = await Promise.all([
          loadHospitalData(hospitalUuid),
          loadHospitalDetailData(hospitalUuid),
          loadBusinessHours(hospitalUuid),
          loadDoctors(hospitalUuid),
          loadTreatments(hospitalUuid),
          loadFeedback(hospitalUuid),
          loadContacts(hospitalUuid)
        ]);
        result = {
          hospital: hospital ?? base.hospital,
          hospitalDetail: hospitalDetail ?? base.hospitalDetail,
          businessHours: businessHours ?? base.businessHours,
          doctors: doctors ?? base.doctors,
          treatments: treatments ?? base.treatments,
          feedback: feedback ?? base.feedback,
          contacts: contacts ?? base.contacts
        };
        break;
      }

      default:
        throw new Error(`❌ 지원되지 않는 step: ${step}`);
    }

    log.info('=== [loadExistingHospitalData] 로딩 요약 ===', {
      상세정보: result.hospitalDetail ? '✅' : '⛔️',
      영업시간: result.businessHours?.length ?? 0,
    });

    return result;

  } catch (error) {
    console.error('🚨 병원 데이터 로딩 중 오류:', error);
    throw error;
  }
}
