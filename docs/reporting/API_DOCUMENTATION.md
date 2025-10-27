# API 문서

> 생성일: 2025년 10월 27일
> 프로젝트: Beauty Platform (K-Beauty & Medical Services)
> 서버: Next.js 14 + API Routes

## 목차

1. [개요](#개요)
2. [인증](#인증)
3. [API 엔드포인트](#api-엔드포인트)
   - [인증 (Auth)](#인증-auth)
   - [병원 (Hospital)](#병원-hospital)
   - [예약 (Reservation)](#예약-reservation)
   - [리뷰 (Review)](#리뷰-review)
   - [즐겨찾기 (Favorite)](#즐겨찾기-favorite)
   - [커뮤니티 (Community)](#커뮤니티-community)
   - [이벤트 (Event)](#이벤트-event)
   - [검색 (Search)](#검색-search)
   - [AI 분석 (AI Analysis)](#ai-분석-ai-analysis)
   - [위치 (Location)](#위치-location)
   - [저장소 (Storage)](#저장소-storage)

---

## 개요

### 베이스 URL
```
http://localhost:3000/api
https://[production-domain]/api
```

### 응답 형식

#### 성공 응답
```json
{
  "data": {},
  "status": 200,
  "message": "Success"
}
```

#### 에러 응답
```json
{
  "error": "Error message",
  "status": 400,
  "details": {}
}
```

### 상태 코드
- `200`: 성공
- `201`: 생성됨
- `400`: 잘못된 요청
- `401`: 인증 필요
- `403`: 권한 없음
- `404`: 찾을 수 없음
- `409`: 충돌 (이미 존재함)
- `500`: 서버 오류

---

## 인증

### 세션 기반 인증
- **방식**: Iron Session (서버 사이드 세션)
- **저장소**: 요청 쿠키
- **필수 헤더**: 자동 (쿠키 기반)

### 인증 상태 확인

요청에서 세션 객체:
```typescript
session.auth = {
  status: 'active' | 'inactive',
  id_uuid: string,
  email: string,
  avatar?: string
}
```

---

## API 엔드포인트

### 인증 (Auth)

#### GET /auth/getUser
**설명**: 현재 로그인한 사용자 정보 조회

**인증**: 필수

**요청**:
```http
GET /api/auth/getUser
```

**응답 (200)**:
```json
{
  "userInfo": {
    "auth_user": {
      "id": "uuid-string",
      "email": "user@example.com",
      "imageUrl": "https://..."
    },
    "id": 1,
    "id_uuid": "uuid-string",
    "user_no": 123,
    "name": "John Doe",
    "nickname": "johndoe",
    "email": "user@example.com",
    "avatar": "https://...",
    "phone": "+1234567890",
    "birth_date": "1990-01-01",
    "gender": "M",
    "nationality": "KR",
    "created_at": "2025-01-01T00:00:00Z"
  }
}
```

**응답 (401)**:
```json
{
  "userInfo": null
}
```

---

#### POST /auth/getUser
**설명**: 이메일로 사용자 조회

**인증**: 불필요

**요청**:
```http
POST /api/auth/getUser
Content-Type: application/json

{
  "email": "user@example.com"
}
```

**응답 (200)**:
```json
{
  "user": {
    "id": 1,
    "id_uuid": "uuid-string",
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

---

#### POST /auth/update_profile
**설명**: 사용자 프로필 업데이트

**인증**: 필수

**요청**:
```http
POST /api/auth/update_profile
Content-Type: application/json

{
  "name": "Jane Doe",
  "nickname": "janedoe",
  "avatar": "https://...",
  "phone": "+1234567890",
  "birth_date": "1990-01-01",
  "gender": "F"
}
```

**응답 (200)**:
```json
{
  "success": true,
  "user": { /* 업데이트된 사용자 정보 */ }
}
```

---

#### POST /auth/terms/agree
**설명**: 약관 동의

**인증**: 필수

**요청**:
```http
POST /api/auth/terms/agree
Content-Type: application/json

{
  "terms_type": "privacy_policy",
  "agreed": true
}
```

---

#### POST /auth/logout
**설명**: 로그아웃

**인증**: 필수

**요청**:
```http
POST /api/auth/logout
```

**응답 (200)**:
```json
{
  "success": true
}
```

---

#### POST /auth/favorite
**설명**: 즐겨찾기 추가/조회/삭제

**인증**: 필수

##### GET - 즐겨찾기 목록 조회
```http
GET /api/auth/favorite?pageParam=0
```

**응답**:
```json
{
  "favorite": [
    {
      "id": 1,
      "uuid": "user-uuid",
      "id_hospital": 123,
      "created_at": "2025-01-01T00:00:00Z",
      "hospital": {
        "name": "병원명",
        "imageurls": ["url1", "url2"],
        "id_unique": 123
      }
    }
  ],
  "nextCursor": true
}
```

##### POST - 즐겨찾기 추가
```http
POST /api/auth/favorite
Content-Type: application/json

{
  "id_hospital": 123
}
```

**응답 (201)**:
```json
{
  "ok": true
}
```

**에러 (409)**:
```json
{
  "error": "already favorited"
}
```

##### DELETE - 즐겨찾기 삭제
```http
DELETE /api/auth/favorite
Content-Type: application/json

{
  "id_hospital": 123
}
```

또는 다중 삭제:
```json
{
  "id_hospital": [123, 124, 125]
}
```

**응답 (200)**:
```json
{
  "ok": true,
  "deleted": [/* 삭제된 항목들 */]
}
```

---

### 병원 (Hospital)

#### GET /hospital/list
**설명**: 병원 목록 조회

**인증**: 불필요

**요청**:
```http
GET /api/hospital/list?locationNum=1
```

**파라미터**:
- `locationNum` (선택): 지역 번호로 필터링

**응답 (200)**:
```json
{
  "data": [
    {
      "id": 1,
      "id_uuid": "uuid-string",
      "id_unique": 123,
      "name": "서울 성형외과",
      "name_en": "Seoul Plastic Surgery",
      "address_full_road": "서울시 강남구 테헤란로 123",
      "address_full_road_en": "123 Teheran-ro, Gangnam-gu, Seoul",
      "address_full_jibun": "서울시 강남구 역삼동 123-45",
      "latitude": 37.4979,
      "longitude": 127.0276,
      "thumbnail_url": "https://...",
      "imageurls": ["https://..."],
      "location": 1,
      "favorite_count": 45,
      "show": true,
      "created_at": "2025-01-01T00:00:00Z"
    }
  ],
  "total": 50
}
```

---

#### GET /hospital/[id]/info
**설명**: 병원 상세 정보 조회

**인증**: 불필요

**요청**:
```http
GET /api/hospital/550e8400-e29b-41d4-a716-446655440000/info
```

**응답 (200)**:
```json
{
  "data": {
    "hospital_info": {
      "id": 1,
      "id_uuid": "uuid-string",
      "name": "서울 성형외과",
      "name_en": "Seoul Plastic Surgery",
      "address_full_road": "서울시 강남구 테헤란로 123",
      "latitude": 37.4979,
      "longitude": 127.0276,
      "thumbnail_url": "https://...",
      "imageurls": ["https://..."],
      "favorite_count": 45
    },
    "hospital_details": {
      "id_uuid_hospital": "uuid-string",
      "about_clinic": "클리닉 소개...",
      "specialties": ["성형외과", "피부과"],
      "equipment": ["레이저", "초음파"]
    },
    "business_hours": [
      {
        "day_of_week": 0,
        "open_time": "10:00",
        "close_time": "18:00"
      }
    ],
    "treatments": [
      {
        "id": 1,
        "id_uuid_hospital": "uuid-string",
        "name": "보톡스",
        "description": "주름 개선 시술"
      }
    ],
    "doctors": [
      {
        "id": 1,
        "id_uuid_hospital": "uuid-string",
        "name": "Dr. Kim",
        "specialty": "성형외과",
        "experience_years": 10
      }
    ]
  }
}
```

**응답 (404)**:
```json
{
  "data": null
}
```

---

### 예약 (Reservation)

#### POST /hospital/[id]/reservation
**설명**: 병원 예약 생성

**인증**: 필수

**요청**:
```http
POST /api/hospital/550e8400-e29b-41d4-a716-446655440000/reservation
Content-Type: application/json

{
  "id_user": "user-uuid",
  "name": "John Doe",
  "english_name": "John",
  "passport_name": "JOHN DOE",
  "nationality": "US",
  "gender": "M",
  "birth_date": "1990-01-01",
  "email": "john@example.com",
  "phone": "01012345678",
  "phone_korea": "01012345678",
  "preferred_date": "2025-02-01",
  "preferred_time": "14:00",
  "visitor_count": "1",
  "reservation_headcount": "1",
  "treatment_experience": "처음입니다",
  "area_to_improve": "주름 개선",
  "consultation_request": "특별 요청사항",
  "additional_info": "추가 정보",
  "preferred_languages": ["ko", "en"]
}
```

**응답 (201)**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "id_user": "user-uuid",
    "id_uuid_hospital": "hospital-uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "preferred_date": "2025-02-01",
    "preferred_time": "14:00",
    "status_code": 1,
    "created_at": "2025-01-01T00:00:00Z"
  }
}
```

**에러 (400)**:
```json
{
  "error": {
    "fieldErrors": {
      "name": ["Name is required"]
    }
  }
}
```

---

### 리뷰 (Review)

#### GET /hospital/[id]/review
**설명**: 병원 리뷰 목록 조회

**인증**: 불필요

**요청**:
```http
GET /api/hospital/550e8400-e29b-41d4-a716-446655440000/review?pageParam=0
```

**파라미터**:
- `pageParam`: 페이지 번호 (기본값: 0)

**응답 (200)**:
```json
{
  "data": {
    "hospitalData": {
      "id": 1,
      "name": "서울 성형외과",
      "favorite_count": 45
    },
    "reviewsWithMember": [
      {
        "review": {
          "id": 1,
          "id_uuid_hospital": "hospital-uuid",
          "user_no": 123,
          "rating": 5,
          "comment": "매우 만족합니다",
          "before_image": "https://...",
          "after_image": "https://...",
          "created_at": "2025-01-01T00:00:00Z"
        },
        "member": {
          "user_no": 123,
          "name": "Jane Doe",
          "avatar": "https://...",
          "nationality": "KR"
        }
      }
    ]
  },
  "nextCursor": true
}
```

---

### 커뮤니티 (Community)

#### POST /community/posts
**설명**: 커뮤니티 게시물 생성

**인증**: 필수

**요청**:
```http
POST /api/community/posts
Content-Type: application/json

{
  "title": "시술 후기입니다",
  "content": "매우 만족합니다...",
  "id_category": "category-id",
  "author_name_snapshot": "Jane Doe",
  "author_avatar_snapshot": "https://..."
}
```

**응답 (201)**:
```json
{
  "post": {
    "id": 1,
    "uuid_author": "user-uuid",
    "title": "시술 후기입니다",
    "content": "매우 만족합니다...",
    "id_category": "category-id",
    "view_count": 0,
    "comment_count": 0,
    "like_count": 0,
    "author_name_snapshot": "Jane Doe",
    "author_avatar_snapshot": "https://...",
    "created_at": "2025-01-01T00:00:00Z",
    "updated_at": "2025-01-01T00:00:00Z"
  }
}
```

---

#### GET /community/posts
**설명**: 커뮤니티 게시물 목록 조회

**인증**: 불필요

**응답**:
```json
{
  "posts": [
    {
      "id": 1,
      "title": "시술 후기입니다",
      "content": "매우 만족합니다...",
      "view_count": 100,
      "comment_count": 5,
      "like_count": 25,
      "author_name_snapshot": "Jane Doe",
      "created_at": "2025-01-01T00:00:00Z"
    }
  ]
}
```

---

### 이벤트 (Event)

#### GET /event
**설명**: 이벤트 목록 조회

**인증**: 불필요

**요청**:
```http
GET /api/event?pageParam=0
```

**응답 (200)**:
```json
{
  "data": [
    {
      "id": 1,
      "id_uuid": "event-uuid",
      "title": "여름 프로모션",
      "title_en": "Summer Promotion",
      "description": "모든 시술 30% 할인",
      "image_url": "https://...",
      "date_from": "2025-06-01T00:00:00Z",
      "date_to": "2025-08-31T23:59:59Z",
      "location": 1,
      "hospital_ids": [1, 2, 3],
      "created_at": "2025-01-01T00:00:00Z"
    }
  ],
  "nextCursor": true
}
```

---

### 검색 (Search)

#### GET /search
**설명**: 통합 검색 (병원, 이벤트, 리뷰)

**인증**: 불필요

**요청**:
```http
GET /api/search?q=보톡스
```

**파라미터**:
- `q`: 검색어

**응답 (200)**:
```json
{
  "data": {
    "hospitals": [
      {
        "id": 1,
        "name": "서울 성형외과",
        "address": "서울시 강남구",
        "source": "hospital"
      }
    ],
    "events": [
      {
        "id": 1,
        "title": "여름 프로모션",
        "source": "event"
      }
    ],
    "reviews": [
      {
        "id": 1,
        "comment": "보톡스 매우 좋습니다",
        "source": "review"
      }
    ]
  }
}
```

---

### AI 분석 (AI Analysis)

#### POST /ai/youcam/skin_analysis
**설명**: 피부 분석 (YouCam AI)

**인증**: 불필요

**요청** (multipart/form-data):
```http
POST /api/ai/youcam/skin_analysis
Content-Type: multipart/form-data

image: [binary file]
concerns: ["Wrinkle", "Acne", "Moisture", "Pore"]
mode: "SD" | "HD" (선택)
```

**Skin Concerns (SD 모드)**:
- Wrinkle: 주름
- Droopy_upper_eyelid: 눈꺼풀 처짐
- Firmness: 탄력도
- Acne: 여드름
- Moisture: 수분
- Eye_bag: 눈밑 다크써클
- Dark_circle: 다크써클
- Spots: 기미/주근깨
- Radiance: 광채
- Redness: 홍조
- Oiliness: 유분
- Pore: 모공
- Texture: 피부 결

**응답 (200)**:
```json
{
  "success": true,
  "data": {
    "analysis": {
      "skin_type": "combination",
      "age_estimated": 28,
      "concerns": {
        "Wrinkle": 65,
        "Acne": 45,
        "Moisture": 55,
        "Pore": 50
      }
    },
    "recommendations": [
      {
        "concern": "Wrinkle",
        "products": ["anti-wrinkle serum"],
        "procedures": ["보톡스", "필러"]
      }
    ]
  }
}
```

**에러 (400)**:
```json
{
  "success": false,
  "error": "Must select exactly 4, 7, or 14 concerns. You selected 3"
}
```

---

### 위치 (Location)

#### GET /location/[id]
**설명**: 위치별 병원 정보

**인증**: 불필요

**요청**:
```http
GET /api/location/1
```

**응답**:
```json
{
  "data": {
    "location_id": 1,
    "name": "서울",
    "name_en": "Seoul",
    "hospitals": [
      {
        "id": 1,
        "name": "서울 성형외과",
        "latitude": 37.4979,
        "longitude": 127.0276
      }
    ]
  }
}
```

---

#### GET /location/[id]/position
**설명**: 위치의 지도 좌표 조회

**인증**: 불필요

**요청**:
```http
GET /api/location/1/position
```

**응답**:
```json
{
  "data": {
    "location_id": 1,
    "center": {
      "latitude": 37.5665,
      "longitude": 126.9780
    },
    "zoom": 10
  }
}
```

---

### 저장소 (Storage)

#### POST /storage/presign_upload
**설명**: S3 업로드 사전 서명 URL 발급

**인증**: 필수

**요청**:
```http
POST /api/storage/presign_upload
Content-Type: application/json

{
  "fileName": "profile.jpg",
  "fileType": "image/jpeg",
  "fileSize": 1024000
}
```

**응답 (200)**:
```json
{
  "uploadUrl": "https://s3.amazonaws.com/...",
  "key": "uploads/user-uuid/profile.jpg",
  "fields": {
    "Key": "uploads/user-uuid/profile.jpg",
    "Bucket": "beauty-platform"
  }
}
```

---

#### POST /storage/presign_read
**설명**: S3 다운로드 사전 서명 URL 발급

**인증**: 불필요

**요청**:
```http
POST /api/storage/presign_read
Content-Type: application/json

{
  "key": "uploads/user-uuid/profile.jpg"
}
```

**응답 (200)**:
```json
{
  "readUrl": "https://s3.amazonaws.com/..."
}
```

---

#### GET /storage/read
**설명**: 파일 읽기

**인증**: 불필요

**요청**:
```http
GET /api/storage/read?key=uploads/user-uuid/profile.jpg
```

**응답**: 바이너리 파일 데이터

---

## 에러 처리

### 공통 에러 코드

| 코드 | 메시지 | 해결방법 |
|------|--------|--------|
| 400 | Invalid request parameters | 요청 파라미터를 확인하세요 |
| 401 | Unauthorized | 로그인이 필요합니다 |
| 403 | Forbidden | 권한이 없습니다 |
| 404 | Not found | 요청한 리소스를 찾을 수 없습니다 |
| 409 | Conflict | 이미 존재하는 항목입니다 |
| 500 | Internal server error | 서버 오류입니다. 잠시 후 다시 시도하세요 |

### 에러 응답 예시

```json
{
  "error": "Validation failed",
  "status": 400,
  "details": {
    "fieldErrors": {
      "email": ["Invalid email format"],
      "name": ["Name is required"]
    }
  }
}
```

---

## 페이지네이션

### Cursor 기반 페이지네이션

```http
GET /api/auth/favorite?pageParam=0
GET /api/hospital/list?locationNum=1&pageParam=0
```

**응답**:
```json
{
  "data": [...],
  "nextCursor": true/false
}
```

- `nextCursor: true` = 다음 페이지 존재
- `nextCursor: false` = 마지막 페이지

### Offset 기반 페이지네이션

```http
GET /api/hospital/[id]/review?pageParam=1
```

**기본값**:
- PAGE_SIZE: 각 엔드포인트마다 다름 (보통 6-10)
- 첫 페이지: `pageParam=0`

---

## 필터링 및 정렬

### 병원 필터링
```http
GET /api/hospital/list?locationNum=1  # 지역으로 필터링
```

### 정렬
- 대부분의 목록 API는 `created_at DESC`로 정렬

---

## 캐싱 정책

### Cache-Control 헤더

```
Cache-Control: no-store
```

- 대부분의 동적 컨텐츠: `no-store` (캐싱 없음)
- 정적 리소스: 브라우저 캐싱 활용

---

## 레이트 리미팅

현재 레이트 리미팅 미적용 (향후 추가 예정)

---

## 테스트 방법

### cURL 예시

```bash
# 사용자 정보 조회
curl -X GET http://localhost:3000/api/auth/getUser \
  -H "Content-Type: application/json"

# 병원 목록 조회
curl -X GET "http://localhost:3000/api/hospital/list?locationNum=1"

# 병원 예약
curl -X POST http://localhost:3000/api/hospital/{id}/reservation \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "nationality": "US",
    "preferred_date": "2025-02-01"
  }'
```

### 환경 변수

```bash
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

---

## 주의사항

1. **인증 필수 API**: 세션이 `active` 상태여야 함
2. **다국어 지원**: 대부분 `name`과 `name_en` 필드 제공
3. **이미지 URL**: 모두 절대 URL (HTTPS 권장)
4. **UUID**: 모든 ID는 UUID v4 형식
5. **타임스탬프**: ISO 8601 형식 (UTC)
6. **JSON 배열**: Concerns, preferred_languages 등은 JSON 배열

---

## 변경 이력

| 버전 | 날짜 | 변경사항 |
|------|------|--------|
| 1.0 | 2025-10-27 | 초기 문서 작성 |

---

## 연락처

- 개발팀: dev@beautyplatform.com
- API 이슈: https://github.com/beautyplatform/api/issues
