'use client';

import { log } from '@/utils/logger';
import { useRef, useState, useCallback, useEffect } from 'react';
import Script from 'next/script';

import CameraGuideStatus from './CameraGuideStatus';
import CameraView from './CameraView';

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

  // Calculate face position quality score (0-100) with corrected distance scoring
  const calculatePositionQuality = useCallback((hasFace: boolean, faceSize: number, centerX: number, centerY: number, videoWidth: number, videoHeight: number, straightnessQuality: number = 100) => {
    if (!hasFace) return 0;
    
    log.debug('🎯 calculatePositionQuality called with:', {
      faceSize: faceSize.toFixed(1),
      straightnessQuality: straightnessQuality.toFixed(1),
      centerPos: { x: centerX.toFixed(1), y: centerY.toFixed(1) }
    });
    
    // FIXED SIZE SCORING: Reward larger faces (closer to camera) with higher scores
    let sizeScore = 0;
    if (faceSize >= 60 && faceSize <= 90) {
      sizeScore = 40; // Perfect size - face fills screen well (close to camera)
    } else if (faceSize >= 40 && faceSize <= 95) {
      sizeScore = 35; // Very good size - good distance
    } else if (faceSize >= 25 && faceSize <= 100) {
      sizeScore = 30; // Good size - acceptable distance
    } else if (faceSize >= 15 && faceSize < 25) {
      sizeScore = 20; // Acceptable but distant
    } else if (faceSize >= 10 && faceSize < 15) {
      sizeScore = 10; // Too distant - low score
    } else if (faceSize >= 5) {
      sizeScore = 5; // Very distant - minimal score
    } else {
      sizeScore = 0; // Face too small/distant - no points
    }
    
    log.debug('📏 Size scoring:', {
      faceSize: faceSize.toFixed(1),
      sizeScore,
      reasoning: faceSize >= 60 && faceSize <= 90 ? 'Perfect size - close to camera' :
                 faceSize >= 40 && faceSize <= 95 ? 'Very good size' :
                 faceSize >= 25 && faceSize <= 100 ? 'Good size' :
                 faceSize >= 15 && faceSize < 25 ? 'Acceptable but distant' :
                 faceSize >= 10 && faceSize < 15 ? 'Too distant' :
                 faceSize >= 5 ? 'Very distant' : 'Face too small/distant'
    });
    
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
    
    // ADJUSTED: Less harsh straightness penalty to allow higher position scores
    let straightnessMultiplier = 1.0;
    if (straightnessQuality < 50) {
      // Strong penalty only for very poor straightness
      straightnessMultiplier = Math.max(0.4, straightnessQuality / 100);
    } else if (straightnessQuality < 70) {
      // Moderate penalty for moderate straightness issues
      straightnessMultiplier = Math.max(0.6, straightnessQuality / 100);
    } else {
      // Minimal penalty for good straightness
      straightnessMultiplier = Math.max(0.85, straightnessQuality / 100);
    }
    
    const baseScore = sizeScore + horizontalScore + verticalScore;
    const finalScore = baseScore * straightnessMultiplier;
    
    log.debug('🔢 Position Quality Calculation:', {
      sizeScore,
      horizontalScore,
      verticalScore,
      baseScore,
      straightnessQuality: straightnessQuality.toFixed(1),
      straightnessMultiplier: straightnessMultiplier.toFixed(3),
      finalScore: finalScore.toFixed(1)
    });
    
    return Math.min(100, Math.max(0, finalScore));
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

  // Calculate face straightness quality (0-100) - improved with symmetry analysis
  const calculateStraightnessQuality = useCallback((edgeRatio: number, faceCenterX: number, faceCenterY: number, videoWidth: number, videoHeight: number, imageData?: ImageData) => {
    let score = 0;
    
    // Edge density indicates facial features visibility (0-30 points)
    if (edgeRatio >= 0.05 && edgeRatio <= 0.15) {
      score += 30; // Good feature visibility
    } else if (edgeRatio >= 0.03 && edgeRatio <= 0.2) {
      score += 20; // Acceptable visibility
    } else if (edgeRatio >= 0.01) {
      score += 10; // Some features visible
    }
    
    // Face symmetry analysis for actual straightness detection (0-70 points)
    if (imageData) {
      const data = imageData.data;
      const centerX = videoWidth / 2;
      const centerY = videoHeight / 2;
      const faceRegionSize = Math.min(videoWidth, videoHeight) * 0.3;
      
      const regionStartX = Math.max(0, centerX - faceRegionSize/2);
      const regionEndX = Math.min(videoWidth, centerX + faceRegionSize/2);
      const regionStartY = Math.max(0, centerY - faceRegionSize/2);
      const regionEndY = Math.min(videoHeight, centerY + faceRegionSize/2);
      
      // Analyze left and right side symmetry
      let leftSideBrightness = 0;
      let rightSideBrightness = 0;
      let leftPixelCount = 0;
      let rightPixelCount = 0;
      
      // Analyze upper and lower face for tilt detection
      let upperBrightness = 0;
      let lowerBrightness = 0;
      let upperPixelCount = 0;
      let lowerPixelCount = 0;
      
      for (let y = regionStartY; y < regionEndY; y += 2) {
        for (let x = regionStartX; x < regionEndX; x += 2) {
          const i = (Math.floor(y) * videoWidth + Math.floor(x)) * 4;
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          
          // Enhanced skin tone detection for face analysis
          if (r > 60 && g > 40 && b > 20 && r > b && 
              Math.abs(r - g) < 50 && r < 220 && g < 200 && b < 180) {
            
            const brightness = (r + g + b) / 3;
            
            // Left vs Right analysis
            if (x < centerX - 10) { // Left side (with margin)
              leftSideBrightness += brightness;
              leftPixelCount++;
            } else if (x > centerX + 10) { // Right side (with margin)
              rightSideBrightness += brightness;
              rightPixelCount++;
            }
            
            // Upper vs Lower analysis
            if (y < centerY - 5) { // Upper face (with margin)
              upperBrightness += brightness;
              upperPixelCount++;
            } else if (y > centerY + 5) { // Lower face (with margin)
              lowerBrightness += brightness;
              lowerPixelCount++;
            }
          }
        }
      }
      
      // Calculate symmetry scores
      if (leftPixelCount > 10 && rightPixelCount > 10) {
        const leftAvg = leftSideBrightness / leftPixelCount;
        const rightAvg = rightSideBrightness / rightPixelCount;
        const horizontalSymmetry = 1 - Math.min(1, Math.abs(leftAvg - rightAvg) / Math.max(leftAvg, rightAvg));
        
        // Horizontal symmetry score (0-40 points)
        if (horizontalSymmetry > 0.85) {
          score += 40; // Very symmetric - looking straight
        } else if (horizontalSymmetry > 0.75) {
          score += 25; // Good symmetry
        } else if (horizontalSymmetry > 0.6) {
          score += 10; // Some symmetry
        }
        // If symmetry < 0.6, likely not looking straight - no points added
      }
      
      // Vertical tilt analysis (0-30 points)
      if (upperPixelCount > 10 && lowerPixelCount > 10) {
        const upperAvg = upperBrightness / upperPixelCount;
        const lowerAvg = lowerBrightness / lowerPixelCount;
        const verticalBalance = 1 - Math.min(1, Math.abs(upperAvg - lowerAvg) / Math.max(upperAvg, lowerAvg));
        
        if (verticalBalance > 0.8) {
          score += 30; // Good vertical balance
        } else if (verticalBalance > 0.7) {
          score += 20; // Acceptable balance
        } else if (verticalBalance > 0.5) {
          score += 10; // Some balance
        }
      }
      
    } else {
      // Fallback to position-based analysis if no image data (0-40 points)
      const centerX = videoWidth / 2;
      const centerY = videoHeight / 2;
      
      const horizontalDeviation = Math.abs(faceCenterX - centerX) / videoWidth;
      if (horizontalDeviation < 0.05) {
        score += 25;
      } else if (horizontalDeviation < 0.1) {
        score += 15;
      } else if (horizontalDeviation < 0.15) {
        score += 5;
      }
      
      const verticalDeviation = Math.abs(faceCenterY - centerY) / videoHeight;
      if (verticalDeviation < 0.08) {
        score += 15;
      } else if (verticalDeviation < 0.15) {
        score += 10;
      }
    }
    
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
    log.debug('Cleaning up camera resources...');
    
    // Stop face detection directly
    if (faceDetectionInterval) {
      clearInterval(faceDetectionInterval);
      setFaceDetectionInterval(null);
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        track.stop();
        log.debug('Stopped track:', track.kind);
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
    log.debug('Starting webcam...');
    
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
      log.debug('Requesting camera stream...');
      
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user'
        }
      });
      
      log.debug('Stream obtained:', stream.id);
      
      // Wait for video ref to be available with retry logic
      let retryCount = 0;
      const maxRetries = 20; // 2 seconds total wait
      
      while (!videoRef.current && retryCount < maxRetries) {
        log.debug(`Waiting for video ref... attempt ${retryCount + 1}`);
        await new Promise(resolve => setTimeout(resolve, 100));
        retryCount++;
      }
      
      if (!videoRef.current) {
        console.error('Video ref still not available after retries');
        stream.getTracks().forEach(track => track.stop());
        setCameraError('Camera component not ready. Please try again.');
        return;
      }

      log.debug('Video ref is now available');

      // Store stream reference
      streamRef.current = stream;
      videoRef.current.srcObject = stream;
      
      // Simple video ready detection
      const handleVideoReady = () => {
        log.debug('🎥 handleVideoReady called!');
        const video = videoRef.current;
        if (video) {
          log.debug('🎥 Video ready - dimensions:', video.videoWidth, 'x', video.videoHeight);
          log.debug('🎥 Video state:', {
            readyState: video.readyState,
            networkState: video.networkState,
            hasMetadata: video.videoWidth > 0 && video.videoHeight > 0
          });
        } else {
          log.debug('🎥 Video ready but no video ref');
        }
        
        log.debug('Setting isVideoReady to true');
        setIsVideoReady(true);
        setFaceGuidance({
          message: "Camera is ready! Please position your face in the center",
          type: "info",
          canCapture: false
        });
        
        // Enhanced video metadata loading with proper event handling
        const waitForMetadata = () => {
          const video = videoRef.current;
          log.debug('📋 waitForMetadata called - video dimensions:', video?.videoWidth, 'x', video?.videoHeight);
          
          if (video && video.videoWidth > 0 && video.videoHeight > 0) {
            log.debug('✅ Video metadata fully loaded - dimensions:', video.videoWidth, 'x', video.videoHeight);
            log.debug('🚀 About to call startFaceDetection');
            startFaceDetection();
          } else {
            log.debug('⏳ Video metadata not ready, checking next frame...');
            // Use requestAnimationFrame to check again on the next frame
            requestAnimationFrame(() => {
              const retryVideo = videoRef.current;
              log.debug('🔄 Retry check - video dimensions:', retryVideo?.videoWidth, 'x', retryVideo?.videoHeight);
              
              if (retryVideo && retryVideo.videoWidth > 0 && retryVideo.videoHeight > 0) {
                log.debug('✅ Video metadata ready on next frame');
                log.debug('🚀 About to call startFaceDetection (retry)');
                startFaceDetection();
              } else {
                log.debug('⏳ Still not ready, trying timeout...');
                // Final fallback after a short delay
                setTimeout(() => {
                  const finalRetryVideo = videoRef.current;
                  log.debug('🔄 Final retry - video dimensions:', finalRetryVideo?.videoWidth, 'x', finalRetryVideo?.videoHeight);
                  
                  if (finalRetryVideo && finalRetryVideo.videoWidth > 0) {
                    log.debug('✅ Video metadata ready after timeout');
                    log.debug('🚀 About to call startFaceDetection (final retry)');
                    startFaceDetection();
                  } else {
                    log.debug('❌ Video metadata still not ready - will retry when detection runs');
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
          log.debug('🕒 Video ready via fallback timeout');
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
    log.debug('🔍 detectFace called');
    
    // Use requestAnimationFrame for smooth video frame processing
    requestAnimationFrame(() => {
      log.debug('🖼️ requestAnimationFrame executed');
      
      if (!videoRef.current) {
        log.debug('❌ No video ref');
        return;
      }
      
      const video = videoRef.current;
      const videoWidth = video.videoWidth;
      const videoHeight = video.videoHeight;
      
      log.debug('detectFace: video dimensions', { 
        videoWidth, 
        videoHeight, 
        readyState: video.readyState,
        hasVideoMetadata: video.videoWidth > 0 && video.videoHeight > 0
      });
      
      if (videoWidth === 0 || videoHeight === 0) {
        log.debug('❌ detectFace: invalid dimensions - width:', videoWidth, 'height:', videoHeight);
        log.debug('Video element state:', {
          readyState: video.readyState,
          networkState: video.networkState,
          currentTime: video.currentTime,
          duration: video.duration || 'not available'
        });
        return;
      }
      
      log.debug('✅ Video dimensions are valid, proceeding with face detection');
      
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
        
        // MUCH STRICTER face detection logic to prevent false positives when face leaves screen
        const hasFace = skinRatio > 0.25 && // Much stricter minimum skin pixels (was 0.20)
                       brightnessVariance > 40 && // Better texture detection (was 35)
                       edgeRatio > 0.08 && // Much stricter edge requirement (was 0.05)
                       avgBrightness > 90 && avgBrightness < 190 && // Tighter lighting range
                       skinPixelCount > 2000 && // Much higher minimum absolute skin pixel count (was 1500)
                       skinRatio < 0.75; // Tighter upper bound to prevent false positives
        
        // Even if no face detected, try to find the brightest/most active region for guidance
        let fallbackCenterX = centerX;
        let fallbackCenterY = centerY;
        
        if (!hasFace && skinPixelCount > 0) {
          // Find the region with most skin-like pixels for directional guidance
          let maxSkinPixels = 0;
          let bestX = centerX;
          let bestY = centerY;
          
          // Divide screen into 9 regions and find the one with most skin pixels
          for (let regionY = 0; regionY < 3; regionY++) {
            for (let regionX = 0; regionX < 3; regionX++) {
              const startX = (videoWidth / 3) * regionX;
              const endX = (videoWidth / 3) * (regionX + 1);
              const startY = (videoHeight / 3) * regionY;
              const endY = (videoHeight / 3) * (regionY + 1);
              
              let regionSkinCount = 0;
              
              for (let y = startY; y < endY; y += 4) {
                for (let x = startX; x < endX; x += 4) {
                  const i = (Math.floor(y) * videoWidth + Math.floor(x)) * 4;
                  const r = data[i];
                  const g = data[i + 1];
                  const b = data[i + 2];
                  
                  if (r > 50 && g > 30 && b > 15 && r > b && r < 240) {
                    regionSkinCount++;
                  }
                }
              }
              
              if (regionSkinCount > maxSkinPixels) {
                maxSkinPixels = regionSkinCount;
                bestX = startX + (endX - startX) / 2;
                bestY = startY + (endY - startY) / 2;
              }
            }
          }
          
          if (maxSkinPixels > 10) {
            fallbackCenterX = bestX;
            fallbackCenterY = bestY;
          }
        }
        
        log.debug('🔍 REAL-TIME Face detection criteria (STRICTER):', {
          skinRatio: skinRatio.toFixed(3),
          skinRatioPass: skinRatio > 0.25,
          skinPixelCount,
          skinPixelPass: skinPixelCount > 2000,
          brightnessVariance: brightnessVariance.toFixed(1),
          brightnessVarPass: brightnessVariance > 40,
          edgeRatio: edgeRatio.toFixed(3),
          edgeRatioPass: edgeRatio > 0.08,
          avgBrightness: avgBrightness.toFixed(1),
          brightnessPass: avgBrightness > 90 && avgBrightness < 190,
          skinRatioNotOver: skinRatio < 0.75,
          FINAL_FACE_DETECTED: hasFace,
          timestamp: new Date().toLocaleTimeString()
        });
        
        // Calculate proper face bounds for position quality with dynamic search area
        let actualFaceSize = 0;
        let actualFaceCenterX = centerX;
        let actualFaceCenterY = centerY;
        
        if (hasFace && skinPixelCount > 0) {
          // Find actual face bounds by analyzing skin pixel distribution in entire frame
          let minX = videoWidth, maxX = 0, minY = videoHeight, maxY = 0;
          let totalWeightedX = 0, totalWeightedY = 0, totalWeight = 0;
          let faceSkinPixelCount = 0;
          
          // Expand search area to detect full face size dynamically
          const searchStartX = Math.max(0, centerX - videoWidth * 0.4);
          const searchEndX = Math.min(videoWidth, centerX + videoWidth * 0.4);
          const searchStartY = Math.max(0, centerY - videoHeight * 0.4);
          const searchEndY = Math.min(videoHeight, centerY + videoHeight * 0.4);
          
          for (let y = searchStartY; y < searchEndY; y += 2) {
            for (let x = searchStartX; x < searchEndX; x += 2) {
              const i = (Math.floor(y) * videoWidth + Math.floor(x)) * 4;
              const r = data[i];
              const g = data[i + 1];
              const b = data[i + 2];
              
              // Enhanced skin tone detection
              if (r > 60 && g > 40 && b > 20 && r > b && 
                  Math.abs(r - g) < 50 && r < 220 && g < 200 && b < 180) {
                minX = Math.min(minX, x);
                maxX = Math.max(maxX, x);
                minY = Math.min(minY, y);
                maxY = Math.max(maxY, y);
                
                // Weight by brightness for better center calculation
                const weight = (r + g + b) / 3;
                totalWeightedX += x * weight;
                totalWeightedY += y * weight;
                totalWeight += weight;
                faceSkinPixelCount++;
              }
            }
          }
          
          if (totalWeight > 0 && faceSkinPixelCount > 100) { // Minimum pixel threshold
            actualFaceCenterX = totalWeightedX / totalWeight;
            actualFaceCenterY = totalWeightedY / totalWeight;
            
            // Calculate actual face size as percentage of frame with better accuracy
            const faceWidth = maxX - minX;
            const faceHeight = maxY - minY;
            
            // Use the larger dimension for more accurate size representation
            const faceDimension = Math.max(faceWidth, faceHeight);
            const frameDimension = Math.min(videoWidth, videoHeight);
            actualFaceSize = (faceDimension / frameDimension) * 100;
            
            log.debug('🔵 FACE SIZE CALCULATION:', {
              faceWidth: faceWidth.toFixed(1),
              faceHeight: faceHeight.toFixed(1),
              faceDimension: faceDimension.toFixed(1),
              frameDimension: frameDimension.toFixed(1),
              calculatedSize: actualFaceSize.toFixed(1),
              faceBounds: { minX, maxX, minY, maxY },
              videoSize: { videoWidth, videoHeight }
            });
            
            // Ensure realistic face size range (5% to 80% of frame)
            actualFaceSize = Math.min(80, Math.max(5, actualFaceSize));
          }
        }
        
        // Calculate quality scores with proper parameters
        let lightingQuality = 0;
        let straightnessQuality = 0;
        let positionQuality = 0;
        
        if (hasFace) {
          lightingQuality = calculateLightingQuality(avgBrightness, brightnessVariance);
          straightnessQuality = calculateStraightnessQuality(edgeRatio, actualFaceCenterX, actualFaceCenterY, videoWidth, videoHeight, imageData);
          positionQuality = calculatePositionQuality(hasFace, actualFaceSize, actualFaceCenterX, actualFaceCenterY, videoWidth, videoHeight, straightnessQuality);
        }
        
        log.debug('📊 QUALITY SCORES:', {
          hasFace,
          lightingQuality: lightingQuality.toFixed(1),
          straightnessQuality: straightnessQuality.toFixed(1),
          positionQuality: positionQuality.toFixed(1),
          actualFaceSize: actualFaceSize.toFixed(1),
          centerPos: { x: actualFaceCenterX.toFixed(1), y: actualFaceCenterY.toFixed(1) }
        });
        
        // Calculate FaceQuality based on YouCam API spec
        const faceQuality = calculateFaceQuality(
          hasFace,
          actualFaceSize,
          actualFaceCenterX,
          actualFaceCenterY,
          videoWidth,
          videoHeight,
          avgBrightness,
          brightnessVariance,
          edgeRatio
        );
        
        // Detailed debug output
        log.debug('Face Detection Results:', {
          hasFace,
          skinRatio: skinRatio.toFixed(3),
          skinPixelCount,
          pixelCount,
          avgBrightness: avgBrightness.toFixed(1),
          brightnessVariance: brightnessVariance.toFixed(1),
          edgeRatio: edgeRatio.toFixed(3),
          edgeCount,
          actualFaceSize: actualFaceSize.toFixed(1),
          actualFaceCenterX: actualFaceCenterX.toFixed(1),
          actualFaceCenterY: actualFaceCenterY.toFixed(1),
          positionQuality: positionQuality.toFixed(1),
          lightingQuality: lightingQuality.toFixed(1),
          straightnessQuality: straightnessQuality.toFixed(1)
        });
        
        // Update face metrics with all quality scores
        setFaceMetrics({
          faceCount: hasFace ? 1 : 0,
          faceSize: actualFaceSize,
          faceCenterX: actualFaceCenterX,
          faceCenterY: actualFaceCenterY,
          isFrameCentered: hasFace && actualFaceSize > 25 && actualFaceSize < 95,
          positionQuality,
          lightingQuality,
          straightnessQuality
        });
        
        log.debug('setFaceMetrics called with:', {
          positionQuality,
          lightingQuality,
          straightnessQuality,
          faceCount: hasFace ? 1 : 0
        });
        
        // Use fallback center when face is not detected for better directional guidance
        const guidanceCenterX = hasFace ? actualFaceCenterX : fallbackCenterX;
        const guidanceCenterY = hasFace ? actualFaceCenterY : fallbackCenterY;
        
        // Analyze face position and provide guidance
        analyzeFacePosition(faceQuality, skinRatio, guidanceCenterX, guidanceCenterY, videoWidth, videoHeight);
        
      } catch (error) {
        console.error('Face detection error:', error);
      }
    }); // Close requestAnimationFrame
  }, [calculatePositionQuality, calculateLightingQuality, calculateStraightnessQuality, calculateFaceQuality]);
  
  // Face position analysis with enhanced directional guidance
  const analyzeFacePosition = useCallback((faceQuality: FaceQuality, faceSize: number, centerX: number, centerY: number, videoWidth: number, videoHeight: number) => {
    const now = Date.now();
    
    // Reduced throttling for better real-time tracking
    if (now - lastDetectionTime < 100) return;
    setLastDetectionTime(now);
    
    // Calculate position deviations for directional guidance
    const frameCenterX = videoWidth / 2;
    const frameCenterY = videoHeight / 2;
    const horizontalDeviation = Math.abs(centerX - frameCenterX) / videoWidth;
    const verticalDeviation = Math.abs(centerY - frameCenterY) / videoHeight;
    
    // Enhanced directional guidance function
    const getDirectionalMessage = (centerX: number, centerY: number, threshold: number = 0.15) => {
      const hDev = Math.abs(centerX - frameCenterX) / videoWidth;
      const vDev = Math.abs(centerY - frameCenterY) / videoHeight;
      
      // Priority: horizontal movement first, then vertical
      if (hDev > threshold) {
        return centerX < frameCenterX ? 
          "Please move to the right ➡️" : 
          "Please move to the left ⬅️";
      } else if (vDev > threshold) {
        return centerY < frameCenterY ? 
          "Please move down a bit ⬇️" : 
          "Please move up a bit ⬆️";
      }
      return "Keep your face inside the circle";
    };
    
    if (!faceQuality.hasFace) {
      // Always provide directional guidance when face is not detected
      const directionMessage = getDirectionalMessage(centerX, centerY, 0.1);
      
      setFaceGuidance({
        message: directionMessage,
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
      // Always provide directional guidance when face is out of boundary
      const directionMessage = getDirectionalMessage(centerX, centerY, 0.05);
      
      setFaceGuidance({
        message: directionMessage,
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
        message: "Perfect! You can take the photo now 📸",
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
    log.debug('🎯 startFaceDetection function called!');
    log.debug('🎯 Starting face detection with requestAnimationFrame...');
    
    // Clear any existing interval
    if (faceDetectionInterval) {
      log.debug('⏹️ Clearing existing face detection interval:', faceDetectionInterval);
      clearInterval(faceDetectionInterval);
      setFaceDetectionInterval(null);
    }
    
    // Use interval but with requestAnimationFrame for smoother performance
    log.debug('⏱️ Setting up new interval...');
    const interval = setInterval(() => {
      log.debug('📸 Interval tick - calling detectFace');
      detectFace();
    }, 100); // Faster detection (100ms) for better real-time tracking
    
    setFaceDetectionInterval(interval);
    log.debug('✅ Face detection started with 60fps timing, interval ID:', interval);
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
    log.debug('Initializing YouCam SDK with face detection...');
    
    if (window.YMK) {
      log.debug('Available YMK methods:', Object.keys(window.YMK));
      
      try {
        // Check what methods are actually available
        const availableMethods = Object.keys(window.YMK).filter(key => typeof window.YMK[key] === 'function');
        log.debug('Available YMK functions:', availableMethods);
        
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
          log.debug(`Using ${initMethod} method for SDK initialization`);
          
          const config = {
            modelPath: "https://plugins-media.makeupar.com/v1.0-skincare-camera-kit/",
            enableFaceDetection: true,
            enableFaceTracking: true,
            faceDetectionThreshold: 0.7,
            onFaceDetected: (faceData: any) => {
              log.debug('Face detected:', faceData);
              handleYouCamFaceDetection(faceData);
            },
            onFaceLost: () => {
              log.debug('Face lost');
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
              log.debug('YouCam SDK initialized successfully');
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
            log.debug('SDK initialized synchronously');
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
          log.debug('Falling back to standard webcam mode');
          fallbackToWebcam();
        }
        
      } catch (error) {
        console.error('YouCam SDK setup error:', error);
        fallbackToWebcam();
      }
    } else {
      log.debug('YouCam SDK object not found');
      fallbackToWebcam();
    }
  }, []);
  
  // Fallback to standard webcam
  const fallbackToWebcam = useCallback(() => {
    log.debug('Using standard webcam mode');
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
        message: "Perfect! Ready to capture",
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
    log.debug('YouCam SDK script loaded via onLoad event');
    // Add a small delay to ensure SDK is fully initialized
    setTimeout(() => {
      if (window.YMK && typeof window.YMK === 'object') {
        log.debug('YouCam SDK object found, initializing...');
        initializeYMK();
      } else {
        log.debug('YouCam SDK not available, using standard webcam');
        setUseWebcam(true);
        setIsSDKLoaded(true);
      }
    }, 100);
  }, [initializeYMK]);

  // YouCam camera controls
  const openYouCamCamera = useCallback(() => {
    if (ymkInstanceRef.current) {
      try {
        log.debug('Opening YouCam camera...');
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
        log.debug('Closing YouCam camera...');
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
        log.debug('Capturing photo with YouCam...');
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
    log.debug('Opening camera...');
    
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
  }, [startWebcam, faceDetectionInterval]);

  const closeCamera = useCallback(() => {
    log.debug('Closing camera...');
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
      log.debug('Photo captured, size:', imageData.length);
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
        log.debug('SDK already loaded on mount, initializing...');
        initializeYMK();
      } else {
        log.debug('SDK not loaded yet, will wait for script load event');
      }
    };
    
    // Small delay to ensure any existing scripts have had time to load
    const timeoutId = setTimeout(checkSDKStatus, 100);
    
    // Only return cleanup on unmount
    return () => {
      log.debug('Component unmounting, cleaning up...');
      clearTimeout(timeoutId);
      cleanup();
    };
  }, [initializeYMK]); // Add initializeYMK as dependency

  // Debug effect to track faceMetrics changes
  useEffect(() => {
    log.debug('🔄 faceMetrics updated:', {
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
          log.debug('SDK script failed to load, using standard webcam');
          setUseWebcam(true);
          setIsSDKLoaded(true);
        }}
        strategy="afterInteractive"
      />

      <div className="mb-2 p-2 bg-gray-100 rounded-lg">
        <p className="text-xs text-gray-600">
          📷 WebCam Camera Mode
        </p>
      </div>

      
      {/* Camera Guide Status Component */}
      {isCameraOpen && (
        <div className="mb-6">
          <CameraGuideStatus 
            faceGuidance={faceGuidance}
            faceMetrics={faceMetrics}
          />
        </div>
      )}

      

      {cameraError && (
        <div className="mb-2 p-3 bg-red-50 border border-red-200 rounded-lg">
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


      {/* Camera View Component */}
      <CameraView 
        capturedImage={capturedImage}
        onImageCapture={onImageCapture}
        openCamera={openCamera}
        isSDKLoaded={isSDKLoaded}
        isCameraOpen={isCameraOpen}
        isVideoReady={isVideoReady}
        videoRef={videoRef}
        canvasRef={canvasRef}
        faceGuidance={faceGuidance}
        faceMetrics={faceMetrics}
        capturePhoto={capturePhoto}
        closeCamera={closeCamera}
      />

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
          <li>• Wait for the green &quot;Perfect!&quot; message before capturing</li>
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