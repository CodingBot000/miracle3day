# API 중앙화 작업 요약

## 작업 개요

AWS API 서버 마이그레이션을 대비하여 전체 프로젝트의 API 호출을 중앙화하는 작업을 완료했습니다.

## 생성된 파일

### 1. `/src/config/api.config.ts`
**목적:** API 엔드포인트 및 설정을 중앙 관리

**주요 내용:**
- `API_CONFIG`: 베이스 URL, 타임아웃, 재시도 설정
- `API_ENDPOINTS`: 모든 API 엔드포인트 경로 정의
- `HTTP_METHODS`: HTTP 메서드 상수

**AWS 마이그레이션 시:**
```typescript
// .env 파일에서 설정
NEXT_PUBLIC_API_BASE_URL=https://your-api-gateway.amazonaws.com/prod
```

---

### 2. `/src/services/database/supabaseService.ts`
**목적:** Supabase 데이터베이스 접근을 중앙화

**주요 내용:**
- `TABLES`: 모든 테이블 이름 상수 (35개 테이블)
- `supabaseService`: Supabase 클라이언트 래퍼
- 도메인별 서비스 함수:
  - `hospitalService`: 병원 관련 DB 작업
  - `treatmentService`: 치료 관련 DB 작업
  - `userService`: 사용자 관련 DB 작업
  - `communityService`: 커뮤니티 DB 작업
  - `bannerService`: 배너 DB 작업
  - `referenceService`: 참조 데이터 DB 작업
  - `gamificationService`: 게임화 DB 작업

**AWS RDS 마이그레이션 시:**
이 파일만 수정하면 전체 프로젝트의 DB 접근 방식이 변경됩니다.
```typescript
// Supabase → Prisma/TypeORM으로 변경
export const hospitalService = {
  async getHospital(id: string) {
    // Before
    return supabaseService.from(TABLES.HOSPITAL).select('*').eq('id_uuid', id).single();

    // After (Prisma)
    return prisma.hospital.findUnique({ where: { id_uuid: id } });
  },
};
```

---

### 3. `/src/services/api/apiClient.ts`
**목적:** HTTP 요청을 처리하는 클라이언트

**주요 기능:**
- `ApiClient` 클래스: GET, POST, PUT, PATCH, DELETE 메서드
- `ApiError` 클래스: 에러 처리
- 타임아웃 처리
- 재시도 로직 (`requestWithRetry`)
- Query string 빌더 (`buildQueryString`)

**사용 예시:**
```typescript
import { apiClient } from '@/services/api/apiClient';

// GET 요청
const response = await apiClient.get('/api/hospital/123/info');

// POST 요청
const response = await apiClient.post('/api/auth/signup', {
  email: 'user@example.com',
  password: 'password123',
});
```

---

### 4. `/src/services/api/index.ts`
**목적:** 모든 API 호출을 정의하는 서비스 레이어

**도메인별 API 서비스:**
- `hospitalApi`: 병원 API
  - `getHospitalInfo()`
  - `getHospitalMain()`
  - `createReservation()`
- `treatmentApi`: 치료 API
  - `getCareProtocols()`
- `surgeryApi`: 수술 API
  - `getSurgeryInfo()`
  - `getSurgeryEvent()`
  - `getSurgeryReview()`
  - `getSurgeryHospital()`
- `communityApi`: 커뮤니티 API
  - `getPosts()`
  - `getCategories()`
- `homeApi`: 홈 API
  - `getBanners()`
- `eventApi`: 이벤트 API
  - `getEventDetail()`
- `authApi`: 인증 API
  - `signUp()`
  - `signIn()`
  - `signOut()`
  - `getCountryCodes()`
  - `addFavorite()`
  - `removeFavorite()`
  - `getFavorites()`
- `externalApi`: 외부 API
  - `getYouCamTreatmentProtocol()`

**통합 export:**
```typescript
import { api } from '@/services/api';

// 사용 예시
const hospitalData = await api.hospital.getHospitalInfo('123');
const treatments = await api.treatment.getCareProtocols({ topic_id: 'lifting' });
```

---

