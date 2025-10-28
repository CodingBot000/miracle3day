# API 문서 인덱스

> 생성일: 2025년 10월 27일
> 프로젝트: Beauty Platform (K-Beauty & Medical Services)
> 문서 버전: 1.0

## 📚 문서 목록

### 1. **API_DOCUMENTATION.md** (메인 문서)
   - API 개요 및 기본 정보
   - 모든 엔드포인트 상세 설명
   - 요청/응답 예시
   - 에러 처리 방법
   - 페이지네이션 및 캐싱 정책

   **추천**: 🚀 **여기서 시작하세요!**

### 2. **API_ENDPOINTS_DETAILED.md** (엔드포인트 목록)
   - 70+ 엔드포인트 전체 목록
   - 카테고리별 분류
   - HTTP 메소드 및 인증 요구사항
   - 데이터베이스 테이블 매핑
   - API 호출 패턴

   **추천**: 특정 엔드포인트를 찾을 때 사용하세요

### 3. **API_USAGE_EXAMPLES.md** (사용 예시)
   - TypeScript/JavaScript 코드 예시
   - React Query 통합
   - 에러 처리 패턴
   - 파일 업로드 방법
   - AI 분석 API 사용법
   - 타입 정의

   **추천**: 실제 구현할 때 참고하세요

---

## 🎯 빠른 시작 가이드

### 첫 API 호출하기

```bash
# 1. 병원 목록 조회 (인증 불필요)
curl "http://localhost:3000/api/hospital/list?locationNum=1"

# 2. 현재 사용자 정보 조회 (인증 필요)
curl "http://localhost:3000/api/auth/getUser" \
  -H "Cookie: iron-session=..."
```

### TypeScript에서 사용하기

```typescript
import { apiClient } from '@/lib/api-client';

// 병원 목록 조회
const hospitals = await apiClient.get('/hospital/list');
console.log(hospitals.data);

// 예약 생성
const reservation = await apiClient.post('/hospital/[id]/reservation', {
  name: 'John Doe',
  email: 'john@example.com',
  nationality: 'US',
});
```

---

## 📖 카테고리별 문서

### 인증 (Authentication)
- **문서**: API_DOCUMENTATION.md → 인증
- **엔드포인트**: `/auth/*`
- **주요 API**:
  - `GET /auth/getUser` - 사용자 정보 조회
  - `POST /auth/update_profile` - 프로필 수정
  - `POST /auth/logout` - 로그아웃

### 병원 (Hospital)
- **문서**: API_DOCUMENTATION.md → 병원
- **엔드포인트**: `/hospital/*`
- **주요 API**:
  - `GET /hospital/list` - 병원 목록 (필터링 가능)
  - `GET /hospital/[id]/info` - 병원 상세 정보
  - `GET /hospital/[id]/event` - 병원 이벤트

### 예약 (Reservation)
- **문서**: API_DOCUMENTATION.md → 예약, API_USAGE_EXAMPLES.md → 예약 시스템
- **엔드포인트**: `/hospital/[id]/reservation`
- **주요 기능**:
  - 예약 생성 (POST)
  - Zod 검증 포함
  - 다국어 지원

### 리뷰 (Review)
- **문서**: API_DOCUMENTATION.md → 리뷰, API_USAGE_EXAMPLES.md → 리뷰 시스템
- **엔드포인트**: `/hospital/[id]/review`, `/surgeries/[id]/review`
- **기능**:
  - 리뷰 목록 (페이지네이션)
  - 리뷰 작성/수정/삭제
  - 이미지 포함 리뷰

### 즐겨찾기 (Favorite)
- **문서**: API_DOCUMENTATION.md → 즐겨찾기
- **엔드포인트**: `/auth/favorite`
- **HTTP 메소드**: GET, POST, DELETE

### 커뮤니티 (Community)
- **문서**: API_DOCUMENTATION.md → 커뮤니티
- **엔드포인트**: `/community/*`
- **기능**:
  - 게시물 CRUD
  - 댓글 관리
  - 신고 시스템

### 검색 (Search)
- **문서**: API_DOCUMENTATION.md → 검색
- **엔드포인트**: `/search`
- **검색 대상**: 병원, 이벤트, 리뷰

