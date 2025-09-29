import { useQuery } from '@tanstack/react-query';
import { treatmentService } from '@/services/treatmentService';
import { 
  GetTreatmentCareProtocolsParams,
  TreatmentCategoryResponse,
  TopicListResponse,
  TopicDetailResponse
} from '@/app/models/treatmentData.dto';

export const useTreatmentCareProtocols = (params?: GetTreatmentCareProtocolsParams) => {
  return useQuery({
    queryKey: ['treatment-care-protocols', params],
    queryFn: () => treatmentService.getTreatmentCareProtocols(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useTreatmentCategoriesByTopic = (topic_id: string) => {
  return useQuery({
    queryKey: ['treatment-categories', topic_id],
    queryFn: () => treatmentService.getTreatmentCareProtocolsByTopic(topic_id),
    enabled: !!topic_id,
    staleTime: 5 * 60 * 1000,
  });
};

export const useAllTreatmentCategories = () => {
  return useQuery({
    queryKey: ['all-treatment-categories'],
    queryFn: () => treatmentService.getAllTreatmentCategories(),
    staleTime: 5 * 60 * 1000,
  });
};

// New hooks for the correct API architecture
export const useTopicList = () => {
  return useQuery({
    queryKey: ['topic-list'],
    queryFn: async (): Promise<TopicListResponse> => {
      const response = await fetch('/api/treatment/care-protocols/');
      if (!response.ok) {
        throw new Error('Failed to fetch topic list');
      }
      return response.json();
    },
    staleTime: 5 * 60 * 1000,
  });
};

export const useTopicDetail = (topic_id: string, area_id: string) => {
  return useQuery({
    queryKey: ['topic-detail', topic_id, area_id],
    queryFn: async (): Promise<TopicDetailResponse> => {
      const params = new URLSearchParams({ topic_id, area_id });
      const response = await fetch(`/api/treatment/care-protocols/?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch topic detail');
      }
      return response.json();
    },
    enabled: !!topic_id && !!area_id,
    staleTime: 5 * 60 * 1000,
  });
};