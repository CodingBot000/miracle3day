import { createClient } from "@/utils/supabase/server";
import { LIMIT } from "./constant";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const id_hospital = params.id;

  const { searchParams } = new URL(req.url);
  const pageParam = parseInt(searchParams.get("pageParam") as string);

  const offset = pageParam * LIMIT;
  const limit = offset + LIMIT - 1;

  const supabase = createClient();

  try {
    const { data, count, error, status, statusText } = await supabase
      .from("reviews")
      .select("*, hospital ( name ), user ( nickname )", { count: "exact" })
      .match({ id_hospital })
      .range(offset, limit)
      .order("created_at", { ascending: true });

    if (error) {
      return Response.json({ status, statusText });
    }

    const nextCursor = count && limit < count;

    return Response.json({ data, nextCursor }, { status, statusText });
  } catch (error) {
    if (error instanceof Error) {
      return Response.json({ status: 500, statusText: error.message });
    }
  }
}
