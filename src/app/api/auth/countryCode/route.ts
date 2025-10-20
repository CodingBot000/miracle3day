import { createClient } from "@/utils/session/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const backendClient = createClient();

  try {
    const { data, error, status, statusText } = await backendClient
      .from("country_codes")
      .select("*");

    if (error) {
      return NextResponse.json({ data: null }, { status, statusText });
    }

    return NextResponse.json({ countryCode: data }, { status, statusText });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ status: 500, statusText: error.message });
    }
  }
}
