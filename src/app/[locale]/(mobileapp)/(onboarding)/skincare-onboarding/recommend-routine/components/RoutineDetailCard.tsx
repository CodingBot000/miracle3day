'use client';

import { RoutineData } from '../page';

interface RoutineDetailCardProps {
  routine: RoutineData | null;
  type: 'basic' | 'intermediate' | 'advanced';
  isSelected: boolean;
  onSelect: () => void;
  isLoading: boolean;
  isRecommended: boolean;
}

// 스켈레톤 로딩 컴포넌트
function SkeletonLoader() {
  return (
    <div className="animate-pulse">
      {/* 헤더 스켈레톤 */}
      <div className="p-4 bg-gray-100 rounded-t-xl">
        <div className="h-6 bg-gray-300 rounded w-2/3 mx-auto mb-2" />
        <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto" />
      </div>

      {/* 스텝 카운트 스켈레톤 */}
      <div className="flex justify-around p-4 border-b border-gray-100">
        {[1, 2, 3].map((i) => (
          <div key={i} className="text-center">
            <div className="h-8 w-8 bg-gray-200 rounded-full mx-auto mb-1" />
            <div className="h-3 w-12 bg-gray-200 rounded mx-auto" />
          </div>
        ))}
      </div>

      {/* 아침 루틴 스켈레톤 */}
      <div className="p-4 border-b border-gray-100">
        <div className="h-4 bg-gray-200 rounded w-24 mb-3" />
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-2">
              <div className="h-4 w-4 bg-gray-200 rounded-full" />
              <div className="flex-1 h-4 bg-gray-200 rounded" />
            </div>
          ))}
        </div>
      </div>

      {/* 점심 루틴 스켈레톤 */}
      <div className="p-4 border-b border-gray-100 bg-amber-50/50">
        <div className="h-4 bg-amber-200 rounded w-24 mb-3" />
        <div className="space-y-2">
          {[1, 2].map((i) => (
            <div key={i} className="flex gap-2">
              <div className="h-4 w-4 bg-amber-200 rounded-full" />
              <div className="flex-1 h-4 bg-amber-200 rounded" />
            </div>
          ))}
        </div>
      </div>

      {/* 저녁 루틴 스켈레톤 */}
      <div className="p-4">
        <div className="h-4 bg-gray-200 rounded w-24 mb-3" />
        <div className="space-y-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex gap-2">
              <div className="h-4 w-4 bg-gray-200 rounded-full" />
              <div className="flex-1 h-4 bg-gray-200 rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function RoutineDetailCard({
  routine,
  type,
  isSelected,
  onSelect,
  isLoading,
  isRecommended
}: RoutineDetailCardProps) {
  const typeLabels = {
    basic: { icon: '🌱', name: 'Basic' },
    intermediate: { icon: '✨', name: 'Intermediate' },
    advanced: { icon: '🚀', name: 'Advanced' }
  };

  const label = typeLabels[type];

  return (
    <div
      onClick={onSelect}
      className={`
        bg-white rounded-xl shadow-lg overflow-hidden cursor-pointer transition-all
        h-full flex flex-col
        ${isSelected
          ? 'border-3 border-blue-600 ring-4 ring-blue-100'
          : 'border-2 border-gray-200 hover:border-blue-300'
        }
      `}
    >
      {/* Recommended 배지 */}
      {isRecommended && (
        <div className="bg-gradient-to-r from-purple-500 to-blue-500 text-white text-xs font-semibold text-center py-1">
          ⭐ Recommended
        </div>
      )}

      {/* 스켈레톤 또는 실제 컨텐츠 */}
      {isLoading || !routine ? (
        <SkeletonLoader />
      ) : (
        <>
          {/* 헤더 */}
          <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50">
            <div className="flex items-center justify-center gap-2 mb-1">
              <span className="text-2xl">{label.icon}</span>
              <h3 className="text-lg font-bold text-gray-900">
                {isSelected && '✓ '}
                {routine.name}
              </h3>
            </div>
            <p className="text-sm text-gray-600 text-center">
              {routine.totalSteps} steps · {routine.estimatedTime}
            </p>
          </div>

          {/* 스텝 카운트 */}
          <div className="flex justify-around p-3 border-b border-gray-100">
            <div className="text-center">
              <p className="text-lg font-bold text-blue-600">{routine.morning.length}</p>
              <p className="text-xs text-gray-500">🌅 Morning</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-amber-600">{routine.midday.length}</p>
              <p className="text-xs text-gray-500">☀️ Midday</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-purple-600">{routine.evening.length}</p>
              <p className="text-xs text-gray-500">🌙 Evening</p>
            </div>
          </div>

          {/* 상세 루틴 (스크롤 가능) */}
          <div className="flex-1 overflow-y-auto">
            {/* 아침 루틴 */}
            <div className="p-3 border-b border-gray-100">
              <h4 className="text-xs font-semibold text-blue-700 mb-2 flex items-center gap-1">
                🌅 Morning Routine
              </h4>
              <div className="space-y-1">
                {routine.morning.map((step, index) => (
                  <div key={index} className="text-xs">
                    <p className="font-medium text-gray-800">
                      {step.order}. {step.name}
                    </p>
                    {step.reason && (
                      <p className="text-gray-500 ml-3 text-[10px]">{step.reason}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* 점심 루틴 */}
            <div className="p-3 border-b border-gray-100 bg-amber-50">
              <h4 className="text-xs font-semibold text-amber-800 mb-2 flex items-center gap-1">
                ☀️ Midday Touch-up
              </h4>
              <div className="space-y-1">
                {routine.midday.map((step, index) => (
                  <div key={index} className="text-xs">
                    <p className="font-medium text-gray-800">
                      {step.order}. {step.name}
                    </p>
                    {step.reason && (
                      <p className="text-gray-500 ml-3 text-[10px]">{step.reason}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* 저녁 루틴 */}
            <div className="p-3">
              <h4 className="text-xs font-semibold text-purple-700 mb-2 flex items-center gap-1">
                🌙 Evening Routine
              </h4>
              <div className="space-y-1">
                {routine.evening.map((step, index) => (
                  <div key={index} className="text-xs">
                    <p className="font-medium text-gray-800">
                      {step.order}. {step.name}
                    </p>
                    {step.reason && (
                      <p className="text-gray-500 ml-3 text-[10px]">{step.reason}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 선택 표시 */}
          <div className={`
            p-3 text-center font-semibold text-sm
            ${isSelected
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700'
            }
          `}>
            {isSelected ? '✓ Selected' : 'Tap to Select'}
          </div>
        </>
      )}
    </div>
  );
}
