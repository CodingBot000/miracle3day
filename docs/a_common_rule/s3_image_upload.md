# S3 이미지 업로드 가이드

## 개요

AWS Lightsail Object Storage (S3 호환)를 사용한 이미지 업로드 시스템 구현 가이드입니다.

---

## 환경변수 설정

### 필수 환경변수

```env
# S3 Client용 (버킷명 없음)
LIGHTSAIL_ENDPOINT=https://s3.us-west-2.amazonaws.com

# S3 버킷 정보
LIGHTSAIL_BUCKET_NAME=beauty-bucket-public
LIGHTSAIL_REGION=us-west-2

# 인증 정보
LIGHTSAIL_ACCESS_KEY=your-access-key
LIGHTSAIL_SECRET_KEY=your-secret-key
```

### 주의사항: LIGHTSAIL_ENDPOINT vs NEXT_PUBLIC_LIGHTSAIL_ENDPOINT

| 환경변수 | 용도 | 값 예시 |
|---------|------|--------|
| `LIGHTSAIL_ENDPOINT` | S3 Client endpoint | `https://s3.us-west-2.amazonaws.com` |
| `NEXT_PUBLIC_LIGHTSAIL_ENDPOINT` | 클라이언트 공개 URL (선택) | `https://beauty-bucket-public.s3.us-west-2.amazonaws.com` |

**중요**:
- `LIGHTSAIL_ENDPOINT`는 S3 SDK의 endpoint로 사용되며, 버킷명을 포함하면 안 됩니다.
- `NEXT_PUBLIC_` 접두사가 붙은 환경변수는 **클라이언트 사이드에서만** 자동 노출됩니다.
- **서버 사이드 API 라우트에서는 `NEXT_PUBLIC_` 환경변수가 자동으로 사용 불가**합니다.

---

## 공개 URL 생성 방식

### 올바른 방식 (서버 사이드)

```typescript
// src/app/api/auth/member/avatar/route.ts
const bucket = process.env.LIGHTSAIL_BUCKET_NAME || "";
const region = process.env.LIGHTSAIL_REGION || "us-west-2";
const key = path.replace(/^\/+/, "");

// 버킷명을 포함한 올바른 S3 공개 URL 생성
const publicUrl = bucket
  ? `https://${bucket}.s3.${region}.amazonaws.com/${key}`
  : `/${key}`;
```

### 생성되는 URL 형식

```
https://{BUCKET_NAME}.s3.{REGION}.amazonaws.com/{key}

예시:
https://beauty-bucket-public.s3.us-west-2.amazonaws.com/member/uuid/profile_uuid.png
```

### 잘못된 방식 (피해야 함)

```typescript
// LIGHTSAIL_ENDPOINT를 공개 URL에 직접 사용하면 안 됨
const base = process.env.LIGHTSAIL_ENDPOINT; // https://s3.us-west-2.amazonaws.com
const publicUrl = `${base}/${key}`;
// 결과: https://s3.us-west-2.amazonaws.com/member/... (버킷명 누락!)
```

---

## S3 Client 설정

```typescript
// src/lib/s3.ts
import { S3Client } from "@aws-sdk/client-s3";

export const s3 = new S3Client({
  region: process.env.LIGHTSAIL_REGION,
  endpoint: process.env.LIGHTSAIL_ENDPOINT!, // 버킷명 없이
  credentials: {
    accessKeyId: process.env.LIGHTSAIL_ACCESS_KEY!,
    secretAccessKey: process.env.LIGHTSAIL_SECRET_KEY!,
  },
});
```

---

## Presigned URL 업로드 흐름

### 1. 클라이언트에서 서명된 URL 요청

```typescript
// src/services/profileImage.ts
const signRes = await fetch(`${API_BASE}/api/storage/s3/sign-upload`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    bucket: STORAGE_MEMBER,  // "member"
    key: filePath,           // "uuid/profile_uuid.png"
    contentType: file.type,
    upsert: true,
  }),
});

