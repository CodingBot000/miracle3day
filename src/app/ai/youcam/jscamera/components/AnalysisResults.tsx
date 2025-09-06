'use client';

interface AnalysisResultsProps {
  result: {
    overallScore: number;
    skinAge?: number;
    concerns: {
      name: string;
      score: number;
      severity: 'low' | 'medium' | 'high';
    }[];
  };
}

export default function AnalysisResults({ result }: AnalysisResultsProps) {
  const getSeverityColor = (severity: 'low' | 'medium' | 'high') => {
    switch (severity) {
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 70) return 'text-green-600';
    if (score >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getProgressBarColor = (score: number) => {
    if (score >= 70) return 'bg-green-500';
    if (score >= 40) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg p-6 text-white">
        <h2 className="text-2xl font-bold mb-4">JS Camera Kit Analysis Results</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-purple-100 text-sm mb-2">Overall Skin Score</p>
            <div className="flex items-baseline">
              <span className="text-5xl font-bold">{result.overallScore}</span>
              <span className="text-2xl ml-1">/100</span>
            </div>
          </div>
          
          {result.skinAge && (
            <div>
              <p className="text-purple-100 text-sm mb-2">Estimated Skin Age</p>
              <div className="flex items-baseline">
                <span className="text-5xl font-bold">{result.skinAge}</span>
                <span className="text-2xl ml-2">years</span>
              </div>
            </div>
          )}
        </div>

        <div className="mt-4 p-3 bg-white bg-opacity-20 rounded-lg">
          <p className="text-sm text-purple-100">
            📷 Captured using YouCam JS Camera Kit technology for enhanced accuracy
          </p>
        </div>
      </div>

      <div>
        <h3 className="text-xl font-semibold mb-4">Detailed Camera-Based Analysis</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {result.concerns.map((concern, index) => (
            <div
              key={index}
              className="bg-white border rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-3">
                <h4 className="font-medium text-gray-900">{concern.name}</h4>
                <span
                  className={`px-2 py-1 text-xs font-semibold rounded-full border ${getSeverityColor(
                    concern.severity
                  )}`}
                >
                  {concern.severity.toUpperCase()}
                </span>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Score</span>
                  <span className={`font-bold ${getScoreColor(concern.score)}`}>
                    {concern.score}/100
                  </span>
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-500 ${getProgressBarColor(
                      concern.score
                    )}`}
                    style={{ width: `${concern.score}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
        <h3 className="font-semibold text-purple-900 mb-2">Understanding Your Camera-Based Results</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm mb-3">
          <div>
            <div className="flex items-center mb-1">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-2" />
              <span className="font-medium text-gray-700">Excellent (70-100)</span>
            </div>
            <p className="text-gray-600 text-xs">Outstanding skin condition</p>
          </div>
          <div>
            <div className="flex items-center mb-1">
              <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2" />
              <span className="font-medium text-gray-700">Good (40-69)</span>
            </div>
            <p className="text-gray-600 text-xs">Room for improvement</p>
          </div>
          <div>
            <div className="flex items-center mb-1">
              <div className="w-3 h-3 bg-red-500 rounded-full mr-2" />
              <span className="font-medium text-gray-700">Needs Care (0-39)</span>
            </div>
            <p className="text-gray-600 text-xs">Requires focused attention</p>
          </div>
        </div>
        
        <div className="border-t border-purple-200 pt-3 mt-3">
          <h4 className="font-medium text-purple-800 mb-1">Camera Capture Benefits:</h4>
          <ul className="text-xs text-purple-700 space-y-1">
            <li>• Real-time face quality monitoring during capture</li>
            <li>• Optimized lighting and positioning guidance</li>
            <li>• Enhanced accuracy through YouCam&apos;s AI technology</li>
            <li>• Consistent image quality for reliable analysis</li>
          </ul>
        </div>
      </div>
    </div>
  );
}