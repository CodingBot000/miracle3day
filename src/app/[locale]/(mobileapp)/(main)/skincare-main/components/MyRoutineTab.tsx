'use client';

interface RoutineStep {
  id_uuid: string;
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
  routine_type: 'basic' | 'intermediate' | 'advanced';
  routine_name: string;
  routine_description: string;
  morning_steps: RoutineStep[];
  midday_steps: RoutineStep[];
  evening_steps: RoutineStep[];
  total_steps: number;
  created_at: string;
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

interface MyRoutineTabProps {
  routine: RoutineData;
  userProfile: UserProfile | null;
}

export default function MyRoutineTab({ routine, userProfile }: MyRoutineTabProps) {
  return (
    <div className="p-4 space-y-6">
      {/* 루틴 헤더 */}
      <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg">
        <div className="flex items-center gap-2 mb-2">
          <h2 className="text-xl font-bold">{routine.routine_name}</h2>
          <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full capitalize">
            {routine.routine_type}
          </span>
        </div>
        <p className="text-sm opacity-90 mb-4">{routine.routine_description}</p>

        {userProfile && (
          <div className="bg-white/10 rounded-lg p-3 text-sm space-y-1">
            <p className="font-semibold opacity-70">Based on:</p>
            <p>• {userProfile.skin_type} skin</p>
            <p>• {userProfile.age_group}, {userProfile.gender}</p>
            {userProfile.skin_concerns && userProfile.skin_concerns.length > 0 && (
              <p>• Concerns: {userProfile.skin_concerns.slice(0, 2).join(', ')}</p>
            )}
          </div>
        )}

        <div className="flex gap-4 mt-4 text-sm">
          <div className="bg-white/10 rounded-lg px-3 py-2 text-center flex-1">
            <div className="font-bold text-lg">{routine.morning_steps.length}</div>
            <div className="opacity-70 text-xs">Morning</div>
          </div>
          <div className="bg-white/10 rounded-lg px-3 py-2 text-center flex-1">
            <div className="font-bold text-lg">{routine.midday_steps.length}</div>
            <div className="opacity-70 text-xs">Midday</div>
          </div>
          <div className="bg-white/10 rounded-lg px-3 py-2 text-center flex-1">
            <div className="font-bold text-lg">{routine.evening_steps.length}</div>
            <div className="opacity-70 text-xs">Evening</div>
          </div>
        </div>
      </div>

      {/* Morning */}
      <RoutineStepList
        title="Morning"
        icon="🌅"
        steps={routine.morning_steps}
        accentColor="text-yellow-600"
      />

      {/* Midday */}
      <RoutineStepList
        title="Midday"
        icon="☀️"
        steps={routine.midday_steps}
        accentColor="text-orange-600"
      />

      {/* Evening */}
      <RoutineStepList
        title="Evening"
        icon="🌙"
        steps={routine.evening_steps}
        accentColor="text-purple-600"
      />
    </div>
  );
}

// 스텝 리스트 컴포넌트
interface RoutineStepListProps {
  title: string;
  icon: string;
  steps: RoutineStep[];
  accentColor: string;
}

function RoutineStepList({ title, icon, steps, accentColor }: RoutineStepListProps) {
  if (steps.length === 0) {
    return null;
  }

  return (
    <div>
      <h3 className={`text-lg font-bold mb-3 flex items-center gap-2 ${accentColor}`}>
        <span>{icon}</span>
        {title}
        <span className="text-gray-400 font-normal text-sm">({steps.length} steps)</span>
      </h3>

      <div className="space-y-3">
        {steps.map((step, index) => (
          <div
            key={step.id_uuid}
            className="bg-white rounded-xl p-4 border-2 border-gray-200 shadow-sm"
          >
            {/* 스텝 번호와 이름 */}
            <div className="flex items-start mb-2">
              <span className="
                flex-shrink-0 w-6 h-6 rounded-full
                bg-blue-100 text-blue-600
                flex items-center justify-center
                text-xs font-bold mr-2
              ">
                {index + 1}
              </span>
              <div className="flex-1">
                <h4 className="font-bold text-gray-900">{step.step_name}</h4>
                <p className="text-sm text-gray-600 mt-0.5">{step.step_type}</p>
              </div>
            </div>

            {/* 추천 성분 */}
            {step.recommended_ingredients && step.recommended_ingredients.length > 0 && (
              <div className="flex items-start text-xs text-gray-600 mt-2">
                <span className="mr-1">💊</span>
                <span>{step.recommended_ingredients.join(', ')}</span>
              </div>
            )}

            {/* 추천 이유 */}
            {step.recommendation_reason && (
              <div className="flex items-start text-xs text-blue-600 mt-2 bg-blue-50 p-2 rounded">
                <span className="mr-1">💡</span>
                <span>{step.recommendation_reason}</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
