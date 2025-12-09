import React, { useState } from 'react';
import Image from 'next/image';
import { Edit2, Trash2 } from 'lucide-react';

interface DoctorCardProps {
  doctor: {
    id: string;
    name: string;
    bio?: string;
    imagePreview?: string;
    isChief?: boolean;
  };
  mode?: 'preview' | 'edit';
  onEdit?: (doctor: any) => void;
  onDelete?: (doctorId: string) => void;
  onChiefChange?: (doctorId: string, isChief: boolean) => void;
  getValidImageUrl?: (url?: string) => string;
}

const DoctorCard: React.FC<DoctorCardProps> = ({
  doctor,
  mode = 'edit',
  onEdit,
  onDelete,
  onChiefChange,
  getValidImageUrl
}) => {
  const [imageError, setImageError] = useState(false);
  // 안전한 이미지 URL 생성 함수
  const getSafeImageUrl = (imageUrl?: string): string => {
    // 사용자 정의 함수가 있으면 먼저 사용
    if (getValidImageUrl) {
      try {
        const validUrl = getValidImageUrl(imageUrl);
        if (validUrl && validUrl.trim() !== '') {
          return validUrl;
        }
      } catch (error) {
        console.warn('getValidImageUrl 함수에서 오류 발생:', error);
      }
    }

    // 기본 검증 로직
    if (!imageUrl || imageUrl.trim() === '') {
      return '/admin/default/doctor_default_man.png';
    }

    try {
      // 상대 경로인 경우 (/, ./ 등으로 시작) 그대로 반환
      if (imageUrl.startsWith('/') || imageUrl.startsWith('./')) {
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

  const handleEditDoctor = () => {
    if (onEdit) {
      onEdit(doctor);
    }
  };

  const handleDeleteDoctor = () => {
    if (onDelete) {
      onDelete(doctor.id);
    }
  };

  const handleChiefChange = (checked: boolean) => {
    if (onChiefChange) {
      onChiefChange(doctor.id, checked);
    }
  };

  const safeImageUrl = imageError ? '/admin/default/doctor_default_man.png' : getSafeImageUrl(doctor.imagePreview);

  const handleImageError = () => {
    console.warn('이미지 로드 실패:', doctor.imagePreview);
    setImageError(true);
  };

  return (
    <div
      className='bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow'
      style={{ width: '150px' }}
    >
      {/* 카드 헤더 - 편집/삭제 버튼 (edit 모드에서만 표시) */}
      {mode === 'edit' && (
        <div className='flex justify-end gap-1 mb-3'>
          <button
            type='button'
            onClick={handleEditDoctor}
            className='p-1 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded transition-colors'
            title='편집'
          >
            <Edit2 size={16} />
          </button>
          <button
            type='button'
            onClick={handleDeleteDoctor}
            className='p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors'
            title='삭제'
          >
            <Trash2 size={16} />
          </button>
        </div>
      )}

      {/* 프로필 이미지 */}
      <div className='flex justify-center mb-3'>
        <div className='w-20 h-20 rounded-full overflow-hidden bg-gray-100 border-2 border-gray-200'>
          <Image
            src={safeImageUrl}
            alt={doctor.name}
            width={80}
            height={80}
            className='object-cover w-full h-full'
            onError={handleImageError}
            unoptimized={imageError} // 기본 이미지는 최적화 비활성화
          />
        </div>
      </div>

      {/* 이름 */}
      <h3 className='text-center font-medium text-gray-900 mb-2'>
        {doctor.name}
      </h3>

      {/* 소개 */}
      {doctor.bio && (
        <p className='text-xs text-gray-600 text-center mb-3 line-clamp-3 whitespace-pre-wrap'>
          {doctor.bio}
        </p>
      )}

      {/* 대표원장 표시 */}
      {mode === 'edit' ? (
        // Edit 모드: 체크박스
        <div className='flex justify-center'>
          <label className='flex items-center gap-2 cursor-pointer'>
            <input
              type='checkbox'
              checked={doctor.isChief || false}
              onChange={(e) => handleChiefChange(e.target.checked)}
              className='w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500'
            />
            <span className='text-sm text-gray-700'>
              대표원장
            </span>
          </label>
        </div>
      ) : (
        // Preview 모드: 대표원장인 경우만 표시
        doctor.isChief && (
          <div className='flex justify-center'>
            <span className='px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded font-medium'>
              대표원장
            </span>
          </div>
        )
      )}
    </div>
  );
};

export default DoctorCard; 