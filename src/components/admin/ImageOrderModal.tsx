import { DndContext, closestCenter, DragOverlay, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, rectSortingStrategy } from '@dnd-kit/sortable';
import SortableImageItem from './SortableImageItem';
import { useState, useEffect } from 'react';
import { NEW_IMAGE_BASE64 } from '@/constants/common';
import { useFormMode } from '@/contexts/admin/FormModeContext';
import { log } from '@/utils/logger';

interface ImageOrderModalProps {
  images: string[];
  onCancel: () => void;
  onComplete: (newOrder: string[]) => void;
}

export default function ImageOrderModal({ images, onCancel, onComplete }: ImageOrderModalProps) {
  const { isReadMode } = useFormMode();
  const [items, setItems] = useState(images);
  const [activeId, setActiveId] = useState<string | null>(null);

  // 진단용 로그: items, activeId 상태 변화 추적
  useEffect(() => {
    log.info('[ImageOrderModal] items:', items);
  }, [items]);
  useEffect(() => {
    log.info('[ImageOrderModal] activeId:', activeId);
  }, [activeId]);

  // 센서 설정 (마우스, 터치)
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  // 팝업이 열릴 때 body 스크롤 막기
  useEffect(() => {
    const original = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = original;
    };
  }, []);

  const handleDragStart = (event: any) => {
    setActiveId(event.active.id);
    log.info('[ImageOrderModal] handleDragStart', event.active.id);
  };

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    setActiveId(null);
    log.info('[ImageOrderModal] handleDragEnd', { active: active.id, over: over?.id });
    if (active.id !== over?.id) {
      setItems((prev) => {
        const oldIndex = prev.indexOf(active.id);
        const newIndex = prev.indexOf(over.id);
        const moved = arrayMove(prev, oldIndex, newIndex);
        log.info('[ImageOrderModal] arrayMove', { oldIndex, newIndex, moved });
        return moved;
      });
    }
  };

  const handleDragCancel = () => {
    setActiveId(null);
    log.info('[ImageOrderModal] handleDragCancel');
  };

  // 팝업 바깥 클릭 시 이벤트 버블링 방지
  const handlePointerDown = (e: React.PointerEvent) => {
    e.stopPropagation();
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      style={{ zIndex: 9999, transform: 'none' }}
      onPointerDown={e => e.stopPropagation()}
    >
      <div
        className="bg-white rounded-lg p-4 w-[96vw] h-[92vh] flex flex-col"
        style={{
          maxWidth: '1600px',
          maxHeight: '960px',
          minWidth: '320px',
          minHeight: '320px',
          transform: 'none',
        }}
        onPointerDown={handlePointerDown}
      >
        <div className="flex justify-between items-center mb-4">
          <button onClick={onCancel} className="px-4 py-2 rounded bg-gray-100 hover:bg-gray-200">취소</button>
          <span className="font-bold text-lg">이미지 순서 변경 (드래그 앤 드롭) - 첫번째 이미지가 대표 이미지입니다. </span>
          <button onClick={() => onComplete(items)} className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700">완료</button>
        </div>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDragCancel={handleDragCancel}
          modifiers={[]}
        >
          <SortableContext items={items} strategy={rectSortingStrategy}>
            {/* <div
                className="grid grid-cols-3 gap-6 w-full p-4"
              style={{
                minHeight: 400,
                minWidth: 300,
                maxHeight: '100%',
                maxWidth: '100%',
                alignContent: 'flex-start',
              }}
            > */}
              {/* <div
              className="
                grid 
                [grid-template-columns:repeat(3,minmax(8rem,8rem))]
                gap-4
                mx-auto
                p-4
              "
              style={{
                alignContent: 'flex-start',
              }}
            > */}
              <div className="flex flex-col gap-4 w-full max-w-[600px] mx-auto overflow-auto p-4">

              {items.map((url) => (
                <SortableImageItem key={url} id={url} url={url} hideName disabled={isReadMode} />
              ))}
            </div>
          </SortableContext>
          <DragOverlay dropAnimation={null} style={{ zIndex: 99999, pointerEvents: 'none' }}>
            {activeId ? (
              <div className="border rounded p-2 bg-gray-50 flex flex-col items-center gap-2 opacity-80">
                <img 
                  src={activeId} 
                  alt="" 
                  className="w-32 h-24 object-cover rounded" 
                  draggable={false}
                />
                <span className="text-xs text-gray-500">
                  {activeId.startsWith('data:') ? NEW_IMAGE_BASE64 : activeId.split('/').pop()}
                </span>
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>
    </div>
  );
} 