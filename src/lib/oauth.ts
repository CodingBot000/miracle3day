import crypto from "crypto";

export function randomString(bytes = 32) {
  return crypto.randomBytes(bytes).toString("base64url");
}

export function sha256(input: string) {
  return crypto.createHash("sha256").update(input).digest();
}

export function toCodeChallenge(verifier: string) {
  return Buffer.from(sha256(verifier)).toString("base64url");
}

// State encryption for OAuth - encodes verifier and redirect into state parameter
// This avoids cookie issues with cross-site redirects
const ALGORITHM = "aes-256-gcm";
const getEncryptionKey = () => {
  const secret = process.env.SESSION_PASSWORD || process.env.SESSION_SECRET || process.env.IRON_SESSION_PASSWORD;
  if (!secret) throw new Error("SESSION_PASSWORD required");
  return crypto.createHash("sha256").update(secret).digest();
};

export interface OAuthStateData {
  verifier: string;
  redirect: string;
  nonce: string;
}

export function encryptOAuthState(data: OAuthStateData): string {
  const key = getEncryptionKey();
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  const json = JSON.stringify(data);
  const encrypted = Buffer.concat([cipher.update(json, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();

  // Combine: iv (12) + authTag (16) + encrypted
  const combined = Buffer.concat([iv, authTag, encrypted]);
  return combined.toString("base64url");
}

export function decryptOAuthState(encoded: string): OAuthStateData | null {
  try {
    const key = getEncryptionKey();
    const combined = Buffer.from(encoded, "base64url");

    const iv = combined.subarray(0, 12);
    const authTag = combined.subarray(12, 28);
    const encrypted = combined.subarray(28);

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);

    const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
    return JSON.parse(decrypted.toString("utf8"));
  } catch (e) {
    console.error("Failed to decrypt OAuth state:", e);
    return null;
  }
}