### AI 분석 (AI Analysis)
- **문서**: API_DOCUMENTATION.md → AI 분석, API_USAGE_EXAMPLES.md → AI 분석
- **엔드포인트**: `/ai/youcam/skin_analysis`
- **기능**:
  - 피부 분석 (SD/HD 모드)
  - 13가지 피부 고민 분석
  - 파일 업로드 필수

### 위치 (Location)
- **문서**: API_DOCUMENTATION.md → 위치
- **엔드포인트**: `/location/[id]`, `/location/[id]/position`

### 저장소 (Storage)
- **문서**: API_DOCUMENTATION.md → 저장소, API_USAGE_EXAMPLES.md → 파일 업로드
- **엔드포인트**: `/storage/*`
- **기능**:
  - S3 사전 서명 URL
  - 파일 업로드/다운로드

---

## 🔐 인증 필수/불필요 엔드포인트

### 인증 불필요 (공개 API) ❌
- 병원 조회: `/hospital/*` (GET만)
- 리뷰 조회: `/hospital/[id]/review`
- 이벤트: `/event`
- 검색: `/search`
- AI 분석: `/ai/*`
- 위치: `/location/*`
- 저장소: `/storage/read`, `/storage/presign_read`

### 인증 필수 (비공개 API) ✅
- 프로필: `/auth/*` (POST/PUT)
- 예약: `/hospital/[id]/reservation` (POST)
- 리뷰 작성: `/hospital/[id]/review` (POST/PUT/DELETE)
- 즐겨찾기: `/auth/favorite`
- 커뮤니티: `/community/*` (POST/PUT/DELETE)
- 파일 업로드: `/storage/upload`, `/storage/presign_upload`
- 게임화: `/gamification/*`

---

## 📊 API 통계

| 카테고리 | 개수 | 설명 |
|---------|------|------|
| 인증 | 8 | 사용자 인증 및 프로필 |
| 병원 | 5 | 병원 정보 및 검색 |
| 예약 | 5 | 예약 관리 |
| 리뷰 | 6 | 리뷰 관리 |
| 커뮤니티 | 7 | 게시물 및 댓글 |
| 이벤트 | 6 | 이벤트 관리 |
| 수술/시술 | 6 | 수술 및 시술 정보 |
| AI 분석 | 3 | AI 기반 분석 |
| 위치 | 3 | 위치 정보 |
| 검색 | 1 | 통합 검색 |
| 저장소 | 6 | 파일 관리 |
| 기타 | 13 | 헬스체크, 채팅, 포인트 등 |
| **총합** | **69** | **모든 엔드포인트** |

---

## 🛠️ 개발 환경 설정

### 필수 환경 변수

```env
# 로컬 개발
NEXT_PUBLIC_API_URL=http://localhost:3000/api

# 프로덕션
NEXT_PUBLIC_API_URL=https://api.beautyplatform.com
```

### 개발 서버 실행

```bash
# 의존성 설치
npm install

# 개발 서버 시작
npm run dev

# API 엔드포인트 확인
curl http://localhost:3000/api/health/db
```

---

## 🔗 통합 지침

### 1단계: API 클라이언트 설정
```typescript
// src/lib/api-client.ts
import axios from 'axios';

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
});
```

### 2단계: 서비스 레이어 구성
```typescript
// src/services/*.service.ts
// 각 도메인별 API 호출 함수 정의
```

### 3단계: React Query Hook 작성
```typescript
// src/hooks/use*.ts
// React Query를 사용한 데이터 페칭
```

### 4단계: 컴포넌트에서 사용
```typescript
// src/components/*.tsx
// Hook을 사용하여 UI 구성
```

---

## 🚀 성능 최적화 팁

### 1. React Query 캐싱
```typescript
useQuery({
  queryKey: ['hospitals', locationNum],
  queryFn: () => fetchHospitals(locationNum),
  staleTime: 5 * 60 * 1000, // 5분
  gcTime: 10 * 60 * 1000, // 10분
});
```

### 2. 병렬 요청
```typescript
Promise.all([
  fetchHospitalInfo(),
  fetchReviews(),
  fetchTreatments(),
])
```

