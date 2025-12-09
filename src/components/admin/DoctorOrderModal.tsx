import { DndContext, closestCenter, DragOverlay, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import SortableDoctorItem from './SortableDoctorItem';
import { useState, useEffect } from 'react';
import { DoctorInfo } from './DoctorInfoForm';
import { toast } from 'sonner';
import LoadingSpinner from './LoadingSpinner';
import { log } from '@/utils/logger';
interface DoctorOrderModalProps {
  doctors: DoctorInfo[];
  id_uuid_hospital: string;
  onCancel: () => void;
  onComplete: (newOrder: DoctorInfo[]) => void;
}

export default function DoctorOrderModal({ doctors, id_uuid_hospital, onCancel, onComplete }: DoctorOrderModalProps) {
  const [items, setItems] = useState(doctors);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // 진단용 로그: items, activeId 상태 변화 추적
  useEffect(() => {
    log.info('[DoctorOrderModal] items:', items);
  }, [items]);
  useEffect(() => {
    log.info('[DoctorOrderModal] activeId:', activeId);
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
    log.info('[DoctorOrderModal] handleDragStart', event.active.id);
  };

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    setActiveId(null);
    log.info('[DoctorOrderModal] handleDragEnd', { active: active.id, over: over?.id });
    if (active.id !== over?.id) {
      setItems((prev) => {
        const oldIndex = prev.findIndex(doctor => doctor.id === active.id);
        const newIndex = prev.findIndex(doctor => doctor.id === over.id);
        const moved = arrayMove(prev, oldIndex, newIndex);
        log.info('[DoctorOrderModal] arrayMove', { oldIndex, newIndex, moved });
        return moved;
      });
    }
  };

  const handleDragCancel = () => {
    setActiveId(null);
    log.info('[DoctorOrderModal] handleDragCancel');
  };

  // 팝업 바깥 클릭 시 이벤트 버블링 방지
  const handlePointerDown = (e: React.PointerEvent) => {
    e.stopPropagation();
  };

  // 현재 드래그 중인 의사 정보 찾기
  const activeDoctorInfo = activeId ? items.find(doctor => doctor.id === activeId) : null;

  // 완료 버튼 클릭: API로 순서 저장 후 부모 컴포넌트에 알림
  const handleComplete = async () => {
    try {
      setIsSaving(true);
      log.info('의사 순서 저장 시작:', {
        id_uuid_hospital,
        doctors: items.map((d, idx) => ({
          id_uuid: d.id,
          display_order: idx,
        })),
      });

      // display_order는 0부터 시작하는 배열의 인덱스
      const doctorsToUpdate = items.map((doctor, index) => ({
        id_uuid: doctor.id,
        display_order: index,
      }));

      const response = await fetch('/api/admin/doctors/reorder', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id_uuid_hospital,
          doctors: doctorsToUpdate,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || '의사 순서 저장에 실패했습니다');
      }

      log.info('의사 순서 저장 완료:', data);
      toast.success('의사 순서가 저장되었습니다');

      // 부모 컴포넌트에 새로운 순서 전달
      onComplete(items);

    } catch (error) {
      console.error('의사 순서 저장 실패:', error);
      toast.error(error instanceof Error ? error.message : '의사 순서 저장에 실패했습니다');
    } finally {
      setIsSaving(false);
    }
  };

  if (isSaving) {
    return <LoadingSpinner backdrop />;
  }

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      style={{ zIndex: 9999, transform: 'none' }}
      onPointerDown={e => e.stopPropagation()}
    >
      <div
        className="bg-white rounded-lg p-4 w-[90vw] h-[85vh] flex flex-col"
        style={{
          maxWidth: '800px',
          maxHeight: '700px',
          minWidth: '400px',
          minHeight: '400px',
          transform: 'none',
        }}
        onPointerDown={handlePointerDown}
      >
        <div className="flex justify-between items-center mb-4">
          <button onClick={onCancel} className="px-4 py-2 rounded bg-gray-100 hover:bg-gray-200">취소</button>
          <span className="font-bold text-lg">의사 순서 변경(드래그 앤 드랍)</span>
          <button
            onClick={handleComplete}
            disabled={isSaving}
            className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? '저장 중...' : '완료'}
          </button>
        </div>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDragCancel={handleDragCancel}
          modifiers={[]}
        >
          <SortableContext items={items.map(doctor => doctor.id)} strategy={verticalListSortingStrategy}>
            <div
              className="flex flex-col gap-3 w-full h-full overflow-auto p-2"
              style={{
                minHeight: 300,
                maxHeight: '100%',
              }}
            >
              {items.map((doctor) => (
                <SortableDoctorItem key={doctor.id} doctor={doctor} />
              ))}
            </div>
          </SortableContext>
          <DragOverlay dropAnimation={null} style={{ zIndex: 99999, pointerEvents: 'none' }}>
            {activeDoctorInfo ? (
              <div className="bg-white border rounded-lg p-3 shadow-lg opacity-90">
                <SortableDoctorItem doctor={activeDoctorInfo} isDragOverlay />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>
    </div>
  );
} 