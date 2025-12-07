"use client";

import React, { forwardRef } from "react";
import clsx from "clsx";

interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  name: string;
  disabled?: boolean;
  isError?: boolean;
  errorMessage?: string;
  placeholder?: string;
  type?: string;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
}

const InputField = forwardRef<HTMLInputElement, InputFieldProps>(
  ({ label, name, disabled = false, isError, errorMessage, placeholder, type, onBlur, ...props }, ref) => {
    return (
      <div className="flex flex-col w-full gap-1">
        <div className="flex items-center w-full gap-2">
          {/* 왼쪽 라벨 */}
          <label htmlFor={name} className="min-w-[90px] font-medium">
            {label}
          </label>
          {/* 오른쪽 입력칸 (네모 border) */}
          <input
            id={name}
            name={name}
            ref={ref}
            type={type}
            disabled={disabled}
            placeholder={placeholder}
            className={clsx(
              "flex-1 px-3 py-2 border rounded outline-none transition",
              isError
                ? "border-red-500 focus:border-red-500"
                : "border-gray-300 focus:border-blue-500"
            )}
            onDoubleClick={(e) => e.currentTarget.select()}
            onBlur={onBlur}
            {...props}
          />
        </div>
        {/* 에러 메시지 */}
        {isError && errorMessage && (
          <div className="ml-[90px] text-sm text-red-500">
            {errorMessage}
          </div>
        )}
      </div>
    );
  }
);

InputField.displayName = "InputField";

interface TextAreaProps {
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export const TextArea: React.FC<TextAreaProps> = ({
  placeholder,
  value,
  onChange,
  className,
}) => {
  return (
    <textarea
      className={`w-full p-4 border rounded-lg resize-none h-32 ${className}`}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  );
};

export default InputField;
