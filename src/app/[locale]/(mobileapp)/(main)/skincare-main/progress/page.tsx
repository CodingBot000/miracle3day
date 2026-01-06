'use client';

import { useEffect, useState, useRef } from 'react';
import { useNavigation } from '@/hooks/useNavigation';
import { ChevronLeft } from 'lucide-react';
import ProgressTab from '../components/ProgressTab';
import { mobileStorage, STORAGE_KEYS } from '@/lib/storage';

interface RoutineStep {
  id_uuid: string;
  step_order: number;
  step_type: string;
  step_name: string;
}

interface RoutineData {
  routine_uuid: string;
  id_uuid_member: string;
  morning_steps: RoutineStep[];
  midday_steps: RoutineStep[];
  evening_steps: RoutineStep[];
}

export default function ProgressPage() {
  const { navigate } = useNavigation();
  const hasFetched = useRef(false);

  const [routine, setRoutine] = useState<RoutineData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;

    const loadRoutine = async () => {
      try {
        // mobileStorage에서 캐시된 루틴 데이터 확인
        const cachedRoutine = mobileStorage.getRaw(STORAGE_KEYS.SKINCARE_ROUTINE_DATA);

        if (cachedRoutine) {
          setRoutine(JSON.parse(cachedRoutine));
          setLoading(false);
          return;
        }

        // 캐시 없으면 메인으로 리다이렉트
        navigate('/skincare-main', { replace: true });
      } catch (err) {
        console.error('[DEBUG] Failed to load routine:', err);
        navigate('/skincare-main', { replace: true });
      } finally {
        setLoading(false);
      }
    };

    loadRoutine();
  }, []);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!routine) {
    return null;
  }

  return (
    <>
      {/* 헤더 */}
      <div className="flex-shrink-0 bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3">
        <button
          onClick={() => navigate('/skincare-main')}
          className="p-1 -ml-1 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ChevronLeft className="w-6 h-6 text-gray-600" />
        </button>
        <h1 className="text-lg font-semibold text-gray-900">Progress</h1>
      </div>

      {/* 콘텐츠 */}
      <div className="flex-1 overflow-y-auto">
        <ProgressTab routine={routine} />
      </div>
    </>
  );
}
