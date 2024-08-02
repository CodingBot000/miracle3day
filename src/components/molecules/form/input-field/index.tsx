"use client";

import React, { forwardRef } from "react";
import styles from "./input-field.module.scss";
import { clsx } from "clsx";

interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  name: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isError?: boolean;
}

const InputField = forwardRef<HTMLInputElement, InputFieldProps>(
  ({ label, name, onChange, isError, ...props }, ref) => {
    return (
      <div className={styles.input_form}>
        <label className={styles.label}>
          {label}
          <input
            className={clsx(styles.input, {
              [styles.errorField]: isError,
            })}
            name={name}
            ref={ref}
            onChange={onChange}
            {...props}
          />
        </label>
      </div>
    );
  }
);

InputField.displayName = "InputField";

export default InputField;
