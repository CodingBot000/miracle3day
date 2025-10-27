# API 사용 예시 및 통합 가이드

> 생성일: 2025년 10월 27일
> 목적: API 실제 사용 방법 및 통합 패턴 제시

## 목차

1. [기본 설정](#기본-설정)
2. [인증 플로우](#인증-플로우)
3. [병원 검색 및 조회](#병원-검색-및-조회)
4. [예약 시스템](#예약-시스템)
5. [리뷰 시스템](#리뷰-시스템)
6. [파일 업로드](#파일-업로드)
7. [AI 분석](#ai-분석)
8. [에러 처리](#에러-처리)
9. [React Query 통합](#react-query-통합)
10. [타입스크립트 타입 정의](#타입스크립트-타입-정의)

---

## 기본 설정

### API 클라이언트 초기화

```typescript
// src/lib/api-client.ts
import axios, { AxiosInstance } from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

class APIClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: true, // 쿠키 포함
    });

    // 요청 인터셉터
    this.client.interceptors.request.use((config) => {
      console.log(`📤 Request: ${config.method?.toUpperCase()} ${config.url}`);
      return config;
    });

    // 응답 인터셉터
    this.client.interceptors.response.use(
      (response) => {
        console.log(`📥 Response: ${response.status}`);
        return response.data;
      },
      (error) => {
        if (error.response?.status === 401) {
          // 인증 실패 처리
          window.location.href = '/login';
        }
        throw error;
      }
    );
  }

  async get<T>(url: string, config?: any): Promise<T> {
    return this.client.get<any, T>(url, config);
  }

  async post<T>(url: string, data?: any, config?: any): Promise<T> {
    return this.client.post<any, T>(url, data, config);
  }

  async put<T>(url: string, data?: any, config?: any): Promise<T> {
    return this.client.put<any, T>(url, data, config);
  }

  async delete<T>(url: string, config?: any): Promise<T> {
    return this.client.delete<any, T>(url, config);
  }
}

export const apiClient = new APIClient();
```

### 환경 변수 설정

```env
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:3000/api

# .env.prod
NEXT_PUBLIC_API_URL=https://api.beautyplatform.com
```

---

## 인증 플로우

### 1. 로그인 후 사용자 정보 확인

```typescript
// src/services/auth.service.ts
import { apiClient } from '@/lib/api-client';

export const authService = {
  // 현재 로그인한 사용자 정보 조회
  async getCurrentUser() {
    try {
      const response = await apiClient.get('/auth/getUser');
      return response.data.userInfo;
    } catch (error) {
      if (error.response?.status === 401) {
        return null; // 로그인하지 않음
      }
      throw error;
    }
  },

  // 이메일로 사용자 검색
  async getUserByEmail(email: string) {
    const response = await apiClient.post('/auth/getUser', { email });
    return response.data.user;
  },

  // 프로필 업데이트
  async updateProfile(profileData: {
    name?: string;
    nickname?: string;
    avatar?: string;
    phone?: string;
    birth_date?: string;
    gender?: 'M' | 'F';
  }) {
    const response = await apiClient.post('/auth/update_profile', profileData);
    return response.data.user;
  },

  // 로그아웃
  async logout() {
    const response = await apiClient.post('/auth/logout');
    return response.data.success;
  },
};
```

### 2. 로그인 상태 확인 Hook

```typescript
// src/hooks/useAuth.ts
import { useQuery } from '@tanstack/react-query';
import { authService } from '@/services/auth.service';

export function useAuth() {
  const { data: user, isLoading, isError } = useQuery({
    queryKey: ['auth', 'user'],
    queryFn: () => authService.getCurrentUser(),
    retry: false,
  });

  const isAuthenticated = !!user;

  return {
    user,
    isAuthenticated,
    isLoading,
    isError,
  };
}
```

### 3. 컴포넌트에서 사용

```typescript
// src/components/UserProfile.tsx
'use client';

import { useAuth } from '@/hooks/useAuth';
import { useState } from 'react';
import { authService } from '@/services/auth.service';

export function UserProfile() {
  const { user, isLoading } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');

  if (isLoading) return <div>로딩 중...</div>;
  if (!user) return <div>로그인이 필요합니다</div>;

  const handleUpdate = async () => {
    try {
      await authService.updateProfile({ name });
      setIsEditing(false);
      alert('프로필이 업데이트되었습니다');
    } catch (error) {
      alert('프로필 업데이트 실패');
    }
  };

  return (
    <div>
      <h2>{user.name}</h2>
      <p>이메일: {user.email}</p>
      {isEditing ? (
        <>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <button onClick={handleUpdate}>저장</button>
        </>
      ) : (
        <button onClick={() => setIsEditing(true)}>수정</button>
      )}
    </div>
  );
}
```

---

## 병원 검색 및 조회

### 1. 병원 목록 서비스

```typescript
// src/services/hospital.service.ts
import { apiClient } from '@/lib/api-client';
import type { Hospital, HospitalDetail } from '@/types/hospital';

export const hospitalService = {
  // 병원 목록 조회
  async getHospitals(locationNum?: number) {
    const params = new URLSearchParams();
    if (locationNum) {
      params.append('locationNum', String(locationNum));
    }

    const response = await apiClient.get(`/hospital/list?${params}`);
    return {
      hospitals: response.data.data as Hospital[],
      total: response.data.total as number,
    };
  },

  // 병원 상세 정보 조회
  async getHospitalInfo(hospitalId: string): Promise<HospitalDetail> {
    const response = await apiClient.get(`/hospital/${hospitalId}/info`);
    return response.data.data;
  },

  // 병원 메인 정보
  async getHospitalMainInfo(hospitalId: string) {
    const response = await apiClient.get(`/hospital/${hospitalId}/main`);
    return response.data.data;
  },
};
```

### 2. 병원 조회 Hook

```typescript
// src/hooks/useHospital.ts
import { useQuery } from '@tanstack/react-query';
import { hospitalService } from '@/services/hospital.service';

export function useHospitals(locationNum?: number) {
  return useQuery({
    queryKey: ['hospitals', locationNum],
    queryFn: () => hospitalService.getHospitals(locationNum),
  });
}

export function useHospitalInfo(hospitalId: string) {
  return useQuery({
    queryKey: ['hospital', hospitalId],
    queryFn: () => hospitalService.getHospitalInfo(hospitalId),
    enabled: !!hospitalId,
  });
}
```

### 3. 병원 목록 페이지

```typescript
// src/app/hospitals/page.tsx
'use client';

import { useHospitals } from '@/hooks/useHospital';
import Link from 'next/link';
import { useState } from 'react';

export default function HospitalListPage() {
  const [selectedLocation, setSelectedLocation] = useState<number>();
  const { data, isLoading, isError } = useHospitals(selectedLocation);

  if (isLoading) return <div>병원 목록 로딩 중...</div>;
  if (isError) return <div>병원 목록 로드 실패</div>;

  return (
    <div>
      <h1>병원 검색</h1>

      <div className="location-filter">
        <select onChange={(e) => setSelectedLocation(Number(e.target.value))}>
          <option value="">모든 지역</option>
          <option value="1">서울</option>
          <option value="2">부산</option>
          <option value="3">대구</option>
        </select>
      </div>

      <div className="hospital-grid">
        {data?.hospitals.map((hospital) => (
          <Link key={hospital.id_uuid} href={`/hospitals/${hospital.id_uuid}`}>
            <div className="hospital-card">
              <img
                src={hospital.thumbnail_url}
                alt={hospital.name}
              />
              <h3>{hospital.name}</h3>
              <p>{hospital.address_full_road}</p>
              <span>❤️ {hospital.favorite_count}</span>
            </div>
          </Link>
        ))}
      </div>

      <p>총 {data?.total}개 병원</p>
    </div>
  );
}
```

### 4. 병원 상세 페이지

```typescript
// src/app/hospitals/[id]/page.tsx
'use client';

import { useHospitalInfo } from '@/hooks/useHospital';
import { useParams } from 'next/navigation';

export default function HospitalDetailPage() {
  const { id } = useParams();
  const { data, isLoading, isError } = useHospitalInfo(String(id));

  if (isLoading) return <div>로딩 중...</div>;
  if (isError) return <div>로드 실패</div>;

  const detail = data?.hospital_info;
  const details = data?.hospital_details;
  const hours = data?.business_hours || [];
  const treatments = data?.treatments || [];
  const doctors = data?.doctors || [];

  return (
    <div className="hospital-detail">
      <div className="header">
        <h1>{detail?.name}</h1>
        <p className="en-name">{detail?.name_en}</p>
      </div>

      {/* 이미지 갤러리 */}
      <div className="gallery">
        {detail?.imageurls?.map((url) => (
          <img key={url} src={url} alt="병원 이미지" />
        ))}
      </div>

      {/* 주소 */}
      <section>
        <h2>위치</h2>
        <p>{detail?.address_full_road}</p>
        <p>{detail?.address_full_jibun}</p>
        <p>우편번호: {detail?.zipcode}</p>
      </section>

      {/* 영업시간 */}
      <section>
        <h2>영업시간</h2>
        <table>
          <thead>
            <tr>
              <th>요일</th>
              <th>시간</th>
            </tr>
          </thead>
          <tbody>
            {hours.map((hour) => (
              <tr key={hour.day_of_week}>
                <td>
                  {['일', '월', '화', '수', '목', '금', '토'][hour.day_of_week]}
                </td>
                <td>
                  {hour.open_time} - {hour.close_time}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* 시술 항목 */}
      <section>
        <h2>제공 시술</h2>
        <ul>
          {treatments.map((treatment) => (
            <li key={treatment.id}>
              <strong>{treatment.name}</strong>
              <p>{treatment.description}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* 의료진 */}
      <section>
        <h2>의료진</h2>
        <div className="doctors-grid">
          {doctors.map((doctor) => (
            <div key={doctor.id} className="doctor-card">
              <h3>{doctor.name}</h3>
              <p>{doctor.specialty}</p>
              <p>경력: {doctor.experience_years}년</p>
            </div>
          ))}
        </div>
      </section>

      {/* 예약 버튼 */}
      <div className="actions">
        <button className="btn-primary">
          예약하기
        </button>
        <button className="btn-secondary">
          즐겨찾기 추가
        </button>
      </div>
    </div>
  );
}
```

---

## 예약 시스템

### 1. 예약 서비스

```typescript
// src/services/reservation.service.ts
import { apiClient } from '@/lib/api-client';
import { z } from 'zod';

const reservationSchema = z.object({
  name: z.string().min(1, '성명은 필수입니다'),
  english_name: z.string().optional().nullable(),
  passport_name: z.string().optional().nullable(),
  nationality: z.string().min(1, '국적은 필수입니다'),
  gender: z.string().optional().nullable(),
  birth_date: z.string().optional().nullable(),
  email: z.string().email('유효한 이메일을 입력하세요'),
  phone: z.string().optional().nullable(),
  phone_korea: z.string().optional().nullable(),
  preferred_date: z.string().optional().nullable(),
  preferred_time: z.string().optional().nullable(),
  visitor_count: z.string().optional().nullable(),
  reservation_headcount: z.string().optional().nullable(),
  treatment_experience: z.string().optional().nullable(),
  area_to_improve: z.string().optional().nullable(),
  consultation_request: z.string().optional().nullable(),
  additional_info: z.string().optional().nullable(),
  preferred_languages: z.array(z.string()).optional().nullable(),
});

export type ReservationInput = z.infer<typeof reservationSchema>;

export const reservationService = {
  // 예약 생성
  async createReservation(
    hospitalId: string,
    data: ReservationInput
  ) {
    // 검증
    const validated = reservationSchema.parse(data);

    const response = await apiClient.post(
      `/hospital/${hospitalId}/reservation`,
      validated
    );

    return response.data.data;
  },

  // 입력 검증
  validateReservation(data: any) {
    try {
      reservationSchema.parse(data);
      return { valid: true };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return { valid: false, errors: error.flatten().fieldErrors };
      }
      return { valid: false, errors: { general: ['검증 실패'] } };
    }
  },
};
```

### 2. 예약 폼 컴포넌트

```typescript
// src/components/ReservationForm.tsx
'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { reservationService, type ReservationInput } from '@/services/reservation.service';

interface ReservationFormProps {
  hospitalId: string;
  onSuccess?: () => void;
}

export function ReservationForm({ hospitalId, onSuccess }: ReservationFormProps) {
  const [formData, setFormData] = useState<ReservationInput>({
    name: '',
    nationality: '',
    email: '',
    preferred_languages: [],
  });

  const [errors, setErrors] = useState<Record<string, string[]>>({});

  const mutation = useMutation({
    mutationFn: (data: ReservationInput) =>
      reservationService.createReservation(hospitalId, data),
    onSuccess: () => {
      alert('예약이 완료되었습니다');
      onSuccess?.();
    },
    onError: (error: any) => {
      const errorData = error.response?.data?.error;
      if (errorData?.fieldErrors) {
        setErrors(errorData.fieldErrors);
      } else {
        alert('예약 실패: ' + error.message);
      }
    },
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // 에러 제거
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // 클라이언트 검증
    const validation = reservationService.validateReservation(formData);
    if (!validation.valid) {
      setErrors(validation.errors as any);
      return;
    }

    mutation.mutate(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="reservation-form">
      <h2>예약 신청</h2>

      {/* 성명 */}
      <div className="form-group">
        <label htmlFor="name">성명 *</label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
        />
        {errors.name && <span className="error">{errors.name[0]}</span>}
      </div>

      {/* 국적 */}
      <div className="form-group">
        <label htmlFor="nationality">국적 *</label>
        <select
          id="nationality"
          name="nationality"
          value={formData.nationality}
          onChange={handleChange}
          required
        >
          <option value="">선택하세요</option>
          <option value="KR">한국</option>
          <option value="US">미국</option>
          <option value="JP">일본</option>
          <option value="CN">중국</option>
        </select>
        {errors.nationality && <span className="error">{errors.nationality[0]}</span>}
      </div>

      {/* 이메일 */}
      <div className="form-group">
        <label htmlFor="email">이메일 *</label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
        />
        {errors.email && <span className="error">{errors.email[0]}</span>}
      </div>

      {/* 선호 날짜 */}
      <div className="form-group">
        <label htmlFor="preferred_date">희망 날짜</label>
        <input
          type="date"
          id="preferred_date"
          name="preferred_date"
          value={formData.preferred_date || ''}
          onChange={handleChange}
        />
      </div>

      {/* 선호 시간 */}
      <div className="form-group">
        <label htmlFor="preferred_time">희망 시간</label>
        <input
          type="time"
          id="preferred_time"
          name="preferred_time"
          value={formData.preferred_time || ''}
          onChange={handleChange}
        />
      </div>

      {/* 상담 요청사항 */}
      <div className="form-group">
        <label htmlFor="consultation_request">상담 요청사항</label>
        <textarea
          id="consultation_request"
          name="consultation_request"
          value={formData.consultation_request || ''}
          onChange={handleChange}
          rows={4}
        />
      </div>

      {/* 선호 언어 */}
      <div className="form-group">
        <label>선호 언어</label>
        <div className="checkbox-group">
          {['ko', 'en', 'ja', 'zh'].map((lang) => (
            <label key={lang}>
              <input
                type="checkbox"
                checked={(formData.preferred_languages || []).includes(lang)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setFormData((prev) => ({
                      ...prev,
                      preferred_languages: [
                        ...(prev.preferred_languages || []),
                        lang,
                      ],
                    }));
                  } else {
                    setFormData((prev) => ({
                      ...prev,
                      preferred_languages: (
                        prev.preferred_languages || []
                      ).filter((l) => l !== lang),
                    }));
                  }
                }}
              />
              {lang.toUpperCase()}
            </label>
          ))}
        </div>
      </div>

      <button type="submit" disabled={mutation.isPending}>
        {mutation.isPending ? '제출 중...' : '예약 신청'}
      </button>
    </form>
  );
}
```

---

## 리뷰 시스템

### 1. 리뷰 서비스

```typescript
// src/services/review.service.ts
import { apiClient } from '@/lib/api-client';

export const reviewService = {
  // 병원 리뷰 조회
  async getHospitalReviews(hospitalId: string, pageParam: number = 0) {
    const response = await apiClient.get(
      `/hospital/${hospitalId}/review?pageParam=${pageParam}`
    );
    return {
      hospitalData: response.data.data.hospitalData,
      reviews: response.data.data.reviewsWithMember,
      nextCursor: response.data.nextCursor,
    };
  },

  // 수술별 리뷰 조회
  async getSurgeryReviews(surgeryId: string, pageParam: number = 0) {
    const response = await apiClient.get(
      `/surgeries/${surgeryId}/review?pageParam=${pageParam}`
    );
    return {
      reviews: response.data.data,
      nextCursor: response.data.nextCursor,
    };
  },

  // 리뷰 작성
  async createReview(hospitalId: string, reviewData: {
    rating: number;
    comment: string;
    before_image?: string;
    after_image?: string;
  }) {
    const response = await apiClient.post(
      `/hospital/${hospitalId}/review`,
      reviewData
    );
    return response.data;
  },
};
```

### 2. 리뷰 리스트 컴포넌트

```typescript
// src/components/ReviewList.tsx
'use client';

import { useInfiniteQuery } from '@tanstack/react-query';
import { reviewService } from '@/services/review.service';
import { useEffect, useRef } from 'react';

interface ReviewListProps {
  hospitalId: string;
}

export function ReviewList({ hospitalId }: ReviewListProps) {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useInfiniteQuery({
    queryKey: ['reviews', hospitalId],
    queryFn: ({ pageParam = 0 }) =>
      reviewService.getHospitalReviews(hospitalId, pageParam),
    getNextPageParam: (lastPage, pages) =>
      lastPage.nextCursor ? pages.length : undefined,
  });

  const observerTarget = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  if (isLoading) return <div>리뷰 로딩 중...</div>;

  const reviews = data?.pages.flatMap((page) => page.reviews) || [];

  return (
    <div className="review-list">
      <h2>리뷰 ({data?.pages[0]?.hospitalData?.favorite_count || 0})</h2>

      {reviews.length === 0 ? (
        <p>리뷰가 없습니다</p>
      ) : (
        <div className="reviews">
          {reviews.map((item) => (
            <div key={item.review.id} className="review-item">
              <div className="review-header">
                <img
                  src={item.member?.avatar || '/default-avatar.png'}
                  alt={item.member?.name}
                />
                <div>
                  <h3>{item.member?.name || '익명'}</h3>
                  <p>⭐ {item.review.rating}/5</p>
                </div>
              </div>

              <p className="review-comment">{item.review.comment}</p>

              {item.review.before_image && item.review.after_image && (
                <div className="review-images">
                  <div>
                    <span>시술 전</span>
                    <img src={item.review.before_image} alt="Before" />
                  </div>
                  <div>
                    <span>시술 후</span>
                    <img src={item.review.after_image} alt="After" />
                  </div>
                </div>
              )}

              <p className="review-date">
                {new Date(item.review.created_at).toLocaleDateString('ko-KR')}
              </p>
            </div>
          ))}
        </div>
      )}

      {hasNextPage && (
        <div ref={observerTarget} className="load-more">
          {isFetchingNextPage && <span>더 로딩 중...</span>}
        </div>
      )}
    </div>
  );
}
```

---

## 파일 업로드

### 1. 파일 업로드 서비스

```typescript
// src/services/storage.service.ts
import { apiClient } from '@/lib/api-client';

export const storageService = {
  // S3 업로드 사전 서명 URL 발급
  async getPresignedUploadUrl(
    fileName: string,
    fileType: string,
    fileSize: number
  ) {
    const response = await apiClient.post('/storage/presign_upload', {
      fileName,
      fileType,
      fileSize,
    });
    return response.data;
  },

  // S3 다운로드 사전 서명 URL 발급
  async getPresignedReadUrl(key: string) {
    const response = await apiClient.post('/storage/presign_read', {
      key,
    });
    return response.data.readUrl;
  },

  // 직접 업로드
  async uploadFile(file: File) {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.post('/storage/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  // S3에 직접 업로드
  async uploadToS3(
    file: File,
    presignedUrl: string,
    fields: Record<string, string>
  ) {
    const formData = new FormData();

    // 필드 추가
    Object.entries(fields).forEach(([key, value]) => {
      formData.append(key, value);
    });

    // 파일 마지막에 추가
    formData.append('file', file);

    const response = await fetch(presignedUrl, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('S3 업로드 실패');
    }

    return response;
  },
};
```

### 2. 파일 업로드 Hook

```typescript
// src/hooks/useFileUpload.ts
import { useState, useCallback } from 'react';
import { storageService } from '@/services/storage.service';

export function useFileUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const uploadFile = useCallback(
    async (file: File): Promise<string> => {
      try {
        setIsUploading(true);
        setError(null);
        setProgress(0);

        // 파일 검증
        const maxSize = 10 * 1024 * 1024; // 10MB
        if (file.size > maxSize) {
          throw new Error('파일 크기가 너무 큽니다 (최대 10MB)');
        }

        // 허용된 파일 타입
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
          throw new Error('허용되지 않는 파일 형식입니다');
        }

        setProgress(10);

        // 사전 서명 URL 발급
        const { uploadUrl, key, fields } = await storageService.getPresignedUploadUrl(
          file.name,
          file.type,
          file.size
        );

        setProgress(40);

        // S3에 업로드
        await storageService.uploadToS3(file, uploadUrl, fields);

        setProgress(100);

        return key;
      } catch (err) {
        const message = err instanceof Error ? err.message : '업로드 실패';
        setError(message);
        throw err;
      } finally {
        setIsUploading(false);
      }
    },
    []
  );

  return {
    uploadFile,
    isUploading,
    progress,
    error,
  };
}
```

### 3. 이미지 업로드 컴포넌트

```typescript
// src/components/ImageUploader.tsx
'use client';

import { useFileUpload } from '@/hooks/useFileUpload';
import { useRef, useState } from 'react';

interface ImageUploaderProps {
  onUploadSuccess?: (fileKey: string) => void;
}

export function ImageUploader({ onUploadSuccess }: ImageUploaderProps) {
  const { uploadFile, isUploading, progress, error } = useFileUpload();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 미리보기
    const reader = new FileReader();
    reader.onload = (event) => {
      setPreview(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    const file = fileInputRef.current?.files?.[0];
    if (!file) {
      alert('파일을 선택하세요');
      return;
    }

    try {
      const fileKey = await uploadFile(file);
      alert('업로드 성공');
      onUploadSuccess?.(fileKey);
      setPreview(null);
      fileInputRef.current!.value = '';
    } catch (err) {
      // 에러는 이미 설정됨
    }
  };

  return (
    <div className="image-uploader">
      <div className="file-input-wrapper">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          disabled={isUploading}
        />
        <label>이미지 선택</label>
      </div>

      {preview && (
        <div className="preview">
          <img src={preview} alt="Preview" />
        </div>
      )}

      {error && <p className="error">{error}</p>}

      <button
        onClick={handleUpload}
        disabled={!preview || isUploading}
        className="upload-btn"
      >
        {isUploading ? `업로드 중... ${progress}%` : '업로드'}
      </button>
    </div>
  );
}
```

---

## AI 분석

### 1. 피부 분석 서비스

```typescript
// src/services/ai.service.ts
import { apiClient } from '@/lib/api-client';

export type SkinConcern =
  | 'Wrinkle'
  | 'Droopy_upper_eyelid'
  | 'Firmness'
  | 'Acne'
  | 'Moisture'
  | 'Eye_bag'
  | 'Dark_circle'
  | 'Spots'
  | 'Radiance'
  | 'Redness'
  | 'Oiliness'
  | 'Pore'
  | 'Texture'
  | 'HD_Wrinkle'
  | 'HD_Droopy_upper_eyelid'
  | 'HD_Firmness'
  | 'HD_Acne'
  | 'HD_Moisture'
  | 'HD_Eye_bag'
  | 'HD_Dark_circle'
  | 'HD_Spots'
  | 'HD_Radiance'
  | 'HD_Redness'
  | 'HD_Oiliness'
  | 'HD_Pore'
  | 'HD_Texture';

export const aiService = {
  // 피부 분석
  async analyzeSkin(
    image: File,
    concerns: SkinConcern[],
    mode?: 'SD' | 'HD'
  ) {
    const formData = new FormData();
    formData.append('image', image);
    formData.append('concerns', JSON.stringify(concerns));
    if (mode) {
      formData.append('mode', mode);
    }

    const response = await apiClient.post(
      '/ai/youcam/skin_analysis',
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
      }
    );

    if (!response.data.success) {
      throw new Error(response.data.error);
    }

    return response.data.data;
  },

  // 사용 가능한 피부 고민 목록
  SKIN_CONCERNS: {
    SD: [
      'Wrinkle',
      'Droopy_upper_eyelid',
      'Firmness',
      'Acne',
      'Moisture',
      'Eye_bag',
      'Dark_circle',
      'Spots',
      'Radiance',
      'Redness',
      'Oiliness',
      'Pore',
      'Texture',
    ] as const,
    HD: [
      'HD_Wrinkle',
      'HD_Droopy_upper_eyelid',
      'HD_Firmness',
      'HD_Acne',
      'HD_Moisture',
      'HD_Eye_bag',
      'HD_Dark_circle',
      'HD_Spots',
      'HD_Radiance',
      'HD_Redness',
      'HD_Oiliness',
      'HD_Pore',
      'HD_Texture',
    ] as const,
  },
};
```

### 2. 피부 분석 페이지

```typescript
// src/app/skin-analysis/page.tsx
'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { aiService, type SkinConcern } from '@/services/ai.service';
import { ImageUploader } from '@/components/ImageUploader';

export default function SkinAnalysisPage() {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [concerns, setConcerns] = useState<SkinConcern[]>([]);
  const [mode, setMode] = useState<'SD' | 'HD'>('SD');

  const mutation = useMutation({
    mutationFn: () => {
      if (!selectedImage) throw new Error('이미지를 선택하세요');
      if (concerns.length === 0) throw new Error('고민을 선택하세요');
      return aiService.analyzeSkin(selectedImage, concerns, mode);
    },
    onSuccess: (result) => {
      console.log('분석 결과:', result);
      alert('분석이 완료되었습니다');
    },
    onError: (error: any) => {
      alert('분석 실패: ' + error.message);
    },
  });

  const availableConcerns = aiService.SKIN_CONCERNS[mode];

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedImage(file);

    const reader = new FileReader();
    reader.onload = (event) => {
      setPreview(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleConcernChange = (concern: SkinConcern) => {
    setConcerns((prev) => {
      if (prev.includes(concern)) {
        return prev.filter((c) => c !== concern);
      } else {
        return [...prev, concern];
      }
    });
  };

  const isValidSelection = [4, 7, 14].includes(concerns.length);

  return (
    <div className="skin-analysis-page">
      <h1>피부 분석</h1>

      {/* 이미지 선택 */}
      <section>
        <h2>사진 선택</h2>
        <div className="image-input">
          <input
            type="file"
            accept="image/*"
            onChange={handleImageSelect}
          />
        </div>

        {preview && (
          <div className="preview">
            <img src={preview} alt="Selected" />
          </div>
        )}
      </section>

      {/* 모드 선택 */}
      <section>
        <h2>분석 모드</h2>
        <div className="mode-select">
          <label>
            <input
              type="radio"
              value="SD"
              checked={mode === 'SD'}
              onChange={(e) => setMode(e.target.value as 'SD' | 'HD')}
            />
            표준 (13가지 고민)
          </label>
          <label>
            <input
              type="radio"
              value="HD"
              checked={mode === 'HD'}
              onChange={(e) => setMode(e.target.value as 'SD' | 'HD')}
            />
            고급 (13가지 고민)
          </label>
        </div>
      </section>

      {/* 고민 선택 */}
      <section>
        <h2>피부 고민 선택</h2>
        <p>
          {concerns.length}개 선택됨 (필수: 4, 7, 또는 14개)
        </p>

        <div className="concerns-grid">
          {availableConcerns.map((concern) => (
            <label key={concern} className="concern-item">
              <input
                type="checkbox"
                checked={concerns.includes(concern)}
                onChange={() => handleConcernChange(concern)}
              />
              <span>
                {concern.replace('HD_', '').replace(/_/g, ' ')}
              </span>
            </label>
          ))}
        </div>

        {!isValidSelection && concerns.length > 0 && (
          <p className="warning">
            4, 7, 또는 14개를 선택해야 합니다
          </p>
        )}
      </section>

      {/* 분석 버튼 */}
      <button
        onClick={() => mutation.mutate()}
        disabled={
          !selectedImage ||
          !isValidSelection ||
          mutation.isPending
        }
        className="analyze-btn"
      >
        {mutation.isPending ? '분석 중...' : '피부 분석 시작'}
      </button>

      {mutation.data && (
        <div className="results">
          <h2>분석 결과</h2>
          <pre>{JSON.stringify(mutation.data, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
```

---

## 에러 처리

### 1. 커스텀 에러 클래스

```typescript
// src/lib/errors.ts
export class APIError extends Error {
  constructor(
    public statusCode: number,
    public fieldErrors?: Record<string, string[]>
  ) {
    super();
  }
}

export function handleAPIError(error: any): APIError {
  if (error.response?.data?.error) {
    const errorData = error.response.data.error;
    return new APIError(
      error.response.status,
      errorData.fieldErrors
    );
  }
  return new APIError(500, { general: [error.message] });
}
```

### 2. 에러 바운더리

```typescript
// src/components/ErrorBoundary.tsx
'use client';

import React, { ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="error-boundary">
            <h2>오류가 발생했습니다</h2>
            <p>{this.state.error?.message}</p>
            <button onClick={() => window.location.reload()}>
              새로고침
            </button>
          </div>
        )
      );
    }

    return this.props.children;
  }
}
```

---

## React Query 통합

### 1. Query Client 설정

```typescript
// src/lib/react-query.ts
import { QueryClient, DefaultOptions } from '@tanstack/react-query';

const queryConfig: DefaultOptions = {
  queries: {
    staleTime: 1000 * 60 * 5, // 5분
    gcTime: 1000 * 60 * 10, // 10분
    retry: 1,
    refetchOnWindowFocus: false,
  },
};

export const queryClient = new QueryClient({ defaultOptions: queryConfig });
```

### 2. 컨텍스트 제공자

```typescript
// src/providers/ReactQueryProvider.tsx
'use client';

import { QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';
import { queryClient } from '@/lib/react-query';

export function ReactQueryProvider({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
```

---

## 타입스크립트 타입 정의

### 1. 공통 타입

```typescript
// src/types/index.ts
export interface Hospital {
  id: number;
  id_uuid: string;
  id_unique: number;
  name: string;
  name_en: string;
  address_full_road: string;
  address_full_road_en: string;
  address_full_jibun: string;
  address_full_jibun_en: string;
  address_si: string;
  address_si_en: string;
  address_gu: string;
  address_gu_en: string;
  address_dong: string;
  address_dong_en: string;
  zipcode: string;
  latitude: number;
  longitude: number;
  address_detail: string;
  address_detail_en: string;
  directions_to_clinic: string;
  directions_to_clinic_en: string;
  location: number;
  imageurls: string[];
  thumbnail_url: string;
  created_at: string;
  searchkey: string;
  id_surgeries: string[];
  show: boolean;
  favorite_count: number;
}

export interface Reservation {
  id: number;
  id_user: string | null;
  id_uuid_hospital: string;
  name: string;
  english_name: string | null;
  passport_name: string | null;
  nationality: string;
  gender: string | null;
  birth_date: string | null;
  email: string;
  phone: string | null;
  phone_korea: string | null;
  preferred_date: string | null;
  preferred_time: string | null;
  visitor_count: string | null;
  reservation_headcount: string | null;
  treatment_experience: string | null;
  area_to_improve: string | null;
  consultation_request: string | null;
  additional_info: string | null;
  preferred_languages: string[];
  status_code: number;
  created_at: string;
}

export interface Review {
  id: number;
  id_uuid_hospital: string;
  user_no: number;
  rating: number;
  comment: string;
  before_image: string | null;
  after_image: string | null;
  created_at: string;
}

export interface Member {
  user_no: number;
  id_uuid: string;
  name: string;
  nickname: string;
  email: string;
  avatar: string | null;
  phone: string | null;
  birth_date: string | null;
  gender: string | null;
  nationality: string;
  created_at: string;
}
```

---

## 모범 사례

### 1. 에러 처리

```typescript
try {
  const data = await apiClient.get('/api/endpoint');
  return data;
} catch (error) {
  if (error instanceof AxiosError) {
    if (error.response?.status === 401) {
      // 인증 실패
      redirectToLogin();
    } else if (error.response?.status === 400) {
      // 검증 오류
      showValidationErrors(error.response.data);
    } else {
      // 일반 오류
      showErrorNotification(error.message);
    }
  }
  throw error;
}
```

### 2. 로딩 상태 관리

```typescript
const {
  data,
  isLoading,
  isError,
  error,
} = useQuery({
  queryKey: ['data'],
  queryFn: fetchData,
});

if (isLoading) return <LoadingSpinner />;
if (isError) return <ErrorMessage error={error} />;
return <DataDisplay data={data} />;
```

### 3. 낙관적 업데이트

```typescript
useMutation({
  mutationFn: updateData,
  onMutate: async (newData) => {
    // 이전 데이터 저장
    const previousData = queryClient.getQueryData(['data']);

    // UI 즉시 업데이트
    queryClient.setQueryData(['data'], newData);

    return { previousData };
  },
  onError: (error, newData, context) => {
    // 실패 시 이전 데이터로 복원
    queryClient.setQueryData(['data'], context?.previousData);
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['data'] });
  },
});
```

---

## 마무리

이 가이드가 API 통합에 도움이 되기를 바랍니다. 추가 질문이나 개선사항이 있으면 API 팀에 연락하세요.

**연락처**: dev@beautyplatform.com
