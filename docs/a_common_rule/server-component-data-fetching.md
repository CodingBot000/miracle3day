# 서버 컴포넌트 데이터 페칭 규칙

## 문제 현상
- 로컬 개발 환경: 정상 동작
- Vercel 프로덕션 배포 후: 특정 페이지에서 `Error: Forbidden` 발생
- 클라이언트 컴포넌트에서 동일한 API 호출은 정상 동작

## 근본 원인

**Next.js 서버 컴포넌트에서 자신의 API를 HTTP로 호출할 때 Vercel/Cloudflare에서 차단됨**

```typescript
// ❌ 문제가 되는 패턴 (서버 컴포넌트에서 HTTP API 호출)
const HospitalDetailPage = async ({ params }: Props) => {
  const data = await getHospitalMainAPI(params.id);
  // 내부적으로 fetch('https://www.mimotok.com/api/hospital/...') 호출
  // → Vercel/Cloudflare 보안 정책에 의해 차단됨
};
```

### 왜 이런 일이 발생하는가?

1. **서버 컴포넌트**는 Vercel 서버에서 실행됨
2. 서버에서 같은 도메인의 API를 HTTP로 호출하면 **서버→서버** 요청이 됨
3. Vercel/Cloudflare는 이런 요청을 잠재적 보안 위협으로 간주하여 차단
4. **클라이언트 컴포넌트**는 브라우저에서 실행되므로 **브라우저→서버** 요청이 되어 정상 동작

## 해결 방법

**서버 컴포넌트에서는 HTTP API 호출 대신 직접 DB 쿼리 사용**

```typescript
// ✅ 올바른 패턴 (직접 DB 쿼리)
import { q, one } from "@/lib/db";

async function getHospitalMainDirect(id_uuid: string) {
  const hospital = await one(hospitalSql, [id_uuid]);
  const [details, businessHours] = await Promise.all([
    one(detailSql, [id_uuid]),
    q(businessSql, [id_uuid]),
  ]);
  return { hospital, details, businessHours };
}

const HospitalDetailPage = async ({ params }: Props) => {
  const data = await getHospitalMainDirect(params.id);
  return <HospitalDetail data={data} />;
};
```

## 데이터 페칭 가이드라인

| 컴포넌트 타입 | 데이터 가져오기 방법 | 이유 |
|-------------|-------------------|------|
| 서버 컴포넌트 | 직접 DB 쿼리 (`q()`, `one()`) | HTTP 호출 차단 방지 |
| 클라이언트 컴포넌트 | HTTP API 호출 (fetch) | 브라우저에서 실행되므로 정상 동작 |

## 실제 수정 사례

### 수정 전 (hospital/[id]/page.tsx)
```typescript
import { getHospitalMainAPI } from "@/app/api/hospital/[id]/main";

const HospitalDetailPage = async ({ params }: Props) => {
  const data = await getHospitalMainAPI(params.id);
  // ...
};
```

### 수정 후
```typescript
import { q, one } from "@/lib/db";

async function getHospitalMainDirect(id_uuid: string) {
  const hospital = await one(hospitalSql, [id_uuid]);
  // ...직접 쿼리
}

const HospitalDetailPage = async ({ params }: Props) => {
  const data = await getHospitalMainDirect(params.id);
  // ...
};
```

## 수정된 파일 목록
- `src/app/[locale]/(site)/hospital/page.tsx` - 병원 목록
- `src/app/[locale]/(site)/hospital/[id]/page.tsx` - 병원 상세

## 참고사항

- `@/lib/db`의 `q()` 함수: 여러 행 반환 (SELECT 쿼리)
- `@/lib/db`의 `one()` 함수: 단일 행 반환 (LIMIT 1 쿼리)
- 서버 컴포넌트에서 `export const dynamic = "force-dynamic"` 설정 필요
