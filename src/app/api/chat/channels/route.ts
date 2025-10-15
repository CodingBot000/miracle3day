import { NextRequest, NextResponse } from "next/server";
import { getChannelList } from "@/lib/sendbird";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { ok: false, error: "userId is required" },
        { status: 400 }
      );
    }

    console.log('[channels] Fetching channels for user:', userId);
    const data = await getChannelList(userId);

    console.log('[channels] Found channels:', data.channels?.length || 0);
    return NextResponse.json({
      ok: true,
      channels: data.channels || [],
    });
  } catch (e: any) {
    console.error('[channels] Error:', e.response?.data || e.message);
    return NextResponse.json(
      {
        ok: false,
        error: e.response?.data?.message || e.message,
      },
      { status: 400 }
    );
  }
}
