'use client';

import { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { useNavigation } from '@/hooks/useNavigation';
import { ArrowLeft, Plus, Package, SlidersHorizontal } from 'lucide-react';
import BeautyBoxItem from './components/BeautyBoxItem';
import BeautyBoxSection from './components/BeautyBoxSection';
import DeleteConfirmModal from './components/DeleteConfirmModal';
import DateEditModal, { DateUpdates } from './components/DateEditModal';
import SyncButton from './components/SyncButton';
import EmptyState from './components/EmptyState';
import { useBeautyBoxStorage } from './hooks/useBeautyBoxStorage';
import {
  BeautyBoxProduct,
  ProductStatus,
  getTexts,
} from './types';
import { countUrgentProducts, getTodayString } from './utils/beautybox-helpers';

// 섹션 순서 (고정)
const SECTION_ORDER: ProductStatus[] = ['in_use', 'owned', 'wishlist', 'used'];

export default function MyBeautyBoxPage() {
  const params = useParams();
  const locale = (params?.locale as string) || 'en';
  const t = getTexts(locale);
  const { navigate, goBack } = useNavigation();
  const hasFetched = useRef(false);

  // 스토리지 훅
  const {
    hasUnsavedChanges,
    pendingCount,
    addChange,
    updateLocalProducts,
    syncToServer,
    saveExpandedSections,
    getExpandedSections,
  } = useBeautyBoxStorage();

  // 상태
  const [products, setProducts] = useState<BeautyBoxProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 모달 상태
  const [deleteTarget, setDeleteTarget] = useState<BeautyBoxProduct | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [dateEditTarget, setDateEditTarget] = useState<BeautyBoxProduct | null>(null);

  // 섹션 펼침 상태
  const [expandedSections, setExpandedSections] = useState<Set<ProductStatus>>(
    new Set<ProductStatus>(['in_use', 'owned', 'wishlist'])
  );

  // 저장된 섹션 상태 로드
  useEffect(() => {
    const saved = getExpandedSections();
    if (saved && saved.length > 0) {
      setExpandedSections(new Set(saved as ProductStatus[]));
    }
  }, [getExpandedSections]);

  // 데이터 로드
  const fetchProducts = useCallback(async () => {
    try {
      const response = await fetch('/api/skincare/my-beauty-box');
      const result = await response.json();

      if (!result.success) {
        if (response.status === 401) {
          navigate('/skincare-auth/login', { replace: true });
          return;
        }
        throw new Error(result.message || 'Failed to fetch');
      }

      const items = result.items || [];
      setProducts(items);
      updateLocalProducts(items);
    } catch (err) {
      console.error('[MyBeautyBox] Error:', err);
      setError(t.error);
    } finally {
      setLoading(false);
    }
  }, [navigate, t.error, updateLocalProducts]);

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;
    fetchProducts();
  }, [fetchProducts]);

  // 섹션 펼침 토글
  const handleSectionToggle = useCallback((status: ProductStatus, expanded: boolean) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (expanded) {
        next.add(status);
      } else {
        next.delete(status);
      }
      saveExpandedSections(Array.from(next));
      return next;
    });
  }, [saveExpandedSections]);

  // 상태 변경 (스와이프 액션)
  const handleStatusChange = useCallback((product: BeautyBoxProduct, newStatus: ProductStatus) => {
    const today = getTodayString();
    const updates: Partial<BeautyBoxProduct> = { status: newStatus };

    // 상태별 날짜 자동 설정
    if (newStatus === 'in_use' && !product.opened_at) {
      updates.opened_at = today;
    }
    if (newStatus === 'used' && !product.finished_at) {
      updates.finished_at = today;
    }

    // 로컬 상태 업데이트
    setProducts((prev) =>
      prev.map((p) => (p.id === product.id ? { ...p, ...updates } : p))
    );

    // pending change 추가
    addChange({
      type: 'update',
      recordId: product.id,
      changes: updates,
    });
  }, [addChange]);

  // 삭제
  const handleDelete = useCallback(async () => {
    if (!deleteTarget) return;

    setIsDeleting(true);
    try {
      // 로컬에서 즉시 제거
      setProducts((prev) => prev.filter((p) => p.id !== deleteTarget.id));

      // pending change 추가
      addChange({
        type: 'delete',
        recordId: deleteTarget.id,
      });
    } finally {
      setIsDeleting(false);
      setDeleteTarget(null);
    }
  }, [deleteTarget, addChange]);

  // 날짜 편집 저장
  const handleDateSave = useCallback((dates: DateUpdates) => {
    if (!dateEditTarget) return;

    const updates: Partial<BeautyBoxProduct> = {};
    if (dates.opened_at !== undefined) updates.opened_at = dates.opened_at;
    if (dates.expiry_date !== undefined) updates.expiry_date = dates.expiry_date;
    if (dates.use_by_date !== undefined) updates.use_by_date = dates.use_by_date;
    if (dates.finished_at !== undefined) updates.finished_at = dates.finished_at;

    // 로컬 상태 업데이트
    setProducts((prev) =>
      prev.map((p) => (p.id === dateEditTarget.id ? { ...p, ...updates } : p))
    );

    // pending change 추가
    addChange({
      type: 'update',
      recordId: dateEditTarget.id,
      changes: updates,
    });
  }, [dateEditTarget, addChange]);

  // 다시 담기 (used → 새 wishlist)
  const handleAddAgain = useCallback(async (product: BeautyBoxProduct) => {
    try {
      const response = await fetch('/api/skincare/my-beauty-box', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_ids: [product.product_id],
          status: 'wishlist',
        }),
      });

      const result = await response.json();
      if (result.success) {
        // 새로고침해서 새 아이템 가져오기
        fetchProducts();
      }
    } catch (err) {
      console.error('[MyBeautyBox] Add again error:', err);
    }
  }, [fetchProducts]);

  // 섹션별 데이터 그룹화
  const sections = useMemo(() => {
    const grouped: Record<ProductStatus, BeautyBoxProduct[]> = {
      in_use: [],
      owned: [],
      wishlist: [],
      used: [],
    };

    products.forEach((product) => {
      const status = product.status || 'wishlist';
      if (grouped[status]) {
        grouped[status].push(product);
      }
    });

    return SECTION_ORDER.map((status) => ({
      status,
      products: grouped[status],
      urgentCount: countUrgentProducts(grouped[status]),
    }));
  }, [products]);

  // 로딩 상태
  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4" />
          <p className="text-gray-600">{t.loading}</p>
        </div>
      </div>
    );
  }

  // 에러 상태
  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  const totalCount = products.length;

  return (
    <>
      {/* 헤더 */}
      <div className="sticky top-0 z-20 bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={goBack}
              className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-700" />
            </button>
            <div className="flex items-center gap-2">
              <Package className="w-5 h-5 text-pink-500" />
              <h1 className="text-lg font-bold text-gray-900">{t.title}</h1>
            </div>
          </div>

          {/* 필터/정렬 버튼 (추후 구현) */}
          <button
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            disabled
          >
            <SlidersHorizontal className="w-5 h-5 text-gray-400" />
          </button>
        </div>
      </div>

      {/* 콘텐츠 */}
      <div className="flex-1 overflow-y-auto pb-32">
        {totalCount === 0 ? (
          <EmptyState
            locale={locale}
            onAddClick={() => navigate('/skincare-products')}
          />
        ) : (
          <>
            {/* 제품 수 */}
            <div className="px-4 py-2.5 bg-gray-50 border-b border-gray-100">
              <p className="text-sm text-gray-600">
                {t.total.replace('{count}', String(totalCount))}
              </p>
            </div>

            {/* 섹션별 리스트 */}
            {sections.map(({ status, products: sectionProducts, urgentCount }) => (
              <BeautyBoxSection
                key={status}
                status={status}
                count={sectionProducts.length}
                urgentCount={urgentCount}
                expanded={expandedSections.has(status)}
                onToggle={(expanded) => handleSectionToggle(status, expanded)}
                locale={locale}
              >
                {sectionProducts.map((product) => (
                  <BeautyBoxItem
                    key={product.id}
                    product={product}
                    locale={locale}
                    onDelete={() => setDeleteTarget(product)}
                    onStatusChange={(newStatus) => handleStatusChange(product, newStatus)}
                    onDateEdit={() => setDateEditTarget(product)}
                    onAddAgain={status === 'used' ? () => handleAddAgain(product) : undefined}
                  />
                ))}
              </BeautyBoxSection>
            ))}
          </>
        )}
      </div>

      {/* 하단 고정 버튼 */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 safe-area-bottom z-30">
        <button
          onClick={() => navigate('/skincare-products')}
          className="w-full py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-xl font-semibold flex items-center justify-center gap-2 shadow-lg hover:opacity-90 transition-opacity"
        >
          <Plus className="w-5 h-5" />
          {t.addProducts}
        </button>
      </div>

      {/* 저장 버튼 */}
      <SyncButton
        pendingCount={pendingCount}
        hasUnsavedChanges={hasUnsavedChanges}
        onSync={syncToServer}
        locale={locale}
      />

      {/* 삭제 확인 모달 */}
      {deleteTarget && (
        <DeleteConfirmModal
          locale={locale}
          productName={deleteTarget.product_name}
          isDeleting={isDeleting}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      {/* 날짜 편집 모달 */}
      {dateEditTarget && (
        <DateEditModal
          product={dateEditTarget}
          locale={locale}
          onSave={handleDateSave}
          onClose={() => setDateEditTarget(null)}
        />
      )}
    </>
  );
}
