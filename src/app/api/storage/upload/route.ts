import { NextResponse } from "next/server";
import { s3 } from "@/lib/s3";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import crypto from "node:crypto";

export const runtime = "nodejs"; // 서버 런타임

const BUCKET = process.env.LIGHTSAIL_BUCKET_NAME!;
const ALLOWED = (process.env.ALLOWED_UPLOAD_TYPES ?? "")
  .split(",")
  .map(s => s.trim())
  .filter(Boolean);

function buildKey(fileName: string) {
  const safe = fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
  const d = new Date();
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(d.getUTCDate()).padStart(2, "0");
  const rand = crypto.randomBytes(8).toString("hex");
  return `uploads/${y}/${m}/${dd}/${rand}_${safe}`;
}

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const file = form.get("file") as File | null;
    if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });

    if (ALLOWED.length && !ALLOWED.includes(file.type)) {
      return NextResponse.json({ error: "Unsupported contentType" }, { status: 400 });
    }

    const key = buildKey(file.name);
    const arrayBuffer = await file.arrayBuffer();
    const body = Buffer.from(arrayBuffer);

    await s3.send(new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: body,
      ContentType: file.type || "application/octet-stream",
      // ServerSideEncryption: "AES256", // 원하면 주석 해제
      // CacheControl: "public,max-age=31536000,immutable",
    }));

    const publicUrl = `https://${BUCKET}.s3.${process.env.LIGHTSAIL_REGION}.amazonaws.com/${key}`;
    return NextResponse.json({ ok: true, key, publicUrl });
  } catch (e) {
    console.error("upload error:", e);
    return NextResponse.json({ ok: false, error: "Upload failed" }, { status: 500 });
  }
}
