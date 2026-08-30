import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

type User = {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  salt: string;
};

const g = globalThis as typeof globalThis & {
  __vedaUsers?: Map<string, User>;
  __vedaSessions?: Map<string, string>;
};

g.__vedaUsers ??= new Map<string, User>();
g.__vedaSessions ??= new Map<string, string>();

const users = g.__vedaUsers;
const sessions = g.__vedaSessions;

function hash(password: string, salt: string) {
  return crypto.scryptSync(password, salt, 64).toString("hex");
}

export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json();

    const e = String(email || "").trim().toLowerCase();

    if (!name || !e || !password || password.length < 6) {
      return NextResponse.json(
        {
          error:
            "Name, email and a 6+ character password are required.",
        },
        { status: 400 }
      );
    }

    if (users.has(e)) {
      return NextResponse.json(
        {
          error: "An account with this email already exists.",
        },
        { status: 409 }
      );
    }

    const salt = crypto.randomBytes(16).toString("hex");

    const user: User = {
      id: crypto.randomUUID(),
      name: String(name).trim(),
      email: e,
      passwordHash: hash(password, salt),
      salt,
    };

    users.set(e, user);

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
  } catch {
    return NextResponse.json(
      {
        error: "Unable to create account.",
      },
      { status: 500 }
    );
  }
}