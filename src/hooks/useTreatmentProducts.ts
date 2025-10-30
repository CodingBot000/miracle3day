import { useQuery } from '@tanstack/react-query';
import { TreatmentProductData } from '@/app/models/treatmentProduct.dto';

interface TreatmentProductsResponse {
  products: TreatmentProductData[];
}

export const useTreatmentProducts = (hospitalId: string) => {
  return useQuery({
    queryKey: ['treatmentProducts', hospitalId],
    queryFn: async () => {
      const response = await fetch(`/api/hospital/${hospitalId}/treatment-products`);

      if (!response.ok) {
        throw new Error('Failed to fetch treatment products');
      }

      const data: TreatmentProductsResponse = await response.json();
      return data.products;
    },
    enabled: !!hospitalId,
  });
};
