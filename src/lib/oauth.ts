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