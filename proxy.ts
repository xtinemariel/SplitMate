import { NextResponse, type NextRequest } from "next/server";
import {
  type CookieStore,
  updateSession,
} from "@insforge/sdk/ssr/middleware";

const authRoutes = new Set(["/login", "/signup"]);

function copyCookies(from: NextResponse, to: NextResponse) {
  for (const cookie of from.cookies.getAll()) {
    to.cookies.set(cookie);
  }
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const response = NextResponse.next({ request });

  const { accessToken } = await updateSession({
    requestCookies: request.cookies as unknown as CookieStore,
    responseCookies: response.cookies,
  });

  if (pathname.startsWith("/app") && !accessToken) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    const redirect = NextResponse.redirect(loginUrl);
    copyCookies(response, redirect);
    return redirect;
  }

  if (authRoutes.has(pathname) && accessToken) {
    const redirect = NextResponse.redirect(new URL("/app", request.url));
    copyCookies(response, redirect);
    return redirect;
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
