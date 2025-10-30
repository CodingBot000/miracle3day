'use client';
import React, { useState } from 'react';
import { 
  Frown, Smile, Zap, Target, ChevronRight, ArrowRight,
  CheckCircle, Info, TrendingUp, DollarSign, Clock, Award
} from 'lucide-react';

const ConcernBasedGuide = () => {
  const [selectedConcern, setSelectedConcern] = useState(null);
  const [selectedAge, setSelectedAge] = useState(null);

  // 고민별 데이터
  const concerns = [
    {
      id: 'wrinkles',
      icon: '😔',
      name: 'Wrinkles & Fine Lines',
      nameKo: '주름 & 잔주름',
      description: '이마, 미간, 눈가, 팔자 주름이 신경쓰여요',
      color: 'from-purple-500 to-purple-600',
      ageGroups: {
        '20s': {
          concern: '표정 주름 예방이 시급합니다',
          solutions: [
            {
              name: 'Baby Botox',
              nameKo: '베이비 보톡스',
              why: '가벼운 근육 이완으로 주름 생성 방지',
              price: '$250-400',
              duration: '10 min',
              results: '3-4 months',
              effectiveness: 90
            },
            {
              name: 'Preventive Skin Booster',
              nameKo: '예방 스킨부스터',
              why: '피부 깊숙이 수분 공급으로 탄력 유지',
              price: '$200-350',
              duration: '20 min',
              results: '3-6 months',
              effectiveness: 85
            }
          ],
          budget: {
            basic: '$250-400/month',
            premium: '$500-700/month'
          }
        },
        '30s': {
          concern: '초기 주름이 고착화되기 시작합니다',
          solutions: [
            {
              name: 'Botox + Filler Combo',
              nameKo: '보톡스 + 필러 콤보',
              why: '근육 이완과 볼륨 채우기 동시 해결',
              price: '$600-1,000',
              duration: '30 min',
              results: '6-12 months',
              effectiveness: 95
            },
            {
              name: 'HIFU (Ulthera)',
              nameKo: '울쎄라 리프팅',
              why: '콜라겐 재생으로 주름 개선 & 예방',
              price: '$1,200-2,000',
              duration: '60 min',
              results: '12-18 months',
              effectiveness: 88
            }
          ],
          budget: {
            basic: '$400-600/month',
            premium: '$800-1,200/month'
          }
        },
        '40s': {
          concern: '깊은 주름과 처짐이 동시에 진행됩니다',
          solutions: [
            {
              name: 'Thread Lift + Botox',
              nameKo: '실리프팅 + 보톡스',
              why: '즉각적인 리프팅과 주름 개선',
              price: '$1,500-2,500',
              duration: '45 min',
              results: '12-24 months',
              effectiveness: 92
            },
            {
              name: 'Multi-Layer Filler',
              nameKo: '다층 필러',
              why: '깊은 주름부터 잔주름까지 단계적 개선',
              price: '$800-1,500',
              duration: '40 min',
              results: '12-18 months',
              effectiveness: 90
            }
          ],
          budget: {
            basic: '$600-1,000/month',
            premium: '$1,500-2,500/month'
          }
        },
        '50s+': {
          concern: '구조적 변화로 복합 치료가 필요합니다',
          solutions: [
            {
              name: 'Fat Grafting + Lifting',
              nameKo: '지방이식 + 리프팅',
              why: '볼륨 복원과 주름 개선 동시 해결',
              price: '$3,000-5,000',
              duration: '90-120 min',
              results: '2-3 years',
              effectiveness: 94
            },
            {
              name: 'Comprehensive Rejuvenation',
              nameKo: '종합 안티에이징',
              why: '레이저, 필러, 보톡스 복합 치료',
              price: '$2,000-3,500',
              duration: '60-90 min',
              results: '12-18 months',
              effectiveness: 91
            }
          ],
          budget: {
            basic: '$1,000-1,500/month',
            premium: '$2,500-4,000/month'
          }
        }
      }
    },
    {
      id: 'pigmentation',
      icon: '🌑',
      name: 'Pigmentation & Dark Spots',
      nameKo: '색소침착 & 기미',
      description: '기미, 잡티, 주근깨, 색소침착이 고민이에요',
      color: 'from-amber-500 to-orange-600',
      ageGroups: {
        '20s': {
          concern: '초기 색소 관리가 평생 피부를 좌우합니다',
          solutions: [
            {
              name: 'Pico Toning',
              nameKo: '피코토닝',
              why: '멜라닌 파괴로 깨끗한 피부 톤',
              price: '$150-300',
              duration: '15 min',
              results: '4-8 weeks',
              effectiveness: 88
            },
            {
              name: 'Vitamin C + Glutathione IV',
              nameKo: '백옥주사',
              why: '내부에서 피부 톤 개선',
              price: '$80-150',
              duration: '20 min',
              results: '1-2 months',
              effectiveness: 75
            }
          ],
          budget: {
            basic: '$200-400/month',
            premium: '$500-800/month'
          }
        },
        '30s': {
          concern: '호르몬 변화로 색소가 진해집니다',
          solutions: [
            {
              name: 'PicoSure + Laser Toning',
              nameKo: '피코슈어 + 토닝',
              why: '깊은 색소까지 제거',
              price: '$300-600',
              duration: '25 min',
              results: '2-3 months',
              effectiveness: 92
            },
            {
              name: 'IPL + Chemical Peel',
              nameKo: 'IPL + 필링',
              why: '피부 결과 색소 동시 개선',
              price: '$250-500',
              duration: '30 min',
              results: '2-4 months',
              effectiveness: 85
            }
          ],
          budget: {
            basic: '$300-500/month',
            premium: '$600-1,000/month'
          }
        },
        '40s': {
          concern: '깊고 넓게 퍼진 색소 침착',
          solutions: [
            {
              name: 'Q-Switch + Picosecond Combo',
              nameKo: '복합 레이저 치료',
              why: '다양한 깊이의 색소 동시 제거',
              price: '$400-800',
              duration: '35 min',
              results: '3-4 months',
              effectiveness: 90
            },
            {
              name: 'Intensive Brightening Program',
              nameKo: '집중 미백 프로그램',
              why: '레이저 + 약물 + 관리 복합',
              price: '$600-1,200',
              duration: '60 min',
              results: '4-6 months',
              effectiveness: 88
            }
          ],
          budget: {
            basic: '$400-700/month',
            premium: '$1,000-1,800/month'
          }
        },
        '50s+': {
          concern: '장기간 누적된 색소와 피부 노화',
          solutions: [
            {
              name: 'Multi-Wavelength Laser',
              nameKo: '다파장 레이저',
              why: '다양한 피부 문제 동시 개선',
              price: '$500-1,000',
              duration: '40 min',
              results: '4-6 months',
              effectiveness: 87
            },
            {
              name: 'Regenerative Treatment',
              nameKo: '재생 집중 치료',
              why: '피부 재생과 미백 동시 진행',
              price: '$800-1,500',
              duration: '60 min',
              results: '6-8 months',
              effectiveness: 85
            }
          ],
          budget: {
            basic: '$500-800/month',
            premium: '$1,200-2,000/month'
          }
        }
      }
    },
    {
      id: 'sagging',
      icon: '⬇️',
      name: 'Sagging & Loss of Elasticity',
      nameKo: '처짐 & 탄력 저하',
      description: '볼, 턱선, 목의 처짐이 고민이에요',
      color: 'from-blue-500 to-indigo-600',
      ageGroups: {
        '20s': {
          concern: '예방이 최선의 치료입니다',
          solutions: [
            {
              name: 'Skin Booster + RF',
              nameKo: '스킨부스터 + 고주파',
              why: '콜라겐 생성 촉진으로 탄력 유지',
              price: '$300-500',
              duration: '30 min',
              results: '4-6 months',
              effectiveness: 82
            },
            {
              name: 'Light HIFU',
              nameKo: '라이트 울쎄라',
              why: '저강도로 탄력 기초 다지기',
              price: '$600-1,000',
              duration: '40 min',
              results: '8-12 months',
              effectiveness: 85
            }
          ],
          budget: {
            basic: '$250-400/month',
            premium: '$600-900/month'
          }
        },
        '30s': {
          concern: '초기 처짐 신호가 나타납니다',
          solutions: [
            {
              name: 'HIFU (Full Face)',
              nameKo: '전체 얼굴 울쎄라',
              why: 'SMAS층 리프팅으로 근본 개선',
              price: '$1,500-2,500',
              duration: '60 min',
              results: '12-18 months',
              effectiveness: 90
            },
            {
              name: 'Thermage + Ulthera',
              nameKo: '써마지 + 울쎄라',
              why: '표층과 심층 동시 리프팅',
              price: '$2,000-3,500',
              duration: '90 min',
              results: '18-24 months',
              effectiveness: 93
            }
          ],
          budget: {
            basic: '$400-700/month',
            premium: '$1,000-1,500/month'
          }
        },
        '40s': {
          concern: '중등도 처짐으로 복합 치료 필요',
          solutions: [
            {
              name: 'Thread Lift (Premium)',
              nameKo: '프리미엄 실리프팅',
              why: '즉각적인 리프팅 효과',
              price: '$2,000-3,500',
              duration: '45-60 min',
              results: '12-24 months',
              effectiveness: 91
            },
            {
              name: 'Fat Grafting + Lifting',
              nameKo: '지방이식 + 리프팅',
              why: '볼륨과 리프팅 동시 해결',
              price: '$3,000-5,000',
              duration: '90-120 min',
              results: '2-3 years',
              effectiveness: 94
            }
          ],
          budget: {
            basic: '$700-1,200/month',
            premium: '$2,000-3,000/month'
          }
        },
        '50s+': {
          concern: '심한 처짐으로 구조적 치료 필수',
          solutions: [
            {
              name: 'Facelift Surgery',
              nameKo: '안면거상술',
              why: '근본적인 구조 개선',
              price: '$8,000-15,000',
              duration: '3-4 hours',
              results: '5-10 years',
              effectiveness: 97
            },
            {
              name: 'Non-Surgical Full Lift',
              nameKo: '비수술 종합 리프팅',
              why: '실 + HIFU + 필러 복합',
              price: '$4,000-7,000',
              duration: '2-3 hours',
              results: '18-24 months',
              effectiveness: 89
            }
          ],
          budget: {
            basic: '$1,000-2,000/month',
            premium: '$3,000-5,000/month'
          }
        }
      }
    },
    {
      id: 'acne',
      icon: '🔴',
      name: 'Acne & Acne Scars',
      nameKo: '여드름 & 흉터',
      description: '여드름, 모공, 흉터가 고민이에요',
      color: 'from-red-500 to-pink-600',
      ageGroups: {
        '20s': {
          concern: '활성 여드름과 예방이 중요합니다',
          solutions: [
            {
              name: 'AcneClear Laser',
              nameKo: '여드름 레이저',
              why: '피지선 억제 + 염증 완화',
              price: '$150-300',
              duration: '20 min',
              results: '2-3 months',
              effectiveness: 85
            },
            {
              name: 'Chemical Peel + LED',
              nameKo: '필링 + LED',
              why: '각질 제거 + 진정',
              price: '$100-200',
              duration: '30 min',
              results: '1-2 months',
              effectiveness: 80
            }
          ],
          budget: {
            basic: '$200-350/month',
            premium: '$400-600/month'
          }
        },
        '30s': {
          concern: '흉터와 색소침착 관리',
          solutions: [
            {
              name: 'Fractional Laser',
              nameKo: '프락셀 레이저',
              why: '흉터 재생 + 모공 축소',
              price: '$250-500',
              duration: '30 min',
              results: '3-4 months',
              effectiveness: 88
            },
            {
              name: 'Subcision + Filler',
              nameKo: '서브시전 + 필러',
              why: '패인 흉터 직접 개선',
              price: '$400-800',
              duration: '40 min',
              results: '6-12 months',
              effectiveness: 90
            }
          ],
          budget: {
            basic: '$300-500/month',
            premium: '$600-1,000/month'
          }
        },
        '40s': {
          concern: '오래된 흉터와 모공',
          solutions: [
            {
              name: 'Picofractional + TCA Cross',
              nameKo: '피코프락셔널 + TCA',
              why: '깊은 흉터까지 재생',
              price: '$400-700',
              duration: '45 min',
              results: '4-6 months',
              effectiveness: 87
            },
            {
              name: 'Comprehensive Scar Treatment',
              nameKo: '종합 흉터 치료',
              why: '레이저 + 약물 + 필링 복합',
              price: '$600-1,200',
              duration: '60 min',
              results: '6-8 months',
              effectiveness: 89
            }
          ],
          budget: {
            basic: '$400-600/month',
            premium: '$800-1,500/month'
          }
        },
        '50s+': {
          concern: '장기간 누적된 흉터와 피부결',
          solutions: [
            {
              name: 'Multi-Layer Skin Resurfacing',
              nameKo: '다층 피부 재생',
              why: '전체적인 피부결 개선',
              price: '$600-1,200',
              duration: '60 min',
              results: '6-12 months',
              effectiveness: 85
            },
            {
              name: 'Stem Cell + Laser',
              nameKo: '줄기세포 + 레이저',
              why: '재생력 극대화',
              price: '$800-1,500',
              duration: '75 min',
              results: '8-12 months',
              effectiveness: 88
            }
          ],
          budget: {
            basic: '$500-800/month',
            premium: '$1,000-1,800/month'
          }
        }
      }
    },
    {
      id: 'dryness',
      icon: '💧',
      name: 'Dryness & Dullness',
      nameKo: '건조함 & 칙칙함',
      description: '피부가 건조하고 생기가 없어요',
      color: 'from-cyan-500 to-blue-600',
      ageGroups: {
        '20s': {
          concern: '수분 기초 다지기',
          solutions: [
            {
              name: 'Skin Booster Basic',
              nameKo: '기본 스킨부스터',
              why: '진피층 수분 공급',
              price: '$180-300',
              duration: '20 min',
              results: '3-6 months',
              effectiveness: 88
            },
            {
              name: 'Aqua Peeling + Hydration',
              nameKo: '아쿠아필 + 수분',
              why: '각질 제거 + 수분 충전',
              price: '$120-200',
              duration: '30 min',
              results: '2-3 months',
              effectiveness: 82
            }
          ],
          budget: {
            basic: '$150-300/month',
            premium: '$350-550/month'
          }
        },
        '30s': {
          concern: '수분 + 탄력 동시 관리',
          solutions: [
            {
              name: 'Profhilo',
              nameKo: '프로파일로',
              why: '고농도 히알루론산으로 수분+탄력',
              price: '$300-500',
              duration: '15 min',
              results: '6-9 months',
              effectiveness: 92
            },
            {
              name: 'Vitamin Glow + Booster',
              nameKo: '비타민 글로우 + 부스터',
              why: '영양 + 수분 동시 공급',
              price: '$250-400',
              duration: '30 min',
              results: '3-4 months',
              effectiveness: 85
            }
          ],
          budget: {
            basic: '$200-400/month',
            premium: '$500-800/month'
          }
        },
        '40s': {
          concern: '깊은 수분 + 재생',
          solutions: [
            {
              name: 'Multi-Layer Hydration',
              nameKo: '다층 수분 주입',
              why: '여러 층에 수분 공급',
              price: '$350-600',
              duration: '35 min',
              results: '4-6 months',
              effectiveness: 88
            },
            {
              name: 'Salmon DNA + HA',
              nameKo: '연어주사 + HA',
              why: '재생 + 수분 동시',
              price: '$400-700',
              duration: '40 min',
              results: '6-8 months',
              effectiveness: 90
            }
          ],
          budget: {
            basic: '$300-500/month',
            premium: '$600-1,000/month'
          }
        },
        '50s+': {
          concern: '극도의 건조 + 노화',
          solutions: [
            {
              name: 'Intensive Regeneration',
              nameKo: '집중 재생 치료',
              why: '줄기세포 + 수분 + 영양',
              price: '$500-900',
              duration: '60 min',
              results: '6-10 months',
              effectiveness: 87
            },
            {
              name: 'Premium Anti-Aging Cocktail',
              nameKo: '프리미엄 안티에이징 칵테일',
              why: '복합 성분으로 토탈 케어',
              price: '$600-1,200',
              duration: '50 min',
              results: '8-12 months',
              effectiveness: 89
            }
          ],
          budget: {
            basic: '$400-700/month',
            premium: '$900-1,500/month'
          }
        }
      }
    }
  ];

  const ageOptions = [
    { value: '20s', label: '20s', emoji: '🌸' },
    { value: '30s', label: '30s', emoji: '✨' },
    { value: '40s', label: '40s', emoji: '👑' },
    { value: '50s+', label: '50+', emoji: '💎' }
  ];

  const selectedData = selectedConcern && selectedAge 
    ? concerns.find(c => c.id === selectedConcern)?.ageGroups[selectedAge]
    : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 py-20 px-4">
      <div className="max-w-7xl mx-auto">
        {/* 헤더 */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-indigo-100 text-indigo-700 px-4 py-2 rounded-full text-sm font-semibold mb-6">
            <Target size={16} />
            <span>Find Your Perfect Solution</span>
          </div>
          <h2 className="text-5xl font-bold mb-6 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            Concern-Based Treatment Guide
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            당신의 고민과 나이에 딱 맞는 시술을 찾아보세요
          </p>
        </div>

        {/* STEP 1: 고민 선택 */}
        <div className="mb-12">
          <h3 className="text-3xl font-bold text-center mb-8">
            <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Step 1
            </span>
            <span className="text-gray-900"> - What&apos;s Your Main Concern?</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {concerns.map((concern) => (
              <button
                key={concern.id}
                onClick={() => {
                  setSelectedConcern(concern.id);
                  setSelectedAge(null);
                }}
                className={`p-8 rounded-2xl transition-all duration-300 transform hover:-translate-y-2 hover:shadow-2xl ${
                  selectedConcern === concern.id
                    ? `bg-gradient-to-br ${concern.color} text-white shadow-2xl scale-105`
                    : 'bg-white text-gray-900 shadow-lg hover:shadow-xl'
                }`}
              >
                <div className="text-6xl mb-4">{concern.icon}</div>
                <h4 className="text-2xl font-bold mb-2">{concern.name}</h4>
                <p className={`text-sm mb-3 ${selectedConcern === concern.id ? 'text-white/90' : 'text-gray-600'}`}>
                  {concern.nameKo}
                </p>
                <p className={`text-sm ${selectedConcern === concern.id ? 'text-white/80' : 'text-gray-500'}`}>
                  {concern.description}
                </p>
                {selectedConcern === concern.id && (
                  <div className="mt-4 flex items-center justify-center gap-2">
                    <CheckCircle size={20} />
                    <span className="font-semibold">Selected</span>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* STEP 2: 연령대 선택 */}
        {selectedConcern && (
          <div className="mb-12 animate-in fade-in slide-in-from-bottom duration-500">
            <h3 className="text-3xl font-bold text-center mb-8">
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Step 2
              </span>
              <span className="text-gray-900"> - Select Your Age Group</span>
            </h3>
            <div className="flex flex-wrap justify-center gap-4">
              {ageOptions.map((age) => (
                <button
                  key={age.value}
                  onClick={() => setSelectedAge(age.value)}
                  className={`px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300 ${
                    selectedAge === age.value
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-2xl scale-110'
                      : 'bg-white text-gray-700 hover:bg-gray-50 shadow-lg hover:shadow-xl'
                  }`}
                >
                  <div className="text-3xl mb-1">{age.emoji}</div>
                  <div>{age.label}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 추천 시술 결과 */}
        {selectedData && (
          <div className="animate-in fade-in slide-in-from-bottom duration-700">
            {/* 진단 배너 */}
            <div className={`bg-gradient-to-r ${concerns.find(c => c.id === selectedConcern)?.color} rounded-3xl p-8 text-white mb-12 shadow-2xl`}>
              <div className="flex items-center gap-4 mb-4">
                <Info size={32} />
                <h3 className="text-3xl font-bold">Your Diagnosis</h3>
              </div>
              <p className="text-2xl font-semibold mb-2">{selectedData.concern}</p>
              <p className="text-lg opacity-90">
                {selectedAge} 연령대에서 가장 효과적인 솔루션을 추천해드립니다
              </p>
            </div>

            {/* 추천 시술 카드 */}
            <div className="mb-12">
              <h4 className="text-3xl font-bold mb-8 text-center">
                Recommended Treatments for You
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {selectedData.solutions.map((solution, idx) => (
                  <div
                    key={idx}
                    className="bg-white rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
                  >
                    {/* 헤더 */}
                    <div className={`bg-gradient-to-r ${concerns.find(c => c.id === selectedConcern)?.color} p-6 relative overflow-hidden`}>
                      <div className="absolute top-0 right-0 text-9xl opacity-10 font-bold">
                        {idx + 1}
                      </div>
                      <div className="relative z-10">
                        <div className="inline-block bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-semibold mb-3">
                          #{idx + 1} Recommended
                        </div>
                        <h5 className="text-3xl font-bold text-white mb-2">{solution.name}</h5>
                        <p className="text-xl text-white/90">{solution.nameKo}</p>
                      </div>
                    </div>

                    {/* 내용 */}
                    <div className="p-8">
                      {/* Why 섹션 */}
                      <div className="mb-6 p-4 bg-purple-50 rounded-xl">
                        <div className="flex items-center gap-2 mb-2">
                          <Zap size={20} className="text-purple-600" />
                          <span className="font-bold text-purple-900">Why This Works</span>
                        </div>
                        <p className="text-gray-700">{solution.why}</p>
                      </div>

                      {/* 통계 그리드 */}
                      <div className="grid grid-cols-3 gap-4 mb-6">
                        <div className="text-center p-4 bg-green-50 rounded-xl">
                          <DollarSign size={24} className="text-green-600 mx-auto mb-2" />
                          <div className="text-sm text-gray-600 mb-1">Price</div>
                          <div className="font-bold text-green-700">{solution.price}</div>
                        </div>
                        <div className="text-center p-4 bg-blue-50 rounded-xl">
                          <Clock size={24} className="text-blue-600 mx-auto mb-2" />
                          <div className="text-sm text-gray-600 mb-1">Duration</div>
                          <div className="font-bold text-blue-700">{solution.duration}</div>
                        </div>
                        <div className="text-center p-4 bg-pink-50 rounded-xl">
                          <TrendingUp size={24} className="text-pink-600 mx-auto mb-2" />
                          <div className="text-sm text-gray-600 mb-1">Results</div>
                          <div className="font-bold text-pink-700">{solution.results}</div>
                        </div>
                      </div>

                      {/* 효과 바 */}
                      <div className="mb-6">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-semibold text-gray-700">Effectiveness</span>
                          <span className="text-sm font-bold text-purple-600">{solution.effectiveness}%</span>
                        </div>
                        <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className={`h-full bg-gradient-to-r ${concerns.find(c => c.id === selectedConcern)?.color} transition-all duration-1000`}
                            style={{ width: `${solution.effectiveness}%` }}
                          />
                        </div>
                      </div>

                      {/* CTA */}
                      <button className={`w-full py-4 bg-gradient-to-r ${concerns.find(c => c.id === selectedConcern)?.color} text-white rounded-xl font-bold text-lg flex items-center justify-center gap-2 hover:shadow-lg transition-all`}>
                        Book This Treatment
                        <ArrowRight size={20} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 예산 가이드 */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-3xl p-8 border-2 border-green-200">
              <div className="flex items-center gap-3 mb-6">
                <DollarSign size={32} className="text-green-600" />
                <h4 className="text-2xl font-bold text-gray-900">Monthly Budget Guide</h4>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl p-6 shadow-lg">
                  <div className="flex items-center gap-2 mb-3">
                    <Award size={24} className="text-blue-600" />
                    <h5 className="text-xl font-bold text-gray-900">Basic Plan</h5>
                  </div>
                  <p className="text-3xl font-bold text-blue-600 mb-2">{selectedData.budget.basic}</p>
                  <p className="text-gray-600">Essential treatments for maintaining results</p>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-purple-200">
                  <div className="flex items-center gap-2 mb-3">
                    <Award size={24} className="text-purple-600" />
                    <h5 className="text-xl font-bold text-gray-900">Premium Plan</h5>
                  </div>
                  <p className="text-3xl font-bold text-purple-600 mb-2">{selectedData.budget.premium}</p>
                  <p className="text-gray-600">Comprehensive care for optimal results</p>
                </div>
              </div>
            </div>

            {/* 다시 선택 버튼 */}
            <div className="text-center mt-12">
              <button
                onClick={() => {
                  setSelectedConcern(null);
                  setSelectedAge(null);
                }}
                className="px-8 py-4 bg-white text-purple-600 border-2 border-purple-600 rounded-xl font-bold text-lg hover:bg-purple-50 transition-all"
              >
                ← Start Over
              </button>
            </div>
          </div>
        )}

        {/* 하단 CTA (초기 상태) */}
        {!selectedConcern && (
          <div className="text-center bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 rounded-3xl p-12 text-white mt-12">
            <h3 className="text-4xl font-bold mb-4">Still Not Sure?</h3>
            <p className="text-xl mb-8 opacity-90">
              전문 상담사와 1:1 무료 상담을 받아보세요
            </p>
            <button className="px-8 py-4 bg-white text-purple-600 rounded-xl font-bold text-lg hover:shadow-xl transition-all transform hover:scale-105">
              Get Free Consultation
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConcernBasedGuide;
