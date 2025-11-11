'use client';

import { useState } from 'react';
import { ExternalLink, ShoppingBag, BookOpen, Users, Globe, Building2 } from 'lucide-react';

// 타입 정의
type Category = 'all' | 'shopping' | 'education' | 'community' | 'official';
type Language = 'ko' | 'en' | 'ja' | 'zh';

interface Resource {
  id: string;
  name: string;
  url: string;
  category: Category;
  description: {
    ko: string;
    en: string;
    ja: string;
    zh: string;
  };
  tags: string[];
  featured?: boolean;
}

// 리소스 데이터
const resources: Resource[] = [
  // 쇼핑몰
  {
    id: 'olive-young',
    name: 'Olive Young Global',
    url: 'https://global.oliveyoung.com',
    category: 'shopping',
    description: {
      ko: '한국 1위 뷰티 드럭스토어. 2026년 LA 오프라인 매장 오픈 예정',
      en: "Korea's #1 beauty drugstore. LA offline store opening in 2026",
      ja: '韓国No.1ビューティードラッグストア。2026年LA実店舗オープン予定',
      zh: '韩国第一美妆药妆店。2026年洛杉矶实体店开业'
    },
    tags: ['Global Shipping', 'All Brands', 'Official'],
    featured: true
  },
  {
    id: 'yesstyle',
    name: 'YesStyle',
    url: 'https://www.yesstyle.com',
    category: 'shopping',
    description: {
      ko: '2006년부터 운영, K-뷰티+패션 종합몰. 홍콩 기반',
      en: 'Since 2006, K-beauty + fashion mall. Hong Kong based',
      ja: '2006年から運営、Kビューティー+ファッション総合モール',
      zh: '2006年起运营，K美妆+时尚综合商城'
    },
    tags: ['Free Shipping $59+', 'Asian Beauty', 'Fashion'],
    featured: true
  },
  {
    id: 'jolse',
    name: 'Jolse',
    url: 'https://jolse.com',
    category: 'shopping',
    description: {
      ko: '한국 직배송, 무료 샘플로 유명. Reddit에서 인기',
      en: 'Direct from Korea, famous for free samples. Popular on Reddit',
      ja: '韓国から直送、無料サンプルで有名。Reddit人気',
      zh: '韩国直邮，以免费样品闻名。Reddit热门'
    },
    tags: ['Free Samples', 'Direct Shipping', 'Reddit Favorite']
  },
  {
    id: 'stylevana',
    name: 'Stylevana',
    url: 'https://www.stylevana.com',
    category: 'shopping',
    description: {
      ko: '아시안 뷰티 종합몰, 다양한 가격대',
      en: 'Asian beauty comprehensive mall, various price ranges',
      ja: 'アジアンビューティー総合モール、様々な価格帯',
      zh: '亚洲美妆综合商城，多种价格区间'
    },
    tags: ['Wide Selection', 'Affordable', 'Premium']
  },
  {
    id: 'beautynetkorea',
    name: 'Beautynetkorea',
    url: 'https://beautynetkorea.com',
    category: 'shopping',
    description: {
      ko: '한국 브랜드 대량 취급, 최대 75% 할인 세일',
      en: 'Massive Korean brands selection, up to 75% off sales',
      ja: '韓国ブランド大量取扱、最大75%オフセール',
      zh: '大量韩国品牌，最高75%折扣'
    },
    tags: ['Big Sales', 'Discounts', 'Variety']
  },
  {
    id: 'wconcept',
    name: 'W.Concept',
    url: 'https://us.wconcept.com',
    category: 'shopping',
    description: {
      ko: 'K-패션+뷰티 복합몰, 트렌디한 한국 브랜드',
      en: 'K-fashion + beauty complex, trendy Korean brands',
      ja: 'Kファッション+ビューティー複合モール、トレンディな韓国ブランド',
      zh: 'K时尚+美妆综合体，时尚韩国品牌'
    },
    tags: ['Fashion', 'Trendy', 'Premium']
  },
  {
    id: 'sephora',
    name: 'Sephora',
    url: 'https://www.sephora.com',
    category: 'shopping',
    description: {
      ko: '미국 뷰티 리테일러. Beauty of Joseon, Hanyul 등 입점',
      en: 'US beauty retailer. Beauty of Joseon, Hanyul available',
      ja: '米国ビューティリテーラー。Beauty of Joseon、Hanyul入店',
      zh: '美国美妆零售商。Beauty of Joseon、Hanyul等入驻'
    },
    tags: ['US Retailer', 'Premium', 'Fast Shipping']
  },
  {
    id: 'ulta',
    name: 'Ulta Beauty',
    url: 'https://www.ulta.com',
    category: 'shopping',
    description: {
      ko: '미국 뷰티 리테일러. Tirtir, VT Cosmetics 등 입점',
      en: 'US beauty retailer. Tirtir, VT Cosmetics available',
      ja: '米国ビューティリテーラー。Tirtir、VT Cosmetics入店',
      zh: '美国美妆零售商。Tirtir、VT Cosmetics等入驻'
    },
    tags: ['US Retailer', 'Rewards Program', 'In-Store']
  },
  {
    id: 'amazon-kbeauty',
    name: 'Amazon K-Beauty',
    url: 'https://www.amazon.com',
    category: 'shopping',
    description: {
      ko: 'Amazon Prime Day K-뷰티 할인, 빠른 배송',
      en: 'Amazon Prime Day K-beauty deals, fast shipping',
      ja: 'Amazon Prime Day Kビューティーセール、迅速配送',
      zh: 'Amazon Prime Day K美妆优惠，快速配送'
    },
    tags: ['Prime Shipping', 'Sales', 'Trusted']
  },
  {
    id: 'sokoglam',
    name: 'Soko Glam',
    url: 'https://sokoglam.com',
    category: 'shopping',
    description: {
      ko: 'Charlotte Cho 운영, K-뷰티 큐레이션 샵',
      en: 'By Charlotte Cho, curated K-beauty shop',
      ja: 'Charlotte Cho運営、Kビューティーキュレーションショップ',
      zh: 'Charlotte Cho运营，精选K美妆店'
    },
    tags: ['Curated', 'Expert Selection', 'Premium']
  },
  {
    id: 'peach-lily',
    name: 'Peach & Lily',
    url: 'https://www.peachandlily.com',
    category: 'shopping',
    description: {
      ko: '프리미엄 K-뷰티 셀렉션, 독점 제품',
      en: 'Premium K-beauty selection, exclusive items',
      ja: 'プレミアムKビューティーセレクション、限定商品',
      zh: '高端K美妆精选，独家产品'
    },
    tags: ['Premium', 'Exclusive', 'Subscription']
  },

  // 교육/정보
  {
    id: 'the-klog',
    name: 'The Klog',
    url: 'https://theklog.co',
    category: 'education',
    description: {
      ko: 'Soko Glam의 교육 콘텐츠. 성분 분석, 루틴 가이드',
      en: "Soko Glam's educational content. Ingredient analysis, routine guides",
      ja: 'Soko Glamの教育コンテンツ。成分分析、ルーティンガイド',
      zh: 'Soko Glam教育内容。成分分析、护肤流程指南'
    },
    tags: ['Ingredients', 'How-to', 'Expert Articles'],
    featured: true
  },
  {
    id: 'picky',
    name: 'Picky',
    url: 'https://blog.gopicky.com',
    category: 'education',
    description: {
      ko: 'K-뷰티 성분 분석 및 제품 리뷰 플랫폼',
      en: 'K-beauty ingredient analysis and product review platform',
      ja: 'Kビューティー成分分析と製品レビュープラットフォーム',
      zh: 'K美妆成分分析和产品评测平台'
    },
    tags: ['Ingredient Focus', 'Reviews', 'Community'],
    featured: true
  },
  {
    id: 'snow-white-asian-pear',
    name: 'Snow White and the Asian Pear',
    url: 'http://www.snowwhiteandtheasianpear.com',
    category: 'education',
    description: {
      ko: '유명 K-뷰티 블로거의 상세한 제품 리뷰 및 가이드',
      en: 'Detailed product reviews and guides by famous K-beauty blogger',
      ja: '有名Kビューティーブロガーの詳細な製品レビューとガイド',
      zh: '著名K美妆博主的详细产品评测和指南'
    },
    tags: ['In-depth Reviews', 'Science', 'Honest']
  },
  {
    id: 'fanserviced-b',
    name: 'fanserviced-b',
    url: 'https://www.fanserviced-b.com',
    category: 'education',
    description: {
      ko: '뉴욕 기반 K-뷰티 리뷰어. 솔직한 제품 평가',
      en: 'NYC-based K-beauty reviewer. Honest product evaluations',
      ja: 'ニューヨーク拠点のKビューティーレビュアー。正直な製品評価',
      zh: '纽约K美妆评测博主。诚实产品评价'
    },
    tags: ['NYC Shopping Tips', 'Affordable', 'No BS']
  },
  {
    id: 'skinfull-seoul',
    name: 'Skinfull of Seoul',
    url: 'https://www.skinfullofseoul.com',
    category: 'education',
    description: {
      ko: '영국인이 서울에서 직접 체험한 K-뷰티 리뷰',
      en: 'K-beauty reviews from a Brit living in Seoul',
      ja: '英国人がソウルで直接体験したKビューティーレビュー',
      zh: '英国人在首尔的K美妆体验评测'
    },
    tags: ['Seoul Life', 'Product Discovery', 'Expat View']
  },

  // 커뮤니티
  {
    id: 'reddit-asianbeauty',
    name: 'r/AsianBeauty',
    url: 'https://www.reddit.com/r/AsianBeauty',
    category: 'community',
    description: {
      ko: '11,430+ 구독자. Holy Grail 제품 토론, K-뷰티 정보 공유',
      en: '11,430+ subscribers. Holy Grail product discussions, K-beauty info sharing',
      ja: '11,430+購読者。Holy Grail製品ディスカッション、Kビューティー情報共有',
      zh: '11,430+订阅者。Holy Grail产品讨论，K美妆信息分享'
    },
    tags: ['Active Community', 'Product Recs', 'Reviews'],
    featured: true
  },
  {
    id: 'reddit-skincare',
    name: 'r/SkincareAddiction',
    url: 'https://www.reddit.com/r/SkincareAddiction',
    category: 'community',
    description: {
      ko: '375,000+ 구독자. 과학적 스킨케어, 성분 분석',
      en: '375,000+ subscribers. Scientific skincare, ingredient analysis',
      ja: '375,000+購読者。科学的スキンケア、成分分析',
      zh: '375,000+订阅者。科学护肤，成分分析'
    },
    tags: ['Science-based', 'Large Community', 'Expert Advice']
  },
  {
    id: 'reddit-koreanbeauty',
    name: 'r/KoreanBeauty',
    url: 'https://www.reddit.com/r/KoreanBeauty',
    category: 'community',
    description: {
      ko: 'K-뷰티 전문 서브레딧. 제품 추천 및 루틴 공유',
      en: 'K-beauty dedicated subreddit. Product recommendations and routine sharing',
      ja: 'Kビューティー専門サブレディット。製品推薦とルーティン共有',
      zh: 'K美妆专门板块。产品推荐和护肤流程分享'
    },
    tags: ['K-beauty Focus', 'Routine Help', 'Shopping Tips']
  },

  // 공식/정부
  {
    id: 'mohw',
    name: 'Ministry of Health and Welfare (Korea)',
    url: 'https://www.mohw.go.kr/board.es?mid=a20401000000&bid=0032',
    category: 'official',
    description: {
      ko: '대한민국 보건복지부 K-뷰티 공식 정보',
      en: 'Official K-beauty information from Korean Ministry of Health',
      ja: '韓国保健福祉部のKビューティー公式情報',
      zh: '韩国卫生福利部K美妆官方信息'
    },
    tags: ['Official', 'Government', 'Regulations']
  },
  {
    id: 'us-trade-korea',
    name: 'U.S. Trade.gov - South Korea Cosmetics',
    url: 'https://www.trade.gov/country-commercial-guides/south-korea-cosmetics',
    category: 'official',
    description: {
      ko: '미국 정부의 한국 화장품 시장 분석 자료',
      en: 'US government analysis of Korean cosmetics market',
      ja: '米国政府の韓国化粧品市場分析資料',
      zh: '美国政府韩国化妆品市场分析资料'
    },
    tags: ['Market Analysis', 'Industry Data', 'Official']
  },
  {
    id: 'wikipedia-kbeauty',
    name: 'K-beauty Wikipedia',
    url: 'https://en.wikipedia.org/wiki/K-beauty',
    category: 'official',
    description: {
      ko: 'K-뷰티의 역사, 문화적 배경, 글로벌 영향',
      en: 'K-beauty history, cultural background, global impact',
      ja: 'Kビューティーの歴史、文化的背景、グローバル影響',
      zh: 'K美妆历史、文化背景、全球影响'
    },
    tags: ['History', 'Reference', 'Educational']
  }
];

