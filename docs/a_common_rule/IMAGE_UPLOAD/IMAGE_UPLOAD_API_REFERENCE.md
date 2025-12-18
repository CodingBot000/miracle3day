# 이미지 업로드 API 레퍼런스

> **통일된 이미지 업로드 시스템 API 문서**
>
> 마지막 업데이트: 2025-12-18

---

## 📋 목차

1. [개요](#개요)
2. [API 엔드포인트](#api-엔드포인트)
3. [클라이언트 유틸리티](#클라이언트-유틸리티)
4. [압축 설정](#압축-설정)
5. [에러 코드](#에러-코드)

---

## 개요

### 아키텍처

```
클라이언트 → 압축 (imageCompression.ts)
          → Presigned URL 요청 (/api/storage/s3/sign-upload)
          → S3 직접 업로드 (PUT)
          → DB 저장
```

### 지원 기능

- ✅ 자동 이미지 압축 (6가지 타입)
- ✅ Presigned URL 방식 (보안)
- ✅ 자동 재시도 (exponential backoff)
- ✅ 진행률 추적
- ✅ 파일명 안전화 (한글/특수문자 제거)
- ✅ 병렬 업로드 (동시성 제한)

---

## API 엔드포인트

### 1. Presigned URL 생성

**엔드포인트:** `POST /api/storage/s3/sign-upload`

클라이언트가 S3에 직접 업로드하기 위한 서명된 URL을 생성합니다.

#### Request

```typescript
POST /api/storage/s3/sign-upload
Content-Type: application/json

{
  "bucket": "consultation_photos",    // S3 버킷 이름
  "key": "2024/12/18/image.jpg",      // S3 키 (파일 경로)
  "contentType": "image/jpeg",        // MIME 타입
  "upsert": false                     // 덮어쓰기 허용 여부 (선택)
}
```

#### Response (Success)

```typescript
200 OK
Content-Type: application/json

{
  "url": "https://beauty-bucket-public.s3.us-west-2.amazonaws.com/...?X-Amz-Algorithm=..."
}
```

- `url`: S3 PUT 요청에 사용할 presigned URL (60초 유효)

#### Response (Error)

```typescript
// 파일이 이미 존재하고 upsert=false인 경우
409 Conflict
{
  "error": "object exists"
}

// 필수 파라미터 누락
400 Bad Request
{
  "error": "bucket and key required"
}

// 서버 오류
500 Internal Server Error
{
  "error": "sign failed"
}
```

#### Example

```typescript
const response = await fetch('/api/storage/s3/sign-upload', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    bucket: 'consultation_photos',
    key: '2024/12/18/abc123_image.jpg',
    contentType: 'image/jpeg',
    upsert: false,
  })
});

const { url } = await response.json();

// 이제 이 URL로 S3에 직접 업로드
await fetch(url, {
  method: 'PUT',
  body: file,
  headers: { 'Content-Type': 'image/jpeg' }
});
```

---

### 2. 이미지 읽기 (Presigned GET URL)

**엔드포인트:** `GET /api/storage/read`

S3에서 이미지를 읽기 위한 서명된 URL을 생성합니다.

#### Request

```typescript
GET /api/storage/read?key=consultation_photos/2024/12/18/image.jpg
```

#### Response (Success)

```typescript
200 OK
Content-Type: application/json

{
  "url": "https://beauty-bucket-public.s3.us-west-2.amazonaws.com/...?X-Amz-Algorithm=..."
}
```

- `url`: S3 GET 요청에 사용할 presigned URL (120초 유효)

#### Response (Error)

```typescript
// 키 누락
400 Bad Request
{
  "error": "Missing key"
}

// 파일 없음 또는 읽기 실패
500 Internal Server Error
{
  "error": "Read failed",
  "detail": "..."
}
```

#### Example

```typescript
const response = await fetch(`/api/storage/read?key=${encodeURIComponent(s3Key)}`);
const { url } = await response.json();

// 이미지 표시
<img src={url} alt="Uploaded image" />
```

---

### 3. 서버 프록시 업로드 (레거시)

**엔드포인트:** `POST /api/storage/upload`

> ⚠️ **레거시 API**: 새 코드에서는 사용하지 마세요. Presigned URL 방식 사용 권장.

서버를 통해 S3에 업로드합니다. (FormData)

#### Request

```typescript
POST /api/storage/upload
Content-Type: multipart/form-data

FormData {
  file: [File object]
}
```

#### Response (Success)

```typescript
200 OK
Content-Type: application/json

{
  "ok": true,
  "key": "uploads/2024/12/18/abc123_image.jpg",
  "publicUrl": "https://beauty-bucket-public.s3.us-west-2.amazonaws.com/uploads/2024/12/18/abc123_image.jpg"
}
```

#### Response (Error)

```typescript
400 Bad Request
{
  "error": "No file" | "Unsupported contentType"
}

500 Internal Server Error
{
  "ok": false,
  "error": "Upload failed"
}
```

---

## 클라이언트 유틸리티

### imageUploadHelper.ts

통합 이미지 업로드 헬퍼 (압축 + presigned URL + 재시도)

#### 1. uploadImageWithCompression()

단일 이미지 업로드

```typescript
import { uploadImageWithCompression } from '@/lib/imageUploadHelper';

const result = await uploadImageWithCompression(
  file: File,
  options: {
    // 필수
    compressionType: 'profile' | 'review' | 'community_posting' | 'thumbnail' | 'clinic_display' | 'doctor',
    bucket: string,
    folder: string,

    // 선택
    compressionOverride?: Partial<ImageCompressionConfig>,
    upsert?: boolean,
    generateFileName?: (originalName: string, index?: number) => string,

    // 콜백
    onProgress?: (progress: UploadProgress) => void,
    onFileStart?: (file: File, index: number) => void,
    onFileComplete?: (result: SingleUploadResult) => void,
    onFileError?: (file: File, error: Error) => void,
  }
): Promise<SingleUploadResult>
```

**반환값:**
```typescript
{
  originalFile: File,
  compressedFile: File,
  s3Key: string,
  s3Path: string,  // DB 저장용
  publicUrl?: string,
  compressionRatio: number  // 2.5 = 2.5배 압축
}
```

**Example:**
```typescript
const result = await uploadImageWithCompression(file, {
  compressionType: 'review',
  bucket: 'consultation_photos',
  folder: 'user-uploads',
  onProgress: (p) => {
    console.log(`${p.stage}: ${p.progress}%`);
  }
});

console.log('Uploaded to:', result.s3Path);
console.log('Compression ratio:', result.compressionRatio.toFixed(2) + 'x');

// DB 저장
await saveToDatabase({ imagePath: result.s3Path });
```

---

#### 2. uploadMultipleImages()

다중 이미지 병렬 업로드 (동시성 제한)

```typescript
import { uploadMultipleImages } from '@/lib/imageUploadHelper';

const result = await uploadMultipleImages(
  files: File[],
  options: ImageUploadOptions,  // uploadImageWithCompression와 동일
  maxConcurrent: number = 3  // 최대 동시 업로드 수
): Promise<BatchUploadResult>
```

**반환값:**
```typescript
{
  successful: SingleUploadResult[],
  failed: UploadFailure[],
  totalTime: number  // ms
}
```

**Example:**
```typescript
const { successful, failed } = await uploadMultipleImages(
  files,
  {
    compressionType: 'community_posting',
    bucket: 'beauty-bucket-public',
    folder: 'community',
    onProgress: (p) => {
      setProgress(p);
    }
  },
  3  // 최대 3개 동시 업로드
);

if (failed.length > 0) {
  console.error('Failed:', failed);
}

const paths = successful.map(r => r.s3Path);
```

---

### imageCompression.ts

이미지 압축 유틸리티 (browser-image-compression)

#### 1. compressSingleImage()

단일 이미지 압축

```typescript
import { compressSingleImage } from '@/utils/imageCompression';

const { compressedFile, error } = await compressSingleImage(
  file: File,
  type: ImageCompressionType,  // 'profile' | 'review' | ...
  overrideConfig?: Partial<ImageCompressionConfig>
): Promise<{
  compressedFile: File | null;
  error: Error | null;
}>
```

**Example:**
```typescript
const { compressedFile, error } = await compressSingleImage(
  file,
  'review',
  {
    maxSizeMB: 2.0,  // 기본값 오버라이드
  }
);

if (error || !compressedFile) {
  console.error('Compression failed:', error);
  return;
}

console.log('Original:', file.size);
console.log('Compressed:', compressedFile.size);
```

---

#### 2. compressMultipleImages()

다중 이미지 압축

```typescript
import { compressMultipleImages } from '@/utils/imageCompression';

const { results, failed } = await compressMultipleImages(
  files: File[],
  type: ImageCompressionType,
  overrideConfig?: Partial<ImageCompressionConfig>
): Promise<{
  results: Array<{
    originalFile: File;
    compressedFile: File;
    compressionRatio: number;
  }>;
  failed: Array<{
    file: File;
    error: Error;
  }>;
}>
```

**Example:**
```typescript
const { results, failed } = await compressMultipleImages(
  files,
  'clinic_display'
);

console.log(`Success: ${results.length}, Failed: ${failed.length}`);

const compressedFiles = results.map(r => r.compressedFile);
```

---

## 압축 설정

### 타입별 기본 설정

| 타입 | maxSizeMB | maxWidthOrHeight | initialQuality | useWebWorker |
|------|-----------|------------------|----------------|--------------|
| `profile` | 0.2 | 400 | 0.8 | true |
| `review` | 1.0 | 1600 | 0.85 | true |
| `community_posting` | 0.5 | 1200 | 0.75 | true |
| `thumbnail` | 0.1 | 300 | 0.7 | true |
| `clinic_display` | 0.8 | 1920 | 0.8 | true |
| `doctor` | 0.3 | 600 | 0.8 | true |

### 커스텀 설정

기본 설정을 오버라이드할 수 있습니다:

```typescript
const { compressedFile } = await compressSingleImage(
  file,
  'review',
  {
    maxSizeMB: 3.0,  // 더 높은 품질
    maxWidthOrHeight: 2000,
    initialQuality: 0.9,
  }
);
```

---

## 에러 코드

### HTTP 상태 코드

| 코드 | 의미 | 해결 방법 |
|------|------|-----------|
| 200 | 성공 | - |
| 400 | 잘못된 요청 (필수 파라미터 누락) | 요청 파라미터 확인 |
| 409 | 파일이 이미 존재 (upsert=false) | `upsert: true` 사용 또는 다른 파일명 사용 |
| 500 | 서버 오류 | 로그 확인 또는 재시도 |

### 압축 에러

```typescript
try {
  const { compressedFile, error } = await compressSingleImage(file, 'review');

  if (error) {
    if (error.message.includes('not an image')) {
      alert('이미지 파일만 업로드 가능합니다');
    } else if (error.message.includes('too large')) {
      alert('파일이 너무 큽니다 (최대 10MB)');
    } else {
      alert('이미지 처리 실패: ' + error.message);
    }
    return;
  }

  // 성공
} catch (error) {
  console.error('Unexpected error:', error);
}
```

### 업로드 에러

```typescript
try {
  const result = await uploadImageWithCompression(file, options);
  // 성공
} catch (error) {
  if (error.message.includes('Compression failed')) {
    alert('이미지 압축 실패');
  } else if (error.message.includes('presigned URL')) {
    alert('서명 URL 생성 실패');
  } else if (error.message.includes('Upload failed after')) {
    alert('업로드 실패 (재시도 초과)');
  } else if (error.message.includes('File already exists')) {
    alert('파일이 이미 존재합니다');
  } else {
    alert('업로드 실패: ' + error.message);
  }
}
```

---

## UploadProgress 인터페이스

```typescript
interface UploadProgress {
  fileIndex: number;  // 파일 인덱스 (다중 업로드 시)
  fileName: string;   // 파일명
  stage: 'compressing' | 'requesting-url' | 'uploading' | 'complete' | 'error';
  progress: number;   // 0-100
}
```

**Example:**
```typescript
onProgress: (p) => {
  console.log(`[${p.fileIndex}] ${p.fileName}: ${p.stage} ${p.progress}%`);

  switch (p.stage) {
    case 'compressing':
      // 압축 중 (0-30%)
      break;
    case 'requesting-url':
      // URL 요청 중 (30-40%)
      break;
    case 'uploading':
      // 업로드 중 (40-100%)
      break;
    case 'complete':
      // 완료 (100%)
      break;
    case 'error':
      // 에러 (0%)
      break;
  }
}
```

---

## 파일명 Sanitization

`imageUploadHelper.ts`는 자동으로 파일명을 안전화합니다:

### 규칙

1. 영문, 숫자, `.`, `-`, `_`만 허용
2. 한글, 공백, 특수문자 → `_`로 변환
3. 연속된 `_` → 단일 `_`로 변환
4. 앞뒤 `.`, `_`, `-` 제거
5. 빈 이름 → `file`로 대체

### 예제

```typescript
// 입력 → 출력
"안녕하세요 사진.jpg" → "_____.jpg"
"photo 123.png" → "photo_123.png"
"image--test__.gif" → "image-test.gif"
"...file" → "file"
```

### 커스텀 파일명 생성

```typescript
await uploadImageWithCompression(file, {
  compressionType: 'review',
  bucket: 'consultation_photos',
  folder: 'uploads',
  generateFileName: (originalName, index) => {
    const timestamp = Date.now();
    const ext = originalName.split('.').pop();
    return `photo-${timestamp}-${index}.${ext}`;
  }
});
```

---

## 성능 특성

### 압축 시간

| 파일 크기 | 압축 시간 (추정) |
|-----------|------------------|
| 1MB | ~500ms |
| 5MB | ~1-2s |
| 10MB | ~2-4s |

### 업로드 시간

| 압축 후 크기 | 업로드 시간 (추정, 10Mbps 연결) |
|--------------|----------------------------------|
| 200KB | ~0.2s |
| 500KB | ~0.4s |
| 1MB | ~0.8s |
| 2MB | ~1.6s |

### 재시도 전략

- **최대 재시도**: 3회
- **지연 시간**: 1s, 2s, 4s (exponential backoff)
- **타임아웃**: 60초 (per attempt)

---

## 보안 고려사항

### 1. Presigned URL 유효 기간

- **Upload (PUT)**: 60초
- **Read (GET)**: 120초

### 2. CORS 설정

S3 버킷 CORS 설정 필요:

```json
{
  "AllowedOrigins": [
    "http://localhost:3000",
    "https://www.mimotok.com",
    "https://mimotok.com"
  ],
  "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],
  "AllowedHeaders": ["*"]
}
```

### 3. 파일 타입 검증

클라이언트와 서버 모두에서 검증:

```typescript
// 클라이언트
if (!file.type.startsWith('image/')) {
  alert('이미지 파일만 업로드 가능합니다');
  return;
}

// 서버 (sign-upload API)
// ContentType 검증 자동 수행
```

### 4. 파일 크기 제한

```typescript
const maxSize = 10 * 1024 * 1024; // 10MB
if (file.size > maxSize) {
  alert('파일 크기는 10MB 이하여야 합니다');
  return;
}
```

---

## 모범 사례

### 1. 조기 압축 (Early Compression)

파일 선택 시점에 압축 → 제출 시 빠른 업로드

```typescript
const handleFileSelect = async (file: File) => {
  // ✅ 좋음: 즉시 압축
  const { compressedFile } = await compressSingleImage(file, 'review');
  setFile(compressedFile);
  setPreview(URL.createObjectURL(compressedFile));
};

const handleSubmit = async () => {
  // 이미 압축된 파일 업로드 (빠름!)
  await uploadImageWithCompression(file, ...);
};
```

### 2. 진행률 표시

사용자 경험 향상:

```typescript
const [progress, setProgress] = useState(0);

await uploadImageWithCompression(file, {
  // ...
  onProgress: (p) => {
    setProgress(p.progress);
  }
});

// UI: <ProgressBar value={progress} />
```

### 3. 에러 복구

```typescript
try {
  await uploadImageWithCompression(file, options);
} catch (error) {
  // 사용자에게 재시도 옵션 제공
  if (confirm('업로드 실패. 재시도하시겠습니까?')) {
    await uploadImageWithCompression(file, options);
  }
}
```

### 4. 압축률 로깅

```typescript
const result = await uploadImageWithCompression(file, options);

console.log('Compression stats:', {
  original: result.originalFile.size,
  compressed: result.compressedFile.size,
  ratio: result.compressionRatio.toFixed(2) + 'x',
  saved: ((1 - 1 / result.compressionRatio) * 100).toFixed(1) + '%'
});
```

---

## 추가 리소스

- [마이그레이션 가이드](./IMAGE_UPLOAD_MIGRATION_GUIDE.md)
- [이미지 업로드 프로세스 가이드](./image_upload_process_guide_2025_12_18.md)
- [AWS S3 마이그레이션 가이드](../AWS_MIGRATION_GUIDE.md)

---

## 변경 이력

| 날짜 | 버전 | 변경 내용 |
|------|------|-----------|
| 2025-12-18 | 1.0.0 | 초기 작성 |

---

**문의:** API 사용 관련 문제 발생 시 이 문서를 먼저 참조하세요.
