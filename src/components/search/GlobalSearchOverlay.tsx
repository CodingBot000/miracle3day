"use client";

import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  KeyboardEvent,
} from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import { useNavigation } from '@/hooks/useNavigation';
import { useSearch } from '@/contexts/SearchContext';
import type {
  SearchSuggestion,
  PopularTerm,
  TreatmentGroupSuggestion,
  TreatmentGroupHospital,
  BasicSuggestion
} from '@/models/search';
import {
  highlightMatch,
  saveRecentSearch,
  getRecentSearches,
  clearRecentSearches,
  removeRecentSearch,
} from '@/lib/search-utils';

const DEBOUNCE_MS = 1000;
const MIN_QUERY_LENGTH = 2;

export const GlobalSearchOverlay: React.FC = () => {
  const { isOpen, closeSearch } = useSearch();
  const { navigate } = useNavigation();
  const inputRef = useRef<HTMLInputElement>(null);
  const [mounted, setMounted] = useState(false);

  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [popularSearches, setPopularSearches] = useState<PopularTerm[]>([]);

  // Mount check for portal
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Load recent searches on open
  useEffect(() => {
    if (isOpen) {
      setRecentSearches(getRecentSearches());
      // Fetch popular searches
      fetch('/api/search/popular')
        .then((res) => res.json())
        .then((data) => setPopularSearches(data.terms || []))
        .catch(() => setPopularSearches([]));
    }
  }, [isOpen]);

  // Focus input on open
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Reset state on close
  useEffect(() => {
    if (!isOpen) {
      setQuery('');
      setSuggestions([]);
      setSelectedIndex(-1);
      setIsLoading(false);
    }
  }, [isOpen]);

  // Debounced search
  useEffect(() => {
    if (query.length < MIN_QUERY_LENGTH) {
      setSuggestions([]);
      setSelectedIndex(-1);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search/suggest?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        setSuggestions(data.suggestions || []);
        setSelectedIndex(-1);
      } catch {
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    }, DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [query]);

  // Handle hospital card click (from treatment group)
  const handleHospitalClick = useCallback(
    (hospital: TreatmentGroupHospital, treatmentName: string) => {
      saveRecentSearch(treatmentName);
      closeSearch();
      navigate(`/hospital/${hospital.id}`);
    },
    [closeSearch, navigate]
  );

  const handleSelect = useCallback(
    (item: SearchSuggestion) => {
      if (item.type === 'treatment_group') {
        // For treatment groups, clicking the header navigates to search results
        saveRecentSearch(item.treatment_name);
        closeSearch();
        navigate(`/search/results?q=${encodeURIComponent(item.treatment_name)}`);
        return;
      }

      // BasicSuggestion types (hospital, product)
      const basicItem = item as BasicSuggestion;
      saveRecentSearch(basicItem.label);
      closeSearch();

      // Navigate based on type
      switch (basicItem.type) {
        case 'hospital':
          navigate(`/hospital/${basicItem.id}`);
          break;
        case 'product':
          navigate(`/search/results?q=${encodeURIComponent(basicItem.label)}`);
          break;
      }
    },
    [closeSearch, navigate]
  );

  const handleSearchSubmit = useCallback(
    (searchQuery: string) => {
      if (!searchQuery.trim()) return;
      saveRecentSearch(searchQuery);
      closeSearch();
      navigate(`/search/results?q=${encodeURIComponent(searchQuery)}`);
    },
    [closeSearch, navigate]
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      const itemCount = suggestions.length;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex((prev) => (prev < itemCount - 1 ? prev + 1 : 0));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex((prev) => (prev > 0 ? prev - 1 : itemCount - 1));
          break;
        case 'Enter':
          e.preventDefault();
          if (selectedIndex >= 0 && suggestions[selectedIndex]) {
            handleSelect(suggestions[selectedIndex]);
          } else if (query.trim()) {
            handleSearchSubmit(query);
          }
          break;
        case 'Escape':
          closeSearch();
          break;
      }
    },
    [suggestions, selectedIndex, query, handleSelect, handleSearchSubmit, closeSearch]
  );

  const handleRecentClick = useCallback(
    (term: string) => {
      setQuery(term);
    },
    []
  );

  const handleClearRecent = useCallback(() => {
    clearRecentSearches();
    setRecentSearches([]);
  }, []);

  const handleRemoveRecent = useCallback(
    (term: string, e: React.MouseEvent) => {
      e.stopPropagation();
      removeRecentSearch(term);
      setRecentSearches(getRecentSearches());
    },
    []
  );

  const getTypeIcon = (type: SearchSuggestion['type']) => {
    switch (type) {
      case 'treatment_group':
        return (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        );
      case 'hospital':
        return (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        );
      case 'product':
        return (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
          </svg>
        );
    }
  };

  if (!mounted || !isOpen) return null;

  const portalRoot = document.getElementById('modal-root');
  if (!portalRoot) return null;

  return createPortal(
    <div
      className="fixed inset-0 bg-black/50 z-maximum"
      onClick={closeSearch}
    >
      <div
        className="bg-white h-full w-full overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b z-10">
          <div className="flex items-center gap-3 p-4 max-w-3xl mx-auto">
            <button
              type="button"
              onClick={closeSearch}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Close"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <div className="flex-1 relative">
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search treatments, hospitals..."
                className="w-full px-4 py-3 pr-10 text-base border-2 border-gray-200 rounded-full focus:border-pink-500 focus:outline-none transition-colors"
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

        {/* Content */}
        <div className="max-w-3xl mx-auto p-4">
          {/* Loading state */}
          {isLoading && (
            <div className="flex items-center justify-center py-8">
              <div className="w-6 h-6 border-2 border-pink-500 border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {/* Suggestions */}
          {!isLoading && query.length >= MIN_QUERY_LENGTH && suggestions.length > 0 && (
            <div className="space-y-6">
              {/* Hospital direct search results */}
              {suggestions.filter(s => s.type === 'hospital').length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                    {getTypeIcon('hospital')}
                    <span>Clinics</span>
                  </h3>
                  <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                    {suggestions
                      .filter((s): s is BasicSuggestion => s.type === 'hospital')
                      .map((hospital) => (
                        <button
                          key={`hospital-${hospital.id}`}
                          type="button"
                          onClick={() => handleSelect(hospital)}
                          className="flex-shrink-0 w-36 bg-white border rounded-xl overflow-hidden hover:shadow-md transition-shadow"
                        >
                          <div className="aspect-[4/3] bg-gray-100 relative">
                            {hospital.thumbnail_url ? (
                              <Image
                                src={hospital.thumbnail_url}
                                alt={hospital.label}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-300">
                                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                              </div>
                            )}
                          </div>
                          <div className="p-2">
                            <div className="text-sm font-medium text-gray-900 truncate">
                              {highlightMatch(hospital.label, query)}
                            </div>
                            {hospital.category && (
                              <div className="text-xs text-gray-500 truncate">
                                {hospital.category}
                              </div>
                            )}
                          </div>
                        </button>
                      ))}
                  </div>
                </div>
              )}

              {/* Treatment groups with hospital cards */}
              {suggestions.filter(s => s.type === 'treatment_group').length > 0 && (
                <div className="space-y-4">
                  {suggestions
                    .filter((s): s is TreatmentGroupSuggestion => s.type === 'treatment_group')
                    .map((group) => (
                      <div key={`treatment-${group.treatment_id}`}>
                        <button
                          type="button"
                          onClick={() => handleSelect(group)}
                          className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2 hover:text-pink-600 transition-colors"
                        >
                          {getTypeIcon('treatment_group')}
                          <span>{highlightMatch(group.treatment_name, query)}</span>
                          {group.treatment_name_ko !== group.treatment_name && (
                            <span className="text-gray-400 text-xs">({group.treatment_name_ko})</span>
                          )}
                          <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                          {group.hospitals.map((hospital) => (
                            <button
                              key={`${group.treatment_id}-${hospital.id}`}
                              type="button"
                              onClick={() => handleHospitalClick(hospital, group.treatment_name)}
                              className="flex-shrink-0 w-44 bg-white border rounded-xl overflow-hidden hover:shadow-md transition-shadow"
                            >
                              <div className="aspect-[4/3] bg-gray-100 relative">
                                {hospital.thumbnail_url ? (
                                  <Image
                                    src={hospital.thumbnail_url}
                                    alt={hospital.name}
                                    fill
                                    className="object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-gray-300">
                                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                    </svg>
                                  </div>
                                )}
                              </div>
                              <div className="p-2">
                                <div className="text-sm font-medium text-gray-900 truncate">
                                  {hospital.name}
                                </div>
                                <div className="text-xs text-gray-500 truncate">
                                  {hospital.product_name}
                                </div>
                                <div className="text-sm font-semibold text-pink-600 mt-1">
                                  ₩{hospital.price.toLocaleString()}
                                </div>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                </div>
              )}

              {/* Products - text list */}
              {suggestions.filter(s => s.type === 'product').length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                    {getTypeIcon('product')}
                    <span>Products</span>
                  </h3>
                  <div className="space-y-1">
                    {suggestions
                      .filter((s): s is BasicSuggestion => s.type === 'product')
                      .map((product) => (
                        <button
                          key={`product-${product.id}`}
                          type="button"
                          onClick={() => handleSelect(product)}
                          className="w-full flex items-center gap-3 p-3 rounded-lg text-left hover:bg-gray-50 transition-colors"
                        >
                          <span className="text-gray-400">
                            {getTypeIcon('product')}
                          </span>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-gray-900 truncate">
                              {highlightMatch(product.label, query)}
                            </div>
                            {product.label_ko && product.label_ko !== product.label && (
                              <div className="text-xs text-gray-500 truncate">
                                {product.label_ko}
                              </div>
                            )}
                          </div>
                          {product.category && (
                            <span className="text-xs text-gray-400 px-2 py-0.5 bg-gray-100 rounded">
                              {product.category}
                            </span>
                          )}
                        </button>
                      ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* No results */}
          {!isLoading && query.length >= MIN_QUERY_LENGTH && suggestions.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No results found for &quot;{query}&quot;
            </div>
          )}

          {/* Initial state */}
          {!isLoading && query.length < MIN_QUERY_LENGTH && (
            <div className="space-y-6">
              {/* Recent searches */}
              {recentSearches.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-medium text-gray-700">Recent Searches</h3>
                    <button
                      type="button"
                      onClick={handleClearRecent}
                      className="text-xs text-gray-400 hover:text-gray-600"
                    >
                      Clear all
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {recentSearches.map((term) => (
                      <button
                        key={term}
                        type="button"
                        onClick={() => handleRecentClick(term)}
                        className="group flex items-center gap-1 px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
                      >
                        <span>{term}</span>
                        <span
                          onClick={(e) => handleRemoveRecent(term, e)}
                          className="hidden group-hover:inline-flex p-0.5 hover:bg-gray-300 rounded-full"
                        >
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Popular searches */}
              {popularSearches.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Popular Searches</h3>
                  <div className="flex flex-wrap gap-2">
                    {popularSearches.map((item, index) => (
                      <button
                        key={item.term}
                        type="button"
                        onClick={() => handleRecentClick(item.term)}
                        className="flex items-center gap-2 px-3 py-1.5 text-sm bg-pink-50 hover:bg-pink-100 text-pink-700 rounded-full transition-colors"
                      >
                        <span className="text-xs text-pink-400">{index + 1}</span>
                        <span>{item.term}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Keyboard hint */}
              <div className="text-center text-xs text-gray-400 py-4">Use Keyboard Guide
                <div className="text-center text-xs text-gray-400 py-4">
                  Press <kbd className="px-1.5 py-0.5 bg-gray-100 border rounded">↑</kbd>{' '}
                  <kbd className="px-1.5 py-0.5 bg-gray-100 border rounded">↓</kbd> to navigate,{' '}
                  <kbd className="px-1.5 py-0.5 bg-gray-100 border rounded">Enter</kbd> to select,{' '}
                  <kbd className="px-1.5 py-0.5 bg-gray-100 border rounded">Esc</kbd> to close
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>,
    portalRoot
  );
};

export default GlobalSearchOverlay;
