import { createClient } from "@/utils/session/server";
import { LIMIT } from "./constant";
import { LOCATIONS as locationList } from "@/constants";
import { TABLE_HOSPITAL } from "@/constants/tables";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const backendClient = createClient();

  const location = locationList.map((loc) => {
    console.log('qq qq location route loc: ', loc);
    console.log('qq qq location route params.id: ', params.id);
    return loc.toLowerCase() === params.id.toLowerCase();
  });
  console.log('qq qq location route location: ', location);
  const { searchParams } = new URL(req.url);
  const pageParam = parseInt(searchParams.get("pageParam") as string);

  const offset = pageParam * LIMIT;
  const limit = offset + LIMIT - 1;

  try {
    const baseListQuery = backendClient
      .from(TABLE_HOSPITAL)
      .select(
        `id_unique,
         imageurls,
         name
        `,
        { count: "exact" }
      )
      .eq('show', true)
      .range(offset, limit);

    // if (location !== -1) {
      baseListQuery.match({ location });
    // }

    const { data, error, status, statusText, count } = await baseListQuery;

    if (error) {
      return Response.json({ data: null }, { status, statusText });
    }

    const nextCursor = !count || count === 0 ? 0 : limit < count;

    return Response.json({ data, nextCursor }, { status, statusText });
  } catch (error) {
    if (error instanceof Error) {
      return Response.json(
        { data: null },
        { status: 500, statusText: error.message }
      );
    }
  }
}
