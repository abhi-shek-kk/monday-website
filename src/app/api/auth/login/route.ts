import { NextResponse } from "next/server";
import { loginSchema } from "@/lib/validations";
import { authenticateUser, setSessionCookie } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  let currentStage = "parse_body";
  try {
    console.log("[LOGIN_DIAGNOSTIC] LOGIN_STAGE=parse_body initiated");
    const body = await request.json().catch((e) => {
      console.error("[LOGIN_DIAGNOSTIC_ERROR] LOGIN_STAGE=parse_body failed:", e?.message);
      throw new Error("Invalid request JSON body");
    });

    currentStage = "zod_validation";
    console.log("[LOGIN_DIAGNOSTIC] LOGIN_STAGE=zod_validation initiated");
    const validationResult = loginSchema.safeParse(body);
    if (!validationResult.success) {
      const errorMsg = validationResult.error.errors[0]?.message || "Invalid login input.";
      console.warn("[LOGIN_DIAGNOSTIC_WARN] LOGIN_STAGE=zod_validation failed validation:", errorMsg);
      return NextResponse.json({ error: errorMsg }, { status: 400 });
    }

    const { username, password } = validationResult.data;

    currentStage = "authenticate_user";
    console.log("[LOGIN_DIAGNOSTIC] LOGIN_STAGE=authenticate_user initiated for user length:", username.length);
    const authResult = await authenticateUser(username, password);

    if (!authResult.success) {
      console.warn("[LOGIN_DIAGNOSTIC_WARN] LOGIN_STAGE=authenticate_user rejected credentials or status:", authResult.error);
      return NextResponse.json(
        {
          error: authResult.error,
          isPending: "isPending" in authResult ? authResult.isPending : false,
          isRejected: "isRejected" in authResult ? authResult.isRejected : false,
        },
        { status: 401 }
      );
    }

    currentStage = "cookie_set";
    console.log("[LOGIN_DIAGNOSTIC] LOGIN_STAGE=cookie_set initiated");
    await setSessionCookie(authResult.token);

    let redirectUrl = "/dashboard/student";
    if (authResult.user.role === "ADMIN") {
      redirectUrl = "/dashboard/admin";
    } else if (authResult.user.role === "FACULTY") {
      redirectUrl = "/dashboard/faculty";
    }

    console.log("[LOGIN_DIAGNOSTIC] LOGIN_STAGE=completed successfully. Redirecting to:", redirectUrl);

    return NextResponse.json({
      success: true,
      user: authResult.user,
      redirectUrl,
    });
  } catch (err: unknown) {
    const errorType = err && typeof err === "object" && "name" in err ? (err as Error).name : "UnknownError";
    const errorMessage = err instanceof Error ? err.message : String(err);
    const errorCode = err && typeof err === "object" && "code" in err ? (err as { code: string }).code : undefined;
    
    console.error(
      `[LOGIN_DIAGNOSTIC_ERROR] LOGIN_STAGE=${currentStage} errorType=${errorType} errorCode=${errorCode || "N/A"} errorMessage=${errorMessage}`
    );

    return NextResponse.json({ error: "Unable to sign in right now. Please try again." }, { status: 500 });
  }
}
