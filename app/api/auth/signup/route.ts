import { NextResponse } from "next/server";
import { createUser, usernameExists, getUserByUsername } from "@/lib/db";
import { hashPassword, setSessionCookie } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const username = String(body?.username ?? "").trim().toLowerCase();
    const displayName = String(body?.displayName ?? "").trim();
    const email = String(body?.email ?? "").trim().toLowerCase();
    const password = String(body?.password ?? "");

    // Validation
    const errors: Record<string, string> = {};

    if (!username || username.length < 3) {
      errors.username = "Username must be at least 3 characters.";
    } else if (!/^[a-z0-9_]+$/.test(username)) {
      errors.username = "Username can only contain letters, numbers, and underscores.";
    } else if (usernameExists(username)) {
      errors.username = "This username is already taken.";
    }

    if (!displayName || displayName.length < 2) {
      errors.displayName = "Display name must be at least 2 characters.";
    }

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = "Please enter a valid email address.";
    }

    if (!password || password.length < 6) {
      errors.password = "Password must be at least 6 characters.";
    }

    if (Object.keys(errors).length > 0) {
      return NextResponse.json({ errors }, { status: 400 });
    }

    const passwordHash = hashPassword(password);
    const user = createUser({ username, displayName, email, passwordHash });

    await setSessionCookie(user.id);

    return NextResponse.json({
      user: {
        id: user.id,
        username: user.username,
        displayName: user.displayName,
        email: user.email,
        avatarColor: user.avatarColor,
      },
    }, { status: 201 });
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { errors: { general: "Something went wrong. Please try again." } },
      { status: 500 },
    );
  }
}
