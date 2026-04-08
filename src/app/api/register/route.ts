import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { dbConnect } from "@/lib/db";
import User from "@/models/User";

export async function POST(request: Request) {
  const body = await request.json();
  const { name, email, password } = body;

  if (!name || !email || !password) {
    return NextResponse.json({ message: "Missing fields" }, { status: 400 });
  }

  await dbConnect();
  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    return NextResponse.json({ message: "User already exists" }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  await User.create({
    name,
    email: email.toLowerCase(),
    passwordHash,
  });

  return NextResponse.json({ message: "Registered" }, { status: 201 });
}
