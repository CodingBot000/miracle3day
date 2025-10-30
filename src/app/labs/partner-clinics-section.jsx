'use client';

import React, { useState } from 'react';
import { 
  MapPin, Award, Users, Star, CheckCircle, Globe, 
  MessageCircle, Calendar, ChevronRight, Filter, Search,
  Stethoscope, Heart, TrendingUp, Shield
} from 'lucide-react';

const PartnerClinicsSection = () => {
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState(null);

  // 병원 데이터
  const clinics = [
    {
      id: 1,
      name: 'Seoul Beauty Clinic',
      nameKo: '서울 뷰티 클리닉',
      location: 'Gangnam, Seoul',
      specialty: ['Dermatology', 'Anti-Aging'],
      rating: 4.9,
      reviews: 2847,
      verified: true,
      international: true,
      languages: ['English', 'Chinese', 'Japanese'],
      treatments: ['Botox', 'Filler', 'Laser', 'Thread Lift'],
      experience: '15+ years',
      patients: '50,000+',
      image: '🏥',
      color: 'purple'
    },
    {
      id: 2,
      name: 'K-Beauty Medical Center',
      nameKo: 'K-뷰티 메디컬 센터',
      location: 'Apgujeong, Seoul',
      specialty: ['Plastic Surgery', 'Aesthetic'],
      rating: 4.8,
      reviews: 1923,
      verified: true,
      international: true,
      languages: ['English', 'Russian', 'Arabic'],
      treatments: ['Rhinoplasty', 'Double Eyelid', 'Facial Contouring'],
      experience: '20+ years',
      patients: '30,000+',
      image: '🏥',
      color: 'blue'
    },
    {
      id: 3,
      name: 'Glow Dermatology',
      nameKo: '글로우 피부과',
      location: 'Sinsa, Seoul',
      specialty: ['Dermatology', 'Skin Care'],
      rating: 4.9,
      reviews: 3241,
      verified: true,
      international: true,
      languages: ['English', 'Chinese', 'Vietnamese'],
      treatments: ['Laser', 'Acne Treatment', 'Skin Booster'],
      experience: '12+ years',
      patients: '40,000+',
      image: '🏥',
      color: 'pink'
    },
    {
      id: 4,
      name: 'Elite Aesthetic Surgery',
      nameKo: '엘리트 성형외과',
      location: 'Cheongdam, Seoul',
      specialty: ['Plastic Surgery', 'Body Contouring'],
      rating: 4.7,
      reviews: 1567,
      verified: true,
      international: true,
      languages: ['English', 'Japanese', 'Thai'],
      treatments: ['Liposuction', 'Breast Surgery', 'Face Lift'],
      experience: '18+ years',
      patients: '25,000+',
      image: '🏥',
      color: 'indigo'
    }
  ];

  // 의료진 데이터
  const doctors = [
    {
      id: 1,
      clinicId: 1,
      name: 'Dr. Kim Min-ji',
      nameKo: '김민지 원장',
      title: 'Chief Dermatologist',
      specialty: 'Anti-Aging & Laser',
      experience: 15,
      education: ['Seoul National University', 'Harvard Medical School'],
      certifications: ['Board Certified Dermatologist', 'Laser Specialist'],
      languages: ['Korean', 'English', 'Japanese'],
      consultations: 15000,
      rating: 4.9,
      avatar: '👩‍⚕️',
      achievements: [
        'Published 20+ research papers',
        'International speaker',
        'Award-winning physician'
      ]
    },
    {
      id: 2,
      clinicId: 2,
      name: 'Dr. Lee Sung-ho',
      nameKo: '이성호 원장',
      title: 'Lead Plastic Surgeon',
      specialty: 'Facial Surgery',
      experience: 20,
      education: ['Yonsei University', 'Johns Hopkins'],
      certifications: ['Board Certified Surgeon', 'Aesthetic Surgery Specialist'],
      languages: ['Korean', 'English', 'Chinese'],
      consultations: 12000,
      rating: 4.8,
      avatar: '👨‍⚕️',
      achievements: [
        '10,000+ successful surgeries',
        'Featured in medical journals',
        'Celebrity surgeon'
      ]
    },
    {
      id: 3,
      clinicId: 3,
      name: 'Dr. Park Su-jin',
      nameKo: '박수진 원장',
      title: 'Senior Dermatologist',
      specialty: 'Acne & Pigmentation',
      experience: 12,
      education: ['Korea University', 'UCLA Medical Center'],
      certifications: ['Board Certified', 'Cosmetic Dermatology'],
      languages: ['Korean', 'English'],
      consultations: 18000,
      rating: 4.9,
      avatar: '👩‍⚕️',
      achievements: [
        'Acne treatment specialist',
        'Featured in beauty magazines',
        'Social media influencer (200K+)'
      ]
    }
  ];

  const categories = [
    { id: 'all', name: 'All Clinics', icon: Globe },
    { id: 'dermatology', name: 'Dermatology', icon: Stethoscope },
    { id: 'surgery', name: 'Plastic Surgery', icon: Heart },
    { id: 'aesthetic', name: 'Aesthetic', icon: TrendingUp }
  ];

  const filteredClinics = clinics.filter(clinic => {
    const matchesFilter = activeFilter === 'all' || 
      clinic.specialty.some(s => s.toLowerCase().includes(activeFilter));
    const matchesSearch = clinic.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      clinic.nameKo.includes(searchQuery);
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50 to-pink-50 py-20 px-4">
      <div className="max-w-7xl mx-auto">
        {/* 헤더 */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-700 px-4 py-2 rounded-full text-sm font-semibold mb-6">
            <Shield size={16} />
            <span>Verified & Trusted Partners</span>
          </div>
          <h2 className="text-5xl font-bold mb-6 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Our Partner Clinics & Specialists
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            한국 최고의 의료진과 함께하세요. 모든 파트너는 엄격한 검증을 거쳤습니다.
          </p>
        </div>

        {/* 검색 & 필터 */}
        <div className="mb-12">
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            {/* 검색창 */}
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search clinics or treatments..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-xl border-2 border-gray-200 focus:border-purple-500 outline-none text-lg"
              />
            </div>
          </div>

          {/* 카테고리 필터 */}
          <div className="flex flex-wrap gap-3">
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <button
                  key={category.id}
                  onClick={() => setActiveFilter(category.id)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-all duration-300 ${
                    activeFilter === category.id
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
        </div>

        {/* 통계 배너 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          <div className="bg-white rounded-2xl p-6 text-center shadow-lg">
            <div className="text-4xl font-bold text-purple-600 mb-2">50+</div>
            <div className="text-gray-600">Partner Clinics</div>
          </div>
          <div className="bg-white rounded-2xl p-6 text-center shadow-lg">
            <div className="text-4xl font-bold text-blue-600 mb-2">200+</div>
            <div className="text-gray-600">Specialists</div>
          </div>
          <div className="bg-white rounded-2xl p-6 text-center shadow-lg">
            <div className="text-4xl font-bold text-pink-600 mb-2">100K+</div>
            <div className="text-gray-600">Happy Patients</div>
          </div>
          <div className="bg-white rounded-2xl p-6 text-center shadow-lg">
            <div className="text-4xl font-bold text-green-600 mb-2">4.8★</div>
            <div className="text-gray-600">Average Rating</div>
          </div>
        </div>

        {/* 클리닉 카드 그리드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {filteredClinics.map((clinic) => (
            <div key={clinic.id} className="bg-white rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
              {/* 클리닉 헤더 */}
              <div className={`bg-gradient-to-r ${
                clinic.color === 'purple' ? 'from-purple-500 to-purple-600' :
                clinic.color === 'blue' ? 'from-blue-500 to-blue-600' :
                clinic.color === 'pink' ? 'from-pink-500 to-pink-600' :
                'from-indigo-500 to-indigo-600'
              } p-8 relative overflow-hidden`}>
                <div className="absolute top-0 right-0 text-9xl opacity-10">
                  {clinic.image}
                </div>
                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-3xl font-bold text-white mb-1">{clinic.name}</h3>
                      <p className="text-white/90 text-lg">{clinic.nameKo}</p>
                    </div>
                    {clinic.verified && (
                      <div className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full flex items-center gap-1">
                        <CheckCircle size={16} className="text-white" />
                        <span className="text-white text-sm font-semibold">Verified</span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-white/90">
                    <MapPin size={18} />
                    <span>{clinic.location}</span>
                  </div>
                </div>
              </div>

              {/* 클리닉 정보 */}
              <div className="p-8">
                {/* 평점 & 리뷰 */}
                <div className="flex items-center gap-6 mb-6 pb-6 border-b border-gray-200">
                  <div className="flex items-center gap-2">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={20}
                          className={i < Math.floor(clinic.rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}
                        />
                      ))}
                    </div>
                    <span className="text-2xl font-bold text-gray-900">{clinic.rating}</span>
                  </div>
                  <div className="text-gray-600">
                    <span className="font-semibold">{clinic.reviews.toLocaleString()}</span> reviews
                  </div>
                </div>

                {/* 전문 분야 */}
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Award size={18} className="text-purple-600" />
                    Specialties
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {clinic.specialty.map((spec, idx) => (
                      <span key={idx} className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                        {spec}
                      </span>
                    ))}
                  </div>
                </div>

                {/* 시술 항목 */}
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Stethoscope size={18} className="text-blue-600" />
                    Popular Treatments
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {clinic.treatments.map((treatment, idx) => (
                      <span key={idx} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm">
                        {treatment}
                      </span>
                    ))}
                  </div>
                </div>

                {/* 통계 */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="text-center p-4 bg-gray-50 rounded-xl">
                    <div className="text-2xl font-bold text-purple-600 mb-1">{clinic.experience}</div>
                    <div className="text-sm text-gray-600">Experience</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-xl">
                    <div className="text-2xl font-bold text-blue-600 mb-1">{clinic.patients}</div>
                    <div className="text-sm text-gray-600">Patients</div>
                  </div>
                </div>

                {/* 언어 지원 */}
                {clinic.international && (
                  <div className="mb-6">
                    <div className="flex items-center gap-2 mb-2">
                      <Globe size={18} className="text-green-600" />
                      <span className="font-semibold text-gray-900">Languages</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {clinic.languages.map((lang, idx) => (
                        <span key={idx} className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm">
                          {lang}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* CTA 버튼 */}
                <div className="flex gap-3">
                  <button className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold flex items-center justify-center gap-2 hover:shadow-lg transition-all">
                    <Calendar size={18} />
                    Book Consultation
                  </button>
                  <button className="flex-1 py-3 border-2 border-purple-600 text-purple-600 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-purple-50 transition-all">
                    <MessageCircle size={18} />
                    Chat Now
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 의료진 섹션 */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h3 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Meet Our Expert Doctors
            </h3>
            <p className="text-lg text-gray-600">
              경험과 전문성을 갖춘 최고의 의료진
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {doctors.map((doctor) => (
              <div
                key={doctor.id}
                onClick={() => setSelectedDoctor(doctor)}
                className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:-translate-y-2"
              >
                {/* 의사 프로필 */}
                <div className="text-center mb-6">
                  <div className="text-7xl mb-4">{doctor.avatar}</div>
                  <h4 className="text-2xl font-bold text-gray-900 mb-1">{doctor.name}</h4>
                  <p className="text-gray-600 mb-2">{doctor.nameKo}</p>
                  <p className="text-purple-600 font-semibold">{doctor.title}</p>
                </div>

                {/* 전문 분야 */}
                <div className="mb-4 pb-4 border-b border-gray-200">
                  <div className="text-sm text-gray-600 mb-1">Specialty</div>
                  <div className="font-semibold text-gray-900">{doctor.specialty}</div>
                </div>

                {/* 통계 */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="text-center p-3 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600 mb-1">{doctor.experience}</div>
                    <div className="text-xs text-gray-600">Years</div>
                  </div>
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600 mb-1">{doctor.consultations.toLocaleString()}</div>
                    <div className="text-xs text-gray-600">Consultations</div>
                  </div>
                </div>

                {/* 평점 */}
                <div className="flex items-center justify-center gap-2 mb-4">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={16}
                        className={i < Math.floor(doctor.rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}
                      />
                    ))}
                  </div>
                  <span className="font-bold text-gray-900">{doctor.rating}</span>
                </div>

                {/* CTA */}
                <button className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold flex items-center justify-center gap-2 hover:shadow-lg transition-all">
                  View Profile
                  <ChevronRight size={18} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* 하단 CTA */}
        <div className="text-center bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 rounded-3xl p-12 text-white">
          <h3 className="text-4xl font-bold mb-4">Can&apos;t Find What You&apos;re Looking For?</h3>
          <p className="text-xl mb-8 opacity-90">
            우리의 전문 상담팀이 당신에게 완벽한 병원을 찾아드립니다
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="px-8 py-4 bg-white text-purple-600 rounded-xl font-bold text-lg hover:shadow-xl transition-all">
              Get Personalized Recommendations
            </button>
            <button className="px-8 py-4 border-2 border-white text-white rounded-xl font-bold text-lg hover:bg-white/10 transition-all">
              Contact Support Team
            </button>
          </div>
        </div>
      </div>

      {/* 의사 상세 모달 */}
      {selectedDoctor && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-8">
              {/* 헤더 */}
              <div className="flex items-start justify-between mb-8">
                <div className="flex items-center gap-6">
                  <div className="text-6xl">{selectedDoctor.avatar}</div>
                  <div>
                    <h3 className="text-3xl font-bold text-gray-900 mb-1">{selectedDoctor.name}</h3>
                    <p className="text-gray-600 mb-2">{selectedDoctor.nameKo}</p>
                    <p className="text-purple-600 font-semibold text-lg">{selectedDoctor.title}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedDoctor(null)}
                  className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
                >
                  ×
                </button>
              </div>

              {/* 통계 */}
              <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="text-center p-4 bg-purple-50 rounded-xl">
                  <div className="text-3xl font-bold text-purple-600 mb-1">{selectedDoctor.experience}</div>
                  <div className="text-sm text-gray-600">Years Experience</div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-xl">
                  <div className="text-3xl font-bold text-blue-600 mb-1">{selectedDoctor.consultations.toLocaleString()}</div>
                  <div className="text-sm text-gray-600">Consultations</div>
                </div>
                <div className="text-center p-4 bg-pink-50 rounded-xl">
                  <div className="text-3xl font-bold text-pink-600 mb-1">{selectedDoctor.rating}★</div>
                  <div className="text-sm text-gray-600">Patient Rating</div>
                </div>
              </div>

              {/* 교육 */}
              <div className="mb-6">
                <h4 className="text-xl font-bold mb-3">Education</h4>
                <ul className="space-y-2">
                  {selectedDoctor.education.map((edu, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-gray-700">
                      <CheckCircle size={18} className="text-green-600" />
                      {edu}
                    </li>
                  ))}
                </ul>
              </div>

              {/* 자격증 */}
              <div className="mb-6">
                <h4 className="text-xl font-bold mb-3">Certifications</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedDoctor.certifications.map((cert, idx) => (
                    <span key={idx} className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg font-medium">
                      {cert}
                    </span>
                  ))}
                </div>
              </div>

              {/* 성과 */}
              <div className="mb-8">
                <h4 className="text-xl font-bold mb-3">Achievements</h4>
                <ul className="space-y-2">
                  {selectedDoctor.achievements.map((achievement, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-gray-700">
                      <Award size={18} className="text-purple-600 flex-shrink-0 mt-1" />
                      {achievement}
                    </li>
                  ))}
                </ul>
              </div>

              {/* CTA */}
              <div className="flex gap-4">
                <button className="flex-1 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold text-lg hover:shadow-lg transition-all">
                  Book with Dr. {selectedDoctor.name.split(' ')[1]}
                </button>
                <button className="flex-1 py-4 border-2 border-purple-600 text-purple-600 rounded-xl font-bold text-lg hover:bg-purple-50 transition-all">
                  Send Message
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PartnerClinicsSection;
