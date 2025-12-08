import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card } from '@/components/ui/card';
import { preConsultationSteps } from '@/app/[locale]/(consult)/pre_consultation_intake_form/pre_consultation_intake/form-definition_pre_con_steps';
import { questions } from '@/app/[locale]/(consult)/pre_consultation_intake_form/pre_consultation_intake/form-definition_pre_con_questions';
import { previewReport } from '@/app/[locale]/(consult)/pre_consultation_intake_form/pre_consultation_intake/form-definition_pre_con_preview_result';
import { getBudgetRangeById } from '@/app/[locale]/(consult)/recommend_estimate/estimate/datamapper';
import { Button } from '@/components/ui/button';
import { useLocale } from 'next-intl';
import { getLocalizedText } from '@/utils/i18n';
import { USER_INFO, BUDGET,
   HEALTH_CONDITIONS,
    PREFERENCES,
     PRIORITYFACTORS,
      SKIN_CONCERNS,
       SKIN_TYPE,
        TREATMENT_EXPERIENCE_BEFORE,
         TREATMENT_GOALS,
          UPLOAD_PHOTO,
      
          VIDEO_CONSULT_SCHEDULE
     } from '@/constants/pre_consult_steps';
import SubmissionModal from './SubmissionModal';
import { useRouter, useSearchParams } from 'next/navigation';
import { fbqTrack } from '@/utils/metapixel';
import { MessengerInput } from '@/components/atoms/input/InputMessengerFields';
import { log } from '@/utils/logger';

interface PreviewReportProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  showSendFormButton: boolean;
  formData: Record<string, any>;
  onSubmissionComplete?: (formData: Record<string, any>) => void;
}

