'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import { useNavigation } from '@/hooks/useNavigation';
import TodayTab from './components/TodayTab';
// import MyRoutineTab from './components/MyRoutineTab';
// import ProgressTab from './components/ProgressTab';
import { mobileStorage, STORAGE_KEYS } from '@/lib/storage';

type TabType = 'today';
// type TabType = 'today' | 'routine' | 'progress';

interface RoutineStep {
  id: number;
  step_order: number;
  step_type: string;
  step_name: string;
  recommended_ingredients: string[];
  recommendation_reason: string;
  usage_frequency: string;
  is_enabled: boolean;
}

interface RoutineData {
  routine_uuid: string;
  user_uuid: string;
  routine_type: 'basic' | 'intermediate' | 'advanced';
  routine_name: string;
  routine_description: string;
  morning_steps: RoutineStep[];
  midday_steps: RoutineStep[];
  evening_steps: RoutineStep[];
  total_steps: number;
  is_active: boolean;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

interface UserProfile {
  age_group: string;
  gender: string;
  skin_type: string;
  skin_concerns: string[];
  fitzpatrick_type: number;
  primary_goal: string;
  country_code: string;
}

interface ApiResponse {
  success: boolean;
  data?: {
    routine: RoutineData;
    user_profile: UserProfile | null;
  };
  error?: string;
  code?: string;
}

export default function SkincareMainPage() {
  const params = useParams();
  const locale = (params?.locale as string) || 'en';
  const { navigate } = useNavigation();
  const hasFetched = useRef(false);

  // const [activeTab, setActiveTab] = useState<TabType>('today');
  const [routine, setRoutine] = useState<RoutineData | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // 중복 호출 방지
    if (hasFetched.current) return;
    hasFetched.current = true;

    const loadRoutine = async () => {
      try {
        console.log('[DEBUG] 🔄 Loading routine...');

        // 1. mobileStorage에서 캐시된 루틴 데이터 먼저 확인
        const cachedRoutine = mobileStorage.getRaw(STORAGE_KEYS.SKINCARE_ROUTINE_DATA);
        const cachedProfile = mobileStorage.getRaw(STORAGE_KEYS.SKINCARE_USER_PROFILE);

        if (cachedRoutine) {
          console.log('[DEBUG] ✅ Found cached routine, using local data');
          const parsedRoutine = JSON.parse(cachedRoutine);
          const parsedProfile = cachedProfile ? JSON.parse(cachedProfile) : null;

          setRoutine(parsedRoutine);
          setUserProfile(parsedProfile);
          setLoading(false);
          return; // API 호출 안 함!
        }

        // 2. 캐시 없으면 user_uuid 확인
        console.log('[DEBUG] 📡 No cached data, fetching from API...');
        const stored = mobileStorage.getRaw(STORAGE_KEYS.SKINCARE_ONBOARDING_ANSWERS);

        if (!stored) {
          // 온보딩 안 한 사용자 → 리다이렉트 (replace로 히스토리 대체)
          navigate('/skincare-onboarding', { replace: true });
          return;
        }

        const { id_uuid } = JSON.parse(stored);

        if (!id_uuid) {
          navigate('/skincare-onboarding', { replace: true });
          return;
        }

        // 3. API 호출
        const response = await fetch(`/api/skincare/routines/user/${id_uuid}`, {
          credentials: 'include',
        });
        const result: ApiResponse = await response.json();

        if (!result.success || !result.data?.routine) {
          // 루틴 없음 → 온보딩으로 (replace로 히스토리 대체)
          navigate('/skincare-onboarding', { replace: true });
          return;
        }

        console.log('[DEBUG] ✅ API success, caching to mobileStorage');

        // 4. API 응답을 mobileStorage에 캐싱
        mobileStorage.setRaw(STORAGE_KEYS.SKINCARE_ROUTINE_DATA, JSON.stringify(result.data.routine));
        if (result.data.user_profile) {
          mobileStorage.setRaw(STORAGE_KEYS.SKINCARE_USER_PROFILE, JSON.stringify(result.data.user_profile));
        }

        setRoutine(result.data.routine);
        setUserProfile(result.data.user_profile);

      } catch (err) {
        console.error('[DEBUG] ❌ Failed to fetch routine:', err);
        setError('Failed to load routine');
      } finally {
        setLoading(false);
      }
    };

    loadRoutine();
  }, [locale]); // navigate 제거, hasFetched로 중복 방지

  // 로딩 상태
  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your routine...</p>
        </div>
      </div>
    );
  }

  // 에러 상태
  if (error || !routine) {
    return (
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Something went wrong'}</p>
          <button
            onClick={() => navigate('/skincare-onboarding')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold"
          >
            Go to Onboarding
          </button>
        </div>
      </div>
    );
  }

  // 탭 없이 TodayTab만 표시
  return (
    <div className="flex-1 overflow-y-auto">
      <TodayTab routine={routine} />
    </div>
  );

  /* 탭 시스템 (필요시 복구)
  return (
    <>
      <div className="flex-shrink-0 bg-white border-b border-gray-200 shadow-sm z-10">
        <div className="flex">
          <TabButton
            active={activeTab === 'today'}
            onClick={() => setActiveTab('today')}
          >
            Today
          </TabButton>
          <TabButton
            active={activeTab === 'routine'}
            onClick={() => setActiveTab('routine')}
          >
            My Routine
          </TabButton>
          <TabButton
            active={activeTab === 'progress'}
            onClick={() => setActiveTab('progress')}
          >
            Progress
          </TabButton>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {activeTab === 'today' && <TodayTab routine={routine} />}
        {activeTab === 'routine' && <MyRoutineTab routine={routine} userProfile={userProfile} />}
        {activeTab === 'progress' && <ProgressTab routine={routine} />}
      </div>
    </>
  );
  */
}

// 탭 버튼 컴포넌트
// function TabButton({
//   active,
//   onClick,
//   children
// }: {
//   active: boolean;
//   onClick: () => void;
//   children: React.ReactNode;
// }) {
//   return (
//     <button
//       onClick={onClick}
//       className={`
//         flex-1 py-3 text-sm font-semibold transition-colors
//         border-b-2
//         ${active
//           ? 'text-blue-600 border-blue-600'
//           : 'text-gray-500 border-transparent hover:text-gray-700'
//         }
//       `}
//     >
//       {children}
//     </button>
//   );
// }
