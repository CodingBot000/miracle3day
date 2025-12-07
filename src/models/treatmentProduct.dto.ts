/**
 * Treatment Product DTO
 * Represents treatment/procedure products offered by hospitals
 */

export interface TreatmentProductJsonb {
  ko?: string;
  en?: string;
}

export interface TreatmentProductData {
  id: number;
  id_uuid_hospital: string;
  department: string;
  level1: TreatmentProductJsonb;
  name: TreatmentProductJsonb;
  option_value: string;
  unit: TreatmentProductJsonb;
  price: number;
  group_id: string;
  expose: boolean;
}

/**
 * Grouped treatment products by department and group
 */
export interface GroupedTreatmentProducts {
  department: string;
  groups: TreatmentGroup[];
}

export interface TreatmentGroup {
  groupTitle: TreatmentProductJsonb; // name field used as group title
  items: TreatmentProductData[];
}