// 번역 데이터
const translations = {
  ko: {
    title: 'K-뷰티 추천 리소스',
    subtitle: '전 세계 K-뷰티 팬들이 사용하는 신뢰할 수 있는 사이트 모음',
    allCategories: '전체',
    shopping: '쇼핑몰',
    education: '배우기',
    community: '커뮤니티',
    official: '공식 정보',
    visit: '방문하기',
    featured: '추천'
  },
  en: {
    title: 'K-Beauty Resources',
    subtitle: 'Trusted sites used by K-beauty fans worldwide',
    allCategories: 'All',
    shopping: 'Shopping',
    education: 'Learn',
    community: 'Community',
    official: 'Official',
    visit: 'Visit',
    featured: 'Featured'
  },
  ja: {
    title: 'Kビューティーリソース',
    subtitle: '世界中のKビューティーファンが利用する信頼できるサイト集',
    allCategories: 'すべて',
    shopping: 'ショッピング',
    education: '学ぶ',
    community: 'コミュニティ',
    official: '公式情報',
    visit: '訪問',
    featured: 'おすすめ'
  },
  zh: {
    title: 'K美妆资源',
    subtitle: '全球K美妆爱好者使用的可信网站集合',
    allCategories: '全部',
    shopping: '购物',
    education: '学习',
    community: '社区',
    official: '官方',
    visit: '访问',
    featured: '推荐'
  }
};

