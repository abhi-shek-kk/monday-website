import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "fallback_dev_secret_key_sb_college_aids_2026_at_least_32_chars"
);

const COOKIE_NAME = "sb_auth_token";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isStudentDashboard = pathname.startsWith("/dashboard/student");
  const isFacultyDashboard = pathname.startsWith("/dashboard/faculty");
  const isAdminDashboard = pathname.startsWith("/dashboard/admin");
  const isAdminApi = pathname.startsWith("/api/admin");

  if (!isStudentDashboard && !isFacultyDashboard && !isAdminDashboard && !isAdminApi) {
    return NextResponse.next();
  }

  const token = request.cookies.get(COOKIE_NAME)?.value;

  if (!token) {
    if (isAdminApi) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    const role = payload.role as string;
    const status = payload.status as string;

    // Check account approval status
    if (status !== "APPROVED") {
      if (isAdminApi) {
        return NextResponse.json(
          { error: "Account status is pending approval or disabled." },
          { status: 403 }
        );
      }
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("error", "Your account is pending admin approval.");
      return NextResponse.redirect(loginUrl);
    }

    // Role-based route authorization
    if (isAdminDashboard || isAdminApi) {
      if (role !== "ADMIN") {
        if (isAdminApi) {
          return NextResponse.json({ error: "Forbidden: Admin privilege required" }, { status: 403 });
        }
        return NextResponse.redirect(new URL(getDashboardForRole(role), request.url));
      }
    }

    if (isFacultyDashboard) {
      if (role !== "FACULTY") {
        return NextResponse.redirect(new URL(getDashboardForRole(role), request.url));
      }
    }

    if (isStudentDashboard) {
      if (role !== "STUDENT") {
        return NextResponse.redirect(new URL(getDashboardForRole(role), request.url));
      }
    }

    return NextResponse.next();
  } catch {
    if (isAdminApi) {
      return NextResponse.json({ error: "Invalid session token" }, { status: 401 });
    }
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("error", "Session expired. Please log in again.");
    return NextResponse.redirect(loginUrl);
  }
}

function getDashboardForRole(role: string): string {
  switch (role) {
    case "ADMIN":
      return "/dashboard/admin";
    case "FACULTY":
      return "/dashboard/faculty";
    case "STUDENT":
      return "/dashboard/student";
    default:
      return "/login";
  }
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/api/admin/:path*",
  ],
};
