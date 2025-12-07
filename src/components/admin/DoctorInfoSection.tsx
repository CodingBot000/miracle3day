'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Edit2, Trash2, Plus } from 'lucide-react';
import DoctorInfoForm, {
  DoctorInfo,
} from './DoctorInfoForm';
import DoctorOrderModal from './DoctorOrderModal';
import DoctorCard from './DoctorCard';
import { log } from '@/utils/logger';

interface DoctorInfoSectionProps {
  title: string;
  description?: string;
  onDoctorsChange: (doctors: DoctorInfo[]) => void;
  initialDoctors?: DoctorInfo[];
  id_uuid_hospital?: string;
  onUserChanged?: (kind: 'doctors:addOrDelete' | 'doctors:reorder' | 'doctors:text' | 'doctors:photo') => void;
}

// 안전한 이미지 URL 검증 함수
const getValidImageUrl = (imageUrl?: string): string => {
  if (!imageUrl || imageUrl.trim() === '') {
    return '/admin/default/doctor_default_man.png';
  }

  try {
    // 상대 경로인 경우 (/, ./ 등으로 시작) 그대로 반환
    if (
      imageUrl.startsWith('/') ||
      imageUrl.startsWith('./')
    ) {
      return imageUrl;
    }

    // 절대 URL인 경우 유효성 검증
    new URL(imageUrl);
    return imageUrl;
  } catch {
    // 유효하지 않은 URL인 경우 기본 이미지 반환
    console.warn('Invalid image URL:', imageUrl);
    return '/admin/default/doctor_default_man.png';
  }
};

const DoctorInfoSection: React.FC<
  DoctorInfoSectionProps
