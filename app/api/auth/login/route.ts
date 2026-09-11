import { NextResponse } from "next/server";
import { getUserByUsername } from "@/lib/db";
import { verifyPassword, setSessionCookie } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const username = String(body?.username ?? "").trim().toLowerCase();
    const password = String(body?.password ?? "");

    if (!username || !password) {
      return NextResponse.json(
        { errors: { general: "Please enter your username and password." } },
        { status: 400 },
      );
    }

    const user = getUserByUsername(username);

    if (!user || !verifyPassword(password, user.passwordHash)) {
      return NextResponse.json(
        { errors: { general: "Invalid username or password." } },
        { status: 401 },
      );
    }

    await setSessionCookie(user.id);

    return NextResponse.json({
      user: {
        id: user.id,
        username: user.username,
        displayName: user.displayName,
        email: user.email,
        avatarColor: user.avatarColor,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { errors: { general: "Something went wrong. Please try again." } },
      { status: 500 },
    );
  }
}
