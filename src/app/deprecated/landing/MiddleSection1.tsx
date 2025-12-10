// "use client";

// import React from "react";

// type FeatureCard = {
//   icon: string; // 색상 클래스
//   title: string;
//   description: string;
// };
//////
// const features: FeatureCard[] = [
//   {
//     icon: "bg-yellow-200",
//     title: "Access the Latest in K-Beauty",
//     description: "Discover Seoul&apos;s top beauty trends."
//   },
//   {
//     icon: "bg-blue-200", 
//     title: "Personalized by a Real Doctor",
//     description: "Your plan, created by a real doctor."
//   },
//   {
//     icon: "bg-pink-200",
//     title: "K-Beauty, Made Easy for You",
//     description: "No barriers, no complex research"
//   }
// ];

// export default function MiddleSection1() {
//   return (
//     <section className="w-full py-16 px-4 bg-[#F1F2F4]">
//       <div className="max-w-4xl mx-auto text-center">
//         {/* Expert-Vetted 상단 텍스트 */}
//         <p className="text-pink-400 text-sm font-medium mb-4 uppercase tracking-wide">
//           Expert-Vetted
//         </p>

//         {/* 메인 제목 */}
//         <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
//           Your Answer to
//           <br />
//           K-Beauty Confusion
//         </h2>

//         {/* 부제목 */}
//         <p className="text-gray-600 text-base md:text-lg mb-12 max-w-2xl mx-auto">
//           Get a doctor&apos;s recommendation
//           <br />
//           for the latest K-beauty treatments.
//         </p>

//         {/* 기능 카드들 */}
//         <div className="flex flex-col gap-6 max-w-md mx-auto">
//           {features.map((feature, index) => (
//             <div
//               key={index}
//               className="flex items-center gap-4 p-6 bg-white rounded-xl shadow-sm"
//             >
//               {/* 아이콘 플레이스홀더 */}
//               <div className={`w-12 h-12 rounded-xl ${feature.icon} flex-shrink-0`}>
//               </div>

//               {/* 텍스트 콘텐츠 */}
//               <div className="text-left">
//                 <h3 className="font-semibold text-gray-900 text-lg mb-1">
//                   {feature.title}
//                 </h3>
//                 <p className="text-gray-600 text-sm">
//                   {feature.description}
//                 </p>
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>
//     </section>
//   );
// }