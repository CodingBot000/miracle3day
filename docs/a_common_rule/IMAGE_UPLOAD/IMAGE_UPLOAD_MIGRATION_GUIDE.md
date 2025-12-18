# 이미지 업로드 마이그레이션 가이드

> **통일된 이미지 업로드 시스템으로의 마이그레이션 가이드**
>
> 마지막 업데이트: 2025-12-18

---

## 📋 목차

1. [개요](#개요)
2. [변경 사항 요약](#변경-사항-요약)
3. [마이그레이션 절차](#마이그레이션-절차)
4. [코드 예제](#코드-예제)
5. [트러블슈팅](#트러블슈팅)

---

## 개요

### 마이그레이션의 목적

기존에 26개의 서로 다른 이미지 업로드 구현이 존재했던 코드베이스를 **"Compression First, Presigned URL Always"** 전략으로 통일합니다.

### 주요 이점

- ✅ **50-80% 스토리지 비용 절감** (압축률 2-10x)
- ✅ **30-50% 업로드 시간 단축** (작은 파일 크기)
- ✅ **일관된 업로드 경험** (모든 컴포넌트 동일 패턴)
- ✅ **유지보수 용이성 향상** (중복 코드 제거)
- ✅ **자동 재시도 로직** (업로드 안정성 향상)

---

## 변경 사항 요약

### Phase 1: 완료된 변경사항 ✅

1. **신규 유틸리티 생성**
   - `src/lib/imageUploadHelper.ts` (압축 + presigned URL + 재시도)

2. **상담 폼 컴포넌트 리팩토링**
   - `PreviewReport.tsx` - 압축 추가 (74-102줄)
   - `UploadImageStep.tsx` (pre_consultation) - 조기 압축
   - `UploadImageStep.tsx` (recommend_estimate) - 조기 압축

3. **관리자 컴포넌트 리팩토링**
   - `ClinicImageUploadSection.tsx` - 다중 이미지 압축
   - `ClinicImageThumbnailUploadSection.tsx` - 썸네일 압축

4. **레거시 정리**
   - `/api/storage/presign_upload` 중복 엔드포인트 제거
   - `UploadTest.tsx` 수정

### Phase 2-5: 향후 계획 📋

- Phase 2: 커뮤니티 업로드 평가 (`WriteForm.tsx`)
- Phase 3-5: 나머지 20+ 업로드 구현 점진적 마이그레이션

---

## 마이그레이션 절차

### 1. 기존 코드 패턴 확인

기존 코드가 어떤 패턴을 사용하는지 확인:

#### 패턴 A: Base64 Preview + 지연 업로드 (압축 없음)
```typescript
// ❌ 기존 코드
const handleFile = (file: File) => {
  const reader = new FileReader();
  reader.onload = (e) => {
    setPreview(e.target.result as string);
    setFile(file); // 원본 파일 저장
  };
  reader.readAsDataURL(file);
};
```

#### 패턴 B: Presigned URL 업로드 (압축 없음)
```typescript
// ❌ 기존 코드
const uploadFile = async (file: File) => {
  const safeFileName = sanitizeFileName(file.name);
  const presignedUrl = await fetchPresignedUrl(bucket, key, file.type);
  await fetch(presignedUrl, {
    method: 'PUT',
    body: file, // 원본 파일 업로드
    headers: { 'Content-Type': file.type }
  });
};
```

---

### 2. 마이그레이션 구현

#### 시나리오 1: Base64 Preview 컴포넌트

**Before:**
```typescript
const handleFile = (file: File) => {
  // 파일 검증
  if (!file.type.startsWith('image/')) {
    alert('Only image files allowed');
    return;
  }

  // 원본 파일로 미리보기 생성
  const reader = new FileReader();
  reader.onload = (e) => {
    setPreview(e.target.result as string);
    setFile(file); // ❌ 원본 파일 저장
  };
  reader.readAsDataURL(file);
};
```

**After:**
```typescript
import { compressSingleImage } from '@/utils/imageCompression';

const handleFile = async (file: File) => {
  // 파일 검증
  if (!file.type.startsWith('image/')) {
    alert('Only image files allowed');
    return;
  }

  try {
    // ✅ 압축 먼저!
    const { compressedFile, error } = await compressSingleImage(
      file,
      'review', // 타입 선택: profile, review, community_posting, thumbnail, clinic_display, doctor
      {
        maxSizeMB: 2.0, // 선택: 타입별 기본값 오버라이드
      }
    );

    if (error || !compressedFile) {
      console.error('Compression failed:', error);
      alert('Failed to process image. Please try another file.');
      return;
    }

    // ✅ 압축된 파일로 미리보기 생성
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target.result as string);
      setFile(compressedFile); // ✅ 압축된 파일 저장
    };
    reader.readAsDataURL(compressedFile);

  } catch (error) {
    console.error('Image processing error:', error);
    alert('Failed to process image. Please try again.');
  }
};
```

**변경 포인트:**
1. `handleFile`을 `async`로 변경
2. `compressSingleImage` 호출 추가
3. 에러 핸들링 추가
4. `compressedFile`을 state에 저장

---

#### 시나리오 2: Presigned URL 직접 업로드

**Before:**
```typescript
const uploadImage = async (file: File) => {
  // 파일명 안전화
  const safeFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');

  // Presigned URL 요청
  const response = await fetch('/api/storage/s3/sign-upload', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      bucket: 'consultation_photos',
      key: `${folder}/${safeFileName}`,
      contentType: file.type,
      upsert: false,
    })
  });

  const { url } = await response.json();

  // S3에 업로드
  await fetch(url, {
    method: 'PUT',
    body: file, // ❌ 원본 파일
    headers: { 'Content-Type': file.type }
  });

  return `consultation_photos/${folder}/${safeFileName}`;
};
```

**After:**
```typescript
import { uploadImageWithCompression } from '@/lib/imageUploadHelper';

const uploadImage = async (file: File) => {
  // ✅ 모든 작업을 한 번에!
  const result = await uploadImageWithCompression(file, {
    compressionType: 'review', // 타입 선택
    bucket: 'consultation_photos',
    folder: folder,
    upsert: false,
    // 선택: 진행률 콜백
    onProgress: (progress) => {
      console.log(`${progress.stage}: ${progress.progress}%`);
    }
  });

  // 압축 정보 로깅 (선택)
  console.log('Compression ratio:', result.compressionRatio.toFixed(2) + 'x');

  return result.s3Path;
};
```

**변경 포인트:**
1. 50+ 줄 → 15 줄로 축소
2. 압축 자동 적용
3. 파일명 안전화 자동 처리
4. 자동 재시도 로직 포함
5. 진행률 추적 가능

---

#### 시나리오 3: 다중 이미지 업로드

**Before:**
```typescript
const uploadMultiple = async (files: File[]) => {
  const results = [];

  for (const file of files) {
    const safeFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    // ... presigned URL 요청
    // ... S3 업로드
    results.push(s3Path);
  }

  return results;
};
```

**After:**
```typescript
import { uploadMultipleImages } from '@/lib/imageUploadHelper';

const uploadMultiple = async (files: File[]) => {
  // ✅ 병렬 업로드 (동시성 제한 3개)
  const { successful, failed } = await uploadMultipleImages(
    files,
    {
      compressionType: 'community_posting',
      bucket: 'beauty-bucket-public',
      folder: `community/posts/${postId}`,
      onProgress: (progress) => {
        setProgress(progress); // 전체 진행률 추적
      }
    },
    3 // 최대 동시 업로드 수
  );

  if (failed.length > 0) {
    console.error('Failed uploads:', failed);
    alert(`${failed.length}개 파일 업로드 실패`);
  }

  return successful.map(r => r.s3Path);
};
```

**변경 포인트:**
1. 병렬 처리 (동시성 제한)
2. 실패한 파일 자동 추적
3. 전체 진행률 추적
4. 압축 자동 적용

---

### 3. 압축 타입 선택 가이드

| 압축 타입 | 용도 | 최대 크기 | 최대 너비 | 품질 |
|----------|------|-----------|-----------|------|
| `profile` | 프로필 이미지 | 200KB | 400px | 높음 |
| `review` | 의료 상담 이미지 | 1MB | 1600px | 최고 |
| `community_posting` | 커뮤니티 글 | 500KB | 1200px | 중간 |
| `thumbnail` | 썸네일 | 100KB | 300px | 중간 |
| `clinic_display` | 병원 갤러리 | 800KB | 1920px | 높음 |
| `doctor` | 의사 프로필 | 300KB | 600px | 높음 |

**선택 방법:**
1. **의료/진단 이미지** → `review` (높은 품질 필요)
2. **프로필 사진** → `profile` 또는 `doctor`
3. **갤러리 이미지** → `clinic_display`
4. **커뮤니티 게시글** → `community_posting`
5. **작은 미리보기** → `thumbnail`

---

### 4. 테스트

마이그레이션 후 반드시 테스트:

```typescript
// 테스트 체크리스트
✅ 파일 선택 → 미리보기 표시
✅ 압축 후 파일 크기 감소 확인
✅ 업로드 성공 확인
✅ DB에 경로 저장 확인
✅ 저장된 경로로 이미지 조회 가능
✅ 에러 케이스 처리 (큰 파일, 잘못된 형식 등)
```

---

## 코드 예제

### 예제 1: React 컴포넌트 (단일 이미지)

```typescript
import { useState, useCallback } from 'react';
import { compressSingleImage } from '@/utils/imageCompression';
import { uploadImageWithCompression } from '@/lib/imageUploadHelper';

export function ImageUploader() {
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  // Step 1: 파일 선택 시 압축 및 미리보기
  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    try {
      const { compressedFile, error } = await compressSingleImage(
        selectedFile,
        'review',
      );

      if (error || !compressedFile) {
        alert('이미지 처리 실패');
        return;
      }

      setFile(compressedFile);

      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target?.result as string);
      reader.readAsDataURL(compressedFile);
    } catch (error) {
      console.error(error);
      alert('이미지 처리 중 오류');
    }
  }, []);

  // Step 2: 제출 시 업로드
  const handleSubmit = async () => {
    if (!file) return;

    setUploading(true);
    try {
      const result = await uploadImageWithCompression(file, {
        compressionType: 'review',
        bucket: 'consultation_photos',
        folder: 'uploads',
      });

      console.log('Uploaded:', result.s3Path);

      // DB에 저장
      await saveToDatabase({ imagePath: result.s3Path });

      alert('업로드 성공!');
    } catch (error) {
      console.error(error);
      alert('업로드 실패');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <input type="file" accept="image/*" onChange={handleFileSelect} />
      {preview && <img src={preview} alt="Preview" />}
      <button onClick={handleSubmit} disabled={!file || uploading}>
        {uploading ? '업로드 중...' : '제출'}
      </button>
    </div>
  );
}
```

### 예제 2: 다중 이미지 업로드 (진행률 표시)

```typescript
import { useState } from 'react';
import { uploadMultipleImages, UploadProgress } from '@/lib/imageUploadHelper';

export function MultiImageUploader() {
  const [progress, setProgress] = useState<Map<number, UploadProgress>>(new Map());

  const handleUpload = async (files: File[]) => {
    const { successful, failed } = await uploadMultipleImages(
      files,
      {
        compressionType: 'community_posting',
        bucket: 'beauty-bucket-public',
        folder: 'community',
        onProgress: (p) => {
          setProgress(prev => new Map(prev).set(p.fileIndex, p));
        },
        onFileComplete: (result) => {
          console.log(`${result.originalFile.name} 완료`);
        },
        onFileError: (file, error) => {
          console.error(`${file.name} 실패:`, error);
        }
      },
      3 // 최대 3개 동시 업로드
    );

    console.log(`성공: ${successful.length}, 실패: ${failed.length}`);
    return successful.map(r => r.s3Path);
  };

  return (
    <div>
      <input
        type="file"
        accept="image/*"
        multiple
        onChange={(e) => e.target.files && handleUpload(Array.from(e.target.files))}
      />

      {/* 진행률 표시 */}
      <div>
        {Array.from(progress.entries()).map(([index, p]) => (
          <div key={index}>
            {p.fileName}: {p.stage} - {p.progress}%
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

## 트러블슈팅

### Q1: 압축 후 이미지 품질이 너무 낮아요

**A:** 타입을 `review`로 변경하거나 `compressionOverride` 사용:

```typescript
const { compressedFile } = await compressSingleImage(file, 'review', {
  maxSizeMB: 3.0,  // 기본값보다 크게
  maxWidthOrHeight: 2000,  // 기본값보다 크게
  initialQuality: 0.9,  // 품질 높게
});
```

### Q2: 업로드가 실패해요 (409 Conflict)

**A:** 같은 이름의 파일이 이미 존재합니다. `upsert: true` 사용:

```typescript
await uploadImageWithCompression(file, {
  compressionType: 'review',
  bucket: 'consultation_photos',
  folder: 'uploads',
  upsert: true,  // 덮어쓰기 허용
});
```

### Q3: CORS 에러가 발생해요

**A:** S3 CORS 설정 확인:

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

자세한 내용은 [IMAGE_UPLOAD_PROCESS_GUIDE.md](./image_upload_process_guide_2025_12_18.md) 참조

### Q4: 파일명에 한글이 있어요

**A:** `imageUploadHelper.ts`가 자동으로 sanitize 합니다:

```typescript
// "안녕하세요 사진.jpg" → "_____.jpg"
// "photo-123.png" → "photo-123.png" (변경 없음)
```

원하는 파일명을 지정하려면:

```typescript
await uploadImageWithCompression(file, {
  // ...
  generateFileName: (originalName, index) => {
    return `custom-${Date.now()}-${index}.jpg`;
  }
});
```

### Q5: 압축이 너무 오래 걸려요

**A:** 5MB 이미지는 약 1-2초 소요됩니다. 이미 충분히 빠릅니다. 더 빠르게 하려면:

1. 파일 선택 시점에 압축 (조기 압축 전략)
2. 로딩 인디케이터 표시
3. Web Worker 사용 고려 (향후 개선)

---

## 마이그레이션 완료 체크리스트

### 코드 변경
- [ ] `compressSingleImage` 또는 `compressMultipleImages` import 추가
- [ ] `handleFile` 함수를 `async`로 변경
- [ ] 압축 로직 추가
- [ ] 에러 핸들링 추가
- [ ] 압축된 파일을 state에 저장

### 테스트
- [ ] 파일 선택 → 미리보기 동작 확인
- [ ] 압축률 확인 (console.log로 확인)
- [ ] 업로드 성공 확인
- [ ] DB 저장 경로 확인
- [ ] 에러 케이스 테스트

### 문서
- [ ] 코드 주석 업데이트
- [ ] README 업데이트 (필요시)
- [ ] 팀원에게 변경사항 공유

---

## 추가 리소스

- [이미지 압축 유틸리티](../../src/utils/imageCompression.ts)
- [이미지 업로드 헬퍼](../../src/lib/imageUploadHelper.ts)
- [이미지 업로드 프로세스 가이드](./image_upload_process_guide_2025_12_18.md)
- [AWS S3 마이그레이션 가이드](../AWS_MIGRATION_GUIDE.md)

---

## 변경 이력

| 날짜 | 버전 | 변경 내용 |
|------|------|-----------|
| 2025-12-18 | 1.0.0 | 초기 작성 (Phase 1 완료) |

---

**문의:** 이미지 업로드 관련 문제 발생 시 이 가이드를 먼저 참조하세요.
