import React from 'react';
import { Input } from '@/components/ui/input';

interface InputPhoneNumberProps {
  value: string | undefined;
  onChange: (value: string | undefined) => void;
  placeholder?: string;
  className?: string;
  id?: string;
  phonePrefix?: string; // 국제번호 prefix (예: +82)
}

const InputPhoneNumber: React.FC<InputPhoneNumberProps> = ({
  value,
  onChange,
  placeholder = "Enter phone number",
  className = "",
  id,
  phonePrefix
}) => {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;

    // Only allow numbers
    const numericValue = inputValue.replace(/[^0-9]/g, '');

    // phonePrefix가 있으면 prefix + 숫자, 없으면 숫자만
    const fullValue = numericValue === '' ? undefined :
      phonePrefix ? `${phonePrefix}${numericValue}` : numericValue;

    onChange(fullValue);
  };

  // value에서 phonePrefix를 제거한 순수 숫자만 표시
  const displayValue = React.useMemo(() => {
    if (!value) return '';
    if (phonePrefix && value.startsWith(phonePrefix)) {
      return value.slice(phonePrefix.length);
    }
    return value;
  }, [value, phonePrefix]);

  return (
    <div className="flex items-center gap-2">
      {phonePrefix && (
        <div className="flex-shrink-0 px-3 py-2 bg-gray-100 border border-gray-300 rounded-md text-gray-700 font-medium">
          {phonePrefix}
        </div>
      )}
      <Input
        id={id}
        type="text"
        value={displayValue}
        onChange={handleInputChange}
        className={`border-rose-200 focus:border-rose-400 focus:ring-rose-400/20 ${className}`}
        placeholder={placeholder}
        inputMode="numeric"
        pattern="[0-9]*"
      />
    </div>
  );
};

export default InputPhoneNumber;