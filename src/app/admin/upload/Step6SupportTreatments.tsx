'use client';

import { useState, useEffect } from 'react';
import PageBottom from '@/components/admin/PageBottom';
import SupportTreatment from '@/components/admin/SupportTreatment';
import SupportDevices from '@/components/admin/SupportDevices';
import PreviewModal from '@/components/template/modal/PreviewModal';
import SupportTreatmentFeedbackModal from '@/components/template/modal/SupportTreatmentFeedbackModal';
import { SKIN_BEAUTY_CATEGORIES } from '@/content/admin/skinBeautyCategories';
import { PLASTIC_SURGERY_CATEGORIES } from '@/content/admin/plasticSurgeryCategories';
import { CategoryNodeTag } from '@/models/admin/category';
import { MainTabType } from '@/models/admin/common';
import { useFormMode } from '@/contexts/admin/FormModeContext';
import { log } from "@/utils/logger";

interface Step6SupportTreatmentsProps {
  id_uuid_hospital: string;
  id_admin: string;
  isEditMode?: boolean;
  onPrev: () => void;
  onNext: () => void;
}

const Step6SupportTreatments = ({
  id_uuid_hospital,
  id_admin,
  isEditMode = false,
  onPrev,
  onNext,
}: Step6SupportTreatmentsProps) => {
  const { isReadMode } = useFormMode();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeMainTab, setActiveMainTab] = useState<MainTabType>('treatment');
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);

  // 제공시술 데이터
  const [selectedSkinTreatments, setSelectedSkinTreatments] = useState<Set<string>>(new Set());
  const [selectedPlasticTreatments, setSelectedPlasticTreatments] = useState<Set<string>>(new Set());

  // 보유장비 데이터
  const [selectedDevices, setSelectedDevices] = useState<Set<string>>(new Set());

  // 피드백 데이터
  const [feedbackContent, setFeedbackContent] = useState<string>('');

  // 제공시술 데이터 변경 핸들러
  const handleTreatmentDataChange = (skinItems: Set<string>, plasticItems: Set<string>) => {
    setSelectedSkinTreatments(skinItems);
    setSelectedPlasticTreatments(plasticItems);
  };

  // 보유장비 데이터 변경 핸들러
  const handleDeviceDataChange = (devices: Set<string>) => {
    setSelectedDevices(devices);
  };

  // UID에서 ID를 추출하는 헬퍼 함수
  const extractIdsFromUids = (uids: Set<string>, type: 'skin' | 'plastic'): string[] => {
    const categoriesData = type === 'skin' ? SKIN_BEAUTY_CATEGORIES : PLASTIC_SURGERY_CATEGORIES;
    const ids: string[] = [];

    uids.forEach(uid => {
      const [, ...pathParts] = uid.split('/'); // Remove type prefix
      let currentNode: CategoryNodeTag | undefined;

      for (let i = 0; i < pathParts.length; i++) {
        const key = pathParts[i];
        if (i === 0) {
          currentNode = categoriesData.find(cat => cat.key === key);
        } else {
          currentNode = currentNode?.children?.find(child => child.key === key);
        }
        if (!currentNode) break;
      }

      if (currentNode) {
        ids.push(currentNode.id);
      }
    });

    return ids;
  };

  // ID에서 UID를 생성하는 헬퍼 함수 (역변환)
  const convertIdsToUids = (ids: string[], type: 'skin' | 'plastic'): Set<string> => {
    const categoriesData = type === 'skin' ? SKIN_BEAUTY_CATEGORIES : PLASTIC_SURGERY_CATEGORIES;
    const uids = new Set<string>();

    // ID로 노드를 찾는 재귀 함수
    const findNodeById = (id: string, nodes: CategoryNodeTag[], path: string[] = []): string | null => {
      for (const node of nodes) {
        const currentPath = [...path, node.key];

        if (node.id === id) {
          return `${type}/${currentPath.join('/')}`;
        }

        if (node.children) {
          const result = findNodeById(id, node.children, currentPath);
          if (result) return result;
        }
      }
      return null;
    };

    ids.forEach(id => {
      const uid = findNodeById(id, categoriesData);
      if (uid) {
        uids.add(uid);
      }
    });

    return uids;
  };

  // 컴포넌트 마운트 시 저장된 데이터 로드
  useEffect(() => {
    const loadSavedData = async () => {
      try {
        setIsLoading(true);

        // 1. 선택된 시술/장비 데이터 로드
        const response = await fetch(`/api/admin/upload/step6?id_uuid_hospital=${id_uuid_hospital}`);

        if (response.ok) {
          const data = await response.json();
          console.log('로드된 데이터:', data);

          // ID를 UID로 변환하여 상태 설정
          const skinUids = convertIdsToUids(data.skinTreatmentIds || [], 'skin');
          const plasticUids = convertIdsToUids(data.plasticTreatmentIds || [], 'plastic');
          const deviceIds = new Set<string>(data.deviceIds || []);

          setSelectedSkinTreatments(skinUids);
          setSelectedPlasticTreatments(plasticUids);
          setSelectedDevices(deviceIds);

          console.log('변환된 UID - Skin:', Array.from(skinUids));
          console.log('변환된 UID - Plastic:', Array.from(plasticUids));
          console.log('Device IDs:', Array.from(deviceIds));
        } else {
          console.log('저장된 데이터가 없습니다.');
        }

        // 2. 피드백 데이터 로드
        const feedbackResponse = await fetch(`/api/admin/upload/step6/feedback?id_uuid_hospital=${id_uuid_hospital}`);

        if (feedbackResponse.ok) {
          const feedbackData = await feedbackResponse.json();
          console.log('로드된 피드백:', feedbackData);
          setFeedbackContent(feedbackData.feedback_content || '');
        } else {
          console.log('저장된 피드백이 없습니다.');
        }
      } catch (error) {
        console.error('데이터 로드 중 오류:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (id_uuid_hospital) {
      loadSavedData();
    }
  }, [id_uuid_hospital]);

  const handleSave = async () => {
    log.info('Step6 handleSave 시작');

    try {
      // UID에서 ID 추출
      const skinTreatmentIds = extractIdsFromUids(selectedSkinTreatments, 'skin');
      const plasticTreatmentIds = extractIdsFromUids(selectedPlasticTreatments, 'plastic');

      // Device는 이미 ID로 저장되어 있음
      const deviceIds = Array.from(selectedDevices);

      // 데이터가 없으면 성공으로 간주하고 통과
      if (skinTreatmentIds.length === 0 && plasticTreatmentIds.length === 0 && deviceIds.length === 0) {
        log.info('Step6 - 선택된 데이터가 없어 저장을 건너뜁니다.');
        return {
          status: 'success',
          message: '저장할 데이터가 없습니다.'
        };
      }

      console.log('=== 제공시술 (ID로 저장) ===');
      console.log('Skin Treatment IDs:', skinTreatmentIds);
      console.log('Plastic Treatment IDs:', plasticTreatmentIds);
      console.log('=== 보유장비 (ID로 저장) ===');
      console.log('Device IDs:', deviceIds);

      // API 호출
      const response = await fetch('/api/admin/upload/step6', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id_uuid_hospital,
          skinTreatmentIds,
          plasticTreatmentIds,
          deviceIds,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        const errorMessage = result.message || '저장에 실패했습니다.';
        console.error('저장 실패:', errorMessage);
        alert(errorMessage);
        return {
          status: 'error',
          message: errorMessage
        };
      }

      console.log('저장 성공:', result);
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '저장 중 오류가 발생했습니다.';
      console.error('저장 중 오류:', error);
      alert(errorMessage);
      return {
        status: 'error',
        message: errorMessage
      };
    }
  };

  const handleNext = async () => {
    log.info('handleNext Step6');
    if (isReadMode) {
      onNext();
      return;
    }
    setIsSubmitting(true);
    const result = await handleSave();
    setIsSubmitting(false);
    document.body.style.overflow = '';

    if (result?.status === 'success') {
      log.info('handleNext Step6 handleSave success');
      onNext();
    } else {
      log.info('handleNext Step6 handleSave error:', result);
    }
  };

  return (
    <main className="min-h-screen flex flex-col p-6">
      {/* 공통 타이틀 */}
      <h1 className="text-2xl font-bold mb-2">시술/보유장비 선택</h1>
      <span className="text-md text-red-500 font-base mb-6">
        선택하는 시술과 보유장비는 병원정보에 보여지며 검색등 병원 노출을 위해 다양한 용도로 활용됩니다.
        <br />  도웅말: 예를들어 얼굴 / 필러 / 이하부위 의 대부분의 부위가 가능하고 표현이 애매한것이 한두개라면 그냥 전체체크하시면 됩니다.
        <br />  입력하신 내용은 언제든지 변경가능하지만, 변경사항에 대해 고지해주셔야 빠르게 반영됩니다.
      </span>

      {/* 메인 탭 (제공시술 / 보유장비) */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveMainTab('treatment')}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
              activeMainTab === 'treatment'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            제공시술
          </button>
          <button
            onClick={() => setActiveMainTab('device')}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
              activeMainTab === 'device'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            보유장비
          </button>
        </div>

        <div className="flex gap-2">
          {/* 피드백 버튼 */}
          <button
            onClick={() => setIsFeedbackOpen(true)}
            className="px-6 py-2 rounded-lg font-medium bg-orange-600 text-white hover:bg-orange-700 transition-colors flex items-center gap-2"
            data-allow-interact
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
            피드백
          </button>

          {/* 미리보기 버튼 */}
          <button
            onClick={() => setIsPreviewOpen(true)}
            className="px-6 py-2 rounded-lg font-medium bg-green-600 text-white hover:bg-green-700 transition-colors flex items-center gap-2"
            data-allow-interact
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            미리보기
          </button>
        </div>
      </div>

      {/* 컨텐츠 영역 */}
      {isLoading ? (
        <div className="flex items-center justify-center flex-1">
          <div className="text-gray-500">데이터를 불러오는 중...</div>
        </div>
      ) : (
        <>
          <div className={activeMainTab === 'treatment' ? 'flex flex-col flex-1' : 'hidden'}>
            <SupportTreatment
              onDataChange={handleTreatmentDataChange}
              initialSkinItems={selectedSkinTreatments}
              initialPlasticItems={selectedPlasticTreatments}
            />
          </div>

          <div className={activeMainTab === 'device' ? 'flex flex-col flex-1' : 'hidden'}>
            <SupportDevices
              onDataChange={handleDeviceDataChange}
              initialDevices={selectedDevices}
            />
          </div>
        </>
      )}

      {/* 하단 버튼 */}
      <PageBottom step={6} isSubmitting={isSubmitting} onDraftSave={handleSave} onNext={handleNext} onPrev={onPrev} />

      {/* 미리보기 모달 */}
      <PreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        selectedSkinTreatments={selectedSkinTreatments}
        selectedPlasticTreatments={selectedPlasticTreatments}
        selectedDevices={selectedDevices}
      />

      {/* 피드백 모달 */}
      <SupportTreatmentFeedbackModal
        isOpen={isFeedbackOpen}
        onClose={() => setIsFeedbackOpen(false)}
        id_uuid_hospital={id_uuid_hospital}
        initialFeedback={feedbackContent}
        onFeedbackSaved={(newFeedback) => setFeedbackContent(newFeedback)}
      />
    </main>
  );
};

export default Step6SupportTreatments;