### 3. 페이지네이션
```typescript
// 무한 스크롤
useInfiniteQuery({
  queryKey: ['reviews'],
  queryFn: ({ pageParam }) => fetchReviews(pageParam),
  getNextPageParam: (lastPage) => lastPage.nextCursor ? ... : undefined,
});
```

---

## ⚠️ 일반적인 오류 및 해결

### 401 Unauthorized
**원인**: 세션이 없거나 만료됨
**해결**: 로그인 페이지로 리다이렉트

### 400 Bad Request
**원인**: 요청 데이터 검증 실패
**해결**: 요청 데이터 확인 및 API_USAGE_EXAMPLES.md 참고

### 409 Conflict
**원인**: 이미 즐겨찾기한 병원
**해결**: 사용자에게 알림 후 중복 요청 방지

### 500 Internal Server Error
**원인**: 서버 오류
**해결**: 로그 확인 및 지원팀에 연락

---

## 📞 지원 및 문의

### 개발 팀
- 이메일: dev@beautyplatform.com
- GitHub Issues: https://github.com/beautyplatform/api/issues

### API 명세 확인
1. **Swagger UI**: http://localhost:3000/swagger-ui (향후 추가)
2. **API 문서**: 이 디렉토리의 문서 참고
3. **소스 코드**: `/src/app/api/**/route.ts`

---

## 📝 문서 관리

### 문서 위치
```
/docs/reporting/
├── README.md                        (이 파일)
├── API_DOCUMENTATION.md             (메인 API 문서)
├── API_ENDPOINTS_DETAILED.md        (상세 엔드포인트 목록)
└── API_USAGE_EXAMPLES.md            (사용 예시 및 패턴)
```

### 문서 업데이트
- 새 엔드포인트 추가 시 → `API_ENDPOINTS_DETAILED.md` 업데이트
- API 명세 변경 시 → `API_DOCUMENTATION.md` 업데이트
- 구현 패턴 변경 시 → `API_USAGE_EXAMPLES.md` 업데이트

---

## 🎓 학습 경로

### 초급자
1. README.md (현재 문서) 읽기
2. API_DOCUMENTATION.md → 인증 및 병원 섹션
3. API_USAGE_EXAMPLES.md → 기본 설정 및 병원 검색

### 중급자
1. API_ENDPOINTS_DETAILED.md → 전체 엔드포인트 개요
2. API_DOCUMENTATION.md → 모든 엔드포인트 상세 학습
3. API_USAGE_EXAMPLES.md → 고급 패턴 (에러 처리, 최적화)

### 고급자
1. 소스 코드 분석: `/src/app/api/**/route.ts`
2. 서비스 레이어: `/src/services/*.service.ts`
3. Hook 구현: `/src/hooks/*.ts`

---

## 📋 체크리스트

### API 통합 전 확인 사항
- [ ] 개발 환경 설정 완료
- [ ] API 베이스 URL 확인
- [ ] 필요한 엔드포인트 목록 작성
- [ ] 인증 필요 여부 확인
- [ ] 요청/응답 데이터 구조 파악
- [ ] 에러 처리 전략 수립
- [ ] React Query 설정 완료

### 첫 엔드포인트 구현
- [ ] API 클라이언트 호출 함수 작성
- [ ] React Query Hook 작성
- [ ] 컴포넌트에서 Hook 사용
- [ ] 로딩/에러 상태 처리
- [ ] 로컬 환경에서 테스트

---

## 🔄 버전 관리

| 버전 | 날짜 | 변경사항 |
|------|------|--------|
| 1.0 | 2025-10-27 | 초기 문서 작성 |

---

## 라이선스

이 API 문서는 Beauty Platform 팀의 내부 사용을 위해 작성되었습니다.

---

## 더 알아보기

- 📱 프론트엔드 코드: [링크 추가]
- 🗄️ 데이터베이스 스키마: [링크 추가]
- 🚀 배포 가이드: [링크 추가]
- 🧪 테스트 방법: [링크 추가]

---

**마지막 업데이트**: 2025-10-27

질문이나 개선 사항이 있으면 개발팀에 연락하세요! 🚀
