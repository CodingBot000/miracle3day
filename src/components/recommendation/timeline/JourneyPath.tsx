import React from 'react';
import { Card } from '@/components/ui/card';
import { Calendar, ArrowRight, Target } from 'lucide-react';

export interface JourneyPathProps {
  totalSessions: number;
  estimatedDuration: string;
}

const JourneyPath: React.FC<JourneyPathProps> = ({
  totalSessions,
  estimatedDuration,
}) => {
  return (
    <Card className="p-6 bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 border-2 border-dashed border-gray-300 mb-6">
      <div className="flex items-center justify-between">
        {/* Start */}
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-blue-500 rounded-full">
            <Calendar className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-sm text-gray-600 font-medium">Your Journey Starts</p>
            <p className="text-lg font-semibold text-gray-900">Session 1</p>
          </div>
        </div>

        {/* Arrow with sessions count */}
        <div className="flex items-center space-x-2 flex-1 mx-8">
          <div className="flex-1 border-t-2 border-dashed border-gray-400" />
          <div className="px-4 py-2 bg-white rounded-full border-2 border-gray-300 shadow-sm">
            <p className="text-sm font-medium text-gray-700">
              {totalSessions} {totalSessions === 1 ? 'Treatment' : 'Treatments'}
            </p>
          </div>
          <div className="flex-1 border-t-2 border-dashed border-gray-400" />
        </div>

        {/* End */}
        <div className="flex items-center space-x-3">
          <div>
            <p className="text-sm text-gray-600 font-medium text-right">Expected Completion</p>
            <p className="text-lg font-semibold text-gray-900">{estimatedDuration}</p>
          </div>
          <div className="p-3 bg-pink-500 rounded-full">
            <Target className="w-6 h-6 text-white" />
          </div>
        </div>
      </div>

      {/* Additional info */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <p className="text-xs text-gray-600 text-center">
          Timeline may vary based on individual response and clinic scheduling.
          Consult with your provider for a personalized treatment schedule.
        </p>
      </div>
    </Card>
  );
};

export default JourneyPath;
