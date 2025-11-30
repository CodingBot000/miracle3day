// import React, { useState, useEffect } from 'react';
// import { Label } from '@/components/ui/label';
// import { Card } from '@/components/ui/card';
// import { Textarea } from '@/components/ui/textarea';
// import { questions } from '@/content/estimate/form-definition';
// import {
//   DndContext,
//   closestCenter,
//   KeyboardSensor,
//   PointerSensor,
//   useSensor,
//   useSensors,
//   DragEndEvent
// } from '@dnd-kit/core';
// import {
//   arrayMove,
//   SortableContext,
//   useSortable,
//   sortableKeyboardCoordinates,
//   verticalListSortingStrategy,
// } from '@dnd-kit/sortable';
// import { SortableItem } from './SortableItem';

// interface PrioriotyFactorStepProps {
//   data: any;
//   onDataChange: (data: any) => void;
// }

// interface SortablePriorityItemProps {
//   priority: {
//     id: string;
//     label: string;
//     description: string;
//   };
//   isSelected: boolean;
//   onToggle: () => void;
//   index: number;
// }

// const SortablePriorityItem: React.FC<SortablePriorityItemProps> = ({ priority, isSelected, onToggle, index }) => {
//   const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: priority.id });

//   const style = {
//     transform: transform ? `translateY(${transform.y}px)` : undefined,
//     transition,
//   };

//   return (
//     <Card
//       ref={setNodeRef}
//       style={style}
//       {...attributes}
//       {...listeners}
//       className={`p-4 cursor-move transition-all duration-200 hover:shadow-md ${
//         isSelected ? 'border-rose-400 bg-rose-50 shadow-md' : 'border-gray-200 hover:border-rose-300'
//       }`}
//       onClick={onToggle}
//     >
//       <div className="flex items-center justify-between">
//         <div className="flex items-center space-x-3">
//           <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-rose-100 text-rose-600 font-semibold text-sm">
//             {index + 1}
//           </span>
//           <span className="font-medium text-gray-900">{priority.label}</span>
//         </div>
//         <div className="text-sm text-gray-500">
//           {isSelected && '✓'}
//         </div>
//       </div>
//       <p className="text-sm text-gray-600 mt-2 ml-9">{priority.description}</p>
//     </Card>
//   );
// };

// const PrioriotyFactorStepOld: React.FC<PrioriotyFactorStepProps> = ({ data, onDataChange }) => {
 
//   const priorityOrder = data.priorityOrder || { priorityOrder: [] };
//   const [priorityItems, setPriorityItems] = useState(questions.priorities);
//   const [isPriorityConfirmed, setIsPriorityConfirmed] = useState(true);
//   const [isDragging, setIsDragging] = useState(false);
  
//   const sensors = useSensors(
//     useSensor(PointerSensor, {
//       activationConstraint: {
//         distance: 8,
//       },
//     }),
//     useSensor(KeyboardSensor, {
//       coordinateGetter: sortableKeyboardCoordinates,
//     })
//   );

//   useEffect(() => {
//     if (isDragging) {
//       // 드래그 중일 때 body 스크롤 방지
//       document.body.style.overflow = 'hidden';
//       // 터치 이벤트 방지
//       document.body.style.touchAction = 'none';
//     } else {
//       // 드래그가 끝나면 원래대로 복구
//       document.body.style.overflow = '';
//       document.body.style.touchAction = '';
//     }

//     return () => {
//       document.body.style.overflow = '';
//       document.body.style.touchAction = '';
//     };
//   }, [isDragging]);

//   useEffect(() => {
//     // 초기 로드 시 저장된 순서와 확인 상태 복원
//     if (priorityOrder.priorityOrder && priorityOrder.priorityOrder.length > 0) {
//       const orderedItems = [...priorityItems].sort((a, b) => {
//         return priorityOrder.priorityOrder.indexOf(a.id) - priorityOrder.priorityOrder.indexOf(b.id);
//       });
//       setPriorityItems(orderedItems);
//     } else {
//       // 처음 로드 시 기본 순서로 데이터 저장
//       onDataChange({
//         ...data,
//         priorityOrder: {
//           isPriorityConfirmed: true,
//           priorityOrder: questions.priorities.map(item => item.id)
//         }
//       });
//     }
//   }, []);


//   const handleDragStart = () => {
//     setIsDragging(true);
//   };

//   const handleDragEnd = (event: DragEndEvent) => {
//     setIsDragging(false);
//     const { active, over } = event;
    
//     if (active.id !== over?.id) {
//       setPriorityItems((items) => {
//         const oldIndex = items.findIndex((item) => item.id === active.id);
//         const newIndex = items.findIndex((item) => item.id === over?.id);
        
//         const newItems = arrayMove(items, oldIndex, newIndex);
        
//         // 드래그 완료 시 즉시 새로운 순서를 저장
//         onDataChange({
//           ...data,
//           priorityOrder: {
//             isPriorityConfirmed: true,
//             priorityOrder: newItems.map(item => item.id)
//           }
//         });
        
//         return newItems;
//       });
//     }
//   };


//   return (
//     <div className="space-y-8">
//       {/* Priorities */}
//       <div>
        
//         <DndContext
//           sensors={sensors}
//           collisionDetection={closestCenter}
//           onDragStart={handleDragStart}
//           onDragEnd={handleDragEnd}
//         >
//           <SortableContext
//             items={priorityItems}
//             strategy={verticalListSortingStrategy}
//           >
//             <div className="space-y-2">
//               {priorityItems.map((item) => (
//                 <SortableItem key={item.id} id={item.id}>
//                   <Card className="p-4 bg-white">
//                     <div className="flex justify-between items-center">
//                       <div>
//                         <h3 className="font-medium text-gray-900">{item.label}</h3>
//                         <p className="text-sm text-gray-600">{item.description}</p>
//                       </div>
//                     </div>
//                   </Card>
//                 </SortableItem>
//               ))}
//             </div>
//           </SortableContext>
//         </DndContext>
//       </div>
//     </div>
//   );
// };

// export default PrioriotyFactorStepOld;