// 카테고리 아이콘 매핑
const categoryIcons = {
  shopping: ShoppingBag,
  education: BookOpen,
  community: Users,
  official: Building2
};

export default function KBeautyResources() {
  const [selectedCategory, setSelectedCategory] = useState<Category>('all');
  const [selectedLanguage, setSelectedLanguage] = useState<Language>('en');

  const t = translations[selectedLanguage];

  const filteredResources = selectedCategory === 'all'
    ? resources
    : resources.filter(r => r.category === selectedCategory);

  const featuredResources = resources.filter(r => r.featured);

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
      {/* 헤더 */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          {t.title}
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          {t.subtitle}
        </p>

        {/* 언어 선택 */}
        <div className="flex justify-center gap-2 mt-6">
          {(['en', 'ja', 'zh', 'ko'] as Language[]).map((lang) => (
            <button
              key={lang}
              onClick={() => setSelectedLanguage(lang)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedLanguage === lang
                  ? 'bg-pink-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {lang === 'ko' ? '한국어' : lang === 'en' ? 'English' : lang === 'ja' ? '日本語' : '中文'}
            </button>
          ))}
        </div>
      </div>

      {/* Featured 섹션 */}
      {selectedCategory === 'all' && (
        <div className="mb-12">
          <div className="flex items-center gap-2 mb-6">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r from-pink-500 to-pink-400 text-white">
              ⭐ {t.featured}
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredResources.map((resource) => (
              <ResourceCard
                key={resource.id}
                resource={resource}
                language={selectedLanguage}
                featured={true}
              />
            ))}
          </div>
        </div>
      )}

      {/* 카테고리 필터 */}
      <div className="flex flex-wrap justify-center gap-3 mb-10">
        <CategoryButton
          active={selectedCategory === 'all'}
          onClick={() => setSelectedCategory('all')}
          icon={Globe}
          label={t.allCategories}
        />
        <CategoryButton
          active={selectedCategory === 'shopping'}
          onClick={() => setSelectedCategory('shopping')}
          icon={ShoppingBag}
          label={t.shopping}
        />
        <CategoryButton
          active={selectedCategory === 'education'}
          onClick={() => setSelectedCategory('education')}
          icon={BookOpen}
          label={t.education}
        />
        <CategoryButton
          active={selectedCategory === 'community'}
          onClick={() => setSelectedCategory('community')}
          icon={Users}
          label={t.community}
        />
        <CategoryButton
          active={selectedCategory === 'official'}
          onClick={() => setSelectedCategory('official')}
          icon={Building2}
          label={t.official}
        />
      </div>

      {/* 리소스 그리드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredResources.map((resource) => (
          <ResourceCard
            key={resource.id}
            resource={resource}
            language={selectedLanguage}
          />
        ))}
      </div>

      {/* Footer 노트 */}
      <div className="mt-12 p-6 bg-gray-50 rounded-xl">
        <p className="text-sm text-gray-600 text-center">
          {selectedLanguage === 'ko' && '모든 외부 링크는 정보 제공 목적입니다. iipuda는 외부 사이트의 내용에 대해 책임지지 않습니다.'}
          {selectedLanguage === 'en' && 'All external links are for informational purposes. iipuda is not responsible for the content of external sites.'}
          {selectedLanguage === 'ja' && 'すべての外部リンクは情報提供目的です。iipudaは外部サイトの内容について責任を負いません。'}
          {selectedLanguage === 'zh' && '所有外部链接仅供参考。iipuda对外部网站内容不承担责任。'}
        </p>
      </div>
    </div>
  );
}

