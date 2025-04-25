import { fetchUtils } from "@/utils/fetch";
import { BannerOutputDto } from "./banner.dto";

export const getBannerAPI = async (): Promise<BannerOutputDto> => {
  const url = `${process.env.NEXT_PUBLIC_API_ROUTE}/api/home/banner`;
  // const url = `${process.env.NEXT_PUBLIC_API_ROUTE}/api/home/hospital/location?locationNum=${locationNum}`;
  console.log(`Banner API URL: ${url}`);
  try {
    const data = await fetchUtils<BannerOutputDto>({ 
      url,
      fetchOptions: {
        headers: {
          'Cache-Control': 'public, max-age=60, stale-while-revalidate=300',
          // 'Cache-Control': 'no-cache, no-store, must-revalidate',
          // 'Pragma': 'no-cache',
          // 'Expires': '0'
        }
      }
    });

//     public	브라우저뿐 아니라 CDN/프록시도 캐시 가능
// max-age=60	브라우저가 최대 60초 동안은 무조건 캐시 사용
// stale-while-revalidate=300	60초 지나도 최대 5분까지는 예전 캐시 보여주고, 백그라운드로 새로 요청

    console.log('Banner Data:', JSON.stringify(data, null, 2));
    // console.log(`dataaaaaaa2: ${data[0].imgUrl}`);
    return data;
  } catch (error) {
    console.error('Failed to fetch banner data:', error);
    return { data: [] };
  }
};
