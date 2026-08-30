import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

type User = {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  salt: string;
};

type GlobalState = typeof globalThis & {
  __vedaUsers?: Map<string, User>;
  __vedaSessions?: Map<string, string>;
};

const g = globalThis as GlobalState;

const users =
  g.__vedaUsers ?? (g.__vedaUsers = new Map<string, User>());

const sessions =
  g.__vedaSessions ?? (g.__vedaSessions = new Map<string, string>());

function hash(password: string, salt: string) {
  return crypto.scryptSync(password, salt, 64).toString("hex");
}

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    const normalizedEmail = String(email || "")
      .trim()
      .toLowerCase();

    if (!normalizedEmail || !password) {
      return NextResponse.json(
        {
          error: "Email and password are required.",
        },
        { status: 400 }
      );
    }

    const user = users.get(normalizedEmail);

    if (!user) {
      return NextResponse.json(
        {
          error: "Invalid email or password.",
        },
        { status: 401 }
      );
    }

    const passwordHash = hash(password, user.salt);

    if (passwordHash !== user.passwordHash) {
      return NextResponse.json(
        {
          error: "Invalid email or password.",
        },
        { status: 401 }
      );
    }

    const token = crypto.randomBytes(32).toString("hex");

    sessions.set(token, user.id);

    const response = NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });

    response.cookies.set("veda_session", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);

    return NextResponse.json(
      {
        error: "Unable to log in.",
      },
      { status: 500 }
    );
  }
}