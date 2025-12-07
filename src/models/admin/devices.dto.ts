export interface Device {
    id: string;
    ko: string;
    en: string;
    type: 'device' | 'drug' | 'program';
    group: string;
    dept: 'skin' | 'plastic' | 'both';
  }
  