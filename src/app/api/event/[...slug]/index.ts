import { fetchUtils } from "@/utils/fetch";
import { EventDataListInputDto, EventDataListOutputDto } from "./event.dto";

export const getEventByCategoryAPI = async ({
  main, depth1, depth2, depth3,
}: EventDataListInputDto): Promise<EventDataListOutputDto> => {
  const url = `${process.env.NEXT_PUBLIC_API_ROUTE}/api/event/${main}/${depth1}/${depth2}/${depth3}`;
  console.log(`qq qq getCategoryEventAPI url:${url}`);
  const data = await fetchUtils<EventDataListOutputDto>({
    url,
    fetchOptions: { cache: "no-cache" },
  });

  return data;
};
