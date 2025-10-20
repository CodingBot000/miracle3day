import { createClient } from "@/utils/session/server";
import { NextResponse } from "next/server";

export async function GET() {
  const backendClient = createClient();
  const {
    data: { user },
  } = await backendClient.auth.getUser();

  return NextResponse.json({ user });
}
