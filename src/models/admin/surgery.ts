/**
 * Surgery type definition
 * Represents a medical procedure/surgery in the system
 */
export interface Surgery {
  created_at: string;
  description: string;
  id: number;
  id_unique: number;
  imageurls: string[];
  name: string;
  type: string;
}
