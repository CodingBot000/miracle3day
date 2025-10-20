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
    queryKey: ['treatment_care_protocols', params],
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
    queryFn: (): Promise<TopicListResponse> => treatmentService.getTopicList(),
    staleTime: 5 * 60 * 1000,
  });
};

export const useTopicDetail = (topic_id: string, area_id: string) => {
  return useQuery({
    queryKey: ['topic-detail', topic_id, area_id],
    queryFn: (): Promise<TopicDetailResponse> => treatmentService.getTopicDetail(topic_id, area_id),
    enabled: !!topic_id && !!area_id,
    staleTime: 5 * 60 * 1000,
  });
};
