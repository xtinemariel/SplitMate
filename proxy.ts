import { NextResponse, type NextRequest } from "next/server";
import {
  type CookieStore,
  updateSession,
} from "@insforge/sdk/ssr/middleware";

export async function proxy(request: NextRequest) {
  const response = NextResponse.next({ request });

  await updateSession({
    requestCookies: request.cookies as unknown as CookieStore,
    responseCookies: response.cookies,
  });

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