const PreviewReport: React.FC<PreviewReportProps> = 
({ open, onOpenChange, formData, showSendFormButton, onSubmissionComplete }) => 
  {
  const locale = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();
  const hospitalId = searchParams.get('hospitalId');
  const [isSubmissionModalOpen, setIsSubmissionModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  const tempPass = true;
  const handleSubmit = async () => {
    fbqTrack("Submit_diagnosis_click", { finalSubmit: "start" });

    setIsSubmissionModalOpen(true);
    setIsSubmitting(true);
    setIsCompleted(false);

    // log.debug("tempPass", tempPass);
    // if (tempPass) {
    //   // API 없이 바로 완료 처리 (임시)
    //   setIsCompleted(true);
    //   setIsSubmitting(false);
    //   fbqTrack("Submit_diagnosis_click", { finalSubmit: "success" });
    //   // SubmissionModal에서 onComplete 호출 시 handleSubmissionComplete가 실행됨
    //   return;
    // }

    try {
      // 모든 스텝의 데이터를 합치기
      const allStepData = Object.values(formData).reduce((acc, stepData) => {
        return { ...acc, ...stepData };
      }, {});

      // 이미지 업로드 처리
      let imagePaths: string[] = [];
      const submissionId = crypto.randomUUID(); // UUID를 미리 생성

      if (allStepData.uploadImage?.imageFile) {
        const originalFileName = allStepData.uploadImage.imageFileName || 'image.jpg';

        // 파일명을 안전하게 변환 (한글/특수문자 제거)
        const safeFileName = originalFileName
          .replace(/[^a-zA-Z0-9.-]/g, '_') // 영문, 숫자, 점, 하이픈만 허용
          .replace(/_{2,}/g, '_'); // 연속된 언더스코어를 하나로 변환

        // S3 경로: consultation_photos가 버킷의 루트 폴더
        const imagePath = `${submissionId}/raw/${safeFileName}`;
        const bucket = 'consultation_photos';

        // S3 presigned URL 요청
        const signResponse = await fetch('/api/storage/s3/sign-upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            bucket: bucket,
            key: imagePath,
            contentType: allStepData.uploadImage.imageFile.type,
            upsert: false
          })
        });

        if (!signResponse.ok) {
          const error = await signResponse.json();
          console.error('Failed to get signed URL:', error);
          throw new Error('Failed to get upload URL');
        }

        const { url: signedUrl } = await signResponse.json();

        // S3에 이미지 업로드
        const uploadResponse = await fetch(signedUrl, {
          method: 'PUT',
          headers: {
            'Content-Type': allStepData.uploadImage.imageFile.type,
          },
          body: allStepData.uploadImage.imageFile
        });

        if (!uploadResponse.ok) {
          console.error('S3 upload failed:', uploadResponse.status);
          throw new Error('Failed to upload image to S3');
        }

        // DB에 저장할 전체 경로 (consultation_photos/submissionId/raw/filename)
        imagePaths = [`${bucket}/${imagePath}`];
      }

      // API로 데이터 전송 - submission_type을 'video_consult'로 설정
      const response = await fetch('/api/consultation/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...allStepData,
          imagePaths,
          submissionId, // UUID를 API로 전달
          submissionType: 'video_consult', // 영상상담용 문진임을 표시
          hospitalId: hospitalId || undefined // 병원 ID 전달
        })
      });

      if (!response.ok) {
        throw new Error('Failed to submit consultation');
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Submission failed');
      }
      log.debug('Consultation submission successful:', result);

      // 영상상담 예약 생성
      if (allStepData.videoConsultSlots && allStepData.videoConsultTimezone) {
        log.debug('Creating video consultation reservation...');

        const reservationResponse = await fetch('/api/consult/video/reservations', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            submissionId: result.submissionId,
            slots: allStepData.videoConsultSlots,
            userTimezone: allStepData.videoConsultTimezone,
            hospitalId: hospitalId || undefined // 병원 ID 전달
          })
        });

        if (!reservationResponse.ok) {
          const errorData = await reservationResponse.json();
          throw new Error(`Failed to create video consultation reservation: ${errorData.error}`);
        }

        const reservationResult = await reservationResponse.json();
        log.debug('Video consultation reservation created:', reservationResult);
      }

      setIsCompleted(true);
      fbqTrack("Submit_diagnosis_click", { finalSubmit: "success" });
    } catch (error) {
      console.error('Submission error:', error);
      alert(`${getLocalizedText(previewReport.errorSubmitFailed, locale)}${error}`);
      setIsSubmissionModalOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmissionComplete = () => {
    log.debug("MATCHING LOG: handleSubmissionComplete 호출됨");
    setIsSubmissionModalOpen(false);
    setIsCompleted(false);
    onOpenChange(false);

    // 모든 스텝의 데이터를 합치기
    const allStepData = Object.values(formData).reduce((acc, stepData) => {
      return { ...acc, ...stepData };
    }, {});

    // 부모 컴포넌트에 완료된 데이터 전달
    if (onSubmissionComplete) {
      onSubmissionComplete(allStepData);
    }

    // 병원 상세페이지로 리다이렉트
    if (hospitalId) {
      router.push(`/${locale}/hospital/${hospitalId}`);
    }
  };


  const getStepSummary = (stepId: string, data: any) => {
    if (!data) return getLocalizedText(previewReport.notYetEntered, locale);

    switch (stepId) {
        case UPLOAD_PHOTO:
        const uploadImage = data.uploadImage;
        return (
          <div className="space-y-2">
            {uploadImage?.uploadedImage ? (
              <div>
                <p><strong>{getLocalizedText(previewReport.labels.uploadedImage, locale)}:</strong> {uploadImage.imageFileName || 'Unknown file'}</p>
                <img
                  src={uploadImage.uploadedImage}
                  alt="Uploaded skin image"
                  className="max-w-xs max-h-48 rounded-lg border border-gray-200 mt-2"
                />
              </div>
            ) : (
              <p><strong>{getLocalizedText(previewReport.labels.noImageUploaded, locale)}:</strong> {getLocalizedText(previewReport.labels.noImageUploadedValue, locale)}</p>
            )}
          </div>
        );
      case SKIN_TYPE:
        const skinType = data.skinType;
        const skinTypeLabel = getLocalizedText(
          questions.skinTypes.find(type => type.id === skinType)?.label,
          locale
        ) || skinType;
        return (
          <div className="space-y-2">
            <p><strong>{getLocalizedText(previewReport.labels.skinType, locale)}:</strong> {skinTypeLabel}</p>
          </div>
        );

      case SKIN_CONCERNS:
        const skinConcerns = data.skinConcerns;
        const skinConcernLabels = skinConcerns?.concerns?.map((concernId: string) => {
          return getLocalizedText(
            questions.skinConcerns.find(concern => concern.id === concernId)?.label,
            locale
          ) || concernId;
        }).join(', ');
        return (
          <div className="space-y-2">
            <p><strong>{getLocalizedText(previewReport.labels.skinConcerns, locale)}:</strong> {skinConcernLabels}</p>
            {skinConcerns?.moreConcerns && (
              <div className="mt-2 p-3 rounded-md">
                <p><strong>{getLocalizedText(previewReport.labels.otherConcerns, locale)}:</strong></p>
                <p className="text-gray-700 whitespace-pre-wrap">{skinConcerns.moreConcerns}</p>
              </div>
            )}
          </div>
        );

      case BUDGET:
        const budgetRange = getBudgetRangeById(data.budget);
        return (
          <div className="space-y-2">
            <p><strong>{getLocalizedText(previewReport.labels.budgetRange, locale)}:</strong> {budgetRange ? getLocalizedText(budgetRange.label, locale) : data.budget}</p>
          </div>
        );
        case PREFERENCES:
        const treatmentAreas = data.treatmentAreas;
        const treatmentAreaLabels = treatmentAreas?.treatmentAreas?.map((areaId: string) => {
          return getLocalizedText(
            questions.treatmentAreas.find(area => area.id === areaId)?.label,
            locale
          ) || areaId;
        }).join(', ');
        return (
          <div className="space-y-2">
            <p><strong>{getLocalizedText(previewReport.labels.treatmentAreas, locale)}:</strong> {treatmentAreaLabels}</p>
            {treatmentAreas?.otherAreas && (
              <div className="mt-2 p-3 rounded-md">
                <p><strong>{getLocalizedText(previewReport.labels.otherTreatmentAreas, locale)}:</strong></p>
                <p className="text-gray-700 whitespace-pre-wrap">{treatmentAreas.otherAreas}</p>
              </div>
            )}

          </div>
        );
        case PRIORITYFACTORS:
        const priorityLabels = data.priorityOrder?.priorityOrder?.map((priorityId: string) => {
          return getLocalizedText(
            questions.priorities.find(priority => priority.id === priorityId)?.label,
            locale
          ) || priorityId;
        }).join(' > ');
        return (
          <div className="space-y-2">
            <p><strong>{getLocalizedText(previewReport.labels.priorityOrder, locale)}:</strong> {priorityLabels}</p>
          </div>
        );
      case TREATMENT_GOALS:
        const treatmentGoalLabels = data.goals?.map((goalId: string) => {
          return getLocalizedText(
            questions.treatmentGoals.find(goal => goal.id === goalId)?.label,
            locale
          ) || goalId;
        }).join(', ');
        return (
          <div className="space-y-2">
            <p><strong>{getLocalizedText(previewReport.labels.treatmentGoals, locale)}:</strong> {treatmentGoalLabels}</p>

          </div>
        );
      case TREATMENT_EXPERIENCE_BEFORE:
        const pastTreatments = data.pastTreatments;
        const pastTreatmentLabels = pastTreatments?.pastTreatments?.map((treatmentId: string) => {
          return getLocalizedText(
            questions.pastTreatments.find(treatment => treatment.id === treatmentId)?.label,
            locale
          ) || treatmentId;
        }).join(', ');
        return (
          <div className="space-y-2">
            <p><strong>{getLocalizedText(previewReport.labels.previousTreatments, locale)}:</strong> {pastTreatmentLabels}</p>
            {pastTreatments?.sideEffects && (
              <div className="mt-2 p-3 rounded-md">
                <p><strong>{getLocalizedText(previewReport.labels.treatmentSideEffects, locale)}:</strong></p>
                <p className="text-gray-700 whitespace-pre-wrap">{pastTreatments.sideEffects}</p>
              </div>
            )}
            {pastTreatments?.additionalNotes && (
              <p><strong>{getLocalizedText(previewReport.labels.additionalNotes, locale)}:</strong> {pastTreatments.additionalNotes}</p>
            )}
          </div>
        );

      case HEALTH_CONDITIONS:
        const healthConditions = data.healthConditions;
        const healthConditionLabels = healthConditions?.healthConditions?.map((conditionId: string) => {
          return getLocalizedText(
            questions.medicalConditions.find(condition => condition.id === conditionId)?.label,
            locale
          ) || conditionId;
        }).join(', ');
        return (
          <div className="space-y-2">
            <p><strong>{getLocalizedText(previewReport.labels.healthConditions, locale)}:</strong> {healthConditionLabels}</p>
            {healthConditions?.otherConditions && !healthConditions.healthConditions?.includes('none') && (
              <div className="mt-2 p-3 rounded-md">
                <p><strong>{getLocalizedText(previewReport.labels.otherHealthConditions, locale)}:</strong></p>
                <p className="text-gray-700 whitespace-pre-wrap">{healthConditions.otherConditions}</p>
              </div>
            )}
          </div>
        );

      // case VISIT_PATHS:
      //   const visitPath = data.visitPath;
      //   const visitPathLabel = (questions as any).visitPaths?.find((path: any) => path.id === visitPath?.visitPath)?.label || visitPath?.visitPath;
      //   return (
      //     <div className="space-y-2">
      //       <p><strong>Referral Source:</strong> {visitPathLabel}</p>
      //       {visitPath?.otherPath && visitPath.visitPath === 'other' && (
      //         <div className="mt-2 p-3 rounded-md">
      //           <p><strong>Other Referral Source:</strong></p>
      //           <p className="text-gray-700 whitespace-pre-wrap">{visitPath.otherPath}</p>
      //         </div>
      //       )}
      //     </div>
      //   );

      case VIDEO_CONSULT_SCHEDULE:
        const videoConsultSlots = data.videoConsultSlots;
        const userTimezone = data.videoConsultTimezone;
        if (!videoConsultSlots || videoConsultSlots.length === 0) {
          return <p>{getLocalizedText(previewReport.labels.noPreferredTimeSlotsSelected, locale)}</p>;
        }
        return (
          <div className="space-y-3">
            <p className="font-semibold">
              {getLocalizedText(previewReport.labels.preferredConsultationTimes, locale)}
            </p>
            {videoConsultSlots.map((slot: any, index: number) => (
              <div key={index} className="p-3 bg-gray-50 rounded-md">
                <p className="font-medium">
                  {getLocalizedText(previewReport.labels.preferredTimeSlot, locale)} {slot.rank}
                </p>
                <p className="text-sm text-gray-700">
                  <strong>{getLocalizedText(previewReport.labels.date, locale)}:</strong> {slot.date}
                </p>
                <p className="text-sm text-gray-700">
                  <strong>{getLocalizedText(previewReport.labels.time, locale)}:</strong> {slot.startTime} - {slot.endTime}
                </p>
              </div>
            ))}
            <p className="text-xs text-gray-500">
              {getLocalizedText(previewReport.labels.timezone, locale)}: {userTimezone}
            </p>
          </div>
        );

      case USER_INFO:
        const userInfo = data.userInfo;
        if (!userInfo) {
          return <p>{getLocalizedText(previewReport.labels.noPersonalInfoProvided, locale)}</p>;
        }
        return (
          <div className="space-y-2">
            {/* <p><strong>First Name:</strong> {userInfo.firstName}</p>
            <p><strong>Last Name:</strong> {userInfo.lastName}</p> */}
            <p><strong>{getLocalizedText(previewReport.labels.ageRange, locale)}:</strong> {userInfo.ageRange}</p>
            <p><strong>{getLocalizedText(previewReport.labels.gender, locale)}:</strong> {userInfo.gender}</p>
            <p><strong>{getLocalizedText(previewReport.labels.email, locale)}:</strong> {userInfo.email}</p>
            <p><strong>{getLocalizedText(previewReport.labels.nation, locale)}:</strong> {userInfo.country}</p>
            <p><strong>{getLocalizedText(previewReport.labels.phoneNumber, locale)}:</strong> {userInfo.phoneNumber}</p>
             {userInfo.messengers && userInfo.messengers.length > 0 && (
              <div>
                <p><strong>{getLocalizedText(previewReport.labels.messengers, locale)}:</strong></p>
                {userInfo.messengers.map((messenger: MessengerInput, index: number) => (
                  <p key={index} className="ml-4">• {messenger.type}: {messenger.value}</p>
                ))}
              </div>
            )}
          </div>
        );
    
      default:
        return getLocalizedText(previewReport.noDataAvailable, locale);
    }
  };

  // useEffect(() => {
  //   // Console log entire formData
  //   log.debug("=== PreviewReport formData ===");
  //   log.debug(formData);
  //   log.debug("==============================");

  //   // Map formData to recommendation algorithm parameters
  //   const skinConcerns = formData.skinConcerns?.concerns?.map((concern: string) => ({ id: concern })) || [];
    
  //   // Add subOptions for concerns that have them
  //   if (formData.skinConcerns?.moreConcerns) {
  //     skinConcerns.push({ id: "other", subOptions: [formData.skinConcerns.moreConcerns] });
  //   }

  //   const treatmentAreas = formData.treatmentAreas?.treatmentAreas || [];
  //   if (formData.treatmentAreas?.otherAreas) {
  //     treatmentAreas.push(formData.treatmentAreas.otherAreas);
  //   }

  //   const output = recommendTreatments({
  //     skinTypeId: formData.skinType || "combination",
  //     skinConcerns: skinConcerns,
  //     treatmentGoals: formData.goals || [],
  //     treatmentAreas: treatmentAreas,
  //     budgetRangeId: formData.budget || "1000-5000", 
  //     priorityId: formData.priorityOrder?.priorityOrder?.[0] || "effectiveness",
  //     pastTreatments: formData.pastTreatments?.pastTreatments || ["none"],
  //     medicalConditions: formData.healthConditions?.healthConditions || ["none"],
  //   });
  //   log.debug("=== Recommendation Output ===");
  //   log.debug(output);
  //   log.debug("=============================");
  // }, [formData]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl md:text-2xl font-bold text-center mb-4">
            {getLocalizedText(previewReport.dialogTitle, locale)}
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[70vh]">
          <div className="space-y-3 p-2">
            {preConsultationSteps.map((step) => (
              <Card key={step.id} className="p-1">
                <h3 className="text-base md:text-lg font-medium text-gray-900 mb-2">
                  {getLocalizedText(step.title, locale)}
                </h3>
                <div className="text-sm md:text-base text-gray-600">
                  {getStepSummary(step.id, formData[step.id])}
                </div>
              </Card>
            ))}
          </div>
        </ScrollArea>
        
        <div className="flex justify-end mt-4">
          <Button
            onClick={handleSubmit}
            disabled={!showSendFormButton}
            className="bg-gradient-to-r from-rose-400 to-pink-500 hover:from-rose-500 hover:to-pink-600 text-white"
          >
            {getLocalizedText(previewReport.submitButton, locale)}
          </Button>
        </div>
        
      </DialogContent>

      {/* Submission Modal */}
      <SubmissionModal
        open={isSubmissionModalOpen}
        onOpenChange={setIsSubmissionModalOpen}
        isSubmitting={isSubmitting}
        isCompleted={isCompleted}
        onComplete={handleSubmissionComplete}
      />
    </Dialog>
  );
};

export default PreviewReport;
