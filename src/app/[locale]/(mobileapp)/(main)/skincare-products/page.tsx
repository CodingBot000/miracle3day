'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { useNavigation } from '@/hooks/useNavigation';
import { ArrowLeft, Package } from 'lucide-react';
import SearchInput from './components/SearchInput';
import FilterTabs, { FilterTabType } from './components/FilterTabs';
import CategoryFilter from './components/CategoryFilter';
import ChipFilter from './components/ChipFilter';
import ProductCard from './components/ProductCard';
import BottomSaveBar from './components/BottomSaveBar';

interface Product {
  id: number;
  product_name: string;
  brand_name: string;
  price_krw: number | null;
  volume_text: string | null;
  image_url: string | null;
  avg_rating: number | null;
  review_count: number | null;
  main_category: string | null;
  category1: string | null;
  category2: string | null;
  rank: number | null;
  theme_name: string | null;
}

interface SubCategory {
  value: string;
  label_ko: string;
  count: number;
}

interface CategoryData {
  label_ko: string;
  count: number;
  subcategories: SubCategory[];
}

interface FilterOption {
  value: string;
  label_ko: string;
  count: number;
}

interface FiltersData {
  categories: Record<string, CategoryData>;
  skin_concerns: FilterOption[];
  age_groups: FilterOption[];
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasMore: boolean;
}

const text = {
  ko: {
    title: '제품 탐색',
    myBox: 'My Box',
    searchPlaceholder: '제품명, 브랜드, 성분 검색',
    all: '전체',
    loading: '로딩 중...',
    noProducts: '검색 결과가 없습니다',
    results: '검색결과: {count}개',
    mainCategory: '대분류',
    subCategory: '세부분류',
  },
  en: {
    title: 'Browse Products',
    myBox: 'My Box',
    searchPlaceholder: 'Search products, brands, ingredients',
    all: 'All',
    loading: 'Loading...',
    noProducts: 'No products found',
    results: 'Results: {count}',
    mainCategory: 'Category',
    subCategory: 'Subcategory',
  },
};

