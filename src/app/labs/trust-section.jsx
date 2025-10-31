'use client';
import React, { useState, useEffect } from 'react';
import { 
  Star, Award, Shield, Users, TrendingUp, CheckCircle, 
  ThumbsUp, Globe, Heart, Quote, ChevronLeft, ChevronRight,
  BarChart3, Zap, Clock, DollarSign
} from 'lucide-react';

const TrustSection = () => {
  const [currentReview, setCurrentReview] = useState(0);
  const [animatingStats, setAnimatingStats] = useState(false);

  // 통계 데이터
  const stats = [
    {
      icon: Users,
      number: '100,000+',
      label: 'International Patients',
      subtext: '지난 3년간 치료받은 환자 수',
      color: 'from-blue-500 to-blue-600'
    },
    {
      icon: Star,
      number: '4.9/5.0',
      label: 'Average Rating',
      subtext: '15,000+ 실제 리뷰 기반',
      color: 'from-yellow-500 to-orange-600'
    },
    {
      icon: Award,
      number: '50+',
      label: 'Certified Clinics',
      subtext: '정부 인증 파트너 병원',
      color: 'from-purple-500 to-purple-600'
    },
    {
      icon: Globe,
      number: '120+',
      label: 'Countries Served',
      subtext: '전 세계에서 방문',
      color: 'from-green-500 to-emerald-600'
    }
  ];

  // 리뷰 데이터
  const reviews = [
    {
      id: 1,
      name: 'Sarah Johnson',
      country: 'USA 🇺🇸',
      treatment: 'Botox & Filler',
      rating: 5,
      date: 'October 2024',
      text: 'My experience in Seoul was absolutely incredible! The clinic was so professional and the results exceeded my expectations. The consultation was thorough, and they made sure I understood every step. Worth every penny!',
      beforeAfter: 'Amazing transformation',
      avatar: '👩'
    },
    {
      id: 2,
      name: 'Emma Williams',
      country: 'UK 🇬🇧',
      treatment: 'Laser Treatment',
      rating: 5,
      date: 'September 2024',
      text: 'I was nervous about traveling abroad for treatment, but the team made everything so easy. From booking to aftercare, everything was handled perfectly. My skin has never looked better!',
      beforeAfter: 'Visible improvement',
      avatar: '👩‍🦰'
    },
    {
      id: 3,
      name: 'Michael Chen',
      country: 'Canada 🇨🇦',
      treatment: 'Thread Lift',
      rating: 5,
      date: 'August 2024',
      text: 'The level of expertise here is unmatched. I did extensive research before choosing Korea, and I\'m so glad I did. The doctor was highly skilled and the facility was state-of-the-art.',
      beforeAfter: 'Natural-looking results',
      avatar: '👨'
    },
    {
      id: 4,
      name: 'Sophie Martin',
      country: 'France 🇫🇷',
      treatment: 'Acne Scar Treatment',
      rating: 5,
      date: 'July 2024',
      text: 'After years of struggling with acne scars, I finally found a solution. The treatment plan was customized for my skin type, and the results have been life-changing. Highly recommend!',
      beforeAfter: 'Dramatic improvement',
      avatar: '👩‍🦱'
    },
    {
      id: 5,
      name: 'David Kim',
      country: 'Australia 🇦🇺',
      treatment: 'HIFU Lifting',
      rating: 5,
      date: 'June 2024',
      text: 'Best decision I\'ve made for my appearance. The non-surgical facelift gave me exactly what I wanted - a refreshed look without the downtime. The staff spoke excellent English too!',
      beforeAfter: 'Youthful appearance restored',
      avatar: '👨‍🦱'
    }
  ];

  // 인증 배지
  const certifications = [
    {
      icon: Shield,
      title: 'Government Certified',
      description: '한국 보건복지부 인증',
      color: 'blue'
    },
    {
      icon: Award,
      title: 'ISO 9001 Certified',
      description: '국제 품질 경영 인증',
      color: 'purple'
    },
    {
      icon: CheckCircle,
      title: 'Medical Tourism Approved',
      description: '의료관광 품질 인증',
      color: 'green'
    },
    {
      icon: Heart,
      title: 'Patient Safety First',
      description: '환자 안전 최우선 정책',
      color: 'red'
    }
  ];

  // Success Stories 데이터
  const successStories = [
    {
      percentage: 98,
      label: 'Satisfaction Rate',
      description: '환자 만족도'
    },
    {
      percentage: 95,
      label: 'Would Recommend',
      description: '재방문 및 추천 의향'
    },
    {
      percentage: 92,
      label: 'Exceeded Expectations',
      description: '기대 이상의 결과'
    }
  ];

  // 리뷰 자동 슬라이드
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentReview((prev) => (prev + 1) % reviews.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const nextReview = () => {
    setCurrentReview((prev) => (prev + 1) % reviews.length);
  };

  const prevReview = () => {
    setCurrentReview((prev) => (prev - 1 + reviews.length) % reviews.length);
  };

  return (
    <div className="bg-gradient-to-br from-gray-50 via-white to-purple-50 py-20 px-4">
      <div className="max-w-7xl mx-auto">
        {/* 헤더 */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-semibold mb-6">
            <Shield size={16} />
            <span>Trusted by Thousands Worldwide</span>
          </div>
          <h2 className="text-5xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            Why Patients Choose Us
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            전 세계 환자들이 선택한 검증된 의료 서비스
          </p>
        </div>

        {/* 통계 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div
                key={idx}
                className="bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-t-4 border-transparent hover:border-purple-500"
              >
                <div className={`w-16 h-16 bg-gradient-to-br ${stat.color} rounded-2xl flex items-center justify-center mb-4 transform transition-transform hover:rotate-12`}>
                  <Icon size={32} className="text-white" />
                </div>
                <div className="text-4xl font-bold text-gray-900 mb-2">{stat.number}</div>
                <div className="text-lg font-semibold text-gray-700 mb-1">{stat.label}</div>
                <div className="text-sm text-gray-500">{stat.subtext}</div>
              </div>
            );
          })}
        </div>

        {/* 리뷰 캐러셀 */}
        <div className="mb-16">
          <h3 className="text-4xl font-bold text-center mb-12">
            Real Stories from Real Patients
          </h3>
          <div className="relative max-w-4xl mx-auto">
            {/* 리뷰 카드 */}
            <div className="bg-white rounded-3xl p-10 shadow-2xl">
              <div className="flex items-center gap-2 mb-6">
                <Quote size={32} className="text-purple-400" />
              </div>
              
              {/* 별점 */}
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={24}
                    className={i < reviews[currentReview].rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}
                  />
                ))}
              </div>

              {/* 리뷰 텍스트 */}
              <p className="text-xl text-gray-700 mb-6 leading-relaxed italic">
                &ldquo;{reviews[currentReview].text}&rdquo;
              </p>

              {/* Before/After 결과 */}
              <div className="inline-block bg-purple-100 text-purple-700 px-4 py-2 rounded-full text-sm font-semibold mb-6">
                ✨ {reviews[currentReview].beforeAfter}
              </div>

              {/* 리뷰어 정보 */}
              <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                <div className="flex items-center gap-4">
                  <div className="text-5xl">{reviews[currentReview].avatar}</div>
                  <div>
                    <div className="font-bold text-lg text-gray-900">{reviews[currentReview].name}</div>
                    <div className="text-gray-600">{reviews[currentReview].country}</div>
                    <div className="text-sm text-purple-600 font-semibold">{reviews[currentReview].treatment}</div>
                  </div>
                </div>
                <div className="text-sm text-gray-500">{reviews[currentReview].date}</div>
              </div>
            </div>

            {/* 네비게이션 버튼 */}
            <button
              onClick={prevReview}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-6 bg-white rounded-full p-3 shadow-lg hover:shadow-xl transition-all hover:scale-110"
            >
              <ChevronLeft size={24} className="text-gray-700" />
            </button>
            <button
              onClick={nextReview}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-6 bg-white rounded-full p-3 shadow-lg hover:shadow-xl transition-all hover:scale-110"
            >
              <ChevronRight size={24} className="text-gray-700" />
            </button>

            {/* 인디케이터 */}
            <div className="flex justify-center gap-2 mt-6">
              {reviews.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentReview(idx)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    idx === currentReview ? 'w-8 bg-purple-600' : 'w-2 bg-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* 인증 배지 */}
        <div className="mb-16">
          <h3 className="text-4xl font-bold text-center mb-12">
            Certified & Trusted
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {certifications.map((cert, idx) => {
              const Icon = cert.icon;
              const colorMap = {
                blue: 'from-blue-500 to-blue-600',
                purple: 'from-purple-500 to-purple-600',
                green: 'from-green-500 to-green-600',
                red: 'from-red-500 to-pink-600'
              };
              return (
                <div
                  key={idx}
                  className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all text-center"
                >
                  <div className={`w-20 h-20 bg-gradient-to-br ${colorMap[cert.color]} rounded-full flex items-center justify-center mx-auto mb-4`}>
                    <Icon size={40} className="text-white" />
                  </div>
                  <h4 className="font-bold text-lg text-gray-900 mb-2">{cert.title}</h4>
                  <p className="text-sm text-gray-600">{cert.description}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Success Rate */}
        <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 rounded-3xl p-12 text-white mb-16">
          <h3 className="text-4xl font-bold text-center mb-12">
            Our Success by Numbers
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {successStories.map((story, idx) => (
              <div key={idx} className="text-center">
                <div className="mb-4">
                  <div className="text-6xl font-bold mb-2">{story.percentage}%</div>
                  <div className="text-xl font-semibold mb-1">{story.label}</div>
                  <div className="text-white/80">{story.description}</div>
                </div>
                {/* 프로그레스 바 */}
                <div className="w-full h-3 bg-white/20 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-white transition-all duration-1000 ease-out rounded-full"
                    style={{ width: `${story.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Trust Badges Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          <div className="bg-white rounded-xl p-6 shadow-lg text-center">
            <Clock size={40} className="text-blue-600 mx-auto mb-3" />
            <div className="font-bold text-gray-900 mb-1">24/7 Support</div>
            <div className="text-sm text-gray-600">언제든 문의 가능</div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-lg text-center">
            <DollarSign size={40} className="text-green-600 mx-auto mb-3" />
            <div className="font-bold text-gray-900 mb-1">Transparent Pricing</div>
            <div className="text-sm text-gray-600">숨겨진 비용 없음</div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-lg text-center">
            <Shield size={40} className="text-purple-600 mx-auto mb-3" />
            <div className="font-bold text-gray-900 mb-1">Secure & Safe</div>
            <div className="text-sm text-gray-600">안전한 의료 환경</div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-lg text-center">
            <Zap size={40} className="text-yellow-600 mx-auto mb-3" />
            <div className="font-bold text-gray-900 mb-1">Fast Response</div>
            <div className="text-sm text-gray-600">빠른 응답 시간</div>
          </div>
        </div>

        {/* Social Proof */}
        <div className="bg-gradient-to-br from-gray-50 to-purple-50 rounded-3xl p-12">
          <div className="text-center mb-8">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              Featured In
            </h3>
            <p className="text-gray-600">
              주요 언론 매체에 소개된 신뢰할 수 있는 의료 플랫폼
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 items-center">
            {['Forbes', 'CNN', 'BBC', 'The Times', 'Bloomberg'].map((media, idx) => (
              <div key={idx} className="text-center">
                <div className="text-2xl font-bold text-gray-400">{media}</div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-16">
          <h3 className="text-3xl font-bold text-gray-900 mb-4">
            Join Thousands of Satisfied Patients
          </h3>
          <p className="text-xl text-gray-600 mb-8">
            당신의 아름다움 여정을 시작하세요
          </p>
          <button className="px-10 py-5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold text-xl hover:shadow-2xl transition-all transform hover:scale-105 flex items-center gap-3 mx-auto">
            <ThumbsUp size={24} />
            Start Your Journey Today
          </button>
        </div>
      </div>
    </div>
  );
};

export default TrustSection;