### 5. `/docs/AWS_MIGRATION_GUIDE.md`
**목적:** AWS 마이그레이션 전체 가이드

**주요 섹션:**
1. 현재 아키텍처 vs 마이그레이션 후 아키텍처
2. AWS 구성 요소 (API Gateway, Lambda, RDS/Supabase)
3. 중앙화된 API 구조 설명
4. 6단계 마이그레이션 계획:
   - Phase 1: 준비 단계 (✅ 완료)
   - Phase 2: AWS 인프라 구축
   - Phase 3: 환경 변수 업데이트
   - Phase 4: 점진적 마이그레이션 (Feature Flag 패턴)
   - Phase 5: 테스트 및 검증
   - Phase 6: 모니터링 설정
5. 환경 변수 설정
6. 테스트 전략
7. 비용 추정
8. 롤백 계획
9. 체크리스트

---

## 업데이트된 파일

### `/src/services/treatmentService.ts`
**변경 사항:**
- ❌ 직접 `fetch()` 호출 제거
- ✅ 중앙화된 `treatmentApi` 사용

**Before:**
```typescript
async getTreatmentCareProtocols(params) {
  const url = `${this.baseUrl}/care-protocols?${searchParams}`;
  const response = await fetch(url, { ... });
  return response.json();
}
```

**After:**
```typescript
async getTreatmentCareProtocols(params) {
  const response = await treatmentApi.getCareProtocols(params);
  return response.data;
}
```

---

### `/src/services/auth.ts`
**변경 사항:**
- ✅ `referenceService` 사용으로 국가 코드 조회
- ✅ `TABLES` 상수 사용

**Before:**
```typescript
const { data: countryCode } = await supabase
  .from("country_codes")
  .select("*")
  .match({ country_name: nation })
  .single();
```

**After:**
```typescript
const { data: countryCode } = await referenceService.getCountryByName(nation);
```

---

## 사용 방법

### 컴포넌트에서 API 호출

**옵션 1: 직접 API 서비스 사용**
```typescript
import { api } from '@/services/api';

export default function HospitalPage({ id }: { id: string }) {
  const [hospital, setHospital] = useState(null);

  useEffect(() => {
    api.hospital.getHospitalInfo(id).then(response => {
      setHospital(response.data);
    });
  }, [id]);
}
```

**옵션 2: React Query와 함께 사용 (권장)**
```typescript
import { useQuery } from '@tanstack/react-query';
import { api } from '@/services/api';

export function useHospitalInfo(id: string) {
  return useQuery({
    queryKey: ['hospital', id],
    queryFn: async () => {
      const response = await api.hospital.getHospitalInfo(id);
      return response.data;
    },
  });
}

// 컴포넌트에서
const { data, isLoading, error } = useHospitalInfo(hospitalId);
```

---

## AWS 마이그레이션 시나리오

### 시나리오 1: Next.js API Routes → AWS Lambda
```typescript
// 1. Lambda 함수 배포
// 2. API Gateway URL 획득: https://abc123.execute-api.ap-northeast-2.amazonaws.com/prod

// 3. 환경 변수 설정
NEXT_PUBLIC_API_BASE_URL=https://abc123.execute-api.ap-northeast-2.amazonaws.com/prod

// 4. 코드 변경 없음! API 클라이언트가 자동으로 새 URL 사용
```

### 시나리오 2: Supabase → AWS RDS
```typescript
// src/services/database/supabaseService.ts 파일만 수정

// Before: Supabase
export const hospitalService = {
  async getHospital(id: string) {
    return supabaseService.from(TABLES.HOSPITAL)
      .select('*')
      .eq('id_uuid', id)
      .single();
  },
};

// After: Prisma + AWS RDS
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const hospitalService = {
  async getHospital(id: string) {
    return prisma.hospital.findUnique({
      where: { id_uuid: id },
    });
  },
};
```

---

## Feature Flag를 사용한 점진적 전환

```typescript
// .env.local
NEXT_PUBLIC_USE_AWS_API=false  # Next.js API Routes 사용
NEXT_PUBLIC_USE_AWS_API=true   # AWS Lambda 사용

// src/services/api/apiClient.ts
class ApiClient {
  constructor() {
    const useAWS = process.env.NEXT_PUBLIC_USE_AWS_API === 'true';
    this.baseURL = useAWS
      ? 'https://your-api-gateway.amazonaws.com/prod'
      : '';  // Next.js API Routes
  }
}
```

