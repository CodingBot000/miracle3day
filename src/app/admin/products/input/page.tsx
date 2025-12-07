'use client';

import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { productAPI, formatApiError, isApiSuccess } from '@/lib/admin/api-client';
import ProductPreview from '@/app/admin/products/input/ProductPreview';
import ImageOrderModal from '@/components/admin/ImageOrderModal';
import { FormModeProvider } from '@/contexts/admin/FormModeContext';

interface ProductOption {
  option_name_ko: string;
  option_name_en: string;
  original_price: number | null;
  selling_price: number;
  description_ko: string;
  description_en: string;
  display_order: number;
}

export default function ProductInputPage() {
  const { user } = useAuth();
  const router = useRouter();

  // 미리보기 상태
  const [isPreviewOpen, setIsPreviewOpen] = useState(true);

  // 제출 상태
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 이미지 순서변경 모달 상태
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);

  // 폼 데이터
  const [formData, setFormData] = useState({
    name_ko: '',
    name_en: '',
    regular_price: 0,
    sale_price: 0,
    price_notice_enabled: false,
    event_title_ko: '',
    event_title_en: '',
    event_desc_ko: '',
    event_desc_en: '',
    event_images: [] as string[],
    event_start_date: '',
    event_end_date: '',
    event_start_immediate: true,
    event_no_end_date: true,
    tags: [] as string[],
    options: [] as ProductOption[]
  });

  // 인증 체크
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">로그인이 필요합니다...</p>
      </div>
    );
  }

  if (!user.id_uuid_hospital) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-red-500">병원 정보가 없습니다.</p>
      </div>
    );
  }

  // 폼 필드 업데이트
  const updateField = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // 옵션 추가
  const addOption = () => {
    setFormData(prev => ({
      ...prev,
      options: [
        ...prev.options,
        {
          option_name_ko: '',
          option_name_en: '',
          original_price: null,
          selling_price: 0,
          description_ko: '',
          description_en: '',
          display_order: prev.options.length
        }
      ]
    }));
  };

  // 옵션 삭제
  const removeOption = (index: number) => {
    setFormData(prev => ({
      ...prev,
      options: prev.options.filter((_, i) => i !== index)
    }));
  };

  // 옵션 업데이트
  const updateOption = (index: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      options: prev.options.map((opt, i) =>
        i === index ? { ...opt, [field]: value } : opt
      )
    }));
  };

  // 할인율 계산
  const calculateDiscountRate = (original: number | null, selling: number): number | null => {
    if (!original || !selling || original <= selling) {
      return null;
    }
    return Math.round(((original - selling) / original) * 100);
  };

  // 날짜 포맷팅 (YYYY.MM.DD)
  const formatDateInput = (value: string): string => {
    const numbers = value.replace(/[^\d]/g, '');

    if (numbers.length <= 4) {
      return numbers;
    } else if (numbers.length <= 6) {
      return `${numbers.slice(0, 4)}.${numbers.slice(4)}`;
    } else {
      return `${numbers.slice(0, 4)}.${numbers.slice(4, 6)}.${numbers.slice(6, 8)}`;
    }
  };

  // 이미지 업로드 핸들러 (임시 - S3 업로드 로직 필요)
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const currentImages = formData.event_images.length;
    const remainingSlots = 10 - currentImages;

    if (files.length > remainingSlots) {
      alert(`이미지는 최대 10개까지 업로드 가능합니다. (현재: ${currentImages}개)`);
      return;
    }

    try {
      const uploadedUrls: string[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        // 파일명 생성: product_image_{timestamp}_{random}.{ext}
        const timestamp = Date.now();
        const randomStr = Math.random().toString(36).substring(2, 8);
        const ext = file.name.split('.').pop();
        const fileName = `product_image_${timestamp}_${randomStr}.${ext}`;

        // S3 키 생성: images/hospitalimg/{uuid}/products/{fileName}
        const key = `images/hospitalimg/${user.id_uuid_hospital}/products/${fileName}`;

        // FormData 생성
        const uploadFormData = new FormData();
        uploadFormData.append('file', file);
        uploadFormData.append('key', key);
        uploadFormData.append('contentType', file.type);

        // S3 업로드 API 호출
        const response = await fetch('/api/admin/storage/upload', {
          method: 'POST',
          body: uploadFormData
        });

        const result = await response.json();

        if (result.success) {
          uploadedUrls.push(result.url);
        } else {
          throw new Error(result.error || '업로드 실패');
        }
      }

      // 업로드된 URL들을 폼 데이터에 추가
      updateField('event_images', [...formData.event_images, ...uploadedUrls]);
      alert(`✅ ${uploadedUrls.length}개 이미지 업로드 완료!`);

    } catch (error) {
      console.error('이미지 업로드 오류:', error);
      alert('❌ 이미지 업로드 중 오류가 발생했습니다: ' + (error instanceof Error ? error.message : '알 수 없는 오류'));
    }
  };

  // 이미지 삭제
  const removeImage = (index: number) => {
    updateField('event_images', formData.event_images.filter((_, i) => i !== index));
  };

  // 이미지 순서변경 완료 핸들러 (onComplete - 완료 버튼 클릭 시에만 호출됨)
  const handleOrderModalComplete = (newOrder: string[]) => {
    console.log('=== 이미지 순서변경 완료 ===');
    console.log('변경 전 순서:', formData.event_images);
    console.log('변경 후 순서:', newOrder);
    console.log('배열 길이 - 변경 전:', formData.event_images.length, '변경 후:', newOrder.length);

    updateField('event_images', newOrder);
    setIsOrderModalOpen(false);

    console.log('✅ formData.event_images 업데이트 완료');
  };

  // 이미지 순서변경 취소 핸들러 (onCancel - 취소 버튼 클릭 시 변경사항 반영 안함)
  const handleOrderModalCancel = () => {
    console.log('❌ 이미지 순서변경 취소 - 변경사항 반영 안함');
    setIsOrderModalOpen(false);
  };

  // 폼 제출
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.name_ko || !formData.name_en) {
      alert('상품명(한국어, 영어)은 필수입니다.');
      return;
    }

    if (formData.regular_price <= 0 || formData.sale_price <= 0) {
      alert('정상가와 할인가는 0보다 커야 합니다.');
      return;
    }

    if (formData.sale_price > formData.regular_price) {
      alert('할인가는 정상가보다 클 수 없습니다.');
      return;
    }

    setIsSubmitting(true);

    try {
      const dataToSend = {
        id_uuid_hospital: user.id_uuid_hospital,
        current_user_uid: user.id?.toString() || '',
        ...formData
      };

      const result = await productAPI.create(dataToSend);

      if (isApiSuccess(result)) {
        alert('✅ 상품이 성공적으로 등록되었습니다!');
        router.push('/admin'); // 또는 상품 목록 페이지
      } else {
        alert('❌ 등록 실패: ' + (result.error || '알 수 없는 오류'));
      }
    } catch (error) {
      alert('❌ 오류: ' + formatApiError(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <FormModeProvider defaultMode="edit">
      <div className="flex h-screen">
        {/* 왼쪽: 미리보기 */}
        <ProductPreview
          data={formData}
          isOpen={isPreviewOpen}
          onToggle={() => setIsPreviewOpen(!isPreviewOpen)}
        onRefresh={() => {
          // 강제 리렌더링
          setFormData({ ...formData });
        }}
      />

      {/* 오른쪽: 입력 폼 */}
      <div className={`${isPreviewOpen ? 'w-1/2' : 'w-full'} overflow-y-auto`}>
        <form onSubmit={handleSubmit} className="p-8 max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">시술 상품 입력</h1>

          {/* 섹션 1: 시술 상품 대표이름 */}
          <section className="mb-8 p-6 bg-white rounded-lg shadow">
            <h2 className="text-xl font-bold mb-4">1. 시술 상품 대표이름</h2>

            <div className="mb-4">
              <label className="block font-medium mb-2">
                상품명 (한국어) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.name_ko}
                onChange={(e) => updateField('name_ko', e.target.value)}
                placeholder="예: 피부 레이저 토닝"
                className="w-full border rounded px-3 py-2"
              />
            </div>

            <div className="mb-4">
              <label className="block font-medium mb-2">
                상품명 (영어) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.name_en}
                onChange={(e) => updateField('name_en', e.target.value)}
                placeholder="예: Laser Toning"
                className="w-full border rounded px-3 py-2"
              />
            </div>

            <p className="text-sm text-gray-500 bg-blue-50 p-3 rounded">
              💡 안내: 영문은 가급적 한국어로만 이해 가능한 고유명은 사용을 자제부탁드립니다<br />
              예시) 피지쏙 → Sebum Extraction, 버블 쫀쫀 → Bubble Tightening
            </p>
          </section>

          {/* 섹션 2: 정상가 / 할인가 */}
          <section className="mb-8 p-6 bg-white rounded-lg shadow">
            <h2 className="text-xl font-bold mb-4">2. 정상가 / 할인가</h2>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block font-medium mb-2">
                  정상가 <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={formData.regular_price}
                  onChange={(e) => updateField('regular_price', parseFloat(e.target.value))}
                  className="w-full border rounded px-3 py-2"
                />
              </div>

              <div>
                <label className="block font-medium mb-2">
                  할인가 <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={formData.sale_price}
                  onChange={(e) => updateField('sale_price', parseFloat(e.target.value))}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
            </div>

            <p className="text-sm text-gray-500 bg-blue-50 p-3 rounded">
              💡 안내: 외화표기가 될때는 국가별 표기는 자동으로 최신환율을 기반으로 환산되어 보여질것입니다.
            </p>
          </section>

          {/* 섹션 3: 가격 변동 안내 */}
          <section className="mb-8 p-6 bg-white rounded-lg shadow">
            <h2 className="text-xl font-bold mb-4">3. 가격 변동 안내</h2>

            <label className="flex items-start gap-2 mb-4">
              <input
                type="checkbox"
                checked={formData.price_notice_enabled}
                onChange={(e) => updateField('price_notice_enabled', e.target.checked)}
                className="mt-1"
              />
              <span>
                시술 상황에 따라 가격이 소폭 변경될 수 있습니다. 자세한사항은 상담후 확인하시기 바랍니다.
              </span>
            </label>

            <p className="text-sm text-gray-500 bg-blue-50 p-3 rounded">
              💡 안내: 10%내외 변화는 신뢰도를 위해 굳이 표기하지 않는것을 권장하며
              이벤트를 항시 관리하기 어려우시고 가격변동이 심한 시술상품에 한해서 체크를 권장합니다
            </p>
          </section>

          {/* 섹션 4: 이벤트 옵션 입력 */}
          <section className="mb-8 p-6 bg-white rounded-lg shadow">
            <h2 className="text-xl font-bold mb-4">4. 이벤트 옵션 입력</h2>

            <div className="space-y-4 mb-4">
              {formData.options.map((option, index) => {
                const discountRate = calculateDiscountRate(
                  option.original_price,
                  option.selling_price
                );

                return (
                  <div key={index} className="border p-4 rounded bg-gray-50">
                    <div className="flex justify-between mb-3">
                      <h4 className="font-semibold">옵션 #{index + 1}</h4>
                      <button
                        type="button"
                        onClick={() => removeOption(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        [-] 삭제
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          옵션명 (한국어) <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={option.option_name_ko}
                          onChange={(e) => updateOption(index, 'option_name_ko', e.target.value)}
                          className="w-full border rounded px-2 py-1"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-1">
                          옵션명 (영어) <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={option.option_name_en}
                          onChange={(e) => updateOption(index, 'option_name_en', e.target.value)}
                          className="w-full border rounded px-2 py-1"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <div>
                        <label className="block text-sm font-medium mb-1">원가</label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={option.original_price || ''}
                          onChange={(e) =>
                            updateOption(
                              index,
                              'original_price',
                              e.target.value ? parseFloat(e.target.value) : null
                            )
                          }
                          className="w-full border rounded px-2 py-1"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-1">
                          판매가 <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          required
                          min="0"
                          step="0.01"
                          value={option.selling_price}
                          onChange={(e) =>
                            updateOption(index, 'selling_price', parseFloat(e.target.value))
                          }
                          className="w-full border rounded px-2 py-1"
                        />
                      </div>
                    </div>

                    {discountRate && (
                      <p className="text-red-500 font-bold mb-2">{discountRate}% 할인</p>
                    )}

                    <p className="text-xs text-gray-500 mb-3 bg-blue-50 p-2 rounded">
                      💡 안내: 할인이 없다면 원가는 비워두거나 판매가와 동일하게 넣으시면 됩니다.
                    </p>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium mb-1">옵션 설명 (한국어)</label>
                        <textarea
                          value={option.description_ko}
                          onChange={(e) => updateOption(index, 'description_ko', e.target.value)}
                          rows={2}
                          className="w-full border rounded px-2 py-1"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-1">옵션 설명 (영어)</label>
                        <textarea
                          value={option.description_en}
                          onChange={(e) => updateOption(index, 'description_en', e.target.value)}
                          rows={2}
                          className="w-full border rounded px-2 py-1"
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              type="button"
              onClick={addOption}
              className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
            >
              [+] 옵션 추가
            </button>
          </section>

          {/* 섹션 5: 이벤트 설명 */}
          <section className="mb-8 p-6 bg-white rounded-lg shadow">
            <h2 className="text-xl font-bold mb-4">5. 이벤트 설명</h2>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block font-medium mb-2">타이틀 (한국어)</label>
                <input
                  type="text"
                  value={formData.event_title_ko}
                  onChange={(e) => updateField('event_title_ko', e.target.value)}
                  placeholder="굵은 글씨로 표기됩니다"
                  className="w-full border rounded px-3 py-2"
                />
              </div>

              <div>
                <label className="block font-medium mb-2">타이틀 (영어)</label>
                <input
                  type="text"
                  value={formData.event_title_en}
                  onChange={(e) => updateField('event_title_en', e.target.value)}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block font-medium mb-2">설명 (한국어)</label>
                <textarea
                  value={formData.event_desc_ko}
                  onChange={(e) => updateField('event_desc_ko', e.target.value)}
                  rows={4}
                  className="w-full border rounded px-3 py-2"
                />
              </div>

              <div>
                <label className="block font-medium mb-2">설명 (영어)</label>
                <textarea
                  value={formData.event_desc_en}
                  onChange={(e) => updateField('event_desc_en', e.target.value)}
                  rows={4}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
            </div>

            <p className="text-sm text-gray-500 bg-blue-50 p-3 rounded">
              💡 안내: 타이틀은 굵은 글씨로 표기됩니다. 필요하시면 구분해서 작성하시면됩니다
            </p>
          </section>

          {/* 섹션 6: 이벤트 이미지 업로드 */}
          <section className="mb-8 p-6 bg-white rounded-lg shadow">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">6. 이벤트 이미지 업로드</h2>
              {formData.event_images.length > 0 && (
                <button
                  type="button"
                  onClick={() => setIsOrderModalOpen(true)}
                  className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 transition-colors"
                >
                  순서변경
                </button>
              )}
            </div>

            <div className="border-2 border-dashed p-4 rounded mb-4">
              <label className="block font-medium mb-2">이벤트 이미지 (최대 10개)</label>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className="w-full"
              />

              {formData.event_images.length > 0 && (
                <div className="grid grid-cols-5 gap-2 mt-4">
                  {formData.event_images.map((img, index) => (
                    <div key={index} className="relative">
                      <img src={img} alt={`이미지 ${index + 1}`} className="w-full h-24 object-cover rounded" />
                      <span className="absolute top-0 left-0 bg-black text-white px-2 text-xs">
                        {index + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-0 right-0 bg-red-500 text-white w-6 h-6 text-xs"
                      >
                        X
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <p className="text-sm text-gray-500 bg-blue-50 p-3 rounded">
              💡 안내: 업로드하신 순서대로 이어붙여서 나옵니다. 한개 통이미지면 하나만 넣으시면됩니다.
            </p>
          </section>

          {/* 섹션 7: 이벤트 기간 */}
          <section className="mb-8 p-6 bg-white rounded-lg shadow">
            <h2 className="text-xl font-bold mb-4">7. 이벤트 기간</h2>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block font-medium mb-2">시작일</label>
                <input
                  type="text"
                  placeholder="YYYY.MM.DD"
                  disabled={formData.event_start_immediate}
                  value={formData.event_start_date}
                  onChange={(e) => updateField('event_start_date', formatDateInput(e.target.value))}
                  className="w-full border rounded px-3 py-2 disabled:bg-gray-100"
                />
                <label className="flex items-center gap-2 mt-2">
                  <input
                    type="checkbox"
                    checked={formData.event_start_immediate}
                    onChange={(e) => updateField('event_start_immediate', e.target.checked)}
                  />
                  지금 게시
                </label>
              </div>

              <div>
                <label className="block font-medium mb-2">종료일</label>
                <input
                  type="text"
                  placeholder="YYYY.MM.DD"
                  disabled={formData.event_no_end_date}
                  value={formData.event_end_date}
                  onChange={(e) => updateField('event_end_date', formatDateInput(e.target.value))}
                  className="w-full border rounded px-3 py-2 disabled:bg-gray-100"
                />
                <label className="flex items-center gap-2 mt-2">
                  <input
                    type="checkbox"
                    checked={formData.event_no_end_date}
                    onChange={(e) => updateField('event_no_end_date', e.target.checked)}
                  />
                  종료일 없음
                </label>
              </div>
            </div>

            <p className="text-sm text-gray-500 bg-blue-50 p-3 rounded">
              💡 안내: 이벤트기간은 입력박스도 모두 입력하지않으시고, 체크박스도 모두 체크하지않은 기본상태로 두시면
              자동으로 당장 게시하고 종료일 없는것으로 처리됩니다.
            </p>
          </section>

          {/* 제출 버튼 */}
          <div className="flex gap-4 mt-8">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
            >
              {isSubmitting ? '저장 중...' : '저장'}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 bg-gray-300 py-3 px-6 rounded-lg font-semibold hover:bg-gray-400 transition-colors"
            >
              취소
            </button>
          </div>
        </form>
      </div>

      {/* 이미지 순서변경 모달 */}
      {isOrderModalOpen && (
        <ImageOrderModal
          images={formData.event_images}
          onCancel={handleOrderModalCancel}
          onComplete={handleOrderModalComplete}
        />
      )}
      </div>
    </FormModeProvider>
  );
}
