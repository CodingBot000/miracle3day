"use client";

import React from 'react';
import { useSearch } from '@/contexts/SearchContext';

interface SearchButtonProps {
  iconColor?: string;
  className?: string;
  showShortcut?: boolean;
}

export const SearchButton: React.FC<SearchButtonProps> = ({
  iconColor = 'currentColor',
  className = '',
  showShortcut = false,
}) => {
  const { openSearch } = useSearch();

  return (
    <button
      type="button"
      onClick={openSearch}
      className={`flex items-center justify-center p-2 rounded-full hover:bg-gray-100 transition-colors ${className}`}
      aria-label="Search"
      title="Search (Cmd+K)"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke={iconColor}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
      {showShortcut && (
        <kbd className="ml-2 px-1.5 py-0.5 text-xs font-sans bg-gray-100 border border-gray-300 rounded hidden sm:inline-block">
          <span className="text-xs">⌘</span>K
        </kbd>
      )}
    </button>
  );
};

export default SearchButton;
