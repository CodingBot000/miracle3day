import { SessionOptions } from "iron-session";
import { AuthOnlyDto } from "@/app/models/auth-only.dto";

export const sessionOptions: SessionOptions = {
  password: process.env.SESSION_PASSWORD!,
  cookieName: "app_session",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  },
};

declare module "iron-session" {
  interface IronSessionData {
    auth?: AuthOnlyDto;
  }
}