# YouCam JS Camera Kit 얼굴 가이드 기능 구현 가이드

## 📋 개요
현재 `error_src_face_too_small` 에러가 발생하고 있으며, 사용자가 카메라에 얼굴을 가까이 대야만 정상 작동합니다. YouCam JS Camera Kit의 실시간 얼굴 품질 감지 기능을 활용하여 사용자에게 적절한 가이드를 제공하는 기능을 구현해야 합니다.

## 📚 참고 문서 및 SDK 정보

### 공식 문서
- **API 문서**: https://yce.perfectcorp.com/document/index.html#tag/AI-Skin-Analysis/JS-Camera-Kit
- **SDK 스크립트**: https://plugins-media.makeupar.com/v1.0-skincare-camera-kit/sdk.js

### 기술 요구사항
- 얼굴 너비가 이미지 너비의 **60% 이상**이어야 함
- 안경 착용 금지, 앞머리가 이마를 가리면 안됨
- 정면을 향한 얼굴 각도 필요

## 🔧 핵심 API: faceQualityChanged 이벤트

### 이벤트 리스너 등록
```javascript
YMK.addEventListener("faceQualityChanged", function(quality) {
    // 얼굴 품질 상태에 따른 처리
});
```

### quality 객체 속성들

#### 1. hasFace (boolean)
- `true`: 얼굴 감지됨
- `false`: 얼굴 감지 안됨

#### 2. area (string)
- `"good"`: 최적 거리 - 분석 진행 가능
- `"toosmall"`: 얼굴이 너무 작음 (카메라에서 멀리 있음)
- `"outofboundary"`: 경계를 벗어남 (카메라에 너무 가까움)
- `"notgood"`: 거리 조정 필요

#### 3. frontal (string)
- `"good"`: 정면을 향하고 있음
- `"notgood"`: 얼굴이 정면을 향하지 않음

#### 4. areaMessages (array)
- 상세한 경고 메시지 배열 (예: "Your face is too close...")

## 💻 구현 예시 코드

### 1. 기본 얼굴 가이드 시스템
```javascript
// HTML에 가이드 메시지 표시 영역 추가
// <div id="face-guidance" class="guidance-message"></div>
// <button id="capture-btn" disabled>촬영하기</button>

YMK.addEventListener("faceQualityChanged", function(quality) {
    const guidanceElement = document.getElementById('face-guidance');
    const captureButton = document.getElementById('capture-btn');
    
    // 얼굴이 감지되지 않는 경우
    if (!quality.hasFace) {
        showGuidance("얼굴을 화면 중앙의 원 안에 맞춰주세요", "warning");
        captureButton.disabled = true;
        return;
    }
    
    // 얼굴 크기/거리 체크
    switch(quality.area) {
        case "toosmall":
            showGuidance("카메라에 더 가까이 와주세요 📷", "warning");
            captureButton.disabled = true;
            break;
            
        case "outofboundary":
            showGuidance("카메라에서 조금 멀어져 주세요 ↔️", "warning");
            captureButton.disabled = true;
            break;
            
        case "good":
            // 정면 방향도 체크
            if (quality.frontal === "good") {
                showGuidance("완벽합니다! 촬영할 수 있습니다 ✅", "success");
                captureButton.disabled = false;
            } else {
                showGuidance("정면을 바라봐 주세요 👁️", "warning");
                captureButton.disabled = true;
            }
            break;
            
        default:
            showGuidance("얼굴 위치를 조정해주세요", "warning");
            captureButton.disabled = true;
    }
    
    // 정면 방향 추가 체크 (area가 good이 아닌 경우에도)
    if (quality.frontal === "notgood" && quality.area !== "good") {
        showGuidance("정면을 바라보며 적절한 거리를 맞춰주세요", "warning");
    }
});

// 가이드 메시지 표시 함수
function showGuidance(message, type = "info") {
    const guidanceElement = document.getElementById('face-guidance');
    guidanceElement.textContent = message;
    guidanceElement.className = `guidance-message ${type}`;
    guidanceElement.style.display = 'block';
}
```

