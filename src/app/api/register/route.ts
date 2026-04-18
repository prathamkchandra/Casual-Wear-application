import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { dbConnect } from "@/lib/db";
import User from "@/models/User";
import { UserRole } from "@/models/User";

export async function POST(request: Request) {
  const body = await request.json();
  const { name, email, password, role, adminKey } = body as {
    name?: string;
    email?: string;
    password?: string;
    role?: UserRole;
    adminKey?: string;
  };

  if (!name || !email || !password || !role) {
    return NextResponse.json({ message: "Missing fields" }, { status: 400 });
  }

  if (!["user", "admin"].includes(role)) {
    return NextResponse.json({ message: "Invalid role selected" }, { status: 400 });
  }

  if (password.length < 6) {
    return NextResponse.json(
      { message: "Password must be at least 6 characters" },
      { status: 400 }
    );
  }

  if (role === "admin") {
    const expectedAdminKey = process.env.ADMIN_REGISTRATION_KEY;
    if (!expectedAdminKey) {
      return NextResponse.json(
        { message: "Admin registration is disabled by server configuration" },
        { status: 403 }
      );
    }
    if (adminKey !== expectedAdminKey) {
      return NextResponse.json({ message: "Invalid admin registration key" }, { status: 403 });
    }
  }

  await dbConnect();
  const normalizedEmail = email.trim().toLowerCase();

  const existing = await User.findOne({ email: normalizedEmail });
  if (existing) {
    return NextResponse.json({ message: "Email already registered" }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({
    name,
    email: normalizedEmail,
    passwordHash,
    role,
  });

  return NextResponse.json(
    { id: user._id.toString(), name: user.name, email: user.email, role: user.role },
    { status: 201 }
  );
}