**장점:**
- 프로덕션에서 일부 사용자만 AWS API 사용 가능
- 문제 발생 시 즉시 롤백 가능
- A/B 테스트 가능

---

## 데이터베이스 테이블 목록

### 중앙화된 테이블 상수 (`TABLES`)

**Core Tables:**
- `hospital`, `hospital_details`, `hospital_treatment`, `hospital_business_hour`, `hospital_language`
- `doctor`

**Treatment Tables:**
- `treatment`, `treatment_category`, `surgery_info`
- `treatment_care_protocols`, `treatments_root`, `treatments_alias`

**User Tables:**
- `members`, `favorite`, `reviews`, `reservations`

**Gamification Tables:**
- `attendance`, `attendance_monthly`, `quiz_question`, `quiz_attempt`, `point_transactions`

**Community Tables:**
- `community_posts`, `community_categories`

**Banner/Event Tables:**
- `banner_show`, `banner_item`, `event`

**Reference Tables:**
- `country`, `country_codes`, `language`

**Admin Tables:**
- `admin`, `feedback`

---

## 마이그레이션 체크리스트

### ✅ 완료된 작업
- [x] API 설정 파일 생성
- [x] 중앙화된 데이터베이스 서비스 생성
- [x] API 클라이언트 래퍼 생성
- [x] API 서비스 레이어 생성
- [x] 기존 서비스 파일 업데이트 (treatmentService, auth)
- [x] 마이그레이션 가이드 문서 작성

### 📋 다음 단계 (AWS 마이그레이션 시)
- [ ] AWS 계정 및 IAM 설정
- [ ] API Gateway 생성
- [ ] Lambda 함수 작성 및 배포
- [ ] 환경 변수 설정 (Vercel + AWS)
- [ ] Feature Flag 구현
- [ ] 엔드포인트별 점진적 전환
- [ ] 성능 및 비용 모니터링
- [ ] 기존 Next.js API Routes 제거 (선택)

---

## 이점

### 1. **유연한 마이그레이션**
- 코드 변경 없이 환경 변수만으로 API 전환 가능
- 점진적 마이그레이션 지원 (Feature Flag)

### 2. **유지보수성 향상**
- 모든 API 호출이 한 곳에 정의됨
- 엔드포인트 변경 시 한 파일만 수정

### 3. **타입 안정성**
- TypeScript 인터페이스로 API 요청/응답 타입 정의
- 컴파일 타임에 에러 감지

### 4. **테스트 용이성**
- API 클라이언트를 모킹하여 테스트
- 각 레이어를 독립적으로 테스트 가능

### 5. **에러 처리 일관성**
- 중앙화된 에러 처리
- 재시도 로직 자동 적용

---

## 참고 사항

### 주의사항
1. **기존 컴포넌트 업데이트 필요**
   - 현재는 일부 파일만 업데이트됨
   - 프로젝트 전체에서 직접 `fetch()` 호출을 찾아 API 서비스로 교체 필요

2. **환경 변수 관리**
   - `.env.local` (로컬 개발)
   - Vercel 환경 변수 (프로덕션)
   - AWS Lambda 환경 변수 (마이그레이션 후)

3. **Next.js API Routes 유지 여부**
   - AWS 마이그레이션 후에도 Next.js API Routes 유지 가능
   - 완전히 제거하거나 일부만 AWS로 이전 가능

### 권장 사항
1. **마이그레이션 전 테스트**
   - 로컬에서 충분히 테스트 후 배포
   - Staging 환경에서 먼저 테스트

2. **모니터링 설정**
   - CloudWatch 대시보드 구성
   - 에러율, 응답 시간, 비용 추적

3. **롤백 계획 준비**
   - Feature Flag를 사용한 즉시 롤백
   - DNS 레벨 롤백 (Route53)

---

## 문의

마이그레이션 또는 API 구조 관련 문의사항은 개발팀에 연락하세요.
