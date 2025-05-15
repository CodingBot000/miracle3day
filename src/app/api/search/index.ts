import { fetchUtils } from "@/utils/fetch";
import { SearchOutputDto } from "./search.dto";

export const getSearchAPI = async (query: string): Promise<SearchOutputDto> => {
  const url = `${process.env.NEXT_PUBLIC_API_ROUTE}/api/search?q=${encodeURIComponent(query)}`;

  try {
    const data = await fetchUtils<SearchOutputDto>({ 
      url,
      fetchOptions: {
        headers: {
          // 'Cache-Control': 'public, max-age=60, stale-while-revalidate=300',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          // 'Pragma': 'no-cache',
          // 'Expires': '0'
        }
      }
    });


    return { data: data.data };
  } catch (error) {
    console.error('Failed to fetch search data:', error);
    return { data: { hospitals: [], events: [], reviews: [] } };
  }
};