### 2. 향상된 가이드 시스템 (진동, 소리 포함)
```javascript
YMK.addEventListener("faceQualityChanged", function(quality) {
    const guidanceData = analyzeFaceQuality(quality);
    
    // 시각적 가이드
    updateVisualGuidance(guidanceData);
    
    // 촬영 버튼 상태 업데이트
    updateCaptureButton(guidanceData.canCapture);
    
    // 햅틱 피드백 (모바일)
    if (guidanceData.needsVibration && navigator.vibrate) {
        navigator.vibrate(100);
    }
});

function analyzeFaceQuality(quality) {
    if (!quality.hasFace) {
        return {
            message: "얼굴을 화면에 보여주세요 👤",
            type: "error",
            canCapture: false,
            needsVibration: true
        };
    }
    
    if (quality.area === "toosmall") {
        return {
            message: "카메라에 더 가까이 와주세요 🔍",
            type: "warning",
            canCapture: false,
            needsVibration: false
        };
    }
    
    if (quality.area === "outofboundary") {
        return {
            message: "너무 가깝습니다. 조금 멀어져 주세요 ↩️",
            type: "warning",
            canCapture: false,
            needsVibration: false
        };
    }
    
    if (quality.area === "good") {
        if (quality.frontal === "good") {
            return {
                message: "완벽합니다! 이제 촬영하세요 📸✨",
                type: "success",
                canCapture: true,
                needsVibration: false
            };
        } else {
            return {
                message: "정면을 바라봐 주세요 👀",
                type: "warning",
                canCapture: false,
                needsVibration: false
            };
        }
    }
    
    return {
        message: "얼굴 위치를 조정해주세요",
        type: "warning",
        canCapture: false,
        needsVibration: false
    };
}

function updateVisualGuidance(guidanceData) {
    const guidanceElement = document.getElementById('face-guidance');
    guidanceElement.textContent = guidanceData.message;
    guidanceElement.className = `guidance-message ${guidanceData.type}`;
}

function updateCaptureButton(canCapture) {
    const captureButton = document.getElementById('capture-btn');
    captureButton.disabled = !canCapture;
    captureButton.textContent = canCapture ? "📸 촬영하기" : "⏳ 대기중...";
}
```

### 3. CSS 스타일링
```css
.guidance-message {
    position: fixed;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    padding: 12px 20px;
    border-radius: 8px;
    font-weight: bold;
    z-index: 1000;
    transition: all 0.3s ease;
}

.guidance-message.success {
    background-color: #4CAF50;
    color: white;
    border: 2px solid #45a049;
}

.guidance-message.warning {
    background-color: #FF9800;
    color: white;
    border: 2px solid #f57c00;
}

.guidance-message.error {
    background-color: #f44336;
    color: white;
    border: 2px solid #d32f2f;
}

#capture-btn {
    padding: 15px 30px;
    font-size: 18px;
    border-radius: 50px;
    border: none;
    cursor: pointer;
    transition: all 0.3s ease;
}

#capture-btn:enabled {
    background-color: #4CAF50;
    color: white;
    transform: scale(1.05);
}

#capture-btn:disabled {
    background-color: #cccccc;
    color: #666666;
    cursor: not-allowed;
}
```

## 🎯 구현 목표

1. **실시간 피드백**: 사용자가 카메라 앞에서 움직일 때마다 즉시 가이드 제공
2. **명확한 지시사항**: 구체적이고 이해하기 쉬운 안내 메시지
3. **시각적 구분**: 성공/경고/오류 상태를 색상으로 구분
4. **촬영 제어**: 조건이 맞을 때만 촬영 버튼 활성화
5. **에러 방지**: `error_src_face_too_small` 에러 사전 차단

## ⚡ 추가 개선 사항

### 1. 시각적 가이드라인
```javascript
// 얼굴 감지 영역에 가이드 오버레이 표시
function drawFaceGuide(canvas, quality) {
    const ctx = canvas.getContext('2d');
    
    if (quality.area === "good") {
        ctx.strokeStyle = "#4CAF50"; // 녹색
        ctx.lineWidth = 3;
    } else {
        ctx.strokeStyle = "#FF9800"; // 주황색
        ctx.lineWidth = 2;
    }
    
    // 가이드 원 그리기
    ctx.beginPath();
    ctx.arc(canvas.width/2, canvas.height/2, 100, 0, 2 * Math.PI);
    ctx.stroke();
}
```

### 2. 음성 가이드 (선택사항)
```javascript
function speakGuidance(message) {
    if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(message);
        utterance.lang = 'ko-KR';
        speechSynthesis.speak(utterance);
    }
}
```

## 🛠️ 구현 체크리스트

- [ ] `faceQualityChanged` 이벤트 리스너 등록
- [ ] 얼굴 감지 상태별 메시지 시스템 구현
- [ ] 촬영 버튼 활성화/비활성화 로직 추가
- [ ] 시각적 가이드 UI 디자인 및 구현
- [ ] CSS 스타일링으로 사용자 경험 개선
- [ ] `error_src_face_too_small` 에러 해결 테스트
- [ ] 다양한 디바이스에서 테스트 (모바일/데스크톱)

이 가이드를 따라 구현하면 사용자가 적절한 얼굴 크기와 위치를 맞출 수 있도록 실시간으로 안내받을 수 있으며, `error_src_face_too_small` 에러를 사전에 방지할 수 있습니다.