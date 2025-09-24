'use client';

interface FaceGuidance {
  message: string;
  type: 'success' | 'warning' | 'error' | 'info';
  canCapture: boolean;
}

interface FaceMetrics {
  faceCount: number;
  faceSize: number;
  faceCenterX: number;
  faceCenterY: number;
  isFrameCentered: boolean;
  positionQuality: number;
  lightingQuality: number;
  straightnessQuality: number;
}

interface CameraGuideStatusProps {
  faceGuidance: FaceGuidance;
  faceMetrics: FaceMetrics;
}

export default function CameraGuideStatus({
  faceGuidance,
  faceMetrics
}: CameraGuideStatusProps) {
  return (
    <div className="flex flex-col">
      {/* Enhanced Face Guidance Display - Auto Height */}
      <div className={`py-1 rounded-lg border-2 transition-all duration-500 transform ${
          faceGuidance.type === 'success' ? 'border-green-200 scale-105' :
          faceGuidance.type === 'warning' ? 'border-yellow-200' :
          faceGuidance.type === 'error' ? 'border-red-200 animate-pulse' :
          'border-blue-200'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center flex-1 min-w-0">
              <div className={`w-4 h-4 rounded-full mr-3 flex-shrink-0 transition-all duration-300 ${
                faceGuidance.type === 'success' ? 'bg-green-500 animate-pulse' :
                faceGuidance.type === 'warning' ? 'bg-yellow-500' :
                faceGuidance.type === 'error' ? 'bg-red-500 animate-bounce' :
                'bg-blue-500'
              }`}></div>
              <div className={`font-semibold text-sm leading-tight flex items-center min-h-[2.5rem] ${
                faceGuidance.type === 'success' ? 'text-green-800' :
                faceGuidance.type === 'warning' ? 'text-yellow-800' :
                faceGuidance.type === 'error' ? 'text-red-800' :
                'text-blue-800'
              }`}>
                {faceGuidance.message}
              </div>
            </div>
            
            {/* Capture Status Indicator */}
            <div className={`px-3 py-1 rounded-full text-xs font-medium flex-shrink-0 ${
              faceGuidance.canCapture ? 
                'bg-green-100 text-green-800 border border-green-200' : 
                'bg-gray-100 text-gray-600 border border-gray-200'
            }`}>
              {faceGuidance.canCapture ? '📸 Ready' : '⏳ Adjusting'}
            </div>
          </div>
          
          {/* Face Detection Metrics */}
          <div className="mt-3 flex items-center space-x-4 text-xs text-gray-600">
            <div className="flex items-center">
              <span className={`w-2 h-2 rounded-full mr-1 ${
                faceMetrics.faceCount > 0 ? 'bg-green-400' : 'bg-red-400'
              }`}></span>
              Face detected
            </div>
            <div className="flex items-center">
              <span className={`w-2 h-2 rounded-full mr-1 ${
                faceMetrics.faceCount > 0 ? 'bg-green-400' : 'bg-red-400'
              }`}></span>
              Position: {faceMetrics.isFrameCentered ? 'Centered' : 'Adjusting'}
            </div>
            <div className="flex items-center">
              <span className="w-2 h-2 bg-purple-400 rounded-full mr-1"></span>
              Quality: {Math.round(faceMetrics.faceSize)}%
            </div>
          </div>
          
          {/* Progress Bar for Face Positioning */}
          <div className="mt-1">
            <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
              <span>Face Position Quality</span>
              <span>{Math.round(faceMetrics.positionQuality)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-500 ${
                  faceMetrics.positionQuality >= 90 ? 'bg-green-500' :
                  faceMetrics.positionQuality >= 70 ? 'bg-yellow-500' :
                  faceMetrics.positionQuality >= 40 ? 'bg-orange-500' :
                  'bg-red-500'
                }`}
                style={{ width: `${Math.max(5, faceMetrics.positionQuality)}%` }}
              ></div>
            </div>
          </div>
        </div>

      {/* Quality Status Indicators - Fixed position between Progress Bar and camera view */}
      <div className="rounded-lg">
        <div className="h-16 flex justify-center items-center gap-1 px-2">
          {/* Lighting Status */}
          <div className={`w-24 h-12 flex flex-col items-center justify-center rounded text-xs font-medium transition-all duration-300 ${
            faceMetrics.lightingQuality >= 70 ? 'bg-green-100 text-green-800 border border-green-200' :
            faceMetrics.lightingQuality >= 40 ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' :
            'bg-red-100 text-red-800 border border-red-200'
          }`}>
            <div className="text-center leading-none">
              <div>Lighting</div>
              <div>{faceMetrics.lightingQuality >= 70 ? 'Good' : 'Not Good'}</div>
            </div>
          </div>
          
          {/* Look Straight Status */}
          <div className={`w-24 h-12 flex flex-col items-center justify-center rounded text-xs font-medium transition-all duration-300 ${
            faceMetrics.straightnessQuality >= 70 ? 'bg-green-100 text-green-800 border border-green-200' :
            faceMetrics.straightnessQuality >= 40 ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' :
            'bg-red-100 text-red-800 border border-red-200'
          }`}>
            <div className="text-center leading-none">
              <div>Look Straight</div>
              <div>{faceMetrics.straightnessQuality >= 70 ? 'Good' : 'Not Good'}</div>
            </div>
          </div>
          
          {/* Face Position Status */}
          <div className={`w-24 h-12 flex flex-col items-center justify-center rounded text-xs font-medium transition-all duration-300 ${
            faceMetrics.positionQuality >= 60 ? 'bg-green-100 text-green-800 border border-green-200' :
            faceMetrics.positionQuality >= 30 ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' :
            'bg-red-100 text-red-800 border border-red-200'
          }`}>
            <div className="text-center leading-none">
              <div>Face Position</div>
              <div>{faceMetrics.positionQuality >= 60 ? 'Good' : 'Not Good'}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
