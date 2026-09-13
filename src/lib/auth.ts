import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { Role, AccountStatus } from "@prisma/client";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "fallback_dev_secret_key_sb_college_aids_2026_at_least_32_chars"
);

export const COOKIE_NAME = "sb_auth_token";

export interface SessionPayload {
  userId: string;
  username: string;
  role: Role;
  status: AccountStatus;
}

export async function createSessionToken(payload: SessionPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(JWT_SECRET);
}

export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return {
      userId: payload.userId as string,
      username: payload.username as string,
      role: payload.role as Role,
      status: payload.status as AccountStatus,
    };
  } catch {
    return null;
  }
}

export async function setSessionCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 7 * 24 * 60 * 60, // 7 days
  });
}

export async function removeSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

export async function getSession(): Promise<{
  userId: string;
  username: string;
  role: Role;
  status: AccountStatus;
  user: {
    id: string;
    username: string;
    email: string | null;
    role: Role;
    status: AccountStatus;
    studentProfile?: {
      id: string;
      fullName: string;
      registerNumber: string;
      batch: string;
    } | null;
    facultyProfile?: {
      id: string;
      fullName: string;
      designation: string;
      qualification: string;
    } | null;
  };
} | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;

  const payload = await verifySessionToken(token);
  if (!payload) return null;

  // Verify directly against the DB to ensure account status changes (e.g. approved/rejected) are real-time
  const user = await db.user.findUnique({
    where: { id: payload.userId },
    select: {
      id: true,
      username: true,
      email: true,
      role: true,
      status: true,
      studentProfile: {
        select: {
          id: true,
          fullName: true,
          registerNumber: true,
          batch: true,
        },
      },
      facultyProfile: {
        select: {
          id: true,
          fullName: true,
          designation: true,
          qualification: true,
        },
      },
    },
  });

  if (!user) return null;

  return {
    userId: user.id,
    username: user.username,
    role: user.role,
    status: user.status,
    user,
  };
}

export async function authenticateUser(usernameInput: string, passwordInput: string) {
  const username = usernameInput.trim();
  
  console.log("[LOGIN_DIAGNOSTIC] LOGIN_STAGE=user_lookup querying DB...");
  let user;
  try {
    user = await db.user.findUnique({
      where: { username },
      select: {
        id: true,
        username: true,
        passwordHash: true,
        role: true,
        status: true,
      },
    });
    console.log("[LOGIN_DIAGNOSTIC] LOGIN_STAGE=user_lookup query finished. User found:", Boolean(user));
  } catch (dbErr: any) {
    console.error(
      `[LOGIN_DIAGNOSTIC_ERROR] LOGIN_STAGE=user_lookup DB errorType=${dbErr?.name || "DBError"} errorCode=${dbErr?.code || "N/A"} errorMessage=${dbErr?.message}`
    );
    throw dbErr;
  }

  if (!user) {
    return { success: false as const, error: "Invalid username or password." };
  }

  console.log("[LOGIN_DIAGNOSTIC] LOGIN_STAGE=password_verify comparing password hash...");
  let isValidPassword = false;
  try {
    isValidPassword = await bcrypt.compare(passwordInput, user.passwordHash);
    console.log("[LOGIN_DIAGNOSTIC] LOGIN_STAGE=password_verify completed. Match:", isValidPassword);
  } catch (pwdErr: any) {
    console.error("[LOGIN_DIAGNOSTIC_ERROR] LOGIN_STAGE=password_verify error:", pwdErr?.message);
    throw pwdErr;
  }

  if (!isValidPassword) {
    return { success: false as const, error: "Invalid username or password." };
  }

  // Account status verification
  if (user.role === Role.STUDENT && user.status === AccountStatus.PENDING) {
    return {
      success: false as const,
      error: "Your registration is pending admin approval.",
      isPending: true,
    };
  }

  if (user.status === AccountStatus.REJECTED) {
    return {
      success: false as const,
      error: "Your account registration has been rejected by administration.",
      isRejected: true,
    };
  }

  if (user.status !== AccountStatus.APPROVED) {
    return {
      success: false as const,
      error: "Account is not active.",
    };
  }

  const sessionPayload: SessionPayload = {
    userId: user.id,
    username: user.username,
    role: user.role,
    status: user.status,
  };

  console.log("[LOGIN_DIAGNOSTIC] LOGIN_STAGE=jwt_token_sign signing session JWT token...");
  let token: string;
  try {
    token = await createSessionToken(sessionPayload);
    console.log("[LOGIN_DIAGNOSTIC] LOGIN_STAGE=jwt_token_sign completed successfully.");
  } catch (jwtErr: any) {
    console.error("[LOGIN_DIAGNOSTIC_ERROR] LOGIN_STAGE=jwt_token_sign error:", jwtErr?.message);
    throw jwtErr;
  }

  return {
    success: true as const,
    user: {
      id: user.id,
      username: user.username,
      role: user.role,
      status: user.status,
    },
    token,
  };
}
