'use client';

import Link from 'next/link';
import React from 'react';

export default function CustomerSupportClient() {
  return (
    <main className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold mb-6">How can we assist you?</h1>
      <p className="mb-4">
        FAQ
      </p>
      <p className="mb-4">
        Guest Order Lookup
      </p>
      <p className="mb-4">
        Contact Us
      </p>
      <Link href="mailto:mimotok.official@gmail.com" className="text-blue-600 underline">
        mimotok.official@gmail.com
      </Link>
        
    </main>
  );
}

// 'use client';

// import Link from 'next/link';
// import { Mail, Phone, MessageCircle, Clock, MapPin, Globe, FileQuestion, Calendar } from 'lucide-react';
// import { useTranslations, useLocale } from 'next-intl';

// export default function CustomerSupportClient() {
//   const t = useTranslations('CustomerSupport');
//   const locale = useLocale();

//   const supportCategories = [
//     {
//       icon: Calendar,
//       title: 'Booking & Consultation',
//       titleKo: '예약 및 상담',
//       description: 'Questions about appointments, consultations, and booking procedures',
//       descriptionKo: '예약, 상담, 예약 절차에 관한 문의',
//       links: [
//         { text: 'How to book a consultation', href: '/help/booking' },
//         { text: 'Change or cancel appointment', href: '/help/cancel' },
//         { text: 'Video consultation guide', href: '/help/video-consult' },
//       ],
//     },
//     {
//       icon: FileQuestion,
//       title: 'Treatment Information',
//       titleKo: '시술 정보',
//       description: 'Details about procedures, recovery time, and medical requirements',
//       descriptionKo: '시술, 회복 기간, 의료 요구사항에 대한 정보',
//       links: [
//         { text: 'Treatment guide by age', href: '/treatment/antiaging-guide' },
//         { text: 'Pre-treatment checklist', href: '/help/pre-treatment' },
//         { text: 'Post-care instructions', href: '/help/post-care' },
//       ],
//     },
//     {
//       icon: MapPin,
//       title: 'Travel & Accommodation',
//       titleKo: '여행 및 숙박',
//       description: 'Help with travel planning, accommodation, and transportation',
//       descriptionKo: '여행 계획, 숙박, 교통편에 대한 도움',
//       links: [
//         { text: 'Airport pickup service', href: '/help/airport' },
//         { text: 'Recommended hotels', href: '/help/hotels' },
//         { text: 'Seoul travel guide', href: '/help/travel-guide' },
//       ],
//     },
//     {
//       icon: Globe,
//       title: 'Language Support',
//       titleKo: '언어 지원',
//       description: 'We support English, Japanese, Chinese, and Korean',
//       descriptionKo: '영어, 일본어, 중국어, 한국어 지원',
//       links: [
//         { text: 'Interpreter service', href: '/help/interpreter' },
//         { text: 'Medical documents translation', href: '/help/translation' },
//       ],
//     },
//   ];

//   const contactMethods = [
//     {
//       icon: Mail,
//       title: 'Email',
//       value: 'mimotok.official@gmail.com',
//       link: 'mailto:mimotok.official@gmail.com',
//       description: 'Response within 24 hours',
//       descriptionKo: '24시간 이내 답변',
//     },
//     {
//       icon: MessageCircle,
//       title: 'KakaoTalk',
//       value: '@mimotok',
//       link: 'http://pf.kakao.com/_your_channel_id',
//       description: 'Real-time chat (9 AM - 6 PM KST)',
//       descriptionKo: '실시간 채팅 (오전 9시 - 오후 6시 KST)',
//     },
//     {
//       icon: Phone,
//       title: 'WhatsApp',
//       value: '+82-10-XXXX-XXXX',
//       link: 'https://wa.me/8210XXXXXXXX',
//       description: 'For international patients',
//       descriptionKo: '해외 환자 전용',
//     },
//   ];

//   const emergencyContact = {
//     title: 'Emergency Support',
//     titleKo: '긴급 지원',
//     description: 'For urgent medical concerns during your stay',
//     descriptionKo: '체류 중 긴급 의료 상황',
//     phone: '+82-10-XXXX-XXXX',
//     available: '24/7 Available',
//     availableKo: '24시간 이용 가능',
//   };

//   const businessHours = {
//     title: 'Business Hours',
//     titleKo: '운영 시간',
//     weekday: 'Mon - Fri: 9:00 AM - 6:00 PM (KST)',
//     weekdayKo: '월-금: 오전 9시 - 오후 6시 (한국시간)',
//     weekend: 'Sat: 10:00 AM - 3:00 PM (KST)',
//     weekendKo: '토: 오전 10시 - 오후 3시 (한국시간)',
//     closed: 'Closed on Sundays and Korean holidays',
//     closedKo: '일요일 및 한국 공휴일 휴무',
//   };

//   return (
//     <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
//       <div className="max-w-6xl mx-auto px-4 py-12">
//         {/* Header */}
//         <div className="text-center mb-12">
//           <h1 className="text-4xl font-bold text-gray-900 mb-4">
//             {locale === 'ko' ? '고객 지원' : 'Customer Support'}
//           </h1>
//           <p className="text-lg text-gray-600 max-w-2xl mx-auto">
//             {locale === 'ko' 
//               ? '무엇을 도와드릴까요? 아래에서 필요한 정보를 찾거나 직접 문의해 주세요.'
//               : 'How can we assist you? Find the information you need below or contact us directly.'}
//           </p>
//         </div>

