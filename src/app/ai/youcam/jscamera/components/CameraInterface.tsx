'use client';

import { useRef, useState, useCallback, useEffect } from 'react';
import Script from 'next/script';
import Image from 'next/image';

declare global {
  interface Window {
    ymkAsyncInit: () => void;
    YMK: any;
    ymkInstance: any;
  }
}

interface CameraInterfaceProps {
  onImageCapture: (imageData: string) => void;
  capturedImage: string | null;
}

export default function CameraInterface({ onImageCapture, capturedImage }: CameraInterfaceProps) {
  // State
  const [isSDKLoaded, setIsSDKLoaded] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [useWebcam, setUseWebcam] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isVideoReady, setIsVideoReady] = useState(false);
  
  // Face guidance states
  const [faceGuidance, setFaceGuidance] = useState<{
    message: string;
    type: 'success' | 'warning' | 'error' | 'info';
    canCapture: boolean;
  }>({
    message: '카메라를 열어주세요',
    type: 'info',
    canCapture: false
  });
  
  // Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const cleanupRef = useRef<(() => void) | null>(null);
  const ymkInstanceRef = useRef<any>(null);

  // Utility functions
  const isSecureContext = useCallback(() => {
    return window.location.protocol === 'https:' || 
           window.location.hostname === 'localhost' || 
           window.location.hostname === '127.0.0.1';
  }, []);

  const isGetUserMediaAvailable = useCallback(() => {
    return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
  }, []);

  // Cleanup function
  const cleanup = useCallback(() => {
    console.log('Cleaning up camera resources...');
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        track.stop();
        console.log('Stopped track:', track.kind);
      });
      streamRef.current = null;
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    
    setIsCameraOpen(false);
    setIsVideoReady(false);
    setCameraError(null);
    
    if (cleanupRef.current) {
      cleanupRef.current();
      cleanupRef.current = null;
    }
  }, []);

  // Start webcam with simplified logic  
  const startWebcam = useCallback(async () => {
    console.log('Starting webcam...');
    
    // Check prerequisites
    if (!isSecureContext()) {
      setCameraError('Camera requires HTTPS or localhost');
      return;
    }

    if (!isGetUserMediaAvailable()) {
      setCameraError('Browser does not support camera access');
      return;
    }
    
    // Wait a bit for component to fully mount
    await new Promise(resolve => setTimeout(resolve, 100));
    
    try {
      console.log('Requesting camera stream...');
      
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user'
        }
      });
      
      console.log('Stream obtained:', stream.id);
      
      // Wait for video ref to be available with retry logic
      let retryCount = 0;
      const maxRetries = 20; // 2 seconds total wait
      
      while (!videoRef.current && retryCount < maxRetries) {
        console.log(`Waiting for video ref... attempt ${retryCount + 1}`);
        await new Promise(resolve => setTimeout(resolve, 100));
        retryCount++;
      }
      
      if (!videoRef.current) {
        console.error('Video ref still not available after retries');
        stream.getTracks().forEach(track => track.stop());
        setCameraError('Camera component not ready. Please try again.');
        return;
      }

      console.log('Video ref is now available');

      // Store stream reference
      streamRef.current = stream;
      videoRef.current.srcObject = stream;
      
      // Simple video ready detection
      const handleVideoReady = () => {
        console.log('Video ready');
        setIsVideoReady(true);
        setFaceGuidance({
          message: "카메라가 준비되었습니다!",
          type: "success",
          canCapture: true
        });
      };

      // Set up single event listener
      videoRef.current.onloadedmetadata = handleVideoReady;
      
      // Store cleanup function
      cleanupRef.current = () => {
        if (videoRef.current) {
          videoRef.current.onloadedmetadata = null;
        }
      };
      
      // Fallback timeout
      setTimeout(() => {
        if (videoRef.current && videoRef.current.readyState >= 2) {
          console.log('Video ready via fallback timeout');
          handleVideoReady();
        }
      }, 3000);
      
    } catch (error: any) {
      console.error('Camera access error:', error);
      
      let errorMessage = 'Camera access failed. ';
      if (error.name === 'NotAllowedError') {
        errorMessage += 'Please allow camera access in your browser.';
      } else if (error.name === 'NotFoundError') {
        errorMessage += 'No camera found.';
      } else if (error.name === 'NotReadableError') {
        errorMessage += 'Camera is in use by another application.';
      } else {
        errorMessage += error.message || 'Unknown error.';
      }
      
      setCameraError(errorMessage);
    }
  }, [isSecureContext, isGetUserMediaAvailable]);


  // Face quality analysis function
  const analyzeFaceQuality = useCallback((quality: any) => {
    if (!quality.hasFace) {
      return {
        message: "얼굴을 화면에 보여주세요 👤",
        type: "error" as const,
        canCapture: false
      };
    }
    
    if (quality.area === "toosmall") {
      return {
        message: "카메라에 더 가까이 와주세요 🔍",
        type: "warning" as const,
        canCapture: false
      };
    }
    
    if (quality.area === "outofboundary") {
      return {
        message: "너무 가깝습니다. 조금 멀어져 주세요 ↩️",
        type: "warning" as const,
        canCapture: false
      };
    }
    
    if (quality.area === "good") {
      if (quality.frontal === "good") {
        return {
          message: "완벽합니다! 이제 촬영하세요 📸✨",
          type: "success" as const,
          canCapture: true
        };
      } else {
        return {
          message: "정면을 바라봐 주세요 👀",
          type: "warning" as const,
          canCapture: false
        };
      }
    }
    
    return {
      message: "얼굴 위치를 조정해주세요",
      type: "warning" as const,
      canCapture: false
    };
  }, []);

  // YouCam SDK initialization (simplified for stability)
  const initializeYMK = useCallback(() => {
    console.log('YouCam SDK available, using standard webcam mode for stability');
    setUseWebcam(true);
    setIsSDKLoaded(true);
    setFaceGuidance({
      message: "표준 웹캠 모드",
      type: "info",
      canCapture: true
    });
  }, []);

  const handleSDKLoad = useCallback(() => {
    console.log('YouCam SDK script loaded');
    if (window.YMK) {
      initializeYMK();
    } else {
      setUseWebcam(true);
      setIsSDKLoaded(true);
    }
  }, [initializeYMK]);

  // YouCam camera controls
  const openYouCamCamera = useCallback(() => {
    if (ymkInstanceRef.current) {
      try {
        console.log('Opening YouCam camera...');
        setFaceGuidance({
          message: "카메라를 준비중입니다...",
          type: "info",
          canCapture: false
        });
        
        // Try various methods to open camera
        if (ymkInstanceRef.current.openSkincareCamera) {
          ymkInstanceRef.current.openSkincareCamera();
        } else if (ymkInstanceRef.current.openCamera) {
          ymkInstanceRef.current.openCamera();
        } else if (ymkInstanceRef.current.start) {
          ymkInstanceRef.current.start();
        }
        
        setIsVideoReady(true);
        
        // Set initial guidance for face detection
        setTimeout(() => {
          setFaceGuidance({
            message: "얼굴을 화면 중앙에 맞춰주세요 📷",
            type: "info",
            canCapture: false
          });
        }, 1000);
        
      } catch (error) {
        console.error('YouCam camera failed:', error);
        setCameraError('YouCam camera failed. Switching to standard webcam.');
        setUseWebcam(true);
        startWebcam();
      }
    }
  }, [startWebcam]);

  const closeYouCamCamera = useCallback(() => {
    if (ymkInstanceRef.current) {
      try {
        console.log('Closing YouCam camera...');
        if (ymkInstanceRef.current.close) {
          ymkInstanceRef.current.close();
        } else if (ymkInstanceRef.current.stop) {
          ymkInstanceRef.current.stop();
        }
      } catch (error) {
        console.error('Error closing YouCam camera:', error);
      }
    }
    
    setFaceGuidance({
      message: "카메라를 열어주세요",
      type: "info",
      canCapture: false
    });
  }, []);

  const captureYouCamPhoto = useCallback(() => {
    if (ymkInstanceRef.current && faceGuidance.canCapture) {
      try {
        console.log('Capturing photo with YouCam...');
        if (ymkInstanceRef.current.capture) {
          ymkInstanceRef.current.capture();
        } else if (ymkInstanceRef.current.takeSnapshot) {
          ymkInstanceRef.current.takeSnapshot();
        }
      } catch (error) {
        console.error('YouCam capture failed:', error);
        setCameraError('Photo capture failed. Please try again.');
      }
    } else if (!faceGuidance.canCapture) {
      // Show guidance message briefly
      const originalMessage = faceGuidance.message;
      setFaceGuidance({
        ...faceGuidance,
        message: "얼굴 위치를 먼저 조정해주세요!"
      });
      
      setTimeout(() => {
        setFaceGuidance({
          ...faceGuidance,
          message: originalMessage
        });
      }, 2000);
    }
  }, [faceGuidance]);

  // Main camera controls
  const openCamera = useCallback(() => {
    console.log('Opening camera...');
    
    // Set camera as opening to trigger UI update
    setIsCameraOpen(true);
    setIsVideoReady(false);
    setCameraError(null);
    
    setFaceGuidance({
      message: "카메라 준비 중...",
      type: "info", 
      canCapture: false
    });
    
    // Always use webcam for stability
    startWebcam().catch((error) => {
      console.error('Failed to start webcam:', error);
      setIsCameraOpen(false);
      setCameraError('Failed to start camera. Please try again.');
    });
  }, [startWebcam]);

  const closeCamera = useCallback(() => {
    console.log('Closing camera...');
    cleanup();
    setFaceGuidance({
      message: "카메라를 열어주세요",
      type: "info",
      canCapture: false
    });
  }, [cleanup]);

  const capturePhoto = useCallback(() => {
    // Simple webcam capture logic
    if (!videoRef.current || !canvasRef.current || !isVideoReady) {
      setCameraError('Camera not ready');
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    
    if (video.videoWidth === 0 || video.videoHeight === 0) {
      setCameraError('Video dimensions not available');
      return;
    }
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    if (context) {
      context.drawImage(video, 0, 0);
      const imageData = canvas.toDataURL('image/jpeg', 0.8);
      console.log('Photo captured, size:', imageData.length);
      onImageCapture(imageData);
      cleanup();
    }
  }, [isVideoReady, onImageCapture, cleanup]);

  // Effects
  useEffect(() => {
    // Initial setup
    if (!isSecureContext()) {
      setCameraError('Camera requires HTTPS or localhost');
    } else if (!isGetUserMediaAvailable()) {
      setCameraError('Browser does not support camera');
    }
    
    return cleanup;
  }, [isSecureContext, isGetUserMediaAvailable, cleanup]);

  return (
    <div className="w-full">
      <Script
        src="https://plugins-media.makeupar.com/v1.0-skincare-camera-kit/sdk.js"
        onLoad={handleSDKLoad}
        strategy="lazyOnload"
      />

      <div className="mb-4 p-3 bg-gray-100 rounded-lg">
        <p className="text-sm text-gray-600">
          📷 웹캠 카메라 모드
        </p>
      </div>

      {/* Face Guidance Display */}
      {isCameraOpen && (
        <div className={`mb-4 p-4 rounded-lg border-2 transition-all duration-300 ${
          faceGuidance.type === 'success' ? 'bg-green-50 border-green-200' :
          faceGuidance.type === 'warning' ? 'bg-yellow-50 border-yellow-200' :
          faceGuidance.type === 'error' ? 'bg-red-50 border-red-200' :
          'bg-blue-50 border-blue-200'
        }`}>
          <div className="flex items-center">
            <div className={`w-3 h-3 rounded-full mr-3 ${
              faceGuidance.type === 'success' ? 'bg-green-500' :
              faceGuidance.type === 'warning' ? 'bg-yellow-500' :
              faceGuidance.type === 'error' ? 'bg-red-500' :
              'bg-blue-500'
            }`}></div>
            <p className={`font-medium ${
              faceGuidance.type === 'success' ? 'text-green-800' :
              faceGuidance.type === 'warning' ? 'text-yellow-800' :
              faceGuidance.type === 'error' ? 'text-red-800' :
              'text-blue-800'
            }`}>
              {faceGuidance.message}
            </p>
          </div>
          
          <div className="mt-2 text-xs text-gray-600">
            {faceGuidance.canCapture ? 
              '✅ 촬영 가능 상태' : 
              '⏳ 카메라 준비 중...'
            }
          </div>
        </div>
      )}

      {cameraError && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start">
            <svg className="w-5 h-5 text-red-400 mt-0.5 mr-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <div>
              <h3 className="text-sm font-medium text-red-800">Camera Error</h3>
              <p className="text-sm text-red-600 mt-1">{cameraError}</p>
              <button
                onClick={() => {
                  setCameraError(null);
                  openCamera();
                }}
                className="mt-2 text-sm bg-red-100 hover:bg-red-200 text-red-800 px-3 py-1 rounded-md"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      )}

      {capturedImage ? (
        <div className="space-y-4">
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
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
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
                    {faceGuidance.canCapture ? '📸 사진 촬영' : '⏳ 카메라 준비 중...'}
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

      <div className="mt-4 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-semibold text-sm text-blue-900 mb-2">
          카메라 사용 팁:
        </h3>
        <ul className="text-xs text-blue-700 space-y-1">
          <li>• 브라우저에서 카메라 권한을 허용해주세요</li>
          <li>• 밝은 조명에서 촬영하시면 더 정확합니다</li>
          <li>• 얼굴을 화면 중앙에 위치시켜주세요</li>
          <li>• 정확한 분석을 위해 화장을 지워주세요</li>
        </ul>
      </div>
    </div>
  );
}