import { TABLE_MEMBERS } from "@/constants/tables";
import { createClient } from "@/utils/session/server";

export async function POST(req: Request) {
  const backendClient = createClient();

  try {
    const body = await req.json();

    if (!body.email) {
      throw Error("not Found Email");
    }

    const { data, error, status, statusText } = await backendClient
      .from(TABLE_MEMBERS)
      .select("*")
      .match({ email: body.email });

    if (error) {
      return Response.json({ status, statusText });
    }

    return Response.json({ user: data[0] }, { status, statusText });
  } catch (error) {
    if (error instanceof Error) {
      return Response.json(
        { user: null },
        { status: 500, statusText: error.message }
      );
    }
  }
}
