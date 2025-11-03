import React from 'react';
import { Input } from '@/components/ui/input';

interface InputPhoneNumberProps {
  value: number | undefined;
  onChange: (value: number | undefined) => void;
  placeholder?: string;
  className?: string;
  id?: string;
}

const InputPhoneNumber: React.FC<InputPhoneNumberProps> = ({
  value,
  onChange,
  placeholder = "Enter Korean phone number",
  className = "",
  id
}) => {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    
    // Only allow numbers
    const numericValue = inputValue.replace(/[^0-9]/g, '');
    
    // Convert to number or undefined if empty
    const numValue = numericValue === '' ? undefined : parseInt(numericValue, 10);
    
    onChange(numValue);
  };

  return (
    <Input
      id={id}
      type="text"
      value={value?.toString() || ''}
      onChange={handleInputChange}
      className={`border-rose-200 focus:border-rose-400 focus:ring-rose-400/20 ${className}`}
      placeholder={placeholder}
      inputMode="numeric"
      pattern="[0-9]*"
    />
  );
};

export default InputPhoneNumber;