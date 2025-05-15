"use client";

import React, { forwardRef } from "react";
import clsx from "clsx";

interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  name: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isError?: boolean;
}

const InputField = forwardRef<HTMLInputElement, InputFieldProps>(
  ({ label, name, onChange, isError, ...props }, ref) => {
    return (
      <div className="w-full">
        <label
          className="flex gap-2 p-3 border border-[#eee] rounded"
        >
          {label}
          <input
            name={name}
            ref={ref}
            onChange={onChange}
            className={clsx(
              "ml-auto min-w-[70%] outline-none border-none",
              isError && "text-red-500"
            )}
            {...props}
          />
        </label>
      </div>
    );
  }
);

InputField.displayName = "InputField";

export default InputField;
