import { useQuery } from '@tanstack/react-query';
import { treatmentService } from '@/services/treatmentService';
import {
  GetTreatmentCareProtocolsParams,
  TreatmentCategoryResponse,
  TopicListResponse,
  TopicDetailResponse
} from '@/models/treatmentData.dto';
import type { SurgeryProtocolsResponse, SurgeryProtocol } from '@/models/surgeryData.dto';

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

// Surgery hooks
export const useSurgeryProtocols = () => {
  return useQuery({
    queryKey: ['surgery-protocols'],
    queryFn: async (): Promise<SurgeryProtocolsResponse> => {
      const baseUrl =
        typeof window === "undefined"
          ? process.env.NEXT_PUBLIC_API_ROUTE
          : window.location.origin;
      const url = `${baseUrl}/api/surgery_care_protocols`;

      const response = await fetch(url, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch surgery protocols: ${response.statusText}`);
      }

      return response.json();
    },
    staleTime: 5 * 60 * 1000,
  });
};

export const useSurgeryDetail = (id: string) => {
  return useQuery({
    queryKey: ['surgery-detail', id],
    queryFn: async (): Promise<SurgeryProtocol> => {
      const baseUrl =
        typeof window === "undefined"
          ? process.env.NEXT_PUBLIC_API_ROUTE
          : window.location.origin;
      const url = `${baseUrl}/api/surgery_care_protocols/${id}`;

      const response = await fetch(url, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch surgery detail: ${response.statusText}`);
      }

      return response.json();
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};

export const useSurgeryCategories = (category: string) => {
  return useQuery({
    queryKey: ['surgery-categories', category],
    queryFn: async (): Promise<SurgeryProtocolsResponse> => {
      const baseUrl =
        typeof window === "undefined"
          ? process.env.NEXT_PUBLIC_API_ROUTE
          : window.location.origin;
      const url = `${baseUrl}/api/surgery_care_protocols?eq.category=${category}`;

      const response = await fetch(url, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch surgery categories: ${response.statusText}`);
      }

      return response.json();
    },
    enabled: !!category,
    staleTime: 5 * 60 * 1000,
  });
};
