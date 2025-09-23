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
    message: 'Please open the camera',
    type: 'info',
    canCapture: false
  });
  
  // Face detection states
  const [faceDetectionInterval, setFaceDetectionInterval] = useState<NodeJS.Timeout | null>(null);
  const [lastDetectionTime, setLastDetectionTime] = useState<number>(0);
  const [faceMetrics, setFaceMetrics] = useState<{
    faceCount: number;
    faceSize: number;
    faceCenterX: number;
    faceCenterY: number;
    isFrameCentered: boolean;
  }>({ faceCount: 0, faceSize: 0, faceCenterX: 0, faceCenterY: 0, isFrameCentered: false });
  
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
    
    // Stop face detection directly
    if (faceDetectionInterval) {
      clearInterval(faceDetectionInterval);
      setFaceDetectionInterval(null);
    }
    
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
  }, []); // Remove faceDetectionInterval dependency to prevent infinite re-renders

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
          message: "Camera is ready! Please position your face in the center",
          type: "info",
          canCapture: false
        });
        
        // Start face detection after camera is ready
        startFaceDetection();
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


  // Real-time face detection function
  const detectFace = useCallback(async () => {
    if (!videoRef.current || !isVideoReady) return;
    
    const video = videoRef.current;
    const videoWidth = video.videoWidth;
    const videoHeight = video.videoHeight;
    
    if (videoWidth === 0 || videoHeight === 0) return;
    
    try {
      // Create canvas for face detection
      const canvas = document.createElement('canvas');
      canvas.width = videoWidth;
      canvas.height = videoHeight;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) return;
      
      ctx.drawImage(video, 0, 0, videoWidth, videoHeight);
      
      // Basic face detection using canvas analysis
      // This is a simplified approach - in production you'd use YouCam SDK or other ML libraries
      const imageData = ctx.getImageData(0, 0, videoWidth, videoHeight);
      const data = imageData.data;
      
      // Simple face detection based on skin tone detection and face-like regions
      const centerX = videoWidth / 2;
      const centerY = videoHeight / 2;
      const faceRegionSize = Math.min(videoWidth, videoHeight) * 0.3;
      
      // Check if there's likely a face in the center region
      let skinPixelCount = 0;
      let totalPixelsChecked = 0;
      
      for (let y = centerY - faceRegionSize/2; y < centerY + faceRegionSize/2; y += 4) {
        for (let x = centerX - faceRegionSize/2; x < centerX + faceRegionSize/2; x += 4) {
          if (x >= 0 && x < videoWidth && y >= 0 && y < videoHeight) {
            const i = (Math.floor(y) * videoWidth + Math.floor(x)) * 4;
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            
            // Simple skin tone detection
            if (r > 95 && g > 40 && b > 20 && 
                Math.max(r, Math.max(g, b)) - Math.min(r, Math.min(g, b)) > 15 &&
                Math.abs(r - g) > 15 && r > g && r > b) {
              skinPixelCount++;
            }
            totalPixelsChecked++;
          }
        }
      }
      
      const skinRatio = skinPixelCount / totalPixelsChecked;
      const hasFace = skinRatio > 0.1; // Threshold for face detection
      
      // Update face metrics
      setFaceMetrics({
        faceCount: hasFace ? 1 : 0,
        faceSize: skinRatio * 100,
        faceCenterX: centerX,
        faceCenterY: centerY,
        isFrameCentered: hasFace && skinRatio > 0.15
      });
      
      // Analyze face position and provide guidance
      analyzeFacePosition(hasFace, skinRatio, centerX, centerY, videoWidth, videoHeight);
      
    } catch (error) {
      console.error('Face detection error:', error);
    }
  }, [isVideoReady]);
  
  // Face position analysis with English messages
  const analyzeFacePosition = useCallback((hasFace: boolean, faceSize: number, centerX: number, centerY: number, videoWidth: number, videoHeight: number) => {
    const now = Date.now();
    
    // Throttle updates to avoid too frequent changes
    if (now - lastDetectionTime < 500) return;
    setLastDetectionTime(now);
    
    if (!hasFace) {
      setFaceGuidance({
        message: "Please show your face in the camera view 👤",
        type: "error",
        canCapture: false
      });
      return;
    }
    
    // Check face size (distance from camera)
    if (faceSize < 0.1) {
      setFaceGuidance({
        message: "Please move closer to the camera 🔍",
        type: "warning",
        canCapture: false
      });
      return;
    }
    
    if (faceSize > 0.4) {
      setFaceGuidance({
        message: "Please move back a little - too close ↩️",
        type: "warning",
        canCapture: false
      });
      return;
    }
    
    // Check if face is centered
    const horizontalDeviation = Math.abs(centerX - videoWidth / 2) / videoWidth;
    const verticalDeviation = Math.abs(centerY - videoHeight / 2) / videoHeight;
    
    if (horizontalDeviation > 0.2) {
      setFaceGuidance({
        message: centerX < videoWidth / 2 ? 
          "Please move to the right ➡️" : 
          "Please move to the left ⬅️",
        type: "warning",
        canCapture: false
      });
      return;
    }
    
    if (verticalDeviation > 0.15) {
      setFaceGuidance({
        message: centerY < videoHeight / 2 ? 
          "Please move down a bit ⬇️" : 
          "Please move up a bit ⬆️",
        type: "warning",
        canCapture: false
      });
      return;
    }
    
    // Face is well positioned
    if (faceSize >= 0.15 && faceSize <= 0.35 && horizontalDeviation < 0.1 && verticalDeviation < 0.1) {
      setFaceGuidance({
        message: "Perfect! You can take the photo now 📸✨",
        type: "success",
        canCapture: true
      });
    } else {
      setFaceGuidance({
        message: "Good! Please hold still for better positioning 👀",
        type: "info",
        canCapture: true
      });
    }
  }, [lastDetectionTime]);
  
  // Start face detection
  const startFaceDetection = useCallback(() => {
    if (faceDetectionInterval) {
      clearInterval(faceDetectionInterval);
    }
    
    const interval = setInterval(() => {
      detectFace();
    }, 300); // Check every 300ms for better performance
    
    setFaceDetectionInterval(interval);
  }, [detectFace, faceDetectionInterval]);
  
  // Stop face detection
  const stopFaceDetection = useCallback(() => {
    if (faceDetectionInterval) {
      clearInterval(faceDetectionInterval);
      setFaceDetectionInterval(null);
    }
  }, [faceDetectionInterval]);

  // YouCam SDK initialization with enhanced face detection
  const initializeYMK = useCallback(() => {
    console.log('Initializing YouCam SDK with face detection...');
    
    if (window.YMK) {
      console.log('Available YMK methods:', Object.keys(window.YMK));
      
      try {
        // Check what methods are actually available
        const availableMethods = Object.keys(window.YMK).filter(key => typeof window.YMK[key] === 'function');
        console.log('Available YMK functions:', availableMethods);
        
        // Try different initialization methods that might be available
        let initMethod = null;
        if (window.YMK.init && typeof window.YMK.init === 'function') {
          initMethod = 'init';
        } else if (window.YMK.initialize && typeof window.YMK.initialize === 'function') {
          initMethod = 'initialize';
        } else if (window.YMK.setup && typeof window.YMK.setup === 'function') {
          initMethod = 'setup';
        }
        
        if (initMethod) {
          console.log(`Using ${initMethod} method for SDK initialization`);
          
          const config = {
            modelPath: "https://plugins-media.makeupar.com/v1.0-skincare-camera-kit/",
            enableFaceDetection: true,
            enableFaceTracking: true,
            faceDetectionThreshold: 0.7,
            onFaceDetected: (faceData: any) => {
              console.log('Face detected:', faceData);
              handleYouCamFaceDetection(faceData);
            },
            onFaceLost: () => {
              console.log('Face lost');
              setFaceGuidance({
                message: "Please show your face in the camera view 👤",
                type: "error",
                canCapture: false
              });
            }
          };
          
          const initPromise = window.YMK[initMethod](config);
          
          // Check if the method returns a promise
          if (initPromise && typeof initPromise.then === 'function') {
            initPromise.then((instance: any) => {
              console.log('YouCam SDK initialized successfully');
              ymkInstanceRef.current = instance;
              setIsSDKLoaded(true);
              setFaceGuidance({
                message: "YouCam SDK ready - Enhanced face detection enabled",
                type: "success",
                canCapture: false
              });
            }).catch((error: any) => {
              console.error('YouCam SDK initialization failed:', error);
              fallbackToWebcam();
            });
          } else {
            // Synchronous initialization
            console.log('SDK initialized synchronously');
            ymkInstanceRef.current = initPromise || window.YMK;
            setIsSDKLoaded(true);
            setFaceGuidance({
              message: "YouCam SDK ready - Enhanced face detection enabled",
              type: "success",
              canCapture: false
            });
          }
        } else {
          console.warn('No suitable initialization method found in YouCam SDK');
          console.log('Falling back to standard webcam mode');
          fallbackToWebcam();
        }
        
      } catch (error) {
        console.error('YouCam SDK setup error:', error);
        fallbackToWebcam();
      }
    } else {
      console.log('YouCam SDK object not found');
      fallbackToWebcam();
    }
  }, []);
  
  // Fallback to standard webcam
  const fallbackToWebcam = useCallback(() => {
    console.log('Using standard webcam mode');
    setUseWebcam(true);
    setIsSDKLoaded(true);
    setFaceGuidance({
      message: "Standard camera mode - Ready to start",
      type: "info",
      canCapture: false
    });
  }, []);
  
  // Handle YouCam face detection results
  const handleYouCamFaceDetection = useCallback((faceData: any) => {
    if (!faceData || !faceData.faces || faceData.faces.length === 0) {
      setFaceGuidance({
        message: "Please show your face in the camera view 👤",
        type: "error",
        canCapture: false
      });
      return;
    }
    
    const face = faceData.faces[0]; // Take the first detected face
    const { x, y, width, height, confidence } = face;
    
    // Analyze face position and quality
    const frameWidth = faceData.frameWidth || 640;
    const frameHeight = faceData.frameHeight || 480;
    
    // Calculate face center
    const faceCenterX = x + width / 2;
    const faceCenterY = y + height / 2;
    
    // Calculate frame center
    const frameCenterX = frameWidth / 2;
    const frameCenterY = frameHeight / 2;
    
    // Calculate deviations
    const horizontalDeviation = Math.abs(faceCenterX - frameCenterX) / frameWidth;
    const verticalDeviation = Math.abs(faceCenterY - frameCenterY) / frameHeight;
    
    // Calculate face size ratio
    const faceArea = (width * height) / (frameWidth * frameHeight);
    
    // Provide guidance based on analysis
    analyzeYouCamFacePosition(faceArea, horizontalDeviation, verticalDeviation, faceCenterX, frameCenterX, faceCenterY, frameCenterY, confidence);
  }, []);
  
  // Analyze YouCam face position with detailed guidance
  const analyzeYouCamFacePosition = useCallback((
    faceArea: number, 
    horizontalDev: number, 
    verticalDev: number, 
    faceCenterX: number, 
    frameCenterX: number, 
    faceCenterY: number, 
    frameCenterY: number,
    confidence: number
  ) => {
    // Check confidence level
    if (confidence < 0.7) {
      setFaceGuidance({
        message: "Please ensure good lighting and clear face visibility 💡",
        type: "warning",
        canCapture: false
      });
      return;
    }
    
    // Check face size
    if (faceArea < 0.08) {
      setFaceGuidance({
        message: "Please move closer to the camera 🔍",
        type: "warning",
        canCapture: false
      });
      return;
    }
    
    if (faceArea > 0.5) {
      setFaceGuidance({
        message: "Please move back a little - too close ↩️",
        type: "warning",
        canCapture: false
      });
      return;
    }
    
    // Check horizontal position
    if (horizontalDev > 0.15) {
      setFaceGuidance({
        message: faceCenterX < frameCenterX ? 
          "Please move to the right ➡️" : 
          "Please move to the left ⬅️",
        type: "warning",
        canCapture: false
      });
      return;
    }
    
    // Check vertical position
    if (verticalDev > 0.12) {
      setFaceGuidance({
        message: faceCenterY < frameCenterY ? 
          "Please move down a bit ⬇️" : 
          "Please move up a bit ⬆️",
        type: "warning",
        canCapture: false
      });
      return;
    }
    
    // Perfect positioning
    if (faceArea >= 0.12 && faceArea <= 0.4 && horizontalDev < 0.08 && verticalDev < 0.08) {
      setFaceGuidance({
        message: "Perfect! Ready to capture 📸✨",
        type: "success",
        canCapture: true
      });
    } else {
      setFaceGuidance({
        message: "Good positioning! Hold still for perfect shot 👀",
        type: "info",
        canCapture: true
      });
    }
  }, []);

  const handleSDKLoad = useCallback(() => {
    console.log('YouCam SDK script loaded via onLoad event');
    // Add a small delay to ensure SDK is fully initialized
    setTimeout(() => {
      if (window.YMK && typeof window.YMK === 'object') {
        console.log('YouCam SDK object found, initializing...');
        initializeYMK();
      } else {
        console.log('YouCam SDK not available, using standard webcam');
        setUseWebcam(true);
        setIsSDKLoaded(true);
      }
    }, 100);
  }, [initializeYMK]);

  // YouCam camera controls
  const openYouCamCamera = useCallback(() => {
    if (ymkInstanceRef.current) {
      try {
        console.log('Opening YouCam camera...');
        setFaceGuidance({
          message: "Preparing camera...",
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
            message: "Please center your face on the screen 📷",
            type: "info",
            canCapture: false
          });
          startFaceDetection();
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
      message: "Please open the camera",
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
        message: "Please adjust your face position first!"
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
    
    // Stop any existing streams first
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    // Set camera as opening to trigger UI update
    setIsCameraOpen(true);
    setIsVideoReady(false);
    setCameraError(null);
    
    setFaceGuidance({
      message: "Preparing camera...",
      type: "info", 
      canCapture: false
    });
    
    // Stop any existing face detection
    if (faceDetectionInterval) {
      clearInterval(faceDetectionInterval);
      setFaceDetectionInterval(null);
    }
    
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
      message: "Please open the camera",
      type: "info",
      canCapture: false
    });
  }, []); // Remove cleanup dependency

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
  }, [isVideoReady, onImageCapture]); // Remove cleanup dependency

  // Effects
  useEffect(() => {
    // Initial setup
    if (!isSecureContext()) {
      setCameraError('Camera requires HTTPS or localhost');
    } else if (!isGetUserMediaAvailable()) {
      setCameraError('Browser does not support camera');
    }
    
    // Check if SDK is already loaded when component mounts
    const checkSDKStatus = () => {
      if (window.YMK && typeof window.YMK === 'object') {
        console.log('SDK already loaded on mount, initializing...');
        initializeYMK();
      } else {
        console.log('SDK not loaded yet, will wait for script load event');
      }
    };
    
    // Small delay to ensure any existing scripts have had time to load
    const timeoutId = setTimeout(checkSDKStatus, 100);
    
    // Only return cleanup on unmount
    return () => {
      console.log('Component unmounting, cleaning up...');
      clearTimeout(timeoutId);
      cleanup();
    };
  }, [initializeYMK]); // Add initializeYMK as dependency

  return (
    <div className="w-full">
      <Script
        src="https://plugins-media.makeupar.com/v1.0-skincare-camera-kit/sdk.js"
        onLoad={handleSDKLoad}
        onError={() => {
          console.log('SDK script failed to load, using standard webcam');
          setUseWebcam(true);
          setIsSDKLoaded(true);
        }}
        strategy="afterInteractive"
      />

      <div className="mb-4 p-3 bg-gray-100 rounded-lg">
        <p className="text-sm text-gray-600">
          📷 WebCam Camera Mode
        </p>
      </div>

      {/* Enhanced Face Guidance Display */}
      {isCameraOpen && (
        <div className={`mb-4 p-4 rounded-lg border-2 transition-all duration-500 transform ${
          faceGuidance.type === 'success' ? 'bg-green-50 border-green-200 shadow-green-100 scale-105' :
          faceGuidance.type === 'warning' ? 'bg-yellow-50 border-yellow-200 shadow-yellow-100' :
          faceGuidance.type === 'error' ? 'bg-red-50 border-red-200 shadow-red-100 animate-pulse' :
          'bg-blue-50 border-blue-200 shadow-blue-100'
        } shadow-lg`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className={`w-4 h-4 rounded-full mr-3 transition-all duration-300 ${
                faceGuidance.type === 'success' ? 'bg-green-500 animate-pulse' :
                faceGuidance.type === 'warning' ? 'bg-yellow-500' :
                faceGuidance.type === 'error' ? 'bg-red-500 animate-bounce' :
                'bg-blue-500'
              }`}></div>
              <p className={`font-semibold text-lg ${
                faceGuidance.type === 'success' ? 'text-green-800' :
                faceGuidance.type === 'warning' ? 'text-yellow-800' :
                faceGuidance.type === 'error' ? 'text-red-800' :
                'text-blue-800'
              }`}>
                {faceGuidance.message}
              </p>
            </div>
            
            {/* Capture Status Indicator */}
            <div className={`px-3 py-1 rounded-full text-xs font-medium ${
              faceGuidance.canCapture ? 
                'bg-green-100 text-green-800 border border-green-200' : 
                'bg-gray-100 text-gray-600 border border-gray-200'
            }`}>
              {faceGuidance.canCapture ? '📸 Ready' : '⏳ Adjusting'}
            </div>
          </div>
          
          {/* Face Detection Metrics */}
          {faceMetrics.faceCount > 0 && (
            <div className="mt-3 flex items-center space-x-4 text-xs text-gray-600">
              <div className="flex items-center">
                <span className="w-2 h-2 bg-green-400 rounded-full mr-1"></span>
                Face detected
              </div>
              <div className="flex items-center">
                <span className="w-2 h-2 bg-blue-400 rounded-full mr-1"></span>
                Position: {faceMetrics.isFrameCentered ? 'Centered' : 'Adjusting'}
              </div>
              <div className="flex items-center">
                <span className="w-2 h-2 bg-purple-400 rounded-full mr-1"></span>
                Quality: {Math.round(faceMetrics.faceSize)}%
              </div>
            </div>
          )}
          
          {/* Progress Bar for Face Positioning */}
          <div className="mt-3">
            <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
              <span>Face Position Quality</span>
              <span>{faceGuidance.canCapture ? '100%' : '60%'}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-500 ${
                  faceGuidance.canCapture ? 'bg-green-500 w-full' : 'bg-yellow-500 w-3/5'
                }`}
              ></div>
            </div>
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
                
                {/* Video Element */}
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
                  <div className="absolute inset-0 pointer-events-none">
                    {/* Center Guide Circle */}
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                      <div className={`w-48 h-64 border-2 rounded-full transition-all duration-300 ${
                        faceGuidance.canCapture 
                          ? 'border-green-400 shadow-lg shadow-green-400/50' 
                          : faceGuidance.type === 'error'
                          ? 'border-red-400 shadow-lg shadow-red-400/50 animate-pulse'
                          : 'border-yellow-400 shadow-lg shadow-yellow-400/30'
                      }`}>
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
                    
                    {/* Status Indicator */}
                    <div className="absolute top-4 left-4 right-4">
                      <div className={`text-center text-sm font-medium px-3 py-2 rounded-lg backdrop-blur-sm ${
                        faceGuidance.canCapture 
                          ? 'bg-green-900/80 text-green-100' 
                          : faceGuidance.type === 'error'
                          ? 'bg-red-900/80 text-red-100'
                          : 'bg-yellow-900/80 text-yellow-100'
                      }`}>
                        {faceGuidance.canCapture ? '✓ Perfect Position' : 'Position Your Face'}
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
                            <div className="text-white text-6xl animate-pulse">↩️</div>
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

      <div className="mt-4 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-semibold text-sm text-blue-900 mb-2">
          📋 Camera Usage Tips:
        </h3>
        <ul className="text-xs text-blue-700 space-y-1">
          <li>• Please allow camera access in your browser</li>
          <li>• Ensure good lighting for better face detection</li>
          <li>• Position your face within the oval guide</li>
          <li>• Keep your face centered and at proper distance</li>
          <li>• For accurate skin analysis, please remove makeup</li>
          <li>• Wait for the green "Perfect!" message before capturing</li>
        </ul>
        
        <div className="mt-3 p-2 bg-white rounded border border-blue-200">
          <p className="text-xs text-blue-600 font-medium">
            💡 <strong>Pro Tip:</strong> The system will guide you with real-time feedback. 
            Follow the on-screen directions for optimal photo quality.
          </p>
        </div>
      </div>
    </div>
  );
}