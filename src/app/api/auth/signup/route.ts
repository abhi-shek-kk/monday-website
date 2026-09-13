import { NextResponse } from "next/server";
import { studentSignupSchema } from "@/lib/validations";
import { registerStudentUser } from "@/lib/services/user.service";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const validationResult = studentSignupSchema.safeParse(body);
    if (!validationResult.success) {
      const firstError = validationResult.error.errors[0]?.message || "Invalid registration data.";
      return NextResponse.json({ error: firstError }, { status: 400 });
    }

    const { username, password, email, fullName, registerNumber, batch } = validationResult.data;

    const user = await registerStudentUser({
      username,
      password,
      email: email || undefined,
      fullName,
      registerNumber,
      batch,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Registration successful. Your account is pending admin approval.",
        user: {
          id: user.id,
          username: user.username,
          role: user.role,
          status: user.status,
        },
      },
      { status: 201 }
    );
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Registration failed.";
    return NextResponse.json({ error: errorMessage }, { status: 400 });
  }
}
