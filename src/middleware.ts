import { NextRequest, NextResponse } from "next/server";

import { createClient } from "./utils/supabase/server";
import { updateSession } from "./utils/supabase/middleware";

export async function middleware(req: NextRequest) {
  const supabase = createClient();

  const auth = await supabase.auth.getUser();

  if (auth.data.user) {
    // login user
    if (auth.data.user.email !== process.env.NEXT_PUBLIC_ADMIN_EMAIL) {
      if (req.nextUrl.pathname.startsWith("/admin")) {
        return NextResponse.redirect(new URL("/", req.url));
      }
    }

    if (req.nextUrl.pathname.startsWith("/auth")) {
      return NextResponse.redirect(new URL("/", req.url));
    }
  } else {
    // not login user
    if (req.nextUrl.pathname.startsWith("/user")) {
      return NextResponse.redirect(new URL("/", req.url));
    }

    if (req.nextUrl.pathname.startsWith("/admin")) {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  return await updateSession(req);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    "/((?!_next/static|api|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
