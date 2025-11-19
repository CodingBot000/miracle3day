
import React from 'react';

interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({ currentStep, totalSteps }) => {
  const progress = ((currentStep + 1) / totalSteps) * 100;

  return (
    <div className="flex justify-center">
      <div 
        className="bg-[#FFE4E6] h-1 overflow-hidden"
        style={{ width: '768px' }}
      >
        <div 
          className="h-full transition-all duration-500 ease-out"
          style={{ 
            width: `${progress}%`,
            background: 'linear-gradient(0deg, #FB718F, #FB718F)'
          }}
        />
      </div>
      {/* <div className="flex justify-between mt-3">
        {Array.from({ length: totalSteps }, (_, index) => (
          <div
            key={index}
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300 ${
              index <= currentStep
                ? 'bg-gradient-to-br from-rose-400 to-pink-500 text-white shadow-lg'
                : 'bg-rose-100 text-rose-400'
            }`}
          >
            {index + 1}
          </div>
        ))}
      </div> */}
    </div>
  );
};


export default ProgressIndicator;
