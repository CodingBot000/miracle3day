import { createClient } from "@/utils/supabase/server";
import { LIMIT } from "./constant";
import { LOCATIONS as locationList } from "@/constants";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createClient();

  const location = locationList.map((loc) => {
    return loc.toLowerCase() === params.id.toLowerCase();
  });

  const { searchParams } = new URL(req.url);
  const pageParam = parseInt(searchParams.get("pageParam") as string);

  const offset = pageParam * LIMIT;
  const limit = offset + LIMIT - 1;

  try {
    const baseListQuery = supabase
      .from("hospital")
      .select(
        `id_unique,
         imageurls,
         name
        `,
        { count: "exact" }
      )
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
