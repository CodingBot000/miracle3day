'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useNavigation } from '@/hooks/useNavigation';
import RoutineTimeline from './components/RoutineTimeline';

interface RoutineStep {
  id_uuid: string;
  step_order: number;
  step_type: string;
  step_name: string;
  recommended_ingredients?: string[];
  recommendation_reason?: string;
}

interface RoutineData {
  routine_name: string;
  routine_description: string;
  routine_type: string;
  morning_steps: RoutineStep[];
  midday_steps: RoutineStep[];
  evening_steps: RoutineStep[];
}

function ViewRoutineContent() {
  const searchParams = useSearchParams();
  const { navigate } = useNavigation();

  const routine_uuid = searchParams.get('routine_uuid');
  const [routine, setRoutine] = useState<RoutineData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (routine_uuid) {
      fetchRoutine(routine_uuid);
    } else {
      setError('Routine UUID not provided');
      setLoading(false);
    }
  }, [routine_uuid]);

  const fetchRoutine = async (uuid: string) => {
    try {
      const response = await fetch(`/api/skincare/routines/${uuid}`, {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch routine');
      }

      const data = await response.json();
      setRoutine(data);
    } catch (err) {
      console.error('Error fetching routine:', err);
      setError('Failed to load routine');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mb-4"></div>
        <p className="text-gray-600">Loading your routine...</p>
      </div>
    );
  }

  if (error || !routine) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
        <div className="text-6xl mb-4">😕</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Oops!</h1>
        <p className="text-gray-600 mb-6">{error || 'Routine not found'}</p>
        <button
          onClick={() => navigate('/skincare-onboarding/recommend-routine')}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Choose Another Routine
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
      <div className="max-w-4xl mx-auto py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            {routine.routine_name}
          </h1>
          <p className="text-lg text-gray-600 mb-4">
            {routine.routine_description}
          </p>
          <span className="inline-block px-4 py-2 bg-blue-100 text-blue-800 rounded-full font-semibold">
            {routine.routine_type.charAt(0).toUpperCase() + routine.routine_type.slice(1)} Routine
          </span>

          <div className="flex justify-center gap-6 mt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-blue-600">
                {routine.morning_steps.length}
              </p>
              <p className="text-sm text-gray-500">🌅 Morning</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-amber-600">
                {routine.midday_steps.length}
              </p>
              <p className="text-sm text-gray-500">☀️ Midday</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-purple-600">
                {routine.evening_steps.length}
              </p>
              <p className="text-sm text-gray-500">🌙 Evening</p>
            </div>
          </div>
        </div>

        <RoutineTimeline routine={routine} />

        <div className="mt-12 flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => navigate('/skincare-main', { replace: true })}
            className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            ✓ Start Using This Routine
          </button>
          <button
            onClick={() => navigate('/skincare-onboarding/recommend-routine')}
            className="px-8 py-3 bg-white text-gray-700 border-2 border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
          >
            Choose Different Routine
          </button>
        </div>

        <div className="mt-8 p-6 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-gray-900 mb-2">💡 Tips for Success</h3>
          <ul className="space-y-2 text-sm text-gray-700">
            <li>• Consistency is key - follow your routine daily</li>
            <li>• Midday touch-up takes less than 3 minutes</li>
            <li className="text-red-600 font-bold text-base bg-red-50 px-3 py-2 rounded-lg border border-red-200">
              ⚠️ Even after confirming this routine, you can change the entire routine or modify individual routine items at any time.
            </li>
            <li>• Track your progress over time</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default function ViewRoutinePage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mb-4"></div>
        <p className="text-gray-600">Loading...</p>
      </div>
    }>
      <ViewRoutineContent />
    </Suspense>
  );
}
