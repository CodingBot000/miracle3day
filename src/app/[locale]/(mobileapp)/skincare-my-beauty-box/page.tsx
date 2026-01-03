'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { useNavigation } from '@/hooks/useNavigation';
import { ArrowLeft, Plus, Package } from 'lucide-react';
import BeautyBoxItem from './components/BeautyBoxItem';
import DeleteConfirmModal from './components/DeleteConfirmModal';
import EmptyState from './components/EmptyState';

interface BeautyBoxProduct {
  id: number;
  product_id: number;
  product_name: string;
  brand_name: string;
  price_krw: number | null;
  image_url: string | null;
  volume_text: string | null;
  avg_rating: number | null;
  review_count: number | null;
  added_at: string;
}

const text = {
  ko: {
    title: 'My Beauty Box',
    total: '총 {count}개 제품',
    addProducts: '제품 추가하기',
    deleteTitle: '제품 삭제',
    deleteMessage: '이 제품을 My Beauty Box에서 삭제하시겠습니까?',
    cancel: '취소',
    delete: '삭제',
    loading: '로딩 중...',
    error: '데이터를 불러오는데 실패했습니다',
  },
  en: {
    title: 'My Beauty Box',
    total: '{count} products',
    addProducts: 'Add Products',
    deleteTitle: 'Delete Product',
    deleteMessage: 'Remove this product from My Beauty Box?',
    cancel: 'Cancel',
    delete: 'Delete',
    loading: 'Loading...',
    error: 'Failed to load data',
  },
};

export default function MyBeautyBoxPage() {
  const params = useParams();
  const locale = (params?.locale as string) || 'en';
  const t = text[locale as keyof typeof text] || text.en;
  const { navigate, goBack } = useNavigation();
  const hasFetched = useRef(false);

  const [products, setProducts] = useState<BeautyBoxProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<BeautyBoxProduct | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

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

      setProducts(result.items || []);
    } catch (err) {
      console.error('[MyBeautyBox] Error:', err);
      setError(t.error);
    } finally {
      setLoading(false);
    }
  }, [navigate, t.error]);

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;
    fetchProducts();
  }, [fetchProducts]);

  const handleDelete = async () => {
    if (!deleteTarget) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/skincare/my-beauty-box/${deleteTarget.id}`, {
        method: 'DELETE',
      });
      const result = await response.json();

      if (result.success) {
        setProducts((prev) => prev.filter((p) => p.id !== deleteTarget.id));
      }
    } catch (err) {
      console.error('[MyBeautyBox] Delete error:', err);
    } finally {
      setIsDeleting(false);
      setDeleteTarget(null);
    }
  };

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

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* 헤더 */}
      <div className="flex-shrink-0 bg-white border-b border-gray-200 px-4 py-3">
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
      </div>

      {/* 콘텐츠 */}
      <div className="flex-1 overflow-y-auto pb-24">
        {products.length === 0 ? (
          <EmptyState
            locale={locale}
            onAddClick={() => navigate('/skincare-products')}
          />
        ) : (
          <>
            {/* 제품 수 */}
            <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
              <p className="text-sm text-gray-600">
                {t.total.replace('{count}', products.length.toString())}
              </p>
            </div>

            {/* 제품 리스트 */}
            <div className="divide-y divide-gray-100">
              {products.map((product) => (
                <BeautyBoxItem
                  key={product.id}
                  product={product}
                  locale={locale}
                  onDelete={() => setDeleteTarget(product)}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* 하단 고정 버튼 */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 safe-area-bottom">
        <button
          onClick={() => navigate('/skincare-products')}
          className="w-full py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-xl font-semibold flex items-center justify-center gap-2 shadow-lg hover:opacity-90 transition-opacity"
        >
          <Plus className="w-5 h-5" />
          {t.addProducts}
        </button>
      </div>

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
    </>
  );
}
