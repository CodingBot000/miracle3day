import { NextResponse } from "next/server";
import { s3 } from "@/lib/s3";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const EXPIRES = Number(process.env.PRESIGN_EXPIRES ?? 300);
const BUCKET = process.env.LIGHTSAIL_BUCKET_NAME!;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get("key");
    if (!key) return NextResponse.json({ error: "Missing key" }, { status: 400 });

    const command = new GetObjectCommand({ Bucket: BUCKET, Key: key });
    const url = await getSignedUrl(s3, command, { expiresIn: EXPIRES });
    return NextResponse.json({ url, expiresIn: EXPIRES });
  } catch (err) {
    console.error("presign-read error:", err);
    return NextResponse.json({ error: "Failed to generate read URL" }, { status: 500 });
  }
}
