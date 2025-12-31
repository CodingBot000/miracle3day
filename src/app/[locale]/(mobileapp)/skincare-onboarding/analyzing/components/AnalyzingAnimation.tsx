'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface AnalyzingAnimationProps {
  progress: number;
}

const getUserData = () => {
  if (typeof window === 'undefined') return {};
  const stored = localStorage.getItem('skincare_onboarding_answers');
  return stored ? JSON.parse(stored) : {};
};

export default function AnalyzingAnimation({ progress }: AnalyzingAnimationProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [userData, setUserData] = useState<Record<string, unknown>>({});

  useEffect(() => {
    setUserData(getUserData());
  }, []);

  const analysisSteps = [
    {
      key: 'age',
      icon: '👤',
      message: 'Analyzing your demographics...',
      data: `Age: ${userData.age_group || 'N/A'}, Gender: ${userData.gender || 'N/A'}`
    },
    {
      key: 'location',
      icon: '🌍',
      message: 'Checking your local climate...',
      data: `${userData.city || 'N/A'}, ${userData.country_code || 'N/A'}`
    },
    {
      key: 'skin',
      icon: '✨',
      message: 'Evaluating your skin profile...',
      data: `${userData.skin_type || 'N/A'} skin, Type ${userData.fitzpatrick_type || 'N/A'}`
    },
    {
      key: 'climate',
      icon: '☀️',
      message: 'Calculating UV & humidity...',
      data: 'Climate analysis in progress...'
    },
    {
      key: 'concerns',
      icon: '🎯',
      message: 'Prioritizing your skin concerns...',
      data: `Goal: ${userData.primary_goal || 'N/A'}`
    },
    {
      key: 'routine',
      icon: '🧴',
      message: 'Generating your routine...',
      data: 'Creating morning, midday & evening steps'
    }
  ];

  useEffect(() => {
    const currentIndex = Math.floor((progress / 100) * analysisSteps.length);
    setCurrentStep(Math.min(currentIndex, analysisSteps.length - 1));
  }, [progress, analysisSteps.length]);

  return (
    <div className="w-full max-w-md mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Creating Your Perfect Routine
        </h1>
        <p className="text-gray-600">
          AI is analyzing your skin profile...
        </p>
      </motion.div>

      <motion.div
        className="flex justify-center mb-8"
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
      >
        <div className="w-24 h-24 rounded-full border-8 border-blue-200 border-t-blue-600"></div>
      </motion.div>

      <div className="mb-8">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>Progress</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-blue-500 to-purple-600"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      <div className="space-y-4">
        <AnimatePresence mode="wait">
          {analysisSteps.map((step, index) => (
            <motion.div
              key={step.key}
              initial={{ opacity: 0, x: -20 }}
              animate={{
                opacity: index <= currentStep ? 1 : 0.3,
                x: 0
              }}
              className={`
                flex items-start gap-4 p-4 rounded-lg
                ${index === currentStep
                  ? 'bg-blue-50 border-2 border-blue-300'
                  : index < currentStep
                    ? 'bg-green-50 border-2 border-green-300'
                    : 'bg-gray-50 border-2 border-gray-200'
                }
              `}
            >
              <div className="text-3xl">
                {index < currentStep ? '✅' : step.icon}
              </div>
              <div className="flex-1">
                <p className={`font-semibold mb-1 ${index === currentStep ? 'text-blue-900' : 'text-gray-900'}`}>
                  {step.message}
                </p>
                <p className="text-sm text-gray-600">{step.data}</p>
              </div>
              {index === currentStep && (
                <motion.div
                  className="w-6 h-6"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                >
                  <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                  </svg>
                </motion.div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="mt-8 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200"
      >
        <p className="text-sm text-gray-700 italic text-center">
          💡 Creating a routine optimized for your skin, climate, and lifestyle
        </p>
      </motion.div>
    </div>
  );
}
