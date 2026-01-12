'use client';

import { Search, X } from 'lucide-react';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}

export default function SearchInput({ value, onChange, placeholder }: SearchInputProps) {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-10 pr-10 py-2.5 bg-gray-100 border-none rounded-xl text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-300"
      />
      {value && (
        <button
          onClick={() => onChange('')}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-gray-200 transition-colors"
        >
          <X className="w-4 h-4 text-gray-500" />
        </button>
      )}
    </div>
  );
}