//         {/* Support Categories */}
//         <div className="grid md:grid-cols-2 gap-6 mb-12">
//           {supportCategories.map((category, index) => (
//             <div
//               key={index}
//               className="bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100"
//             >
//               <div className="flex items-start gap-4 mb-4">
//                 <div className="p-3 bg-gradient-to-br from-rose-100 to-pink-100 rounded-lg">
//                   <category.icon className="w-6 h-6 text-rose-600" />
//                 </div>
//                 <div className="flex-1">
//                   <h3 className="text-xl font-semibold text-gray-900 mb-2">
//                     {locale === 'ko' ? category.titleKo : category.title}
//                   </h3>
//                   <p className="text-gray-600 text-sm">
//                     {locale === 'ko' ? category.descriptionKo : category.description}
//                   </p>
//                 </div>
//               </div>
//               <div className="space-y-2 ml-16">
//                 {category.links.map((link, linkIndex) => (
//                   <Link
//                     key={linkIndex}
//                     href={link.href}
//                     className="block text-rose-600 hover:text-rose-700 text-sm hover:underline"
//                   >
//                     → {link.text}
//                   </Link>
//                 ))}
//               </div>
//             </div>
//           ))}
//         </div>

//         {/* Contact Methods */}
//         <div className="bg-white rounded-xl p-8 shadow-lg mb-12">
//           <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
//             {locale === 'ko' ? '연락 방법' : 'Contact Methods'}
//           </h2>
//           <div className="grid md:grid-cols-3 gap-6">
//             {contactMethods.map((method, index) => (
//               <a
//                 key={index}
//                 href={method.link}
//                 target="_blank"
//                 rel="noopener noreferrer"
//                 className="flex flex-col items-center text-center p-6 rounded-lg border-2 border-gray-100 hover:border-rose-300 hover:bg-rose-50 transition-all duration-300 group"
//               >
//                 <div className="p-4 bg-gradient-to-br from-rose-500 to-pink-500 rounded-full mb-4 group-hover:scale-110 transition-transform">
//                   <method.icon className="w-6 h-6 text-white" />
//                 </div>
//                 <h3 className="font-semibold text-gray-900 mb-2">{method.title}</h3>
//                 <p className="text-rose-600 font-medium mb-2">{method.value}</p>
//                 <p className="text-sm text-gray-500">
//                   {locale === 'ko' ? method.descriptionKo : method.description}
//                 </p>
//               </a>
//             ))}
//           </div>
//         </div>

//         {/* Emergency Contact */}
//         <div className="bg-gradient-to-r from-red-50 to-rose-50 rounded-xl p-8 shadow-lg mb-12 border-2 border-red-200">
//           <div className="flex items-center gap-4 mb-4">
//             <div className="p-3 bg-red-500 rounded-lg">
//               <Phone className="w-6 h-6 text-white" />
//             </div>
//             <div>
//               <h2 className="text-2xl font-bold text-red-900">
//                 {locale === 'ko' ? emergencyContact.titleKo : emergencyContact.title}
//               </h2>
//               <p className="text-red-700">
//                 {locale === 'ko' ? emergencyContact.descriptionKo : emergencyContact.description}
//               </p>
//             </div>
//           </div>
//           <div className="ml-16">
//             <a
//               href={`tel:${emergencyContact.phone}`}
//               className="text-2xl font-bold text-red-600 hover:text-red-700"
//             >
//               {emergencyContact.phone}
//             </a>
//             <p className="text-red-600 font-medium mt-2">
//               {locale === 'ko' ? emergencyContact.availableKo : emergencyContact.available}
//             </p>
//           </div>
//         </div>

//         {/* Business Hours */}
//         <div className="bg-white rounded-xl p-8 shadow-lg mb-12">
//           <div className="flex items-center gap-3 mb-6">
//             <Clock className="w-6 h-6 text-rose-600" />
//             <h2 className="text-2xl font-bold text-gray-900">
//               {locale === 'ko' ? businessHours.titleKo : businessHours.title}
//             </h2>
//           </div>
//           <div className="space-y-2 text-gray-700">
//             <p className="flex justify-between">
//               <span className="font-medium">
//                 {locale === 'ko' ? '평일' : 'Weekdays'}:
//               </span>
//               <span>{locale === 'ko' ? businessHours.weekdayKo : businessHours.weekday}</span>
//             </p>
//             <p className="flex justify-between">
//               <span className="font-medium">
//                 {locale === 'ko' ? '토요일' : 'Saturday'}:
//               </span>
//               <span>{locale === 'ko' ? businessHours.weekendKo : businessHours.weekend}</span>
//             </p>
//             <p className="flex justify-between text-gray-500 text-sm pt-2 border-t">
//               <span>{locale === 'ko' ? businessHours.closedKo : businessHours.closed}</span>
//             </p>
//           </div>
//         </div>

//         {/* FAQ Link */}
//         <div className="text-center">
//           <Link
//             href="/help/faq"
//             className="inline-flex items-center gap-2 bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white px-8 py-4 rounded-lg font-semibold text-lg shadow-md hover:shadow-xl transition-all duration-300"
//           >
//             <FileQuestion className="w-5 h-5" />
//             {locale === 'ko' ? '자주 묻는 질문 보기' : 'View Frequently Asked Questions'}
//           </Link>
//         </div>

//         {/* Additional Info */}
//         <div className="mt-12 text-center text-gray-500 text-sm">
//           <p>
//             {locale === 'ko'
//               ? '평균 응답 시간: 영업일 기준 24시간 이내'
//               : 'Average response time: Within 24 hours on business days'}
//           </p>
//         </div>
//       </div>
//     </main>
//   );
// }