// 카테고리 버튼 컴포넌트
function CategoryButton({
  active,
  onClick,
  icon: Icon,
  label
}: {
  active: boolean;
  onClick: () => void;
  icon: any;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium transition-all ${
        active
          ? 'bg-pink-600 text-white shadow-lg shadow-pink-200'
          : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-pink-300 hover:bg-pink-50'
      }`}
    >
      <Icon className="w-5 h-5" />
      <span>{label}</span>
    </button>
  );
}

// 리소스 카드 컴포넌트
function ResourceCard({
  resource,
  language,
  featured = false
}: {
  resource: Resource;
  language: Language;
  featured?: boolean;
}) {
  const Icon = categoryIcons[resource.category as keyof typeof categoryIcons];
  const t = translations[language];

  return (
    <div className={`group relative bg-white rounded-xl border-2 transition-all hover:shadow-xl hover:-translate-y-1 flex flex-col ${
      featured
        ? 'border-pink-300 shadow-lg shadow-pink-100'
        : 'border-gray-200 hover:border-pink-300'
    }`}>
      {/* Featured Badge */}
      {featured && (
        <div className="absolute -top-3 -right-3 bg-gradient-to-r from-pink-500 to-pink-400 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
          ⭐ {t.featured}
        </div>
      )}

      <div className="p-6 flex flex-col flex-grow">
        {/* 헤더 */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${
              resource.category === 'shopping' ? 'bg-pink-100 text-pink-600' :
              resource.category === 'education' ? 'bg-blue-100 text-blue-600' :
              resource.category === 'community' ? 'bg-purple-100 text-purple-600' :
              'bg-gray-100 text-gray-600'
            }`}>
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 group-hover:text-pink-600 transition-colors">
                {resource.name}
              </h3>
            </div>
          </div>
        </div>

        {/* 설명 */}
        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
          {resource.description[language]}
        </p>

        {/* 태그 */}
        <div className="flex flex-wrap gap-2 mb-4">
          {resource.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* 방문 버튼 */}
        <a
          href={resource.url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-auto inline-flex items-center gap-2 w-full justify-center px-4 py-2.5 bg-gradient-to-r from-pink-500 to-pink-600 text-white rounded-lg font-medium hover:from-pink-600 hover:to-pink-700 transition-all shadow-md hover:shadow-lg"
        >
          <span>{t.visit}</span>
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>
    </div>
  );
}
