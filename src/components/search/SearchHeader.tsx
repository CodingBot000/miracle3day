"use client";

import React, { RefObject, KeyboardEvent } from 'react';

interface SearchHeaderProps {
  query: string;
  setQuery: (query: string) => void;
  onClose: () => void;
  onKeyDown: (e: KeyboardEvent<HTMLInputElement>) => void;
  inputRef: RefObject<HTMLInputElement>;
}

export const SearchHeader: React.FC<SearchHeaderProps> = ({
  query,
  setQuery,
  onClose,
  onKeyDown,
  inputRef,
}) => {
  return (
    <div className="sticky top-0 bg-white border-b z-10">
      <div className="flex items-center gap-3 px-4 py-2 max-w-3xl mx-auto min-h-[62px]">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path
              d="M15 18L9 12L15 6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        <div className="flex-1 relative">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Search treatments, hospitals..."
            className="w-full px-4 py-2 pr-10 text-sm border-2 border-gray-200 rounded-full focus:border-pink-500 focus:outline-none transition-colors"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck="false"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full"
              aria-label="Clear"
            >
              <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchHeader;
