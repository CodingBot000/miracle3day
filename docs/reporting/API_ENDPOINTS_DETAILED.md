# API 엔드포인트 상세 목록

> 생성일: 2025년 10월 27일
> 총 엔드포인트: 70+

## 목차

- [Authentication (인증)](#authentication)
- [Hospital (병원)](#hospital)
- [Reservation (예약)](#reservation)
- [Review (리뷰)](#review)
- [Community (커뮤니티)](#community)
- [Event (이벤트)](#event)
- [Surgery/Procedure (수술/시술)](#surgeryprocedure)
- [AI Analysis (AI 분석)](#ai-analysis)
- [Location (위치)](#location)
- [Search (검색)](#search)
- [Storage (저장소)](#storage)
- [Health & System (상태 확인)](#health--system)
- [Other (기타)](#other)

---

## Authentication

### User Session & Profile

| Method | Endpoint | Auth | 설명 |
|--------|----------|------|------|
| GET | `/auth/getUser` | ✅ | 현재 사용자 정보 조회 |
| POST | `/auth/getUser` | ❌ | 이메일로 사용자 검색 |
| POST | `/auth/update_profile` | ✅ | 프로필 업데이트 |
| GET | `/auth/session` | ✅ | 세션 상태 확인 |
| POST | `/auth/logout` | ✅ | 로그아웃 |
| GET | `/auth/getUser/agreement_status` | ✅ | 약관 동의 상태 |

### Authentication Methods

| Method | Endpoint | Auth | 설명 |
|--------|----------|------|------|
| GET | `/auth/google/start` | ❌ | Google OAuth 시작 |
| GET | `/auth/google/callback` | ❌ | Google OAuth 콜백 |

### Terms & Consent

| Method | Endpoint | Auth | 설명 |
|--------|----------|------|------|
| POST | `/auth/terms/agree` | ✅ | 약관 동의 |
| POST | `/auth/consent/accept` | ✅ | 동의 수락 |

### Profile Management

| Method | Endpoint | Auth | 설명 |
|--------|----------|------|------|
| POST | `/auth/member/avatar` | ✅ | 프로필 이미지 업로드 |
| POST | `/auth/countryCode` | ❌ | 국가 코드 확인 |

---

## Hospital

### Hospital List & Details

| Method | Endpoint | Auth | 설명 | 캐시 |
|--------|----------|------|------|------|
| GET | `/hospital/list` | ❌ | 모든 병원 목록 | no-store |
| GET | `/hospital/[id]/info` | ❌ | 병원 상세 정보 | no-store |
| GET | `/hospital/[id]/main` | ❌ | 병원 메인 정보 | no-store |
| GET | `/hospital/[id]` | ❌ | 병원 기본 정보 | no-store |

### Hospital Special Endpoints

| Method | Endpoint | Auth | 설명 |
|--------|----------|------|------|
| GET | `/home/hospital/location` | ❌ | 지역별 병원 정보 |
| GET | `/home/hospital/beauty` | ❌ | 뷰티 전문 병원 |

### Hospital Events

| Method | Endpoint | Auth | 설명 |
|--------|----------|------|------|
| GET | `/hospital/[id]/event` | ❌ | 병원별 이벤트 |
| POST | `/hospital/[id]/event` | ✅ | 이벤트 생성 (관리자) |
| DELETE | `/hospital/[id]/event/[eventId]` | ✅ | 이벤트 삭제 |

---

## Reservation

### Booking Management

| Method | Endpoint | Auth | 설명 | 입력 검증 |
|--------|----------|------|------|----------|
| POST | `/hospital/[id]/reservation` | ✅ | 예약 생성 | Zod |
| GET | `/hospital/[id]/reservation` | ✅ | 예약 목록 조회 | - |
| GET | `/hospital/[id]/reservation/[reservationId]` | ✅ | 예약 상세 | - |
| PUT | `/hospital/[id]/reservation/[reservationId]` | ✅ | 예약 수정 | - |
| DELETE | `/hospital/[id]/reservation/[reservationId]` | ✅ | 예약 취소 | - |

### Reservation Fields

필수 필드:
- `name`: 성명
- `nationality`: 국적
- `email`: 이메일

선택 필드:
- `english_name`: 영문명
- `passport_name`: 여권명
- `gender`: 성별
- `birth_date`: 생년월일
- `phone`: 휴대폰
- `phone_korea`: 한국 휴대폰
- `preferred_date`: 희망 날짜
- `preferred_time`: 희망 시간
- `visitor_count`: 방문객 수
- `reservation_headcount`: 예약 인원
- `treatment_experience`: 시술 경험
- `area_to_improve`: 개선 원하는 부위
- `consultation_request`: 상담 요청사항
- `additional_info`: 추가 정보
- `preferred_languages`: 선호 언어 배열

---

## Review

### Review Management

| Method | Endpoint | Auth | 설명 |
|--------|----------|------|------|
| GET | `/hospital/[id]/review` | ❌ | 병원 리뷰 목록 |
| POST | `/hospital/[id]/review` | ✅ | 리뷰 작성 |
| PUT | `/hospital/[id]/review/[reviewId]` | ✅ | 리뷰 수정 |
| DELETE | `/hospital/[id]/review/[reviewId]` | ✅ | 리뷰 삭제 |

### Review Fields

| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| `rating` | number | ✅ | 평점 (1-5) |
| `comment` | string | ✅ | 리뷰 내용 |
| `before_image` | string | ❌ | 시술 전 이미지 |
| `after_image` | string | ❌ | 시술 후 이미지 |
| `treatment_id` | string | ❌ | 시술 ID |
| `is_verified_purchase` | boolean | ❌ | 실제 이용 여부 |

### Surgery Reviews

| Method | Endpoint | Auth | 설명 |
|--------|----------|------|------|
| GET | `/surgeries/[id]/review` | ❌ | 수술별 리뷰 목록 |
| POST | `/surgeries/[id]/review` | ✅ | 수술 리뷰 작성 |

---

## Community

### Posts

| Method | Endpoint | Auth | 설명 |
|--------|----------|------|------|
| GET | `/community/posts` | ❌ | 게시물 목록 |
| POST | `/community/posts` | ✅ | 게시물 생성 |
| GET | `/community/posts/[id]` | ❌ | 게시물 상세 |
| PUT | `/community/posts/[id]` | ✅ | 게시물 수정 |
| DELETE | `/community/posts/[id]` | ✅ | 게시물 삭제 |

### Comments

| Method | Endpoint | Auth | 설명 |
|--------|----------|------|------|
| GET | `/community/posts/[id]/comments` | ❌ | 댓글 목록 |
| POST | `/community/posts/[id]/comments` | ✅ | 댓글 작성 |
| DELETE | `/community/posts/[id]/comments/[commentId]` | ✅ | 댓글 삭제 |

### Reporting

| Method | Endpoint | Auth | 설명 |
|--------|----------|------|------|
| POST | `/community/reports` | ✅ | 게시물/댓글 신고 |

---

## Event

### Event Management

| Method | Endpoint | Auth | 설명 |
|--------|----------|------|------|
| GET | `/event` | ❌ | 이벤트 목록 |
| POST | `/event` | ✅ | 이벤트 생성 (관리자) |
| GET | `/event/[id]` | ❌ | 이벤트 상세 |
| PUT | `/event/[id]` | ✅ | 이벤트 수정 |
| DELETE | `/event/[id]` | ✅ | 이벤트 삭제 |
| GET | `/event/[...slug]` | ❌ | 동적 라우트 이벤트 |

### Home Events

| Method | Endpoint | Auth | 설명 |
|--------|----------|------|------|
| GET | `/home/banner` | ❌ | 배너/이벤트 |

---

## Surgery/Procedure

### Surgery Information

| Method | Endpoint | Auth | 설명 |
|--------|----------|------|------|
| GET | `/surgeries/[id]/info` | ❌ | 수술 상세 정보 |
| GET | `/surgeries/[id]/hospital` | ❌ | 수술 가능 병원 |
| GET | `/surgeries/[id]/review` | ❌ | 수술 리뷰 |
| GET | `/treatments_root` | ❌ | 모든 시술 목록 |

### Treatment Protocols

| Method | Endpoint | Auth | 설명 |
|--------|----------|------|------|
| GET | `/treatment_care_protocols` | ❌ | 시술 케어 가이드 |

---

## AI Analysis

### YouCam Skin Analysis

| Method | Endpoint | Auth | 설명 | 파라미터 |
|--------|----------|------|------|----------|
| POST | `/ai/youcam/skin_analysis` | ❌ | 피부 분석 | image, concerns, mode |
| GET | `/ai/youcam/skin_analysis` | ❌ | 분석 엔드포인트 정보 | - |
| POST | `/ai/youcam/test` | ❌ | 테스트 분석 | - |

### EveryPixel AI

| Method | Endpoint | Auth | 설명 |
|--------|----------|------|------|
| POST | `/ai/everypixel/estimate_age` | ❌ | 연령 추정 |

### Gamification

| Method | Endpoint | Auth | 설명 |
|--------|----------|------|------|
| POST | `/gamification/quize/apply` | ✅ | 퀴즈 제출 |
| GET | `/gamification/quize/state` | ✅ | 퀴즈 상태 |
| GET | `/gamification/quize/badges` | ✅ | 배지 조회 |

---

## Location

### Location Data

| Method | Endpoint | Auth | 설명 |
|--------|----------|------|------|
| GET | `/location/[id]` | ❌ | 위치 정보 |
| GET | `/location/[id]/position` | ❌ | 위치 좌표 |
| GET | `/location/[id]/position/route` | ❌ | 경로 정보 |

---

## Search

### Global Search

| Method | Endpoint | Auth | 설명 | 검색 대상 |
|--------|----------|------|------|----------|
| GET | `/search` | ❌ | 통합 검색 | Hospital, Event, Review |

**쿼리 파라미터**:
- `q`: 검색어 (정규화: 소문자, 공백/하이픈 제거)

**검색 필드**: `search_key` ILIKE 연산자 사용

---

## Storage

### File Management

| Method | Endpoint | Auth | 설명 |
|--------|----------|------|------|
| GET | `/storage/read` | ❌ | 파일 읽기 |
| POST | `/storage/upload` | ✅ | 파일 업로드 (직접) |
| POST | `/storage/presign_upload` | ✅ | S3 업로드 사전 서명 |
| POST | `/storage/presign_read` | ❌ | S3 다운로드 사전 서명 |

### S3 Operations

| Method | Endpoint | Auth | 설명 |
|--------|----------|------|------|
| GET | `/storage/s3/list` | ✅ | S3 파일 목록 |
| POST | `/storage/s3/sign-upload` | ✅ | S3 서명된 업로드 |
| DELETE | `/storage/s3/remove` | ✅ | S3 파일 삭제 |

---

## Health & System

### Health Checks

| Method | Endpoint | Auth | 설명 |
|--------|----------|------|------|
| GET | `/health/db` | ❌ | 데이터베이스 상태 |

### Favorites

| Method | Endpoint | Auth | 설명 |
|--------|----------|------|------|
| GET | `/auth/favorite` | ✅ | 즐겨찾기 목록 |
| POST | `/auth/favorite` | ✅ | 즐겨찾기 추가 |
| DELETE | `/auth/favorite` | ✅ | 즐겨찾기 삭제 |

### User Management

| Method | Endpoint | Auth | 설명 |
|--------|----------|------|------|
| DELETE | `/delete_user` | ✅ | 사용자 계정 삭제 |

---

## Other

### Chat

| Method | Endpoint | Auth | 설명 |
|--------|----------|------|------|
| GET | `/chat/channels` | ✅ | 채팅 채널 목록 |
| POST | `/chat/create_channel` | ✅ | 채팅 채널 생성 |

### Attendance & Rewards

| Method | Endpoint | Auth | 설명 |
|--------|----------|------|------|
| POST | `/attendance` | ✅ | 출석 체크 |
| GET | `/point` | ✅ | 포인트 조회 |

---

## 엔드포인트 분류

### 인증 필요 (✅)
- 개인 정보 관련: 프로필, 즐겨찾기, 예약, 사용자 삭제
- 생성/수정/삭제: 리뷰, 게시물, 댓글, 이벤트
- 게임화: 퀴즈, 배지, 포인트

### 인증 불필요 (❌)
- 조회 전용: 병원, 리뷰, 이벤트, 수술정보
- 검색: 통합 검색
- 분석: AI 피부분석
- 저장소: 파일 다운로드
- 위치: 위치 정보

---

## HTTP 상태 코드 분포

### 가장 일반적인 상태 코드

| 코드 | 의미 | 주로 사용되는 엔드포인트 |
|------|------|----------------------|
| 200 | OK | 모든 GET, 대부분 DELETE |
| 201 | Created | POST (생성) |
| 400 | Bad Request | 검증 실패 |
| 401 | Unauthorized | 인증 필요한 엔드포인트 |
| 404 | Not Found | 리소스 없음 |
| 409 | Conflict | 즐겨찾기 중복 |
| 500 | Server Error | 데이터베이스 오류 등 |

---

## 공통 쿼리 파라미터

| 파라미터 | 타입 | 기본값 | 설명 | 사용 엔드포인트 |
|---------|------|--------|------|-----------------|
| `pageParam` | number | 0 | 페이지 번호 | 목록 조회 |
| `q` | string | - | 검색어 | `/search` |
| `locationNum` | number | - | 지역 번호 | `/hospital/list` |

---

## 데이터베이스 테이블 매핑

| 테이블 | 관련 엔드포인트 | CRUD |
|--------|-----------------|------|
| hospital | `/hospital/*` | R |
| hospital_details | `/hospital/[id]/info` | R |
| hospital_business_hour | `/hospital/[id]/info` | R |
| hospital_treatment | `/hospital/[id]/info` | R |
| doctor | `/hospital/[id]/info` | R |
| reservations | `/hospital/[id]/reservation` | CRUD |
| reviews | `/hospital/[id]/review`, `/surgeries/[id]/review` | CRUD |
| members | `/auth/getUser`, `/auth/update_profile` | RU |
| favorite | `/auth/favorite` | CRD |
| community_posts | `/community/posts` | CRUD |
| community_comments | `/community/posts/[id]/comments` | CRUD |
| community_reports | `/community/reports` | C |
| event | `/event`, `/hospital/[id]/event` | CRUD |
| surgery_info | `/surgeries/[id]/info` | R |
| treatment_care_protocols | `/treatment_care_protocols` | R |

---

## 성능 최적화 팁

### 병렬 요청
```typescript
Promise.all([
  fetchHospitalInfo(),
  fetchReviews(),
  fetchTreatments(),
  fetchDoctors()
])
```

### 캐싱
- 대부분 `Cache-Control: no-store`
- 클라이언트 측 React Query 캐싱 활용

### 페이지네이션
- 큰 결과셋은 `pageParam` 사용
- 한 번에 모든 데이터 로드 금지

---

## API 호출 예시

### TypeScript/JavaScript

```typescript
// GET 요청
const response = await fetch('/api/hospital/list?locationNum=1');
const { data, total } = await response.json();

// POST 요청
const response = await fetch('/api/hospital/[id]/reservation', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'John Doe',
    email: 'john@example.com',
    nationality: 'US'
  })
});

// 파일 업로드 (multipart)
const formData = new FormData();
formData.append('image', imageFile);
formData.append('concerns', JSON.stringify(['Wrinkle', 'Acne']));

const response = await fetch('/api/ai/youcam/skin_analysis', {
  method: 'POST',
  body: formData
});
```

---

## 미래 계획

- [ ] GraphQL 엔드포인트 추가
- [ ] WebSocket 채팅
- [ ] 푸시 알림 API
- [ ] 결제 API 통합
- [ ] 분석 API
- [ ] 추천 엔진 API

---

## 문서 업데이트 이력

| 날짜 | 버전 | 변경사항 |
|------|------|--------|
| 2025-10-27 | 1.0 | 초기 작성 |
