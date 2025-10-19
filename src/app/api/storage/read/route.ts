import { NextResponse } from "next/server";
import { s3 } from "@/lib/s3";
import { GetObjectCommand } from "@aws-sdk/client-s3";

const BUCKET = process.env.LIGHTSAIL_BUCKET_NAME!;

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const key = searchParams.get("key");
  if (!key) return NextResponse.json({ error: "Missing key" }, { status: 400 });

  try {
    const { Body, ContentType } = await s3.send(new GetObjectCommand({ Bucket: BUCKET, Key: key }));
    // @ts-ignore: Body is a stream
    return new Response(Body as ReadableStream, {
      headers: { "Content-Type": ContentType || "application/octet-stream" },
    });
  } catch (e) {
    console.error("read proxy error:", e);
    return NextResponse.json({ error: "Read failed" }, { status: 500 });
  }
}
