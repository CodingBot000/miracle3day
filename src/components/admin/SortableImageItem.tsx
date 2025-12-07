import { EXIST_IMAGE_URL, NEW_IMAGE_BASE64 } from '@/constants/common';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { log } from '@/utils/logger';
interface SortableImageItemProps {
  id: string;
  url: string;
  hideName?: boolean;
  disabled?: boolean; // ✅ Read Mode 지원
}

export default function SortableImageItem({ id, url, hideName, disabled = false }: SortableImageItemProps) {
  log.info('[SortableImageItem] id:', id);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({
    id,
    disabled // ✅ Read Mode에서 드래그 비활성화
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  // URL인지 base64 데이터인지 구분
  const isBase64 = url.startsWith('data:');
  const isUrl = url.startsWith('http');

  // 파일명 추출 (base64는 NEW_IMAGE_BASE64로 표시)
  const getFileName = () => {
    if (isBase64) {
      return NEW_IMAGE_BASE64;
    }
    if (isUrl) {
      return url.split('/').pop() || EXIST_IMAGE_URL;
    }
    return EXIST_IMAGE_URL;
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="border rounded p-2 bg-gray-50 flex flex-col items-center gap-2 cursor-move touch-none"
      {...attributes}
      {...listeners}
    >
      <img 
        src={url} 
        alt="" 
        className="w-32 h-24 object-cover rounded pointer-events-none" 
        draggable={false}
      />
      {!hideName && (
        <span className="text-xs text-gray-500 pointer-events-none">
          {getFileName()}
        </span>
      )}
    </div>
  );
} 