import React from "react";

function formatUSD(num: number) {
  return `$${num.toLocaleString()} USD`;
}

function calculateDiscount(original: number, discounted: number) {
  const percent = Math.round(((original - discounted) / original) * 100);
  return `${percent}% off`;
}

export const DiscountPriceDisplay = ({ price }: { price?: number[] }) => {
  if (
    !Array.isArray(price) ||
    price.length === 0 ||
    typeof price[0] !== "number"
  ) {
    return null;
  }

  const [discounted, original] =
    price.length === 2 && typeof price[1] === "number"
      ? price
      : [price[0], undefined];

  return (
    <div className="flex flex-col gap-1">
      {/* 할인 가격 */}
      <span className="text-black font-bold text-[0.7rem] sm:text-xs md:text-sm">
        {formatUSD(discounted)}
      </span>

      {/* 원가 및 할인율 오른쪽 정렬 */}
      {original !== undefined && (
        <div className="flex justify-end items-baseline gap-2">
          <span className="text-gray-400 text-sm sm:text-xs md:text-sm line-through">
            {formatUSD(original)}
          </span>
          <span className="text-red-500 text-sm sm:text-xs md:text-sm font-semibold">
            {calculateDiscount(original, discounted)}
          </span>
        </div>
      )}
    </div>
  );
};
