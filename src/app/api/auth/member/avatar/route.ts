import { NextResponse, NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { BUCKET_USERS, TABLE_MEMBERS } from "@/constants/tables";
import { q } from "@/lib/db";
import { findMemberByUserId } from "../../getUser/member.helper";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "Missing userId" },
        { status: 400, statusText: "user_id_required" }
      );
    }

    const rows = await q<{ avatar: string | null }>(
      `SELECT avatar FROM ${TABLE_MEMBERS} WHERE id_uuid::text = $1 OR clerk_user_id = $1 LIMIT 1`,
      [userId]
    );

    const avatar = rows[0]?.avatar ?? null;

    if (!avatar) {
      return NextResponse.json({ avatarUrl: null }, { status: 200 });
    }

    if (/^https?:\/\//.test(avatar)) {
      return NextResponse.json({ avatarUrl: avatar }, { status: 200 });
    }

    const base =
      (process.env.NEXT_PUBLIC_LIGHTSAIL_ENDPOINT ||
        process.env.LIGHTSAIL_ENDPOINT ||
        "").replace(/\/+$/, "");
    const key = [BUCKET_USERS.replace(/^\//, "").replace(/\/+$/, ""), avatar]
      .filter(Boolean)
      .join("/")
      .replace(/\/+/g, "/");

    const publicUrl = base ? `${base}/${key}` : `/${key}`;

    if (!publicUrl) {
      console.error("avatar storage public url error: unable to construct URL");
      return NextResponse.json(
        { error: "user avatar public url not found" },
        { status: 500, statusText: "avatar_public_url_failed" }
      );
    }

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

export async function PATCH(req: NextRequest) {
  const { userId } = auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const path = typeof body?.path === "string" ? body.path.trim() : "";

    if (!path) {
      return NextResponse.json({ error: "path is required" }, { status: 400 });
    }

    const member = await findMemberByUserId(userId);

    if (!member) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 });
    }

    const targetUuid =
      (member["uuid"] as string | undefined) ??
      (member["id_uuid"] as string | undefined) ??
      userId;

    const base =
      (process.env.NEXT_PUBLIC_LIGHTSAIL_ENDPOINT ||
        process.env.LIGHTSAIL_ENDPOINT ||
        "").replace(/\/+$/, "");

    const key = path.replace(/^\/+/, "");
    const publicUrl = base ? `${base}/${key}` : `/${key}`;

    const updates = await q(
      `UPDATE ${TABLE_MEMBERS}
       SET avatar = $1, updated_at = now()
       WHERE clerk_user_id = $2
          OR id_uuid::text = $2
       RETURNING avatar`,
      [publicUrl, targetUuid]
    );

    if (!updates.length) {
      return NextResponse.json({ error: "Failed to update avatar" }, { status: 404 });
    }

    return NextResponse.json({ ok: true, avatarUrl: publicUrl });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update avatar";
    console.error("PATCH /api/auth/member/avatar error:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
