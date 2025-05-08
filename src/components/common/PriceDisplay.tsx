import React from "react";

function formatUSD(num: number) {
  return `$${num.toLocaleString()} USD`;
}

function calculateDiscount(original: number, discounted: number) {
  const percent = Math.round(((original - discounted) / original) * 100);
  return `${percent}% off`;
}

export const PriceDisplay = ({ price }: { price?: number[] }) => {

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
      <div className="flex items-baseline gap-2">
 
        <span className="text-black text-lg font-bold">
          {formatUSD(discounted)}
        </span>
  
      
        {original !== undefined && (
          <>
            <span className="text-gray-400 text-sm line-through">
              {formatUSD(original)}
            </span>
            <span className="text-red-500 text-sm font-semibold">
              {calculateDiscount(original, discounted)}
            </span>
          </>
        )}
      </div>
    );
  };
  