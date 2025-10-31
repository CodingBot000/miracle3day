'use client'


import React, { useState } from 'react';
import { Clock, DollarSign, TrendingUp, ChevronRight, Sparkles, X, Check } from 'lucide-react';

const TreatmentInfoSection = () => {
  const [selectedTreatment, setSelectedTreatment] = useState(null);
  const [activeCategory, setActiveCategory] = useState('all');

  const treatments = [
    {
      id: 'botox',
      category: 'anti-aging',
      name: 'Botox',
      nameKo: '보톡스',
      tagline: 'Smooth Away Expression Lines',
      description: '주름을 자연스럽게 개선하는 가장 인기 있는 시술',
      price: '$300 - $600',
      duration: '10-15 minutes',
      downtime: 'None',
      results: '3-6 months',
      effectiveness: 95,
      satisfaction: 98,
      benefits: [
        '표정 주름 개선 (이마, 미간, 눈가)',
        '통증 거의 없음',
        '즉시 일상 복귀 가능',
        '자연스러운 결과'
      ],
      idealFor: [
        '20대 후반~50대',
        '표정 주름이 신경 쓰이는 분',
        '간편한 시술을 원하는 분'
      ],
      process: [
        '상담 및 주름 분석',
        '시술 부위 마킹',
        '보톡스 주입 (5-10분)',
        '냉찜질 및 귀가'
      ],
      gradient: 'from-blue-500 to-purple-500'
    },
    {
      id: 'filler',
      category: 'volume',
      name: 'Dermal Filler',
      nameKo: '필러',
      tagline: 'Restore Youthful Volume',
      description: '잃어버린 볼륨을 채워 젊고 생기있는 얼굴로',
      price: '$400 - $1,200',
      duration: '20-30 minutes',
      downtime: '1-2 days',
      results: '6-18 months',
      effectiveness: 92,
      satisfaction: 94,
      benefits: [
        '볼륨 복원 (볼, 입가, 턱선)',
        '깊은 주름 개선',
        '얼굴 윤곽 개선',
        '즉각적인 효과'
      ],
      idealFor: [
        '30대 이상',
        '볼륨 소실이 시작된 분',
        '팔자주름이 깊어진 분'
      ],
      process: [
        '얼굴 분석 및 디자인',
        '마취 크림 도포',
        '필러 주입 (15-20분)',
        '마사지 및 최종 체크'
      ],
      gradient: 'from-pink-500 to-rose-500'
    },
    {
      id: 'laser',
      category: 'skin',
      name: 'Laser Treatment',
      nameKo: '레이저 토닝',
      tagline: 'Crystal Clear Complexion',
      description: '색소 침착과 피부 톤을 개선하는 레이저 시술',
      price: '$150 - $400',
      duration: '15-30 minutes',
      downtime: 'None',
      results: '4-8 weeks',
      effectiveness: 88,
      satisfaction: 90,
      benefits: [
        '기미, 잡티, 색소 침착 개선',
        '피부 톤 균일화',
        '모공 축소 효과',
        '콜라겐 재생 촉진'
      ],
      idealFor: [
        '모든 연령대',
        '색소 침착이 있는 분',
        '피부 톤이 고르지 않은 분'
      ],
      process: [
        '피부 상태 진단',
        '클렌징 및 준비',
        '레이저 조사 (10-15분)',
        '진정 관리'
      ],
      gradient: 'from-emerald-500 to-teal-500'
    },
    {
      id: 'thread-lift',
      category: 'lifting',
      name: 'Thread Lift',
      nameKo: '실 리프팅',
      tagline: 'Non-Surgical Face Lift',
      description: '수술 없이 처진 피부를 끌어올리는 프리미엄 시술',
      price: '$1,500 - $3,500',
      duration: '30-60 minutes',
      downtime: '3-5 days',
      results: '12-24 months',
      effectiveness: 90,
      satisfaction: 92,
      benefits: [
        '처진 피부 즉각적인 리프팅',
        '콜라겐 생성 촉진',
        '자연스러운 동안 효과',
        '수술 부담 없음'
      ],
      idealFor: [
        '40대 이상',
        '피부 처짐이 시작된 분',
        '수술은 부담스러운 분'
      ],
      process: [
        '리프팅 디자인',
        '국소 마취',
        '실 삽입 (30-40분)',
        '회복 및 관리 안내'
      ],
      gradient: 'from-violet-500 to-purple-500'
    },
    {
      id: 'ulthera',
      category: 'lifting',
      name: 'Ulthera (HIFU)',
      nameKo: '울쎄라',
      tagline: 'Deep Tissue Lifting',
      description: '피부 깊은 층까지 리프팅하는 FDA 승인 시술',
      price: '$2,000 - $4,000',
      duration: '60-90 minutes',
      downtime: 'None',
      results: '2-6 months (progressive)',
      effectiveness: 93,
      satisfaction: 89,
      benefits: [
        'SMAS층 리프팅',
        '콜라겐 재생',
        '점진적이고 자연스러운 효과',
        '수술 대체 가능'
      ],
      idealFor: [
        '40대 이상',
        '중등도 피부 처짐',
        '장기적 효과를 원하는 분'
      ],
      process: [
        '초음파 진단',
        '시술 부위 마킹',
        'HIFU 에너지 조사',
        '진정 관리'
      ],
      gradient: 'from-amber-500 to-orange-500'
    },
    {
      id: 'skinbooster',
      category: 'skin',
      name: 'Skin Booster',
      nameKo: '스킨부스터',
      tagline: 'Hydration From Within',
      description: '피부 깊숙이 수분을 공급하는 촉촉 시술',
      price: '$200 - $500',
      duration: '20-30 minutes',
      downtime: '1 day',
      results: '3-6 months',
      effectiveness: 87,
      satisfaction: 91,
      benefits: [
        '피부 깊은 수분 공급',
        '피부 탄력 개선',
        '잔주름 완화',
        '건강한 피부 광채'
      ],
      idealFor: [
        '20대 이상',
        '건조한 피부',
        '피부 탄력이 떨어진 분'
      ],
      process: [
        '피부 상태 체크',
        '마취 크림',
        '히알루론산 주입',
        '마무리 관리'
      ],
      gradient: 'from-cyan-500 to-blue-500'
    },
    {
      id: 'acne-scar',
      category: 'skin',
      name: 'Acne Scar Treatment',
      nameKo: '여드름 흉터 치료',
      tagline: 'Smooth Away Past Breakouts',
      description: '여드름 흉터를 효과적으로 개선하는 복합 치료',
      price: '$300 - $800',
      duration: '30-45 minutes',
      downtime: '3-7 days',
      results: '2-3 months',
      effectiveness: 85,
      satisfaction: 88,
      benefits: [
        '패인 흉터 개선',
        '피부 재생 촉진',
        '매끄러운 피부 결',
        '색소 침착 완화'
      ],
      idealFor: [
        '모든 연령대',
        '여드름 흉터가 있는 분',
        '피부 결이 고르지 않은 분'
      ],
      process: [
        '흉터 유형 분석',
        '복합 레이저 치료',
        '재생 관리',
        '홈케어 가이드'
      ],
      gradient: 'from-green-500 to-emerald-500'
    },
    {
      id: 'double-eyelid',
      category: 'surgery',
      name: 'Double Eyelid Surgery',
      nameKo: '쌍꺼풀 수술',
      tagline: 'Enhance Your Eyes',
      description: '자연스럽고 아름다운 눈매를 만드는 인기 성형',
      price: '$1,500 - $3,000',
      duration: '45-90 minutes',
      downtime: '7-14 days',
      results: 'Permanent',
      effectiveness: 96,
      satisfaction: 95,
      benefits: [
        '또렷한 눈매',
        '시야 개선',
        '자연스러운 라인',
        '영구적 효과'
      ],
      idealFor: [
        '20대 이상',
        '쌍꺼풀이 없거나 약한 분',
        '눈매 개선을 원하는 분'
      ],
      process: [
        '눈매 디자인',
        '수술 (비절개 or 절개)',
        '봉합 및 드레싱',
        '회복 및 실밥 제거'
      ],
      gradient: 'from-indigo-500 to-blue-500'
    }
  ];

  const categories = [
    { id: 'all', name: 'All Treatments', icon: Sparkles },
    { id: 'anti-aging', name: 'Anti-Aging', icon: Clock },
    { id: 'volume', name: 'Volume', icon: TrendingUp },
    { id: 'skin', name: 'Skin Care', icon: Sparkles },
    { id: 'lifting', name: 'Lifting', icon: TrendingUp },
    { id: 'surgery', name: 'Surgery', icon: Check }
  ];

  const filteredTreatments = activeCategory === 'all' 
    ? treatments 
    : treatments.filter(t => t.category === activeCategory);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50 py-20 px-4">
      <div className="max-w-7xl mx-auto">
        {/* 헤더 */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-700 px-4 py-2 rounded-full text-sm font-semibold mb-6">
            <Sparkles size={16} />
            <span>Popular Treatments in Korea</span>
          </div>
          <h2 className="text-5xl font-bold mb-6 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Discover Your Perfect Treatment
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            세계가 인정한 K-Beauty 기술력으로 당신만의 아름다움을 완성하세요
          </p>
        </div>

        {/* 카테고리 필터 */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-all duration-300 ${
                  activeCategory === category.id
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg scale-105'
                    : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                }`}
              >
                <Icon size={18} />
                <span>{category.name}</span>
              </button>
            );
          })}
        </div>

        {/* 시술 카드 그리드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {filteredTreatments.map((treatment) => (
            <div
              key={treatment.id}
              onClick={() => setSelectedTreatment(treatment)}
              className="group cursor-pointer"
            >
              <div className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
                {/* 그라데이션 헤더 */}
                <div className={`h-40 bg-gradient-to-br ${treatment.gradient} p-6 relative overflow-hidden`}>
                  <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full -mr-16 -mt-16" />
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-white rounded-full -ml-12 -mb-12" />
                  </div>
                  <div className="relative z-10">
                    <h3 className="text-2xl font-bold text-white mb-1">{treatment.name}</h3>
                    <p className="text-sm text-white/90 font-medium">{treatment.nameKo}</p>
                    <p className="text-sm text-white/80 mt-2 italic">{treatment.tagline}</p>
                  </div>
                </div>

                {/* 컨텐츠 */}
                <div className="p-6">
                  <p className="text-gray-600 mb-6 line-clamp-2">{treatment.description}</p>

                  {/* 주요 정보 */}
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2 text-sm text-gray-600">
                        <DollarSign size={16} className="text-green-600" />
                        Price
                      </span>
                      <span className="font-semibold text-gray-900">{treatment.price}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2 text-sm text-gray-600">
                        <Clock size={16} className="text-blue-600" />
                        Duration
                      </span>
                      <span className="font-semibold text-gray-900">{treatment.duration}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2 text-sm text-gray-600">
                        <TrendingUp size={16} className="text-purple-600" />
                        Results Last
                      </span>
                      <span className="font-semibold text-gray-900">{treatment.results}</span>
                    </div>
                  </div>

                  {/* 효과 바 */}
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs text-gray-600">Effectiveness</span>
                      <span className="text-xs font-bold text-purple-600">{treatment.effectiveness}%</span>
                    </div>
                    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className={`h-full bg-gradient-to-r ${treatment.gradient} transition-all duration-1000`}
                        style={{ width: `${treatment.effectiveness}%` }}
                      />
                    </div>
                  </div>

                  {/* CTA */}
                  <button className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold flex items-center justify-center gap-2 hover:shadow-lg transition-all duration-300 group-hover:scale-105">
                    Learn More
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 상담 CTA */}
        <div className="text-center bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl p-12 text-white">
          <h3 className="text-3xl font-bold mb-4">Not Sure Which Treatment Is Right for You?</h3>
          <p className="text-lg mb-8 opacity-90">
            전문 상담을 통해 당신에게 완벽한 시술을 찾아보세요
          </p>
          <button className="bg-white text-purple-600 px-8 py-4 rounded-xl font-bold text-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
            Get Free Consultation
          </button>
        </div>
      </div>

      {/* 상세 정보 모달 */}
      {selectedTreatment && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* 모달 헤더 */}
            <div className={`bg-gradient-to-br ${selectedTreatment.gradient} p-8 relative`}>
              <button
                onClick={() => setSelectedTreatment(null)}
                className="absolute top-4 right-4 bg-white/20 hover:bg-white/30 text-white p-2 rounded-full transition-all"
              >
                <X size={24} />
              </button>
              <h2 className="text-4xl font-bold text-white mb-2">{selectedTreatment.name}</h2>
              <p className="text-xl text-white/90 mb-1">{selectedTreatment.nameKo}</p>
              <p className="text-white/80 italic">{selectedTreatment.tagline}</p>
            </div>

            {/* 모달 컨텐츠 */}
            <div className="p-8">
              <p className="text-lg text-gray-700 mb-8">{selectedTreatment.description}</p>

              {/* 통계 */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="text-center p-4 bg-purple-50 rounded-xl">
                  <div className="text-3xl font-bold text-purple-600 mb-1">{selectedTreatment.price}</div>
                  <div className="text-sm text-gray-600">Price Range</div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-xl">
                  <div className="text-3xl font-bold text-blue-600 mb-1">{selectedTreatment.duration}</div>
                  <div className="text-sm text-gray-600">Duration</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-xl">
                  <div className="text-3xl font-bold text-green-600 mb-1">{selectedTreatment.downtime}</div>
                  <div className="text-sm text-gray-600">Downtime</div>
                </div>
                <div className="text-center p-4 bg-pink-50 rounded-xl">
                  <div className="text-3xl font-bold text-pink-600 mb-1">{selectedTreatment.results}</div>
                  <div className="text-sm text-gray-600">Results Last</div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                {/* Benefits */}
                <div>
                  <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Sparkles className="text-purple-600" />
                    Key Benefits
                  </h3>
                  <ul className="space-y-3">
                    {selectedTreatment.benefits.map((benefit, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <Check className="text-green-600 flex-shrink-0 mt-1" size={20} />
                        <span className="text-gray-700">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Ideal For */}
                <div>
                  <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Check className="text-blue-600" />
                    Ideal For
                  </h3>
                  <ul className="space-y-3">
                    {selectedTreatment.idealFor.map((ideal, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <ChevronRight className="text-blue-600 flex-shrink-0 mt-1" size={20} />
                        <span className="text-gray-700">{ideal}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Process */}
              <div className="mt-8">
                <h3 className="text-xl font-bold mb-4">Treatment Process</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {selectedTreatment.process.map((step, idx) => (
                    <div key={idx} className="relative">
                      <div className={`bg-gradient-to-br ${selectedTreatment.gradient} text-white p-4 rounded-xl`}>
                        <div className="text-2xl font-bold mb-2">{idx + 1}</div>
                        <div className="text-sm">{step}</div>
                      </div>
                      {idx < selectedTreatment.process.length - 1 && (
                        <ChevronRight className="hidden md:block absolute top-1/2 -right-6 transform -translate-y-1/2 text-gray-300" />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* CTA */}
              <div className="mt-8 flex gap-4">
                <button className="flex-1 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold hover:shadow-lg transition-all">
                  Book Consultation
                </button>
                <button className="flex-1 py-4 border-2 border-purple-600 text-purple-600 rounded-xl font-bold hover:bg-purple-50 transition-all">
                  Compare Treatments
                </button>
              </div>

              {/* Disclaimer */}
              <p className="mt-6 text-xs text-gray-500 text-center">
                *Results may vary by individual. Consult with a certified specialist for personalized advice.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TreatmentInfoSection;