const { url } = await signRes.json();
```

### 2. 서버에서 Presigned URL 생성

```typescript
// src/app/api/storage/s3/sign-upload/route.ts
const BUCKET = process.env.LIGHTSAIL_BUCKET_NAME;
const objectKey = `${bucket}/${key}`.replace(/\/+/g, '/');
// 결과: "member/uuid/profile_uuid.png"

const command = new PutObjectCommand({
  Bucket: BUCKET,
  Key: objectKey,
  ContentType: body.contentType,
});

const signedUrl = await getSignedUrl(s3, command, { expiresIn: 60 });
```

### 3. 클라이언트에서 S3에 직접 업로드

```typescript
const putRes = await fetch(url, {
  method: 'PUT',
  headers: { 'Content-Type': file.type },
  body: file,
});
```

### 4. DB에 URL 저장

```typescript
// src/app/api/auth/member/avatar/route.ts (PATCH)
const publicUrl = `https://${bucket}.s3.${region}.amazonaws.com/${key}`;

await q(
  `UPDATE ${TABLE_MEMBERS} SET avatar = $1 WHERE id_uuid::text = $2`,
  [publicUrl, targetUuid]
);
```

---

## CORS 설정

S3 버킷에 CORS 설정이 필요합니다. AWS 콘솔에서 설정:

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],
    "AllowedOrigins": ["http://localhost:3000", "https://yourdomain.com"],
    "ExposeHeaders": ["ETag"]
  }
]
```

---

## 파일 경로 구조

```
{BUCKET_NAME}/
├── member/
│   └── {user_uuid}/
│       └── profile_{user_uuid}.{ext}
└── uploads/
    └── {year}/{month}/{day}/
        └── {random}_{filename}
```

---

## 트러블슈팅

### 1. CORS 에러

**증상**: `Access to fetch at ... has been blocked by CORS policy`

**해결**:
- S3 버킷 CORS 설정 확인
- `AllowedOrigins`에 프론트엔드 도메인 추가

### 2. 이미지 URL이 잘못된 형식으로 저장됨

**증상**: DB에 `https://s3.us-west-2.amazonaws.com/member/...` 형태로 저장 (버킷명 누락)

**원인**: `LIGHTSAIL_ENDPOINT`를 공개 URL 생성에 직접 사용

**해결**: `LIGHTSAIL_BUCKET_NAME`과 `LIGHTSAIL_REGION`을 사용하여 URL 직접 조합

```typescript
const publicUrl = `https://${bucket}.s3.${region}.amazonaws.com/${key}`;
```

### 3. 서버에서 NEXT_PUBLIC_ 환경변수 접근 불가

**증상**: 서버 사이드에서 `process.env.NEXT_PUBLIC_LIGHTSAIL_ENDPOINT`가 undefined

**원인**: Next.js에서 `NEXT_PUBLIC_` 환경변수는 빌드 타임에 클라이언트 번들에만 인라인됨

**해결**: 서버 사이드에서는 `LIGHTSAIL_BUCKET_NAME`, `LIGHTSAIL_REGION`을 사용하여 URL 직접 생성

---

## 관련 파일

| 파일 | 역할 |
|-----|------|
| `src/lib/s3.ts` | S3 Client 초기화 |
| `src/services/profileImage.ts` | 프로필 이미지 업로드 서비스 |
| `src/app/api/storage/s3/sign-upload/route.ts` | Presigned URL 생성 API |
| `src/app/api/auth/member/avatar/route.ts` | 아바타 GET/PATCH API |
| `src/constants/tables.ts` | `STORAGE_MEMBER` 상수 정의 |

---

## 요약

1. **S3 Client endpoint**: `LIGHTSAIL_ENDPOINT` (버킷명 없음)
2. **공개 URL 생성**: `https://{BUCKET_NAME}.s3.{REGION}.amazonaws.com/{key}` 형식으로 직접 조합
3. **서버 사이드에서 `NEXT_PUBLIC_` 환경변수 사용 불가** - 별도 환경변수 사용
4. **CORS 설정 필수**: S3 버킷에 프론트엔드 도메인 허용
