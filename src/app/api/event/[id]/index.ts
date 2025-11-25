import { EventDetailInputDto, EventDetailOutput } from "@/app/models/eventDetailData.dto";
import { fetchUtils } from "@/utils/fetch";
// import { EventDetailInputDto, EventDetailOutput } from "./event.dto";

export const getEventDetailAPI = async ({
  id,
}: EventDetailInputDto): Promise<EventDetailOutput> => {
  const url = `${process.env.NEXT_PUBLIC_API_ROUTE}/api/event/${id}`;
  log.debug(`qq qq getEventDetailAPI url:${url}`);
  const data = await fetchUtils<EventDetailOutput>({
    url,
    fetchOptions: { cache: "no-cache" },
  });

  return data;
};
