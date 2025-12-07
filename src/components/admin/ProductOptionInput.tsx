"use client";

import React, { useState, useEffect } from "react";
import { X } from "lucide-react";

interface ProductOptionInputProps {
  id: string;
  initialValue1?: number;
  initialValue2?: number;
  onRemove: (id: string) => void;
  onChange?: (id: string, value1: number, value2: number) => void;
  isHidden?: boolean;
  unit?: string;
  department?: string;
}

const ProductOptionInput: React.FC<ProductOptionInputProps> = ({
  id,
  initialValue1 = 0,
  initialValue2 = 0,
  onRemove,
  onChange,
  isHidden = false,
  unit,
  department
}) => {
  const [value1, setValue1] = useState<number>(initialValue1);
  const [value2, setValue2] = useState<number>(initialValue2);

  // 초기값이 변경될 때 상태 업데이트
  useEffect(() => {
    setValue1(initialValue1);
    setValue2(initialValue2);
  }, [initialValue1, initialValue2]);

  // 컴포넌트가 마운트될 때 초기값을 부모에게 알림
  useEffect(() => {
    if (initialValue1 !== 0 || initialValue2 !== 0) {
      onChange?.(id, initialValue1, initialValue2);
    }
  }, []);

  const handleValue1Change = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseInt(e.target.value) || 0;
    setValue1(newValue);
    onChange?.(id, newValue, value2);
  };

  const handleValue2Change = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseInt(e.target.value) || 0;
    setValue2(newValue);
    onChange?.(id, value1, newValue);
  };

  return (
    <div className="flex items-center gap-3 p-4 border border-border rounded-lg bg-card shadow-sm hover:shadow-md transition-shadow">
      <button
        type="button"
        onClick={() => onRemove(id)}
        className="p-1.5 hover:bg-destructive/10 rounded-md transition-colors focus-ring"
        aria-label="옵션 삭제"
      >
        <X size={14} className="text-destructive" />
      </button>
      
      <div className="flex items-center gap-3 flex-1">
        {department !== 'surgery' && (
          <>
            <span className="text-sm text-muted-foreground font-medium min-w-fit">시술옵션:</span>
            {isHidden ? (
              <div className="w-20 px-3 py-2 text-center text-xs text-muted-foreground italic bg-muted border border-border rounded-md">
                옵션없음
              </div>
            ) : (
              <>
                <input
                  value={value1}
                  onChange={handleValue1Change}
                  className="w-20 px-3 py-2 text-center border border-input rounded-md focus-ring text-sm bg-input"
                  placeholder="0"
                />
                {unit && (
                  <span className="text-xs text-primary bg-primary/10 px-2 py-1 rounded-md font-medium">
                    {unit}
                  </span>
                )}
              </>
            )}
          </>
        )}
        <span className="text-sm text-muted-foreground font-medium min-w-fit">가격(원):</span>
        <input
          type="number"
          value={value2}
          onChange={handleValue2Change}
          className="w-24 px-3 py-2 text-right border border-input rounded-md focus-ring text-sm bg-input appearance-none [-moz-appearance:textfield]"
          placeholder="0"
          min="0"
          inputMode="numeric"
          style={{
            MozAppearance: 'textfield',
            appearance: 'none'
          }}
        />
        
      </div>
    </div>
  );
};

export default ProductOptionInput; 