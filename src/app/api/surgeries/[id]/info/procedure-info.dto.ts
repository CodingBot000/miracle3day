export interface ProceduresInputDto {
  id_unique: number
}

export interface ProcedureData {
  id: number;
  created_at: string;
  type: string;
  name: string;
  imageurls: string[];
  description: string;
  id_unique: number;
}

export interface ProceduresOutputDto  {
  data: ProcedureData;
}
