'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

type FormMode = 'read' | 'edit';

interface FormModeContextValue {
  mode: FormMode;
  setMode: (mode: FormMode) => void;
  toggleMode: () => void;
  isReadMode: boolean;
  isEditMode: boolean;
}

const FormModeContext = createContext<FormModeContextValue | undefined>(undefined);

interface FormModeProviderProps {
  children: ReactNode;
  defaultMode?: FormMode;
}

export function FormModeProvider({ children, defaultMode = 'read' }: FormModeProviderProps) {
  const [mode, setMode] = useState<FormMode>(defaultMode);

  const toggleMode = () => {
    setMode((prev) => (prev === 'read' ? 'edit' : 'read'));
  };

  const value: FormModeContextValue = {
    mode,
    setMode,
    toggleMode,
    isReadMode: mode === 'read',
    isEditMode: mode === 'edit',
  };

  return (
    <FormModeContext.Provider value={value}>
      {children}
    </FormModeContext.Provider>
  );
}

export function useFormMode() {
  const context = useContext(FormModeContext);
  if (context === undefined) {
    throw new Error('useFormMode must be used within a FormModeProvider');
  }
  return context;
}
