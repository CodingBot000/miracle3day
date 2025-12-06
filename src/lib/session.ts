import { SessionOptions } from "iron-session";
import { AuthOnlyDto } from "@/app/models/auth-only.dto";

export const sessionOptions: SessionOptions = {
  password: process.env.SESSION_PASSWORD!,
  cookieName: "app_session",
  cookieOptions: {
    // HTTPS 환경이면 secure: true (ngrok, production 포함)
    secure: process.env.NODE_ENV === "production" || process.env.APP_URL?.startsWith("https://"),
    sameSite: "lax",
  },
};

declare module "iron-session" {
  interface IronSessionData {
    auth?: AuthOnlyDto;
  }
}