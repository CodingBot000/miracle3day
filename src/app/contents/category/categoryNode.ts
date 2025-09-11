export type CategoryNode = {
    key: string;
    label: string;
    children?: CategoryNode[];
  };
  

  export type CategoryNodeRegion = {
  key: number;
  name: string;
  label: string;
  unit?: string;
  department?: string;
  children?: CategoryNodeRegion[];
};
