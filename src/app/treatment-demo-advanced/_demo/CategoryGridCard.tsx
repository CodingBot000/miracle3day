"use client";

import * as React from "react";
import Image from "next/image";
import type { Category } from "../../../constants/treatment/types";

type Locale = "ko" | "en";

interface CategoryGridCardProps {
  category: Category;
  locale: Locale;
  onClick: (category: Category) => void;
  categoryIndex: number;
}

// 각 카테고리별로 미리 정의된 이미지 배열 (11개 카테고리)
const CATEGORY_IMAGES = [
  // 카테고리 0: Lifting_Firming
  [
    "/landing_model/model_1.png",
    "/landing_model/model_2.jpeg", 
    "/landing_model/img1.png",
    "/landing_model/img2.png",
    "/landing_model/img3.jpg"
  ],
  // 카테고리 1: Body_Contouring
  [
    "/landing_model/model_3.jpeg",
    "/landing_model/model_4.jpeg",
    "/landing_model/img4.png",
    "/landing_model/img5.png",
    "/landing_model/img6.jpg"
  ],
  // 카테고리 2: Wrinkle_AntiAging
  [
    "/landing_model/model_5.png",
    "/landing_model/img7.png",
    "/landing_model/img8.png",
    "/landing_model/img9.png",
    "/landing_model/img10.jpg"
  ],
  // 카테고리 3: Tone_Texture
  [
    "/landing_model/img11.jpg",
    "/landing_model/img12.jpg",
    "/landing_model/img13.jpg",
    "/landing_model/img14.jpg",
    "/landing_model/img15.jpg"
  ],
  // 카테고리 4: Acne_Scars
  [
    "/landing_model/img16.jpg",
    "/landing_model/img17.jpg",
    "/landing_model/img18.jpg",
    "/landing_model/img19.jpg",
    "/landing_model/img20.png"
  ],
  // 카테고리 5: Pores_Sebum
  [
    "/landing_model/img21.jpg",
    "/landing_model/img22.jpg",
    "/landing_model/img23.jpg",
    "/landing_model/img24.jpg",
    "/landing_model/img25.jpg"
  ],
  // 카테고리 6: Pigmentation_Spots
  [
    "/landing_model/img26.jpg",
    "/landing_model/img27.jpg",
    "/landing_model/img28.jpg",
    "/landing_model/img29.jpg",
    "/landing_model/img30.jpg"
  ],
  // 카테고리 7: Hair_Removal
  [
    "/landing_model/img31.jpg",
    "/landing_model/img32.jpg",
    "/landing_model/img33.jpg",
    "/landing_model/img34.jpg",
    "/landing_model/model_1.png"
  ],
  // 카테고리 8: Skin_Care
  [
    "/landing_model/model_2.jpeg",
    "/landing_model/model_3.jpeg",
    "/landing_model/img1.png",
    "/landing_model/img5.png",
    "/landing_model/img9.jpg"
  ],
  // 카테고리 9: Filler_Volume
  [
    "/landing_model/model_4.jpeg",
    "/landing_model/model_5.png",
    "/landing_model/img13.jpg",
    "/landing_model/img17.jpg",
    "/landing_model/img21.jpg"
  ],
  // 카테고리 10: Hair_Scalp
  [
    "/landing_model/img25.jpg",
    "/landing_model/img29.jpg",
    "/landing_model/img33.jpg",
    "/landing_model/img6.jpg",
    "/landing_model/img10.jpg"
  ]
];

const CategoryGridCard: React.FC<CategoryGridCardProps> = ({ 
  category, 
  locale, 
  onClick,
  categoryIndex
}) => {
  const handleClick = () => {
    onClick(category);
  };

  // 해당 카테고리에 할당된 이미지 배열 가져오기
  const categoryImages = CATEGORY_IMAGES[categoryIndex] || CATEGORY_IMAGES[0];
  // <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
  // {concerns.map((concern) => (
  //   <Card 
  //     key={concern.id}
  //     className="group cursor-pointer bg-white/80 backdrop-blur-sm border-[#E8B4A0]/30 hover:shadow-xl hover:scale-105 transition-all duration-300 hover:bg-white/90"
  //     onClick={() => onConcernSelect(concern.id)}
  //   >
  //     <CardContent className="p-6">
  //       <div className="flex flex-col items-center text-center space-y-4">
  //         <div className="w-16 h-16 bg-gradient-to-br from-[#FDF5F0] to-[#F8E8E0] rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
  //           {concern.icon}
  //         </div>
  //         <div>
  //           <h3 className="text-[#8B4513] mb-2">{concern.title}</h3>
  //           <p className="text-[#A0522D] text-sm opacity-80">{concern.description}</p>
  //         </div>
  //         <Button 
  //           variant="outline" 
  //           size="sm"
  //           className="bg-gradient-to-r from-[#E8B4A0] to-[#D4A574] text-white border-none hover:from-[#D4A574] hover:to-[#C49464] transition-all duration-300"
  //         >
  //           Start now
  //         </Button>
  //       </div>
  //     </CardContent>
  //   </Card>
  // ))}
  
  return (
    <div 
      className="group cursor-pointer bg-white/80 backdrop-blur-sm border-[#E8B4A0]/30 hover:shadow-xl hover:scale-105 transition-all duration-300 hover:bg-white/90 rounded-lg overflow-hidden"
      onClick={handleClick}
    >
      <div className="flex h-40">
        {/* Left side - 1/4 width on desktop, 1/3 on mobile */}
        <div className="w-1/3 md:w-1/4 p-3 md:p-4 flex flex-col bg-gradient-to-br from-[#FDF5F0] to-[#F8E8E0] group-hover:scale-110 transition-transform duration-300">
          {/* <h3 className="text-sm md:text-lg font-bold text-[#8B4513] mb-1 md:mb-2 leading-tight"> */}
          <h3 className="text-lg font-bold text-[#8B4513] mb-1 md:mb-2 leading-tight">
            {category[locale]}
          </h3>
          <p className="text-xs md:text-sm text-[#A0522D] opacity-80 leading-relaxed">
            {category.concern_copy[locale]}
          </p>
        </div>

        {/* Right side - 3/4 width on desktop, 2/3 on mobile */}
        <div className="w-2/3 md:w-3/4 relative overflow-hidden">
          <div className="flex h-full">
            {/* Mobile: show only first 2 images */}
            <div className="flex md:hidden h-full w-full">
              {categoryImages.slice(0, 2).map((src, index) => (
                <div key={index} className="flex-1 relative">
                  <Image
                    src={src}
                    alt={`${category[locale]} image ${index + 1}`}
                    fill
                    className="object-cover"
                    sizes="33vw"
                  />
                </div>
              ))}
            </div>
            
            {/* Desktop: show all 5 images */}
            <div className="hidden md:flex h-full w-full">
              {categoryImages.map((src, index) => (
                <div key={index} className="flex-1 relative">
                  <Image
                    src={src}
                    alt={`${category[locale]} image ${index + 1}`}
                    fill
                    className="object-cover"
                    sizes="15vw"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryGridCard;