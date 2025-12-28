'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import type {
  PhotoMethodProps,
  SelectedPoint,
  FitzpatrickResult,
  RGB,
} from './fitzpatrick.types';
import {
  FITZPATRICK_TEXTS,
  FITZPATRICK_COLOR_CHIPS,
} from './fitzpatrick.constants';
import {
  loadImageToCanvas,
  getPixelColor,
  rgbToFitzpatrick,
  rgbToHex,
  validateImageFile,
} from './fitzpatrick.utils';

type PhotoStep = 'capture' | 'pick' | 'confirm';

// 돋보기 설정
const MAGNIFIER_SIZE = 120; // 돋보기 크기 (px)
const MAGNIFIER_ZOOM = 3; // 확대 배율
const MAGNIFIER_OFFSET_X = -80; // 터치 위치에서 왼쪽으로 이동
const MAGNIFIER_OFFSET_Y = -120; // 터치 위치에서 위로 이동

interface HoverPoint {
  x: number; // canvas 좌표
  y: number; // canvas 좌표
  clientX: number; // 화면 좌표 (돋보기 위치용)
  clientY: number; // 화면 좌표
  rgb: RGB;
}

export default function PhotoMethod({
  onSelect,
  onBack,
  locale,
}: PhotoMethodProps) {
  const [step, setStep] = useState<PhotoStep>('capture');
  const [selectedPoint, setSelectedPoint] = useState<SelectedPoint | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPressing, setIsPressing] = useState(false);
  const [hoverPoint, setHoverPoint] = useState<HoverPoint | null>(null);
  const [isReselecting, setIsReselecting] = useState(false); // 재선택 모드

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const magnifierCanvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const texts = FITZPATRICK_TEXTS;

  // 돋보기 캔버스 업데이트
  const updateMagnifier = useCallback((point: HoverPoint) => {
    const canvas = canvasRef.current;
    const magnifier = magnifierCanvasRef.current;
    if (!canvas || !magnifier) return;

    const ctx = magnifier.getContext('2d');
    if (!ctx) return;

    const sourceSize = MAGNIFIER_SIZE / MAGNIFIER_ZOOM;
    const sourceX = point.x - sourceSize / 2;
    const sourceY = point.y - sourceSize / 2;

    // 배경 클리어
    ctx.clearRect(0, 0, MAGNIFIER_SIZE, MAGNIFIER_SIZE);

    // 원형 클리핑
    ctx.save();
    ctx.beginPath();
    ctx.arc(MAGNIFIER_SIZE / 2, MAGNIFIER_SIZE / 2, MAGNIFIER_SIZE / 2 - 4, 0, Math.PI * 2);
    ctx.clip();

    // 확대된 이미지 그리기
    ctx.drawImage(
      canvas,
      sourceX,
      sourceY,
      sourceSize,
      sourceSize,
      0,
      0,
      MAGNIFIER_SIZE,
      MAGNIFIER_SIZE
    );

    ctx.restore();

    // 중앙 십자선
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.lineWidth = 2;
    const center = MAGNIFIER_SIZE / 2;
    const crossSize = 12;

    ctx.beginPath();
    ctx.moveTo(center - crossSize, center);
    ctx.lineTo(center + crossSize, center);
    ctx.moveTo(center, center - crossSize);
    ctx.lineTo(center, center + crossSize);
    ctx.stroke();

    // 테두리
    ctx.beginPath();
    ctx.arc(center, center, MAGNIFIER_SIZE / 2 - 2, 0, Math.PI * 2);
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 4;
    ctx.stroke();
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.lineWidth = 1;
    ctx.stroke();
  }, []);

  // 좌표 및 컬러 계산 (캔버스 범위 내로 클램프)
  const getPointFromEvent = useCallback(
    (event: MouseEvent | TouchEvent, clamp: boolean = false): HoverPoint | null => {
      const canvas = canvasRef.current;
      if (!canvas) return null;

      const rect = canvas.getBoundingClientRect();

      // touches가 비어있을 수 있음 (touchend)
      let clientX: number;
      let clientY: number;

      if ('touches' in event) {
        if (event.touches.length > 0) {
          clientX = event.touches[0].clientX;
          clientY = event.touches[0].clientY;
        } else if ('changedTouches' in event && event.changedTouches.length > 0) {
          clientX = event.changedTouches[0].clientX;
          clientY = event.changedTouches[0].clientY;
        } else {
          return null;
        }
      } else {
        clientX = event.clientX;
        clientY = event.clientY;
      }

      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;

      let x = Math.round((clientX - rect.left) * scaleX);
      let y = Math.round((clientY - rect.top) * scaleY);

      // 캔버스 범위 체크
      const isOutside = x < 0 || x >= canvas.width || y < 0 || y >= canvas.height;

      if (isOutside) {
        if (clamp) {
          // 범위 내로 클램프
          x = Math.max(0, Math.min(canvas.width - 1, x));
          y = Math.max(0, Math.min(canvas.height - 1, y));
        } else {
          return null;
        }
      }

      const rgb = getPixelColor(canvas, x, y);
      if (!rgb) return null;

      return { x, y, clientX, clientY, rgb };
    },
    []
  );

  // 선택 가능 여부 (pick 모드이거나 재선택 모드)
  const canPick = step === 'pick' || isReselecting;

  // 터치/마우스 시작
  const handlePointerDown = useCallback(
    (event: React.MouseEvent | React.TouchEvent) => {
      if (!canPick) return;
      event.preventDefault();

      const point = getPointFromEvent(event.nativeEvent as MouseEvent | TouchEvent);
      if (!point) return;

      setIsPressing(true);
      setHoverPoint(point);
    },
    [canPick, getPointFromEvent]
  );

  // 터치/마우스 이동
  const handlePointerMove = useCallback(
    (event: React.MouseEvent | React.TouchEvent) => {
      if (!isPressing || !canPick) return;
      event.preventDefault();

      // 범위 밖으로 나가도 마지막 유효 위치 유지 (clamp)
      const point = getPointFromEvent(event.nativeEvent as MouseEvent | TouchEvent, true);
      if (point) {
        setHoverPoint(point);
      }
    },
    [isPressing, canPick, getPointFromEvent]
  );

  // 터치/마우스 종료 - 최종 선택
  const handlePointerUp = useCallback(
    (event: React.MouseEvent | React.TouchEvent) => {
      if (!isPressing || !hoverPoint) {
        setIsPressing(false);
        setHoverPoint(null);
        return;
      }

      event.preventDefault();

      const fitzpatrickType = rgbToFitzpatrick(hoverPoint.rgb);

      setSelectedPoint({
        x: hoverPoint.x,
        y: hoverPoint.y,
        rgb: hoverPoint.rgb,
        fitzpatrickType,
      });

      setIsPressing(false);
      setHoverPoint(null);
      setIsReselecting(false); // 재선택 완료
      setStep('confirm');
    },
    [isPressing, hoverPoint]
  );

  // 포인터가 캔버스를 벗어났을 때 - 선택 종료하지 않음
  const handlePointerLeave = useCallback(() => {
    // 선택 종료하지 않고 계속 유지 (마지막 유효 위치 유지됨)
    // 사용자가 터치를 뗄 때만 선택 확정
  }, []);

  // 돋보기 업데이트 effect
  useEffect(() => {
    if (isPressing && hoverPoint) {
      updateMagnifier(hoverPoint);
    }
  }, [isPressing, hoverPoint, updateMagnifier]);

  // 돋보기 위치 계산
  const getMagnifierPosition = useCallback(() => {
    if (!hoverPoint || !containerRef.current) return { left: 0, top: 0 };

    const containerRect = containerRef.current.getBoundingClientRect();

    let left = hoverPoint.clientX - containerRect.left + MAGNIFIER_OFFSET_X;
    let top = hoverPoint.clientY - containerRect.top + MAGNIFIER_OFFSET_Y;

    // 화면 밖으로 나가지 않도록 조정
    if (left < 0) left = hoverPoint.clientX - containerRect.left + 20;
    if (top < 0) top = hoverPoint.clientY - containerRect.top + 20;
    if (left + MAGNIFIER_SIZE > containerRect.width) {
      left = containerRect.width - MAGNIFIER_SIZE - 10;
    }

    return { left, top };
  }, [hoverPoint]);

  // 파일 선택 핸들러
  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const validation = validateImageFile(file);
    if (!validation.valid) {
      setError(validation.error || '파일 오류');
      return;
    }

    setError(null);

    if (canvasRef.current) {
      try {
        await loadImageToCanvas(canvasRef.current, file);
        setStep('pick');
      } catch {
        setError('이미지 로드 실패');
      }
    }
  };

  // 완전히 처음부터
  const handleRetake = () => {
    setSelectedPoint(null);
    setIsReselecting(false);
    setStep('capture');
    if (cameraInputRef.current) {
      cameraInputRef.current.value = '';
    }
    if (galleryInputRef.current) {
      galleryInputRef.current.value = '';
    }
  };

  // 재선택 모드 진입
  const handleReselect = () => {
    setIsReselecting(true);
  };

  // 최종 선택 확인
  const handleConfirm = () => {
    if (!selectedPoint) return;

    const result: FitzpatrickResult = {
      type: selectedPoint.fitzpatrickType,
      method: 'photo',
      rgb: selectedPoint.rgb,
      timestamp: new Date().toISOString(),
    };

    onSelect(result);
  };

  // Step 1: 촬영
  const renderCaptureStep = () => (
    <div className="photo-capture-step">
      <h3 className="photo-step-title">
        {locale === 'ko'
          ? '손등 사진을 촬영하거나 선택해주세요'
          : 'Take or select a photo of your hand'}
      </h3>

      <div className="photo-tips">
        <p className="photo-tips-title">{texts.photoTips.title[locale]}</p>
        <ul className="photo-tips-list">
          {texts.photoTips.tips[locale].map((tip, i) => (
            <li key={i}>{tip}</li>
          ))}
        </ul>
      </div>

      {error && <div className="photo-error">{error}</div>}

      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileSelect}
        className="photo-file-input"
        id="fitzpatrick-camera-input"
      />
      <label htmlFor="fitzpatrick-camera-input" className="photo-capture-button">
        {texts.captureButton[locale]}
      </label>

      <input
        ref={galleryInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="photo-file-input"
        id="fitzpatrick-gallery-input"
      />
      <label htmlFor="fitzpatrick-gallery-input" className="photo-gallery-button">
        {locale === 'ko' ? '🖼️ 갤러리에서 선택' : '🖼️ Choose from gallery'}
      </label>

      <button type="button" className="photo-back-button" onClick={onBack}>
        {texts.back[locale]}
      </button>
    </div>
  );

  // Step 2: 컬러 선택
  const renderPickStep = () => (
    <div className="photo-pick-step">
      <h3 className="photo-step-title">{texts.touchPrompt[locale]}</h3>

      <p className="photo-tip">
        {locale === 'ko'
          ? '🔍 터치한 상태로 움직여서 정확한 위치를 선택하세요'
          : '🔍 Touch and drag to select the exact position'}
      </p>

      <button
        type="button"
        className="photo-retake-button"
        onClick={handleRetake}
      >
        {locale === 'ko' ? '다시 촬영하기' : 'Retake photo'}
      </button>
    </div>
  );

  // Step 3: 확인
  const renderConfirmStep = () => {
    if (!selectedPoint) return null;

    const chipData = FITZPATRICK_COLOR_CHIPS.find(
      (c) => c.type === selectedPoint.fitzpatrickType
    );

    return (
      <div className="photo-confirm-step">
        <h3 className="photo-step-title">
          {isReselecting
            ? (locale === 'ko' ? '다시 선택해주세요' : 'Select again')
            : texts.confirmPrompt[locale]}
        </h3>

        {isReselecting && (
          <p className="photo-tip">
            {locale === 'ko'
              ? '🔍 터치한 상태로 움직여서 정확한 위치를 선택하세요'
              : '🔍 Touch and drag to select the exact position'}
          </p>
        )}

        <div className="photo-result">
          <div
            className="photo-result-swatch"
            style={{ backgroundColor: rgbToHex(selectedPoint.rgb) }}
          />
          <div className="photo-result-info">
            <span className="photo-result-type">
              {chipData?.label[locale]} (Type {selectedPoint.fitzpatrickType})
            </span>
            <span className="photo-result-description">
              {chipData?.description[locale]}
            </span>
          </div>
        </div>

        <div className="photo-confirm-buttons">
          <button
            type="button"
            className="photo-confirm-yes"
            onClick={handleConfirm}
          >
            {texts.confirmYes[locale]}
          </button>
          {!isReselecting && (
            <button
              type="button"
              className="photo-reselect-button"
              onClick={handleReselect}
            >
              {locale === 'ko' ? '🔍 다시 선택하기' : '🔍 Select again'}
            </button>
          )}
          <button
            type="button"
            className="photo-switch-manual"
            onClick={onBack}
          >
            {texts.switchToManual[locale]}
          </button>
        </div>
      </div>
    );
  };

  const magnifierPos = getMagnifierPosition();

  return (
    <div className="photo-method">
      {/* Canvas 컨테이너 */}
      <div
        ref={containerRef}
        className={`photo-canvas-container ${step === 'capture' ? 'hidden' : ''}`}
      >
        <canvas
          ref={canvasRef}
          className="photo-canvas"
          onMouseDown={canPick ? handlePointerDown : undefined}
          onMouseMove={canPick ? handlePointerMove : undefined}
          onMouseUp={canPick ? handlePointerUp : undefined}
          onMouseLeave={canPick ? handlePointerLeave : undefined}
          onTouchStart={canPick ? handlePointerDown : undefined}
          onTouchMove={canPick ? handlePointerMove : undefined}
          onTouchEnd={canPick ? handlePointerUp : undefined}
        />

        {/* 현재 위치 마커 (터치 중) */}
        {isPressing && hoverPoint && (
          <div
            className="photo-marker photo-marker-active"
            style={{
              left: `${(hoverPoint.x / (canvasRef.current?.width || 1)) * 100}%`,
              top: `${(hoverPoint.y / (canvasRef.current?.height || 1)) * 100}%`,
              backgroundColor: rgbToHex(hoverPoint.rgb),
            }}
          />
        )}

        {/* 선택된 위치 마커 (확인 단계) - 터치 중이 아닐 때만 표시 */}
        {selectedPoint && step === 'confirm' && !isPressing && (
          <div
            className="photo-marker photo-marker-selected"
            style={{
              left: `${(selectedPoint.x / (canvasRef.current?.width || 1)) * 100}%`,
              top: `${(selectedPoint.y / (canvasRef.current?.height || 1)) * 100}%`,
              backgroundColor: rgbToHex(selectedPoint.rgb),
            }}
          />
        )}

        {/* 돋보기 */}
        {isPressing && hoverPoint && (
          <div
            className="photo-magnifier"
            style={{
              left: magnifierPos.left,
              top: magnifierPos.top,
              width: MAGNIFIER_SIZE,
              height: MAGNIFIER_SIZE,
            }}
          >
            <canvas
              ref={magnifierCanvasRef}
              width={MAGNIFIER_SIZE}
              height={MAGNIFIER_SIZE}
              className="photo-magnifier-canvas"
            />
            <div
              className="photo-magnifier-color"
              style={{ backgroundColor: rgbToHex(hoverPoint.rgb) }}
            />
          </div>
        )}
      </div>

      {step === 'capture' && renderCaptureStep()}
      {step === 'pick' && renderPickStep()}
      {step === 'confirm' && renderConfirmStep()}
    </div>
  );
}
