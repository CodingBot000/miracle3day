"use client";

import { type ReactNode, createContext, useContext, useState } from "react";

// Types
type BodyPart = string;
type BodyCondition = string[];
type Budget = number | null;
type VisitFrequency = "1 time" | "3 times" | "5 times" | "Undecided" | null;
type Concerns = string;

interface FormState {
  bodyPart: BodyPart | null;
  bodyConditions: BodyCondition;
  budget: Budget;
  visitFrequency: VisitFrequency;
  concerns: Concerns;
  photos: File[];
}

interface FormContextType {
  formState: FormState;
  progress: number;
  setBodyPart: (part: BodyPart) => void;
  addBodyCondition: (condition: string) => void;
  removeBodyCondition: (condition: string) => void;
  setBudget: (budget: Budget) => void;
  setVisitFrequency: (frequency: VisitFrequency) => void;
  setConcerns: (concerns: Concerns) => void;
  addPhoto: (photo: File) => void;
  removePhoto: (index: number) => void;
  resetForm: () => void;
}

interface CurStep {
  curStep: ""
}

// Initial state
const initialState: FormState = {
  bodyPart: null,
  bodyConditions: [],
  budget: null,
  visitFrequency: null,
  concerns: "",
  photos: []
};

// Create context
const FormContext = createContext<FormContextType | undefined>(undefined);

// Provider component
export function FormProvider({ children }: { children: ReactNode }) {
  const [formState, setFormState] = useState<FormState>(initialState);

  // Calculate progress based on form completion
  const calculateProgress = (): number => {
    let progress = 0;

    if (formState.bodyPart) progress += 25;
    if (formState.bodyConditions.length > 0) progress += 25;
    if (formState.budget && formState.visitFrequency) progress += 25;
    if (formState.concerns) progress += 25;

    return progress;
  };

  // Update functions
  const setBodyPart = (part: BodyPart) => {
    setFormState(prev => ({ ...prev, bodyPart: part }));
  };

  const addBodyCondition = (condition: string) => {
    setFormState(prev => ({
      ...prev,
      bodyConditions: [...prev.bodyConditions, condition]
    }));
  };

  const removeBodyCondition = (condition: string) => {
    setFormState(prev => ({
      ...prev,
      bodyConditions: prev.bodyConditions.filter(c => c !== condition)
    }));
  };

  const setBudget = (budget: Budget) => {
    setFormState(prev => ({ ...prev, budget }));
  };

  const setVisitFrequency = (frequency: VisitFrequency) => {
    setFormState(prev => ({ ...prev, visitFrequency: frequency }));
  };

  const setConcerns = (concerns: Concerns) => {
    setFormState(prev => ({ ...prev, concerns }));
  };

  const addPhoto = (photo: File) => {
    setFormState(prev => ({
      ...prev,
      photos: [...prev.photos, photo]
    }));
  };

  const removePhoto = (index: number) => {
    setFormState(prev => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index)
    }));
  };

  const resetForm = () => {
    setFormState(initialState);
  };

  const progress = calculateProgress();

  return (
    <FormContext.Provider
      value={{
        formState,
        progress,
        setBodyPart,
        addBodyCondition,
        removeBodyCondition,
        setBudget,
        setVisitFrequency,
        setConcerns,
        addPhoto,
        removePhoto,
        resetForm
      }}
    >
      {children}
    </FormContext.Provider>
  );
}

// Custom hook to use the context
export function useForm() {
  const context = useContext(FormContext);
  if (context === undefined) {
    throw new Error("useForm must be used within a FormProvider");
  }
  return context;
}
