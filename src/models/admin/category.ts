/**
 * Category node for treatment categories
 * Used in the main treatment categorization system
 */
export type CategoryNode = {
  key: number;
  name: string;
  label: string;
  unit?: string;
  department?: string;
  children?: CategoryNode[];
};

/**
 * Category node with tag structure
 * Used for hierarchical category displays with internationalization
 */
export type CategoryNodeTag = {
  id: string;
  key: string;
  ko: string;
  en: string;
  children?: CategoryNodeTag[];
};
  