import { 
  GetTreatmentCareProtocolsParams, 
  GetTreatmentCareProtocolsResponse,
  TreatmentCategoryResponse 
} from '@/app/models/treatmentData.dto';

class TreatmentService {
  private baseUrl = '/api/treatment';

  async getTreatmentCareProtocols(params?: GetTreatmentCareProtocolsParams): Promise<GetTreatmentCareProtocolsResponse> {
    const searchParams = new URLSearchParams();
    
    if (params?.topic_id) searchParams.set('topic_id', params.topic_id);
    if (params?.area_id) searchParams.set('area_id', params.area_id);
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    if (params?.offset) searchParams.set('offset', params.offset.toString());

    const url = `${this.baseUrl}/care-protocols/${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch treatment care protocols: ${response.statusText}`);
    }

    return response.json();
  }

  async getTreatmentCareProtocolsByTopic(topic_id: string): Promise<TreatmentCategoryResponse[]> {
    const result = await this.getTreatmentCareProtocols({ topic_id });
    return result.data;
  }

  async getAllTreatmentCategories(): Promise<TreatmentCategoryResponse[]> {
    const result = await this.getTreatmentCareProtocols();
    return result.data;
  }
}

export const treatmentService = new TreatmentService();