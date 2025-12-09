import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { deleteFile } from '@/lib/admin/s3Client';
import {
  TABLE_HOSPITAL_PREPARE,
  TABLE_DOCTOR_PREPARE,
  STORAGE_IMAGES
} from '@/constants/tables';
import { v4 as uuidv4 } from 'uuid';
import { log } from "@/utils/logger";
import { hasTempUrls, filterOutTempUrls } from '@/utils/guards/tempUrlGuard'; 

// CORS 헤더 정의
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: corsHeaders });
}

export async function POST(request: NextRequest) {
  log.info('=== uploadStep4 START ===');

  try {
    const formData = await request.formData();
    
    // FormData에서 기본 정보 추출
    const isEditMode = formData.get("is_edit_mode")?.toString() === "true";
    const id_uuid_hospital = formData.get("id_uuid_hospital") as string;
    const current_user_uid = formData.get("current_user_uid") as string;
    
    // 기존 데이터 파싱 (편집 모드용)
    const existingDataRaw = formData.get("existing_data")?.toString();
    const existingData = existingDataRaw ? JSON.parse(existingDataRaw) : null;

    // 썸네일 이미지 관련 데이터
    const existingThumbnailUrl = formData.get("existing_thumbnail_url")?.toString() || null;
    const newThumbnailUrl = formData.get("new_thumbnail_url")?.toString() || null;
    const finalThumbnailUrl = formData.get("final_thumbnail_url")?.toString() || null;
    const deletedThumbnailUrl = formData.get("deleted_thumbnail_url")?.toString() || null;

    // 기존 병원 이미지 URL들
    const existingClinicUrlsRaw = formData.get("existing_clinic_urls") as string;
    const existingClinicUrls = existingClinicUrlsRaw ? JSON.parse(existingClinicUrlsRaw) : [];
    
    // 새로 업로드된 병원 이미지 URL들
    const newClinicImageUrlsRaw = formData.get("new_clinic_image_urls") as string;
    const newClinicImageUrls = newClinicImageUrlsRaw ? JSON.parse(newClinicImageUrlsRaw) : [];
    
    // 최종 병원 이미지 URL들 (클라이언트에서 전달받은 순서)
    const finalClinicImageUrlsRaw = formData.get("final_clinic_image_urls") as string;
    const finalClinicImageUrls = finalClinicImageUrlsRaw ? JSON.parse(finalClinicImageUrlsRaw) : [];
    
    // 삭제된 병원 이미지 URL들
    const deletedClinicUrlsRaw = formData.get("deleted_clinic_urls") as string;
    const deletedClinicUrls = deletedClinicUrlsRaw ? JSON.parse(deletedClinicUrlsRaw) : [];
    
    // 의사 정보 파싱
    const doctorsRaw = formData.get("doctors") as string;
    log.info('=== 의사 데이터 원본 ===');
    log.info('doctorsRaw:', doctorsRaw);
    log.info('doctorsRaw type:', typeof doctorsRaw);
    log.info('doctorsRaw length:', doctorsRaw?.length || 0);
    
    const doctors = doctorsRaw ? JSON.parse(doctorsRaw) : [];
    log.info('=== 파싱된 의사 데이터 ===');
    log.info('doctors:', doctors);
    log.info('doctors length:', doctors.length);
    log.info('doctors type:', Array.isArray(doctors) ? 'array' : typeof doctors);

    log.info('uploadStep4 디버그 정보:');
    log.info('- isEditMode:', isEditMode);
    log.info('- id_uuid_hospital:', id_uuid_hospital);
    log.info('- existingThumbnailUrl:', existingThumbnailUrl);
    log.info('- newThumbnailUrl:', newThumbnailUrl);
    log.info('- finalThumbnailUrl:', finalThumbnailUrl);
    log.info('- deletedThumbnailUrl:', deletedThumbnailUrl);
    log.info('- existingClinicUrls:', existingClinicUrls);
    log.info('- newClinicImageUrls:', newClinicImageUrls);
    log.info('- finalClinicImageUrls:', finalClinicImageUrls);
    log.info('- deletedClinicUrls:', deletedClinicUrls);
    log.info('- doctors count:', doctors.length);

    // ✅ 0. 실제 파일 업로드 처리
    const { uploadFile } = await import('@/lib/admin/s3Client');

    // 0-1. 썸네일 파일 업로드
    const thumbnailFile = formData.get('thumbnail_file') as File | null;
    let uploadedThumbnailUrl = finalThumbnailUrl;

    if (thumbnailFile && thumbnailFile instanceof File) {
      log.info('썸네일 파일 업로드 시작:', thumbnailFile.name);

      const timestamp = Date.now();
      const extension = thumbnailFile.name.split('.').pop() || 'jpg';
      const fileName = `thumbnail_${id_uuid_hospital}_${timestamp}.${extension}`;
      const filePath = `images/hospitalimg/${id_uuid_hospital}/thumbnail/${fileName}`;

      const fileBuffer = Buffer.from(await thumbnailFile.arrayBuffer());
      const uploadResult = await uploadFile(filePath, fileBuffer, thumbnailFile.type);

      if (uploadResult.success) {
        uploadedThumbnailUrl = uploadResult.url;
        log.info('썸네일 파일 업로드 성공:', uploadedThumbnailUrl);
      } else {
        log.error('썸네일 파일 업로드 실패');
      }
    }

    // 0-2. 클리닉 이미지 파일들 업로드
    const clinicImageFiles = formData.getAll('clinic_images') as File[];
    const uploadedClinicImageUrls: string[] = [];

    if (clinicImageFiles.length > 0) {
      log.info('클리닉 이미지 파일 업로드 시작:', clinicImageFiles.length, '개');

      for (const file of clinicImageFiles) {
        if (file && file instanceof File) {
          const timestamp = Date.now();
          const randomId = Math.random().toString(36).substring(7);
          const extension = file.name.split('.').pop() || 'jpg';
          const sanitizedName = file.name.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 20);
          const fileName = `hospital_${sanitizedName}_${randomId}_${timestamp}.${extension}`;
          const filePath = `images/hospitalimg/${id_uuid_hospital}/hospitals/${fileName}`;

          const fileBuffer = Buffer.from(await file.arrayBuffer());
          const uploadResult = await uploadFile(filePath, fileBuffer, file.type);

          if (uploadResult.success) {
            uploadedClinicImageUrls.push(uploadResult.url);
            log.info('클리닉 이미지 파일 업로드 성공:', uploadResult.url);
          } else {
            log.error('클리닉 이미지 파일 업로드 실패:', file.name);
          }
        }
      }
    }

    // 0-3. 의사 이미지 파일들 업로드
    const doctorImageFiles = formData.getAll('doctor_images') as File[];
    const uploadedDoctorImageUrls: string[] = [];

    if (doctorImageFiles.length > 0) {
      log.info('의사 이미지 파일 업로드 시작:', doctorImageFiles.length, '개');

      for (let i = 0; i < doctorImageFiles.length; i++) {
        const file = doctorImageFiles[i];
        if (file && file instanceof File) {
          const doctorName = formData.get(`doctor_image_name_${i}`)?.toString() || 'doctor';
          const timestamp = Date.now();
          const randomId = Math.random().toString(36).substring(7);
          const extension = file.name.split('.').pop() || 'jpg';
          const sanitizedDoctorName = doctorName.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 20);
          const fileName = `doctor_${sanitizedDoctorName}_${randomId}_${timestamp}.${extension}`;
          const filePath = `images/hospitalimg/${id_uuid_hospital}/doctors/${fileName}`;

          const fileBuffer = Buffer.from(await file.arrayBuffer());
          const uploadResult = await uploadFile(filePath, fileBuffer, file.type);

          if (uploadResult.success) {
            uploadedDoctorImageUrls.push(uploadResult.url);
            log.info('의사 이미지 파일 업로드 성공:', uploadResult.url);
          } else {
            log.error('의사 이미지 파일 업로드 실패:', file.name);
          }
        }
      }
    }

    // 0-4. temp_url을 실제 업로드된 URL로 교체
    let updatedFinalClinicImageUrls = [...finalClinicImageUrls];
    let updatedNewClinicImageUrls = [...newClinicImageUrls];

    // temp_url을 실제 URL로 교체
    uploadedClinicImageUrls.forEach((uploadedUrl, index) => {
      const tempUrlPattern = newClinicImageUrls[index];
      if (tempUrlPattern && tempUrlPattern.includes('temp_url_')) {
        // finalClinicImageUrls에서 temp_url을 실제 URL로 교체
        const tempIndex = updatedFinalClinicImageUrls.findIndex(url => url === tempUrlPattern);
        if (tempIndex !== -1) {
          updatedFinalClinicImageUrls[tempIndex] = uploadedUrl;
        }
        // newClinicImageUrls에서도 교체
        updatedNewClinicImageUrls[index] = uploadedUrl;
      }
    });

    // 의사 이미지도 교체
    if (uploadedDoctorImageUrls.length > 0 && doctors.length > 0) {
      let doctorImageIndex = 0;
      doctors.forEach((doctor: any) => {
        if (doctor.image_url && doctor.image_url.includes('temp_url_')) {
          if (doctorImageIndex < uploadedDoctorImageUrls.length) {
            doctor.image_url = uploadedDoctorImageUrls[doctorImageIndex];
            log.info(`의사 ${doctor.name}의 temp_url을 실제 URL로 교체:`, doctor.image_url);
            doctorImageIndex++;
          }
        }
      });
    }

    log.info('파일 업로드 완료:');
    log.info('- 업로드된 썸네일 URL:', uploadedThumbnailUrl);
    log.info('- 업로드된 클리닉 이미지 URLs:', uploadedClinicImageUrls);
    log.info('- 업로드된 의사 이미지 URLs:', uploadedDoctorImageUrls);
    log.info('- 교체된 final clinic URLs:', updatedFinalClinicImageUrls);

    // 1. 썸네일 이미지 처리 (exist vs cur 비교)
    const existThumbnail = existingThumbnailUrl;
    const curThumbnail = uploadedThumbnailUrl; // ✅ 업로드된 URL 사용
    
    log.info('썸네일 이미지 비교:');
    log.info('- exist (기존):', existThumbnail);
    log.info('- cur (현재):', curThumbnail);
    log.info('- 변경사항 있음:', existThumbnail !== curThumbnail);
    
    // 변경사항이 있으면 기존 썸네일 이미지 삭제
    if (existThumbnail && existThumbnail !== curThumbnail && !existThumbnail.includes('/default/')) {
      log.info('기존 썸네일 이미지 삭제 시작:', existThumbnail);
      
      try {
        // Storage에서 파일 경로 추출
        const urlParts = existThumbnail.split('/');
        const fileName = urlParts[urlParts.length - 1];
        const filePath = `images/hospitalimg/${id_uuid_hospital}/thumbnail/${fileName}`;
        
        log.info(`썸네일 이미지 파일 삭제: ${filePath}`);

        // AWS S3 Lightsail 삭제
        const deleteResult = await deleteFile(filePath);
        if (deleteResult.success) {
          log.info(`썸네일 이미지 파일 삭제 성공: ${filePath}`);
        } else {
          console.error('썸네일 이미지 파일 삭제 실패');
        }
      } catch (error) {
        console.error('썸네일 이미지 파일 삭제 중 오류:', error);
      }
    }

    // 2. 클라이언트에서 명시적으로 삭제된 썸네일 이미지 처리
    if (deletedThumbnailUrl && deletedThumbnailUrl !== existThumbnail) {
      log.info('- 추가로 삭제할 썸네일 이미지 URL:', deletedThumbnailUrl);
      
      try {
        // Storage에서 파일 경로 추출
        const urlParts = deletedThumbnailUrl.split('/');
        const fileName = urlParts[urlParts.length - 1];
        const filePath = `images/hospitalimg/${id_uuid_hospital}/thumbnail/${fileName}`;
        
        log.info(`- 추가 썸네일 이미지 파일 제거: ${filePath}`);

        // AWS S3 Lightsail 삭제
        const deleteResult = await deleteFile(filePath);
        if (deleteResult.success) {
          log.info(`- 추가 썸네일 이미지 파일 제거 성공: ${filePath}`);
        } else {
          console.error('추가 썸네일 이미지 파일 제거 실패');
        }
      } catch (error) {
        console.error('추가 썸네일 이미지 파일 제거 중 오류:', error);
      }
    }

    // 3. 클라이언트에서 명시적으로 삭제된 병원 이미지 파일들 처리 (안전 삭제)
    const deletedHospitalImages: string[] = [];
    if (deletedClinicUrls.length > 0) {
      log.info('- 클라이언트에서 삭제된 병원 이미지 URL들:', deletedClinicUrls);

      for (const deletedUrl of deletedClinicUrls) {
        try {
          // temp_url 제외 및 유효한 경로만 삭제 대상에 추가
          if (deletedUrl.includes('temp_url_')) {
            log.warn('temp_url 삭제 요청 무시:', deletedUrl);
            continue;
          }

          // Storage에서 파일 경로 추출
          const urlParts = deletedUrl.split('/');
          const fileName = urlParts[urlParts.length - 1];
          const filePath = `images/hospitalimg/${id_uuid_hospital}/hospitals/${fileName}`;

          // 삭제 대상 키 저장 (실제 삭제는 DB 커밋 후)
          if (filePath.startsWith('images/')) {
            deletedHospitalImages.push(filePath);
            log.info(`- 병원 이미지 삭제 예약: ${filePath}`);
          }
        } catch (error) {
          log.warn('병원 이미지 삭제 준비 중 오류 (무시됨):', error);
        }
      }
    }

    // 4. 기존 이미지와 최종 이미지 비교하여 추가로 삭제할 이미지들 처리
    if (isEditMode && existingClinicUrls.length > 0) {
      const additionalDeletedImageUrls = existingClinicUrls.filter(
        (url: string) => !finalClinicImageUrls.includes(url) && !deletedClinicUrls.includes(url)
      );

      if (additionalDeletedImageUrls.length > 0) {
        log.info('- 추가로 삭제할 병원 이미지 URL들:', additionalDeletedImageUrls);

        for (const deletedUrl of additionalDeletedImageUrls) {
          try {
            // temp_url 제외
            if (deletedUrl.includes('temp_url_')) {
              log.warn('temp_url 추가 삭제 요청 무시:', deletedUrl);
              continue;
            }

            // Storage에서 파일 경로 추출
            const urlParts = deletedUrl.split('/');
            const fileName = urlParts[urlParts.length - 1];
            const filePath = `images/hospitalimg/${id_uuid_hospital}/hospitals/${fileName}`;

            // 삭제 대상 키 저장 (실제 삭제는 DB 커밋 후)
            if (filePath.startsWith('images/') && !deletedHospitalImages.includes(filePath)) {
              deletedHospitalImages.push(filePath);
              log.info(`- 추가 병원 이미지 삭제 예약: ${filePath}`);
            }
          } catch (error) {
            log.warn('추가 병원 이미지 삭제 준비 중 오류 (무시됨):', error);
          }
        }
      }
    }

    // 5. 병원 테이블 업데이트 (썸네일 이미지 URL과 최종 이미지 URL 배열)
    log.info('병원 테이블 업데이트 시작:', {
      id_uuid_hospital,
      thumbnail_url: uploadedThumbnailUrl,
      imageurls: updatedFinalClinicImageUrls
    });

    // === temp_url 방어 로직 추가 ===
    const imageArray = Array.isArray(updatedFinalClinicImageUrls) ? updatedFinalClinicImageUrls.filter(Boolean) : [];

    // (1) temp_url 포함 여부 검사
    if (hasTempUrls(imageArray)) {
      log.error('temp_url 상태의 이미지 감지:', imageArray);
      return NextResponse.json(
        {
          error: 'PENDING_UPLOADS',
          message: '임시 temp_url 상태의 이미지가 포함되어 있습니다. 실제 업로드 완료 후 다시 시도하세요.',
          debugUrls: imageArray,
        },
        { status: 422 }
      );
    }

    // (2) temp_url 제거 후 정제된 URL만 사용
    const cleanedUrls = filterOutTempUrls(imageArray);
    log.info('temp_url 제거 후 정제된 URLs:', cleanedUrls);

    // (3) 트랜잭션 시작
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      log.info('트랜잭션 시작');

      await client.query(
        `UPDATE ${TABLE_HOSPITAL_PREPARE}
           SET thumbnail_url = $1,
               imageurls     = COALESCE($2::text[], ARRAY[]::text[])
         WHERE id_uuid = $3`,
        [uploadedThumbnailUrl ?? null, cleanedUrls, id_uuid_hospital]
      );

      await client.query('COMMIT');
      log.info('병원 테이블 업데이트 성공 (트랜잭션 커밋)');
    } catch (error) {
      await client.query('ROLLBACK');
      log.error('병원 테이블 업데이트 실패 (트랜잭션 롤백):', error);
      client.release();
      return NextResponse.json({
        error: 'DB_UPDATE_FAILED',
        message: `병원 테이블 업데이트 실패: ${(error as any).message}`,
        status: "error",
      }, { status: 500 });
    } finally {
      client.release();
    }

    // === DB 커밋 성공 후에만 S3 삭제 실행 ===
    // temp_url이 아니고 images/로 시작하는 키만 필터링
    const willDeleteKeys = deletedHospitalImages.filter(
      (k) => !k.includes('temp_url_') && k.startsWith('images/')
    );

    log.info('S3 삭제 실행:', { count: willDeleteKeys.length, keys: willDeleteKeys });

    for (const key of willDeleteKeys) {
      try {
        const deleteResult = await deleteFile(key);
        if (deleteResult.success) {
          log.info('삭제된 병원 이미지 파일 제거 성공:', key);
        } else {
          log.warn('S3 삭제 실패 (무시됨):', key);
        }
      } catch (err) {
        log.warn('S3 삭제 실패 (무시됨):', key, err);
      }
    }

    // 각 의사 정보 처리
    for (let i = 0; i < doctors.length; i++) {
      const doctor = doctors[i];
      
      log.info(`의사 ${i + 1} 처리:`, {
        id_uuid: doctor.id_uuid,
        name: doctor.name,
        image_url: doctor.image_url,
        isExisting: !!doctor.id_uuid,
        imageUrlLength: doctor.image_url?.length || 0
      });
      
      // 의사 데이터 준비 (이미지 URL은 이미 클라이언트에서 업로드 완료)
      const doctorData = {
        id_uuid_hospital,
        name: doctor.name,
        name_en: doctor.name_en,
        bio: doctor.bio || '',
        bio_en: doctor.bio_en || '',
        image_url: doctor.image_url || '',
        chief: doctor.chief,
      };

      if (doctor.id_uuid) {
        // 기존 의사 정보 업데이트
        log.info(`- 의사 정보 업데이트: ${doctor.name} (${doctor.id_uuid})`);
        log.info(`  업데이트할 이미지 URL: ${doctorData.image_url}`);

        // 먼저 해당 의사가 존재하는지 확인
        const { rows: existingDoctors } = await pool.query(
          `SELECT * FROM ${TABLE_DOCTOR_PREPARE} WHERE id_uuid=$1`,
          [doctor.id_uuid]
        );

        if (!existingDoctors || existingDoctors.length === 0) {
          log.info(`- 의사 ${doctor.name} (${doctor.id_uuid}) 존재하지 않음, 새로 추가`);
          
          // 존재하지 않으면 새로 추가
          try {
            await pool.query(
              `INSERT INTO ${TABLE_DOCTOR_PREPARE} (id_uuid, id_uuid_hospital, name, name_en, bio, bio_en, image_url, chief)
               VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
              [doctor.id_uuid, doctorData.id_uuid_hospital, doctorData.name, doctorData.name_en, 
               doctorData.bio, doctorData.bio_en, doctorData.image_url, doctorData.chief]
            );
            log.info(`- 새 의사 정보 추가 성공: ${doctor.name}`);
          } catch (error) {
            console.error('의사 정보 추가 실패:', error);
            return NextResponse.json({
              message: `의사 정보 추가 실패: ${(error as any).message}`,
              status: "error",
            }, { status: 500 });
          }
        } else {
          log.info(`- 의사 ${doctor.name} (${doctor.id_uuid}) 존재함, 업데이트 진행`);

          // 기존 이미지 URL 확인
          const existingDoctor = existingDoctors[0];
          const existingImageUrl = existingDoctor.image_url;
          const newImageUrl = doctorData.image_url;

          // 이미지가 변경되었고, 기존 이미지가 기본 이미지가 아닌 경우 삭제
          if (existingImageUrl !== newImageUrl && 
              existingImageUrl && 
              !existingImageUrl.includes('/default/')) {
            try {
              // Storage에서 파일 경로 추출
              const urlParts = existingImageUrl.split('/');
              const filePath = urlParts.slice(urlParts.indexOf('images') + 1).join('/');
              
              log.info(`- 의사 이전 이미지 파일 삭제: ${filePath}`);

              // AWS S3 Lightsail 삭제
              const deleteResult = await deleteFile(filePath);
              if (deleteResult.success) {
                log.info(`- 의사 이전 이미지 파일 삭제 성공: ${filePath}`);
              } else {
                console.error('의사 이전 이미지 파일 삭제 실패');
              }
            } catch (error) {
              console.error('의사 이전 이미지 파일 삭제 중 오류:', error);
            }
          }
          
          // 존재하면 업데이트
          try {
            await pool.query(
              `UPDATE ${TABLE_DOCTOR_PREPARE} SET name=$1, name_en=$2, bio=$3, bio_en=$4, image_url=$5, chief=$6 
               WHERE id_uuid=$7`,
              [doctorData.name, doctorData.name_en, doctorData.bio, doctorData.bio_en, 
               doctorData.image_url, doctorData.chief, doctor.id_uuid]
            );
            log.info(`- 의사 정보 업데이트 성공: ${doctor.name}`);
          } catch (error) {
            console.error('의사 정보 업데이트 실패:', error);
            return NextResponse.json({
              message: `의사 정보 업데이트 실패: ${(error as any).message}`,
              status: "error",
            }, { status: 500 });
          }
        }
      } else {
        // 새 의사 정보 추가
        log.info(`- 새 의사 정보 추가: ${doctor.name}`);
        try {
          await pool.query(
            `INSERT INTO ${TABLE_DOCTOR_PREPARE} (id_uuid, id_uuid_hospital, name, name_en, bio, bio_en, image_url, chief)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
            [uuidv4(), doctorData.id_uuid_hospital, doctorData.name, doctorData.name_en, 
             doctorData.bio, doctorData.bio_en, doctorData.image_url, doctorData.chief]
          );
          log.info(`- 새 의사 정보 추가 성공: ${doctor.name}`);
        } catch (error) {
          console.error('의사 정보 추가 실패:', error);
          return NextResponse.json({
            message: `의사 정보 추가 실패: ${(error as any).message}`,
            status: "error",
          }, { status: 500 });
        }
      }
    }

    // 편집 모드에서 삭제된 의사들 처리
    if (isEditMode && existingData?.doctors) {
      const existingDoctorIds = existingData.doctors.map((d: any) => d.id_uuid);
      const currentDoctorIds = doctors.map((d: any) => d.id_uuid).filter(Boolean);
      const deletedDoctorIds = existingDoctorIds.filter((id: string) => !currentDoctorIds.includes(id));

      for (const deletedId of deletedDoctorIds) {
        log.info(`- 삭제된 의사 처리: ${deletedId}`);

        // 삭제할 의사의 이미지 URL 찾기
        const deletedDoctor = existingData.doctors.find((d: any) => d.id_uuid === deletedId);
        if (deletedDoctor?.image_url && !deletedDoctor.image_url.includes('/default/')) {
          try {
            // Storage에서 파일 경로 추출
            const urlParts = deletedDoctor.image_url.split('/');
            const filePath = urlParts.slice(urlParts.indexOf('images') + 1).join('/');
            
            log.info(`- 의사 이미지 파일 삭제: ${filePath}`);

            // AWS S3 Lightsail 삭제
            const deleteResult = await deleteFile(filePath);
            if (deleteResult.success) {
              log.info(`- 의사 이미지 파일 삭제 성공: ${filePath}`);
            } else {
              console.error('의사 이미지 파일 삭제 실패');
            }
          } catch (error) {
            console.error('의사 이미지 파일 삭제 중 오류:', error);
          }
        }
        
        // 의사 정보 삭제
        try {
          await pool.query(
            `DELETE FROM ${TABLE_DOCTOR_PREPARE} WHERE id_uuid=$1`,
            [deletedId]
          );
          log.info(`- 의사 정보 삭제 성공: ${deletedId}`);
        } catch (error) {
          console.error('의사 정보 삭제 실패:', error);
          return NextResponse.json({
            message: `의사 정보 삭제 실패: ${(error as any).message}`,
            status: "error",
          }, { status: 500 });
        }
      }
    }

    log.info('=== uploadStep4 성공 완료 ===');
  
    return NextResponse.json({
      message: "썸네일 이미지, 병원 이미지 및 의사 정보가 성공적으로 저장되었습니다.",
      status: "success",
    }, { status: 200, headers: corsHeaders });

  } catch (error) {
    console.error('uploadStep4 전체 오류:', error);
    return NextResponse.json({
      message: `처리 중 오류가 발생했습니다: ${error}`,
      status: "error",
    }, { status: 500, headers: corsHeaders });
  }
} 