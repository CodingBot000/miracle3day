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

// faceQualityChanged interface based on YouCam API spec
interface FaceQuality {
  hasFace: boolean;
  area: "good" | "notgood" | "toosmall" | "outofboundary";
  frontal: "good" | "notgood";
  lighting: "good" | "ok" | "notgood";
  nakedeye: "good" | "notgood";
  faceangle: "good" | "upward" | "downward" | "leftward" | "rightward" | "lefttilt" | "righttilt";
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
    positionQuality: number;
    lightingQuality: number;
    straightnessQuality: number;
  }>({ 
    faceCount: 0, 
    faceSize: 0, 
    faceCenterX: 0, 
    faceCenterY: 0, 
    isFrameCentered: false, 
    positionQuality: 0,
    lightingQuality: 0,
    straightnessQuality: 0
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

  // Calculate face position quality score (0-100)
  const calculatePositionQuality = useCallback((hasFace: boolean, faceSize: number, centerX: number, centerY: number, videoWidth: number, videoHeight: number) => {
    if (!hasFace) return 0;
    
    // Calculate size score (0-40 points)
    let sizeScore = 0;
    if (faceSize >= 15 && faceSize <= 35) {
      sizeScore = 40; // Perfect size
    } else if (faceSize >= 10 && faceSize <= 40) {
      sizeScore = 25; // Good size
    } else if (faceSize >= 5 && faceSize <= 50) {
      sizeScore = 10; // Acceptable size
    }
    
    // Calculate horizontal position score (0-30 points)
    const horizontalDeviation = Math.abs(centerX - videoWidth / 2) / videoWidth;
    let horizontalScore = 0;
    if (horizontalDeviation < 0.05) {
      horizontalScore = 30; // Perfect center
    } else if (horizontalDeviation < 0.1) {
      horizontalScore = 25; // Very good
    } else if (horizontalDeviation < 0.15) {
      horizontalScore = 15; // Good
    } else if (horizontalDeviation < 0.2) {
      horizontalScore = 5; // Acceptable
    }
    
    // Calculate vertical position score (0-30 points)
    const verticalDeviation = Math.abs(centerY - videoHeight / 2) / videoHeight;
    let verticalScore = 0;
    if (verticalDeviation < 0.05) {
      verticalScore = 30; // Perfect center
    } else if (verticalDeviation < 0.1) {
      verticalScore = 25; // Very good
    } else if (verticalDeviation < 0.12) {
      verticalScore = 15; // Good
    } else if (verticalDeviation < 0.15) {
      verticalScore = 5; // Acceptable
    }
    
    const totalScore = sizeScore + horizontalScore + verticalScore;
    return Math.min(100, Math.max(0, totalScore));
  }, []);

  // Calculate lighting quality score (0-100)
  const calculateLightingQuality = useCallback((avgBrightness: number, brightnessVariance: number) => {
    let score = 0;
    
    // Brightness score (0-60 points)
    if (avgBrightness >= 80 && avgBrightness <= 180) {
      score += 60; // Perfect lighting
    } else if (avgBrightness >= 60 && avgBrightness <= 200) {
      score += 40; // Good lighting
    } else if (avgBrightness >= 40 && avgBrightness <= 220) {
      score += 20; // Acceptable lighting
    }
    
    // Variance score (0-40 points) - too much variance means uneven lighting
    if (brightnessVariance >= 20 && brightnessVariance <= 60) {
      score += 40; // Good contrast
    } else if (brightnessVariance >= 15 && brightnessVariance <= 80) {
      score += 25; // Acceptable contrast
    } else if (brightnessVariance >= 10) {
      score += 10; // Some contrast
    }
    
    return Math.min(100, Math.max(0, score));
  }, []);

  // Calculate face straightness quality (0-100)
  const calculateStraightnessQuality = useCallback((edgeRatio: number, symmetryScore: number = 50) => {
    let score = 0;
    
    // Edge density indicates facial features visibility
    if (edgeRatio >= 0.05 && edgeRatio <= 0.15) {
      score += 50; // Good feature visibility
    } else if (edgeRatio >= 0.03 && edgeRatio <= 0.2) {
      score += 30; // Acceptable visibility
    } else if (edgeRatio >= 0.01) {
      score += 10; // Some features visible
    }
    
    // Symmetry score (simplified)
    score += Math.min(50, symmetryScore);
    
    return Math.min(100, Math.max(0, score));
  }, []);

  // Calculate FaceQuality based on YouCam API spec
  const calculateFaceQuality = useCallback((
    hasFace: boolean,
    faceSize: number,
    centerX: number,
    centerY: number,
    videoWidth: number,
    videoHeight: number,
    avgBrightness: number,
    brightnessVariance: number,
    edgeRatio: number
  ): FaceQuality => {
    // Area assessment
    let area: FaceQuality['area'] = "outofboundary";
    if (hasFace) {
      if (faceSize >= 15 && faceSize <= 35) {
        area = "good";
      } else if (faceSize < 10) {
        area = "toosmall";
      } else if (faceSize > 50) {
        area = "notgood";
      } else {
        area = "notgood";
      }
    }

    // Frontal assessment (based on face symmetry and center position)
    const horizontalDeviation = Math.abs(centerX - videoWidth / 2) / videoWidth;
    const frontal: FaceQuality['frontal'] = 
      hasFace && horizontalDeviation < 0.15 ? "good" : "notgood";

    // Lighting assessment
    let lighting: FaceQuality['lighting'] = "notgood";
    if (avgBrightness >= 80 && avgBrightness <= 180 && brightnessVariance <= 60) {
      lighting = "good";
    } else if (avgBrightness >= 60 && avgBrightness <= 200 && brightnessVariance <= 80) {
      lighting = "ok";
    }

    // Naked eye assessment (simplified - always good for now)
    const nakedeye: FaceQuality['nakedeye'] = "good";

    // Face angle assessment (based on position and edge detection)
    let faceangle: FaceQuality['faceangle'] = "good";
    if (hasFace) {
      const verticalDeviation = Math.abs(centerY - videoHeight / 2) / videoHeight;
      
      if (verticalDeviation > 0.2) {
        faceangle = centerY < videoHeight / 2 ? "upward" : "downward";
      } else if (horizontalDeviation > 0.2) {
        faceangle = centerX < videoWidth / 2 ? "leftward" : "rightward";
      } else if (edgeRatio < 0.02) {
        // Low edge ratio might indicate tilted face
        faceangle = Math.random() > 0.5 ? "lefttilt" : "righttilt";
      }
    } else {
      faceangle = "notgood" as any; // Face not properly positioned
    }

    return {
      hasFace,
      area,
      frontal,
      lighting,
      nakedeye,
      faceangle
    };
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
        console.log('🎥 handleVideoReady called!');
        const video = videoRef.current;
        if (video) {
          console.log('🎥 Video ready - dimensions:', video.videoWidth, 'x', video.videoHeight);
          console.log('🎥 Video state:', {
            readyState: video.readyState,
            networkState: video.networkState,
            hasMetadata: video.videoWidth > 0 && video.videoHeight > 0
          });
        } else {
          console.log('🎥 Video ready but no video ref');
        }
        
        console.log('✨ Setting isVideoReady to true');
        setIsVideoReady(true);
        setFaceGuidance({
          message: "Camera is ready! Please position your face in the center",
          type: "info",
          canCapture: false
        });
        
        // Enhanced video metadata loading with proper event handling
        const waitForMetadata = () => {
          const video = videoRef.current;
          console.log('📋 waitForMetadata called - video dimensions:', video?.videoWidth, 'x', video?.videoHeight);
          
          if (video && video.videoWidth > 0 && video.videoHeight > 0) {
            console.log('✅ Video metadata fully loaded - dimensions:', video.videoWidth, 'x', video.videoHeight);
            console.log('🚀 About to call startFaceDetection');
            startFaceDetection();
          } else {
            console.log('⏳ Video metadata not ready, checking next frame...');
            // Use requestAnimationFrame to check again on the next frame
            requestAnimationFrame(() => {
              const retryVideo = videoRef.current;
              console.log('🔄 Retry check - video dimensions:', retryVideo?.videoWidth, 'x', retryVideo?.videoHeight);
              
              if (retryVideo && retryVideo.videoWidth > 0 && retryVideo.videoHeight > 0) {
                console.log('✅ Video metadata ready on next frame');
                console.log('🚀 About to call startFaceDetection (retry)');
                startFaceDetection();
              } else {
                console.log('⏳ Still not ready, trying timeout...');
                // Final fallback after a short delay
                setTimeout(() => {
                  const finalRetryVideo = videoRef.current;
                  console.log('🔄 Final retry - video dimensions:', finalRetryVideo?.videoWidth, 'x', finalRetryVideo?.videoHeight);
                  
                  if (finalRetryVideo && finalRetryVideo.videoWidth > 0) {
                    console.log('✅ Video metadata ready after timeout');
                    console.log('🚀 About to call startFaceDetection (final retry)');
                    startFaceDetection();
                  } else {
                    console.log('❌ Video metadata still not ready - will retry when detection runs');
                  }
                }, 200);
              }
            });
          }
        };
        
        // Start checking for metadata immediately, then with frame-based timing
        waitForMetadata();
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
          console.log('🕒 Video ready via fallback timeout');
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
  const detectFace = useCallback(() => {
    console.log('🔍 detectFace called');
    
    // Use requestAnimationFrame for smooth video frame processing
    requestAnimationFrame(() => {
      console.log('🖼️ requestAnimationFrame executed');
      
      if (!videoRef.current) {
        console.log('❌ No video ref');
        return;
      }
      
      const video = videoRef.current;
      const videoWidth = video.videoWidth;
      const videoHeight = video.videoHeight;
      
      console.log('detectFace: video dimensions', { 
        videoWidth, 
        videoHeight, 
        readyState: video.readyState,
        hasVideoMetadata: video.videoWidth > 0 && video.videoHeight > 0
      });
      
      if (videoWidth === 0 || videoHeight === 0) {
        console.log('❌ detectFace: invalid dimensions - width:', videoWidth, 'height:', videoHeight);
        console.log('Video element state:', {
          readyState: video.readyState,
          networkState: video.networkState,
          currentTime: video.currentTime,
          duration: video.duration || 'not available'
        });
        return;
      }
      
      console.log('✅ Video dimensions are valid, proceeding with face detection');
      
      try {
        // Create canvas for face detection
        const canvas = document.createElement('canvas');
        canvas.width = videoWidth;
        canvas.height = videoHeight;
        const ctx = canvas.getContext('2d');
        
        if (!ctx) return;
        
        ctx.drawImage(video, 0, 0, videoWidth, videoHeight);
        
        // Enhanced face detection with multiple quality metrics
        const imageData = ctx.getImageData(0, 0, videoWidth, videoHeight);
        const data = imageData.data;
        
        // Face detection region (center area)
        const centerX = videoWidth / 2;
        const centerY = videoHeight / 2;
        const faceRegionSize = Math.min(videoWidth, videoHeight) * 0.4;
        
        // Calculate multiple metrics for face quality assessment
        let totalBrightness = 0;
        let brightnessVariance = 0;
        let edgeCount = 0;
        let pixelCount = 0;
        let skinPixelCount = 0;
        
        const regionStartX = Math.max(0, centerX - faceRegionSize/2);
        const regionEndX = Math.min(videoWidth, centerX + faceRegionSize/2);
        const regionStartY = Math.max(0, centerY - faceRegionSize/2);
        const regionEndY = Math.min(videoHeight, centerY + faceRegionSize/2);
        
        // First pass: calculate average brightness and skin detection
        for (let y = regionStartY; y < regionEndY; y += 2) {
          for (let x = regionStartX; x < regionEndX; x += 2) {
            const i = (Math.floor(y) * videoWidth + Math.floor(x)) * 4;
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            
            const brightness = (r + g + b) / 3;
            totalBrightness += brightness;
            
            // Enhanced skin tone detection
            if (r > 60 && g > 40 && b > 20 && r > b && 
                Math.abs(r - g) < 50 && r < 220 && g < 200 && b < 180) {
              skinPixelCount++;
            }
            
            pixelCount++;
          }
        }
        
        const avgBrightness = totalBrightness / pixelCount;
        
        // Second pass: calculate variance and edge detection
        for (let y = regionStartY + 1; y < regionEndY - 1; y += 2) {
          for (let x = regionStartX + 1; x < regionEndX - 1; x += 2) {
            const i = (Math.floor(y) * videoWidth + Math.floor(x)) * 4;
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            
            const brightness = (r + g + b) / 3;
            brightnessVariance += Math.pow(brightness - avgBrightness, 2);
            
            // Simple edge detection
            if (x > 0 && x < videoWidth - 1 && y > 0 && y < videoHeight - 1) {
              const iLeft = (Math.floor(y) * videoWidth + Math.floor(x - 1)) * 4;
              const iRight = (Math.floor(y) * videoWidth + Math.floor(x + 1)) * 4;
              const iUp = (Math.floor(y - 1) * videoWidth + Math.floor(x)) * 4;
              const iDown = (Math.floor(y + 1) * videoWidth + Math.floor(x)) * 4;
              
              const horizontalGrad = Math.abs((data[iRight] + data[iRight + 1] + data[iRight + 2]) - 
                                            (data[iLeft] + data[iLeft + 1] + data[iLeft + 2]));
              const verticalGrad = Math.abs((data[iDown] + data[iDown + 1] + data[iDown + 2]) - 
                                          (data[iUp] + data[iUp + 1] + data[iUp + 2]));
              
              if (horizontalGrad > 30 || verticalGrad > 30) {
                edgeCount++;
              }
            }
          }
        }
        
        brightnessVariance = Math.sqrt(brightnessVariance / pixelCount);
        const skinRatio = skinPixelCount / pixelCount;
        const edgeRatio = edgeCount / pixelCount;
        
        // Face detection based on multiple factors (more lenient for debugging)
        const hasFace = skinRatio > 0.05 && // Minimum skin pixels (reduced)
                       brightnessVariance > 10 && // Sufficient texture (reduced)
                       edgeRatio > 0.01 && // Sufficient edges (reduced)
                       avgBrightness > 20 && avgBrightness < 250; // Reasonable lighting (expanded)
        
        console.log('Face detection criteria:', {
          skinRatioCheck: skinRatio > 0.05,
          brightnessVarianceCheck: brightnessVariance > 10,
          edgeRatioCheck: edgeRatio > 0.01,
          brightnessCheck: avgBrightness > 20 && avgBrightness < 250,
          finalHasFace: hasFace
        });
        
        // Calculate quality scores
        const positionQuality = calculatePositionQuality(hasFace, skinRatio * 100, centerX, centerY, videoWidth, videoHeight);
        const lightingQuality = calculateLightingQuality(avgBrightness, brightnessVariance);
        const straightnessQuality = calculateStraightnessQuality(edgeRatio);
        
        // Calculate FaceQuality based on YouCam API spec
        const faceQuality = calculateFaceQuality(
          hasFace,
          skinRatio * 100,
          centerX,
          centerY,
          videoWidth,
          videoHeight,
          avgBrightness,
          brightnessVariance,
          edgeRatio
        );
        
        // Detailed debug output
        console.log('Face Detection Results:', {
          hasFace,
          skinRatio: skinRatio.toFixed(3),
          skinPixelCount,
          pixelCount,
          avgBrightness: avgBrightness.toFixed(1),
          brightnessVariance: brightnessVariance.toFixed(1),
          edgeRatio: edgeRatio.toFixed(3),
          edgeCount,
          positionQuality: positionQuality.toFixed(1),
          lightingQuality: lightingQuality.toFixed(1),
          straightnessQuality: straightnessQuality.toFixed(1),
          faceSize: (skinRatio * 100).toFixed(1)
        });
        
        // Update face metrics with all quality scores
        setFaceMetrics({
          faceCount: hasFace ? 1 : 0,
          faceSize: skinRatio * 100,
          faceCenterX: centerX,
          faceCenterY: centerY,
          isFrameCentered: hasFace && skinRatio > 0.2,
          positionQuality,
          lightingQuality,
          straightnessQuality
        });
        
        console.log('setFaceMetrics called with:', {
          positionQuality,
          lightingQuality,
          straightnessQuality,
          faceCount: hasFace ? 1 : 0
        });
        
        // Analyze face position and provide guidance
        analyzeFacePosition(faceQuality, skinRatio, centerX, centerY, videoWidth, videoHeight);
        
      } catch (error) {
        console.error('Face detection error:', error);
      }
    }); // Close requestAnimationFrame
  }, [calculatePositionQuality, calculateLightingQuality, calculateStraightnessQuality]);
  
  // Face position analysis with English messages based on FaceQuality
  const analyzeFacePosition = useCallback((faceQuality: FaceQuality, faceSize: number, centerX: number, centerY: number, videoWidth: number, videoHeight: number) => {
    const now = Date.now();
    
    // Throttle updates to avoid too frequent changes
    if (now - lastDetectionTime < 300) return;
    setLastDetectionTime(now);
    
    if (!faceQuality.hasFace) {
      setFaceGuidance({
        message: "Keep your face inside the circle",
        type: "error",
        canCapture: false
      });
      return;
    }
    
    // Check area (distance from camera) based on FaceQuality.area
    if (faceQuality.area === "toosmall") {
      setFaceGuidance({
        message: "Please move closer to the camera 🔍",
        type: "warning",
        canCapture: false
      });
      return;
    }
    
    if (faceQuality.area === "notgood" && faceSize > 40) {
      setFaceGuidance({
        message: "Please move back a little - too close ↩️",
        type: "warning",
        canCapture: false
      });
      return;
    }

    if (faceQuality.area === "outofboundary") {
      setFaceGuidance({
        message: "Keep your face inside the circle",
        type: "error",
        canCapture: false
      });
      return;
    }
    
    // Check face angle and frontal position based on FaceQuality
    if (faceQuality.faceangle !== "good") {
      let message = "";
      switch (faceQuality.faceangle) {
        case "upward":
          message = "Please move down a bit ⬇️";
          break;
        case "downward":
          message = "Please move up a bit ⬆️";
          break;
        case "leftward":
          message = "Please move to the right ➡️";
          break;
        case "rightward":
          message = "Please move to the left ⬅️";
          break;
        case "lefttilt":
          message = "Please straighten your head (tilt right)";
          break;
        case "righttilt":
          message = "Please straighten your head (tilt left)";
          break;
        default:
          message = "Please adjust your face position";
      }
      
      setFaceGuidance({
        message,
        type: "warning",
        canCapture: false
      });
      return;
    }

    // Check frontal positioning
    if (faceQuality.frontal !== "good") {
      setFaceGuidance({
        message: "Please face the camera directly",
        type: "warning",
        canCapture: false
      });
      return;
    }

    // Check lighting quality
    if (faceQuality.lighting === "notgood") {
      setFaceGuidance({
        message: "Please ensure good lighting and clear face visibility 💡",
        type: "warning",
        canCapture: false
      });
      return;
    }
    
    // Face is well positioned - check all quality criteria
    if (faceQuality.area === "good" && 
        faceQuality.frontal === "good" && 
        faceQuality.faceangle === "good" && 
        (faceQuality.lighting === "good" || faceQuality.lighting === "ok")) {
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
  
  // Start face detection with requestAnimationFrame-based timing
  const startFaceDetection = useCallback(() => {
    console.log('🎯 startFaceDetection function called!');
    console.log('🎯 Starting face detection with requestAnimationFrame...');
    
    // Clear any existing interval
    if (faceDetectionInterval) {
      console.log('⏹️ Clearing existing face detection interval:', faceDetectionInterval);
      clearInterval(faceDetectionInterval);
      setFaceDetectionInterval(null);
    }
    
    // Use interval but with requestAnimationFrame for smoother performance
    console.log('⏱️ Setting up new interval...');
    const interval = setInterval(() => {
      console.log('📸 Interval tick - calling detectFace');
      detectFace();
    }, 166); // ~60fps (1000ms/6 ≈ 166ms) for smooth video processing
    
    setFaceDetectionInterval(interval);
    console.log('✅ Face detection started with 60fps timing, interval ID:', interval);
  }, [detectFace]);
  
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
                message: "Keep your face inside the circle",
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
        message: "Keep your face inside the circle",
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

  // Debug effect to track faceMetrics changes
  useEffect(() => {
    console.log('🔄 faceMetrics updated:', {
      positionQuality: faceMetrics.positionQuality,
      lightingQuality: faceMetrics.lightingQuality,
      straightnessQuality: faceMetrics.straightnessQuality,
      faceCount: faceMetrics.faceCount,
      faceSize: faceMetrics.faceSize.toFixed(1)
    });
  }, [faceMetrics]);

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

      {/* Quality Status Indicators */}
      {isCameraOpen && (
        <div className="mb-4 flex justify-center gap-2">
          {/* Lighting Status */}
          <div className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-300 ${
            faceMetrics.lightingQuality >= 70 ? 'bg-green-100 text-green-800 border border-green-200' :
            faceMetrics.lightingQuality >= 40 ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' :
            'bg-red-100 text-red-800 border border-red-200'
          }`}>
            Lighting {faceMetrics.lightingQuality >= 70 ? 'Good' : 'Not Good'}
          </div>
          
          {/* Look Straight Status */}
          <div className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-300 ${
            faceMetrics.straightnessQuality >= 70 ? 'bg-green-100 text-green-800 border border-green-200' :
            faceMetrics.straightnessQuality >= 40 ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' :
            'bg-red-100 text-red-800 border border-red-200'
          }`}>
            Look Straight {faceMetrics.straightnessQuality >= 70 ? 'Good' : 'Not Good'}
          </div>
          
          {/* Face Position Status */}
          <div className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-300 ${
            faceMetrics.positionQuality >= 70 ? 'bg-green-100 text-green-800 border border-green-200' :
            faceMetrics.positionQuality >= 40 ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' :
            'bg-red-100 text-red-800 border border-red-200'
          }`}>
            Face Position {faceMetrics.positionQuality >= 70 ? 'Good' : 'Not Good'}
          </div>
        </div>
      )}

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