export default function ProductsPage() {
  const params = useParams();
  const locale = (params?.locale as string) || 'en';
  const t = text[locale as keyof typeof text] || text.en;
  const { navigate, goBack } = useNavigation();

  // 필터 데이터
  const [filters, setFilters] = useState<FiltersData | null>(null);

  // 상태
  const [products, setProducts] = useState<Product[]>([]);
  const [savedProductIds, setSavedProductIds] = useState<Set<number>>(new Set());
  const [selectedProducts, setSelectedProducts] = useState<Set<number>>(new Set());
  const [savedCount, setSavedCount] = useState(0);

  // 필터/검색
  const [activeTab, setActiveTab] = useState<FilterTabType>('category');
  const [mainCategory, setMainCategory] = useState<string | null>(null);
  const [subCategory, setSubCategory] = useState<string | null>(null);
  const [skinConcern, setSkinConcern] = useState<string | null>(null);
  const [ageGroup, setAgeGroup] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // 페이징
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  // Refs
  const hasFetched = useRef(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // 디바운스 검색
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  // 필터 옵션 조회
  const fetchFilters = useCallback(async () => {
    try {
      const response = await fetch('/api/skincare/filters', {
        credentials: 'include',
      });
      const result = await response.json();
      console.log('[Products] Filters API response:', result);
      if (result.success) {
        console.log('[Products] Categories:', result.categories);
        console.log('[Products] Category keys:', Object.keys(result.categories || {}));
        console.log('[Products] Skin concerns:', result.skin_concerns);
        console.log('[Products] Age groups:', result.age_groups);
        setFilters({
          categories: result.categories || {},
          skin_concerns: result.skin_concerns || [],
          age_groups: result.age_groups || [],
        });
      }
    } catch (err) {
      console.error('[Products] Filters error:', err);
    }
  }, []);

  // 저장된 제품 ID 조회
  const fetchSavedProducts = useCallback(async () => {
    try {
      const response = await fetch('/api/skincare/my-beauty-box', {
        credentials: 'include',
      });
      const result = await response.json();
      if (result.success) {
        const ids = new Set<number>((result.items || []).map((item: { product_id: number }) => item.product_id));
        setSavedProductIds(ids);
        setSavedCount(result.total || 0);
      }
    } catch (err) {
      console.error('[Products] Saved products error:', err);
    }
  }, []);

  // 제품 조회
  const fetchProducts = useCallback(async (page: number = 1, append: boolean = false) => {
    try {
      if (page === 1) setLoading(true);
      else setLoadingMore(true);

      const queryParams = new URLSearchParams();
      queryParams.set('filter_type', activeTab);
      queryParams.set('page', page.toString());
      queryParams.set('limit', '20');

      if (debouncedSearch) {
        queryParams.set('search', debouncedSearch);
      }

      // 탭별 필터 파라미터
      if (activeTab === 'category') {
        if (mainCategory) queryParams.set('main_category', mainCategory);
        if (subCategory) queryParams.set('sub_category', subCategory);
      } else if (activeTab === 'skin_concern') {
        if (skinConcern) queryParams.set('theme_name', skinConcern);
      } else if (activeTab === 'age') {
        if (ageGroup) queryParams.set('theme_name', ageGroup);
      }

      const response = await fetch(`/api/skincare/products?${queryParams}`, {
        credentials: 'include',
      });
      const result = await response.json();

      if (result.success) {
        if (append) {
          setProducts((prev) => [...prev, ...(result.products || [])]);
        } else {
          setProducts(result.products || []);
        }
        setPagination(result.pagination);
      }
    } catch (err) {
      console.error('[Products] Fetch error:', err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [activeTab, mainCategory, subCategory, skinConcern, ageGroup, debouncedSearch]);

  // 초기 로드
  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;
    fetchFilters();
    fetchSavedProducts();
  }, [fetchFilters, fetchSavedProducts]);

  // 필터/검색 변경 시 재조회
  useEffect(() => {
    fetchProducts(1, false);
  }, [fetchProducts]);

  // 무한스크롤
  useEffect(() => {
    if (!loadMoreRef.current) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && pagination && pagination.hasMore && !loadingMore) {
          fetchProducts(pagination.page + 1, true);
        }
      },
      { threshold: 0.1 }
    );

    observerRef.current.observe(loadMoreRef.current);

    return () => {
      observerRef.current?.disconnect();
    };
  }, [pagination, loadingMore, fetchProducts]);

  // 탭 변경 시 필터 초기화
  const handleTabChange = (tab: FilterTabType) => {
    setActiveTab(tab);
    setMainCategory(null);
    setSubCategory(null);
    setSkinConcern(null);
    setAgeGroup(null);
  };

  // mainCategory 변경 시 subCategory 초기화
  const handleMainCategoryChange = (value: string | null) => {
    setMainCategory(value);
    setSubCategory(null);
  };

  // 제품 선택 토글
  const toggleProduct = (productId: number) => {
    setSelectedProducts((prev) => {
      const next = new Set(prev);
      if (next.has(productId)) {
        next.delete(productId);
      } else {
        next.add(productId);
      }
      return next;
    });
  };

  // 저장
  const handleSave = async () => {
    if (selectedProducts.size === 0) return;

    try {
      const response = await fetch('/api/skincare/my-beauty-box', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_ids: Array.from(selectedProducts) }),
        credentials: 'include',
      });
      const result = await response.json();

      if (result.success) {
        setSavedProductIds((prev) => {
          const next = new Set(prev);
          selectedProducts.forEach((id) => next.add(id));
          return next;
        });
        setSavedCount((prev) => prev + result.added);
        setSelectedProducts(new Set());
      }
    } catch (err) {
      console.error('[Products] Save error:', err);
    }
  };

  // 현재 mainCategory에 해당하는 subcategories
  const currentSubcategories = mainCategory && filters?.categories[mainCategory]
    ? filters.categories[mainCategory].subcategories
    : [];

  // 카테고리 목록 (드롭다운용)
  const categoryList = filters
    ? Object.entries(filters.categories).map(([key, value]) => ({
        mainCategory: key,
        label_ko: value.label_ko,
        count: value.count,
        subcategories: value.subcategories,
      }))
    : [];

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
            <h1 className="text-lg font-bold text-gray-900">{t.title}</h1>
          </div>
          <button
            onClick={() => navigate('/skincare-my-beauty-box')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-pink-50 text-pink-600 rounded-full text-sm font-medium hover:bg-pink-100 transition-colors"
          >
            <Package className="w-4 h-4" />
            {t.myBox} ({savedCount})
          </button>
        </div>
      </div>

      {/* 검색 */}
      <div className="flex-shrink-0 bg-white px-4 py-3 border-b border-gray-100">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder={t.searchPlaceholder}
        />
      </div>

      {/* 필터 탭 */}
      <div className="flex-shrink-0 bg-white px-4 py-3 border-b border-gray-100">
        <FilterTabs
          activeTab={activeTab}
          onTabChange={handleTabChange}
          locale={locale}
        />
      </div>

      {/* 탭별 필터 옵션 */}
      <div className="flex-shrink-0 bg-white px-4 py-3 border-b border-gray-200">
        {activeTab === 'category' && (
          <CategoryFilter
            categories={categoryList}
            subcategories={currentSubcategories}
            mainCategory={mainCategory}
            subCategory={subCategory}
            onMainCategoryChange={handleMainCategoryChange}
            onSubCategoryChange={setSubCategory}
            allLabel={t.all}
            locale={locale}
          />
        )}

        {activeTab === 'skin_concern' && filters && (
          <ChipFilter
            options={filters.skin_concerns}
            selectedValue={skinConcern}
            onSelect={setSkinConcern}
            allLabel={t.all}
            locale={locale}
          />
        )}

        {activeTab === 'age' && filters && (
          <ChipFilter
            options={filters.age_groups}
            selectedValue={ageGroup}
            onSelect={setAgeGroup}
            allLabel={t.all}
            locale={locale}
          />
        )}
      </div>

      {/* 검색 결과 수 */}
      {pagination && (
        <div className="flex-shrink-0 bg-gray-50 px-4 py-2 border-b border-gray-100">
          <p className="text-sm text-gray-600">
            {t.results.replace('{count}', pagination.total.toLocaleString())}
          </p>
        </div>
      )}

      {/* 제품 그리드 */}
      <div className="flex-1 overflow-y-auto pb-24">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-pink-500 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">{t.loading}</p>
            </div>
          </div>
        ) : products.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-gray-500">{t.noProducts}</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3 p-4">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  isSaved={savedProductIds.has(product.id)}
                  isSelected={selectedProducts.has(product.id)}
                  onToggle={() => toggleProduct(product.id)}
                />
              ))}
            </div>

            {/* 무한스크롤 트리거 */}
            <div ref={loadMoreRef} className="h-10 flex items-center justify-center">
              {loadingMore && (
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-pink-500" />
              )}
            </div>
          </>
        )}
      </div>

      {/* 하단 저장 바 */}
      <BottomSaveBar
        selectedCount={selectedProducts.size}
        onSave={handleSave}
        locale={locale}
      />
    </>
  );
}
