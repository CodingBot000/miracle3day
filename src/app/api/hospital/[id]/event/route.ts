import { createClient } from "@/utils/supabase/server";
import { LIMIT } from "./constnat";
import { TABLE_EVENT } from "@/constants/tables";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createClient();

  const id_hospital = params.id;

  const { searchParams } = new URL(req.url);
  const pageParam = parseInt(searchParams.get("pageParam") as string);

  const offset = pageParam * LIMIT;
  const limit = offset + LIMIT - 1;

  try {
    const { data, error, count, status, statusText } = await supabase
      .from(TABLE_EVENT)
      .select("*", { count: "exact" })
      .eq( "id_uuid_hospital", id_hospital )
      .range(offset, limit)
      .order("created_at", { ascending: true });

    if (error) {
      return Response.json({ data: null }, { status, statusText });
    }

    const nextCursor = count && limit < count;

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
