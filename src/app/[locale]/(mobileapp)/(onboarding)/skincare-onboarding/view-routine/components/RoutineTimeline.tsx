'use client';

import RoutineStepCard from './RoutineStepCard';

interface RoutineStep {
  id_uuid: string;
  step_order: number;
  step_type: string;
  step_name: string;
  recommended_ingredients?: string[];
  recommendation_reason?: string;
}

interface RoutineTimelineProps {
  routine: {
    morning_steps: RoutineStep[];
    midday_steps: RoutineStep[];
    evening_steps: RoutineStep[];
  };
}

export default function RoutineTimeline({ routine }: RoutineTimelineProps) {
  return (
    <div className="space-y-12">
      {/* Morning */}
      <div>
        <div className="flex items-center gap-3 mb-6">
          <div className="text-4xl">🌅</div>
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Morning Routine</h2>
            <p className="text-sm text-gray-500">
              {routine.morning_steps.length} steps • Start your day fresh
            </p>
          </div>
        </div>
        <div className="space-y-4">
          {routine.morning_steps.map((step: RoutineStep, index: number) => (
            <RoutineStepCard
              key={step.id_uuid}
              step={step}
              index={index}
            />
          ))}
        </div>
      </div>

      {/* Midday */}
      <div>
        <div className="flex items-center gap-3 mb-6">
          <div className="text-4xl">☀️</div>
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Midday Touch-Up</h2>
            <p className="text-sm text-gray-500">
              {routine.midday_steps.length} steps • Quick refresh during lunch
            </p>
          </div>
        </div>
        <div className="p-4 bg-amber-50 rounded-lg border-2 border-amber-200 mb-4">
          <p className="text-sm text-amber-800">
            💡 <strong>Quick & Easy:</strong> Takes less than 3 minutes!
          </p>
        </div>
        <div className="space-y-4">
          {routine.midday_steps.map((step: RoutineStep, index: number) => (
            <RoutineStepCard
              key={step.id_uuid}
              step={step}
              index={index}
              isMidday={true}
            />
          ))}
        </div>
      </div>

      {/* Evening */}
      <div>
        <div className="flex items-center gap-3 mb-6">
          <div className="text-4xl">🌙</div>
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Evening Routine</h2>
            <p className="text-sm text-gray-500">
              {routine.evening_steps.length} steps • Repair and restore overnight
            </p>
          </div>
        </div>
        <div className="space-y-4">
          {routine.evening_steps.map((step: RoutineStep, index: number) => (
            <RoutineStepCard
              key={step.id_uuid}
              step={step}
              index={index}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
