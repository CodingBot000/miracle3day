'use client';

import { motion } from 'framer-motion';

interface RoutineTypeCardProps {
  type: string;
  icon: string;
  title: string;
  description: string;
  steps: { morning: number; midday: number; evening: number };
  totalSteps: number;
  timeEstimate: string;
  features: string[];
  recommended: boolean;
  selected: boolean;
  onSelect: () => void;
  disabled?: boolean;
}

export default function RoutineTypeCard({
  icon, title, description, steps, totalSteps, timeEstimate,
  features, recommended, selected, onSelect, disabled
}: RoutineTypeCardProps) {
  return (
    <motion.div
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      className="relative"
    >
      <button
        onClick={onSelect}
        disabled={disabled}
        className={`
          w-full h-full p-6 rounded-2xl border-2 transition-all text-left
          ${selected ? 'border-blue-500 bg-blue-50 shadow-lg' : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-md'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          ${recommended ? 'ring-4 ring-purple-200' : ''}
        `}
      >
        {recommended && (
          <div className="absolute -top-3 right-4 px-4 py-1 bg-gradient-to-r from-purple-500 to-blue-500 text-white text-sm font-semibold rounded-full">
            ⭐ Recommended
          </div>
        )}

        <div className="text-5xl mb-4 text-center">{icon}</div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2 text-center">{title}</h3>
        <p className="text-sm text-gray-600 mb-4 text-center">{description}</p>

        <div className="flex justify-around mb-4 pb-4 border-b border-gray-200">
          <div className="text-center">
            <p className="text-xl font-bold text-blue-600">{steps.morning}</p>
            <p className="text-xs text-gray-500">🌅 Morning</p>
          </div>
          <div className="text-center">
            <p className="text-xl font-bold text-amber-600">{steps.midday}</p>
            <p className="text-xs text-gray-500">☀️ Midday</p>
          </div>
          <div className="text-center">
            <p className="text-xl font-bold text-purple-600">{steps.evening}</p>
            <p className="text-xs text-gray-500">🌙 Evening</p>
          </div>
        </div>

        <div className="flex justify-center gap-3 mb-4">
          <span className="inline-block px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-700">
            📋 {totalSteps} total steps
          </span>
          <span className="inline-block px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-700">
            ⏱️ {timeEstimate}
          </span>
        </div>

        <ul className="space-y-2 mb-6">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
              <span className="text-green-500 mt-0.5">✓</span>
              <span>{feature}</span>
            </li>
          ))}
        </ul>

        <div className={`mt-4 py-3 rounded-lg font-semibold text-center transition-colors ${selected ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
          {selected ? '✓ Selected' : 'Select This Routine'}
        </div>
      </button>
    </motion.div>
  );
}
