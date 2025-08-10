'use client';

import { useState } from 'react';
import ImageUploader from './components/ImageUploader';
import ConcernSelector from './components/ConcernSelector';
import AnalysisResults from './components/AnalysisResults';
import { SkinConcern } from '../../../api/ai/youcam/lib/types';

export default function AIAnalysisPage() {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [selectedConcerns, setSelectedConcerns] = useState<SkinConcern[]>([]);
  const [analysisMode, setAnalysisMode] = useState<'SD' | 'HD'>('SD');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleImageSelect = (file: File) => {
    setSelectedImage(file);
    setError(null);
    setAnalysisResult(null);
  };

  const handleConcernSelect = (concerns: SkinConcern[]) => {
    setSelectedConcerns(concerns);
    setError(null);
  };

  const handleAnalyze = async () => {
    if (!selectedImage) {
      setError('Please select an image');
      return;
    }

    const validCounts = [4, 7, 14];
    if (!validCounts.includes(selectedConcerns.length)) {
      setError(`Please select exactly 4, 7, or 14 concerns (you selected ${selectedConcerns.length})`);
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('image', selectedImage);
      formData.append('concerns', JSON.stringify(selectedConcerns));
      formData.append('mode', analysisMode);

      const response = await fetch('/api/ai/youcam/skin-analysis', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Analysis failed');
      }

      setAnalysisResult(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during analysis');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReset = () => {
    setSelectedImage(null);
    setSelectedConcerns([]);
    setAnalysisResult(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            AI Skin Analysis
          </h1>

          {!analysisResult ? (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                  <h2 className="text-xl font-semibold mb-4">Step 1: Upload Your Photo</h2>
                  <ImageUploader 
                    onImageSelect={handleImageSelect} 
                    selectedImage={selectedImage}
                  />
                </div>

                <div>
                  <h2 className="text-xl font-semibold mb-4">Step 2: Select Skin Concerns</h2>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Analysis Mode
                    </label>
                    <div className="flex gap-4">
                      <button
                        onClick={() => setAnalysisMode('SD')}
                        className={`px-4 py-2 rounded-md ${
                          analysisMode === 'SD'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-200 text-gray-700'
                        }`}
                      >
                        Standard (SD)
                      </button>
                      <button
                        onClick={() => setAnalysisMode('HD')}
                        className={`px-4 py-2 rounded-md ${
                          analysisMode === 'HD'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-200 text-gray-700'
                        }`}
                      >
                        High Definition (HD)
                      </button>
                    </div>
                  </div>
                  <ConcernSelector
                    mode={analysisMode}
                    selectedConcerns={selectedConcerns}
                    onConcernSelect={handleConcernSelect}
                  />
                </div>
              </div>

              {error && (
                <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-red-600">{error}</p>
                </div>
              )}

              <div className="mt-8 flex justify-center">
                <button
                  onClick={handleAnalyze}
                  disabled={isAnalyzing || !selectedImage || selectedConcerns.length === 0}
                  className={`px-8 py-3 rounded-md font-semibold text-white ${
                    isAnalyzing || !selectedImage || selectedConcerns.length === 0
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  {isAnalyzing ? 'Analyzing...' : 'Analyze Skin'}
                </button>
              </div>
            </>
          ) : (
            <>
              <AnalysisResults result={analysisResult} />
              <div className="mt-8 flex justify-center">
                <button
                  onClick={handleReset}
                  className="px-8 py-3 bg-gray-600 text-white rounded-md font-semibold hover:bg-gray-700"
                >
                  Analyze Another Photo
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}