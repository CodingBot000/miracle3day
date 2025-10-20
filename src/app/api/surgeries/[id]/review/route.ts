import { createClient } from "@/utils/session/server";
import { LIMIT } from "./constant";
import { TABLE_REVIEW } from "@/constants/tables";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const backendClient = createClient();

  const id = params.id;

  const { searchParams } = new URL(req.url);
  const pageParam = parseInt(searchParams.get("pageParam") as string);

  const offset = pageParam * LIMIT;
  const limit = offset + LIMIT - 1;

  try {
    const surgeriesId = await backendClient
      .from("banner_item")
      .select(`id_surgeries`)
      .match({ id });

    if (!surgeriesId.data) {
      const { status, statusText } = surgeriesId;

      return Response.json({
        status,
        statusText,
      });
    }

    const surgeriesIds = surgeriesId?.data[0]?.id_surgeries;

    if (!surgeriesIds) {
      return Response.json({ data: [], nextCursor: 0 });
    }

    const { data, error, status, statusText, count } = await backendClient
      .from(TABLE_REVIEW)
      .select("*", { count: "exact" })
      .overlaps("id_surgeries", surgeriesIds)
      .range(offset, limit);

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
