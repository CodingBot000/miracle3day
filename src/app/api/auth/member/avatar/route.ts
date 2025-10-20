import { NextResponse } from "next/server";
import { BUCKET_USERS, TABLE_MEMBERS } from "@/constants/tables";
import { createClient } from "@/utils/session/server";

export async function GET(request: Request) {
  const backendClient = createClient();

  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "Missing userId" },
        { status: 400, statusText: "user_id_required" }
      );
    }

    const { data: memberData, error: memberError } = await backendClient
      .from(TABLE_MEMBERS)
      .select("avatar")
      .eq("uuid", userId)
      .maybeSingle();

    if (memberError) {
      console.error("avatar lookup error", memberError);
      return NextResponse.json(
        { error: memberError.message },
        { status: 500, statusText: "avatar_lookup_failed" }
      );
    }

    if (!memberData?.avatar) {
      return NextResponse.json({ avatarUrl: null }, { status: 200 });
    }

    const avatar = memberData.avatar as string;

    if (/^https?:\/\//.test(avatar)) {
      return NextResponse.json({ avatarUrl: avatar }, { status: 200 });
    }

    const { data: publicUrlData } = backendClient.storage
      .from(BUCKET_USERS)
      .getPublicUrl(avatar);

    if (!publicUrlData) {
      console.error("avatar storage public url error !publicUrlData");
      return NextResponse.json(
        { error: 'user avatar public url not found' },
        { status: 500, statusText: "avatar_public_url_failed" }
      );
    }

    const publicUrl = publicUrlData?.publicUrl ?? null;

    return NextResponse.json({ avatarUrl: publicUrl }, { status: 200 });
  } catch (error) {
    if (error instanceof Error) {
      console.error("avatar fetch error", error);
      return NextResponse.json(
        { error: error.message },
        { status: 500, statusText: "avatar_fetch_error" }
      );
    }

    return NextResponse.json(
      { error: "Unknown error" },
      { status: 500, statusText: "avatar_fetch_error" }
    );
  }
}
