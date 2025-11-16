import { useQuery } from '@tanstack/react-query';
import { TreatmentProductData } from '@/app/models/treatmentProduct.dto';

interface TreatmentProductsResponse {
  products: TreatmentProductData[];
}

export const useTreatmentProducts = (hospitalId: string) => {
  return useQuery({
    queryKey: ['treatmentProducts', hospitalId],
    queryFn: async () => {
      // Try the primary API first (treatment_product table)
      const response = await fetch(`/api/hospital/${hospitalId}/treatment-products`);

      if (!response.ok) {
        throw new Error('Failed to fetch treatment products');
      }

      const data: TreatmentProductsResponse = await response.json();

      // If primary API returns empty results, try the fallback API (treatment_info table)
      // if (!data.products || data.products.length === 0) {
      //   const fallbackResponse = await fetch(`/api/hospital/${hospitalId}/treatment-products-other`);

      //   if (!fallbackResponse.ok) {
      //     throw new Error('Failed to fetch treatment products from fallback');
      //   }

      //   const fallbackData: TreatmentProductsResponse = await fallbackResponse.json();
      //   return fallbackData.products;
      // }

      return data.products;
    },
    enabled: !!hospitalId,
  });
};
