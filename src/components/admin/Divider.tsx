"use client";

import React from "react";

interface DividerProps {
  color?: string; // ex: 'gray-300'
  thickness?: string; // ex: 'border-t-2'
  paddingY?: string; // ex: 'py-6'
  width?: string; // ex: 'w-full', 'w-1/2'
}

export default function Divider({
  color = "gray-300",
  thickness = "border-t",
  paddingY = "py-6",
  width = "w-full",
}: DividerProps) {
  return (
    <div className={paddingY}>
      <hr className={`${thickness} border-${color} ${width} mx-auto`} />
    </div>
  );
}
