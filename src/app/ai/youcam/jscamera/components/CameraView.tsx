'use client';

import { RefObject } from 'react';
import Image from 'next/image';

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

interface CameraViewProps {
  capturedImage: string | null;
  onImageCapture: (imageData: string) => void;
  openCamera: () => void;
  isSDKLoaded: boolean;
  isCameraOpen: boolean;
  isVideoReady: boolean;
  videoRef: RefObject<HTMLVideoElement>;
  canvasRef: RefObject<HTMLCanvasElement>;
  faceGuidance: FaceGuidance;
  faceMetrics: FaceMetrics;
  capturePhoto: () => void;
  closeCamera: () => void;
}

export default function CameraView({
  capturedImage,
  onImageCapture,
  openCamera,
  isSDKLoaded,
  isCameraOpen,
  isVideoReady,
  videoRef,
  canvasRef,
  faceGuidance,
  capturePhoto,
  closeCamera
}: CameraViewProps) {
  return (
    <>
      {capturedImage ? (
        <div className="space-y-4 mt-6">
          <div className="relative w-full h-96 border-2 border-gray-200 rounded-lg overflow-hidden">
            <Image
              src={capturedImage}
              alt="Captured image"
              fill
              className="object-contain"
            />
          </div>
          <div className="text-center">
            <button
              onClick={() => onImageCapture('')}
              className="mr-2 px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Clear Image
            </button>
            <button
              onClick={openCamera}
              className="px-4 py-2 rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              Take Another Photo
            </button>
          </div>
        </div>
      ) : (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center mt-6">
          {!isSDKLoaded ? (
            <div className="space-y-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600">Loading camera system...</p>
            </div>
          ) : !isCameraOpen ? (
            <div className="space-y-4">
              <svg
                className="w-16 h-16 text-gray-400 mx-auto"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              <div>
                <p className="text-gray-600 mb-4">Ready to take your photo</p>
                <button
                  onClick={openCamera}
                  className="px-6 py-3 bg-blue-600 text-white rounded-md font-semibold hover:bg-blue-700"
                >
                  Open Camera
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="relative bg-black rounded-lg overflow-hidden mx-auto max-w-md">
                {!isVideoReady && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-800 text-white min-h-[300px]">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
                      <p>Preparing camera...</p>
                    </div>
                  </div>
                )}
                
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className={`w-full rounded-lg ${isVideoReady ? 'block' : 'hidden'}`}
                  style={{ minHeight: '300px', maxHeight: '480px' }}
                />
                {/* Face Guide Overlay */}
                {isVideoReady && (
                  <div 
                    className="absolute inset-0 pointer-events-none bg-gray-900 bg-opacity-50"
                    style={{
                      maskImage: 'radial-gradient(ellipse 154px 205px at center, transparent 50%, black 52%)',
                      WebkitMaskImage: 'radial-gradient(ellipse 154px 205px at center, transparent 50%, black 52%)'
                    }}
                  >
                    {/* Center Guide Circle */}
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                      <div className={`border-2 rounded-full transition-all duration-300 ${
                        faceGuidance.canCapture 
                          ? 'border-green-400 shadow-lg shadow-green-400/50' 
                          : faceGuidance.type === 'error'
                          ? 'border-red-400 shadow-lg shadow-red-400/50 animate-pulse'
                          : 'border-yellow-400 shadow-lg shadow-yellow-400/30'
                      }`}
                        style={{ width: '154px', height: '205px' }}>
                        {/* Corner markers */}
                        <div className={`absolute -top-1 -left-1 w-6 h-6 border-l-4 border-t-4 ${
                          faceGuidance.canCapture ? 'border-green-400' : 'border-yellow-400'
                        }`}></div>
                        <div className={`absolute -top-1 -right-1 w-6 h-6 border-r-4 border-t-4 ${
                          faceGuidance.canCapture ? 'border-green-400' : 'border-yellow-400'
                        }`}></div>
                        <div className={`absolute -bottom-1 -left-1 w-6 h-6 border-l-4 border-b-4 ${
                          faceGuidance.canCapture ? 'border-green-400' : 'border-yellow-400'
                        }`}></div>
                        <div className={`absolute -bottom-1 -right-1 w-6 h-6 border-r-4 border-b-4 ${
                          faceGuidance.canCapture ? 'border-green-400' : 'border-yellow-400'
                        }`}></div>
                      </div>
                    </div>
                    
                    {/* Directional Arrows */}
                    {!faceGuidance.canCapture && faceGuidance.message.includes('move') && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        {faceGuidance.message.includes('right') && (
                          <div className="absolute left-8 animate-bounce">
                            <div className="text-white text-4xl">➡️</div>
                          </div>
                        )}
                        {faceGuidance.message.includes('left') && (
                          <div className="absolute right-8 animate-bounce">
                            <div className="text-white text-4xl">⬅️</div>
                          </div>
                        )}
                        {faceGuidance.message.includes('up') && (
                          <div className="absolute top-8 animate-bounce">
                            <div className="text-white text-4xl">⬆️</div>
                          </div>
                        )}
                        {faceGuidance.message.includes('down') && (
                          <div className="absolute bottom-8 animate-bounce">
                            <div className="text-white text-4xl">⬇️</div>
                          </div>
                        )}
                        {faceGuidance.message.includes('closer') && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="text-white text-6xl animate-pulse">🔍</div>
                          </div>
                        )}
                        {faceGuidance.message.includes('back') && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="text-white text-lg font-semibold animate-pulse bg-black bg-opacity-50 px-4 py-2 rounded-lg">
                              Keep your face inside the circle
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
                
                <canvas ref={canvasRef} className="hidden" />
              </div>
              
              <div className="text-center">
                {isVideoReady ? (
                  <p className="text-green-600 font-semibold mb-2">✅ Camera ready</p>
                ) : (
                  <p className="text-blue-600 font-semibold mb-2">📷 Opening camera...</p>
                )}
                
                <div className="flex justify-center gap-4">
                  <button
                    onClick={capturePhoto}
                    disabled={!faceGuidance.canCapture}
                    className={`px-4 py-2 rounded-md font-medium transition-all ${
                      faceGuidance.canCapture
                        ? 'bg-green-600 hover:bg-green-700 text-white scale-105 shadow-lg'
                        : 'bg-gray-400 cursor-not-allowed text-gray-200'
                    }`}
                  >
                    {faceGuidance.canCapture ? '📸 Take Photo': '⏳ Preparing Camera...'}
                  </button>
                  <button
                    onClick={closeCamera}
                    className="px-4 py-2 bg-red-600 text-white rounded-md font-medium hover:bg-red-700"
                  >
                    Close Camera
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}