> = ({
  title,
  description,
  onDoctorsChange,
  initialDoctors,
  id_uuid_hospital = '',
  onUserChanged,
}) => {
  const [doctors, setDoctors] = useState<DoctorInfo[]>(
    initialDoctors || [],
  );
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState<
    DoctorInfo | undefined
  >(undefined);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  
  // 렌더링 시점 디버깅
  log.info('DoctorInfoSection 렌더링:', {
    받은initialDoctors: initialDoctors?.length || 0,
    현재doctors: doctors.length,
    initialDoctorsData: initialDoctors,
    현재doctorsData: doctors,
  });

  // props 변경 시 상태 업데이트
  useEffect(() => {
    if (
      initialDoctors &&
      initialDoctors.length > 0 &&
      JSON.stringify(initialDoctors) !==
        JSON.stringify(doctors)
    ) {
      // 기존 이미지 정보 보존
      const doctorsWithImageInfo = initialDoctors.map(doctor => ({
        ...doctor,
        isExistingImage: true,
        originalImageUrl: doctor.imagePreview,
      }));
      setDoctors(doctorsWithImageInfo);
      log.info(
        'DoctorInfoSection 초기값 설정 완료:',
        doctorsWithImageInfo.length,
        '명',
      );
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialDoctors]);

  // 부모 컴포넌트에 의사 데이터 전달
  useEffect(() => {
    onDoctorsChange(doctors);
  }, [doctors, onDoctorsChange]);

  // 의사 추가/수정
  const handleSaveDoctor = (doctorInfo: DoctorInfo) => {
    if (editingDoctor) {
      // 수정
      setDoctors((prev) =>
        prev.map((doctor) =>
          doctor.id === doctorInfo.id ? doctorInfo : doctor,
        ),
      );
    } else {
      // 추가 - Dirty Flag
      setDoctors((prev) => [...prev, doctorInfo]);
      onUserChanged?.('doctors:addOrDelete');
    }

    setEditingDoctor(undefined);
  };

  // 의사 삭제
  const handleDeleteDoctor = (id: string) => {
    if (confirm('정말 삭제하시겠습니까?')) {
      setDoctors((prev) =>
        prev.filter((doctor) => doctor.id !== id),
      );
      // Dirty Flag: 의사 삭제
      onUserChanged?.('doctors:addOrDelete');
    }
  };

  // 의사 편집
  const handleEditDoctor = (doctor: DoctorInfo) => {
    setEditingDoctor(doctor);
    setIsFormOpen(true);
  };

  // 대표원장 체크박스 변경
  const handleChiefChange = (
    id: string,
    isChief: boolean,
  ) => {
    setDoctors((prev) =>
      prev.map((doctor) =>
        doctor.id === id ? { ...doctor, isChief } : doctor,
      ),
    );
  };

  // 새 의사 추가
  const handleAddNew = () => {
    setEditingDoctor(undefined);
    setIsFormOpen(true);
  };

  // 폼 닫기
  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingDoctor(undefined);
  };

  // 순서변경 완료 핸들러
  const handleOrderModalComplete = (newOrder: DoctorInfo[]) => {
    setDoctors(newOrder);
    setIsOrderModalOpen(false);

    // Dirty Flag: 의사 순서변경
    onUserChanged?.('doctors:reorder');
  };

  return (
    <div className='w-full'>
      {/* 헤더 */}
      <div className='flex justify-between items-start my-4'>
        <div>
          <h2 className='font-semibold text-lg mb-2'>
            {title}
          </h2>
          {description && (
            <div className='text-sm text-gray-600 whitespace-pre-line'>
              {description}
            </div>
          )}
        </div>
        <div className='flex flex-col items-end gap-2'>
          <p className='text-sm text-gray-600'>
            등록 {doctors.length}명
          </p>
          <button
            type='button'
            onClick={handleAddNew}
            className='flex items-center gap-2 px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors'
          >
            <Plus size={16} />
            추가
          </button>
        </div>
      </div>

      <span className="text-xs">
            <button
              className="mt-2 px-3 py-1 border rounded text-sm text-black bg-orange-100 hover:bg-gray-200 transition-colors"
              onClick={() => setIsOrderModalOpen(true)}
            >
              순서변경
            </button>

            <span className="ml-2 text-red-500 font-bold">
              순서변경 혹은 이미지 추가 후 반드시 하단에 &apos;save and next&apos; 버튼을 눌러야 반영됩니다.
            </span>
          </span>
      {/* 의사 카드 목록 */}
      {doctors.length > 0 ? (
        <div className='flex flex-wrap gap-4'>
          {doctors.map((doctor) => (
            <DoctorCard
              key={doctor.id}
              doctor={doctor}
              mode='edit'
              onEdit={handleEditDoctor}
              onDelete={handleDeleteDoctor}
              onChiefChange={handleChiefChange}
              getValidImageUrl={getValidImageUrl}
            />
          ))}
        </div>
      ) : (
        /* 빈 상태 */
        <div className='border-2 border-dashed border-gray-300 rounded-lg p-8 text-center'>
          <div className='flex flex-col items-center space-y-3'>
            <div className='w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center'>
              <Plus className='w-8 h-8 text-gray-400' 
                 onClick={handleAddNew}/>
            </div>
            <div>
              <p className='text-gray-600 font-medium'>
                등록된 의사가 없습니다
              </p>
              <p className='text-sm text-gray-500 mt-1'>
                &quot;추가&quot; 버튼을 눌러서 의사 정보를
                등록해보세요
              </p>
            </div>
            {/* <button
              type='button'
              onClick={handleAddNew}
              className='mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors'
            >
              의사 추가하기
            </button> */}
          </div>
        </div>
      )}

      {/* 의사 정보 폼 모달 */}
      <DoctorInfoForm
        open={isFormOpen}
        initialData={editingDoctor}
        onClose={handleCloseForm}
        onSave={handleSaveDoctor}
        onUserChanged={(kind) => {
          if (kind === 'doctors:text') onUserChanged?.('doctors:text');
          if (kind === 'doctors:photo') onUserChanged?.('doctors:photo');
        }}
      />

      {/* 의사 순서변경 모달 */}
      {isOrderModalOpen && (
        <DoctorOrderModal
          doctors={doctors}
          id_uuid_hospital={id_uuid_hospital}
          onCancel={() => setIsOrderModalOpen(false)}
          onComplete={handleOrderModalComplete}
        />
      )}
    </div>
  );
};

export default DoctorInfoSection;
