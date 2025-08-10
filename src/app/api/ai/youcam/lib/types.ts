export type SkinConcern = 
  | 'Wrinkle' | 'Droopy_upper_eyelid' | 'Firmness' | 'Acne'
  | 'Moisture' | 'Eye_bag' | 'Dark_circle' | 'Spots'
  | 'Radiance' | 'Redness' | 'Oiliness' | 'Pore' | 'Texture'
  | 'HD_Wrinkle' | 'HD_Droopy_upper_eyelid' | 'HD_Firmness' | 'HD_Acne'
  | 'HD_Moisture' | 'HD_Eye_bag' | 'HD_Dark_circle' | 'HD_Spots'
  | 'HD_Radiance' | 'HD_Redness' | 'HD_Oiliness' | 'HD_Pore' | 'HD_Texture';

export interface SkinAnalysisRequest {
  fileId: string;
  concerns: SkinConcern[];
}

export interface UploadResponse {
  status: number;
  result: {
    file_id: string;
    upload_url: string;
  };
}

export interface TaskResponse {
  status: number;
  result: {
    task_id: string;
  };
}

export interface TaskStatusResponse {
  status: number;
  result: {
    polling_interval: number;
    status: 'running' | 'success' | 'error';
    error?: string;
    error_message?: string;
    results?: Array<{
      id: number;
      data: Array<{
        url: string;
      }>;
    }>;
  };
}

export interface SkinAnalysisResponse {
  status: string;
  downloadUrl: string;
  zipData: Buffer;
}

export interface SkinScore {
  raw_score: number;
  ui_score: number;
  output_mask_name?: string;
}

export interface ScoreInfo {
  [key: string]: SkinScore | { score: number } | number;
  all: { score: number };
  skin_age: number;
}

export interface ParsedAnalysisResult {
  overallScore: number;
  skinAge?: number;
  concerns: {
    name: string;
    rawScore: number;
    uiScore: number;
    maskImage?: string;
  }[];
  maskImages: Map<string, Buffer>;
}

export interface ClientAnalysisRequest {
  image: string | File;
  concerns: SkinConcern[];
  mode?: 'SD' | 'HD';
}

export interface ClientAnalysisResponse {
  success: boolean;
  data?: {
    overallScore: number;
    skinAge?: number;
    concerns: {
      name: string;
      score: number;
      severity: 'low' | 'medium' | 'high';
      maskImageUrl?: string;
    }[];
  };
  error?: string;
}