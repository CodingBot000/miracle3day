"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface HeaderContextType {
  isTransparentMode: boolean;
  setTransparentMode: (transparent: boolean) => void;
}

const HeaderContext = createContext<HeaderContextType | undefined>(undefined);

export const useHeader = () => {
  const context = useContext(HeaderContext);
  if (context === undefined) {
    throw new Error('useHeader must be used within a HeaderProvider');
  }
  return context;
};

interface HeaderProviderProps {
  children: ReactNode;
}

export const HeaderProvider: React.FC<HeaderProviderProps> = ({ children }) => {
  const [isTransparentMode, setIsTransparentMode] = useState(false);

  const setTransparentMode = (transparent: boolean) => {
    setIsTransparentMode(transparent);
  };

  return (
    <HeaderContext.Provider value={{ isTransparentMode, setTransparentMode }}>
      {children}
    </HeaderContext.Provider>
  );
};
