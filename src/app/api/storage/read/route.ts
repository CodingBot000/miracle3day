import { NextResponse } from "next/server";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { log } from "@/utils/logger";

export const dynamic = "force-dynamic";
export const fetchCache = "default-no-store";
export const preferredRegion = "auto";
export const dynamicParams = true;

function mask(val?: string) {
  if (!val) return "(empty)";
  return `${val.slice(0,4)}…${val.slice(-4)}`;
}

const region = process.env.LIGHTSAIL_REGION!;
const endpoint = process.env.LIGHTSAIL_ENDPOINT!;
const accessKeyId = process.env.LIGHTSAIL_ACCESS_KEY!;
const secretAccessKey = process.env.LIGHTSAIL_SECRET_KEY!;
const bucket = process.env.LIGHTSAIL_BUCKET_NAME!;

// 🔎 런타임에서 실제 무엇을 읽는지 마스킹 로그(일시적으로만 사용)
log.debug("[read.env] region=", region, "endpoint=", endpoint);
log.debug("[read.env] keyId=", mask(accessKeyId), "secret=", mask(secretAccessKey));

const s3 = new S3Client({
  region,
  endpoint,                 // ← https://s3.us-west-2.amazonaws.com
  // s3ForcePathStyle: false, // 기본값으로 OK. 필요하면 주석 해제
  credentials: {
    accessKeyId,
    secretAccessKey,
  },
});

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const keyRaw = searchParams.get("key");

  if (!keyRaw) {
    return NextResponse.json({ error: "Missing key" }, { status: 400 });
  }

  const Key = decodeURIComponent(keyRaw);

  try {
    const cmd = new GetObjectCommand({ Bucket: bucket, Key });
    const url = await getSignedUrl(s3, cmd, { expiresIn: 120 });

    // 안전하게 JSON으로 반환(리다이렉트 루프 방지)
    return NextResponse.json({ url });
  } catch (err: any) {
    console.error("[read.error]", err);
    return NextResponse.json(
      { error: "Read failed", detail: err?.message || String(err) },
      { status: 500 }
    );
  }
}
