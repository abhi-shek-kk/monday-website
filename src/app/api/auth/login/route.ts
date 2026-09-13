import { NextResponse } from "next/server";
import { loginSchema } from "@/lib/validations";
import { authenticateUser, setSessionCookie } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const validationResult = loginSchema.safeParse(body);
    if (!validationResult.success) {
      const errorMsg = validationResult.error.errors[0]?.message || "Invalid login input.";
      return NextResponse.json({ error: errorMsg }, { status: 400 });
    }

    const { username, password } = validationResult.data;

    const authResult = await authenticateUser(username, password);

    if (!authResult.success) {
      return NextResponse.json(
        {
          error: authResult.error,
          isPending: "isPending" in authResult ? authResult.isPending : false,
          isRejected: "isRejected" in authResult ? authResult.isRejected : false,
        },
        { status: 401 }
      );
    }

    await setSessionCookie(authResult.token);

    let redirectUrl = "/dashboard/student";
    if (authResult.user.role === "ADMIN") {
      redirectUrl = "/dashboard/admin";
    } else if (authResult.user.role === "FACULTY") {
      redirectUrl = "/dashboard/faculty";
    }

    return NextResponse.json({
      success: true,
      user: authResult.user,
      redirectUrl,
    });
  } catch (err: unknown) {
    console.error("Login API error:", err);
    return NextResponse.json({ error: "Unable to sign in right now. Please try again." }, { status: 500 });
  }
}
