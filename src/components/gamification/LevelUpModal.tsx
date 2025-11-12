'use client';

import { useEffect, useState } from 'react';
import { X } from 'lucide-react';

interface LevelUpModalProps {
  level: number;
  exp: number;
  onClose: () => void;
}

export default function LevelUpModal({ level, exp, onClose }: LevelUpModalProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger animation after mount
    setTimeout(() => setIsVisible(true), 100);
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300); // Close after animation
  };

  return (
    <>
      {/* Background overlay */}
      <div
        className={`fixed inset-0 bg-black z-50 transition-opacity duration-300 ${
          isVisible ? 'bg-opacity-60' : 'bg-opacity-0'
        }`}
        onClick={handleClose}
      />

      {/* Modal */}
      <div
        className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 ${
          isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
      >
        <div
          className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 relative"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Content */}
          <div className="text-center">
            {/* Icon */}
            <div className="mb-6 animate-bounce">
              <div className="text-8xl">⬆️</div>
            </div>

            {/* Title */}
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              LEVEL UP!
            </h2>

            {/* Level */}
            <div className="mb-6">
              <div className="inline-block px-6 py-3 bg-gradient-to-r from-pink-500 to-orange-500 rounded-full">
                <span className="text-4xl font-bold text-white">
                  Level {level}
                </span>
              </div>
            </div>

            {/* Congratulations message */}
            <p className="text-xl text-gray-700 mb-2">
              🎊 You&apos;re now Level {level}! 🎊
            </p>

            {/* Experience points */}
            <p className="text-sm text-gray-500 mb-8">
              Total Experience: {exp.toLocaleString()} XP
            </p>

            {/* Encouragement message */}
            <p className="text-lg text-gray-600 mb-8">
              Keep going! 🚀
            </p>

            {/* Button */}
            <button
              onClick={handleClose}
              className="w-full py-4 bg-gradient-to-r from-pink-500 to-orange-500 text-white font-semibold rounded-xl hover:from-pink-600 hover:to-orange-600 transition-all shadow-lg hover:shadow-xl"
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
