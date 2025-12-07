import { auth } from "./auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export default async function middleware(request: NextRequest) {
  const session = await auth();
  const { pathname } = request.nextUrl;

  // Public routes that don't require authentication
  const publicRoutes = ["/login", "/signup", "/forgot-password", "/email-sent"];
  const alwaysAccessibleRoutes = ["/explore"]; // Routes accessible to everyone (public or authenticated)

  // Allow /explore for everyone without redirect
  if (alwaysAccessibleRoutes.includes(pathname)) {
    return NextResponse.next();
  }

  if (publicRoutes.includes(pathname)) {
    if (session) {
      // Redirect authenticated users based on their role
      const role = session.user?.role?.toLowerCase(); // Convert to lowercase for comparison
      if (role === "admin") {
        return NextResponse.redirect(new URL("/admin/dashboard", request.url));
      } 
      else if (role === "creator") {
        return NextResponse.redirect(new URL("/creator/dashboard", request.url));
      } 
      else {
        return NextResponse.redirect(new URL("/explore", request.url));
      }
    }
    return NextResponse.next();
  }

  // Protected routes - require authentication
  if (!session) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const role = session.user?.role?.toLowerCase();

  // Role-based access control
  if (pathname.startsWith("/admin") && role !== "admin") {
    return NextResponse.redirect(new URL("/explore", request.url));
  }

  if (pathname.startsWith("/creator") && role !== "creator") {
    return NextResponse.redirect(new URL("/explore", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/creator/:path*",
    "/login",
    "/signup",
    "/forgot-password",
    "/email-sent",
  ],
};
