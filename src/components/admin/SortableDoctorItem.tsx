import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { NEW_IMAGE_BASE64, EXIST_IMAGE_URL } from '@/constants/common';
import Image from 'next/image';
import { DoctorInfo } from './DoctorInfoForm';
import { log } from '@/utils/logger';
interface SortableDoctorItemProps {
  doctor: DoctorInfo;
  isDragOverlay?: boolean;
}

export default function SortableDoctorItem({ doctor, isDragOverlay = false }: SortableDoctorItemProps) {
  const { 
    attributes, 
    listeners, 
    setNodeRef, 
    transform, 
    transition, 
    isDragging 
  } = useSortable({ id: doctor.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  // 이미지 URL 결정
  const getImageUrl = () => {
    if (doctor.useDefaultImage) {
      return doctor.defaultImageType === 'woman' 
        ? '/admin/default/doctor_default_woman.png'
        : '/admin/default/doctor_default_man.png';
    }
    
    if (doctor.imagePreview) {
      return doctor.imagePreview;
    }
    
    if (doctor.originalImageUrl) {
      return doctor.originalImageUrl;
    }
    
    return '/admin/default/doctor_default_man.png';
  };

  // 이미지 타입 구분
  const getImageType = () => {
    const imageUrl = getImageUrl();
    
    if (imageUrl.startsWith('data:')) {
      return NEW_IMAGE_BASE64;
    }
    
    if (imageUrl.startsWith('http') || imageUrl.startsWith('/')) {
      return EXIST_IMAGE_URL;
    }
    
    return EXIST_IMAGE_URL;
  };

  const imageUrl = getImageUrl();
  const imageType = getImageType();

  log.info('[SortableDoctorItem]', {
    doctorId: doctor.id,
    doctorName: doctor.name,
    imageUrl: imageUrl.substring(0, 50) + (imageUrl.length > 50 ? '...' : ''),
    imageType
  });

  return (
    <div
      ref={!isDragOverlay ? setNodeRef : undefined}
      style={!isDragOverlay ? style : {}}
      className={`
        border rounded-lg p-3 bg-white flex items-center gap-4 
        ${!isDragOverlay ? 'cursor-move touch-none hover:shadow-md transition-shadow' : ''}
        ${isDragging ? 'shadow-lg' : 'shadow-sm'}
      `}
      {...(!isDragOverlay ? attributes : {})}
      {...(!isDragOverlay ? listeners : {})}
    >
      {/* 의사 사진 */}
      <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
        <Image
          src={imageUrl}
          alt={doctor.name}
          width={64}
          height={64}
          className="w-full h-full object-cover"
        />
      </div>

      {/* 의사 정보 */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="font-semibold text-gray-900 truncate">{doctor.name}</h3>
          {doctor.isChief && (
            <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full font-medium">
              대표원장
            </span>
          )}
        </div>
        
        {doctor.bio && (
          <p className="text-sm text-gray-600 line-clamp-2">{doctor.bio}</p>
        )}
        
        {/* 이미지 타입 표시 (개발용 - 나중에 제거 가능)  지우지마시오 */}
        {/* <div className="mt-1">
          <span className={`text-xs px-1 py-0.5 rounded ${
            imageType === NEW_IMAGE_BASE64 
              ? 'bg-orange-100 text-orange-700' 
              : 'bg-green-100 text-green-700'
          }`}>
            {imageType === NEW_IMAGE_BASE64 ? '새 이미지' : '기존 이미지'}
          </span>
        </div> */}
      </div>

      {/* 드래그 핸들 표시 */}
      {!isDragOverlay && (
        <div className="flex flex-col gap-1 text-gray-400 flex-shrink-0">
          <div className="w-1 h-1 bg-current rounded-full"></div>
          <div className="w-1 h-1 bg-current rounded-full"></div>
          <div className="w-1 h-1 bg-current rounded-full"></div>
          <div className="w-1 h-1 bg-current rounded-full"></div>
          <div className="w-1 h-1 bg-current rounded-full"></div>
          <div className="w-1 h-1 bg-current rounded-full"></div>
        </div>
      )}
    </div>
  );
} 