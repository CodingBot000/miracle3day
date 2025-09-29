"use client";

import * as React from "react";
import type { Treatment } from "../../../constants/treatment/types";

export default function useCompareSelection() {
  const [selected, setSelected] = React.useState<Treatment[]>([]);

  const toggle = (t: Treatment) => {
    setSelected(prev => {
      const exists = prev.find(p => p.id === t.id);
      if (exists) return prev.filter(p => p.id !== t.id);
      if (prev.length >= 4) {
        const [, ...rest] = prev;
        return [...rest, t];
      }
      return [...prev, t];
    });
  };

  const clear = () => setSelected([]);

  return { selected, toggle, clear };
}
