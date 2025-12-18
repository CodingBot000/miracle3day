# AWS S3 이미지 업로드 프로세스 가이드

## 목차
1. [개요](#개요)
2. [아키텍처](#아키텍처)
3. [핵심 파일 구조](#핵심-파일-구조)
4. [업로드 프로세스](#업로드-프로세스)
5. [읽기 프로세스](#읽기-프로세스)
6. [AWS 설정](#aws-설정)
7. [주의사항 및 베스트 프랙티스](#주의사항-및-베스트-프랙티스)
8. [트러블슈팅](#트러블슈팅)

---

## 개요

이 프로젝트는 **AWS Lightsail Object Storage (S3 호환)**를 사용하여 이미지를 업로드하고 관리합니다.
Presigned URL 방식을 사용하여 클라이언트가 직접 S3에 업로드하므로, 서버 부하를 줄이고 보안성을 높입니다.

### 주요 특징
- ✅ **Presigned URL 방식**: 서버 부하 최소화
- ✅ **직접 업로드**: 클라이언트 → S3 (서버 경유 없음)
- ✅ **보안**: 60초 유효 시간 제한
- ✅ **프록시 읽기**: `/api/storage/read`를 통한 안전한 이미지 접근

---

## 아키텍처

```
┌─────────────┐
│  클라이언트   │
│  (Browser)  │
└──────┬──────┘
       │
       │ 1. POST /api/storage/s3/sign-upload
       │    { bucket, key, contentType }
       ↓
┌─────────────┐
│ Next.js API │ ← 환경변수 (ACCESS_KEY, SECRET_KEY)
└──────┬──────┘
       │
       │ 2. AWS SDK로 Presigned URL 생성
       │    getSignedUrl(PutObjectCommand)
       ↓
┌─────────────┐
│     S3      │
│  (Lightsail)│
└──────┬──────┘
       │
       │ 3. Presigned URL 반환
       ↓
┌─────────────┐
│  클라이언트   │
└──────┬──────┘
       │
       │ 4. PUT 요청으로 직접 업로드
       │    (Content-Type 헤더 포함)
       ↓
┌─────────────┐
│     S3      │ ← 업로드 완료
└─────────────┘
```

### 읽기 프로세스
```
┌─────────────┐
│  클라이언트   │
└──────┬──────┘
       │
       │ 1. GET /api/storage/read?key=xxx
       ↓
┌─────────────┐
│ Next.js API │
└──────┬──────┘
       │
       │ 2. GetObjectCommand로 Presigned URL 생성
       ↓
┌─────────────┐
│     S3      │
└──────┬──────┘
       │
       │ 3. Presigned URL 반환 (120초 유효)
       ↓
┌─────────────┐
│  클라이언트   │ ← 이미지 표시
└─────────────┘
```

---

## 핵심 파일 구조

### 1. **S3 클라이언트 설정**
**파일**: `src/lib/s3.ts`

```typescript
import { S3Client } from "@aws-sdk/client-s3";

export const s3 = new S3Client({
  region: process.env.LIGHTSAIL_REGION,
  endpoint: process.env.LIGHTSAIL_ENDPOINT!,
  credentials: {
    accessKeyId: process.env.LIGHTSAIL_ACCESS_KEY!,
    secretAccessKey: process.env.LIGHTSAIL_SECRET_KEY!,
  },
});
```

**환경 변수**:
```env
LIGHTSAIL_REGION=us-west-2
LIGHTSAIL_ENDPOINT=https://s3.us-west-2.amazonaws.com
LIGHTSAIL_ACCESS_KEY=AKIATPWEZH5IRTGEZVG5
LIGHTSAIL_SECRET_KEY=********
LIGHTSAIL_BUCKET_NAME=beauty-bucket-public
```

---

### 2. **클라이언트 헬퍼 함수**
**파일**: `src/lib/images.ts`

#### `fetchPresignedUrl(key: string): Promise<string>`
S3 키로부터 Presigned URL을 가져옵니다.

**특징**:
- 이미 완전한 URL이면 그대로 반환
- 로컬 public 경로(`/`로 시작)는 바로 반환
- 나머지만 `/api/storage/read`를 호출하여 presigned URL 요청

```typescript
// 사용 예시
const imageUrl = await fetchPresignedUrl('consultation_photos/xxx/raw/image.jpg');
// → https://beauty-bucket-public.s3.us-west-2.amazonaws.com/...?X-Amz-...
```

#### `getImageUrl(input: string, options?): string`
S3 URL 또는 키를 프록시 URL로 변환합니다.

```typescript
// 사용 예시
const proxyUrl = getImageUrl('consultation_photos/xxx/raw/image.jpg');
// → /api/storage/read?key=consultation_photos%2Fxxx%2Fraw%2Fimage.jpg
```

---

### 3. **Presigned URL 생성 API**
**파일**: `src/app/api/storage/s3/sign-upload/route.ts`

#### Request
```typescript
POST /api/storage/s3/sign-upload
Content-Type: application/json

{
  "bucket": "consultation_photos",
  "key": "submissionId/raw/filename.jpg",
  "contentType": "image/jpeg",
  "upsert": false  // true: 덮어쓰기 허용, false: 중복 체크
}
```

#### Response
```json
{
  "url": "https://beauty-bucket-public.s3.us-west-2.amazonaws.com/consultation_photos/xxx/raw/filename.jpg?X-Amz-Algorithm=AWS4-HMAC-SHA256&..."
}
```

#### 주요 로직
1. **버킷과 키 정규화**: 슬래시 제거 및 정리
2. **중복 체크**: `upsert: false`일 때 `HeadObjectCommand`로 파일 존재 확인
3. **Presigned URL 생성**: `PutObjectCommand` + `getSignedUrl` (60초 유효)
4. **에러 처리**: 409 (파일 존재), 500 (서버 에러)

**코드 위치**: `src/app/api/storage/s3/sign-upload/route.ts:17-59`

---

### 4. **이미지 읽기 프록시 API**
**파일**: `src/app/api/storage/read/route.ts`

#### Request
```
GET /api/storage/read?key=consultation_photos/xxx/raw/filename.jpg
```

#### Response
```json
{
  "url": "https://beauty-bucket-public.s3.us-west-2.amazonaws.com/consultation_photos/xxx/raw/filename.jpg?X-Amz-Algorithm=AWS4-HMAC-SHA256&..."
}
```

#### 특징
- Presigned URL 유효 시간: **120초**
- 캐시 정책: `force-dynamic`, `default-no-store`
- 에러 처리: 400 (키 없음), 500 (읽기 실패)

**코드 위치**: `src/app/api/storage/read/route.ts:36-59`

---

### 5. **실제 업로드 구현 예시**
**파일**: `src/app/[locale]/(consult)/pre_consultation_intake_form/PreConsultationSurveyFlow/questionnaire/PreviewReport.tsx`

#### 전체 플로우 (74-126번 줄)

```typescript
// 1. UUID 생성
const submissionId = crypto.randomUUID();

// 2. 파일명 안전화 (한글/특수문자 제거)
const safeFileName = originalFileName
  .replace(/[^a-zA-Z0-9.-]/g, '_')  // 영문, 숫자, 점, 하이픈만 허용
  .replace(/_{2,}/g, '_');           // 연속 언더스코어 제거

// 3. S3 경로 구성
const imagePath = `${submissionId}/raw/${safeFileName}`;
const bucket = 'consultation_photos';

// 4. Presigned URL 요청
const signResponse = await fetch('/api/storage/s3/sign-upload', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    bucket: bucket,
    key: imagePath,
    contentType: file.type,
    upsert: false
  })
});

const { url: signedUrl } = await signResponse.json();

// 5. S3에 직접 업로드
const uploadResponse = await fetch(signedUrl, {
  method: 'PUT',
  headers: {
    'Content-Type': file.type,
  },
  body: file
});

// 6. DB에 저장할 경로
const dbPath = `${bucket}/${imagePath}`;
// → consultation_photos/submissionId/raw/filename.jpg
```

**코드 위치**: `PreviewReport.tsx:74-126`

---

## 업로드 프로세스

### Step-by-Step

#### Step 1: 클라이언트에서 Presigned URL 요청
```typescript
const response = await fetch('/api/storage/s3/sign-upload', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    bucket: 'consultation_photos',
    key: 'uuid/raw/image.jpg',
    contentType: 'image/jpeg',
    upsert: false
  })
});

const { url } = await response.json();
```

#### Step 2: Presigned URL로 직접 업로드
```typescript
const uploadResponse = await fetch(url, {
  method: 'PUT',
  headers: {
    'Content-Type': 'image/jpeg',  // 필수!
  },
  body: imageFile
});

if (!uploadResponse.ok) {
  throw new Error('Upload failed');
}
```

#### Step 3: DB에 경로 저장
```typescript
const dbPath = `consultation_photos/uuid/raw/image.jpg`;
await saveToDatabase({ imagePath: dbPath });
```

---

## 읽기 프로세스

### 방법 1: `fetchPresignedUrl` 사용 (권장)
```typescript
import { fetchPresignedUrl } from '@/lib/images';

const imageUrl = await fetchPresignedUrl('consultation_photos/uuid/raw/image.jpg');
// → Presigned URL 반환 (120초 유효)

<img src={imageUrl} alt="Image" />
```

### 방법 2: `getImageUrl` 사용 (프록시)
```typescript
import { getImageUrl } from '@/lib/images';

const proxyUrl = getImageUrl('consultation_photos/uuid/raw/image.jpg');
// → /api/storage/read?key=...

<img src={proxyUrl} alt="Image" />
```

### 방법 3: 직접 API 호출
```typescript
const response = await fetch(`/api/storage/read?key=${encodeURIComponent(key)}`);
const { url } = await response.json();
```

---

## AWS 설정

### 1. 환경 변수 설정

#### `.env.local` (개발)
```env
LIGHTSAIL_REGION=us-west-2
LIGHTSAIL_ENDPOINT=https://s3.us-west-2.amazonaws.com
LIGHTSAIL_ACCESS_KEY=AKIATPWEZH5IRTGEZVG5
LIGHTSAIL_SECRET_KEY=your-secret-key
LIGHTSAIL_BUCKET_NAME=beauty-bucket-public
```

#### Vercel (프로덕션)
Environment Variables 섹션에서 동일하게 설정

---

### 2. S3 버킷 CORS 설정 ⚠️ 중요!

**AWS Console** → **S3** → **beauty-bucket-public** → **Permissions** → **CORS**

```json
[
    {
        "AllowedHeaders": [
            "*"
        ],
        "AllowedMethods": [
            "GET",
            "PUT",
            "POST",
            "DELETE",
            "HEAD"
        ],
        "AllowedOrigins": [
            "http://localhost:3000",
            "https://www.mimotok.com",
            "https://mimotok.com"
        ],
        "ExposeHeaders": [
            "ETag",
            "x-amz-server-side-encryption",
            "x-amz-request-id",
            "x-amz-id-2"
        ],
        "MaxAgeSeconds": 3000
    }
]
```

#### CORS 설정 필수 항목:
- ✅ `AllowedMethods`: `PUT` 포함 (업로드용)
- ✅ `AllowedOrigins`: **배포 도메인 추가 필수** (www 버전, non-www 버전 모두)
- ✅ `AllowedHeaders`: `*` (Content-Type 등 허용)
- ✅ `ExposeHeaders`: `ETag` 포함 (업로드 검증용)

#### 주의사항:
- localhost:3000만 허용하면 **프로덕션에서 CORS 에러 발생**
- 새 도메인 추가 시 반드시 CORS 설정 업데이트
- 설정 저장 후 1-2분 뒤 적용됨

---

### 3. IAM 권한 설정

#### 필수 권한:
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:HeadObject",
        "s3:DeleteObject"
      ],
      "Resource": "arn:aws:s3:::beauty-bucket-public/*"
    }
  ]
}
```

#### 권한 설명:
- `s3:PutObject`: 파일 업로드
- `s3:GetObject`: 파일 읽기
- `s3:HeadObject`: 파일 존재 확인 (중복 체크용)
- `s3:DeleteObject`: 파일 삭제 (선택)

---

## 주의사항 및 베스트 프랙티스

### 1. 파일명 안전화 ⚠️ 필수
한글, 특수문자, 공백은 S3 업로드 시 문제를 일으킬 수 있습니다.

```typescript
// ❌ 잘못된 예시
const fileName = "안녕하세요 사진.jpg";

// ✅ 올바른 예시
const safeFileName = fileName
  .replace(/[^a-zA-Z0-9.-]/g, '_')  // 영문, 숫자, 점, 하이픈만 허용
  .replace(/_{2,}/g, '_');           // 연속 언더스코어 제거
// → "___.jpg"
```

**코드 위치**: `PreviewReport.tsx:82-84`

---

### 2. Presigned URL 유효 시간
- **업로드**: 60초 (`expiresIn: 60`)
- **읽기**: 120초 (`expiresIn: 120`)

⚠️ **주의**: URL 생성 후 60초 이내에 업로드를 완료해야 합니다.

---

### 3. Content-Type 설정 필수
S3 업로드 시 `Content-Type` 헤더를 반드시 설정해야 합니다.

```typescript
// ✅ 올바른 예시
await fetch(signedUrl, {
  method: 'PUT',
  headers: {
    'Content-Type': 'image/jpeg',  // 필수!
  },
  body: file
});
```

미설정 시 S3에서 `application/octet-stream`으로 저장되어 브라우저에서 다운로드됨.

---

### 4. 파일 경로 구조

#### 권장 경로 패턴:
```
bucket/submissionId/type/filename
```

#### 예시:
```
consultation_photos/
├── uuid-1/
│   ├── raw/
│   │   └── image.jpg      (원본)
│   └── processed/
│       └── image_thumb.jpg (썸네일)
└── uuid-2/
    └── raw/
        └── screenshot.png
```

#### DB 저장 경로:
```typescript
// DB에는 전체 경로 저장
const dbPath = `consultation_photos/uuid/raw/image.jpg`;
```

---

### 5. 중복 파일 처리

#### `upsert: false` (기본값, 권장)
- 파일이 이미 존재하면 **409 Conflict** 에러 반환
- 중복 업로드 방지

```typescript
{
  upsert: false  // 중복 체크 활성화
}
```

#### `upsert: true`
- 기존 파일 덮어쓰기 허용
- 업데이트 시나리오에 사용

---

### 6. 에러 처리

```typescript
try {
  // Presigned URL 요청
  const signResponse = await fetch('/api/storage/s3/sign-upload', {
    method: 'POST',
    body: JSON.stringify({ bucket, key, contentType })
  });

  if (!signResponse.ok) {
    const error = await signResponse.json();
    if (signResponse.status === 409) {
      console.error('File already exists');
    }
    throw new Error('Failed to get upload URL');
  }

  const { url } = await signResponse.json();

  // S3 업로드
  const uploadResponse = await fetch(url, {
    method: 'PUT',
    headers: { 'Content-Type': contentType },
    body: file
  });

  if (!uploadResponse.ok) {
    throw new Error('Upload failed');
  }

} catch (error) {
  console.error('Upload error:', error);
  // 사용자에게 에러 메시지 표시
}
```

---

### 7. 보안 고려사항

#### ✅ DO:
- 서버에서만 Presigned URL 생성
- 환경 변수로 AWS 자격 증명 관리
- CORS 설정으로 허용된 도메인만 업로드 가능
- 짧은 유효 시간 설정 (60-120초)

#### ❌ DON'T:
- 클라이언트에 AWS 자격 증명 노출하지 않기
- Presigned URL을 장기간 재사용하지 않기
- Public 버킷 권한 설정하지 않기 (Presigned URL로만 접근)

---

## 트러블슈팅

### 1. CORS 에러 발생

#### 증상:
```
Access to fetch at 'https://beauty-bucket-public.s3.us-west-2.amazonaws.com/...'
from origin 'https://www.mimotok.com' has been blocked by CORS policy
```

#### 해결:
1. AWS Console → S3 → Permissions → CORS
2. `AllowedOrigins`에 도메인 추가:
   ```json
   "AllowedOrigins": [
     "https://www.mimotok.com",
     "https://mimotok.com"
   ]
   ```
3. 저장 후 1-2분 대기

**참고**: [AWS 설정 - CORS 설정](#2-s3-버킷-cors-설정-⚠️-중요)

---

### 2. 업로드 실패 (403 Forbidden)

#### 가능한 원인:
1. **Presigned URL 만료**: 60초 초과
2. **Content-Type 불일치**: 요청과 서명 시 타입이 다름
3. **IAM 권한 부족**: `s3:PutObject` 권한 없음

#### 해결:
```typescript
// Content-Type 일치 확인
const contentType = file.type;

// Sign 요청
body: JSON.stringify({ contentType })

// Upload 요청
headers: { 'Content-Type': contentType }  // 동일한 값 사용
```

---

### 3. 이미지가 다운로드됨 (표시 안됨)

#### 원인:
S3에 `Content-Type: application/octet-stream`으로 저장됨

#### 해결:
업로드 시 정확한 Content-Type 설정:
```typescript
headers: {
  'Content-Type': 'image/jpeg'  // 또는 'image/png', 'image/webp'
}
```

---

### 4. 한글 파일명 에러

#### 증상:
파일명에 한글이 포함된 경우 업로드 실패 또는 깨짐

#### 해결:
파일명 안전화:
```typescript
const safeFileName = fileName
  .replace(/[^a-zA-Z0-9.-]/g, '_')
  .replace(/_{2,}/g, '_');
```

**코드 위치**: `PreviewReport.tsx:82-84`

---

### 5. 409 Conflict (파일 이미 존재)

#### 증상:
```json
{ "error": "object exists" }
```

#### 해결 방법 1: 고유한 파일명 생성
```typescript
const uniqueFileName = `${Date.now()}_${fileName}`;
// 또는
const uniqueFileName = `${crypto.randomUUID()}_${fileName}`;
```

#### 해결 방법 2: upsert 사용
```typescript
{
  upsert: true  // 덮어쓰기 허용
}
```

---

### 6. 로컬에서는 되는데 프로덕션에서 안됨

#### 체크리스트:
- [ ] 환경 변수 설정 확인 (Vercel)
- [ ] CORS 설정에 프로덕션 도메인 추가
- [ ] IAM 권한 확인
- [ ] 버킷 이름 확인 (`LIGHTSAIL_BUCKET_NAME`)

---

## 참고 자료

### 관련 파일
- `src/lib/s3.ts`: S3 클라이언트 설정
- `src/lib/images.ts`: 클라이언트 헬퍼 함수
- `src/app/api/storage/s3/sign-upload/route.ts`: Presigned URL 생성 API
- `src/app/api/storage/read/route.ts`: 이미지 읽기 프록시 API
- `src/app/[locale]/(consult)/pre_consultation_intake_form/PreConsultationSurveyFlow/questionnaire/PreviewReport.tsx`: 실제 업로드 구현

### AWS 문서
- [AWS S3 Presigned URLs](https://docs.aws.amazon.com/AmazonS3/latest/userguide/PresignedUrlUploadObject.html)
- [AWS Lightsail Object Storage](https://lightsail.aws.amazon.com/ls/docs/en_us/articles/buckets-in-amazon-lightsail)
- [CORS Configuration](https://docs.aws.amazon.com/AmazonS3/latest/userguide/cors.html)

---

## 업데이트 이력

- **2024-12-18**: 최초 작성
  - 전체 업로드/읽기 프로세스 문서화
  - AWS 설정 및 CORS 가이드 추가
  - 트러블슈팅 섹션 추가
