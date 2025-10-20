import { TABLE_MEMBERS } from "@/constants/tables";
import { createClient } from "@/utils/session/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get("email") as string;

  const backendClient = createClient();

  try {
    const { data: users, error: userError } = await backendClient
      .from(TABLE_MEMBERS)
      .select("uuid,email,email_verify")
      .match({ email });

    if (userError || !users || users.length === 0) {
      throw new Error("Not Found User");
    }

    const user = users[0]!;

    // 이미 인증을 한 유저
    if (user.email_verify) {
      return Response.json(
        { user },
        { status: 307, statusText: "is already registered try to login" }
      );
    }

    const { data, error } = await backendClient.auth.signInWithOtp({ email });

    if (error) {
      return Response.json({ status: error.status, statusText: error.code });
    }

    return Response.json({ user }, { status: 200, statusText: "success" });
  } catch (error) {
    if (error instanceof Error) {
      return Response.json(
        { data: null },
        { status: 500, statusText: error.message }
      );
    }
  }
}
