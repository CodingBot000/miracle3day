'use client';

import { motion } from 'framer-motion';

interface RoutineStepCardProps {
  step: {
    step_order: number;
    step_type: string;
    step_name: string;
    recommended_ingredients?: string[];
    recommendation_reason?: string;
  };
  index: number;
  isMidday?: boolean;
}

const stepIcons: Record<string, string> = {
  cleanser: '🧼',
  toner: '💧',
  essence: '✨',
  serum: '💎',
  treatment: '🎯',
  eye_cream: '👁️',
  moisturizer: '🧴',
  sunscreen: '☀️',
  mask: '😷',
  exfoliant: '🔄',
  facial_oil: '🌿',
  blotting_paper: '📄',
  mist: '💦'
};

export default function RoutineStepCard({ step, index, isMidday }: RoutineStepCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      className={`
        relative flex gap-4 p-6 rounded-2xl shadow-md border transition-shadow
        ${isMidday
          ? 'bg-amber-50 border-amber-300 hover:shadow-lg hover:border-amber-400'
          : 'bg-white border-gray-200 hover:shadow-lg'
        }
      `}
    >
      <div className={`
        flex-shrink-0 w-12 h-12 flex items-center justify-center
        font-bold text-xl rounded-full
        ${isMidday ? 'bg-amber-200 text-amber-900' : 'bg-blue-100 text-blue-900'}
      `}>
        {step.step_order}
      </div>

      <div className="flex-1">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-2xl">{stepIcons[step.step_type] || '🧴'}</span>
          <h3 className="text-xl font-bold text-gray-900">{step.step_name}</h3>

          {isMidday && step.step_type === 'sunscreen' && (
            <span className="ml-2 px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full font-semibold">
              ESSENTIAL
            </span>
          )}
        </div>

        {step.recommendation_reason && (
          <p className="text-sm text-gray-600 mb-3">
            💡 {step.recommendation_reason}
          </p>
        )}

        {step.recommended_ingredients && step.recommended_ingredients.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {step.recommended_ingredients.map((ingredient: string) => (
              <span
                key={ingredient}
                className="px-3 py-1 bg-purple-50 text-purple-700 text-xs rounded-full font-medium"
              >
                {ingredient.replace(/_/g, ' ')}
              </span>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
