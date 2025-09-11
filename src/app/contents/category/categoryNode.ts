export type CategoryNode = {
    key: string;
    label: string;
    children?: CategoryNode[];
  };
  

export type CategoryNodeRegion = {
  key: number;
  name: string;
  label: {
    ko: string;
    en: string;
  };
  unit?: string;
  department?: string;
  children?: CategoryNodeRegion[];
};
