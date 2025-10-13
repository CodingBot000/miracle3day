# AWS 마이그레이션 가이드

이 문서는 현재 Next.js 프로젝트의 API를 AWS로 마이그레이션하기 위한 가이드입니다.

## 목차
1. [현재 아키텍처](#현재-아키텍처)
2. [마이그레이션 후 아키텍처](#마이그레이션-후-아키텍처)
3. [중앙화된 API 구조](#중앙화된-api-구조)
4. [마이그레이션 단계](#마이그레이션-단계)
5. [환경 변수 설정](#환경-변수-설정)
6. [테스트 전략](#테스트-전략)

---

## 현재 아키텍처

```
┌─────────────────────────────────────────────────────────┐
│                    Next.js Application                   │
│  ┌────────────────────────────────────────────────────┐ │
│  │           Frontend (React Components)              │ │
│  └───────────────────┬────────────────────────────────┘ │
│                      │                                   │
│  ┌───────────────────▼────────────────────────────────┐ │
│  │         Next.js API Routes (/api/*)                │ │
│  │  - /api/hospital/[id]/info                         │ │
│  │  - /api/treatment/care-protocols                   │ │
│  │  - /api/auth/*                                     │ │
│  │  - /api/community/*                                │ │
│  └───────────────────┬────────────────────────────────┘ │
└────────────────────────┼────────────────────────────────┘
                        │
                        ▼
            ┌───────────────────────┐
            │   Supabase PostgreSQL │
            └───────────────────────┘
```

### 현재 구조의 문제점
- API 로직이 Next.js에 강하게 결합됨
- 독립적인 API 서버 확장 불가능
- API 호출이 여러 곳에 분산되어 있음
- AWS 마이그레이션 시 대규모 리팩토링 필요

---

## 마이그레이션 후 아키텍처

```
┌─────────────────────────────────────────────────────────┐
│              Next.js Frontend (Vercel)                   │
│  ┌────────────────────────────────────────────────────┐ │
│  │        React Components + Pages                    │ │
│  └───────────────────┬────────────────────────────────┘ │
│                      │                                   │
│  ┌───────────────────▼────────────────────────────────┐ │
│  │        Centralized API Client                      │ │
│  │        (/src/services/api/apiClient.ts)            │ │
│  └───────────────────┬────────────────────────────────┘ │
└────────────────────────┼────────────────────────────────┘
                        │
                        │ HTTPS
                        │
            ┌───────────▼───────────┐
            │   AWS API Gateway     │
            │   (REST API)          │
            └───────────┬───────────┘
                        │
        ┌───────────────┼───────────────┐
        │               │               │
        ▼               ▼               ▼
  ┌──────────┐   ┌──────────┐   ┌──────────┐
  │ Lambda 1 │   │ Lambda 2 │   │ Lambda 3 │
  │ Hospital │   │Treatment │   │   Auth   │
  └─────┬────┘   └─────┬────┘   └─────┬────┘
        │              │              │
        └──────────────┼──────────────┘
                       │
            ┌──────────▼──────────┐
            │   AWS RDS (옵션)     │
            │   또는 Supabase     │
            └─────────────────────┘
```

### AWS 구성 요소

#### 1. **API Gateway**
- RESTful API 엔드포인트 제공
- 요청 검증 및 인증/인가
- Rate limiting, Throttling
- CORS 설정

#### 2. **Lambda Functions** (Serverless)
- 각 도메인별로 Lambda 함수 분리
  - `hospital-service`: 병원 관련 API
  - `treatment-service`: 치료 관련 API
  - `auth-service`: 인증 관련 API
  - `community-service`: 커뮤니티 API
- Auto-scaling
- 비용 효율적

#### 3. **Database Options**

**옵션 A: AWS RDS (PostgreSQL)**
```
장점:
- 완전한 AWS 생태계 통합
- VPC 내 보안
- 자동 백업 및 복구
- Performance Insights

단점:
- Supabase 기능 (Auth, Storage) 재구현 필요
- 마이그레이션 비용 높음
```

**옵션 B: Supabase 유지**
```
장점:
- 기존 Auth, Storage 기능 유지
- 빠른 마이그레이션
- Row Level Security 유지

단점:
- AWS 외부 의존성
- 약간의 레이턴시 증가 가능
```

**권장: 옵션 B (단계적 마이그레이션)**

---

## 중앙화된 API 구조

프로젝트는 이미 AWS 마이그레이션을 위해 중앙화된 API 구조로 재구성되었습니다.

### 1. API 설정 파일
**`/src/config/api.config.ts`**
```typescript
export const API_CONFIG = {
  // AWS API Gateway URL로 변경 가능
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || '',

  // Supabase 유지 또는 AWS RDS로 변경
  supabaseURL: process.env.NEXT_PUBLIC_SUPABASE_URL!,
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,

  timeout: 30000,
  retry: {
    retries: 3,
    retryDelay: 1000,
  },
};
```

### 2. 데이터베이스 서비스 레이어
**`/src/services/database/supabaseService.ts`**
- 모든 Supabase 테이블 접근을 중앙화
- AWS RDS로 변경 시 이 파일만 수정

```typescript
// 현재: Supabase 사용
export const hospitalService = {
  async getHospital(id: string) {
    return supabaseService.from(TABLES.HOSPITAL)
      .select('*')
      .eq('id_uuid', id)
      .single();
  },
};

// AWS RDS 마이그레이션 후
export const hospitalService = {
  async getHospital(id: string) {
    // Prisma, TypeORM, 또는 직접 SQL 사용
    return prisma.hospital.findUnique({
      where: { id_uuid: id }
    });
  },
};
```

### 3. API 클라이언트
**`/src/services/api/apiClient.ts`**
- 모든 HTTP 요청을 처리
- 타임아웃, 재시도, 에러 처리 포함

```typescript
class ApiClient {
  private baseURL: string;

  constructor() {
    // 환경 변수로 AWS API Gateway URL 설정 가능
    this.baseURL = API_CONFIG.baseURL;
  }

  async get<T>(endpoint: string) {
    const url = `${this.baseURL}${endpoint}`;
    // ...
  }
}
```

### 4. API 서비스 레이어
**`/src/services/api/index.ts`**
- 모든 API 엔드포인트를 정의
- 컴포넌트는 이 레이어만 사용

```typescript
export const hospitalApi = {
  getHospitalInfo: (hospitalId: string) => {
    return apiClient.get(API_ENDPOINTS.HOSPITAL.INFO(hospitalId));
  },
};

// 컴포넌트에서 사용
import { hospitalApi } from '@/services/api';

const { data } = await hospitalApi.getHospitalInfo(id);
```

---

## 마이그레이션 단계

### Phase 1: 준비 단계 (완료 ✅)
- [x] API 설정 파일 생성 (`api.config.ts`)
- [x] 중앙화된 데이터베이스 서비스 생성 (`supabaseService.ts`)
- [x] API 클라이언트 래퍼 생성 (`apiClient.ts`)
- [x] API 서비스 레이어 생성 (`api/index.ts`)
- [x] 기존 서비스 파일 업데이트

### Phase 2: AWS 인프라 구축 (예정)

#### 2.1 API Gateway 설정
```bash
# AWS CLI 또는 Terraform 사용
# API Gateway 생성
aws apigateway create-rest-api \
  --name "beauty-platform-api" \
  --endpoint-configuration types=REGIONAL

# Stage 생성 (dev, staging, prod)
aws apigateway create-stage \
  --rest-api-id <api-id> \
  --stage-name prod
```

#### 2.2 Lambda 함수 배포
```bash
# 각 도메인별 Lambda 함수 생성
# 예: Hospital Service Lambda
cd lambda/hospital-service
npm install
npm run build
zip -r function.zip .
aws lambda create-function \
  --function-name hospital-service \
  --runtime nodejs18.x \
  --handler index.handler \
  --zip-file fileb://function.zip
```

#### 2.3 Lambda 함수 구조 예시
```typescript
// lambda/hospital-service/index.ts
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { hospitalService } from './services/hospital';

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  const { httpMethod, path, pathParameters, queryStringParameters, body } = event;

  try {
    // 라우팅 로직
    if (httpMethod === 'GET' && path.includes('/hospital/')) {
      const hospitalId = pathParameters?.id;
      const data = await hospitalService.getHospital(hospitalId);

      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({ data }),
      };
    }

    return {
      statusCode: 404,
      body: JSON.stringify({ error: 'Not found' }),
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
};
```

### Phase 3: 환경 변수 업데이트

#### 3.1 로컬 개발 환경 (`.env.local`)
```bash
# 현재: Next.js API Routes 사용
NEXT_PUBLIC_API_BASE_URL=

# AWS 마이그레이션 후
NEXT_PUBLIC_API_BASE_URL=https://your-api-id.execute-api.ap-northeast-2.amazonaws.com/prod
```

#### 3.2 Vercel 환경 변수 설정
```bash
# Vercel 대시보드에서 설정
# Production
NEXT_PUBLIC_API_BASE_URL=https://api.your-domain.com

# Preview
NEXT_PUBLIC_API_BASE_URL=https://api-staging.your-domain.com
```

### Phase 4: 점진적 마이그레이션

#### 4.1 Feature Flag 패턴 사용
```typescript
// src/config/feature-flags.ts
export const FEATURE_FLAGS = {
  USE_AWS_API: process.env.NEXT_PUBLIC_USE_AWS_API === 'true',
};

// src/services/api/apiClient.ts
constructor() {
  if (FEATURE_FLAGS.USE_AWS_API) {
    this.baseURL = API_CONFIG.awsApiURL; // AWS API Gateway
  } else {
    this.baseURL = ''; // Next.js API Routes
  }
}
```

#### 4.2 단계별 엔드포인트 전환
1. **Hospital API 먼저 마이그레이션**
   - `GET /api/hospital/:id/info` → AWS Lambda
   - 테스트 및 모니터링

2. **Treatment API**
   - `GET /api/treatment/care-protocols` → AWS Lambda

3. **Auth API**
   - `POST /api/auth/signup` → AWS Lambda

4. **나머지 API 순차적 마이그레이션**

### Phase 5: 테스트 및 검증

#### 5.1 API 응답 비교 테스트
```typescript
// tests/api-migration.test.ts
describe('API Migration Validation', () => {
  it('should return same response from both APIs', async () => {
    // Next.js API
    const nextjsResponse = await fetch('/api/hospital/123/info');
    const nextjsData = await nextjsResponse.json();

    // AWS Lambda API
    const awsResponse = await fetch(
      'https://api.your-domain.com/hospital/123/info'
    );
    const awsData = await awsResponse.json();

    expect(awsData).toEqual(nextjsData);
  });
});
```

#### 5.2 로드 테스트
```bash
# Artillery 사용
artillery quick --count 100 --num 10 \
  https://api.your-domain.com/hospital/123/info
```

### Phase 6: 모니터링 설정

#### 6.1 CloudWatch 대시보드
```typescript
// AWS CloudWatch 메트릭
- Lambda 실행 시간
- API Gateway 요청 수
- 에러율
- Database 쿼리 시간
```

#### 6.2 알람 설정
```bash
# CloudWatch Alarm 생성
aws cloudwatch put-metric-alarm \
  --alarm-name high-error-rate \
  --alarm-description "API error rate > 5%" \
  --metric-name Errors \
  --threshold 5 \
  --comparison-operator GreaterThanThreshold
```

---

## 환경 변수 설정

### Next.js (.env.local)
```bash
# === API 설정 ===
# 로컬 개발: 빈 문자열 (Next.js API Routes 사용)
# AWS 마이그레이션 후: AWS API Gateway URL
NEXT_PUBLIC_API_BASE_URL=

# === Supabase 설정 ===
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# === Feature Flags ===
NEXT_PUBLIC_USE_AWS_API=false
```

### AWS Lambda 환경 변수
```bash
# Lambda 함수 환경 변수
DATABASE_URL=postgresql://user:password@rds-instance.amazonaws.com:5432/db
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-key
JWT_SECRET=your-jwt-secret
```

---

## 테스트 전략

### 1. Unit Tests
```typescript
// API 서비스 유닛 테스트
describe('hospitalApi', () => {
  it('should call correct endpoint', async () => {
    const mockFetch = jest.spyOn(global, 'fetch');
    await hospitalApi.getHospitalInfo('123');

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/hospital/123/info'),
      expect.any(Object)
    );
  });
});
```

### 2. Integration Tests
```typescript
// Lambda 함수 통합 테스트
describe('Hospital Lambda', () => {
  it('should return hospital data', async () => {
    const event = createMockAPIGatewayEvent({
      httpMethod: 'GET',
      path: '/hospital/123/info',
    });

    const result = await handler(event);
    expect(result.statusCode).toBe(200);
    expect(JSON.parse(result.body)).toHaveProperty('data');
  });
});
```

### 3. E2E Tests
```typescript
// Playwright E2E 테스트
test('should load hospital page', async ({ page }) => {
  await page.goto('/hospital/123');
  await expect(page.locator('h1')).toContainText('Hospital Name');
});
```

---

## 비용 추정

### AWS Lambda + API Gateway
```
월 100만 요청 기준:

API Gateway:
- 100만 요청 × $3.50/백만 = $3.50

Lambda:
- 100만 요청 × $0.20/백만 = $0.20
- 평균 100ms 실행, 512MB 메모리
- 100만 × 0.1초 × $0.0000166667 = $1.67

CloudWatch Logs:
- 약 $0.50

총 예상 비용: 약 $6/월
```

---

## 롤백 계획

마이그레이션 중 문제 발생 시:

1. **즉시 롤백**
   ```bash
   # 환경 변수를 원래대로 변경
   NEXT_PUBLIC_API_BASE_URL=
   ```

2. **점진적 롤백**
   ```typescript
   // Feature flag 비활성화
   NEXT_PUBLIC_USE_AWS_API=false
   ```

3. **DNS 레벨 롤백**
   ```bash
   # Route53에서 기존 엔드포인트로 변경
   ```

---

## 체크리스트

### 마이그레이션 전
- [ ] 모든 API 엔드포인트 문서화
- [ ] 현재 API 응답 스냅샷 저장
- [ ] 로드 테스트 기준선 측정
- [ ] 모니터링 대시보드 준비

### 마이그레이션 중
- [ ] Lambda 함수 배포
- [ ] API Gateway 설정
- [ ] 환경 변수 업데이트
- [ ] Feature flag로 점진적 전환
- [ ] 각 엔드포인트 검증

### 마이그레이션 후
- [ ] 모든 엔드포인트 테스트
- [ ] 성능 비교
- [ ] 에러율 모니터링
- [ ] 비용 추적
- [ ] Next.js API Routes 제거 (선택)

---

## 참고 자료

- [AWS API Gateway 문서](https://docs.aws.amazon.com/apigateway/)
- [AWS Lambda 문서](https://docs.aws.amazon.com/lambda/)
- [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)

---

## 문의

마이그레이션 관련 문의사항은 개발팀에 연락하세요.
