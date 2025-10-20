import { TABLE_MEMBERS } from "@/constants/tables";
import { createClient } from "@/utils/session/server";

export async function POST(req: Request) {
  const body = await req.json();

  const { email, token } = body;

  const backendClient = createClient();

  try {
    const { data, error } = await backendClient.auth.verifyOtp({
      email,
      token,
      type: "signup",
    });

    if (error) {
      return Response.json(
        { data },
        { status: error.status, statusText: error.code }
      );
    }

    const findUser = await backendClient
      .from(TABLE_MEMBERS)
      .select("uuid,email,email_verify")
      .match({ email });

    // if (userError || !users || users.length === 0) {
    //   throw new Error("Not Found User");
    // }

    if (!findUser || !findUser.data || findUser.data.length == 0 || !findUser.data[0]!.uuid) {
      throw Error("Not Found User");
    }

    const createEmailVerify = await backendClient
      .from(TABLE_MEMBERS)
      .update({ email_verify: true })
      .match({ uuid: findUser.data[0]!.uuid });

    if (createEmailVerify.error) {
      const { error } = createEmailVerify;
      throw Error(error.message || error.code);
    }

    return Response.json({ data }, { status: 200, statusText: "success" });
  } catch (error) {
    if (error instanceof Error) {
      return Response.json(
        { data: null },
        { status: 500, statusText: error.message }
      );
    }
  }
}
