"use client";

import { TreatmentProductData } from "@/app/models/treatmentProduct.dto";
import { useCookieLanguage } from "@/hooks/useCookieLanguage";

interface TreatmentProductCardProps {
  product: TreatmentProductData;
}

const TreatmentProductCard = ({ product }: TreatmentProductCardProps) => {
  const { language } = useCookieLanguage();

  const nameText = language === 'ko' ? product.name.ko : product.name.en;
  const unitText = language === 'ko' ? product.unit.ko : product.unit.en;

  // Format price with comma separator
  const formattedPrice = product.price.toLocaleString('ko-KR');

  return (
    <div className="bg-white border border-gray-200 rounded-md p-2 shadow-sm hover:shadow transition-shadow">
      <div className="flex justify-between items-center gap-3">
        {/* Left side - Product name */}
        <div className="flex-1">
          <h5 className="text-sm font-medium text-gray-900">
            {nameText || '-'}
          </h5>
          {/* {unitText && (
            <p className="text-xs text-gray-500 mt-0.5">
              {unitText}
            </p>
          )} */}
        </div>

        {/* Right side - Price */}
        {/* <div className="flex-shrink-0">
          <p className="text-sm font-bold text-gray-900">
            ₩{formattedPrice}
          </p>
        </div> */}
      </div>
    </div>
  );
};

export default TreatmentProductCard;
